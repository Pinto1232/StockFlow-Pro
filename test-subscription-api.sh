#!/bin/bash

# Script to test subscription API endpoints and ensure they're working

echo "🔍 Testing StockFlow Pro Subscription API Endpoints"
echo "================================================"

# Backend URL
BACKEND_URL="http://localhost:5131"

echo ""
echo "1. Testing if backend is running..."
if curl -s --max-time 5 "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo "✅ Backend is responding"
else
    echo "❌ Backend not responding at $BACKEND_URL"
    echo "💡 Start the backend with: cd StockFlowPro.Web && dotnet run"
    exit 1
fi

echo ""
echo "2. Testing subscription plan endpoints..."

# Test primary endpoint
echo "   Testing /api/subscription-plans..."
RESPONSE=$(curl -s "$BACKEND_URL/api/subscription-plans" 2>/dev/null)
if [ $? -eq 0 ] && [ -n "$RESPONSE" ]; then
    echo "✅ /api/subscription-plans is working"
    echo "📊 Response preview: $(echo "$RESPONSE" | head -c 200)..."
else
    echo "❌ /api/subscription-plans failed"
fi

# Test alternative endpoint
echo "   Testing /api/plans..."
RESPONSE=$(curl -s "$BACKEND_URL/api/plans" 2>/dev/null)
if [ $? -eq 0 ] && [ -n "$RESPONSE" ]; then
    echo "✅ /api/plans is working"
    echo "📊 Response preview: $(echo "$RESPONSE" | head -c 200)..."
else
    echo "❌ /api/plans failed"
fi

# Test subscriptions endpoint
echo "   Testing /api/subscriptions/plans..."
RESPONSE=$(curl -s "$BACKEND_URL/api/subscriptions/plans" 2>/dev/null)
if [ $? -eq 0 ] && [ -n "$RESPONSE" ]; then
    echo "✅ /api/subscriptions/plans is working"
    echo "📊 Response preview: $(echo "$RESPONSE" | head -c 200)..."
else
    echo "❌ /api/subscriptions/plans failed"
fi

# Test specific billing interval
echo "   Testing /api/subscription-plans/billing-interval/Monthly..."
RESPONSE=$(curl -s "$BACKEND_URL/api/subscription-plans/billing-interval/Monthly" 2>/dev/null)
if [ $? -eq 0 ] && [ -n "$RESPONSE" ]; then
    echo "✅ Monthly billing interval endpoint is working"
    echo "📊 Response preview: $(echo "$RESPONSE" | head -c 200)..."
else
    echo "❌ Monthly billing interval endpoint failed"
fi

echo ""
echo "3. Database check..."
echo "   Checking subscription plans in database..."

# Test database connection
if command -v sqlcmd > /dev/null 2>&1; then
    COUNT=$(sqlcmd -S "(localdb)\\MSSQLLocalDB" -d "StockFlowProDb" -h -1 -E -Q "SELECT COUNT(*) FROM SubscriptionPlans WHERE IsActive = 1 AND IsPublic = 1" 2>/dev/null | tr -d '[:space:]')
    if [ -n "$COUNT" ] && [ "$COUNT" -gt 0 ]; then
        echo "✅ Found $COUNT active public subscription plans in database"
    else
        echo "⚠️  No active public subscription plans found in database"
        echo "💡 Run the ensure-subscription-plans.sql script to add default plans"
    fi
else
    echo "⚠️  sqlcmd not available, skipping database check"
fi

echo ""
echo "🎯 Summary:"
echo "   - If all endpoints show ✅, the backend API is working correctly"
echo "   - If you see ❌, check that the backend is running and accessible"
echo "   - The frontend should automatically connect to working endpoints"

echo ""
echo "🚀 Next steps:"
echo "   1. Start frontend: cd StockFlowPro.UI && npm run dev"
echo "   2. Visit: http://localhost:5173"
echo "   3. Check browser console for subscription plan loading logs"
