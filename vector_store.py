import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from langchain_huggingface import HuggingFaceEmbeddings
from langchain.vectorstores import Pinecone as PineconeVectorStore
from pinecone import Pinecone
from config import EMBEDDING_MODEL_NAME, PINECONE_API_KEY, PINECONE_INDEX_NAME

_vector_store = None

def get_vector_store():
    global _vector_store
    if _vector_store is None:
        embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(PINECONE_INDEX_NAME)
        _vector_store = PineconeVectorStore(index, embeddings, "text")
    return _vector_store
