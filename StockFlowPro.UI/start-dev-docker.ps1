# Frontend Development - Docker Backend
Write-Host "🚀 Starting Frontend for Docker Development" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Configuring for Docker backend (http://localhost:5000)..." -ForegroundColor Yellow
Copy-Item ".env.development.docker" ".env.local" -Force
Write-Host "✅ Environment configured" -ForegroundColor Green
Write-Host ""

Write-Host "🐳 Make sure Docker stack is running:" -ForegroundColor Yellow
Write-Host "  docker-compose up -d" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Starting Vite dev server..." -ForegroundColor Cyan
npm run dev