import os
import sys
import re
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from langchain_groq import ChatGroq
from config import GROQ_API_KEY, LLM_MODEL_NAME
from retrievers.vector_store import get_vector_store

ASEAN_COUNTRIES = ["malaysia", "indonesia", "thailand", "vietnam", "singapore", "philippines", "cambodia", "laos", "myanmar", "brunei"]

FORM_D_QUESTIONS = [
    {"id": "company_name",          "section": "Section 1 – Business Information",   "question": "What is your company name?",                                                "hint": "e.g. Borneo Spice Trading Sdn Bhd"},
    {"id": "product_name",          "section": "Section 1 – Business Information",   "question": "What product are you exporting?",                                           "hint": "e.g. Black pepper, dried chilli, palm oil"},
    {"id": "exporting_country",     "section": "Section 1 – Business Information",   "question": "Which country are you exporting FROM?",                                     "hint": "e.g. Malaysia, Indonesia, Vietnam"},
    {"id": "importing_country",     "section": "Section 1 – Business Information",   "question": "Which country are you exporting TO?",                                       "hint": "e.g. Indonesia, Thailand, Philippines"},
    {"id": "manufacturing_location","section": "Section 1 – Business Information",   "question": "Where is your product manufactured or produced?",                           "hint": "e.g. Sarawak, Malaysia"},
    {"id": "hs_code",               "section": "Section 1 – Business Information",   "question": "What is the HS Code of your product? (Type 'unknown' if you don't know)",  "hint": "e.g. 0904.11 for unground black pepper"},
    {"id": "wholly_obtained",       "section": "Section 2 – Product Origin",         "question": "Is your product wholly obtained or produced entirely within an ASEAN country?", "hint": "Answer: Yes or No"},
    {"id": "asean_raw_materials",   "section": "Section 2 – Product Origin",         "question": "Are your raw materials sourced from ASEAN countries?",                      "hint": "Answer: Yes, No, or Partially"},
    {"id": "non_asean_materials",   "section": "Section 2 – Product Origin",         "question": "Do you use any materials imported from outside ASEAN?",                     "hint": "Answer: Yes or No. If yes, describe briefly."},
    {"id": "material_sources",      "section": "Section 3 – Raw Materials",          "question": "Where are your main raw materials sourced from? List the countries.",       "hint": "e.g. Pepper from Sarawak (Malaysia), packaging from China"},
    {"id": "asean_material_pct",    "section": "Section 3 – Raw Materials",          "question": "Approximately what % of your raw materials come from ASEAN countries?",    "hint": "e.g. 80 — enter a number"},
    {"id": "imported_material_pct", "section": "Section 3 – Raw Materials",          "question": "Approximately what % of your raw materials come from OUTSIDE ASEAN?",      "hint": "e.g. 20 — should add up to 100% with previous answer"},
    {"id": "manufacturing_country", "section": "Section 4 – Manufacturing Process",  "question": "In which country does your manufacturing or production process take place?", "hint": "e.g. Malaysia"},
    {"id": "production_processes",  "section": "Section 4 – Manufacturing Process",  "question": "What production processes are performed on your product?",                  "hint": "e.g. Cleaning, drying, grinding, packaging"},
    {"id": "final_transformation",  "section": "Section 4 – Manufacturing Process",  "question": "Where does the final transformation or finishing of your product occur?",    "hint": "e.g. Final drying and packaging done in Kuching, Malaysia"},
    {"id": "fob_price",             "section": "Section 5 – Regional Value Content", "question": "What is the FOB export price of your product per unit or batch?",           "hint": "e.g. USD 500 per 100kg"},
    {"id": "non_asean_cost",        "section": "Section 5 – Regional Value Content", "question": "What is the total COST of non-ASEAN imported materials per batch?",         "hint": "e.g. USD 50. Enter 0 if none."},
    {"id": "has_production_records","section": "Section 6 – Supporting Documents",   "question": "Do you have production records showing where and how your product was made?", "hint": "Answer: Yes or No"},
    {"id": "has_material_invoices", "section": "Section 6 – Supporting Documents",   "question": "Do you have invoices for raw materials showing their country of origin?",    "hint": "Answer: Yes or No"},
    {"id": "has_manufacturing_docs","section": "Section 6 – Supporting Documents",   "question": "Do you have manufacturing documentation such as a bill of materials?",       "hint": "Answer: Yes or No"},
]


def get_questions():
    return FORM_D_QUESTIONS


