# Test Backend Connectivity
Write-Host "🔍 Testing StockFlow Pro Backend Connectivity" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "https://localhost:7046"
$apiUrl = "$backendUrl/api"

Write-Host "Testing backend at: $backendUrl" -ForegroundColor Yellow
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "$backendUrl/health" -UseBasicParsing -SkipCertificateCheck
    Write-Host "   ✅ Health Check: $($healthResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Available Roles API
Write-Host "2. Testing Available Roles API..." -ForegroundColor Yellow
try {
    $rolesResponse = Invoke-WebRequest -Uri "$apiUrl/auth/available-roles" -UseBasicParsing -SkipCertificateCheck
    Write-Host "   ✅ Available Roles: $($rolesResponse.StatusCode)" -ForegroundColor Green
    $rolesData = $rolesResponse.Content | ConvertFrom-Json
    Write-Host "   📋 Roles: $($rolesData | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Available Roles Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: CSRF Token
Write-Host "3. Testing CSRF Token..." -ForegroundColor Yellow
try {
    $csrfResponse = Invoke-WebRequest -Uri "$apiUrl/csrf/token" -UseBasicParsing -SkipCertificateCheck -SessionVariable session
    Write-Host "   ✅ CSRF Token: $($csrfResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ CSRF Token Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Login API (with test credentials)
Write-Host "4. Testing Login API..." -ForegroundColor Yellow
try {
    $loginBody = @{
        username = "admin@stockflowpro.com"
        password = "Admin123!"
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "$apiUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing -SkipCertificateCheck -WebSession $session
    Write-Host "   ✅ Login API: $($loginResponse.StatusCode)" -ForegroundColor Green
    
    if ($loginResponse.StatusCode -eq 200) {
        $loginData = $loginResponse.Content | ConvertFrom-Json
        Write-Host "   👤 User: $($loginData.user.firstName) $($loginData.user.lastName)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Login API Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host "   📄 Error Details: $errorContent" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🏁 Backend connectivity test completed!" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 If tests fail:" -ForegroundColor Yellow
Write-Host "   • Make sure the backend is running: dotnet run --launch-profile https" -ForegroundColor White
Write-Host "   • Check if SQL Server/Database is accessible" -ForegroundColor White
Write-Host "   • Verify SSL certificate is trusted: dotnet dev-certs https --trust" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"