@echo off
cd /d "%~dp0"
echo.
echo === SERVER BASLATILIYOR ===
echo.
echo Port: 8080
echo URL: http://localhost:8080
echo.
echo Server baslatiliyor, lutfen bekleyin...
echo.

set PORT=8080
npm run dev

pause

