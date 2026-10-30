# Invoice Intelligence — AI Document Processing Platform

Upload a PDF invoice → extract the text → let an n8n AI agent turn it into structured JSON → review and correct it in a live-validated form → confirm to log it in Google Sheets → browse everything that has been saved.

| Layer | Tech |
|---|---|
| Backend | FastAPI · Pydantic v2 · pdfplumber · httpx · managed with **uv** |
| Frontend | React 19 · Vite · Tailwind CSS v4 · TanStack Query · React Hook Form |
| Orchestration | n8n webhooks (AI Agent / LLM) |
| Datastore | Google Sheets (via n8n) |

## Architecture

```
┌──────────────┐  multipart PDF   ┌──────────────────────┐  {filename, extracted_text}  ┌───────────┐
│  React / Vite │ ───────────────► │  FastAPI             │ ───────────────────────────► │ n8n       │
│  dashboard    │ ◄─────────────── │  routers → services  │ ◄─────────────────────────── │ AI Agent  │
└──────────────┘   typed JSON     │  → n8n gateway       │      structured invoice JSON  └───────────┘
        │                          └──────────────────────┘                                    │
        │  review / edit / confirm          │  save + list webhooks                            │
        └──────────────────────────────────►└─────────────────────────────────────────────────►│ Google Sheets
```

Design rules: routers are thin; **services** own business rules; one **gateway class** is the only code that talks to n8n; every failure becomes a typed `AppError` rendered as one consistent error envelope; the UI never talks to n8n directly.

## Project structure

```
invoice-extraction/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── health.py
│   │   │   │   │   └── invoices.py
│   │   │   │   ├── __init__.py
│   │   │   │   └── router.py
│   │   │   ├── __init__.py
│   │   │   └── deps.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   ├── errors.py
│   │   │   ├── exceptions.py
│   │   │   ├── logging.py
│   │   │   └── middleware.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── common.py
│   │   │   └── invoice.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── invoice_service.py
│   │   │   ├── n8n_client.py
│   │   │   ├── pdf_service.py
│   │   │   └── sheet_mapper.py
│   │   ├── __init__.py
│   │   └── main.py
│   ├── samples/
│   │   └── enterprise_invoice.pdf
│   ├── scripts/
│   │   └── generate_sample_invoice.py
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_invoices_api.py
│   │   ├── test_n8n_client.py
│   │   └── test_schemas.py
│   ├── .dockerignore
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── uv.lock
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js
│   │   │   └── invoices.js
│   │   ├── app/
│   │   │   ├── App.jsx
│   │   │   └── providers.jsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── AppShell.jsx
│   │   │   ├── ui/
│   │   │   │   ├── ApiErrorAlert.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Field.jsx
│   │   │   │   └── Skeleton.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── config/
│   │   │   └── env.js
│   │   ├── features/
│   │   │   ├── invoices/
│   │   │   │   └── InvoicesSection.jsx
│   │   │   ├── review/
│   │   │   │   ├── LineItemsTable.jsx
│   │   │   │   ├── ReviewForm.jsx
│   │   │   │   ├── ReviewSkeleton.jsx
│   │   │   │   └── ValidationPanel.jsx
│   │   │   └── upload/
│   │   │       └── UploadCard.jsx
│   │   ├── hooks/
│   │   │   ├── useDebouncedValue.js
│   │   │   └── useInvoices.js
│   │   ├── lib/
│   │   │   ├── format.js
│   │   │   ├── invoice.js
│   │   │   └── invoice.test.js
│   │   ├── pages/
│   │   │   └── DashboardPage.jsx
│   │   ├── styles/
│   │   │   └── index.css
│   │   └── main.jsx
│   ├── .dockerignore
│   ├── .env.example
│   ├── .gitignore
│   ├── .oxlintrc.json
│   ├── Dockerfile
│   ├── index.html
│   ├── jsconfig.json
│   ├── nginx.conf
│   ├── package-lock.json
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── docker-compose.yml
└── LICENSE
```

## Prerequisites

