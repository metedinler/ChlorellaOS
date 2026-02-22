@echo off
setlocal

cd /d "%~dp0"
echo ========================================
echo ChlorellaOS Baslatma (Tek Giris)
echo ========================================
echo Ana calistirma noktasi: ChlorellaOS_Launcher.ps1
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File ".\ChlorellaOS_Launcher.ps1"
set "RC=%ERRORLEVEL%"

if %RC% neq 0 (
    echo.
    echo HATA: Baslatma basarisiz (kod: %RC%)
    echo Detay icin debug: powershell -ExecutionPolicy Bypass -File ".\ChlorellaOS_Launcher.ps1" -Debug
    pause
)

exit /b %RC%
