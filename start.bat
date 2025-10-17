@echo off
REM ====================================
REM  Scanner Helper - Start Script
REM  Rust Edition
REM ====================================

echo.
echo ====================================
echo   DOCUMENT SCANNER HELPER SERVICE
echo   Rust Edition - Windows WIA
echo ====================================
echo.

REM Check if executable exists
if not exist "target\release\scanner_helper.exe" (
    echo [ERROR] scanner_helper.exe not found!
    echo.
    echo Please build the project first:
    echo   1. Run: build.bat
    echo   2. Or: cargo build --release
    echo.
    pause
    exit /b 1
)

echo [INFO] Starting Scanner Helper Service...
echo [INFO] Service will run on http://127.0.0.1:8765
echo.
echo [INFO] To use the web interface:
echo        1. Open a new terminal
echo        2. Run: php -S localhost:8080
echo        3. Open browser: http://localhost:8080/index.html
echo.
echo [INFO] Press Ctrl+C to stop the service
echo.
echo ====================================
echo.

REM Start the scanner helper
target\release\scanner_helper.exe

REM If the program exits, show message
echo.
echo [INFO] Scanner Helper Service stopped
pause
