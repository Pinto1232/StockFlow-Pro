@echo off
echo 🔧 StockFlow Pro Docker Troubleshooting
echo =======================================

echo 🔍 Checking Docker status...
docker --version
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running
    echo Please start Docker Desktop
    goto :end
)
echo ✅ Docker is running

echo.
echo 🔍 Checking container status...
docker-compose ps

echo.
echo 🔍 Checking port usage...
echo Checking port 3000 (Frontend):
netstat -an | findstr :3000
echo Checking port 5000 (API):
netstat -an | findstr :5000
echo Checking port 1433 (Database):
netstat -an | findstr :1433

echo.
echo 🔍 Checking Docker resources...
docker system df

echo.
echo 🔍 Recent container logs (last 50 lines):
echo.
echo === API Logs ===
docker-compose logs --tail=50 stockflow-api

echo.
echo === Frontend Logs ===
docker-compose logs --tail=50 stockflow-frontend

echo.
echo === Database Logs ===
docker-compose logs --tail=50 stockflow-db

echo.
echo 🛠️ Common Solutions:
echo.
echo 1. Restart all containers:
echo    docker-compose restart
echo.
echo 2. Rebuild and restart:
echo    docker-compose down
echo    docker-compose up -d --build
echo.
echo 3. Clean everything and start fresh:
echo    docker-compose down -v
echo    docker system prune -f
echo    docker-compose up -d --build
echo.
echo 4. Check individual service health:
echo    curl http://localhost:5000/health
echo    curl http://localhost:3000/health
echo.
echo 5. View real-time logs:
echo    docker-compose logs -f
echo.

:end
pause