@echo off
title BankShield AI Launcher
echo ==================================================
echo          Starting BankShield AI Web App           
echo ==================================================

set "PYTHON_EXE=C:\Users\LENOVO\AppData\Roaming\uv\python\cpython-3.11.17-windows-x86_64-none\python.exe"
set "NODE_PATH=%LOCALAPPDATA%\Programs\nodejs"

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000...
start "BankShield AI - Backend" cmd /k "cd /d "%~dp0backend" && "%PYTHON_EXE%" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting React Frontend on http://localhost:5173...
start "BankShield AI - Frontend" cmd /k "cd /d "%~dp0frontend" && set "PATH=%NODE_PATH%;%PATH%" && npm run dev"

timeout /t 3 >nul

echo Opening BankShield AI in your browser...
start http://localhost:5173

echo Done! BankShield AI is running.
pause
