"""Domain exceptions. Each maps to an HTTP status + a stable machine-readable code."""

from typing import Any


class AppError(Exception):
    status_code: int = 500
    code: str = "internal_error"
    default_message: str = "An unexpected error occurred."

    def __init__(self, message: str | None = None, *, details: Any = None) -> None:
        self.message = message or self.default_message
        self.details = details
        super().__init__(self.message)


class InvalidFileError(AppError):
    status_code = 400
    code = "invalid_file"
    default_message = "The uploaded file is not valid."


class FileTooLargeError(AppError):
    status_code = 413
    code = "file_too_large"
    default_message = "The uploaded file is too large."


class PdfParseError(AppError):
    status_code = 422
    code = "pdf_unreadable"
    default_message = "The PDF could not be read."


class InvoiceValidationError(AppError):
    status_code = 422
    code = "invalid_invoice"
    default_message = "The invoice data is incomplete."


class UpstreamError(AppError):
    status_code = 502
    code = "upstream_error"
    default_message = "The automation service (n8n) returned an error."


class UpstreamUnavailableError(UpstreamError):
    code = "upstream_unavailable"
    default_message = "The automation service (n8n) is unreachable."


class UpstreamTimeoutError(UpstreamError):
    status_code = 504
    code = "upstream_timeout"
    default_message = "The automation service (n8n) timed out."
