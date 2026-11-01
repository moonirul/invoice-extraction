# 🧾 Invoice Intelligence

> AI-powered invoice processing — upload a PDF, let an AI agent extract structured data, review it in a live-validated form, and save it to Google Sheets.

![Stack](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)
![Stack](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Stack](https://img.shields.io/badge/TailwindCSS-v4-38BDF8?style=flat-square&logo=tailwindcss)
![Stack](https://img.shields.io/badge/n8n-AI_Agent-EA4B71?style=flat-square&logo=n8n)

---

## ✨ How it works

```
PDF Upload → FastAPI extracts text → n8n AI Agent structures it → Review & edit → Save to Google Sheets
```

1. **Upload** a PDF invoice from the dashboard
2. **AI extracts** all fields (supplier, line items, totals, dates…) via n8n
3. **Review** the result in a live-validated form — edit anything, math is checked in real time
4. **Confirm** to log the invoice to Google Sheets permanently

---

## 🛠 Tech stack

| Layer | Tech |
|---|---|
| Backend | FastAPI · Pydantic v2 · pdfplumber · httpx · **uv** |
| Frontend | React 19 · Vite · Tailwind CSS v4 · TanStack Query · React Hook Form |
| AI Orchestration | n8n webhooks (AI Agent / LLM) |
| Data store | Google Sheets via n8n |

---

## 🚀 Quick Start

### Prerequisites
- Python **3.11+** and [uv](https://docs.astral.sh/uv/)
- Node.js **22+**
- An n8n instance with 3 active workflows (Extract, Save, List)

### 1 — Backend

```bash
cd backend
cp .env.example .env        # fill in N8N_*_WEBHOOK_URL values
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

→ API docs: http://localhost:8000/docs  
→ Health check: http://localhost:8000/api/v1/health

### 2 — Frontend

```bash
cd frontend
cp .env.example .env        # VITE_API_BASE_URL=http://localhost:8000
npm install
npm run dev                 # http://localhost:5173
```

> Try it with the included sample: `backend/samples/enterprise_invoice.pdf`

---

## ⚙️ Configuration

### Backend `.env`

| Variable | Required | Default | Description |
|---|---|---|---|
| `N8N_EXTRACT_WEBHOOK_URL` | ✅ | — | PDF text → structured JSON |
| `N8N_SAVE_WEBHOOK_URL` | ✅ | — | Append confirmed invoice to Sheets |
| `N8N_LIST_WEBHOOK_URL` | ✅ | — | Fetch all saved rows |
| `N8N_AUTH_TOKEN` | — | empty | Shared secret for webhook auth |
| `N8N_EXTRACT_TIMEOUT_SECONDS` | — | `90` | LLM calls are slow — keep this high |
| `CORS_ORIGINS` | — | `localhost:5173` | Allowed browser origins |
| `MAX_UPLOAD_SIZE_MB` | — | `10` | Upload size limit |
| `ENVIRONMENT` | — | `development` | Set `production` to disable `/docs` |

### Frontend `.env`

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend origin |
| `VITE_MAX_UPLOAD_MB` | `10` | Client-side upload guard |

---

## 🔗 n8n Webhook Contract

> ⚠️ Use **Production** URLs (`/webhook/…`). Test URLs only work while the n8n editor is open.

| Webhook | Method | Input | Response |
|---|---|---|---|
| **Extract** | POST | `{"filename": "...", "extracted_text": "..."}` | Invoice JSON (see below) |
| **Save** | POST | Full invoice JSON | Any `2xx` |
| **List** | GET | — | JSON array of sheet rows |

**Invoice JSON shape:**

```json
{
  "invoice_details":   { "invoice_number": "", "invoice_date": "", "due_date": "", "currency": "" },
  "supplier":          { "name": "", "address": "", "tax_id": "" },
  "customer":          { "name": "", "address": "", "tax_id": "" },
  "financial_summary": { "subtotal": 0, "tax_amount": 0, "total_amount": 0 },
  "line_items":        [{ "description": "", "quantity": 0, "unit_price": 0, "total": 0 }],
  "math_validation":   { "status": "Passed", "errors": [] }
}
```

---

## 📡 API Reference

Base path: `/api/v1`

| Endpoint | Description |
|---|---|
| `GET /health` | Liveness check |
| `POST /invoices/extract` | Upload PDF → returns extracted data (nothing persisted) |
| `POST /invoices` | Save confirmed invoice to Sheets |
| `GET /invoices?page=1&q=` | List saved invoices — paginated, searchable |

**All errors follow this shape:**

```json
{
  "error": {
    "code": "upstream_timeout",
    "message": "n8n did not respond in time",
    "request_id": "3f9c1a7b"
  }
}
```

---

## 🐳 Deploy with Docker Compose

```bash
cp backend/.env.example backend/.env   # set ENVIRONMENT=production + n8n URLs
docker compose up -d --build
# → http://localhost:8080
```

The SPA is served by nginx and proxied to the backend on the same origin — no CORS needed.

---

## 🧪 Testing

```bash
# Backend — 33 tests (API, schema coercion, n8n gateway retries)
cd backend && uv run pytest
uv run ruff check . && uv run ruff format .

# Frontend — invoice math + form mapping
cd frontend && npm test
npm run lint && npm run build
```

---

## 🔧 Troubleshooting

| Symptom | Fix |
|---|---|
| "API offline" badge | Backend not running, or wrong `VITE_API_BASE_URL` |
| `upstream_error 404` | n8n workflow is **inactive**, or using a `/webhook-test/` URL |
| `upstream_timeout` | LLM is slow — raise `N8N_EXTRACT_TIMEOUT_SECONDS` |
| "No selectable text" | PDF is a scanned image — OCR not yet supported |
| Table shows only 1 row | List webhook set to *First Entry* — switch to **All Entries** |

---

## 📋 Production Checklist

- [ ] n8n workflows are **active** with `/webhook/…` URLs (not `/webhook-test/…`)
- [ ] `ENVIRONMENT=production` · TLS at the proxy · `CORS_ORIGINS` set
- [ ] Webhook **Header Auth** configured — protect your n8n URLs
- [ ] Authentication added in front of the app (currently none)
- [ ] Proxy read timeout ≥ 90 s · body size limit ≥ `MAX_UPLOAD_SIZE_MB`

---

## 📌 Known Limitations

- **No OCR** — scanned PDFs without selectable text are rejected
- **No authentication** — add SSO / reverse-proxy auth before going public
- **No duplicate detection** — same invoice number can be saved twice
- Pagination fetches all Sheets rows first — fine up to ~10k rows

---

## License

[MIT](LICENSE)
