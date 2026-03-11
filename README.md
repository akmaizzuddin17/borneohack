# ASEAN Trade Compass 🧭
AI-powered cross-border trade assistant for Borneo vendors. Built to simplify export compliance across ASEAN countries.

## 📖 Project Details
This full-stack application provides vendors in Borneo with real-time, AI-driven guidance on cross-border trade regulations, logistics planning, and document compliance (like Form D). 

The platform leverages **FastAPI** on the backend equipped with **Langchain** and **Pinecone** for document retrieval, powered by the **Groq API** for incredibly fast AI inference. The frontend is built using **React** and **Vite** for a seamless, App-like mobile experience.

---

## 🚀 Setup Instructions

### Option 1: Local Development (Windows)

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


### Option 2: Cloud Deployment (Vercel + Railway)
For continuous 24/7 uptime without sleep constraints, follow these deployment steps:

**Deploy the Backend (Railway):**
1. Use the [Railway CLI](https://docs.railway.com/guides/cli) to deploy the backend directly bypassing GitHub: `railway up`. 
2. Add all 5 `.env` variables from above to your Railway project settings.
3. Generate a public Railway Domain URL in the Networking tab.

**Deploy the Frontend (Vercel):**
1. Import the repository to Vercel.
2. Under "Root Directory", select `frontend`.
3. Add a new Environment Variable `VITE_API_BASE` and set it to your public Railway domain (e.g. `https://your-api.up.railway.app`).
4. Click Deploy.

---

## 🤖 AI Disclosure
**Clear, Honest, and Transparent AI Usage**:
During the ideation, development, and debugging phases of this project, we explicitly utilized Artificial Intelligence tools (specifically Claude and Gemini) as collaborative assistants. 

AI was used to:
1. **Architecture Planning:** Assisting with selecting the optimal deployment stack (Vercel for React, Railway for FastAPI) and writing the necessary configuration files (`Procfile`, `.python-version`).
2. **Troubleshooting & Optimization:** Debugging dependency bloat (swapping to CPU-only PyTorch to fit within remote free tiers) and resolving deployment environment variable crashes.
3. **Core Features:** The application itself is entirely centered around AI using the Groq API (LLaMA 3) to function as a domain-expert agent analyzing trade documents via a Retrieval-Augmented Generation (RAG) pipeline built with LangChain and Pinecone.

The foundational idea, UI/UX design decisions, prompt engineering mechanics, and final system integration were guided and implemented by human developers using AI solely to accelerate the coding velocity and resolve technical blockers.

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
