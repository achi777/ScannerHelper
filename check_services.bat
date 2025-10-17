@echo off
REM Check if Scanner Services are running

echo =====================================
echo   SCANNER SERVICES STATUS
echo =====================================
echo.

echo [INFO] Checking scanner_helper.exe...
tasklist /FI "IMAGENAME eq scanner_helper.exe" 2>NUL | find /I /N "scanner_helper.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [RUNNING] scanner_helper.exe is running
    tasklist /FI "IMAGENAME eq scanner_helper.exe" /FO TABLE
) else (
    echo [STOPPED] scanner_helper.exe is NOT running
)

echo.
echo [INFO] Checking php.exe...
tasklist /FI "IMAGENAME eq php.exe" 2>NUL | find /I /N "php.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [RUNNING] php.exe is running
    tasklist /FI "IMAGENAME eq php.exe" /FO TABLE
) else (
    echo [STOPPED] php.exe is NOT running
)

echo.
echo [INFO] Checking ports...
echo.
netstat -ano | findstr ":8765"
netstat -ano | findstr ":8080"

echo.
echo =====================================
echo.
echo To stop services: stop_services.bat
echo To start services: start_all_hidden.vbs
echo.

pause