def evaluate_form_d(answers: dict) -> dict:
    llm = ChatGroq(api_key=GROQ_API_KEY, model=LLM_MODEL_NAME, temperature=0.1)
    retriever = get_vector_store().as_retriever(search_kwargs={"k": 6})

    context_docs = retriever.invoke("ASEAN Certificate of Origin Form D Rules of Origin Regional Value Content eligibility requirements")
    context = "\n\n".join(doc.page_content for doc in context_docs)

    rvc = None
    try:
        fob_nums = re.findall(r"[\d.]+", str(answers.get("fob_price", "0")).replace(",", ""))
        non_asean_nums = re.findall(r"[\d.]+", str(answers.get("non_asean_cost", "0")).replace(",", ""))
        fob = float(fob_nums[0]) if fob_nums else 0
        non_asean = float(non_asean_nums[0]) if non_asean_nums else 0
        if fob > 0:
            rvc = ((fob - non_asean) / fob) * 100
    except Exception:
        rvc = None

    mfg_country = answers.get("manufacturing_country", answers.get("exporting_country", "")).lower()
    dest_country = answers.get("importing_country", "").lower()
    is_asean_mfg = any(c in mfg_country for c in ASEAN_COUNTRIES)
    is_asean_dest = any(c in dest_country for c in ASEAN_COUNTRIES)
    wholly_obtained = answers.get("wholly_obtained", "").lower() in ["yes", "y", "ya"]
    asean_pct = 0
    try:
        asean_pct = float(re.findall(r"[\d.]+", str(answers.get("asean_material_pct", "0")))[0])
    except Exception:
        pass

    if not is_asean_mfg or not is_asean_dest:
        verdict = "NOT ELIGIBLE"
    elif wholly_obtained:
        verdict = "ELIGIBLE"
    elif rvc is not None and rvc >= 40:
        verdict = "ELIGIBLE"
    elif asean_pct >= 60:
        verdict = "ELIGIBLE"
    elif rvc is not None and rvc < 40 and asean_pct < 60:
        verdict = "NOT ELIGIBLE"
    else:
        verdict = "MORE INFORMATION REQUIRED"

    prompt = f"""You are an ASEAN trade compliance expert. A business owner wants to know if their product qualifies for the ASEAN Certificate of Origin (Form D) under ATIGA.

OFFICIAL ASEAN RULES OF ORIGIN CONTEXT:
{context}

BUSINESS OWNER'S ANSWERS:
Section 1 – Business Information:
- Company Name: {answers.get('company_name', 'N/A')}
- Product: {answers.get('product_name', 'N/A')}
- Exporting From: {answers.get('exporting_country', 'N/A')}
- Exporting To: {answers.get('importing_country', 'N/A')}
- Manufacturing Location: {answers.get('manufacturing_location', 'N/A')}
- HS Code: {answers.get('hs_code', 'N/A')}

Section 2 – Product Origin:
- Wholly obtained in ASEAN: {answers.get('wholly_obtained', 'N/A')}
- Raw materials from ASEAN: {answers.get('asean_raw_materials', 'N/A')}
- Non-ASEAN materials used: {answers.get('non_asean_materials', 'N/A')}

Section 3 – Raw Materials:
- Material sources: {answers.get('material_sources', 'N/A')}
- ASEAN material percentage: {answers.get('asean_material_pct', 'N/A')}%
- Imported material percentage: {answers.get('imported_material_pct', 'N/A')}%

Section 4 – Manufacturing Process:
- Manufacturing country: {answers.get('manufacturing_country', 'N/A')}
- Production processes: {answers.get('production_processes', 'N/A')}
- Final transformation location: {answers.get('final_transformation', 'N/A')}

Section 5 – Regional Value Content:
- FOB Export Price: {answers.get('fob_price', 'N/A')}
- Non-ASEAN material cost: {answers.get('non_asean_cost', 'N/A')}
- CALCULATED RVC: {f"{rvc:.1f}%" if rvc is not None else "Could not calculate"}

Section 6 – Supporting Documents:
- Has production records: {answers.get('has_production_records', 'N/A')}
- Has material invoices: {answers.get('has_material_invoices', 'N/A')}
- Has manufacturing docs: {answers.get('has_manufacturing_docs', 'N/A')}

SYSTEM PRELIMINARY VERDICT: {verdict}

Based on the official ASEAN Rules of Origin above and the business owner's answers, provide a complete assessment in this EXACT format:

## 🏅 ELIGIBILITY RESULT
State clearly: ELIGIBLE FOR CERTIFICATE FORM D / NOT ELIGIBLE / MORE INFORMATION REQUIRED

## 📋 EXPLANATION
Explain in clear, simple language why the product qualifies or does not qualify.

## 📊 COMPLIANCE SUMMARY
- **Manufacturing Origin:** [country and whether it is ASEAN]
- **Material Origin:** [summary of where materials come from]
- **Estimated RVC:** [calculated percentage or estimate]
- **Applicable Rule:** [Wholly Obtained / RVC / CTC]

## 💡 RECOMMENDATION
Provide 3-5 specific, actionable next steps.

## 📍 WHERE TO APPLY & SUBMIT
Provide specific information about:
1. Where to apply for Form D in the EXPORTING country (exact government office)
2. Documents to prepare and bring
3. Processing time (working days)
4. Where to present Form D at the destination country customs
5. Online portal (if available)
6. Cost (typical fee)

Keep the language friendly and simple for a small Borneo vendor."""

    response = llm.invoke(prompt)

    return {
        "verdict": verdict,
        "rvc": round(rvc, 1) if rvc is not None else None,
        "is_asean_manufacturer": is_asean_mfg,
        "is_asean_destination": is_asean_dest,
        "wholly_obtained": wholly_obtained,
        "asean_material_pct": asean_pct,
        "explanation": response.content,
        "answers": answers,
    }
