@echo off
echo ============================================================
echo  ASEAN Trade Compass - Setup (Groq Edition)
echo ============================================================
echo.

python --version >nul 2>&1
if %errorlevel% neq 0 ( echo [ERROR] Python not found. Install from https://python.org && pause && exit /b 1 )

node --version >nul 2>&1
if %errorlevel% neq 0 ( echo [ERROR] Node.js not found. Install from https://nodejs.org && pause && exit /b 1 )

echo [1/3] Creating Python virtual environment...
python -m venv .venv
call .venv\Scripts\activate.bat

echo [2/3] Installing Python packages...
pip install -r requirements.txt

echo [3/3] Installing frontend packages...
cd frontend
call npm install
cd ..

echo.
echo ============================================================
echo  SETUP COMPLETE!
echo.
echo  1. Open .env and paste your Groq API key:
echo     GROQ_API_KEY=your_key_here
echo     Get free key at: https://console.groq.com
echo.
echo  2. Run start_backend.bat  (Terminal 1)
echo  3. Run start_frontend.bat (Terminal 2)
echo  4. Open http://localhost:5173
echo ============================================================
pause
