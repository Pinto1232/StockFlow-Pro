# Frontend Development - Local .NET Backend
Write-Host "🚀 Starting Frontend for Local .NET Development" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Configuring for local .NET backend (https://localhost:7046)..." -ForegroundColor Yellow
Copy-Item ".env.development.local" ".env.local" -Force
Write-Host "✅ Environment configured" -ForegroundColor Green
Write-Host ""

Write-Host "🌐 Make sure your .NET backend is running:" -ForegroundColor Yellow
Write-Host "  cd StockFlowPro.Web" -ForegroundColor White
Write-Host "  dotnet run --launch-profile https" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Starting Vite dev server..." -ForegroundColor Cyan
npm run dev