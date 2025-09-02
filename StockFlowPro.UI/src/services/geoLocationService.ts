/**
 * Geolocation Service for detecting user's location and currency preferences
 * Uses IP-based geolocation with caching to avoid repeated API calls
 */

import { 
  getCurrencyPreference, 
  setCurrencyPreference, 
  updateCurrencyPreference,
  getGeolocationConsent,
  setGeolocationConsent,
  type CurrencyPreference 
} from './userPreferencesService';

export interface GeolocationData {
  country: string;
  countryCode: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  ip?: string;
  city?: string;
  region?: string;
}

export interface GeolocationCache {
  data: GeolocationData;
  timestamp: number;
  expiresAt: number;
}

// Cache duration: 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const CACHE_KEY = 'stockflow_geolocation_cache';

/**
 * Get cached geolocation data if available and not expired
 */
function getCachedGeolocation(): GeolocationData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cacheData: GeolocationCache = JSON.parse(cached);
    
    // Check if cache is still valid
    if (Date.now() < cacheData.expiresAt) {
      console.log('🌍 Using cached geolocation data:', cacheData.data);
      return cacheData.data;
    } else {
      // Cache expired, remove it
      localStorage.removeItem(CACHE_KEY);
      console.log('🕒 Geolocation cache expired, will fetch fresh data');
      return null;
    }
  } catch (error) {
    console.warn('⚠️ Failed to read geolocation cache:', error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

/**
 * Cache geolocation data with expiration
 */
function cacheGeolocation(data: GeolocationData): void {
  try {
    const cacheData: GeolocationCache = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION,
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log('💾 Cached geolocation data for 24 hours');
  } catch (error) {
    console.warn('⚠️ Failed to cache geolocation data:', error);
  }
}

/**
 * Detect user's geolocation using ipapi.co (free tier: 1000 requests/day)
 */
async function detectLocationWithIpApi(): Promise<GeolocationData | null> {
  try {
    console.log('🌍 Detecting location using ipapi.co...');
    
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check for API error response
    if (data.error) {
      throw new Error(`API Error: ${data.reason || data.error}`);
    }

    const geolocationData: GeolocationData = {
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'US',
      currency: data.currency || 'USD',
      currencySymbol: getCurrencySymbol(data.currency || 'USD'),
      timezone: data.timezone || 'UTC',
      ip: data.ip,
      city: data.city,
      region: data.region,
    };

    console.log('✅ Successfully detected location:', geolocationData);
    return geolocationData;
  } catch (error) {
    console.warn('❌ Failed to detect location with ipapi.co:', error);
    return null;
  }
}

/**
 * Fallback geolocation detection using ipinfo.io (free tier: 50,000 requests/month)
 */
async function detectLocationWithIpInfo(): Promise<GeolocationData | null> {
  try {
    console.log('🌍 Detecting location using ipinfo.io...');
    
    const response = await fetch('https://ipinfo.io/json', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // ipinfo.io doesn't provide currency directly, so we map from country code
    const currency = getCurrencyFromCountryCode(data.country || 'US');
    
    const geolocationData: GeolocationData = {
      country: getCountryName(data.country || 'US'),
      countryCode: data.country || 'US',
      currency: currency,
      currencySymbol: getCurrencySymbol(currency),
      timezone: data.timezone || 'UTC',
      ip: data.ip,
      city: data.city,
      region: data.region,
    };

    console.log('✅ Successfully detected location with fallback:', geolocationData);
    return geolocationData;
  } catch (error) {
    console.warn('❌ Failed to detect location with ipinfo.io:', error);
    return null;
  }
}

/**
 * Get browser-based location hints as final fallback
 */
function getBrowserLocationHints(): GeolocationData {
  // Use browser language and timezone as hints
  const browserLang = navigator.language || 'en-US';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Try to infer country from browser language
  let countryCode = 'US';
  let currency = 'USD';
  
  if (browserLang.includes('-')) {
    const langCountry = browserLang.split('-')[1].toUpperCase();
    if (langCountry.length === 2) {
      countryCode = langCountry;
      currency = getCurrencyFromCountryCode(countryCode);
    }
  }

  const geolocationData: GeolocationData = {
    country: getCountryName(countryCode),
    countryCode: countryCode,
    currency: currency,
    currencySymbol: getCurrencySymbol(currency),
    timezone: timezone,
  };

  console.log('🌐 Using browser-based location hints:', geolocationData);
  return geolocationData;
}

/**
 * Main function to detect user's geolocation with multiple fallbacks
 */
export async function detectUserLocation(): Promise<GeolocationData> {
  // First, check cache
  const cached = getCachedGeolocation();
  if (cached) {
    return cached;
  }

  // Try primary geolocation service
  let locationData = await detectLocationWithIpApi();
  
  // Try fallback service if primary fails
  if (!locationData) {
    locationData = await detectLocationWithIpInfo();
  }
  
  // Use browser hints as final fallback
  if (!locationData) {
    console.log('🚨 All geolocation services failed, using browser hints');
    locationData = getBrowserLocationHints();
  }

  // Cache the result
  cacheGeolocation(locationData);
  
  return locationData;
}

/**
 * Get user's preferred currency (from preferences or detected location)
 */
export async function getUserPreferredCurrency(): Promise<string> {
  try {
    // Check user preferences first
    const currencyPref = getCurrencyPreference();
    
    if (currencyPref && !currencyPref.autoDetect) {
      // User has manually set a currency preference
      console.log('💰 Using user-preferred currency:', currencyPref.currency);
      return currencyPref.currency;
    }

    // Auto-detect from location
    const location = await detectUserLocation();
    
    // Update preference with detected currency if auto-detect is enabled
    if (currencyPref?.autoDetect || !currencyPref) {
      updateCurrencyPreference({
        currency: location.currency,
        detectedCurrency: location.currency,
        autoDetect: true,
        manualOverride: false,
      });
    }
    
    console.log('🌍 Using detected currency:', location.currency);
    return location.currency;
  } catch (error) {
    console.error('❌ Failed to get user preferred currency:', error);
    return 'USD'; // Default fallback
  }
}

/**
 * Set user's preferred currency (stores in preferences)
 */
export function setUserPreferredCurrency(currency: string): void {
  try {
    updateCurrencyPreference({
      currency: currency.toUpperCase(),
      autoDetect: false,
      manualOverride: true,
    });
    console.log('� User preferred currency set to:', currency);
  } catch (error) {
    console.error('❌ Failed to set user preferred currency:', error);
  }
}

/**
 * Clear cached geolocation data (useful for testing or privacy)
 */
export function clearGeolocationCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem('stockflow_preferred_currency');
    console.log('🗑️ Cleared geolocation cache and currency preference');
  } catch (error) {
    console.warn('⚠️ Failed to clear geolocation cache:', error);
  }
}

/**
 * Get currency symbol for a given currency code
 */
function getCurrencySymbol(currencyCode: string): string {
  const symbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF',
    'CNY': '¥',
    'SEK': 'kr',
    'NZD': 'NZ$',
    'MXN': '$',
    'SGD': 'S$',
    'HKD': 'HK$',
    'NOK': 'kr',
    'ZAR': 'R',
    'INR': '₹',
    'BRL': 'R$',
    'RUB': '₽',
    'KRW': '₩',
    'TRY': '₺',
  };
  
  return symbols[currencyCode.toUpperCase()] || currencyCode;
}

