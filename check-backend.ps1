# Quick Backend Connectivity Check
Write-Host "🔍 Checking Backend Connectivity" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Test local .NET backend (HTTP)
Write-Host "Testing Local .NET Backend (HTTP)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5131/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Local .NET Backend (HTTP): Running - Status $($response.StatusCode)" -ForegroundColor Green
    
    # Test API endpoint
    try {
        $apiResponse = Invoke-WebRequest -Uri "http://localhost:5131/api/auth/available-roles" -UseBasicParsing -TimeoutSec 5
        Write-Host "✅ API Endpoint: Working - Status $($apiResponse.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  API Endpoint: Not responding - $($_.Exception.Message)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Local .NET Backend (HTTP): Not running" -ForegroundColor Red
    Write-Host "   Start with: cd StockFlowPro.Web && dotnet run" -ForegroundColor White
}

Write-Host ""

# Test local .NET backend (HTTPS)
Write-Host "Testing Local .NET Backend (HTTPS)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://localhost:7046/health" -UseBasicParsing -TimeoutSec 5 -SkipCertificateCheck
    Write-Host "✅ Local .NET Backend (HTTPS): Running - Status $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Local .NET Backend (HTTPS): Not running" -ForegroundColor Red
    Write-Host "   Start with: cd StockFlowPro.Web && dotnet run --launch-profile https" -ForegroundColor White
}

Write-Host ""

# Test Docker backend
Write-Host "Testing Docker Backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Docker Backend: Running - Status $($response.StatusCode)" -ForegroundColor Green
    
    # Test API endpoint
    try {
        $apiResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/available-roles" -UseBasicParsing -TimeoutSec 5
        Write-Host "✅ Docker API Endpoint: Working - Status $($apiResponse.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Docker API Endpoint: Not responding - $($_.Exception.Message)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Docker Backend: Not running" -ForegroundColor Red
    Write-Host "   Start with: docker-compose up -d" -ForegroundColor White
}

Write-Host ""

# Test frontend
Write-Host "Testing Frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Frontend: Running - Status $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend: Not running" -ForegroundColor Red
    Write-Host "   Start with: cd StockFlowPro.UI && npm run dev" -ForegroundColor White
}

Write-Host ""
Write-Host "💡 Recommendations:" -ForegroundColor Cyan

# Check which backend is running and provide guidance
$localHttpRunning = $false
$localHttpsRunning = $false
$dockerRunning = $false

try {
    Invoke-WebRequest -Uri "http://localhost:5131/health" -UseBasicParsing -TimeoutSec 2 | Out-Null
    $localHttpRunning = $true
} catch { }

try {
    Invoke-WebRequest -Uri "https://localhost:7046/health" -UseBasicParsing -TimeoutSec 2 -SkipCertificateCheck | Out-Null
    $localHttpsRunning = $true
} catch { }

try {
    Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 2 | Out-Null
    $dockerRunning = $true
} catch { }

if ($localHttpRunning) {
    Write-Host "✅ Perfect! Your local .NET backend is running on HTTP (port 5131)" -ForegroundColor Green
    Write-Host "   Frontend is configured to connect to this backend" -ForegroundColor White
    Write-Host "   Start frontend with: cd StockFlowPro.UI && npm run dev" -ForegroundColor White
} elseif ($localHttpsRunning) {
    Write-Host "⚠️  Your local .NET backend is running on HTTPS (port 7046)" -ForegroundColor Yellow
    Write-Host "   But frontend is configured for HTTP (port 5131)" -ForegroundColor White
    Write-Host "   Either:" -ForegroundColor White
    Write-Host "   1. Restart backend with: dotnet run (HTTP)" -ForegroundColor White
    Write-Host "   2. Or update frontend config for HTTPS" -ForegroundColor White
} elseif ($dockerRunning) {
    Write-Host "✅ Docker backend is running" -ForegroundColor Green
    Write-Host "   Start frontend with: cd StockFlowPro.UI && npm run dev:docker" -ForegroundColor White
} else {
    Write-Host "❌ No backend is running!" -ForegroundColor Red
    Write-Host "   Start local backend: cd StockFlowPro.Web && dotnet run" -ForegroundColor White
    Write-Host "   OR start Docker: docker-compose up -d" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit"