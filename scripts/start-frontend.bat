@echo off
echo Starting Job Platform Frontend...
echo.
cd /d "%~dp0..\frontend"
npm run dev
pause