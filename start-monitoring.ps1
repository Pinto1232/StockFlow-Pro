# StockFlow Pro Monitoring Stack Startup Script
# PowerShell version for cross-platform support

Write-Host "🚀 Starting StockFlow Pro Monitoring Stack..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
try {
    $dockerVersion = docker --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not found"
    }
    Write-Host "✅ Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Docker is running
try {
    docker info 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Create necessary directories
Write-Host "📁 Creating monitoring directories..." -ForegroundColor Yellow
$directories = @(
    "prometheus\rules",
    "grafana\provisioning\datasources",
    "grafana\provisioning\dashboards", 
    "grafana\dashboards",
    "loki",
    "promtail",
    "alertmanager"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  Created: $dir" -ForegroundColor Gray
    } else {
        Write-Host "  Exists: $dir" -ForegroundColor Gray
    }
}

Write-Host "✅ Directories created successfully" -ForegroundColor Green
Write-Host ""

# Copy dashboard to Grafana dashboards directory
Write-Host "📊 Copying StockFlow Pro dashboard..." -ForegroundColor Yellow
if (Test-Path "stockflow-dashboard.json") {
    try {
        Copy-Item "stockflow-dashboard.json" "grafana\dashboards\" -Force
        Write-Host "✅ Dashboard copied successfully" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Warning: Could not copy dashboard file" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Warning: stockflow-dashboard.json not found" -ForegroundColor Yellow
}

Write-Host ""

# Check for port conflicts
Write-Host "🔍 Checking for port conflicts..." -ForegroundColor Yellow
$ports = @(3000, 9090, 9093, 3100, 9100, 4000, 6379, 9121)
$conflicts = @()

foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $conflicts += $port
    }
}

if ($conflicts.Count -gt 0) {
    Write-Host "⚠️  Warning: The following ports are already in use: $($conflicts -join ', ')" -ForegroundColor Yellow
    Write-Host "   This may cause conflicts with the monitoring stack." -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne 'y' -and $continue -ne 'Y') {
        Write-Host "Aborted by user" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ No port conflicts detected" -ForegroundColor Green
}

Write-Host ""

# Start the monitoring stack
Write-Host "🐳 Starting monitoring services with Docker Compose..." -ForegroundColor Cyan
Write-Host "This may take a few minutes on first run..." -ForegroundColor Gray
Write-Host ""

try {
    docker-compose -f docker-compose.monitoring.yml up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Monitoring stack started successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Access your monitoring services:" -ForegroundColor Cyan
        Write-Host "   Grafana:      http://localhost:3000 (admin/admin123)" -ForegroundColor White
        Write-Host "   Prometheus:   http://localhost:9090" -ForegroundColor White
        Write-Host "   AlertManager: http://localhost:9093" -ForegroundColor White
        Write-Host "   Loki:         http://localhost:3100" -ForegroundColor White
        Write-Host ""
        Write-Host "🔧 StockFlow Pro Dashboard:" -ForegroundColor Cyan
        Write-Host "   The dashboard will automatically load when you access" -ForegroundColor White
        Write-Host "   the Observability section in your StockFlow Pro backend." -ForegroundColor White
        Write-Host ""
        Write-Host "📝 Next steps:" -ForegroundColor Cyan
        Write-Host "   1. Configure your data sources in Grafana" -ForegroundColor White
        Write-Host "   2. Import additional dashboards as needed" -ForegroundColor White
        Write-Host "   3. Set up notification channels for alerts" -ForegroundColor White
        Write-Host "   4. Configure your .NET application to expose metrics" -ForegroundColor White
        Write-Host ""
        
        # Wait for services to be ready
        Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        # Check service health
        Write-Host "🏥 Checking service health..." -ForegroundColor Yellow
        $services = @(
            @{Name="Grafana"; Url="http://localhost:3000/api/health"},
            @{Name="Prometheus"; Url="http://localhost:9090/-/ready"},
            @{Name="AlertManager"; Url="http://localhost:9093/-/ready"}
        )
        
        foreach ($service in $services) {
            try {
                $response = Invoke-WebRequest -Uri $service.Url -TimeoutSec 5 -ErrorAction Stop
                if ($response.StatusCode -eq 200) {
                    Write-Host "   ✅ $($service.Name) is ready" -ForegroundColor Green
                } else {
                    Write-Host "   ⚠️  $($service.Name) responded with status $($response.StatusCode)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "   ❌ $($service.Name) is not ready yet" -ForegroundColor Red
            }
        }
        
        Write-Host ""
        Write-Host "Press Enter to view running containers..."
        Read-Host
        docker-compose -f docker-compose.monitoring.yml ps
        
    } else {
        throw "Docker compose failed"
    }
} catch {
    Write-Host ""
    Write-Host "❌ Failed to start monitoring stack." -ForegroundColor Red
    Write-Host "Please check the error messages above and try again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Cyan
    Write-Host "- Port conflicts (3000, 9090, 9093, 3100)" -ForegroundColor White
    Write-Host "- Insufficient disk space" -ForegroundColor White
    Write-Host "- Docker daemon not running" -ForegroundColor White
    Write-Host "- Missing configuration files" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "Press Enter to exit..."
Read-Host