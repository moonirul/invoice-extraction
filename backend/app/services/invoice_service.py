"""Business logic for the invoice workflow. Routers stay thin; this layer owns the rules."""

import logging
import math

from fastapi import UploadFile
from pydantic import ValidationError

from app.core.config import Settings
from app.core.exceptions import InvoiceValidationError, UpstreamError
from app.schemas.invoice import (
    ExtractionResponse,
    InvoiceData,
    InvoiceListResponse,
    InvoiceListSummary,
    SavedInvoice,
)
from app.services import pdf_service
from app.services.n8n_client import N8NClient
from app.services.sheet_mapper import row_to_invoice

logger = logging.getLogger(__name__)


class InvoiceService:
    def __init__(self, n8n: N8NClient, settings: Settings) -> None:
        self._n8n = n8n
        self._settings = settings

    async def extract(self, file: UploadFile) -> ExtractionResponse:
        contents = await pdf_service.read_pdf_upload(
            file, max_bytes=self._settings.max_upload_bytes
        )
        document = await pdf_service.extract_text(contents, max_pages=self._settings.max_pdf_pages)
        filename = file.filename or "invoice.pdf"
        logger.info("Extracted %d chars from %d page(s)", len(document.text), document.page_count)

        raw = await self._n8n.extract(filename=filename, text=document.text)
        try:
            data = InvoiceData.model_validate(raw)
        except ValidationError as exc:
            logger.error("n8n payload failed schema validation: %s", exc.errors()[:3])
            raise UpstreamError(
                "n8n returned data that does not match the expected invoice schema."
            ) from exc
        return ExtractionResponse(filename=filename, page_count=document.page_count, data=data)

    async def save(self, invoice: InvoiceData) -> None:
        if not (invoice.invoice_details.invoice_number or "").strip():
            raise InvoiceValidationError("An invoice number is required before saving.")
        await self._n8n.save(invoice.model_dump(mode="json"))

    async def list_saved(
        self, *, page: int, page_size: int, query: str | None
    ) -> InvoiceListResponse:
        rows = await self._n8n.list_rows()
        all_invoices: list[SavedInvoice] = [
            row_to_invoice(r) for r in reversed(rows)
        ]  # newest first
        invoices = all_invoices

        if query:
            needle = query.strip().lower()
            invoices = [
                inv
                for inv in invoices
                if needle
                in " ".join(
                    filter(None, [inv.invoice_number, inv.supplier_name, inv.customer_name])
                ).lower()
            ]

        total = len(invoices)
        start = (page - 1) * page_size
        return InvoiceListResponse(
            items=invoices[start : start + page_size],
            page=page,
            page_size=page_size,
            total=total,
            total_pages=max(1, math.ceil(total / page_size)),
            # Summary always describes the whole sheet, independent of search/pagination.
            summary=InvoiceListSummary(
                total=len(all_invoices),
                passed=sum(1 for i in all_invoices if i.validation_state == "passed"),
                flagged=sum(1 for i in all_invoices if i.validation_state == "flagged"),
            ),
        )
