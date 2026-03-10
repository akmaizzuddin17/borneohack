import os
import sys
import shutil
import traceback

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from config import PDF_DATA_DIR

app = FastAPI(
    title="ASEAN Cross-Border Trade Consultant",
    description="AI-powered trade regulation assistant for Borneo vendors",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def auto_ingest_on_startup():
    if os.environ.get("DISABLE_AUTO_INGEST", "false").lower() == "true":
        print("[STARTUP] Auto-ingest disabled via env var.")
        return
    try:
        from chains.ingest import ingest_pdfs
        print("[STARTUP] Auto-ingesting PDFs from data folder...")
        stats = ingest_pdfs(PDF_DATA_DIR)
        print(f"[STARTUP] Auto-ingest complete: {stats}")
    except Exception as e:
        print(f"[STARTUP] Auto-ingest skipped: {e}")


# ── Models ────────────────────────────────────────────────────────────────────
class QueryRequest(BaseModel):
    question: str

class ChecklistRequest(BaseModel):
    product: str
    destination_country: str

class TranslateLetterRequest(BaseModel):
    product: str
    destination_country: str
    sender_name: str
    company_name: str

class FormDRequest(BaseModel):
    answers: dict


# ── Error helper ──────────────────────────────────────────────────────────────
def _error(e: Exception) -> JSONResponse:
    msg = str(e)
    if "Connection refused" in msg or "ConnectError" in msg:
        return JSONResponse(status_code=503, content={"detail": "Cannot connect to Groq API. Check your GROQ_API_KEY in .env file."})
    if "429" in msg or "RESOURCE_EXHAUSTED" in msg:
        return JSONResponse(status_code=429, content={"detail": "Rate limit reached. Please wait and try again."})
    traceback.print_exc()
    return JSONResponse(status_code=500, content={"detail": f"Server error: {msg}"})


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.2.0"}


# ── Q&A ───────────────────────────────────────────────────────────────────────
@app.post("/api/query")
async def query_trade(req: QueryRequest):
    try:
        from chains.qa_chain import get_qa_chain
        result = get_qa_chain().invoke({"query": req.question})
        sources = [{"source": doc.metadata.get("source", ""), "page": str(doc.metadata.get("page", "")), "country": doc.metadata.get("country", "")} for doc in result.get("source_documents", [])]
        return {"answer": result["result"], "sources": sources}
    except Exception as e:
        return _error(e)


# ── Checklist (FIXED) ─────────────────────────────────────────────────────────
@app.post("/api/checklist")
async def generate_checklist(req: ChecklistRequest):
    try:
        from chains.checklist_chain import get_checklist_chain
        result = get_checklist_chain().invoke({"product": req.product, "destination_country": req.destination_country})
        return {"checklist": result["result"], "product": req.product, "destination_country": req.destination_country}
    except Exception as e:
        return _error(e)


# ── Translation ───────────────────────────────────────────────────────────────
@app.post("/api/translate-letter")
async def translate_letter(req: TranslateLetterRequest):
    try:
        from chains.translation_chain import generate_and_translate_letter
        return generate_and_translate_letter(req.product, req.destination_country, req.sender_name, req.company_name)
    except Exception as e:
        return _error(e)


# ── Form D ────────────────────────────────────────────────────────────────────
@app.post("/api/form-d-check")
async def check_form_d(req: FormDRequest):
    try:
        from chains.form_d_chain import evaluate_form_d
        return evaluate_form_d(req.answers)
    except Exception as e:
        return _error(e)

@app.get("/api/form-d-questions")
async def form_d_questions():
    try:
        from chains.form_d_chain import get_questions
        return {"questions": get_questions()}
    except Exception as e:
        return _error(e)


# ── Ingest PDFs ───────────────────────────────────────────────────────────────
@app.post("/api/ingest")
async def ingest_pdf(file: UploadFile = File(...)):
    try:
        from chains.ingest import ingest_pdfs
        os.makedirs(PDF_DATA_DIR, exist_ok=True)
        dest = os.path.join(PDF_DATA_DIR, file.filename)
        with open(dest, "wb") as f:
            shutil.copyfileobj(file.file, f)
        stats = ingest_pdfs(PDF_DATA_DIR)
        return {"message": f"Uploaded and ingested {file.filename}", "stats": stats}
    except Exception as e:
        return _error(e)

@app.post("/api/ingest-all")
async def ingest_all():
    """Ingest all PDFs already in the data folder."""
    try:
        from chains.ingest import ingest_pdfs
        stats = ingest_pdfs(PDF_DATA_DIR)
        return {"message": "All PDFs ingested successfully", "stats": stats}
    except Exception as e:
        return _error(e)

