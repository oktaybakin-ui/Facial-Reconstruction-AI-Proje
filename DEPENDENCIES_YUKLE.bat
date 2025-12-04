@echo off
cd /d "%~dp0"
echo.
echo === DEPENDENCIES YUKLENIYOR ===
echo.
echo Bu islem biraz zaman alabilir...
echo.

call npm install

if %errorlevel% neq 0 (
    echo.
    echo [HATA] Dependencies yuklenemedi!
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo [OK] Dependencies basariyla yuklendi!
    echo.
    pause
)

