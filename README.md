# ASEAN Trade Compass 🧭

**AI-powered cross-border trade assistant for Borneo vendors.**

## 1. Project Details

- **Project Name:** ASEAN Trade Compass
- **What it does:** An intelligent assistant powered by the Groq API designed to help Borneo vendors navigate cross-border trade, including compliance and customs requirements like Form D.
- **Problem it solves:** [TODO: Describe the specific problem your project solves, e.g., simplifying complex ASEAN trade regulations, breaking down language barriers for local vendors, or automating compliance checks.]
- **Key features:**
  - **Q&A Assistant:** Ask questions about cross-border trade rules based on ingested documents.
  - **Compliance Checklist:** Generate actionable compliance checklists for moving goods.
  - **Form D Checker:** AI-powered verification logic for Form D documents.
  - **Document Translation & Drafting:** Create trade letters and translate them seamlessly.
  - **PDF Data Ingestion:** Vector-store backend (ChromaDB) for querying custom trade documents via RAG.
- **Tech stack used:**
  - **Backend:** Python 3.11+, FastAPI, LangChain, ChromaDB, Sentence-Transformers.
  - **Frontend:** Node.js, React 18, Vite, Tailwind CSS.
  - **AI API:** Groq (`llama-3.1-8b-instant`, `llama-3.3-70b-versatile`, `mixtral-8x7b-32768`).

## 2. Setup Instructions

### Prerequisites
- [Python 3.11+](https://python.org)
- [Node.js LTS](https://nodejs.org)
- Free Groq API key from [https://console.groq.com](https://console.groq.com)

### Installation & Running Locally

1. **First-time Setup:**
   Run the setup script to install all Python and Node.js dependencies:
   ```powershell
   .\setup.bat
   ```

2. **Environment Variables:**
   Open the `.env` file in the root directory and replace `your_groq_api_key_here` with your actual Groq API key:
   ```env
   GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
   # Optional: set LLM_MODEL_NAME here to override the default model
   ```

3. **Start the Application:**
   You will need two terminals running simultaneously.
   
   **Terminal 1 — Backend:**
   ```powershell
   .\start_backend.bat
   ```
   
   **Terminal 2 — Frontend:**
   ```powershell
   .\start_frontend.bat
   ```

   Once both are running, open your browser to **http://localhost:5173**.

4. **Load Knowledge Base PDFs (First time only):**
   After the backend is running, ingest the initial data by running:
   ```powershell
   .\ingest_data.bat
   ```
   *(Note: You can place your custom PDFs in the `data/` folder and they will be auto-ingested on startup).*

## 3. AI Disclosure

- **Which AI tools were used:** [TODO: e.g., Claude 3.5 Sonnet, ChatGPT, GitHub Copilot, Cursor IDE]
- **What tasks the AI helped with:** [TODO: e.g., generated React boilerplate, wrote LangChain retrieval functions, designed the Tailwind UI, debugged Vite build errors, etc.]
- **What was written/built manually:** [TODO: e.g., system architecture design, specific prompt engineering for Form D logic, orchestrating the frontend and backend connection, custom component styling.]
- **Any limitations or issues encountered with AI assistance:** [TODO: e.g., AI struggled with correctly formatting the newer LangChain imports, gave outdated React Router syntax that required manual fixing, etc.]
