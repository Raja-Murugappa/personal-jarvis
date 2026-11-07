@echo off
title Personal JARVIS Launcher
echo ========================================================
echo          Starting Personal JARVIS (Local-First)
echo ========================================================
echo.

echo [1/2] Starting Backend API Server (http://127.0.0.1:8000)...
start "JARVIS Backend (127.0.0.1:8000)" cmd /k "cd /d "%~dp0backend" && .venv\Scripts\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000"

echo [2/2] Starting Frontend UI Server (http://localhost:5173)...
start "JARVIS Frontend (localhost:5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ========================================================
echo  Both servers have been launched in separate windows!
echo  Keep both windows open while using Personal JARVIS.
echo.
echo  App URL: http://localhost:5173
echo ========================================================
echo.
pause

