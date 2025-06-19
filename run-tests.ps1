# PowerShell script to run all tests for StockFlowPro User CRUD functionality

Write-Host "========================================" -ForegroundColor Green
Write-Host "StockFlowPro User CRUD Testing Suite" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check prerequisites
Write-Host "`nChecking prerequisites..." -ForegroundColor Yellow

if (-not (Test-Command "dotnet")) {
    Write-Host "ERROR: .NET CLI not found. Please install .NET 8.0 SDK." -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "npm")) {
    Write-Host "WARNING: npm not found. Frontend tests will be skipped." -ForegroundColor Yellow
    $skipFrontend = $true
} else {
    $skipFrontend = $false
}

Write-Host "Prerequisites check completed." -ForegroundColor Green

# Backend Tests
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Running Backend Tests (.NET)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n1. Application Layer Tests..." -ForegroundColor Yellow
try {
    dotnet test StockFlowPro.Application.Tests/StockFlowPro.Application.Tests.csproj --verbosity normal --logger "console;verbosity=detailed"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Application tests passed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Application tests failed!" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error running application tests: $_" -ForegroundColor Red
}

Write-Host "`n2. Web API Tests..." -ForegroundColor Yellow
try {
    dotnet test StockFlowPro.Web.Tests/StockFlowPro.Web.Tests.csproj --verbosity normal --logger "console;verbosity=detailed"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Web API tests passed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Web API tests failed!" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error running web API tests: $_" -ForegroundColor Red
}

# Frontend Tests
if (-not $skipFrontend) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Running Frontend Tests (JavaScript)" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    $frontendTestPath = "StockFlowPro.Web.Tests/Frontend"
    
    if (Test-Path $frontendTestPath) {
        Push-Location $frontendTestPath
        
        Write-Host "`nInstalling frontend test dependencies..." -ForegroundColor Yellow
        try {
            npm install
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Dependencies installed!" -ForegroundColor Green
            } else {
                Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
                Pop-Location
                exit 1
            }
        } catch {
            Write-Host "❌ Error installing dependencies: $_" -ForegroundColor Red
            Pop-Location
            exit 1
        }

        Write-Host "`nRunning frontend tests..." -ForegroundColor Yellow
        try {
            npm test -- --ci --coverage --watchAll=false
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Frontend tests passed!" -ForegroundColor Green
            } else {
                Write-Host "❌ Frontend tests failed!" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Error running frontend tests: $_" -ForegroundColor Red
        }
        
        Pop-Location
    } else {
        Write-Host "❌ Frontend test directory not found: $frontendTestPath" -ForegroundColor Red
    }
} else {
    Write-Host "`n========================================" -ForegroundColor Yellow
    Write-Host "Frontend Tests Skipped (npm not available)" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
}

# Test Coverage Report
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Generating Test Coverage Reports" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nGenerating backend coverage report..." -ForegroundColor Yellow
try {
    dotnet test --collect:"XPlat Code Coverage" --results-directory:"./TestResults"
    Write-Host "✅ Backend coverage report generated in ./TestResults" -ForegroundColor Green
} catch {
    Write-Host "❌ Error generating backend coverage: $_" -ForegroundColor Red
}

# Summary
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Test Execution Summary" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nTest Categories Covered:" -ForegroundColor White
Write-Host "✓ Unit Tests - Application Layer (Handlers, Commands, Queries)" -ForegroundColor Green
Write-Host "✓ Unit Tests - Web API Controllers" -ForegroundColor Green
Write-Host "✓ Integration Tests - HTTP Endpoints" -ForegroundColor Green
if (-not $skipFrontend) {
    Write-Host "✓ Frontend Tests - JavaScript User Management" -ForegroundColor Green
} else {
    Write-Host "⚠ Frontend Tests - Skipped (npm not available)" -ForegroundColor Yellow
}

Write-Host "`nUser CRUD Operations Tested:" -ForegroundColor White
Write-Host "• Create User (POST /api/users)" -ForegroundColor Cyan
Write-Host "• Read User by ID (GET /api/users/{id})" -ForegroundColor Cyan
Write-Host "• Read All Users (GET /api/users)" -ForegroundColor Cyan
Write-Host "• Update User (PUT /api/users/{id})" -ForegroundColor Cyan
Write-Host "• Delete User (DELETE /api/users/{id})" -ForegroundColor Cyan
Write-Host "• Search Users (GET /api/users/search)" -ForegroundColor Cyan
Write-Host "• Toggle User Status (PATCH /api/users/{id}/status)" -ForegroundColor Cyan
Write-Host "• Update User Email (PUT /api/users/{id}/email)" -ForegroundColor Cyan

Write-Host "`nFrontend Features Tested:" -ForegroundColor White
Write-Host "• User table rendering and data display" -ForegroundColor Cyan
Write-Host "• Create/Edit user modal functionality" -ForegroundColor Cyan
Write-Host "• Form validation and error handling" -ForegroundColor Cyan
Write-Host "• AJAX API calls and response handling" -ForegroundColor Cyan
Write-Host "• User role conversion and display" -ForegroundColor Cyan
Write-Host "• HTML escaping for security" -ForegroundColor Cyan

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Testing Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nNext Steps:" -ForegroundColor White
Write-Host "1. Review test results and coverage reports" -ForegroundColor Gray
Write-Host "2. Fix any failing tests" -ForegroundColor Gray
Write-Host "3. Add additional test cases as needed" -ForegroundColor Gray
Write-Host "4. Consider adding E2E tests with tools like Playwright or Selenium" -ForegroundColor Gray