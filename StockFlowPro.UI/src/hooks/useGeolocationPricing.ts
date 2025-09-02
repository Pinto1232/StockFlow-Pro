import { useState, useEffect, useCallback } from 'react';
import { detectUserLocation, getUserPreferredCurrency, setUserPreferredCurrency, type GeolocationData } from '../services/geoLocationService';
import { convertSubscriptionPlans, getPricingDisplayInfo, type PricingDisplayOptions } from '../utils/priceConverter';
import { getCurrencyInfo } from '../utils/currencyMapping';
import type { SubscriptionPlan } from '../services/subscriptionService';

export interface GeolocationPricingState {
  // Location data
  location: GeolocationData | null;
  isLocationLoading: boolean;
  locationError: string | null;
  
  // Currency data
  currentCurrency: string;
  detectedCurrency: string | null;
  isCurrencyLoading: boolean;
  
  // Pricing data
  convertedPlans: SubscriptionPlan[];
  isPricingLoading: boolean;
  pricingError: string | null;
  
  // Display options
  showOriginalPrices: boolean;
  compactFormat: boolean;
}

export interface GeolocationPricingActions {
  // Currency actions
  setCurrency: (currency: string) => void;
  useDetectedCurrency: () => void;
  
  // Plan conversion actions
  convertPlans: (plans: SubscriptionPlan[], targetCurrency?: string) => Promise<SubscriptionPlan[]>;
  getPlanDisplayInfo: (plan: SubscriptionPlan, options?: PricingDisplayOptions) => Promise<any>;
  
  // Settings actions
  toggleOriginalPrices: () => void;
  toggleCompactFormat: () => void;
  
  // Cache actions
  refreshLocation: () => Promise<void>;
  clearCache: () => void;
}

export interface UseGeolocationPricingOptions {
  autoDetect?: boolean;
  defaultCurrency?: string;
  enableCaching?: boolean;
  showOriginalPrices?: boolean;
  compactFormat?: boolean;
}

