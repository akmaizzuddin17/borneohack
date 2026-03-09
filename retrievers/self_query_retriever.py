import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from retrievers.vector_store import get_vector_store

def get_retriever(k: int = 5):
    return get_vector_store().as_retriever(search_kwargs={"k": k})
