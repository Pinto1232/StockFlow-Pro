/**
 * Currency mapping and conversion utilities
 * Handles mapping countries to currencies and basic exchange rate functionality
 */

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
  locale: string;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: number;
  source: string;
}

export interface ExchangeRateCache {
  rates: { [key: string]: ExchangeRate };
  timestamp: number;
  expiresAt: number;
}

// Cache duration: 1 hour for exchange rates
const EXCHANGE_RATE_CACHE_DURATION = 60 * 60 * 1000;
const EXCHANGE_RATE_CACHE_KEY = 'stockflow_exchange_rates';

/**
 * Supported currencies with their information
 */
export const SUPPORTED_CURRENCIES: { [key: string]: CurrencyInfo } = {
  'USD': {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimals: 2,
    locale: 'en-US',
  },
  'EUR': {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimals: 2,
    locale: 'de-DE',
  },
  'GBP': {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimals: 2,
    locale: 'en-GB',
  },
  'CAD': {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    decimals: 2,
    locale: 'en-CA',
  },
  'AUD': {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    decimals: 2,
    locale: 'en-AU',
  },
  'JPY': {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    decimals: 0,
    locale: 'ja-JP',
  },
  'CHF': {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    decimals: 2,
    locale: 'de-CH',
  },
  'CNY': {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    decimals: 2,
    locale: 'zh-CN',
  },
  'SEK': {
    code: 'SEK',
    symbol: 'kr',
    name: 'Swedish Krona',
    decimals: 2,
    locale: 'sv-SE',
  },
  'NOK': {
    code: 'NOK',
    symbol: 'kr',
    name: 'Norwegian Krone',
    decimals: 2,
    locale: 'nb-NO',
  },
  'DKK': {
    code: 'DKK',
    symbol: 'kr',
    name: 'Danish Krone',
    decimals: 2,
    locale: 'da-DK',
  },
  'ZAR': {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    decimals: 2,
    locale: 'en-ZA',
  },
  'INR': {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    decimals: 2,
    locale: 'en-IN',
  },
  'BRL': {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    decimals: 2,
    locale: 'pt-BR',
  },
  'MXN': {
    code: 'MXN',
    symbol: '$',
    name: 'Mexican Peso',
    decimals: 2,
    locale: 'es-MX',
  },
  'SGD': {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    decimals: 2,
    locale: 'en-SG',
  },
  'HKD': {
    code: 'HKD',
    symbol: 'HK$',
    name: 'Hong Kong Dollar',
    decimals: 2,
    locale: 'en-HK',
  },
  'NZD': {
    code: 'NZD',
    symbol: 'NZ$',
    name: 'New Zealand Dollar',
    decimals: 2,
    locale: 'en-NZ',
  },
  'KRW': {
    code: 'KRW',
    symbol: '₩',
    name: 'South Korean Won',
    decimals: 0,
    locale: 'ko-KR',
  },
  'TRY': {
    code: 'TRY',
    symbol: '₺',
    name: 'Turkish Lira',
    decimals: 2,
    locale: 'tr-TR',
  },
  'RUB': {
    code: 'RUB',
    symbol: '₽',
    name: 'Russian Ruble',
    decimals: 2,
    locale: 'ru-RU',
  },
  'MZN': {
    code: 'MZN',
    symbol: 'MT',
    name: 'Mozambican Metical',
    decimals: 2,
    locale: 'pt-MZ',
  },
  'AOA': {
    code: 'AOA',
    symbol: 'Kz',
    name: 'Angolan Kwanza',
    decimals: 2,
    locale: 'pt-AO',
  },
};

/**
 * Country to currency mapping
 */
