import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from langchain_groq import ChatGroq
from config import GROQ_API_KEY, LLM_MODEL_NAME
from retrievers.vector_store import get_vector_store

PROMPTS_DIR = os.path.join(os.path.dirname(__file__), "..", "prompts")

FOOD_KEYWORDS = ["pepper", "spice", "rice", "fruit", "vegetable", "meat", "fish", "oil", "palm", "rubber",
                 "coffee", "tea", "cocoa", "sugar", "flour", "milk", "cheese", "egg", "honey", "salt",
                 "sauce", "noodle", "bread", "biscuit", "snack", "drink", "juice", "water", "beverage",
                 "halal", "organic", "dried", "frozen", "canned", "processed food", "chilli", "ginger",
                 "turmeric", "cinnamon", "cardamom", "nutmeg", "clove", "vanilla", "herb", "grain"]

ELECTRONICS_KEYWORDS = ["monitor", "laptop", "computer", "phone", "tablet", "tv", "television", "cable",
                        "charger", "battery", "speaker", "headphone", "keyboard", "mouse", "printer",
                        "router", "modem", "camera", "drone", "gadget", "electronic", "electrical",
                        "appliance", "microwave", "refrigerator", "washing machine", "air conditioner",
                        "fan", "lamp", "led", "solar panel", "inverter", "transformer", "circuit"]

def _detect_product_category(product: str) -> str:
    p = product.lower()
    if any(k in p for k in ELECTRONICS_KEYWORDS):
        return "electronics"
    if any(k in p for k in FOOD_KEYWORDS):
        return "food_agricultural"
    return "general"

def _format_docs(docs):
    return "\n\n---\n\n".join(
        f"[Source: {os.path.basename(doc.metadata.get('source', 'N/A'))} | Country: {doc.metadata.get('country','N/A')}]\n{doc.page_content}"
        for doc in docs
    )

def get_checklist_chain():
    llm = ChatGroq(api_key=GROQ_API_KEY, model=LLM_MODEL_NAME, temperature=0.1)
    retriever = get_vector_store().as_retriever(search_kwargs={"k": 5})

    with open(os.path.join(PROMPTS_DIR, "checklist_prompt.txt"), "r", encoding="utf-8") as f:
        template = f.read()

    class ChecklistChain:
        def invoke(self, inputs):
            product = inputs.get("product", "")
            destination_country = inputs.get("destination_country", "")
            category = _detect_product_category(product)

            if category == "electronics":
                query = f"electronics import requirements customs {destination_country} technical standards certification"
            elif category == "food_agricultural":
                query = f"Export {product} to {destination_country} food agricultural import compliance regulations"
            else:
                query = f"Import {product} to {destination_country} customs requirements regulations"

            docs = retriever.invoke(query)

            if category == "electronics":
                docs = [d for d in docs if "phytosanitary" not in d.page_content.lower()
                        and "food" not in d.page_content.lower()[:200]]

            context = _format_docs(docs) if docs else "No specific context found. Use general knowledge."
            prompt = (template
                      .replace("{context}", context)
                      .replace("{product}", product)
                      .replace("{destination_country}", destination_country))

            response = llm.invoke(prompt)
            return {"result": response.content, "source_documents": docs}

    return ChecklistChain()
