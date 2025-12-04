@echo off
cd /d "%~dp0"
echo.
echo === SERVER BASLATILIYOR ===
echo.
echo Port: 8080
echo URL: http://localhost:8080
echo.
echo Hata mesajlari burada gorunecek...
echo.

set PORT=8080
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [HATA] Server baslatilamadi!
    echo.
    echo Lutfen yukaridaki hata mesajlarini kontrol edin.
    echo.
)

pause

