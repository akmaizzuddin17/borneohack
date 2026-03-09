import os
from dotenv import load_dotenv

load_dotenv()

# ── Groq Cloud LLM ──────────────────────────────────────────────
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
LLM_MODEL_NAME: str = os.getenv("LLM_MODEL_NAME", "llama-3.1-8b-instant")

# ── Embeddings (local, free, no API key needed) ─────────────────
EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")

# ── ChromaDB ────────────────────────────────────────────────────
CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
CHROMA_COLLECTION_NAME: str = os.getenv("CHROMA_COLLECTION_NAME", "asean_trade_docs")

# ── Data ────────────────────────────────────────────────────────
PDF_DATA_DIR: str = os.getenv("PDF_DATA_DIR", "./data")
CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "1000"))
CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "200"))

LANGUAGE_MAP: dict[str, str] = {
    "Indonesia": "id",
    "Thailand": "th",
    "Vietnam": "vi",
    "Malaysia": "ms",
    "Philippines": "tl",
}
