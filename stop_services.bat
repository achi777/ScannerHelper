@echo off
REM Stop Scanner Services

echo =====================================
echo   STOP SCANNER SERVICES
echo =====================================
echo.

echo [INFO] Stopping scanner_helper.exe...
taskkill /F /IM scanner_helper.exe >nul 2>&1
if %errorLevel% == 0 (
    echo [SUCCESS] scanner_helper.exe stopped
) else (
    echo [INFO] scanner_helper.exe was not running
)

echo.
echo [INFO] Stopping php.exe (port 8080)...
taskkill /F /IM php.exe >nul 2>&1
if %errorLevel% == 0 (
    echo [SUCCESS] php.exe stopped
) else (
    echo [INFO] php.exe was not running
)

echo.
echo [INFO] Services stopped!
echo.

pause
