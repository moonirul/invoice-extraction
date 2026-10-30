import pytest

from app.schemas.invoice import InvoiceData, _to_number


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("$8,726.13 USD", 8726.13),
        ("1,234", 1234.0),
        ("12,50", 12.5),
        ("(45.00)", -45.0),
        (7, 7.0),
        ("", None),
        ("n/a", None),
        (None, None),
        (True, None),
    ],
)
def test_to_number(raw, expected):
    assert _to_number(raw) == expected


def test_null_sections_become_defaults():
    data = InvoiceData.model_validate({"supplier": None, "line_items": None})
    assert data.supplier.name is None and data.line_items == []