export function useGeolocationPricing(
  options: UseGeolocationPricingOptions = {}
): [GeolocationPricingState, GeolocationPricingActions] {
  const {
    autoDetect = true,
    defaultCurrency = 'USD',
    enableCaching = true,
    showOriginalPrices = false,
    compactFormat = false,
  } = options;

  // State
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const [currentCurrency, setCurrentCurrency] = useState<string>(defaultCurrency);
  const [detectedCurrency, setDetectedCurrency] = useState<string | null>(null);
  const [isCurrencyLoading, setIsCurrencyLoading] = useState(false);
  
  const [convertedPlans, setConvertedPlans] = useState<SubscriptionPlan[]>([]);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  
  const [showOriginalPricesState, setShowOriginalPricesState] = useState(showOriginalPrices);
  const [compactFormatState, setCompactFormatState] = useState(compactFormat);

  // Initialize location and currency detection
  useEffect(() => {
    if (autoDetect) {
      initializeGeolocation();
    }
  }, [autoDetect]);

  const initializeGeolocation = async () => {
    try {
      setIsLocationLoading(true);
      setIsCurrencyLoading(true);
      setLocationError(null);

      console.log('🌍 Initializing geolocation pricing...');

      // Detect user location
      const locationData = await detectUserLocation();
      setLocation(locationData);
      setDetectedCurrency(locationData.currency);

      // Get user's preferred currency (may be different from detected)
      const preferredCurrency = await getUserPreferredCurrency();
      setCurrentCurrency(preferredCurrency);

      console.log(`✅ Geolocation pricing initialized: detected=${locationData.currency}, preferred=${preferredCurrency}`);
    } catch (error) {
      console.error('❌ Failed to initialize geolocation pricing:', error);
      setLocationError(error instanceof Error ? error.message : 'Failed to detect location');
      setCurrentCurrency(defaultCurrency);
    } finally {
      setIsLocationLoading(false);
      setIsCurrencyLoading(false);
    }
  };

  // Actions
  const setCurrency = useCallback((currency: string) => {
    console.log(`💰 Setting currency to: ${currency}`);
    setCurrentCurrency(currency);
    setUserPreferredCurrency(currency);
  }, []);

  const useDetectedCurrency = useCallback(() => {
    if (detectedCurrency) {
      setCurrency(detectedCurrency);
    }
  }, [detectedCurrency, setCurrency]);

  const convertPlans = useCallback(async (
    plans: SubscriptionPlan[],
    targetCurrency?: string
  ): Promise<SubscriptionPlan[]> => {
    if (!plans.length) return plans;

    const currency = targetCurrency || currentCurrency;
    
    try {
      setIsPricingLoading(true);
      setPricingError(null);

      console.log(`💱 Converting ${plans.length} plans to ${currency}`);

      const converted = await convertSubscriptionPlans(plans, currency, {
        showOriginalPrice: showOriginalPricesState,
        compactFormat: compactFormatState,
      });

      setConvertedPlans(converted);
      return converted;
    } catch (error) {
      console.error('❌ Failed to convert plans:', error);
      setPricingError(error instanceof Error ? error.message : 'Failed to convert prices');
      return plans; // Return original plans on error
    } finally {
      setIsPricingLoading(false);
    }
  }, [currentCurrency, showOriginalPricesState, compactFormatState]);

  const getPlanDisplayInfo = useCallback(async (
    plan: SubscriptionPlan,
    displayOptions?: PricingDisplayOptions
  ) => {
    const options = {
      showOriginalPrice: showOriginalPricesState,
      compactFormat: compactFormatState,
      includeDisclaimer: true,
      ...displayOptions,
    };

    try {
      return await getPricingDisplayInfo(plan, currentCurrency, options);
    } catch (error) {
      console.error('❌ Failed to get plan display info:', error);
      throw error;
    }
  }, [currentCurrency, showOriginalPricesState, compactFormatState]);

  const toggleOriginalPrices = useCallback(() => {
    setShowOriginalPricesState(prev => !prev);
  }, []);

  const toggleCompactFormat = useCallback(() => {
    setCompactFormatState(prev => !prev);
  }, []);

  const refreshLocation = useCallback(async () => {
    await initializeGeolocation();
  }, []);

  const clearCache = useCallback(() => {
    try {
      // Clear geolocation cache
      localStorage.removeItem('stockflow_geolocation_cache');
      localStorage.removeItem('stockflow_exchange_rates');
      localStorage.removeItem('stockflow_preferred_currency');
      
      console.log('🗑️ Cleared geolocation pricing cache');
      
      // Reset state
      setLocation(null);
      setDetectedCurrency(null);
      setCurrentCurrency(defaultCurrency);
      setConvertedPlans([]);
      
      // Re-initialize if auto-detect is enabled
      if (autoDetect) {
        initializeGeolocation();
      }
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
    }
  }, [autoDetect, defaultCurrency]);

  // State object
  const state: GeolocationPricingState = {
    location,
    isLocationLoading,
    locationError,
    currentCurrency,
    detectedCurrency,
    isCurrencyLoading,
    convertedPlans,
    isPricingLoading,
    pricingError,
    showOriginalPrices: showOriginalPricesState,
    compactFormat: compactFormatState,
  };

  // Actions object
  const actions: GeolocationPricingActions = {
    setCurrency,
    useDetectedCurrency,
    convertPlans,
    getPlanDisplayInfo,
    toggleOriginalPrices,
    toggleCompactFormat,
    refreshLocation,
    clearCache,
  };

  return [state, actions];
}

// Helper hook for currency information
export function useCurrencyInfo(currencyCode?: string) {
  const [currencyInfo, setCurrencyInfo] = useState<any>(null);

  useEffect(() => {
    if (currencyCode) {
      const info = getCurrencyInfo(currencyCode);
      setCurrencyInfo(info);
    }
  }, [currencyCode]);

  return currencyInfo;
}

// Helper hook for detecting if user is in a different currency region
export function useCurrencyMismatch() {
  const [state] = useGeolocationPricing({ autoDetect: true });
  
  return {
    hasMismatch: state.detectedCurrency && state.currentCurrency !== state.detectedCurrency,
    detectedCurrency: state.detectedCurrency,
    currentCurrency: state.currentCurrency,
    detectedCurrencyInfo: state.detectedCurrency ? getCurrencyInfo(state.detectedCurrency) : null,
    currentCurrencyInfo: getCurrencyInfo(state.currentCurrency),
  };
}