import React, { useState, useEffect } from 'react';
import { useGeolocationPricing, useCurrencyMismatch } from '../hooks/useGeolocationPricing';
import { getPlansByInterval, type SubscriptionPlan } from '../services/subscriptionService';
import { formatCurrencyAmount } from '../utils/currencyMapping';
import CurrencySelector from './CurrencySelector';
import { 
  Globe, MapPin, RefreshCw, AlertCircle, CheckCircle, 
  DollarSign, TrendingUp, Users, Zap 
} from 'lucide-react';

interface GeolocationPricingDemoProps {
  className?: string;
}

const GeolocationPricingDemo: React.FC<GeolocationPricingDemoProps> = ({ className = '' }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<'Monthly' | 'Annual'>('Monthly');

  // Geolocation pricing hook
  const [pricingState, pricingActions] = useGeolocationPricing({
    autoDetect: true,
    showOriginalPrices: true,
    compactFormat: false,
  });

  // Currency mismatch detection
  const currencyMismatch = useCurrencyMismatch();

  // Load plans when currency or interval changes
  useEffect(() => {
    const loadPlans = async () => {
      if (!pricingState.currentCurrency) return;
      
      try {
        setIsLoadingPlans(true);
        console.log(`🔍 Loading ${selectedInterval} plans for demo in ${pricingState.currentCurrency}`);
        
        const fetchedPlans = await getPlansByInterval(selectedInterval, pricingState.currentCurrency);
        const convertedPlans = await pricingActions.convertPlans(fetchedPlans, pricingState.currentCurrency);
        
        setPlans(convertedPlans.slice(0, 2)); // Show only first 2 plans for demo
        console.log(`✅ Demo loaded ${convertedPlans.length} plans`);
      } catch (error) {
        console.error('❌ Failed to load plans for demo:', error);
      } finally {
        setIsLoadingPlans(false);
      }
    };

    loadPlans();
  }, [pricingState.currentCurrency, selectedInterval, pricingActions]);

  const handleCurrencyChange = (newCurrency: string) => {
    pricingActions.setCurrency(newCurrency);
  };

  const handleRefreshLocation = async () => {
    await pricingActions.refreshLocation();
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Globe className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Geolocation Pricing Demo</h3>
        </div>
        <p className="text-gray-600 text-sm">
          Experience automatic currency detection and localized pricing
        </p>
      </div>

      {/* Location Status */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">Location Detection</h4>
          <button
            onClick={handleRefreshLocation}
            disabled={pricingState.isLocationLoading}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${pricingState.isLocationLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        {pricingState.isLocationLoading ? (
          <div className="flex items-center gap-2 text-gray-600">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Detecting your location...</span>
          </div>
        ) : pricingState.location ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-green-500" />
              <span className="text-gray-700">
                <strong>Country:</strong> {pricingState.location.country}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-gray-700">
                <strong>Detected Currency:</strong> {pricingState.detectedCurrency}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-green-500" />
              <span className="text-gray-700">
                <strong>Current Currency:</strong> {pricingState.currentCurrency}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Unable to detect location</span>
          </div>
        )}
      </div>

      {/* Currency Mismatch Warning */}
      {currencyMismatch.hasMismatch && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-amber-800 mb-1">Currency Mismatch Detected</h5>
              <p className="text-sm text-amber-700 mb-2">
                We detected you're in {currencyMismatch.detectedCurrencyInfo?.name}, 
                but you're viewing prices in {currencyMismatch.currentCurrencyInfo?.name}.
              </p>
              <button
                onClick={pricingActions.useDetectedCurrency}
                className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-lg hover:bg-amber-200 transition-colors"
              >
                Switch to {currencyMismatch.detectedCurrency}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Currency Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Currency
        </label>
        <CurrencySelector
          selectedCurrency={pricingState.currentCurrency}
          onCurrencyChange={handleCurrencyChange}
          showLabel={false}
          compact={false}
        />
      </div>

      {/* Billing Interval Toggle */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => setSelectedInterval('Monthly')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedInterval === 'Monthly'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setSelectedInterval('Annual')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedInterval === 'Annual'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Annual
        </button>
      </div>

      {/* Pricing Cards */}
      <div className="space-y-4 mb-6">
        {isLoadingPlans ? (
          // Loading skeleton
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-5 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
                <div className="text-right">
                  <div className="h-6 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-gray-900">{plan.name}</h5>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrencyAmount(plan.price, plan.currency)}
                  </div>
                  <div className="text-sm text-gray-500">
                    per {plan.interval.toLowerCase()}
                  </div>
                  {plan.originalPrice && plan.originalCurrency && (
                    <div className="text-xs text-gray-400 line-through">
                      {formatCurrencyAmount(plan.originalPrice, plan.originalCurrency)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Features */}
      <div className="bg-green-50 rounded-xl p-4">
        <h5 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Geolocation Pricing Features
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-green-700">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Real-time exchange rates</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>Automatic location detection</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>User preference storage</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>Instant currency switching</span>
          </div>
        </div>
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
            Debug Information
          </summary>
          <div className="mt-2 p-3 bg-gray-100 rounded-lg text-xs font-mono">
            <div><strong>Location Loading:</strong> {pricingState.isLocationLoading.toString()}</div>
            <div><strong>Currency Loading:</strong> {pricingState.isCurrencyLoading.toString()}</div>
            <div><strong>Pricing Loading:</strong> {pricingState.isPricingLoading.toString()}</div>
            <div><strong>Location Error:</strong> {pricingState.locationError || 'None'}</div>
            <div><strong>Pricing Error:</strong> {pricingState.pricingError || 'None'}</div>
            <div><strong>Show Original Prices:</strong> {pricingState.showOriginalPrices.toString()}</div>
            <div><strong>Compact Format:</strong> {pricingState.compactFormat.toString()}</div>
          </div>
        </details>
      )}
    </div>
  );
};

export default GeolocationPricingDemo;