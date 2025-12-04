@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   GIT REPOSITORY INITIALIZE
echo ========================================
echo.

cd /d "%~dp0"

echo Git repository initialize ediliyor...
git init

echo.
echo Tum dosyalar ekleniyor...
git add .

echo.
echo Ilk commit yapiliyor...
git commit -m "Initial commit: Vercel deployment hazir"

echo.
echo ========================================
echo   TAMAMLANDI!
echo ========================================
echo.
echo Simdi GitHub Desktop'ta:
echo 1. File -^> Add Local Repository
echo 2. Bu klasoru sec: %CD%
echo 3. Dosyalar gorunecek!
echo.
pause