/**
 * Get currency code from country code
 */
function getCurrencyFromCountryCode(countryCode: string): string {
  const currencyMap: { [key: string]: string } = {
    'US': 'USD', 'CA': 'CAD', 'GB': 'GBP', 'AU': 'AUD', 'NZ': 'NZD',
    'JP': 'JPY', 'CN': 'CNY', 'KR': 'KRW', 'IN': 'INR', 'SG': 'SGD',
    'HK': 'HKD', 'CH': 'CHF', 'SE': 'SEK', 'NO': 'NOK', 'DK': 'DKK',
    'ZA': 'ZAR', 'BR': 'BRL', 'MX': 'MXN', 'RU': 'RUB', 'TR': 'TRY',
    // European Union countries
    'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR',
    'BE': 'EUR', 'AT': 'EUR', 'PT': 'EUR', 'IE': 'EUR', 'FI': 'EUR',
    'GR': 'EUR', 'LU': 'EUR', 'MT': 'EUR', 'CY': 'EUR', 'SK': 'EUR',
    'SI': 'EUR', 'EE': 'EUR', 'LV': 'EUR', 'LT': 'EUR',
  };
  
  return currencyMap[countryCode.toUpperCase()] || 'USD';
}

/**
 * Get country name from country code
 */
function getCountryName(countryCode: string): string {
  const countryNames: { [key: string]: string } = {
    'US': 'United States', 'CA': 'Canada', 'GB': 'United Kingdom',
    'AU': 'Australia', 'NZ': 'New Zealand', 'JP': 'Japan', 'CN': 'China',
    'KR': 'South Korea', 'IN': 'India', 'SG': 'Singapore', 'HK': 'Hong Kong',
    'CH': 'Switzerland', 'SE': 'Sweden', 'NO': 'Norway', 'DK': 'Denmark',
    'ZA': 'South Africa', 'BR': 'Brazil', 'MX': 'Mexico', 'RU': 'Russia',
    'TR': 'Turkey', 'DE': 'Germany', 'FR': 'France', 'IT': 'Italy',
    'ES': 'Spain', 'NL': 'Netherlands', 'BE': 'Belgium', 'AT': 'Austria',
    'PT': 'Portugal', 'IE': 'Ireland', 'FI': 'Finland', 'GR': 'Greece',
  };
  
  return countryNames[countryCode.toUpperCase()] || 'Unknown';
}