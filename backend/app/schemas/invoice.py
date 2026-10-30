"""Pydantic schemas for the invoice domain.

Models are intentionally lenient (``extra="allow"``, everything optional, amounts coerced from
strings like "$1,234.50") because the payload originates from an LLM. Anything the workflow adds
beyond these fields round-trips untouched to the save webhook.
"""

import re
from typing import Annotated, Any, Literal

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field


def _to_number(value: Any) -> float | None:
    if value is None or isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if not isinstance(value, str):
        return None
    raw = value.strip()
    if not raw:
        return None
    negative = raw.startswith("(") and raw.endswith(")")
    cleaned = re.sub(r"[^0-9.,\-]", "", raw)
    if "," in cleaned and "." in cleaned:
        cleaned = cleaned.replace(",", "")
    elif "," in cleaned:
        # "1,234" -> thousands separator; "12,50" -> decimal comma
        cleaned = (
            cleaned.replace(",", ".")
            if re.search(r",\d{1,2}$", cleaned)
            else cleaned.replace(",", "")
        )
    try:
        number = float(cleaned)
    except ValueError:
        return None
    return -abs(number) if negative else number


def _to_str(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _none_to_empty_dict(value: Any) -> Any:
    return {} if value is None else value


def _none_to_empty_list(value: Any) -> Any:
    return [] if value is None else value


Money = Annotated[float | None, BeforeValidator(_to_number)]
Text = Annotated[str | None, BeforeValidator(_to_str)]


class _Flexible(BaseModel):
    model_config = ConfigDict(extra="allow", populate_by_name=True)


class InvoiceDetails(_Flexible):
    invoice_number: Text = None
    invoice_date: Text = None
    due_date: Text = None
    po_number: Text = None
    currency: Text = None


class Party(_Flexible):
    name: Text = None
    address: Text = None
    tax_id: Text = None


class LineItem(_Flexible):
    item_code: Text = None
    description: Text = None
    quantity: Money = None
    unit_price: Money = None
    discount: Money = None
    total: Money = None


class FinancialSummary(_Flexible):
    subtotal: Money = None
    discount_amount: Money = None
    tax_amount: Money = None
    shipping_amount: Money = None
    total_amount: Money = None


class InvoiceData(_Flexible):
    invoice_details: Annotated[InvoiceDetails, BeforeValidator(_none_to_empty_dict)] = Field(
        default_factory=InvoiceDetails
    )
    supplier: Annotated[Party, BeforeValidator(_none_to_empty_dict)] = Field(default_factory=Party)
    customer: Annotated[Party, BeforeValidator(_none_to_empty_dict)] = Field(default_factory=Party)
    financial_summary: Annotated[FinancialSummary, BeforeValidator(_none_to_empty_dict)] = Field(
        default_factory=FinancialSummary
    )
    line_items: Annotated[list[LineItem], BeforeValidator(_none_to_empty_list)] = Field(
        default_factory=list
    )
    # Validation flags produced by the n8n workflow; shape is workflow-defined.
    math_validation: Any = None


# ── API responses ────────────────────────────────────────────────────────────


class ExtractionResponse(BaseModel):
    filename: str
    page_count: int
    data: InvoiceData


class SaveInvoiceResponse(BaseModel):
    status: Literal["saved"] = "saved"
    message: str = "Invoice saved to Google Sheets."


ValidationState = Literal["passed", "flagged", "unknown"]


class SavedInvoice(BaseModel):
    invoice_number: str | None = None
    invoice_date: str | None = None
    supplier_name: str | None = None
    customer_name: str | None = None
    total_amount: float | None = None
    currency: str | None = None
    math_validation_status: str | None = None
    validation_state: ValidationState = "unknown"


class InvoiceListSummary(BaseModel):
    total: int
    passed: int
    flagged: int


class InvoiceListResponse(BaseModel):
    items: list[SavedInvoice]
    page: int
    page_size: int
    total: int
    total_pages: int
    summary: InvoiceListSummary
