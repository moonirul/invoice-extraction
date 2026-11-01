🧾 Invoice Intelligence
AI-Powered Invoice Processing & Financial Data Automation

<p align="center">
Transform unstructured PDF invoices into structured, validated, and searchable financial records using AI-powered automation.
</p>

<p align="center">
<img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi" />
<img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" />
<img src="https://img.shields.io/badge/TailwindCSS-v4-38BDF8?style=flat-square&logo=tailwindcss" />
<img src="https://img.shields.io/badge/n8n-AI%20Automation-EA4B71?style=flat-square&logo=n8n" />
<img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python" />
<img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

📌 Overview

Invoice Intelligence is an AI-powered invoice processing platform designed to automate the extraction, validation, review, and storage of financial information from PDF invoices.

The application combines a modern React frontend, a FastAPI backend, and n8n-powered AI workflows to convert unstructured invoice documents into structured financial records.

Instead of manually entering invoice information, users can upload a PDF, let an AI agent extract the relevant information, review the results, and save verified records directly to Google Sheets.

Why Invoice Intelligence?
Reduce manual invoice data entry.
Minimize human errors through automated financial validation.
Standardize invoice information into structured JSON.
Maintain a human-in-the-loop approval process.
Integrate AI automation with existing spreadsheet-based workflows.
✨ Core Features
Feature	Description
📄 PDF Processing	Upload and extract text from PDF invoices
🤖 AI Extraction	Extract structured invoice data using n8n AI workflows
🧠 Intelligent Parsing	Identify suppliers, customers, dates, taxes, and line items
✅ Financial Validation	Automatically validate invoice calculations
✏️ Interactive Review	Edit extracted information before submission
📊 Google Sheets Integration	Persist approved invoices to Google Sheets
🔎 Invoice Management	Search and browse previously saved invoices
⚡ REST API	FastAPI-powered backend with documented endpoints
🐳 Docker Deployment	Containerized application deployment
🧪 Automated Testing	Backend and frontend test coverage
🏗️ System Architecture

Invoice Intelligence follows a modular architecture that separates document processing, AI orchestration, business validation, and data persistence.

mermaid
flowchart TD
    A[User] --> B[React Frontend]
    B --> C[FastAPI Backend]

    C --> D[PDF Text Extraction]
    D --> E[n8n Extract Webhook]

    E --> F[AI Agent / LLM]
    F --> G[Structured Invoice JSON]

    G --> C
    C --> H[Invoice Validation]
    H --> B

    B --> I[Human Review & Approval]
    I --> C

    C --> J[n8n Save Webhook]
    J --> K[Google Sheets]

    K --> L[n8n List Webhook]
    L --> C
    C --> B

Processing Pipeline
Document Upload: The user uploads a PDF invoice through the React dashboard.
Text Extraction: FastAPI processes the PDF using pdfplumber.
AI Orchestration: Extracted text is forwarded to an n8n webhook.
Structured Extraction: An AI agent identifies invoice fields and returns structured JSON.
Validation: Backend schemas and frontend financial calculations validate the extracted information.
Human Approval: Users review and modify the extracted information.
Data Persistence: Confirmed invoices are submitted to Google Sheets through n8n.
Invoice Retrieval: Previously saved invoices can be searched and displayed.
🛠️ Technology Stack
Frontend
Technology	Purpose
React 19	Component-based UI
Vite	Development server and build tooling
Tailwind CSS v4	Utility-first styling
TanStack Query	Server-state management
React Hook Form	Form management
JavaScript / TypeScript	Application logic
Backend
Technology	Purpose
Python 3.11+	Backend runtime
FastAPI	REST API framework
Pydantic v2	Data validation and schemas
pdfplumber	PDF text extraction
httpx	Asynchronous HTTP communication
uv	Python dependency management
Pytest	Automated testing
Ruff	Linting and formatting
AI & Automation
Technology	Purpose
n8n	Workflow orchestration
AI Agent	Invoice information extraction
LLM	Natural language understanding
Webhooks	Backend-to-workflow communication
Google Sheets	Invoice data storage
Infrastructure
Docker
Docker Compose
Nginx
Environment-based configuration
📂 Project Structure
text
invoice-intelligence/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   │
│   ├── samples/
│   │   └── enterprise_invoice.pdf
│   │
│   ├── tests/
│   ├── .env.example
│   └── pyproject.toml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── pages/
│   │
│   ├── public/
│   ├── .env.example
│   └── package.json
│
├── Workflows - n8n/
│   ├── extract.json
│   ├── save.json
│   └── list.json
│
├── docker-compose.yml
├── .gitignore
├── LICENSE
└── README.md

