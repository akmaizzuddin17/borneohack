import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from pinecone import Pinecone
from config import CHUNK_SIZE, CHUNK_OVERLAP, PINECONE_API_KEY, PINECONE_INDEX_NAME

HF_TOKEN = os.environ.get("HUGGINGFACEHUB_API_TOKEN", "")
MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2"

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
        else:
            chunk.metadata["country"] = "ASEAN"

    embeddings = HuggingFaceEndpointEmbeddings(
        model=MODEL_ID,
        huggingfacehub_api_token=HF_TOKEN,
    )

    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index(PINECONE_INDEX_NAME)

    vectors = []
    for i, chunk in enumerate(chunks):
        embedding = embeddings.embed_query(chunk.page_content)
        vectors.append({
            "id": f"chunk-{i}",
            "values": embedding,
            "metadata": {
                "text": chunk.page_content,
                "source": chunk.metadata.get("source", ""),
                "page": str(chunk.metadata.get("page", "")),
                "country": chunk.metadata.get("country", "ASEAN"),
            }
        })

    batch_size = 100
    for i in range(0, len(vectors), batch_size):
        index.upsert(vectors=vectors[i:i+batch_size])
        print(f"  Upserted batch {i//batch_size + 1}")

    print(f"Stored {len(chunks)} chunks into Pinecone index '{PINECONE_INDEX_NAME}'")
    return {"pdfs_processed": len(pdf_paths), "total_pages": len(all_docs), "total_chunks": len(chunks)}
