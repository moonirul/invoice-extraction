
"""Maps raw Google Sheets rows to typed SavedInvoice objects."""

import re
from typing import Any

from app.schemas.invoice import (
    SavedInvoice,
    ValidationState,
    _to_number,
    _to_str,
)

_PASS = re.compile(
    r"\b(pass|passed|valid|ok|match|success|correct|verified)\b",
    re.I,
)

_FAIL = re.compile(
    r"fail|mismatch|invalid|error|flag|incorrect|discrepan|warning",
    re.I,
)


def _slug(key: str) -> str:
    return re.sub(
        r"[^a-z0-9]+",
        "_",
        str(key).strip().lower(),
    ).strip("_")


def classify_validation(status: str | None) -> ValidationState:
    if not status:
        return "unknown"

    # Check failures before success.
    if _FAIL.search(status):
        return "flagged"

    if _PASS.search(status):
        return "passed"

    return "unknown"


def row_to_invoice(row: dict[str, Any]) -> SavedInvoice:
    cols = {_slug(k): v for k, v in row.items()}

    def pick(*names: str) -> Any:
        for name in names:
            value = cols.get(name)
            if value not in (None, ""):
                return value
        return None

    status = _to_str(
        pick(
            "math_validation_status",
            "validation_status",
            "status",
        )
    )

    return SavedInvoice(
        invoice_number=_to_str(
            pick("invoice_number", "invoice_no", "invoice_id")
        ),
        invoice_date=_to_str(
            pick("invoice_date", "date")
        ),
        supplier_name=_to_str(
            pick("supplier_name", "supplier", "vendor_name")
        ),
        customer_name=_to_str(
            pick("customer_name", "customer", "bill_to")
        ),
        total_amount=_to_number(
            pick("total_amount", "total", "grand_total")
        ),
        currency=_to_str(pick("currency")),
        math_validation_status=status,
        validation_state=classify_validation(status),
    )
