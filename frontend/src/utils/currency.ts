/**
 * Currency formatting utilities for South African Rand (ZAR)
 * This mirrors the backend C# DecimalExtensions and uses the existing formatting-utils.js
 */

// Check if the global FormattingUtils is available (from formatting-utils.js)
declare global {
    interface Window {
        FormattingUtils?: {
            formatCurrency: (
                amount: number,
                currencySymbol?: string,
                decimals?: number,
            ) => string;
            formatCurrencyWithLocale: (
                amount: number,
                locale?: string,
            ) => string;
            formatNumber: (amount: number, decimals?: number) => string;
            formatShortNumber: (amount: number) => string;
            formatPercentage: (amount: number, decimals?: number) => string;
            isValidNumber: (value: unknown) => boolean;
        };
    }
}

/**
 * Format a number as South African Rand currency
 * Uses the global FormattingUtils if available, otherwise falls back to local implementation
 * @param amount - The amount to format
 * @param useRSymbol - Whether to use 'R' symbol (default: true)
 * @returns Formatted currency string
 */
export const formatCurrency = (
    amount: number,
    useRSymbol: boolean = true,
): string => {
    // Use global FormattingUtils if available
    if (typeof window !== "undefined" && window.FormattingUtils) {
        return window.FormattingUtils.formatCurrency(
            amount,
            useRSymbol ? "R" : "ZAR",
        );
    }

    // Fallback implementation
    if (isNaN(amount) || amount === null || amount === undefined) {
        return useRSymbol ? "R0.00" : "ZAR 0.00";
    }

    const number = parseFloat(amount.toString());

    if (useRSymbol) {
        return `R${number.toLocaleString("en-ZA", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    } else {
        return new Intl.NumberFormat("en-ZA", {
            style: "currency",
            currency: "ZAR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(number);
    }
};

/**
 * Format a number as South African Rand with proper locale formatting
 * @param amount - The amount to format
 * @returns Formatted currency string using ZAR locale
 */
export const formatCurrencyWithLocale = (amount: number): string => {
    // Use global FormattingUtils if available
    if (typeof window !== "undefined" && window.FormattingUtils) {
        return window.FormattingUtils.formatCurrencyWithLocale(amount, "en-ZA");
    }

    // Fallback implementation
    if (isNaN(amount) || amount === null || amount === undefined) {
        return new Intl.NumberFormat("en-ZA", {
            style: "currency",
            currency: "ZAR",
        }).format(0);
    }

    const number = parseFloat(amount.toString());
    return new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
    }).format(number);
};

/**
 * Format a number as South African Rand with compact notation for large numbers
 * @param amount - The amount to format
 * @returns Formatted currency string with compact notation (e.g., R1.2K, R1.5M)
 */
export const formatCurrencyCompact = (amount: number): string => {
    // Use global FormattingUtils if available
    if (typeof window !== "undefined" && window.FormattingUtils) {
        const shortNumber = window.FormattingUtils.formatShortNumber(amount);
        return `R${shortNumber}`;
    }

    // Fallback implementation
    if (isNaN(amount) || amount === null || amount === undefined) {
        return "R0.00";
    }

    const number = parseFloat(amount.toString());

    if (number >= 1_000_000_000) {
        return `R${(number / 1_000_000_000).toFixed(1)}B`;
    }

    if (number >= 1_000_000) {
        return `R${(number / 1_000_000).toFixed(1)}M`;
    }

    if (number >= 1_000) {
        return `R${(number / 1_000).toFixed(1)}K`;
    }

    return `R${number.toFixed(2)}`;
};

/**
 * Format a number with South African locale formatting (no currency symbol)
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export const formatNumber = (amount: number, decimals: number = 2): string => {
    // Use global FormattingUtils if available
    if (typeof window !== "undefined" && window.FormattingUtils) {
        return window.FormattingUtils.formatNumber(amount, decimals);
    }

    // Fallback implementation
    if (isNaN(amount) || amount === null || amount === undefined) {
        return "0.00";
    }

    const number = parseFloat(amount.toString());
    return number.toLocaleString("en-ZA", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

/**
 * Parse a currency string back to a number
 * @param currencyString - The currency string to parse (e.g., "R1,234.56" or "ZAR 1,234.56")
 * @returns The parsed number or 0 if parsing fails
 */
export const parseCurrency = (currencyString: string): number => {
    if (!currencyString || typeof currencyString !== "string") {
        return 0;
    }

    // Remove currency symbols and spaces, keep only numbers, commas, and decimal points
    const cleanString = currencyString
        .replace(/[R$ZAR\s]/g, "")
        .replace(/,/g, "");

    const parsed = parseFloat(cleanString);
    return isNaN(parsed) ? 0 : parsed;
};

/**
 * Check if a value represents a valid currency amount
 * @param value - The value to check
 * @returns True if the value is a valid currency amount
 */
export const isValidCurrencyAmount = (value: unknown): boolean => {
    // Use global FormattingUtils if available
    if (typeof window !== "undefined" && window.FormattingUtils) {
        return window.FormattingUtils.isValidNumber(value);
    }

    // Fallback implementation
    if (value === null || value === undefined) return false;

    const num =
        typeof value === "string" ? parseCurrency(value) : Number(value);
    return !isNaN(num) && isFinite(num) && num >= 0;
};

/**
 * Format a percentage value
 * @param amount - The percentage amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export const formatPercentage = (
    amount: number,
    decimals: number = 2,
): string => {
    // Use global FormattingUtils if available
    if (typeof window !== "undefined" && window.FormattingUtils) {
        return window.FormattingUtils.formatPercentage(amount, decimals);
    }

    // Fallback implementation
    if (isNaN(amount) || amount === null || amount === undefined) {
        return "0.00%";
    }

    const number = parseFloat(amount.toString());
    return `${number.toFixed(decimals)}%`;
};

/**
 * Convert cents to rand (divide by 100)
 * @param cents - Amount in cents
 * @returns Amount in rand
 */
export const centsToRand = (cents: number): number => {
    return cents / 100;
};

/**
 * Convert rand to cents (multiply by 100)
 * @param rand - Amount in rand
 * @returns Amount in cents
 */
export const randToCents = (rand: number): number => {
    return Math.round(rand * 100);
};

// Export default formatter for convenience
export default formatCurrency;
