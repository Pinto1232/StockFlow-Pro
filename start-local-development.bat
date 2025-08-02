@echo off
echo 🚀 Starting StockFlow Pro Local Development Environment
echo =====================================================
echo.

echo 📋 This will start:
echo   • .NET Backend on https://localhost:7046
echo   • React Frontend on http://localhost:5173
echo.

echo ⚠️  Make sure you have:
echo   • .NET 8 SDK installed
echo   • Node.js installed
echo   • SQL Server running (or Docker for database)
echo.

pause

echo 🔧 Setting up frontend environment for local development...
cd StockFlowPro.UI
copy .env.development.local .env.local >nul 2>&1
echo ✅ Frontend configured for local backend

echo.
echo 🎯 Starting .NET Backend...
echo   Opening new terminal for backend...
start "StockFlow Pro Backend" cmd /k "cd /d %~dp0StockFlowPro.Web && echo Starting .NET Backend on https://localhost:7046... && dotnet run --launch-profile https"

echo.
echo ⏳ Waiting 10 seconds for backend to start...
timeout /t 10 /nobreak >nul

echo.
echo 🌐 Starting React Frontend...
echo   Frontend will be available at: http://localhost:5173
echo   Backend API will be available at: https://localhost:7046
echo.
npm run dev

echo.
echo 🛑 Development servers stopped.
pause