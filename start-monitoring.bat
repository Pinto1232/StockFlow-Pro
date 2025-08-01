@echo off
echo Starting StockFlow Pro Monitoring Stack...
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)

echo Docker is available and running...
echo.

REM Create necessary directories
echo Creating monitoring directories...
if not exist "prometheus\rules" mkdir prometheus\rules
if not exist "grafana\provisioning\datasources" mkdir grafana\provisioning\datasources
if not exist "grafana\provisioning\dashboards" mkdir grafana\provisioning\dashboards
if not exist "grafana\dashboards" mkdir grafana\dashboards
if not exist "loki" mkdir loki
if not exist "promtail" mkdir promtail
if not exist "alertmanager" mkdir alertmanager

echo Directories created successfully.
echo.

REM Copy dashboard to Grafana dashboards directory
echo Copying StockFlow Pro dashboard...
copy "stockflow-dashboard.json" "grafana\dashboards\" >nul 2>&1
if %errorlevel% equ 0 (
    echo Dashboard copied successfully.
) else (
    echo Warning: Could not copy dashboard file.
)
echo.

REM Start the monitoring stack
echo Starting monitoring services with Docker Compose...
echo This may take a few minutes on first run...
echo.

docker-compose -f docker-compose.monitoring.yml up -d

if %errorlevel% equ 0 (
    echo.
    echo ✅ Monitoring stack started successfully!
    echo.
    echo 📊 Access your monitoring services:
    echo    Grafana:      http://localhost:3000 ^(admin/admin123^)
    echo    Prometheus:   http://localhost:9090
    echo    AlertManager: http://localhost:9093
    echo    Loki:         http://localhost:3100
    echo.
    echo 🔧 StockFlow Pro Dashboard:
    echo    The dashboard will automatically load when you access
    echo    the Observability section in your StockFlow Pro backend.
    echo.
    echo 📝 Next steps:
    echo    1. Configure your data sources in Grafana
    echo    2. Import additional dashboards as needed
    echo    3. Set up notification channels for alerts
    echo    4. Configure your .NET application to expose metrics
    echo.
    echo Press any key to view running containers...
    pause >nul
    docker-compose -f docker-compose.monitoring.yml ps
) else (
    echo.
    echo ❌ Failed to start monitoring stack.
    echo Please check the error messages above and try again.
    echo.
    echo Common issues:
    echo - Port conflicts ^(3000, 9090, 9093, 3100^)
    echo - Insufficient disk space
    echo - Docker daemon not running
    echo.
)

echo.
echo Press any key to exit...
pause >nul