# Geolocation-Based Pricing Implementation

This document describes the implementation of geolocation-based pricing in StockFlow Pro, which automatically detects user location and displays prices in their local currency.

## Overview

The geolocation pricing system provides:
- Automatic location detection via IP geolocation
- Currency conversion with real-time exchange rates
- User preference management for manual currency override
- Caching to minimize API calls and improve performance
- Fallback mechanisms for reliability

## Architecture

### Core Components

1. **Geolocation Service** (`services/geoLocationService.ts`)
   - Detects user location using IP-based APIs
   - Manages location caching
   - Provides currency preferences

2. **Price Converter** (`utils/priceConverter.ts`)
   - Handles currency conversion
   - Fetches real-time exchange rates
   - Formats prices for display

3. **Currency Mapping** (`utils/currencyMapping.ts`)
   - Maps countries to currencies
   - Provides currency symbols and formatting
   - Validates currency codes

4. **User Preferences Service** (`services/userPreferencesService.ts`)
   - Manages user currency preferences
   - Handles consent for geolocation
   - Provides preference persistence

5. **Geolocation Pricing Hook** (`hooks/useGeolocationPricing.ts`)
   - React hook for managing pricing state
   - Integrates all services
   - Provides actions for currency management

6. **Currency Selector Component** (`components/CurrencySelector.tsx`)
   - UI component for manual currency selection
   - Shows detected vs. selected currency
   - Provides user-friendly currency switching

## Implementation Details

### Location Detection Flow

1. **Check Cache**: First checks for cached location data (valid for 24 hours)
2. **Primary API**: Uses ipapi.co for location detection
3. **Fallback API**: Falls back to ipinfo.io if primary fails
4. **Browser Hints**: Uses browser language/timezone as final fallback
5. **Default**: Defaults to US/USD if all methods fail

```typescript
const location = await detectUserLocation();
// Returns: { country, countryCode, currency, timezone, ... }
```

### Currency Conversion

1. **Exchange Rates**: Fetches rates from exchangerate-api.com
2. **Caching**: Caches rates for 1 hour to minimize API calls
3. **Fallback**: Uses cached rates if API is unavailable
4. **Error Handling**: Returns original prices if conversion fails

```typescript
const convertedPlans = await convertSubscriptionPlans(plans, 'EUR');
// Converts all plan prices from USD to EUR
```

### User Preferences

Users can:
- Enable/disable automatic currency detection
- Manually select preferred currency
- View original prices alongside converted prices
- Clear cache and refresh location

```typescript
// Set manual currency preference
setUserPreferredCurrency('GBP');

// Enable auto-detection
updateCurrencyPreference({ autoDetect: true });
```

## Usage Examples

### Basic Integration

```tsx
import { useGeolocationPricing } from '../hooks/useGeolocationPricing';
import CurrencySelector from '../components/CurrencySelector';

function PricingPage() {
  const [pricingState, pricingActions] = useGeolocationPricing({
    autoDetect: true,
    showOriginalPrices: false,
  });

  const handleCurrencyChange = (currency: string) => {
    pricingActions.setCurrency(currency);
  };

  return (
    <div>
      <CurrencySelector
        selectedCurrency={pricingState.currentCurrency}
        onCurrencyChange={handleCurrencyChange}
      />
      
      {pricingState.location && (
        <p>Detected location: {pricingState.location.country}</p>
      )}
      
      {/* Display converted plans */}
      {pricingState.convertedPlans.map(plan => (
        <div key={plan.id}>
          <h3>{plan.name}</h3>
          <p>{formatCurrencyAmount(plan.price, plan.currency)}</p>
        </div>
      ))}
    </div>
  );
}
```

### Advanced Usage with Currency Mismatch Detection

```tsx
import { useCurrencyMismatch } from '../hooks/useGeolocationPricing';

function PricingPageWithMismatchDetection() {
  const currencyMismatch = useCurrencyMismatch();

  return (
    <div>
      {currencyMismatch.hasMismatch && (
        <div className="alert">
          We detected you're in {currencyMismatch.detectedCurrencyInfo?.name}.
          <button onClick={() => /* switch currency */}>
            Switch to {currencyMismatch.detectedCurrency}?
          </button>
        </div>
      )}
    </div>
  );
}
```

## API Integration

### Backend Modifications

Update subscription endpoints to accept currency parameters:

```csharp
[HttpGet("billing-interval/{interval}")]
public async Task<ActionResult<List<SubscriptionPlan>>> GetPlansByInterval(
    string interval, 
    [FromQuery] string currency = "USD")
{
    var plans = await _subscriptionService.GetPlansByIntervalAsync(interval);
    
    if (currency != "USD")
    {
        plans = await _currencyService.ConvertPlansAsync(plans, currency);
    }
    
    return Ok(plans);
}
```

### External APIs Used

