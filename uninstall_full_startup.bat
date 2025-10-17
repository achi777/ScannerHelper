@echo off
REM Uninstall Scanner Services from Windows Startup

echo =====================================
echo   SCANNER SERVICE - UNINSTALL
echo =====================================
echo.

REM Get startup folder path
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

echo [INFO] Removing scanner services from startup...

REM Delete startup scripts
del "%STARTUP_FOLDER%\scanner_service.vbs" >nul 2>&1
del "%STARTUP_FOLDER%\scanner_full_service.vbs" >nul 2>&1

echo.
echo [SUCCESS] Scanner services removed from startup!
echo.
echo The services will no longer start automatically.
echo.
echo To stop currently running services:
echo   1. Open Task Manager (Ctrl+Shift+Esc)
echo   2. Find "scanner_helper.exe" and "php.exe"
echo   3. Click "End Task" for each
echo.
echo Or run: stop_services.bat
echo.

pause
