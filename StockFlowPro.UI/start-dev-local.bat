@echo off
echo 🚀 Starting Frontend for Local .NET Development
echo ===============================================
echo.
echo 📋 Configuring for local .NET backend (https://localhost:7046)...
copy .env.development.local .env.local >nul 2>&1
echo ✅ Environment configured
echo.
echo 🌐 Make sure your .NET backend is running:
echo   cd StockFlowPro.Web
echo   dotnet run --launch-profile https
echo.
echo 🎯 Starting Vite dev server...
npm run dev