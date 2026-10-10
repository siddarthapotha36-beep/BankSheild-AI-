# BankShield AI - One-Click Launcher for Windows PowerShell
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "         Starting BankShield AI Web App           " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$pythonExe = "C:\Users\LENOVO\AppData\Roaming\uv\python\cpython-3.11.17-windows-x86_64-none\python.exe"
$nodePath = "$env:LOCALAPPDATA\Programs\nodejs"

if (!(Test-Path $pythonExe)) {
    $pythonExe = "python"
}

# 1. Start Backend in a separate window
Write-Host "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; & '$pythonExe' -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

# 2. Start Frontend in a separate window
Write-Host "[2/2] Starting React Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; `$env:PATH = '$nodePath;' + `$env:PATH; npm run dev"

Start-Sleep -Seconds 3

# 3. Open default browser
Write-Host "Opening BankShield AI in your browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host "`nBankShield AI is running!" -ForegroundColor Green
Write-Host "Backend API:  http://127.0.0.1:8000 (Swagger docs at /docs)" -ForegroundColor White
Write-Host "Frontend Web: http://localhost:5173" -ForegroundColor White
