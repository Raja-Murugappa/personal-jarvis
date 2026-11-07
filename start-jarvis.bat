@echo off
setlocal enabledelayedexpansion
title Personal JARVIS
cd /d "%~dp0"

where powershell >nul 2>&1
if %ERRORLEVEL% equ 0 (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\launch.ps1"
) else (
    echo [ERROR] PowerShell not found. Starting servers directly...
    pushd "%~dp0backend"
    start "JARVIS Backend (http://127.0.0.1:8000)" cmd /k ".venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
    popd
    pushd "%~dp0frontend"
    start "JARVIS Frontend (http://localhost:5173)" cmd /k "npm run dev"
    popd
    timeout /t 3 >nul
    start http://localhost:5173
    pause
)
