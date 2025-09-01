/**
 * Utility functions for pricing calculations
 */

export interface PricingCalculation {
  monthlyPrice: number;
  annualPrice: number;
  monthlyEquivalent: number;
  annualSavings: number;
  savingsPercentage: number;
}

/**
 * Calculate annual price from monthly price (12 months)
 */
export function calculateAnnualFromMonthly(monthlyPrice: number): number {
  return monthlyPrice * 12;
}

/**
 * Calculate monthly equivalent from annual price
 */
export function calculateMonthlyFromAnnual(annualPrice: number): number {
  return annualPrice / 12;
}

/**
 * Calculate savings when choosing annual over monthly billing
 */
export function calculateAnnualSavings(monthlyPrice: number, annualPrice: number): number {
  const expectedAnnualPrice = calculateAnnualFromMonthly(monthlyPrice);
  return Math.max(0, expectedAnnualPrice - annualPrice);
}

/**
 * Calculate savings percentage when choosing annual over monthly billing
 */
export function calculateSavingsPercentage(monthlyPrice: number, annualPrice: number): number {
  const expectedAnnualPrice = calculateAnnualFromMonthly(monthlyPrice);
  const savings = calculateAnnualSavings(monthlyPrice, annualPrice);
  return expectedAnnualPrice > 0 ? (savings / expectedAnnualPrice) * 100 : 0;
}

/**
 * Get comprehensive pricing calculation for a plan
 */
export function getPricingCalculation(
  monthlyPrice: number, 
  annualPrice?: number
): PricingCalculation {
  // If no annual price provided, assume it's 12x monthly (no discount)
  const calculatedAnnualPrice = annualPrice || calculateAnnualFromMonthly(monthlyPrice);
  
  return {
    monthlyPrice,
    annualPrice: calculatedAnnualPrice,
    monthlyEquivalent: calculateMonthlyFromAnnual(calculatedAnnualPrice),
    annualSavings: calculateAnnualSavings(monthlyPrice, calculatedAnnualPrice),
    savingsPercentage: calculateSavingsPercentage(monthlyPrice, calculatedAnnualPrice)
  };
}

/**
 * Format price with currency
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat(undefined, { 
    style: 'currency', 
    currency,
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(price);
}

/**
 * Validate that annual pricing matches expected 12-month calculation
 */
export function validatePricingConsistency(
  monthlyPrice: number, 
  annualPrice: number,
  tolerance: number = 0.01
): {
  isConsistent: boolean;
  expectedAnnualPrice: number;
  actualAnnualPrice: number;
  difference: number;
} {
  const expectedAnnualPrice = calculateAnnualFromMonthly(monthlyPrice);
  const difference = Math.abs(expectedAnnualPrice - annualPrice);
  
  return {
    isConsistent: difference <= tolerance,
    expectedAnnualPrice,
    actualAnnualPrice: annualPrice,
    difference
  };
}

/**
 * Get pricing display information for UI components
 */
export function getPricingDisplayInfo(
  price: number,
  currency: string,
  interval: 'Monthly' | 'Annual',
  monthlyEquivalentPrice?: number
) {
  const isAnnual = interval === 'Annual';
  
  return {
    mainPrice: formatPrice(price, currency),
    interval: isAnnual ? 'year' : 'month',
    monthlyEquivalent: isAnnual && monthlyEquivalentPrice 
      ? formatPrice(monthlyEquivalentPrice, currency)
      : null,
    annualEquivalent: !isAnnual 
      ? formatPrice(price * 12, currency)
      : null,
    calculationNote: isAnnual && monthlyEquivalentPrice
      ? `${formatPrice(price, currency)} ÷ 12 months`
      : null
  };
}