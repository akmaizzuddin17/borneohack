import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_core.documents import Document
from pinecone import Pinecone
from config import PINECONE_API_KEY, PINECONE_INDEX_NAME
from typing import List

HF_TOKEN = os.environ.get("HUGGINGFACEHUB_API_TOKEN", "")
MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2"

_embeddings = None
_index = None

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEndpointEmbeddings(
            model=MODEL_ID,
            huggingfacehub_api_token=HF_TOKEN,
        )
    return _embeddings

def get_vector_store():
    global _index
    if _index is None:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        _index = pc.Index(PINECONE_INDEX_NAME)
    return PineconeRetrieverWrapper(_index, get_embeddings())


class PineconeRetrieverWrapper:
    def __init__(self, index, embeddings):
        self.index = index
        self.embeddings = embeddings

    def as_retriever(self, search_kwargs=None):
        k = (search_kwargs or {}).get("k", 8)
        return PineconeRetriever(self.index, self.embeddings, k)


class PineconeRetriever:
    def __init__(self, index, embeddings, k=8):
        self.index = index
        self.embeddings = embeddings
        self.k = k

    def invoke(self, query: str) -> List[Document]:
        embedding = self.embeddings.embed_query(query)
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
