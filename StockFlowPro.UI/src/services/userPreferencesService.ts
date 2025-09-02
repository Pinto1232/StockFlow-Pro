import { http } from './api/client';

export interface UserPreferences {
  currency: string;
  language: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    shareAnalytics: boolean;
    shareLocation: boolean;
  };
}

export interface CurrencyPreference {
  currency: string;
  autoDetect: boolean;
  lastUpdated: string;
  detectedCurrency?: string;
  manualOverride: boolean;
}

const STORAGE_KEYS = {
  CURRENCY_PREFERENCE: 'stockflow_currency_preference',
  USER_PREFERENCES: 'stockflow_user_preferences',
  GEOLOCATION_CONSENT: 'stockflow_geolocation_consent',
} as const;

// Currency Preference Management
export function getCurrencyPreference(): CurrencyPreference | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENCY_PREFERENCE);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to get currency preference:', error);
  }
  return null;
}

export function setCurrencyPreference(preference: CurrencyPreference): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENCY_PREFERENCE, JSON.stringify({
      ...preference,
      lastUpdated: new Date().toISOString(),
    }));
    console.log('💰 Currency preference saved:', preference);
  } catch (error) {
    console.error('Failed to save currency preference:', error);
  }
}

export function updateCurrencyPreference(updates: Partial<CurrencyPreference>): void {
  const current = getCurrencyPreference();
  const updated = {
    currency: 'USD',
    autoDetect: true,
    lastUpdated: new Date().toISOString(),
    manualOverride: false,
    ...current,
    ...updates,
  };
  setCurrencyPreference(updated);
}

// User Preferences Management (for authenticated users)
export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    // Try to get from backend first
    const response = await http.get<UserPreferences>('/api/user/preferences');
    return response;
  } catch (error) {
    console.warn('Failed to get user preferences from backend, using local storage:', error);
    
    // Fallback to local storage
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (localError) {
      console.error('Failed to get user preferences from local storage:', localError);
    }
  }
  return null;
}

export async function saveUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
  try {
    // Try to save to backend first
    await http.put('/api/user/preferences', preferences);
    console.log('✅ User preferences saved to backend');
  } catch (error) {
    console.warn('Failed to save user preferences to backend, using local storage:', error);
    
    // Fallback to local storage
    try {
      const current = await getUserPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated));
      console.log('✅ User preferences saved to local storage');
    } catch (localError) {
      console.error('Failed to save user preferences to local storage:', localError);
      throw localError;
    }
  }
}

// Geolocation Consent Management
export function getGeolocationConsent(): boolean {
  try {
    const consent = localStorage.getItem(STORAGE_KEYS.GEOLOCATION_CONSENT);
    return consent === 'true';
  } catch (error) {
    console.error('Failed to get geolocation consent:', error);
    return false;
  }
}

export function setGeolocationConsent(consent: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GEOLOCATION_CONSENT, consent.toString());
    console.log('🌍 Geolocation consent updated:', consent);
  } catch (error) {
    console.error('Failed to save geolocation consent:', error);
  }
}

// Default preferences
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  currency: 'USD',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'MM/DD/YYYY',
  numberFormat: 'en-US',
  theme: 'auto',
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  privacy: {
    shareAnalytics: true,
    shareLocation: false,
  },
};

// Utility functions
export function isValidCurrency(currency: string): boolean {
  const validCurrencies = [
    'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'BRL',
    'MXN', 'SGD', 'HKD', 'NZD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF',
    'RUB', 'TRY', 'ZAR', 'KRW', 'THB', 'MYR', 'IDR', 'PHP', 'VND', 'AED',
    'MZN', 'AOA', // Added Mozambique and Angola currencies
  ];
  return validCurrencies.includes(currency.toUpperCase());
}

export function formatPreferenceDate(date: string): string {
  try {
    return new Date(date).toLocaleDateString();
  } catch (error) {
    return 'Unknown';
  }
}

// Migration utilities (for upgrading old preference formats)
export function migrateOldPreferences(): void {
  try {
    // Migrate old currency preference format
    const oldCurrency = localStorage.getItem('stockflow_preferred_currency');
    if (oldCurrency && !getCurrencyPreference()) {
      setCurrencyPreference({
        currency: oldCurrency,
        autoDetect: false,
        lastUpdated: new Date().toISOString(),
        manualOverride: true,
      });
      localStorage.removeItem('stockflow_preferred_currency');
      console.log('🔄 Migrated old currency preference');
    }

    // Migrate other old preferences as needed
    // Add more migration logic here as the app evolves
  } catch (error) {
    console.error('Failed to migrate old preferences:', error);
  }
}

// Initialize preferences on app start
export function initializePreferences(): void {
  try {
    // Run migrations
    migrateOldPreferences();
    
    // Ensure currency preference exists
    if (!getCurrencyPreference()) {
      setCurrencyPreference({
        currency: 'USD',
        autoDetect: true,
        lastUpdated: new Date().toISOString(),
        manualOverride: false,
      });
    }
    
    console.log('✅ User preferences initialized');
  } catch (error) {
    console.error('Failed to initialize preferences:', error);
  }
}

// Export storage keys for testing
export { STORAGE_KEYS };