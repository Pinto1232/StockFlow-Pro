// Shared formatting utilities for StockFlow Pro
// Mirrors the C# DecimalExtensions functionality

/**
 * Formats a number as currency with proper thousand separators
 * @param {number} amount - The amount to format
 * @param {string} currencySymbol - Currency symbol (default: "R")
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currencySymbol = "R", decimals = 2) {
    if (amount == null || isNaN(amount)) {
        return `${currencySymbol}0.00`;
    }
    
    const number = parseFloat(amount);
    return `${currencySymbol}${number.toLocaleString('en-ZA', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })}`;
}

/**
 * Formats a number as currency using specific locale
 * @param {number} amount - The amount to format
 * @param {string} locale - Locale string (default: 'en-ZA' for South African Rand)
 * @returns {string} Formatted currency string
 */
function formatCurrencyWithLocale(amount, locale = 'en-ZA') {
    if (amount == null || isNaN(amount)) {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'ZAR'
        }).format(0);
    }
    
    const number = parseFloat(amount);
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'ZAR'
    }).format(number);
}

/**
 * Formats a number as percentage
 * @param {number} amount - The amount to format as percentage
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
function formatPercentage(amount, decimals = 2) {
    if (amount == null || isNaN(amount)) {
        return "0.00%";
    }
    
    const number = parseFloat(amount);
    return `${number.toFixed(decimals)}%`;
}

/**
 * Rounds number to specified decimal places
 * @param {number} amount - The amount to round
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} Rounded number
 */
function roundTo(amount, decimals = 2) {
    if (amount == null || isNaN(amount)) {
        return 0;
    }
    
    const number = parseFloat(amount);
    return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Formats large numbers with K, M, B suffixes
 * @param {number} amount - The amount to format
 * @returns {string} Formatted short number string
 */
function formatShortNumber(amount) {
    if (amount == null || isNaN(amount)) {
        return "0.00";
    }
    
    const number = parseFloat(amount);
    
    if (number >= 1_000_000_000) {
        return `${(number / 1_000_000_000).toFixed(1)}B`;
    }
    
    if (number >= 1_000_000) {
        return `${(number / 1_000_000).toFixed(1)}M`;
    }
    
    if (number >= 1_000) {
        return `${(number / 1_000).toFixed(1)}K`;
    }
    
    return number.toFixed(2);
}

/**
 * Formats a number with thousand separators but no currency symbol
 * @param {number} amount - The amount to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number string
 */
function formatNumber(amount, decimals = 2) {
    if (amount == null || isNaN(amount)) {
        return "0.00";
    }
    
    const number = parseFloat(amount);
    return number.toLocaleString('en-ZA', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Calculates percentage of total
 * @param {number} amount - The amount
 * @param {number} total - The total amount
 * @returns {number} Percentage value
 */
function calculatePercentageOf(amount, total) {
    if (total == null || total === 0 || isNaN(total) || amount == null || isNaN(amount)) {
        return 0;
    }
    
    return (parseFloat(amount) / parseFloat(total)) * 100;
}

/**
 * Validates if a value is a valid number
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid number
 */
function isValidNumber(value) {
    return value != null && !isNaN(value) && isFinite(value);
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatCurrency,
        formatCurrencyWithLocale,
        formatPercentage,
        roundTo,
        formatShortNumber,
        formatNumber,
        calculatePercentageOf,
        isValidNumber
    };
}

// Make functions available globally for direct script inclusion
window.FormattingUtils = {
    formatCurrency,
    formatCurrencyWithLocale,
    formatPercentage,
    roundTo,
    formatShortNumber,
    formatNumber,
    calculatePercentageOf,
    isValidNumber
};