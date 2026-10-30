import pytest

from app.core.config import Settings, get_settings
from app.core.exceptions import UpstreamTimeoutError, UpstreamUnavailableError
from app.main import app


def _upload(client, content: bytes, name="invoice.pdf"):
    return client.post(
        "/api/v1/invoices/extract", files={"file": (name, content, "application/pdf")}
    )


def test_health(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    assert res.headers["X-Request-ID"]


def test_extract_success_coerces_amounts_and_sends_text(client, fake_n8n, sample_pdf_bytes):
    res = _upload(client, sample_pdf_bytes)
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["page_count"] == 1
    assert body["data"]["financial_summary"]["total_amount"] == 8726.13
    assert body["data"]["line_items"][0]["total"] == 2400.0
    assert "GTC-INV-2026-9842" in fake_n8n.last_text


def test_extract_unwraps_list_and_output_envelopes(client, fake_n8n, sample_pdf_bytes):
    fake_n8n.extract_result = fake_n8n.extract_result  # direct dict path covered above
    from app.services.n8n_client import N8NClient

    assert N8NClient._unwrap_extraction([{"output": {"a": 1}}]) == {"a": 1}
    assert N8NClient._unwrap_extraction({"output": {"b": 2}}) == {"b": 2}


@pytest.mark.parametrize(
    ("name", "content", "status", "code"),
    [
        ("notes.txt", b"hello", 400, "invalid_file"),
        ("fake.pdf", b"not really a pdf", 400, "invalid_file"),
        ("empty.pdf", b"", 400, "invalid_file"),
        ("broken.pdf", b"%PDF-1.4\ngarbage", 422, "pdf_unreadable"),
    ],
)
def test_extract_rejects_bad_uploads(client, name, content, status, code):
    res = _upload(client, content, name)
    assert res.status_code == status
    assert res.json()["error"]["code"] == code
    assert res.json()["error"]["request_id"]


def test_extract_rejects_pdf_without_text(client):
    import io

    from reportlab.pdfgen import canvas

    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    c.showPage()
    c.save()
    res = _upload(client, buf.getvalue())
    assert res.status_code == 422
    assert "scanned" in res.json()["error"]["message"]


def test_extract_enforces_size_limit(client, sample_pdf_bytes):
    app.dependency_overrides[get_settings] = lambda: Settings(max_upload_size_mb=1)
    try:
        res = _upload(client, b"%PDF-" + b"0" * (1024 * 1024 + 10))
    finally:
        app.dependency_overrides.pop(get_settings, None)
    assert res.status_code == 413
    assert res.json()["error"]["code"] == "file_too_large"


@pytest.mark.parametrize(
    ("exc", "status", "code"),
    [
        (UpstreamTimeoutError(), 504, "upstream_timeout"),
        (UpstreamUnavailableError(), 502, "upstream_unavailable"),
    ],
)
def test_upstream_failures_are_not_swallowed(client, fake_n8n, sample_pdf_bytes, exc, status, code):
    fake_n8n.error = exc
    res = _upload(client, sample_pdf_bytes)
    assert res.status_code == status
    assert res.json()["error"]["code"] == code


def test_save_invoice(client, fake_n8n):
    payload = {
        "invoice_details": {"invoice_number": "INV-1"},
        "financial_summary": {"total_amount": "12.50"},
        "custom_field": "kept",
    }
    res = client.post("/api/v1/invoices", json=payload)
    assert res.status_code == 201
    assert fake_n8n.saved[0]["financial_summary"]["total_amount"] == 12.5
    assert fake_n8n.saved[0]["custom_field"] == "kept"  # unknown keys round-trip


def test_save_requires_invoice_number(client, fake_n8n):
    res = client.post("/api/v1/invoices", json={"invoice_details": {"invoice_number": "  "}})
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "invalid_invoice"
    assert fake_n8n.saved == []


def test_save_rejects_malformed_body(client):
    res = client.post("/api/v1/invoices", json={"line_items": "nope"})
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "validation_error"


def _rows(n):
    return [
        {
            "Invoice Number": f"INV-{i:03d}",
            "Supplier Name": "Acme" if i % 2 else "Globex",
            "Customer Name": "Nordic",
            "Total Amount": f"${i * 100:,}.00",
            "Math Validation Status": "Invalid" if i % 5 == 0 else "Passed",
        }
        for i in range(1, n + 1)
    ]


def test_list_pagination_search_and_summary(client, fake_n8n):
    fake_n8n.rows = _rows(25)
    res = client.get("/api/v1/invoices", params={"page": 2, "page_size": 10})
    body = res.json()
    assert res.status_code == 200
    assert body["total"] == 25 and body["total_pages"] == 3 and len(body["items"]) == 10
    assert body["items"][0]["invoice_number"] == "INV-015"  # newest first
    assert body["summary"] == {"total": 25, "passed": 20, "flagged": 5}

    res = client.get("/api/v1/invoices", params={"q": "inv-007"})
    assert [i["invoice_number"] for i in res.json()["items"]] == ["INV-007"]
    assert res.json()["summary"]["total"] == 25  # summary ignores the search filter


def test_list_empty_sheet(client, fake_n8n):
    res = client.get("/api/v1/invoices")
    assert res.json()["total"] == 0 and res.json()["total_pages"] == 1


def test_validation_state_classification():
    from app.services.sheet_mapper import classify_validation

    assert classify_validation("Invalid") == "flagged"
    assert classify_validation("Passed") == "passed"
    assert classify_validation("✓ Math OK") == "passed"
    assert classify_validation(None) == "unknown"
