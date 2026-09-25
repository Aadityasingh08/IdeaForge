Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "               IdeaForge Brand Intelligence             " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Free ports if already in use
Get-NetTCPConnection -LocalPort 5000, 5173 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}

Write-Host "Starting Backend (Port 5000) and Frontend (Port 5173)..." -ForegroundColor Yellow
Write-Host "Opening browser at http://localhost:5173 ..." -ForegroundColor Green
Write-Host ""

Start-Job -ScriptBlock {
    Start-Sleep -Seconds 4
    Start-Process "http://localhost:5173"
} | Out-Null

npm start
