@echo off
echo === StockFlow-Pro Build Cleanup Script ===

REM Kill potentially problematic processes
echo Killing potentially problematic processes...
taskkill /F /IM HashGenerator.exe 2>nul
taskkill /F /IM dotnet.exe 2>nul
taskkill /F /IM MSBuild.exe 2>nul
taskkill /F /IM VBCSCompiler.exe 2>nul

REM Wait for processes to terminate
timeout /t 2 /nobreak >nul

REM Remove problematic directories
echo Removing problematic directories...
if exist "StockFlowPro.Web\HashGenerator" rmdir /s /q "StockFlowPro.Web\HashGenerator"
if exist "StockFlowPro.Web\bin" rmdir /s /q "StockFlowPro.Web\bin"
if exist "StockFlowPro.Web\obj" rmdir /s /q "StockFlowPro.Web\obj"

REM Clean and build
echo Running dotnet clean...
dotnet clean

echo Running dotnet build...
dotnet build

if %ERRORLEVEL% EQU 0 (
    echo === Build completed successfully ===
) else (
    echo === Build failed ===
    exit /b 1
)