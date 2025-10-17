@echo off
REM Install BOTH Scanner Helper AND PHP Server to Windows Startup

echo =====================================
echo   FULL SCANNER SERVICE INSTALL
echo   Scanner Helper + PHP Server
echo =====================================
echo.

REM Check for admin rights
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [INFO] Running as Administrator
) else (
    echo [WARN] Not running as Administrator
    echo [INFO] Will install for current user only
)

echo.
echo [INFO] This will install:
echo   1. Scanner Helper Service (port 8765)
echo   2. PHP Web Server (port 8080)
echo.
echo Both will start automatically and run hidden.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

REM Get startup folder path
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

echo.
echo [INFO] Startup folder: %STARTUP_FOLDER%
echo.

REM Copy main startup script
echo [INFO] Installing startup script...
copy /Y "%~dp0start_all_hidden.vbs" "%STARTUP_FOLDER%\scanner_full_service.vbs"

if %errorLevel% == 0 (
    echo.
    echo =====================================
    echo [SUCCESS] Installation Complete!
    echo =====================================
    echo.
    echo Both services will start automatically when you log in.
    echo They will run completely hidden (no windows visible).
    echo.
    echo To access the scanner:
    echo   http://localhost:8080/index.html
    echo.
    echo To test now, run:
    echo   start_all_hidden.vbs
    echo.
    echo To check if running:
    echo   1. Open Task Manager (Ctrl+Shift+Esc)
    echo   2. Look for "scanner_helper.exe" and "php.exe"
    echo.
    echo To uninstall:
    echo   uninstall_full_startup.bat
    echo.
) else (
    echo.
    echo [ERROR] Installation failed!
    echo Please check permissions.
)

echo.
echo Press any key to exit...
pause >nul
