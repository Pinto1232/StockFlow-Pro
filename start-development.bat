@echo off
echo 🚀 Starting StockFlow Pro Development Environment
echo ================================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Docker is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)

echo ✅ Docker is running
echo.

REM Copy environment file if it doesn't exist
if not exist .env (
    echo 📋 Creating environment file...
    copy .env.docker .env
    echo ✅ Environment file created from .env.docker
    echo.
)

echo 🐳 Starting development containers...
echo This may take a few minutes on first run...
echo.

REM Start the development stack
docker-compose up -d

if %errorlevel% equ 0 (
    echo.
    echo ✅ StockFlow Pro development environment started successfully!
    echo.
    echo 🌐 Available services:
    echo   • Frontend:     http://localhost:3000
    echo   • API:          http://localhost:5000
    echo   • Swagger:      http://localhost:5000/swagger
    echo   • Database:     localhost:1433 (sa/StockFlow123!)
    echo   • Redis:        localhost:6379
    echo   • MailHog:      http://localhost:8025
    echo.
    echo 📊 To start monitoring stack:
    echo   start-monitoring.bat
    echo.
    echo 🔍 To view logs:
    echo   docker-compose logs -f
    echo.
    echo 🛑 To stop:
    echo   docker-compose down
    echo.
) else (
    echo ❌ Failed to start development environment
    echo.
    echo 🔍 Troubleshooting:
    echo   • Check Docker Desktop is running
    echo   • Ensure ports 3000, 5000, 1433, 6379 are available
    echo   • Run: docker-compose logs
    echo.
)

pause