🚀 Getting Started

Follow the instructions below to run the project locally.

Prerequisites

Make sure the following tools are installed:

Python 3.11+
uv
Node.js 22+
npm
Docker and Docker Compose (optional)
An active n8n instance
Google Sheets API integration configured in n8n
1. Clone the Repository
bash
git clone <YOUR_REPOSITORY_URL>
cd invoice-intelligence

2. Backend Setup

Navigate to the backend directory:

bash
cd backend


Create your environment configuration:

bash
cp .env.example .env


Configure the required environment variables.

Install dependencies:

bash
uv sync


Start the development server:

bash
uv run uvicorn app.main:app --reload --port 8000


Backend services:

API: http://localhost:8000
Swagger Documentation: http://localhost:8000/docs
Health Check: http://localhost:8000/api/v1/health
3. Frontend Setup

Open another terminal:

bash
cd frontend


Create the environment configuration:

bash
cp .env.example .env


Configure the backend URL:

env
VITE_API_BASE_URL=http://localhost:8000


Install dependencies:

bash
npm install


Start the frontend:

bash
npm run dev


Access the application:

http://localhost:5173

⚙️ Environment Configuration
Backend Environment Variables

Create backend/.env:

Variable	Required	Default	Description
N8N_EXTRACT_WEBHOOK_URL	Yes	—	AI extraction workflow URL
N8N_SAVE_WEBHOOK_URL	Yes	—	Invoice persistence workflow URL
N8N_LIST_WEBHOOK_URL	Yes	—	Invoice listing workflow URL
N8N_AUTH_TOKEN	No	Empty	Shared webhook authentication token
N8N_EXTRACT_TIMEOUT_SECONDS	No	90	AI extraction timeout
CORS_ORIGINS	No	localhost:5173	Allowed frontend origins
MAX_UPLOAD_SIZE_MB	No	10	Maximum PDF upload size
ENVIRONMENT	No	development	Application environment
Frontend Environment Variables

Create frontend/.env:

Variable	Default	Description
VITE_API_BASE_URL	http://localhost:8000	Backend API base URL
VITE_MAX_UPLOAD_MB	10	Maximum upload size

Security Note: Never expose backend secrets, n8n authentication tokens, or private API credentials through frontend environment variables.

🔗 n8n Workflow Integration

The application uses three independent n8n workflows.

Workflow 01 — Invoice Extraction

Purpose: Convert extracted PDF text into structured invoice information.

Method: POST
Input:
json
{
  "filename": "invoice.pdf",
  "extracted_text": "Invoice Number: INV-001..."
}

Output: Structured invoice JSON.
Workflow 02 — Invoice Persistence

Purpose: Save user-approved invoice records to Google Sheets.

Method: POST
Input: Complete validated invoice JSON.
Output: Any successful 2xx HTTP response.
Workflow 03 — Invoice Listing

Purpose: Retrieve previously stored invoice records.

Method: GET
Output: JSON array containing saved invoices.

Important: Activate all three n8n workflows and use production webhook URLs (/webhook/...) instead of temporary test URLs.

📦 Invoice Data Schema

The AI extraction workflow returns a standardized invoice object.

json
{
  "invoice_details": {
    "invoice_number": "INV-001",
    "invoice_date": "2026-01-15",
    "due_date": "2026-02-15",
    "currency": "USD"
  },
  "supplier": {
    "name": "ABC Technologies",
    "address": "New York, USA",
    "tax_id": "TAX-12345"
  },
  "customer": {
    "name": "XYZ Corporation",
    "address": "California, USA",
    "tax_id": "TAX-67890"
  },
  "financial_summary": {
    "subtotal": 1000,
    "tax_amount": 100,
    "total_amount": 1100
  },
  "line_items": [
    {
      "description": "Software Development",
      "quantity": 2,
      "unit_price": 500,
      "total": 1000
    }
  ],
  "math_validation": {
    "status": "Passed",
    "errors": []
  }
}