- Python **3.11+** and [uv](https://docs.astral.sh/uv/) (`pip install uv` or see the uv docs)
- Node.js **22+** (Vite 8 needs ≥ 20.19) and npm
- An n8n instance with three workflows exposed as webhooks (see [n8n contract](#n8n-webhook-contract))

## Quick start (local development)

### 1. Backend

```bash
cd backend
cp .env.example .env            # then fill in the three N8N_*_WEBHOOK_URL values
uv sync                         # creates .venv and installs locked dependencies
uv run uvicorn app.main:app --reload --port 8000
```

- API docs (development only): http://localhost:8000/docs
- Health check: http://localhost:8000/api/v1/health

### 2. Frontend

```bash
cd frontend
cp .env.example .env            # VITE_API_BASE_URL=http://localhost:8000
npm install
npm run dev                     # http://localhost:5173
```

Try it with the bundled sample: `backend/samples/enterprise_invoice.pdf` (regenerate with `uv run python scripts/generate_sample_invoice.py`).

## Configuration

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `N8N_EXTRACT_WEBHOOK_URL` | ✅ | – | Webhook that receives the PDF text and returns structured JSON |
| `N8N_SAVE_WEBHOOK_URL` | ✅ | – | Webhook that appends the confirmed invoice to Google Sheets |
| `N8N_LIST_WEBHOOK_URL` | ✅ | – | Webhook that returns all saved rows |
| `N8N_AUTH_HEADER_NAME` / `N8N_AUTH_TOKEN` | – | `X-Webhook-Secret` / empty | Optional shared secret sent on every n8n call (use *Header Auth* on the Webhook node) |
| `N8N_EXTRACT_TIMEOUT_SECONDS` | – | `90` | LLM calls are slow |
| `N8N_DEFAULT_TIMEOUT_SECONDS` | – | `20` | Save / list calls |
| `CORS_ORIGINS` | – | `http://localhost:5173,...` | Comma-separated browser origins allowed to call the API |
| `MAX_UPLOAD_SIZE_MB` / `MAX_PDF_PAGES` | – | `10` / `20` | Upload guards |
| `ENVIRONMENT` | – | `development` | `production` disables `/docs` and `/openapi.json` |
| `LOG_LEVEL` | – | `INFO` | |

The app **fails fast at startup** if a required URL is missing or malformed.

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend origin. Set to an empty string for same-origin deployments behind a reverse proxy |
| `VITE_MAX_UPLOAD_MB` | `10` | Client-side size check (mirror the backend value) |

`VITE_*` values are baked into the bundle at build time and are public — never put secrets in them.

## n8n webhook contract

**Use the *Production* URLs (`/webhook/…`) and activate the workflows.** The `/webhook-test/…` URLs only work while the n8n editor is listening and return 404 otherwise.

| Webhook | Method | Receives | Must respond with |
|---|---|---|---|
| Extract | `POST` | `{"filename": "...", "extracted_text": "--- Page 1 ---\n..."}` | The invoice JSON below. A bare object, `[ {…} ]`, or `{"output": {…}}` are all accepted |
| Save | `POST` | The full (human-corrected) invoice JSON below | Any 2xx |
| List | `GET` | – | A JSON array of sheet rows (Webhook node → *Response Data: All Entries*). An empty body means an empty sheet |

Invoice JSON (all fields optional; unknown extra fields are preserved end-to-end):

```jsonc
{
  "invoice_details":   { "invoice_number": "", "invoice_date": "", "due_date": "", "po_number": "", "currency": "" },
  "supplier":          { "name": "", "address": "", "tax_id": "" },
  "customer":          { "name": "", "address": "", "tax_id": "" },
  "financial_summary": { "subtotal": 0, "discount_amount": 0, "tax_amount": 0, "shipping_amount": 0, "total_amount": 0 },
  "line_items":        [ { "item_code": "", "description": "", "quantity": 0, "unit_price": 0, "discount": 0, "total": 0 } ],
  "math_validation":   { "status": "Passed", "errors": [] }   // shape is yours; see note below
}
```

Amounts may arrive as numbers or strings such as `"$8,726.13 USD"`; the API normalises them to numbers.

**Sheet rows** returned by the List webhook are matched case- and spacing-insensitively, e.g. `Invoice Number`, `Invoice Date`, `Supplier Name`, `Customer Name`, `Total Amount`, `Currency`, `Math Validation Status`. A status containing *fail / invalid / mismatch / error / flag* is shown as **Needs review**; *pass / valid / ok / match* as **Passed**. Adjust `backend/app/services/sheet_mapper.py` if your sheet uses different headers.

> **Field-name note:** only `invoice_details.invoice_number/invoice_date/po_number`, `supplier.name`, `customer.name`, `financial_summary.total_amount` and `line_items[].item_code/description/quantity/total` were known from the original app. The remaining names above (`due_date`, `unit_price`, `subtotal`, …) are sensible defaults — if your n8n agent uses different keys, change them in `backend/app/schemas/invoice.py` and `frontend/src/lib/invoice.js` (`FIELDS`).

## API reference

Base path: `/api/v1`

| Method & path | Purpose |
|---|---|
| `GET /health` | Liveness probe |
| `POST /invoices/extract` | `multipart/form-data` with `file` (PDF). Returns `{filename, page_count, data}`. Persists nothing |
| `POST /invoices` | Body = invoice JSON. Requires an invoice number. `201` on success |
| `GET /invoices?page=1&page_size=10&q=` | Saved invoices, newest first, with `total`, `total_pages` and a whole-sheet `summary` |

Errors always look like:

```json
{ "error": { "code": "upstream_timeout", "message": "...", "request_id": "3f9c1a7b2d4e", "details": null } }
```

| HTTP | `code` | Meaning |
|---|---|---|
| 400 | `invalid_file` | Not a PDF / empty |
| 413 | `file_too_large` | Over `MAX_UPLOAD_SIZE_MB` |
| 422 | `pdf_unreadable` | Corrupt, password-protected, too many pages, or no selectable text (scanned image) |
| 422 | `invalid_invoice` / `validation_error` | Missing invoice number / malformed body |
| 502 | `upstream_error` / `upstream_unavailable` | n8n returned an error or could not be reached |
| 504 | `upstream_timeout` | n8n did not answer in time |

Every response carries `X-Request-ID`; the same id appears in the server logs and in the UI's error messages.

## Testing & code quality

```bash
# backend (33 tests: API, schema coercion, PDF handling, n8n gateway retries/timeouts)
cd backend && uv run pytest
uv run ruff check . && uv run ruff format .

# frontend (invoice maths + form mapping)
cd frontend && npm test
npm run lint
npm run build
```

## Deployment

### Option A — Docker Compose (recommended)

```bash
cp backend/.env.example backend/.env     # set ENVIRONMENT=production and the n8n URLs
docker compose up -d --build
# → http://localhost:8080   (nginx serves the SPA and proxies /api/ to the backend)
```

The frontend image is built with an empty `VITE_API_BASE_URL`, so the browser calls `/api/...` on the same origin and CORS is not involved. If n8n runs on the Docker host, use `http://host.docker.internal:5678/...` (on Linux add `extra_hosts: ["host.docker.internal:host-gateway"]` to the `backend` service) rather than `localhost`.

> The Dockerfiles and compose file are provided as a starting point; build and smoke-test them in your environment before relying on them.

### Option B — Without Docker

```bash
# Backend (behind nginx/Caddy for TLS)
cd backend && uv sync --frozen --no-dev
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2 --proxy-headers

# Frontend: build and serve ./dist from any static host / CDN
cd frontend && VITE_API_BASE_URL=https://api.example.com npm ci && npm run build
```

When the API and the SPA are on different origins, set `CORS_ORIGINS=https://app.example.com` on the backend.

### Production checklist

- [ ] n8n workflows are **active** and the `.env` uses `/webhook/…` (not `/webhook-test/…`)
- [ ] `ENVIRONMENT=production`, TLS terminated at the proxy, `CORS_ORIGINS` set to your real origin(s)
- [ ] Webhook **Header Auth** enabled in n8n and `N8N_AUTH_TOKEN` configured here — otherwise anyone who learns a webhook URL can write to your sheet
- [ ] Authentication in front of the app (SSO / reverse-proxy auth / an auth dependency on the router) — the API currently has none
- [ ] Reverse-proxy body limit ≥ `MAX_UPLOAD_SIZE_MB`, read timeout ≥ 90 s
- [ ] Logs shipped somewhere; alert on `upstream_*` error rates

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| “API offline” badge | Backend not running, wrong `VITE_API_BASE_URL`, or origin missing from `CORS_ORIGINS` |
| `upstream_error … HTTP 404` | n8n workflow inactive, or a `/webhook-test/` URL is configured |
| `upstream_timeout` on extract | LLM slow — raise `N8N_EXTRACT_TIMEOUT_SECONDS` (and your proxy's read timeout) |
| “No selectable text was found” | The PDF is a scan. OCR is not implemented (see below) |
| Table shows only one row | The List webhook responds with *First Entry* — switch to *All Entries* |
| App won't start: validation error on `N8N_…` | A required webhook URL is missing in `backend/.env` |

## Changes from the original single-file version

- Endpoints moved: `/api/extract-invoice` → `POST /api/v1/invoices/extract`, `/api/save-invoice` → `POST /api/v1/invoices` (body is the invoice itself, no `{data: …}` wrapper), `/api/invoices` → `GET /api/v1/invoices` (now paginated; response shape is `{items, page, …}`).
- Webhook URLs and CORS origins moved to environment variables (CORS wildcard with credentials removed).
- n8n failures are no longer reported as HTTP 200 with an `n8n_status` string; they return 502/504 with a clear message. The save endpoint no longer re-wraps its own `HTTPException` into a generic 500.
- PDFs with no selectable text are rejected with a clear 422 instead of sending the literal string “No direct text found.” to the LLM.
- Uploads are validated by extension, magic bytes, size and page count; `pdfplumber` runs in a worker thread so it no longer blocks the event loop.
- The saved-invoices list is searchable/paginated server-side and sorted newest first.

## Known limitations / roadmap

- **No OCR** for scanned PDFs (add Tesseract/`ocrmypdf` or a vision-model step in n8n).
- **No authentication/authorisation** and **no duplicate-invoice detection** (a natural next step: check the sheet for an existing invoice number before saving).
- Google Sheets has no transactional guarantees; concurrent saves rely on n8n/Sheets append semantics. For higher volumes, move persistence to Postgres and keep Sheets as an export.
- Pagination is performed in the API after fetching all rows from n8n — fine for thousands of rows, not hundreds of thousands.

## License

See [LICENSE](LICENSE).
