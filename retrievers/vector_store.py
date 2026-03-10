import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import requests
from langchain_core.documents import Document
from pinecone import Pinecone
from config import PINECONE_API_KEY, PINECONE_INDEX_NAME
from typing import List

HF_TOKEN = os.environ.get("HUGGINGFACEHUB_API_TOKEN", "")
API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"

_index = None

def get_embedding(text: str) -> list:
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    response = requests.post(API_URL, headers=headers, json={"inputs": text, "options": {"wait_for_model": True}})
    result = response.json()
    print(f"[HF DEBUG] type={type(result)}, len={len(result) if isinstance(result, list) else 'N/A'}")
    if isinstance(result, list):
        # Handle [[[ ]]] or [[ ]] or [ ] shapes
        flat = result
        while isinstance(flat, list) and len(flat) > 0 and isinstance(flat[0], list):
            flat = flat[0]
        print(f"[HF DEBUG] flattened len={len(flat)}, first={flat[0] if flat else 'empty'}")
        return flat
    raise ValueError(f"Unexpected HF response: {result}")

def get_vector_store():
    global _index
    if _index is None:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        _index = pc.Index(PINECONE_INDEX_NAME)
    return PineconeRetrieverWrapper(_index)


class PineconeRetrieverWrapper:
    def __init__(self, index):
        self.index = index

    def as_retriever(self, search_kwargs=None):
        k = (search_kwargs or {}).get("k", 8)
        return PineconeRetriever(self.index, k)


class PineconeRetriever:
    def __init__(self, index, k=8):
        self.index = index
        self.k = k

    def invoke(self, query: str) -> List[Document]:
        embedding = get_embedding(query)
        results = self.index.query(vector=embedding, top_k=self.k, include_metadata=True)
        docs = []
        for match in results.get("matches", []):
            meta = match.get("metadata", {})
            docs.append(Document(
                page_content=meta.get("text", ""),
                metadata={
                    "source": meta.get("source", ""),
                    "page": meta.get("page", ""),
                    "country": meta.get("country", ""),
                }
            ))
        return docs