The values above are illustrative examples.

📡 REST API Reference

Base URL:

text
http://localhost:8000/api/v1

Method	Endpoint	Description
GET	/health	API health check
POST	/invoices/extract	Upload PDF and extract invoice data
POST	/invoices	Save confirmed invoice
GET	/invoices?page=1&q=	Retrieve searchable, paginated invoices
API Error Format

All API errors follow a consistent response structure.

json
{
  "error": {
    "code": "upstream_timeout",
    "message": "n8n did not respond in time",
    "request_id": "3f9c1a7b"
  }
}

🧪 Testing & Code Quality

The project includes automated backend and frontend tests.

Backend
bash
cd backend

# Run automated tests
uv run pytest

# Lint
uv run ruff check .

# Format
uv run ruff format .

Frontend
bash
cd frontend

# Run tests
npm test

# Lint
npm run lint

# Production build
npm run build

Testing Coverage Areas
REST API endpoint behavior
Invoice schema validation
Data type coercion
n8n gateway communication
Upstream timeout and retry handling
Invoice financial calculations
Frontend form mapping
🐳 Docker Deployment

The application supports containerized deployment using Docker Compose.

Configure Production Environment
bash
cp backend/.env.example backend/.env


Configure:

env
ENVIRONMENT=production
N8N_EXTRACT_WEBHOOK_URL=your_production_extract_url
N8N_SAVE_WEBHOOK_URL=your_production_save_url
N8N_LIST_WEBHOOK_URL=your_production_list_url

Build and Start
bash
docker compose up -d --build


Access the application:

text
http://localhost:8080

Architecture

In production:

Nginx serves the React frontend.
Nginx proxies API requests to FastAPI.
FastAPI communicates with n8n workflows.
n8n handles AI orchestration and Google Sheets integration.

This deployment uses a same-origin frontend/backend setup, reducing the need for cross-origin browser requests.

🔐 Security & Production Considerations

Before deploying to a public environment, consider the following:

Protect application access with authentication and authorization.
Use HTTPS/TLS for all external connections.
Secure n8n webhooks using Header Authentication.
Store credentials in environment variables or a secrets manager.
Restrict CORS to trusted frontend origins.
Enforce PDF upload size and file-type validation.
Avoid logging sensitive invoice information.
Configure appropriate proxy request and response timeouts.
Apply rate limiting to public-facing API endpoints.
Restrict access to Google Sheets and associated credentials.

Note: Authentication and duplicate invoice detection are not currently implemented.

⚠️ Current Limitations
Limitation	Details
OCR	Scanned image-based PDFs are not supported
Authentication	No built-in user authentication
Duplicate Detection	Duplicate invoice numbers can be saved
Storage	Google Sheets is used instead of a dedicated database
Pagination	All spreadsheet rows are fetched before pagination
🗺️ Roadmap

Potential improvements for future releases:

OCR support for scanned invoices
User authentication and role-based access control
Duplicate invoice detection
PostgreSQL integration
Invoice export to Excel and CSV
Multi-currency financial reporting
Batch invoice processing
Background processing with task queues
Audit logs and invoice activity history
Automated CI/CD pipeline
Advanced analytics dashboard
🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

To contribute:

Fork the repository.
Create a feature branch.
bash
git checkout -b feature/your-feature-name

Implement your changes.
Run the relevant tests and lint checks.
Commit your changes.
bash
git commit -m "feat: add your feature"

Push your branch and open a Pull Request.

Please keep contributions focused, documented, and consistent with the existing project architecture.

📄 License

This project is licensed under the MIT License.

👨‍💻 Author

Moonirul

GitHub: @moonirul

<p align="center">
<b>Invoice Intelligence</b>
<br />
Turning unstructured invoices into structured financial intelligence.
<br /><br />
⭐ If you find this project useful, consider giving it a star!
</p>