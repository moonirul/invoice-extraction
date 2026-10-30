import io
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import httpx  # n8n e data pathanor jonno
import pdfplumber
from pydantic import BaseModel


class SaveInvoicePayload(BaseModel):
  data: dict


app = FastAPI(title="Invoice OCR Extraction API", version="1.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # development-e shob allow kora holo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Webhook URLs
N8N_EXTRACT_WEBHOOK_URL = (
    "http://localhost:5678/webhook-test/2bfc99f9-d6ed-4a04-ad1d-7ff0a6d80b32"
)
# TODO: n8n e 2nd webhook create kore ekhane tar URL ta বসিয়ে দিবে
N8N_SAVE_WEBHOOK_URL = (
    "http://localhost:5678/webhook-test/95905278-de56-4c28-881a-5fbe2a4bbff0"
)

N8N_GET_SHEET_WEBHOOK_URL = "http://localhost:5678/webhook-test/521c420a-9d59-4b99-a979-531e5bcfa4bb"

@app.get("/")
def read_root():
  return {
      "message": "Invoice Extraction Backend is running with FastAPI & uv!"
  }



@app.get("/api/invoices")
async def get_invoices():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(N8N_GET_SHEET_WEBHOOK_URL, timeout=15.0)
            if response.status_code == 200:
                return {"status": "success", "data": response.json()}
            else:
                raise HTTPException(status_code=500, detail="Failed to fetch saved invoices from n8n.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 1. Extraction Endpoint (Only returns JSON to UI, does not save to Google Sheets)
@app.post("/api/extract-invoice")
async def extract_invoice(file: UploadFile = File(...)):
  if not file.filename.endswith(".pdf"):
    raise HTTPException(status_code=400, detail="Only PDF files are supported.")

  try:
    contents = await file.read()
    extracted_text = ""

    with pdfplumber.open(io.BytesIO(contents)) as pdf:
      for page_idx, page in enumerate(pdf.pages):
        text = page.extract_text()
        if text:
          extracted_text += f"--- Page {page_idx + 1} ---\n{text}\n"

    if not extracted_text.strip():
      extracted_text = "No direct text found."

    payload = {"filename": file.filename, "extracted_text": extracted_text}

    n8n_data = {}
    try:
      async with httpx.AsyncClient() as client:
        response = await client.post(
            N8N_EXTRACT_WEBHOOK_URL, json=payload, timeout=60.0
        )
        if response.status_code == 200:
          n8n_data = response.json()  # n8n theke asha clean JSON payload
          n8n_status = "sent_to_n8n_successfully"
        else:
          n8n_status = f"n8n_failed_status_{response.status_code}"
    except Exception as n8n_err:
      n8n_status = f"n8n_error: {str(n8n_err)}"

    return {
        "filename": file.filename,
        "status": "success",
        "n8n_status": n8n_status,
        "message": (
            "PDF text extracted and processed by n8n AI Agent successfully!"
        ),
        "data": n8n_data,
    }

  except Exception as e:
    raise HTTPException(
        status_code=500, detail=f"Error processing PDF: {str(e)}"
    )


# 2. Save Endpoint (Called when user clicks "Save & Sync" button on UI)
@app.post("/api/save-invoice")
async def save_invoice(payload: SaveInvoicePayload):
  try:
    async with httpx.AsyncClient() as client:
      response = await client.post(
          N8N_SAVE_WEBHOOK_URL, json=payload.data, timeout=15.0
      )
      if response.status_code == 200:
        return {
            "status": "success",
            "message": "Successfully saved to Google Sheets!",
        }
      else:
        raise HTTPException(
            status_code=500,
            detail="Failed to save data to Google Sheets via n8n.",
        )
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))