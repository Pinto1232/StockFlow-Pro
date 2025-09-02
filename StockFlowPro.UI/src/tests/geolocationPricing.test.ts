import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { detectUserLocation, getUserPreferredCurrency, setUserPreferredCurrency } from '../services/geoLocationService';
import { convertSubscriptionPlans, getPricingDisplayInfo } from '../utils/priceConverter';
import { formatCurrencyAmount, getCurrencyInfo } from '../utils/currencyMapping';
import { getCurrencyPreference, setCurrencyPreference, initializePreferences } from '../services/userPreferencesService';
import type { SubscriptionPlan } from '../services/subscriptionService';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock subscription plans for testing
const mockPlans: SubscriptionPlan[] = [
  {
    id: 'basic-monthly',
    name: 'Basic',
    description: 'Perfect for small teams',
    price: 29.99,
    currency: 'USD',
    interval: 'Monthly',
    features: ['Up to 10 employees', 'Basic reporting', 'Email support'],
    isPopular: false,
    sortOrder: 1,
  },
  {
    id: 'pro-monthly',
    name: 'Professional',
    description: 'Great for growing businesses',
    price: 59.99,
    currency: 'USD',
    interval: 'Monthly',
    features: ['Up to 50 employees', 'Advanced reporting', 'Priority support'],
    isPopular: true,
    sortOrder: 2,
  },
  {
    id: 'enterprise-monthly',
    name: 'Enterprise',
    description: 'For large organizations',
    price: 99.99,
    currency: 'USD',
    interval: 'Monthly',
    features: ['Unlimited employees', 'Custom integrations', '24/7 support'],
    isPopular: false,
    sortOrder: 3,
  },
];

