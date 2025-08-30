# StockFlow-Pro Podman Runner Script
# This script runs your Docker Compose services using Podman

param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "up"
)

$PodmanPath = "C:\Program Files\RedHat\Podman\podman.exe"
$ProjectRoot = $PSScriptRoot

Write-Host "🚀 StockFlow-Pro Podman Runner" -ForegroundColor Green
Write-Host "Action: $Action" -ForegroundColor Yellow

switch ($Action.ToLower()) {
    "up" {
        Write-Host "Starting StockFlow-Pro services..." -ForegroundColor Green
        
        # Create network
        & $PodmanPath network create stockflow-network 2>$null
        
        # Create volumes
        & $PodmanPath volume create mssql-data 2>$null
        & $PodmanPath volume create stockflow-redis-data 2>$null
        & $PodmanPath volume create backend-logs 2>$null
        & $PodmanPath volume create nginx-logs 2>$null
        
        Write-Host "✅ Network and volumes created" -ForegroundColor Green
        
        # Start database first
        Write-Host "🗄️ Starting SQL Server..." -ForegroundColor Yellow
        & $PodmanPath run -d `
            --name stockflow-db `
            --network stockflow-network `
            -p 1433:1433 `
            -e ACCEPT_EULA=Y `
            -e SA_PASSWORD="StockFlow123!" `
            -e MSSQL_PID=Developer `
            -v mssql-data:/var/opt/mssql `
            --build -f Dockerfile.mssql .
        
        # Start Redis
        Write-Host "🔴 Starting Redis..." -ForegroundColor Yellow
        & $PodmanPath run -d `
            --name stockflow-redis `
            --network stockflow-network `
            -p 6379:6379 `
            -v stockflow-redis-data:/data `
            redis:7.4-alpine `
            redis-server --appendonly yes
        
        # Start MailHog
        Write-Host "📧 Starting MailHog..." -ForegroundColor Yellow
        & $PodmanPath run -d `
            --name stockflow-mailhog `
            --network stockflow-network `
            -p 1025:1025 -p 8025:8025 `
            mailhog/mailhog:v1.0.1
        
        Write-Host "✅ Infrastructure services started!" -ForegroundColor Green
        Write-Host "🌐 Access points:" -ForegroundColor Cyan
        Write-Host "  - SQL Server: localhost:1433" -ForegroundColor White
        Write-Host "  - Redis: localhost:6379" -ForegroundColor White
        Write-Host "  - MailHog UI: http://localhost:8025" -ForegroundColor White
    }
    
    "down" {
        Write-Host "Stopping StockFlow-Pro services..." -ForegroundColor Red
        
        # Stop and remove containers
        $containers = @("stockflow-nginx", "stockflow-frontend", "stockflow-api", "stockflow-mailhog", "stockflow-redis", "stockflow-db")
        foreach ($container in $containers) {
            & $PodmanPath stop $container 2>$null
            & $PodmanPath rm $container 2>$null
        }
        
        Write-Host "✅ All services stopped" -ForegroundColor Green
    }
    
    "logs" {
        Write-Host "Showing logs for all services..." -ForegroundColor Yellow
        $containers = @("stockflow-db", "stockflow-redis", "stockflow-mailhog", "stockflow-api", "stockflow-frontend", "stockflow-nginx")
        foreach ($container in $containers) {
            Write-Host "=== $container ===" -ForegroundColor Cyan
            & $PodmanPath logs --tail 10 $container 2>$null
        }
    }
    
    "status" {
        Write-Host "Service Status:" -ForegroundColor Yellow
        & $PodmanPath ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    }
    
    default {
        Write-Host "Usage: .\run-with-podman.ps1 [up|down|logs|status]" -ForegroundColor Yellow
        Write-Host "  up     - Start all services" -ForegroundColor White
        Write-Host "  down   - Stop all services" -ForegroundColor White
        Write-Host "  logs   - Show service logs" -ForegroundColor White
        Write-Host "  status - Show service status" -ForegroundColor White
    }
}