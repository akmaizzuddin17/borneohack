import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from langchain_groq import ChatGroq
from deep_translator import GoogleTranslator
from config import GROQ_API_KEY, LLM_MODEL_NAME, LANGUAGE_MAP

PROMPTS_DIR = os.path.join(os.path.dirname(__file__), "..", "prompts")

def generate_and_translate_letter(product, destination_country, sender_name, company_name):
    llm = ChatGroq(api_key=GROQ_API_KEY, model=LLM_MODEL_NAME, temperature=0.3)

    with open(os.path.join(PROMPTS_DIR, "letter_prompt.txt"), "r", encoding="utf-8") as f:
        template = f.read()

    prompt = (template
              .replace("{product}", product)
              .replace("{destination_country}", destination_country)
              .replace("{sender_name}", sender_name)
              .replace("{company_name}", company_name))
    result = llm.invoke(prompt)
    english_letter = result.content

    lang_code = LANGUAGE_MAP.get(destination_country, "en")
    target_language_name = f"{destination_country} ({lang_code})"

    if lang_code == "en":
        translated_letter = english_letter
    else:
        translator = GoogleTranslator(source="en", target=lang_code)
        if len(english_letter) > 4500:
            chunks = [english_letter[i:i+4500] for i in range(0, len(english_letter), 4500)]
            translated_letter = "".join(translator.translate(c) for c in chunks)
        else:
            translated_letter = translator.translate(english_letter)

    return {
        "english_letter": english_letter,
        "translated_letter": translated_letter,
        "target_language": target_language_name,
    }
