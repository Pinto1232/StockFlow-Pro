# PowerShell script to test subscription API endpoints

Write-Host "🔍 Testing StockFlow Pro Subscription API Endpoints" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$BackendUrl = "http://localhost:5131"

Write-Host ""
Write-Host "1. Testing if backend is running..." -ForegroundColor Yellow

try {
    $healthResponse = Invoke-WebRequest -Uri "$BackendUrl/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend is responding (Status: $($healthResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend not responding at $BackendUrl" -ForegroundColor Red
    Write-Host "💡 Start the backend with: cd StockFlowPro.Web && dotnet run" -ForegroundColor Blue
    exit 1
}

Write-Host ""
Write-Host "2. Testing subscription plan endpoints..." -ForegroundColor Yellow

# Test primary endpoint
Write-Host "   Testing /api/subscription-plans..."
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/api/subscription-plans" -ErrorAction Stop
    Write-Host "✅ /api/subscription-plans is working" -ForegroundColor Green
    $preview = $response.Content.Substring(0, [Math]::Min(200, $response.Content.Length))
    Write-Host "📊 Response preview: $preview..." -ForegroundColor Gray
} catch {
    Write-Host "❌ /api/subscription-plans failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test alternative endpoint
Write-Host "   Testing /api/plans..."
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/api/plans" -ErrorAction Stop
    Write-Host "✅ /api/plans is working" -ForegroundColor Green
    $preview = $response.Content.Substring(0, [Math]::Min(200, $response.Content.Length))
    Write-Host "📊 Response preview: $preview..." -ForegroundColor Gray
} catch {
    Write-Host "❌ /api/plans failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test subscriptions endpoint
Write-Host "   Testing /api/subscriptions/plans..."
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/api/subscriptions/plans" -ErrorAction Stop
    Write-Host "✅ /api/subscriptions/plans is working" -ForegroundColor Green
    $preview = $response.Content.Substring(0, [Math]::Min(200, $response.Content.Length))
    Write-Host "📊 Response preview: $preview..." -ForegroundColor Gray
} catch {
    Write-Host "❌ /api/subscriptions/plans failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test specific billing interval
Write-Host "   Testing /api/subscription-plans/billing-interval/Monthly..."
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/api/subscription-plans/billing-interval/Monthly" -ErrorAction Stop
    Write-Host "✅ Monthly billing interval endpoint is working" -ForegroundColor Green
    $preview = $response.Content.Substring(0, [Math]::Min(200, $response.Content.Length))
    Write-Host "📊 Response preview: $preview..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Monthly billing interval endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Database check..." -ForegroundColor Yellow
Write-Host "   Checking subscription plans in database..."

# Test database connection
try {
    $count = sqlcmd -S "(localdb)\MSSQLLocalDB" -d "StockFlowProDb" -h -1 -E -Q "SELECT COUNT(*) FROM SubscriptionPlans WHERE IsActive = 1 AND IsPublic = 1" 2>$null
    $count = $count.Trim()
    if ($count -and [int]$count -gt 0) {
        Write-Host "✅ Found $count active public subscription plans in database" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No active public subscription plans found in database" -ForegroundColor Yellow
        Write-Host "💡 Run the ensure-subscription-plans.sql script to add default plans" -ForegroundColor Blue
    }
} catch {
    Write-Host "⚠️  Could not check database, sqlcmd may not be available" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Summary:" -ForegroundColor Cyan
Write-Host "   - If all endpoints show ✅, the backend API is working correctly"
Write-Host "   - If you see ❌, check that the backend is running and accessible"
Write-Host "   - The frontend should automatically connect to working endpoints"

Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Start frontend: cd StockFlowPro.UI && npm run dev"
Write-Host "   2. Visit: http://localhost:5173"
Write-Host "   3. Check browser console for subscription plan loading logs"
