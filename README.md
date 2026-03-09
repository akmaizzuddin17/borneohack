# ASEAN Trade Compass 🧭
AI-powered cross-border trade assistant for Borneo vendors — powered by **Groq API**.

## Quick Start

### Prerequisites
- [Python 3.11+](https://python.org)
- [Node.js LTS](https://nodejs.org)
- Free Groq API key from [https://console.groq.com](https://console.groq.com)

### 1. Setup (run once)
```powershell
.\setup.bat
```

### 2. Add your Groq API key
Open `.env` and replace `your_groq_api_key_here`:
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
```

### 3. Run (2 terminals)

**Terminal 1 — Backend:**
```powershell
.\start_backend.bat
```

**Terminal 2 — Frontend:**
```powershell
.\start_frontend.bat
```

Open: **http://localhost:5173**

### 4. Load PDFs (first time only)
After backend is running, run:
```powershell
.\ingest_data.bat
```
Or place your PDFs in the `data/` folder — they auto-ingest on startup.

---

## Groq Models (set in .env as LLM_MODEL_NAME)
| Model | Speed | Quality |
|-------|-------|---------|
| `llama-3.1-8b-instant` | ⚡ Fastest | Good (default) |
| `llama-3.3-70b-versatile` | Slower | Best |
| `mixtral-8x7b-32768` | Medium | Long context |

---

## Project Structure
```
borneohack/
├── api/main.py              ← FastAPI backend
├── chains/
│   ├── qa_chain.py          ← Q&A (Groq)
│   ├── checklist_chain.py   ← Compliance checklist (Groq)
│   ├── translation_chain.py ← Letter + translation (Groq)
│   ├── form_d_chain.py      ← Form D checker (Groq)
│   └── ingest.py            ← PDF ingestion
├── retrievers/vector_store.py
├── prompts/                 ← Prompt templates
├── data/                    ← Put your PDFs here
├── frontend/                ← React + Vite app
│   └── src/
│       ├── pages/
│       ├── components/
│       └── lib/
├── config.py                ← All config (reads .env)
├── .env                     ← Your API keys (never commit!)
└── requirements.txt
```