export const COUNTRY_TO_CURRENCY: { [key: string]: string } = {
  // North America
  'US': 'USD', 'CA': 'CAD', 'MX': 'MXN',
  
  // Europe
  'GB': 'GBP', 'CH': 'CHF', 'SE': 'SEK', 'NO': 'NOK', 'DK': 'DKK',
  'RU': 'RUB', 'TR': 'TRY',
  
  // European Union (Euro)
  'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR',
  'BE': 'EUR', 'AT': 'EUR', 'PT': 'EUR', 'IE': 'EUR', 'FI': 'EUR',
  'GR': 'EUR', 'LU': 'EUR', 'MT': 'EUR', 'CY': 'EUR', 'SK': 'EUR',
  'SI': 'EUR', 'EE': 'EUR', 'LV': 'EUR', 'LT': 'EUR',
  
  // Asia Pacific
  'JP': 'JPY', 'CN': 'CNY', 'KR': 'KRW', 'IN': 'INR', 'SG': 'SGD',
  'HK': 'HKD', 'AU': 'AUD', 'NZ': 'NZD',
  
  // Africa
  'ZA': 'ZAR', 'MZ': 'MZN', 'AO': 'AOA',
  
  // South America
  'BR': 'BRL',
};

/**
 * Get currency information for a given currency code
 */
export function getCurrencyInfo(currencyCode: string): CurrencyInfo | null {
  return SUPPORTED_CURRENCIES[currencyCode.toUpperCase()] || null;
}

/**
 * Get currency code for a given country code
 */
export function getCurrencyForCountry(countryCode: string): string {
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] || 'USD';
}

/**
 * Check if a currency is supported
 */
export function isCurrencySupported(currencyCode: string): boolean {
  return currencyCode.toUpperCase() in SUPPORTED_CURRENCIES;
}

/**
 * Get list of all supported currencies
 */
export function getSupportedCurrencies(): CurrencyInfo[] {
  return Object.values(SUPPORTED_CURRENCIES);
}

/**
 * Format currency amount with proper locale and symbol
 */
export function formatCurrencyAmount(
  amount: number,
  currencyCode: string,
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    compact?: boolean;
  } = {}
): string {
  const { showSymbol = true, showCode = false, compact = false } = options;
  
  const currencyInfo = getCurrencyInfo(currencyCode);
  if (!currencyInfo) {
    return `${amount.toFixed(2)} ${currencyCode}`;
  }

  try {
    if (compact && amount >= 1000) {
      return formatCompactCurrency(amount, currencyInfo);
    }

    const formatter = new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currencyInfo.code,
      minimumFractionDigits: currencyInfo.decimals,
      maximumFractionDigits: currencyInfo.decimals,
    });

    let formatted = formatter.format(amount);

    // If user doesn't want symbol, replace it with code
    if (!showSymbol && showCode) {
      formatted = formatted.replace(currencyInfo.symbol, currencyInfo.code);
    }

    return formatted;
  } catch (error) {
    console.warn(`Failed to format currency ${currencyCode}:`, error);
    return `${currencyInfo.symbol}${amount.toFixed(currencyInfo.decimals)}`;
  }
}

/**
 * Format currency in compact notation (e.g., $1.2K, €1.5M)
 */
function formatCompactCurrency(amount: number, currencyInfo: CurrencyInfo): string {
  const { symbol, decimals } = currencyInfo;
  
  if (amount >= 1_000_000_000) {
    return `${symbol}${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  
  if (amount >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  }
  
  if (amount >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(1)}K`;
  }
  
  return `${symbol}${amount.toFixed(decimals)}`;
}

/**
 * Get cached exchange rates
 */
function getCachedExchangeRates(): { [key: string]: ExchangeRate } | null {
  try {
    const cached = localStorage.getItem(EXCHANGE_RATE_CACHE_KEY);
    if (!cached) return null;

    const cacheData: ExchangeRateCache = JSON.parse(cached);
    
    // Check if cache is still valid
    if (Date.now() < cacheData.expiresAt) {
      console.log('💱 Using cached exchange rates');
      return cacheData.rates;
    } else {
      // Cache expired, remove it
      localStorage.removeItem(EXCHANGE_RATE_CACHE_KEY);
      console.log('🕒 Exchange rate cache expired');
      return null;
    }
  } catch (error) {
    console.warn('⚠️ Failed to read exchange rate cache:', error);
    localStorage.removeItem(EXCHANGE_RATE_CACHE_KEY);
    return null;
  }
}

/**
 * Cache exchange rates
 */
function cacheExchangeRates(rates: { [key: string]: ExchangeRate }): void {
  try {
    const cacheData: ExchangeRateCache = {
      rates,
      timestamp: Date.now(),
      expiresAt: Date.now() + EXCHANGE_RATE_CACHE_DURATION,
    };
    
    localStorage.setItem(EXCHANGE_RATE_CACHE_KEY, JSON.stringify(cacheData));
    console.log('💾 Cached exchange rates for 1 hour');
  } catch (error) {
    console.warn('⚠️ Failed to cache exchange rates:', error);
  }
}

