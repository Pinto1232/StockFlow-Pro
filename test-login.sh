#!/bin/bash

# Test StockFlowPro Login API
echo "Testing StockFlowPro Login API..."

# Test with admin credentials
echo "Testing admin login..."
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stockflowpro.com","password":"SecureAdmin2024!"}' \
  --write-out "\nHTTP Status: %{http_code}\n" \
  --silent

echo ""
echo "Testing manager login..."
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@stockflowpro.com","password":"SecureManager2024!"}' \
  --write-out "\nHTTP Status: %{http_code}\n" \
  --silent

echo ""
echo "Testing API health..."
curl http://localhost:8080/health \
  --write-out "\nHTTP Status: %{http_code}\n" \
  --silent

echo ""
echo "Done!"
