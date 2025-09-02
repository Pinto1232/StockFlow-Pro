import React, { useState, useEffect } from 'react';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { getSupportedCurrencies, getCurrencyInfo, type CurrencyInfo } from '../utils/currencyMapping';
import { getUserPreferredCurrency, setUserPreferredCurrency, detectUserLocation } from '../services/geoLocationService';

interface CurrencySelectorProps {
  selectedCurrency?: string;
  onCurrencyChange?: (currency: string) => void;
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencyChange,
  className = '',
  showLabel = true,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState<string>('USD');
  const [detectedCurrency, setDetectedCurrency] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supportedCurrencies = getSupportedCurrencies();

  // Initialize currency on component mount
  useEffect(() => {
    const initializeCurrency = async () => {
      try {
        setIsLoading(true);
        
        // Get user's preferred currency or detect from location
        const preferredCurrency = selectedCurrency || await getUserPreferredCurrency();
        setCurrentCurrency(preferredCurrency);
        
        // Also detect location for reference
        const location = await detectUserLocation();
        setDetectedCurrency(location.currency);
        
        console.log(`💰 Currency selector initialized: preferred=${preferredCurrency}, detected=${location.currency}`);
      } catch (error) {
        console.error('Failed to initialize currency selector:', error);
        setCurrentCurrency('USD');
      } finally {
        setIsLoading(false);
      }
    };

    initializeCurrency();
  }, [selectedCurrency]);

  const handleCurrencySelect = (currency: string) => {
    setCurrentCurrency(currency);
    setUserPreferredCurrency(currency);
    setIsOpen(false);
    
    if (onCurrencyChange) {
      onCurrencyChange(currency);
    }
    
    console.log(`💰 Currency changed to: ${currency}`);
  };

  const getCurrentCurrencyInfo = (): CurrencyInfo | null => {
    return getCurrencyInfo(currentCurrency);
  };

  const isDetectedCurrency = (currency: string): boolean => {
    return detectedCurrency === currency;
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
        {!compact && <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>}
      </div>
    );
  }

  const currentCurrencyInfo = getCurrentCurrencyInfo();

  return (
    <div className={`relative ${className}`}>
      {showLabel && !compact && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Currency
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative w-full bg-white border border-gray-300 rounded-lg shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer
            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            hover:border-gray-400 transition-colors duration-200
            ${compact ? 'text-sm' : ''}
          `}
        >
          <span className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <span className="block truncate">
              {currentCurrencyInfo ? (
                <>
                  <span className="font-medium">{currentCurrencyInfo.symbol}</span>
                  {!compact && (
                    <>
                      <span className="ml-1 text-gray-600">{currentCurrencyInfo.code}</span>
                      <span className="ml-1 text-sm text-gray-500">- {currentCurrencyInfo.name}</span>
                    </>
                  )}
                </>
              ) : (
                currentCurrency
              )}
            </span>
          </span>
          <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </span>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
              {supportedCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  type="button"
                  onClick={() => handleCurrencySelect(currency.code)}
                  className={`
                    relative w-full cursor-pointer select-none py-2 pl-3 pr-9 text-left hover:bg-gray-50
                    ${currentCurrency === currency.code ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{currency.symbol}</span>
                    <span className="text-gray-600">{currency.code}</span>
                    <span className="text-sm text-gray-500">- {currency.name}</span>
                    {isDetectedCurrency(currency.code) && (
                      <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        Detected
                      </span>
                    )}
                  </div>
                  
                  {currentCurrency === currency.code && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <Check className="w-4 h-4 text-blue-600" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Currency detection info */}
      {!compact && detectedCurrency && detectedCurrency !== currentCurrency && (
        <div className="mt-1 text-xs text-gray-500">
          <Globe className="w-3 h-3 inline mr-1" />
          Detected: {getCurrencyInfo(detectedCurrency)?.name || detectedCurrency}
          <button
            type="button"
            onClick={() => handleCurrencySelect(detectedCurrency)}
            className="ml-1 text-blue-600 hover:text-blue-800 underline"
          >
            Use detected
          </button>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;