/**
 * Fetch exchange rates from a free API (exchangerate-api.com)
 */
async function fetchExchangeRates(baseCurrency: string = 'USD'): Promise<{ [key: string]: ExchangeRate }> {
  try {
    console.log(`💱 Fetching exchange rates for base currency: ${baseCurrency}`);
    
    // Using exchangerate-api.com free tier (1500 requests/month)
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.rates) {
      throw new Error('Invalid response format');
    }

    const rates: { [key: string]: ExchangeRate } = {};
    const timestamp = Date.now();
    
    // Convert to our format
    Object.entries(data.rates).forEach(([currency, rate]) => {
      rates[`${baseCurrency}-${currency}`] = {
        from: baseCurrency,
        to: currency as string,
        rate: rate as number,
        timestamp,
        source: 'exchangerate-api.com',
      };
    });

    console.log(`✅ Fetched ${Object.keys(rates).length} exchange rates`);
    return rates;
  } catch (error) {
    console.error('❌ Failed to fetch exchange rates:', error);
    throw error;
  }
}

/**
 * Get exchange rate between two currencies
 */
export async function getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  
  // Same currency, rate is 1
  if (from === to) {
    return 1;
  }

  try {
    // Check cache first
    let rates = getCachedExchangeRates();
    
    // If no cache or cache doesn't have our rate, fetch fresh data
    const rateKey = `${from}-${to}`;
    const reverseRateKey = `${to}-${from}`;
    
    if (!rates || (!rates[rateKey] && !rates[reverseRateKey])) {
      console.log(`💱 Fetching fresh exchange rates for ${from} to ${to}`);
      rates = await fetchExchangeRates(from);
      cacheExchangeRates(rates);
    }

    // Try direct rate
    if (rates[rateKey]) {
      return rates[rateKey].rate;
    }
    
    // Try reverse rate
    if (rates[reverseRateKey]) {
      return 1 / rates[reverseRateKey].rate;
    }
    
    // If we have USD rates, convert through USD
    const usdFromKey = `USD-${from}`;
    const usdToKey = `USD-${to}`;
    
    if (rates[usdFromKey] && rates[usdToKey]) {
      const usdToFrom = 1 / rates[usdFromKey].rate;
      const usdToTo = rates[usdToKey].rate;
      return usdToTo * usdToFrom;
    }

    throw new Error(`Exchange rate not found for ${from} to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to get exchange rate ${from} to ${to}:`, error);
    
    // Return fallback rates for common conversions
    const fallbackRates: { [key: string]: number } = {
      'USD-EUR': 0.85,
      'USD-GBP': 0.75,
      'USD-CAD': 1.25,
      'USD-AUD': 1.35,
      'USD-JPY': 110,
      'USD-ZAR': 15,
      'EUR-USD': 1.18,
      'GBP-USD': 1.33,
    };
    
    const fallbackKey = `${from}-${to}`;
    const reverseFallbackKey = `${to}-${from}`;
    
    if (fallbackRates[fallbackKey]) {
      console.log(`🔄 Using fallback rate for ${from} to ${to}: ${fallbackRates[fallbackKey]}`);
      return fallbackRates[fallbackKey];
    }
    
    if (fallbackRates[reverseFallbackKey]) {
      const rate = 1 / fallbackRates[reverseFallbackKey];
      console.log(`🔄 Using reverse fallback rate for ${from} to ${to}: ${rate}`);
      return rate;
    }
    
    // Ultimate fallback
    console.warn(`⚠️ No exchange rate available for ${from} to ${to}, using 1:1`);
    return 1;
  }
}

/**
 * Convert amount from one currency to another
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (amount === 0) return 0;
  
  const rate = await getExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
}

/**
 * Clear exchange rate cache
 */
export function clearExchangeRateCache(): void {
  try {
    localStorage.removeItem(EXCHANGE_RATE_CACHE_KEY);
    console.log('🗑️ Cleared exchange rate cache');
  } catch (error) {
    console.warn('⚠️ Failed to clear exchange rate cache:', error);
  }
}