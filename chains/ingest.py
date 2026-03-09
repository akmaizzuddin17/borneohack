import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from config import CHUNK_SIZE, CHUNK_OVERLAP, CHROMA_PERSIST_DIR, CHROMA_COLLECTION_NAME, EMBEDDING_MODEL_NAME


def ingest_pdfs(pdf_dir: str) -> dict:
    pdf_paths = sorted(
        os.path.join(pdf_dir, f)
        for f in os.listdir(pdf_dir)
        if f.lower().endswith(".pdf")
    )
    if not pdf_paths:
        raise FileNotFoundError(f"No PDF files found in {pdf_dir}")

    print(f"Found {len(pdf_paths)} PDF(s)")
    all_docs = []
    for path in pdf_paths:
        loader = PyPDFLoader(path)
        pages = loader.load()
        print(f"  Loaded {os.path.basename(path)}: {len(pages)} page(s)")
        all_docs.extend(pages)

    splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
    chunks = splitter.split_documents(all_docs)
    print(f"Split into {len(chunks)} chunks")

    for chunk in chunks:
        source = chunk.metadata.get("source", "").lower()
        if "indonesia" in source:
            chunk.metadata["country"] = "Indonesia"
        elif "thailand" in source:
            chunk.metadata["country"] = "Thailand"
        elif "vietnam" in source:
            chunk.metadata["country"] = "Vietnam"
        elif "malaysia" in source:
            chunk.metadata["country"] = "Malaysia"
        elif "philippines" in source:
            chunk.metadata["country"] = "Philippines"
        elif "singapore" in source:
            chunk.metadata["country"] = "Singapore"
        elif "myanmar" in source:
            chunk.metadata["country"] = "Myanmar"
        elif "asean" in source or "export_and_import" in source or "guidelines" in source or "ilp" in source:
            chunk.metadata["country"] = "ASEAN"
        else:
            chunk.metadata["country"] = "General"

    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
    vector_store = Chroma(
        collection_name=CHROMA_COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=CHROMA_PERSIST_DIR,
    )
    vector_store.add_documents(chunks)
    print(f"Upserted {len(chunks)} chunks into Chroma")

    return {"pdfs_processed": len(pdf_paths), "total_pages": len(all_docs), "total_chunks": len(chunks)}