1. **ipapi.co** - Primary geolocation service
   - Free tier: 1,000 requests/month
   - Provides country, currency, timezone

2. **ipinfo.io** - Fallback geolocation service
   - Free tier: 50,000 requests/month
   - Provides country, region, city

3. **exchangerate-api.com** - Currency conversion
   - Free tier: 1,500 requests/month
   - Real-time exchange rates

## Configuration

### Environment Variables

```env
# Optional: API keys for enhanced limits
REACT_APP_IPAPI_KEY=your_ipapi_key
REACT_APP_IPINFO_TOKEN=your_ipinfo_token
REACT_APP_EXCHANGE_API_KEY=your_exchange_api_key

# Optional: Default currency
REACT_APP_DEFAULT_CURRENCY=USD

# Optional: Enable/disable geolocation
REACT_APP_ENABLE_GEOLOCATION=true
```

### Supported Currencies

The system supports 32+ major currencies:
- USD, EUR, GBP, CAD, AUD, JPY, CHF, CNY, INR, BRL
- MXN, SGD, HKD, NZD, SEK, NOK, DKK, PLN, CZK, HUF
- RUB, TRY, ZAR, KRW, THB, MYR, IDR, PHP, VND, AED
- MZN (Mozambican Metical), AOA (Angolan Kwanza)

## Caching Strategy

### Location Cache
- **Duration**: 24 hours
- **Storage**: localStorage
- **Key**: `stockflow_geolocation_cache`

### Exchange Rate Cache
- **Duration**: 1 hour
- **Storage**: localStorage
- **Key**: `stockflow_exchange_rates`

### User Preferences
- **Duration**: Persistent
- **Storage**: localStorage + backend (for authenticated users)
- **Key**: `stockflow_currency_preference`

## Error Handling

The system includes comprehensive error handling:

1. **API Failures**: Graceful fallbacks to cached data or defaults
2. **Network Issues**: Offline-friendly with cached exchange rates
3. **Invalid Currencies**: Validation and fallback to USD
4. **Storage Errors**: Handles localStorage quota/access issues

## Privacy Considerations

- **IP Detection**: Only detects country-level location, not precise location
- **User Consent**: Respects user preferences for location detection
- **Data Storage**: Minimal data stored locally, no personal information
- **Opt-out**: Users can disable geolocation and set manual preferences

## Performance Optimizations

1. **Lazy Loading**: Location detection only when needed
2. **Debouncing**: Prevents excessive API calls during rapid changes
3. **Caching**: Aggressive caching of location and exchange rate data
4. **Compression**: Minimal data transfer with compressed responses
5. **CDN**: Static currency data served from CDN

## Testing

### Unit Tests

```bash
npm test -- geolocationPricing.test.ts
```

### Integration Tests

```bash
npm test -- --testNamePattern="Integration Tests"
```

### Manual Testing

Use the `GeolocationPricingDemo` component to test functionality:

```tsx
import GeolocationPricingDemo from '../components/GeolocationPricingDemo';

function TestPage() {
  return <GeolocationPricingDemo />;
}
```

## Monitoring and Analytics

### Key Metrics to Track

1. **Location Detection Success Rate**
2. **Currency Conversion Accuracy**
3. **API Response Times**
4. **Cache Hit Rates**
5. **User Currency Preferences**

### Error Monitoring

Monitor these error types:
- Geolocation API failures
- Exchange rate API failures
- Currency conversion errors
- Cache storage errors

## Troubleshooting

### Common Issues

1. **Location Not Detected**
   - Check API keys and rate limits
   - Verify network connectivity
   - Check browser console for errors

2. **Incorrect Currency**
   - Verify country-to-currency mapping
   - Check exchange rate API status
   - Clear cache and retry

3. **Prices Not Converting**
   - Check exchange rate API response
   - Verify currency codes are valid
   - Check for JavaScript errors

### Debug Mode

Enable debug logging in development:

```typescript
localStorage.setItem('stockflow_debug_geolocation', 'true');
```

## Future Enhancements

1. **Regional Pricing**: Different base prices per region
2. **Payment Method Detection**: Show local payment options
3. **Tax Calculation**: Include local taxes in pricing
4. **Multi-language**: Localize currency names and formatting
5. **A/B Testing**: Test different pricing strategies by region

## Security Considerations

1. **API Key Protection**: Store API keys securely on backend
2. **Rate Limiting**: Implement client-side rate limiting
3. **Input Validation**: Validate all currency codes and amounts
4. **XSS Prevention**: Sanitize all user inputs and API responses

## Compliance

- **GDPR**: Minimal data collection, user consent for location
- **CCPA**: Clear privacy policy, opt-out mechanisms
- **PCI DSS**: No payment data stored in geolocation system

## Support

For issues or questions about the geolocation pricing system:

1. Check this documentation
2. Review the test files for usage examples
3. Check browser console for error messages
4. Contact the development team with specific error details