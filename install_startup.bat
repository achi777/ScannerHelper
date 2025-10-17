@echo off
REM Scanner Helper - Install to Windows Startup
REM This script adds scanner_helper to Windows startup

echo =====================================
echo   SCANNER HELPER - STARTUP INSTALL
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
echo [INFO] Installing scanner helper to startup...

REM Get startup folder path
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

echo [INFO] Startup folder: %STARTUP_FOLDER%

REM Copy VBS script to startup
copy /Y "%~dp0scanner_service.vbs" "%STARTUP_FOLDER%\scanner_service.vbs"

if %errorLevel% == 0 (
    echo.
    echo [SUCCESS] Scanner helper installed to startup!
    echo.
    echo The service will start automatically when you log in to Windows.
    echo It will run hidden in the background (no window visible).
    echo.
    echo To test now, run:
    echo   scanner_service.vbs
    echo.
    echo To uninstall, run:
    echo   uninstall_startup.bat
) else (
    echo.
    echo [ERROR] Failed to install!
    echo Please make sure you have permission to write to:
    echo %STARTUP_FOLDER%
)

echo.
echo Press any key to exit...
pause >nul
