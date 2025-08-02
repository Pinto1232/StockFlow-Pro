# StockFlow Pro Local Development Environment
Write-Host "🚀 Starting StockFlow Pro Local Development Environment" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 This will start:" -ForegroundColor Yellow
Write-Host "  • .NET Backend on https://localhost:7046" -ForegroundColor White
Write-Host "  • React Frontend on http://localhost:5173" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  Make sure you have:" -ForegroundColor Yellow
Write-Host "  • .NET 8 SDK installed" -ForegroundColor White
Write-Host "  • Node.js installed" -ForegroundColor White
Write-Host "  • SQL Server running (or Docker for database)" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue"

Write-Host "🔧 Setting up frontend environment for local development..." -ForegroundColor Yellow
Set-Location "StockFlowPro.UI"
Copy-Item ".env.development.local" ".env.local" -Force
Write-Host "✅ Frontend configured for local backend" -ForegroundColor Green

Write-Host ""
Write-Host "🎯 Starting .NET Backend..." -ForegroundColor Cyan
Write-Host "  Opening new terminal for backend..." -ForegroundColor Gray

# Start backend in new PowerShell window
$backendPath = Join-Path $PSScriptRoot "StockFlowPro.Web"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Starting .NET Backend on https://localhost:7046...' -ForegroundColor Green; dotnet run --launch-profile https"

Write-Host ""
Write-Host "⏳ Waiting 10 seconds for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "🌐 Starting React Frontend..." -ForegroundColor Cyan
Write-Host "  Frontend will be available at: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend API will be available at: https://localhost:7046" -ForegroundColor White
Write-Host ""

# Start frontend
npm run dev

Write-Host ""
Write-Host "🛑 Development servers stopped." -ForegroundColor Red
Read-Host "Press Enter to exit"