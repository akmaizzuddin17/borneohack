import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from langchain_core.documents import Document
from pinecone import Pinecone
from config import PINECONE_API_KEY, PINECONE_INDEX_NAME, EMBEDDING_MODEL_NAME
from typing import List

_index = None
_embeddings = None

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        from langchain_huggingface import HuggingFaceEmbeddings
        _embeddings = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL_NAME,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True, "batch_size": 1},
        )
    return _embeddings

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
        embedding = get_embeddings().embed_query(query)
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
