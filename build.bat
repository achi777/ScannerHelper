@echo off
REM ====================================
REM  Scanner Helper - Rust Build Script
REM ====================================

echo.
echo ====================================
echo   Building Scanner Helper (Rust)
echo   Windows WIA Edition
echo ====================================
echo.

REM Check if Rust is installed
where cargo >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Rust is not installed or not in PATH
    echo.
    echo Please install Rust from: https://rustup.rs/
    echo.
    echo After installation, run:
    echo   rustup default stable
    echo.
    pause
    exit /b 1
)

echo [INFO] Checking Rust version...
cargo --version
rustc --version
echo.

REM Clean previous builds (optional)
if exist "target\" (
    echo [INFO] Cleaning previous build...
    cargo clean
    echo.
)

echo [INFO] Building in Release mode (optimized)...
echo [INFO] This may take a few minutes on first build...
echo.

cargo build --release

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ====================================
    echo   BUILD FAILED!
    echo ====================================
    echo.
    echo Check the error messages above.
    echo.
    echo Common issues:
    echo  - Missing Visual Studio Build Tools
    echo  - Missing Windows SDK
    echo  - Network issues downloading dependencies
    echo.
    pause
    exit /b 1
)

echo.
echo ====================================
echo   BUILD SUCCESSFUL!
echo ====================================
echo.

if exist "target\release\scanner_helper.exe" (
    echo [SUCCESS] Binary created: target\release\scanner_helper.exe
    echo.

    REM Show file size
    for %%I in (target\release\scanner_helper.exe) do echo File size: %%~zI bytes
    echo.

    echo To start the scanner service:
    echo   1. Run: start.bat
    echo   2. Or: target\release\scanner_helper.exe
    echo.
) else (
    echo [WARNING] scanner_helper.exe not found in expected location
    echo.
)

pause
