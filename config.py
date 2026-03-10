import os
from dotenv import load_dotenv

load_dotenv()

# ── Groq Cloud LLM ──────────────────────────────────────────────
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
LLM_MODEL_NAME: str = os.getenv("LLM_MODEL_NAME", "llama-3.1-8b-instant")

# ── Embeddings ──────────────────────────────────────────────────
EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")

# ── Pinecone ────────────────────────────────────────────────────
PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX_NAME: str = os.getenv("PINECONE_INDEX_NAME", "asean-trade-docs")

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
