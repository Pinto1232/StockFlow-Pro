@echo off
echo 🐳 Fixing Docker and Starting Grafana Monitoring...
echo ================================================
echo.

echo Step 1: Adding Docker to PATH for this session...
set PATH=%PATH%;C:\Program Files\Docker\Docker\resources\bin

echo Step 2: Testing Docker...
docker --version
if %errorlevel% neq 0 (
    echo ❌ Docker not accessible
    echo Please restart your terminal or computer
    pause
    exit /b 1
)

echo ✅ Docker is working!
echo.

echo Step 3: Fixing Docker credential helper...
echo Creating temporary Docker config...
if not exist "%USERPROFILE%\.docker" mkdir "%USERPROFILE%\.docker"

echo { > "%USERPROFILE%\.docker\config.json"
echo   "credsStore": "" >> "%USERPROFILE%\.docker\config.json"
echo } >> "%USERPROFILE%\.docker\config.json"

echo ✅ Docker config updated
echo.

echo Step 4: Starting Grafana container...
echo This will download Grafana (may take a few minutes on first run)...
docker run -d -p 3000:3000 --name grafana grafana/grafana-oss

if %errorlevel% equ 0 (
    echo.
    echo ✅ Grafana started successfully!
    echo.
    echo 📊 Access Grafana at: http://localhost:3000
    echo 🔐 Default login: admin / admin
    echo.
    echo Waiting for Grafana to start up...
    timeout /t 10 /nobreak >nul
    
    echo 🌐 Opening Grafana in your browser...
    start http://localhost:3000
    
    echo.
    echo 📋 Next steps:
    echo 1. Login to Grafana (admin/admin)
    echo 2. Change the default password
    echo 3. Go back to StockFlow Pro and check the Observability section
    echo 4. The dashboard will automatically detect Grafana is running
    echo.
) else (
    echo ❌ Failed to start Grafana
    echo.
    echo Troubleshooting:
    echo 1. Make sure Docker Desktop is running
    echo 2. Check if port 3000 is available
    echo 3. Try restarting Docker Desktop
    echo.
)

echo Press any key to exit...
pause >nul