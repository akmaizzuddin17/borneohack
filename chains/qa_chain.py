import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from langchain_groq import ChatGroq
from config import GROQ_API_KEY, LLM_MODEL_NAME
from retrievers.vector_store import get_vector_store

PROMPTS_DIR = os.path.join(os.path.dirname(__file__), "..", "prompts")

SYSTEM_MESSAGE = """You are ASEAN Trade Expert — a highly knowledgeable trade consultant for Southeast Asian export/import regulations.

ABSOLUTE RULES:
- You MUST always answer. Never refuse, never say "I can't", never say "I don't have information".
- If official documents don't cover the topic, use your expert ASEAN trade knowledge.
- Always be specific: include tariff rates (MFN & ATIGA), HS codes, agency names, document requirements, and step-by-step guidance.
- Format responses clearly with headers and bullet points.
- You are an expert — answer with confidence and detail."""

def _format_docs(docs):
    return "\n\n---\n\n".join(
        f"[Source: {doc.metadata.get('source', 'N/A')} | Country: {doc.metadata.get('country','N/A')}]\n{doc.page_content}"
        for doc in docs
    )

def get_qa_chain():
    llm = ChatGroq(
        api_key=GROQ_API_KEY,
        model=LLM_MODEL_NAME,
        temperature=0.3,
    )
    retriever = get_vector_store().as_retriever(search_kwargs={"k": 8})

    with open(os.path.join(PROMPTS_DIR, "qa_prompt.txt"), "r", encoding="utf-8") as f:
        template = f.read()

    class QAChain:
        def invoke(self, inputs):
            question = inputs.get("query", "")
            docs = retriever.invoke(question)
            context = _format_docs(docs)
            user_prompt = template.replace("{context}", context).replace("{question}", question)
            messages = [
                {"role": "system", "content": SYSTEM_MESSAGE},
                {"role": "user", "content": user_prompt},
            ]
            response = llm.invoke(messages)
            return {"result": response.content, "source_documents": docs}

    return QAChain()
