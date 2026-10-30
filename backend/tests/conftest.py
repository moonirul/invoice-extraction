import os
from pathlib import Path

# Must be set before `app` is imported (settings are validated at import time).
os.environ.setdefault("N8N_EXTRACT_WEBHOOK_URL", "http://n8n.test/webhook/extract")
os.environ.setdefault("N8N_SAVE_WEBHOOK_URL", "http://n8n.test/webhook/save")
os.environ.setdefault("N8N_LIST_WEBHOOK_URL", "http://n8n.test/webhook/list")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.api.deps import get_n8n_client  # noqa: E402
from app.main import app  # noqa: E402

SAMPLE_PDF = Path(__file__).resolve().parents[1] / "samples" / "enterprise_invoice.pdf"


class FakeN8N:
    def __init__(self) -> None:
        self.extract_result = {
            "invoice_details": {
                "invoice_number": "GTC-INV-2026-9842",
                "invoice_date": "October 30, 2026",
            },
            "supplier": {"name": "GLOBAL TECH CORP LTD."},
            "customer": {"name": "Nordic Solutions AB"},
            "financial_summary": {"total_amount": "$8,726.13"},
            "line_items": [
                {
                    "item_code": "ITM-01",
                    "description": "Cloud",
                    "quantity": "1",
                    "total": "2,400.00",
                }
            ],
        }
        self.rows: list[dict] = []
        self.saved: list[dict] = []
        self.error: Exception | None = None
        self.last_text: str | None = None

    async def extract(self, *, filename, text):
        if self.error:
            raise self.error
        self.last_text = text
        return self.extract_result

    async def save(self, payload):
        if self.error:
            raise self.error
        self.saved.append(payload)

    async def list_rows(self):
        if self.error:
            raise self.error
        return self.rows


@pytest.fixture
def fake_n8n() -> FakeN8N:
    return FakeN8N()


@pytest.fixture
def client(fake_n8n):
    app.dependency_overrides[get_n8n_client] = lambda: fake_n8n
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_pdf_bytes() -> bytes:
    return SAMPLE_PDF.read_bytes()
