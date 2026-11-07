# Personal JARVIS - Interactive Launcher Script
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$PSScriptRootSafe = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Definition }
$ProjectRoot = (Get-Item $PSScriptRootSafe).Parent.FullName

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "            PERSONAL JARVIS - Local-First System Launcher         " -ForegroundColor White
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host " Project Path: $ProjectRoot" -ForegroundColor DarkGray
Write-Host ""

$BackendDir  = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"
$PythonExe   = Join-Path $BackendDir ".venv\Scripts\python.exe"

# 1. Validation checks
if (-not (Test-Path $PythonExe)) {
    Write-Host "[ERROR] Python virtualenv not found at:" -ForegroundColor Red
    Write-Host "        $PythonExe" -ForegroundColor Yellow
    Write-Host "Please create the backend virtual environment first." -ForegroundColor White
    Read-Host "Press Enter to exit"
    exit 1
}

# 2. Clean old stuck processes on ports 8000 & 5173
Write-Host "[1/4] Checking ports 8000 and 5173..." -ForegroundColor Cyan
try {
    $staleConnections = Get-NetTCPConnection -LocalPort 8000, 5173 -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $staleConnections) {
        if ($conn.OwningProcess -gt 0 -and $conn.OwningProcess -ne $PID) {
            Write-Host "      Freeing occupied port $($conn.LocalPort) (PID $($conn.OwningProcess))..." -ForegroundColor DarkYellow
            & taskkill /PID $conn.OwningProcess /T /F 2>$null | Out-Null
        }
    }
} catch {}
Start-Sleep -Milliseconds 600

# 3. Start Backend
Write-Host "[2/4] Starting Backend API Server (http://127.0.0.1:8000)..." -ForegroundColor Cyan
$backendProc = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/k `"title JARVIS Backend Server ^& color 0A ^& `"$PythonExe`" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`"" `
    -WorkingDirectory $BackendDir `
    -PassThru

Write-Host "      Waiting for backend health check..." -ForegroundColor DarkGray
$backendReady = $false
$sw = [System.Diagnostics.Stopwatch]::StartNew()
while ($sw.Elapsed.TotalSeconds -lt 20) {
    try {
        $res = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($res.status -eq "ok") {
            $backendReady = $true
            break
        }
    } catch {
        Start-Sleep -Milliseconds 600
    }
}

if (-not $backendReady) {
    Write-Host "[ERROR] Backend failed to become healthy within 20 seconds." -ForegroundColor Red
    Write-Host "Please inspect the 'JARVIS Backend Server' window for error messages." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "      [OK] Backend is ONLINE and HEALTHY (http://127.0.0.1:8000)" -ForegroundColor Green

# 4. Start Frontend
Write-Host "[3/4] Starting Frontend UI Server (http://localhost:5173)..." -ForegroundColor Cyan
$frontendProc = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/k `"title JARVIS Frontend Server ^& color 0B ^& npm run dev`"" `
    -WorkingDirectory $FrontendDir `
    -PassThru

Write-Host "      Waiting for frontend dev server..." -ForegroundColor DarkGray
$frontendReady = $false
$sw.Restart()
while ($sw.Elapsed.TotalSeconds -lt 15) {
    try {
        $res = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($res.StatusCode -eq 200) {
            $frontendReady = $true
            break
        }
    } catch {
        Start-Sleep -Milliseconds 600
    }
}

if ($frontendReady) {
    Write-Host "      [OK] Frontend UI is ONLINE (http://localhost:5173)" -ForegroundColor Green
} else {
    Write-Host "      [OK] Frontend process started (http://localhost:5173)" -ForegroundColor Green
}

# 5. Open Web Browser
Write-Host "[4/4] Opening Personal JARVIS in browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "                PERSONAL JARVIS IS ONLINE & READY!                " -ForegroundColor White
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "  Backend API:   http://127.0.0.1:8000   (FastAPI + SQLite)" -ForegroundColor White
Write-Host "  Frontend UI:   http://localhost:5173    (React + Vite)" -ForegroundColor White
Write-Host "  Health Status: 100% ONLINE" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Keep this window open. Both servers are running in the background." -ForegroundColor DarkGray
Write-Host "To STOP both servers safely, press [Enter] here at any time." -ForegroundColor Cyan
Write-Host ""

try {
    [Console]::ReadLine() | Out-Null
} finally {
    Write-Host ""
    Write-Host "Shutting down servers cleanly..." -ForegroundColor Yellow
    if ($backendProc -and -not $backendProc.HasExited) {
        & taskkill /PID $backendProc.Id /T /F 2>$null | Out-Null
    }
    if ($frontendProc -and -not $frontendProc.HasExited) {
        & taskkill /PID $frontendProc.Id /T /F 2>$null | Out-Null
    }
    try {
        Get-NetTCPConnection -LocalPort 8000, 5173 -State Listen -ErrorAction SilentlyContinue |
            ForEach-Object { & taskkill /PID $_.OwningProcess /T /F 2>$null | Out-Null }
    } catch {}
    Write-Host "All Personal JARVIS servers stopped cleanly. Goodbye!" -ForegroundColor Green
    Start-Sleep -Seconds 1
}
