@echo off
echo Testing StockFlowPro API...

echo.
echo Checking API health...
curl -s http://localhost:8080/health

echo.
echo.
echo Testing admin login...
curl -s -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@stockflowpro.com\",\"password\":\"SecureAdmin2024!\"}"

echo.
echo.
echo Done!
