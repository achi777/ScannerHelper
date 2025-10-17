@echo off
REM Scanner Helper - Remove from Windows Startup

echo =====================================
echo   SCANNER HELPER - STARTUP REMOVE
echo =====================================
echo.

REM Get startup folder path
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

echo [INFO] Removing scanner helper from startup...
echo [INFO] Startup folder: %STARTUP_FOLDER%

REM Delete VBS script
del "%STARTUP_FOLDER%\scanner_service.vbs" >nul 2>&1

if %errorLevel% == 0 (
    echo.
    echo [SUCCESS] Scanner helper removed from startup!
    echo.
    echo The service will no longer start automatically.
    echo.
    echo To stop running service now:
    echo   1. Open Task Manager (Ctrl+Shift+Esc)
    echo   2. Find "scanner_helper.exe"
    echo   3. Click "End Task"
) else (
    echo.
    echo [INFO] Scanner helper was not installed in startup
    echo or has already been removed.
)

echo.
echo Press any key to exit...
pause >nul
