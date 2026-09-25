@echo off
title IdeaForge - Brand Intelligence Workspace
cls
echo ========================================================
echo               IdeaForge Brand Intelligence
echo ========================================================
echo.
echo Freeing ports 5000 and 5173 if busy...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 5000, 5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

echo Starting Backend (Port 5000) and Frontend (Port 5173)...
echo.
echo Opening browser at http://localhost:5173 ...
echo.

start "" powershell -NoProfile -Command "Start-Sleep -Seconds 4; Start-Process 'http://localhost:5173'"

npm start

pause
