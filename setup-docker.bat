@echo off
echo 🐳 StockFlow Pro Complete Docker Setup
echo =====================================

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

REM Create environment file if it doesn't exist
if not exist .env (
    echo 📋 Creating environment file...
    copy .env.docker .env
    echo ✅ Environment file created
    echo.
)

echo 🏗️ Building Docker images...
echo This may take several minutes on first run...
echo.

REM Build all images
docker-compose build --no-cache

if %errorlevel% neq 0 (
    echo ❌ Build failed
    echo Check the error messages above
    pause
    exit /b 1
)

echo ✅ Images built successfully
echo.

echo 🚀 Starting StockFlow Pro application stack...
docker-compose up -d

if %errorlevel% neq 0 (
    echo ❌ Failed to start application stack
    pause
    exit /b 1
)

echo ✅ Application stack started
echo.

echo 📊 Starting monitoring stack...
docker-compose -f docker-compose.monitoring.yml up -d

if %errorlevel% neq 0 (
    echo ⚠️ Warning: Monitoring stack failed to start
    echo Application will still work without monitoring
)

echo.
echo 🎉 StockFlow Pro is now running!
echo.
echo 🌐 Available Services:
echo   • Frontend:        http://localhost:3000
echo   • API:             http://localhost:5000
echo   • Swagger:         http://localhost:5000/swagger
echo   • Health Check:    http://localhost:5000/health
echo   • Database:        localhost:1433 (sa/StockFlow123!)
echo   • Redis:           localhost:6379
echo   • Nginx Proxy:     http://localhost:80
echo.
echo 📊 Monitoring (if started):
echo   • Grafana:         http://localhost:3000 (admin/admin123)
echo   • Prometheus:      http://localhost:9090
echo   • AlertManager:    http://localhost:9093
echo.
echo 🔍 Useful Commands:
echo   • View logs:       docker-compose logs -f
echo   • Stop all:        docker-compose down
echo   • Restart:         docker-compose restart
echo   • Check status:    docker-compose ps
echo.

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 15 /nobreak >nul

echo 🔍 Checking service health...
docker-compose ps

echo.
echo 🎯 Next Steps:
echo   1. Open http://localhost:3000 for the frontend
echo   2. Open http://localhost:5000/swagger for API docs
echo   3. Check logs if any service shows as unhealthy
echo   4. Use the login credentials from the documentation
echo.

pause