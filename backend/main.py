from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import io

app = FastAPI(title="Invoice OCR Extraction API", version="1.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # production-e specific domain dewa bhalo, local development-e "*" dilei hobe
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Invoice Extraction Backend is running with FastAPI & uv!"}

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
            extracted_text = "No direct text found. (OCR fallback can be integrated here if it's a scanned image)."

        return {
            "filename": file.filename,
            "status": "success",
            "extracted_text": extracted_text
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")