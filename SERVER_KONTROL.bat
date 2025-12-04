@echo off
echo.
echo === SERVER DURUM KONTROLU ===
echo.

netstat -ano | findstr :8080 >nul
if %errorlevel% == 0 (
    echo [OK] Server calisiyor!
    echo Port: 8080
    echo URL: http://localhost:8080
    echo.
    echo Tarayicida acabilirsiniz!
) else (
    echo [HATA] Server calismiyor!
    echo.
    echo Server'i baslatmak icin:
    echo   npm run dev
)

echo.
pause

