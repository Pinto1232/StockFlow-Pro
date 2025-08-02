# StockFlow Pro Development Environment Startup Script
Write-Host "🚀 Starting StockFlow Pro Development Environment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

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

# Copy environment file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📋 Creating environment file..." -ForegroundColor Yellow
    Copy-Item ".env.docker" ".env"
    Write-Host "✅ Environment file created from .env.docker" -ForegroundColor Green
    Write-Host ""
}

Write-Host "🐳 Starting development containers..." -ForegroundColor Cyan
Write-Host "This may take a few minutes on first run..." -ForegroundColor Gray
Write-Host ""

# Start the development stack
try {
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ StockFlow Pro development environment started successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Available services:" -ForegroundColor Cyan
        Write-Host "  • Frontend:     http://localhost:3000" -ForegroundColor White
        Write-Host "  • API:          http://localhost:5000" -ForegroundColor White
        Write-Host "  • Swagger:      http://localhost:5000/swagger" -ForegroundColor White
        Write-Host "  • Database:     localhost:1433 (sa/StockFlow123!)" -ForegroundColor White
        Write-Host "  • Redis:        localhost:6379" -ForegroundColor White
        Write-Host "  • MailHog:      http://localhost:8025" -ForegroundColor White
        Write-Host ""
        Write-Host "📊 To start monitoring stack:" -ForegroundColor Yellow
        Write-Host "  .\start-monitoring.ps1" -ForegroundColor White
        Write-Host ""
        Write-Host "🔍 To view logs:" -ForegroundColor Yellow
        Write-Host "  docker-compose logs -f" -ForegroundColor White
        Write-Host ""
        Write-Host "🛑 To stop:" -ForegroundColor Yellow
        Write-Host "  docker-compose down" -ForegroundColor White
        Write-Host ""
        
        # Wait for services to be ready
        Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        # Check service health
        Write-Host "🔍 Checking service health..." -ForegroundColor Yellow
        docker-compose ps
        
    } else {
        throw "Docker compose failed"
    }
} catch {
    Write-Host "❌ Failed to start development environment" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔍 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  • Check Docker Desktop is running" -ForegroundColor White
    Write-Host "  • Ensure ports 3000, 5000, 1433, 6379 are available" -ForegroundColor White
    Write-Host "  • Run: docker-compose logs" -ForegroundColor White
    Write-Host ""
}

Read-Host "Press Enter to continue"