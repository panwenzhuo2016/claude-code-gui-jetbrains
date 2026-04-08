@echo off
chcp 65001 >nul 2>&1
setlocal

set ROOT=%~dp0..
cd /d %ROOT%

echo === Installing backend dependencies ===
cd /d %ROOT%\backend
call pnpm install
if %errorlevel% neq 0 (
    echo [ERROR] Backend install failed
    exit /b 1
)

echo === Installing webview dependencies ===
cd /d %ROOT%\webview
call pnpm install
if %errorlevel% neq 0 (
    echo [ERROR] Webview install failed
    exit /b 1
)

echo === Building backend ===
cd /d %ROOT%\backend
call pnpm run build
if %errorlevel% neq 0 (
    echo [ERROR] Backend build failed
    exit /b 1
)

echo === Building webview ===
cd /d %ROOT%\webview
call pnpm run build
if %errorlevel% neq 0 (
    echo [ERROR] Webview build failed
    exit /b 1
)

echo === Building plugin (Gradle) ===
cd /d %ROOT%
call gradlew.bat buildPlugin
if %errorlevel% neq 0 (
    echo [ERROR] Plugin build failed
    exit /b 1
)

echo.
echo === BUILD SUCCESSFUL ===
echo Plugin zip: build\distributions\
dir /b build\distributions\*.zip 2>nul

endlocal
