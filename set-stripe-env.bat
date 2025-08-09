@echo off
echo Setting Stripe environment variables...
set STRIPE_PRICE_MONTHLY=price_1234567890monthly
set STRIPE_PRICE_ANNUAL=price_1234567890annual
echo Environment variables set for current session.
echo.
echo To make these permanent, run:
echo setx STRIPE_PRICE_MONTHLY "price_1234567890monthly"
echo setx STRIPE_PRICE_ANNUAL "price_1234567890annual"
echo.
echo Starting the API server...
cd StockFlowPro.Web
dotnet run