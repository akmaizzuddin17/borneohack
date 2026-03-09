@echo off
echo Ingesting all PDFs into vector database...
curl -X POST http://localhost:8000/api/ingest-all
echo.
echo Done! Your chatbot now has access to all trade documents.
pause
