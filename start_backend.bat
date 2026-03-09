@echo off
call .venv\Scripts\activate.bat
echo Starting backend on http://localhost:8000
uvicorn api.main:app --reload