describe('Geolocation Pricing System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('User Preferences', () => {
    it('should initialize preferences correctly', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      initializePreferences();
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'stockflow_currency_preference',
        expect.stringContaining('"currency":"USD"')
      );
    });

    it('should get currency preference from storage', () => {
      const mockPreference = {
        currency: 'EUR',
        autoDetect: false,
        lastUpdated: '2024-01-01T00:00:00.000Z',
        manualOverride: true,
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockPreference));
      
      const preference = getCurrencyPreference();
      
      expect(preference).toEqual(mockPreference);
    });

    it('should set currency preference', () => {
      const preference = {
        currency: 'GBP',
        autoDetect: false,
        lastUpdated: '2024-01-01T00:00:00.000Z',
        manualOverride: true,
      };
      
      setCurrencyPreference(preference);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'stockflow_currency_preference',
        expect.stringContaining('"currency":"GBP"')
      );
    });
  });

  describe('Geolocation Detection', () => {
    it('should detect user location from IP', async () => {
      const mockResponse = {
        country: 'United Kingdom',
        country_code: 'GB',
        currency: 'GBP',
        timezone: 'Europe/London',
        ip: '192.168.1.1',
        city: 'London',
        region: 'England',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const location = await detectUserLocation();

      expect(location).toEqual({
        country: 'United Kingdom',
        countryCode: 'GB',
        currency: 'GBP',
        currencySymbol: '£',
        timezone: 'Europe/London',
        ip: '192.168.1.1',
        city: 'London',
        region: 'England',
      });
    });

    it('should detect Mozambique location correctly', async () => {
      const mockResponse = {
        country: 'Mozambique',
        country_code: 'MZ',
        currency: 'MZN',
        timezone: 'Africa/Maputo',
        ip: '196.28.64.1',
        city: 'Maputo',
        region: 'Maputo',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const location = await detectUserLocation();

      expect(location).toEqual({
        country: 'Mozambique',
        countryCode: 'MZ',
        currency: 'MZN',
        currencySymbol: 'MT',
        timezone: 'Africa/Maputo',
        ip: '196.28.64.1',
        city: 'Maputo',
        region: 'Maputo',
      });
    });

    it('should detect Angola location correctly', async () => {
      const mockResponse = {
        country: 'Angola',
        country_code: 'AO',
        currency: 'AOA',
        timezone: 'Africa/Luanda',
        ip: '154.73.220.1',
        city: 'Luanda',
        region: 'Luanda',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const location = await detectUserLocation();

      expect(location).toEqual({
        country: 'Angola',
        countryCode: 'AO',
        currency: 'AOA',
        currencySymbol: 'Kz',
        timezone: 'Africa/Luanda',
        ip: '154.73.220.1',
        city: 'Luanda',
        region: 'Luanda',
      });
    });

    it('should use cached location data when available', async () => {
      const cachedData = {
        data: {
          country: 'Canada',
          countryCode: 'CA',
          currency: 'CAD',
          currencySymbol: '$',
          timezone: 'America/Toronto',
        },
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData));

      const location = await detectUserLocation();

      expect(location).toEqual(cachedData.data);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fallback to browser hints when API fails', async () => {
      (global.fetch as any).mockRejectedValue(new Error('API failed'));

      // Mock navigator.language
      Object.defineProperty(navigator, 'language', {
        value: 'en-AU',
        configurable: true,
      });

      const location = await detectUserLocation();

      expect(location.countryCode).toBe('AU');
      expect(location.currency).toBe('AUD');
    });
  });

  describe('Currency Conversion', () => {
    it('should convert subscription plans to target currency', async () => {
      const mockExchangeRates = {
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ rates: mockExchangeRates }),
      });

      const convertedPlans = await convertSubscriptionPlans(mockPlans, 'EUR');

      expect(convertedPlans[0].currency).toBe('EUR');
      expect(convertedPlans[0].price).toBeCloseTo(29.99 * 0.85, 2);
    });

    it('should handle conversion errors gracefully', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Exchange rate API failed'));

      const convertedPlans = await convertSubscriptionPlans(mockPlans, 'EUR');

      // Should return original plans when conversion fails
      expect(convertedPlans).toEqual(mockPlans);
    });

    it('should format currency amounts correctly', () => {
      expect(formatCurrencyAmount(29.99, 'USD')).toBe('$29.99');
      expect(formatCurrencyAmount(25.49, 'EUR')).toBe('€25.49');
      expect(formatCurrencyAmount(21.89, 'GBP')).toBe('£21.89');
    });

    it('should get currency information', () => {
      const usdInfo = getCurrencyInfo('USD');
      expect(usdInfo).toEqual({
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        decimals: 2,
        locale: 'en-US',
      });

      const eurInfo = getCurrencyInfo('EUR');
      expect(eurInfo).toEqual({
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        decimals: 2,
        locale: 'de-DE',
      });

      // Test new African currencies
      const mznInfo = getCurrencyInfo('MZN');
      expect(mznInfo).toEqual({
        code: 'MZN',
        name: 'Mozambican Metical',
        symbol: 'MT',
        decimals: 2,
        locale: 'pt-MZ',
      });

      const aoaInfo = getCurrencyInfo('AOA');
      expect(aoaInfo).toEqual({
        code: 'AOA',
        name: 'Angolan Kwanza',
        symbol: 'Kz',
        decimals: 2,
        locale: 'pt-AO',
      });
    });
  });

  describe('Pricing Display', () => {
    it('should generate correct pricing display info', async () => {
      const displayInfo = await getPricingDisplayInfo(
        mockPlans[0],
        'USD',
        { showOriginalPrice: false, compactFormat: false }
      );

      expect(displayInfo).toEqual({
        formattedPrice: '$29.99',
        currency: 'USD',
        interval: 'Monthly',
        originalPrice: null,
        conversionRate: null,
        disclaimer: null,
      });
    });

    it('should show original price when converted', async () => {
      const convertedPlan = { ...mockPlans[0], price: 25.49, currency: 'EUR', originalPrice: 29.99, originalCurrency: 'USD' };

      const displayInfo = await getPricingDisplayInfo(
        convertedPlan,
        'EUR',
        { showOriginalPrice: true, compactFormat: false }
      );

      expect(displayInfo.originalPrice).toBe('$29.99');
      expect(displayInfo.formattedPrice).toBe('€25.49');
    });
  });

  describe('User Preferred Currency', () => {
    it('should return user preferred currency when set manually', async () => {
      const mockPreference = {
        currency: 'CAD',
        autoDetect: false,
        lastUpdated: '2024-01-01T00:00:00.000Z',
        manualOverride: true,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockPreference));

      const currency = await getUserPreferredCurrency();

      expect(currency).toBe('CAD');
    });

    it('should detect currency from location when auto-detect is enabled', async () => {
      const mockPreference = {
        currency: 'USD',
        autoDetect: true,
        lastUpdated: '2024-01-01T00:00:00.000Z',
        manualOverride: false,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockPreference));

      const mockLocationResponse = {
        country: 'Japan',
        country_code: 'JP',
        currency: 'JPY',
        timezone: 'Asia/Tokyo',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLocationResponse),
      });

      const currency = await getUserPreferredCurrency();

      expect(currency).toBe('JPY');
    });

    it('should set user preferred currency', () => {
      setUserPreferredCurrency('AUD');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'stockflow_currency_preference',
        expect.stringContaining('"currency":"AUD"')
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const preference = getCurrencyPreference();
      expect(preference).toBeNull();
    });

    it('should fallback to USD when all detection methods fail', async () => {
      (global.fetch as any).mockRejectedValue(new Error('All APIs failed'));
      localStorageMock.getItem.mockReturnValue(null);

      const currency = await getUserPreferredCurrency();
      expect(currency).toBe('USD');
    });

    it('should handle invalid currency codes', () => {
      const invalidCurrency = formatCurrencyAmount(29.99, 'INVALID');
      expect(invalidCurrency).toBe('29.99'); // Should fallback to number without symbol
    });
  });

  describe('Caching', () => {
    it('should cache geolocation data', async () => {
      const mockResponse = {
        country: 'Australia',
        country_code: 'AU',
        currency: 'AUD',
        timezone: 'Australia/Sydney',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await detectUserLocation();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'stockflow_geolocation_cache',
        expect.stringContaining('"currency":"AUD"')
      );
    });

    it('should expire cached data after 24 hours', async () => {
      const expiredCacheData = {
        data: {
          country: 'Old Country',
          countryCode: 'OC',
          currency: 'OLD',
          currencySymbol: 'O',
          timezone: 'Old/Timezone',
        },
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
        expiresAt: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago (expired)
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredCacheData));

      const mockResponse = {
        country: 'New Country',
        country_code: 'NC',
        currency: 'NEW',
        timezone: 'New/Timezone',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const location = await detectUserLocation();

      expect(location.currency).toBe('NEW');
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});

describe('Integration Tests', () => {
  it('should complete full geolocation pricing flow', async () => {
    // 1. Initialize preferences
    localStorageMock.getItem.mockReturnValue(null);
    initializePreferences();

    // 2. Detect location
    const mockLocationResponse = {
      country: 'Germany',
      country_code: 'DE',
      currency: 'EUR',
      timezone: 'Europe/Berlin',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLocationResponse),
    });

    const location = await detectUserLocation();
    expect(location.currency).toBe('EUR');

    // 3. Get preferred currency (should be detected EUR)
    const preferredCurrency = await getUserPreferredCurrency();
    expect(preferredCurrency).toBe('EUR');

    // 4. Convert plans to EUR
    const mockExchangeRates = {
      USD: 1,
      EUR: 0.85,
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ rates: mockExchangeRates }),
    });

    const convertedPlans = await convertSubscriptionPlans(mockPlans, 'EUR');
    expect(convertedPlans[0].currency).toBe('EUR');
    expect(convertedPlans[0].price).toBeCloseTo(29.99 * 0.85, 2);

    // 5. User manually changes currency to GBP
    setUserPreferredCurrency('GBP');
    const newPreferredCurrency = await getUserPreferredCurrency();
    expect(newPreferredCurrency).toBe('GBP');
  });
});