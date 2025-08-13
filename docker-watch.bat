@echo off
REM StockFlow-Pro Docker Watch Script for Windows
REM This script starts Docker Compose in watch mode for automatic rebuilds

echo 🚀 Starting StockFlow-Pro with Docker Compose Watch...
echo This will automatically rebuild containers when you make changes to your code.
echo.
echo Services that will be watched:
echo   📱 Frontend (React/TypeScript) - Hot reload on source changes
echo   🔧 Backend (ASP.NET Core) - Rebuild on C# source changes
echo.
echo Press Ctrl+C to stop all services
echo.

REM Start Docker Compose in watch mode
docker compose watch

echo.
echo ✅ Docker Compose Watch stopped. All containers have been stopped.
