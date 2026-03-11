# ASEAN Trade Compass 🧭
> AI-powered cross-border trade assistant for Asean vendors whether small or big entreprenuer. Built to simplify export compliance across ASEAN countries.

---

## 📖 Project Details

This full-stack application provides vendors in Asean with real-time, AI-driven guidance on cross-border trade regulations, logistics planning, and document compliance (like Form D).

The platform leverages **FastAPI** on the backend equipped with **LangChain** and **Pinecone** for document retrieval, powered by the **Groq API** for incredibly fast AI inference. The frontend is built using **React** and **Vite** for a seamless, app-like mobile experience.

---

## 🚀 Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js LTS
- Free Groq API key — [console.groq.com](https://console.groq.com)
- Free Pinecone API key & Index — [pinecone.io](https://www.pinecone.io)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/borneohack.git
cd borneohack
```

---

### Step 2 — Get Your Groq API Key

Groq provides free, ultra-fast inference for open-source LLMs like LLaMA 3.

1. Go to [console.groq.com](https://console.groq.com) and sign up for a free account.
2. Navigate to **API Keys** in the left sidebar.
3. Click **Create API Key**, give it a name (e.g. `borneohack`), and copy the key.
4. Your key will look like: `gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

> ⚠️ Store it safely — Groq only shows it once.

---

### Step 3 — Get Your Pinecone API Key & Create an Index

Pinecone is the vector database that stores your trade document embeddings.

1. Go to [pinecone.io](https://www.pinecone.io) and sign up for a free account.
2. From the dashboard, click **API Keys** → **Create API Key**. Copy it.
   - Your key will look like: `pcsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
3. Click **Indexes** → **Create Index** and configure it:

   | Setting | Value |
   |---|---|
   | **Index Name** | e.g. `asean-trade-compass` |
   | **Dimensions** | `384` *(matches `all-MiniLM-L6-v2` embeddings)* |
   | **Metric** | `cosine` |
   | **Pod Type** | `Starter` (free tier) |

4. Note your **Index Name** for the `.env` file.

---

### Step 4 — Configure Environment Variables

Rename `dot_env_template` to `.env` and fill in your keys:

```env
GROQ_API_KEY=gsk_your_key_here
PINECONE_API_KEY=pcsk_your_pinecone_key
PINECONE_INDEX_NAME=asean-trade-compass
LLM_MODEL_NAME=llama-3.1-8b-instant
EMBEDDING_MODEL_NAME=all-MiniLM-L6-v2
```

---

### Step 5 — Ingest Your Trade Documents (PDF Ingestion) 📄

Before the AI can answer questions, you need to load your trade regulation PDFs into the Pinecone vector store. This is a **one-time setup step**.

1. Place your PDF files (e.g. ATIGA Form D guidelines, ASEAN tariff schedules, customs regulations) into the `documents/` folder:

   ```
   borneohack/
   └── documents/
       ├── form_d_guidelines.pdf
       ├── asean_trade_regulations.pdf
       └── ...
   ```

2. Run the ingestion script to embed and upload them to Pinecone:

   ```bash
   python ingest.py
   ```

   This script will:
   - Load all PDFs from the `documents/` folder
   - Split them into chunks using LangChain's text splitter
   - Generate embeddings using `all-MiniLM-L6-v2`
   - Upsert all vectors into your Pinecone index

3. Wait for the script to complete. You should see confirmation that vectors were uploaded. You can verify in the Pinecone dashboard under your index's **Vectors** tab.

> 💡 Re-run `ingest.py` whenever you add new documents. Duplicate vectors won't affect results, but you can clear the index first from the Pinecone dashboard if needed.

---

### Step 6 — Run the Application

> ⚠️ **Make sure you have completed Step 5 (PDF ingestion) before starting the backend.** The backend connects to Pinecone on startup — if the index is empty, the AI will have no documents to retrieve from.

Open **two terminal windows**:

```bash
# Terminal 1 — Start the Python Backend
.\setup.bat
.\start_backend.bat

# Terminal 2 — Start the React Frontend
.\start_frontend.bat
```

Navigate to **http://localhost:5173** to view the app!

---

## 🗂️ Project Structure

```
borneohack/
├── api/main.py              ← FastAPI backend
├── chains/                  ← RAG & LangChain logic
├── retrievers/              ← Pinecone vector search
├── documents/               ← Place your PDFs here for ingestion
├── ingest.py                ← PDF ingestion script (run once before starting)
├── frontend/                ← React + Vite app
├── Procfile                 ← Railway start instructions
├── config.py                ← Environment verification
└── requirements.txt         ← Python dependencies (CPU-optimized)
```

---

## 🤖 AI Disclosure

**Clear, Honest, and Transparent AI Usage:** During the ideation, development, and debugging phases of this project, we explicitly utilized Artificial Intelligence tools as collaborative assistants.

AI was used to:

- **Frontend UI Generation:** The entire React user interface was generated using Google Stitch.
- **Core App Development:** The core logic, architecture planning, debugging, and RAG configuration were developed using Antigravity powered by Opus 4.6 as the core AI assistant.
- **Core Features:** The application itself is entirely centered around AI — using the Groq API (LLaMA 3) to function as a domain-expert agent analyzing trade documents via a Retrieval-Augmented Generation (RAG) pipeline built with LangChain and Pinecone.

The foundational idea, prompt engineering mechanics, and final system integration were guided by human developers, utilizing AI primarily to accelerate coding velocity and resolve technical blockers.

---

## ❓ Troubleshooting

| Issue | Fix |
|---|---|
| `PINECONE_INDEX_NAME not found` | Ensure the index name in `.env` exactly matches the one in Pinecone dashboard |
| `Dimension mismatch` error on ingest | Confirm your Pinecone index was created with **384 dimensions** |
| Empty AI responses | Run `ingest.py` first — the vector store must be populated before querying |
| Groq rate limit errors | The free tier has generous limits; wait a moment and retry |
