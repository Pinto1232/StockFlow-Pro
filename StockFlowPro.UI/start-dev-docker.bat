@echo off
echo 🚀 Starting Frontend for Docker Development
echo ==========================================
echo.
echo 📋 Configuring for Docker backend (http://localhost:5000)...
copy .env.development.docker .env.local >nul 2>&1
echo ✅ Environment configured
echo.
echo 🐳 Make sure Docker stack is running:
echo   docker-compose up -d
echo.
echo 🎯 Starting Vite dev server...
npm run dev