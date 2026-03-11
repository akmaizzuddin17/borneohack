# ASEAN Trade Compass 🧭
AI-powered cross-border trade assistant for Borneo vendors. Built to simplify export compliance across ASEAN countries.

## 📖 Project Details
This full-stack application provides vendors in Borneo with real-time, AI-driven guidance on cross-border trade regulations, logistics planning, and document compliance (like Form D). 

The platform leverages **FastAPI** on the backend equipped with **Langchain** and **Pinecone** for document retrieval, powered by the **Groq API** for incredibly fast AI inference. The frontend is built using **React** and **Vite** for a seamless, App-like mobile experience.

---

## 🚀 Setup Instructions

**Prerequisites:**
- [Python 3.11+](https://python.org)
- [Node.js LTS](https://nodejs.org)
- Free Groq API key from [console.groq.com](https://console.groq.com)
- Free Pinecone API key & Index from [pinecone.io](https://pinecone.io)

**1. Clone the repository**
```bash
git clone https://github.com/your-username/borneohack.git
cd borneohack
```

**2. Configure Environment Variables**
Open `.env` (or rename `dot_env_template` to `.env`) and add your keys:
```env
GROQ_API_KEY=gsk_your_key_here
PINECONE_API_KEY=pcsk_your_pinecone_key
PINECONE_INDEX_NAME=your_index_name
LLM_MODEL_NAME=llama-3.1-8b-instant
EMBEDDING_MODEL_NAME=all-MiniLM-L6-v2
```

**3. Run the application**
Run the automated setup scripts (requires 2 terminal windows):
```powershell
# Terminal 1 - Start the Python Backend
.\setup.bat
.\start_backend.bat

# Terminal 2 - Start the React Frontend
.\start_frontend.bat
```
Navigate to **http://localhost:5173** to view the app!

---

## 🤖 AI Disclosure
**Clear, Honest, and Transparent AI Usage**:
During the ideation, development, and debugging phases of this project, we explicitly utilized Artificial Intelligence tools as collaborative assistants. 

AI was used to:
1. **Frontend UI Generation:** The entire React user interface was generated using **Google Stitch**.
2. **Core App Development:** The core logic, architecture planning, debugging, and RAG configuration were developed using **Antigravity powered by Opus 4.6** as the core AI assistant.
3. **Core Features:** The application itself is entirely centered around AI using the Groq API (LLaMA 3) to function as a domain-expert agent analyzing trade documents via a Retrieval-Augmented Generation (RAG) pipeline built with LangChain and Pinecone.

The foundational idea, prompt engineering mechanics, and final system integration were guided by human developers, utilizing AI primarily to accelerate coding velocity and resolve technical blockers.

---

## 🗂️ Project Structure
```
borneohack/
├── api/main.py              ← FastAPI backend
├── chains/                  ← RAG & Langchain Logic
├── retrievers/              ← Pinecone Vector Search
├── frontend/                ← React + Vite App
├── Procfile                 ← Railway Start instructions
├── config.py                ← Environment verification
└── requirements.txt         ← Python dependencies (CPU-optimized)
```
