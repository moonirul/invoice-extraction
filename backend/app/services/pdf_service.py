"""PDF upload validation and text extraction (pdfplumber)."""

import asyncio
import io
import logging
from dataclasses import dataclass

import pdfplumber
from fastapi import UploadFile

from app.core.exceptions import (
    AppError,
    FileTooLargeError,
    InvalidFileError,
    PdfParseError,
)

logger = logging.getLogger(__name__)

_CHUNK = 1024 * 1024


@dataclass(frozen=True)
class ExtractedDocument:
    text: str
    page_count: int


async def read_pdf_upload(file: UploadFile, *, max_bytes: int) -> bytes:
    """Read an upload in chunks, enforcing extension, size and PDF magic bytes."""
    name = (file.filename or "").strip()
    if not name.lower().endswith(".pdf"):
        raise InvalidFileError("Only PDF files are supported.")

    buffer = bytearray()
    while chunk := await file.read(_CHUNK):
        buffer.extend(chunk)
        if len(buffer) > max_bytes:
            raise FileTooLargeError(f"File exceeds the {max_bytes // (1024 * 1024)} MB limit.")

    if not buffer:
        raise InvalidFileError("The uploaded file is empty.")
    if b"%PDF-" not in buffer[:1024]:
        raise InvalidFileError("The file does not look like a valid PDF.")
    return bytes(buffer)


def _extract_sync(contents: bytes, max_pages: int) -> ExtractedDocument:
    try:
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            page_count = len(pdf.pages)
            if page_count > max_pages:
                raise InvalidFileError(f"PDF has {page_count} pages; the limit is {max_pages}.")
            parts: list[str] = []
            for index, page in enumerate(pdf.pages, start=1):
                text = (page.extract_text() or "").strip()
                if text:
                    parts.append(f"--- Page {index} ---\n{text}")
    except AppError:
        raise
    except Exception as exc:  # pdfminer raises a wide family of errors
        logger.warning("PDF parsing failed", exc_info=True)
        raise PdfParseError(
            "The PDF could not be read. It may be corrupted or password-protected."
        ) from exc

    if not parts:
        raise PdfParseError(
            "No selectable text was found. The PDF may be a scanned image, "
            "which is not supported yet."
        )
    return ExtractedDocument(text="\n".join(parts), page_count=page_count)


async def extract_text(contents: bytes, *, max_pages: int) -> ExtractedDocument:
    # pdfplumber is CPU-bound and synchronous; keep it off the event loop.
    return await asyncio.to_thread(_extract_sync, contents, max_pages)
