@echo off
REM Test scanner_helper in hidden mode

echo =====================================
echo   TEST HIDDEN MODE
echo =====================================
echo.
echo [INFO] Starting scanner_helper in hidden mode...
echo [INFO] The program will run in the background (no window)
echo.

REM Run VBS script
cscript //nologo scanner_service.vbs

echo.
echo [INFO] Service started!
echo.
echo To check if it's running:
echo   1. Open Task Manager (Ctrl+Shift+Esc)
echo   2. Look for "scanner_helper.exe" in Processes
echo.
echo To test the service:
echo   1. Run: php -S localhost:8080
echo   2. Open: http://localhost:8080/index.html
echo   3. Click "Scan Document"
echo.
echo To stop the service:
echo   1. Open Task Manager
echo   2. Find "scanner_helper.exe"
echo   3. Click "End Task"
echo.

pause
