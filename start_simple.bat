@echo off
setlocal

cd /d "%~dp0"
echo ========================================
echo ChlorellaOS Baslangic (Alias)
echo ========================================
echo Bu script tek giris noktasi olan start.bat dosyasini cagirir.
echo.

call ".\start.bat"
exit /b %ERRORLEVEL%
