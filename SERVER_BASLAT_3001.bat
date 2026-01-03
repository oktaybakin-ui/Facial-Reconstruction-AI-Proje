@echo off
echo Starting development server on port 3001...
cd /d "%~dp0"
npm run dev -- -p 3001
pause

