/**
 * Price conversion utilities for handling multi-currency pricing
 * Integrates with geolocation and currency mapping services
 */

import { getExchangeRate, convertCurrency, formatCurrencyAmount, getCurrencyInfo } from './currencyMapping';
import type { SubscriptionPlan } from '../services/subscriptionService';

export interface ConvertedPrice {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  convertedCurrency: string;
  exchangeRate: number;
  formattedPrice: string;
  formattedOriginalPrice?: string;
}

export interface PricingDisplayOptions {
  showOriginalPrice?: boolean;
  showExchangeRate?: boolean;
  compactFormat?: boolean;
  includeDisclaimer?: boolean;
}

/**
 * Convert a single price to target currency
 */
export async function convertPrice(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  options: PricingDisplayOptions = {}
): Promise<ConvertedPrice> {
  const {
    showOriginalPrice = false,
    compactFormat = false,
  } = options;

  try {
    const exchangeRate = await getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = amount * exchangeRate;

    const formattedPrice = formatCurrencyAmount(convertedAmount, toCurrency, {
      compact: compactFormat,
    });

    const formattedOriginalPrice = showOriginalPrice
      ? formatCurrencyAmount(amount, fromCurrency, { compact: compactFormat })
      : undefined;

    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount,
      convertedCurrency: toCurrency,
      exchangeRate,
      formattedPrice,
      formattedOriginalPrice,
    };
  } catch (error) {
    console.error(`Failed to convert price from ${fromCurrency} to ${toCurrency}:`, error);
    
    // Fallback: return original price
    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount: amount,
      convertedCurrency: fromCurrency,
      exchangeRate: 1,
      formattedPrice: formatCurrencyAmount(amount, fromCurrency, { compact: compactFormat }),
      formattedOriginalPrice: showOriginalPrice 
        ? formatCurrencyAmount(amount, fromCurrency, { compact: compactFormat })
        : undefined,
    };
  }
}

/**
 * Convert subscription plan prices to target currency
 */
export async function convertSubscriptionPlan(
  plan: SubscriptionPlan,
  targetCurrency: string,
  options: PricingDisplayOptions = {}
): Promise<SubscriptionPlan & { convertedPrice?: ConvertedPrice; convertedMonthlyEquivalent?: ConvertedPrice }> {
  try {
    // Convert main price
    const convertedPrice = await convertPrice(
      plan.price,
      plan.currency,
      targetCurrency,
      options
    );

    // Convert monthly equivalent price if available
    let convertedMonthlyEquivalent: ConvertedPrice | undefined;
    if (plan.monthlyEquivalentPrice) {
      convertedMonthlyEquivalent = await convertPrice(
        plan.monthlyEquivalentPrice,
        plan.currency,
        targetCurrency,
        options
      );
    }

    return {
      ...plan,
      // Update the plan's currency and price to converted values
      price: convertedPrice.convertedAmount,
      currency: targetCurrency,
      monthlyEquivalentPrice: convertedMonthlyEquivalent?.convertedAmount,
      // Keep conversion details for reference
      convertedPrice,
      convertedMonthlyEquivalent,
    };
  } catch (error) {
    console.error(`Failed to convert subscription plan ${plan.id}:`, error);
    return plan; // Return original plan if conversion fails
  }
}

/**
 * Convert multiple subscription plans to target currency
 */
export async function convertSubscriptionPlans(
  plans: SubscriptionPlan[],
  targetCurrency: string,
  options: PricingDisplayOptions = {}
): Promise<SubscriptionPlan[]> {
  try {
    console.log(`💱 Converting ${plans.length} plans to ${targetCurrency}`);
    
    const convertedPlans = await Promise.all(
      plans.map(plan => convertSubscriptionPlan(plan, targetCurrency, options))
    );

    console.log(`✅ Successfully converted ${convertedPlans.length} plans to ${targetCurrency}`);
    return convertedPlans;
  } catch (error) {
    console.error(`Failed to convert subscription plans to ${targetCurrency}:`, error);
    return plans; // Return original plans if conversion fails
  }
}

/**
 * Get pricing display information with currency conversion
 */
export async function getPricingDisplayInfo(
  plan: SubscriptionPlan,
  targetCurrency: string,
  options: PricingDisplayOptions = {}
): Promise<{
  displayPrice: string;
  displayMonthlyEquivalent?: string;
  originalPrice?: string;
  originalMonthlyEquivalent?: string;
  exchangeRate?: number;
  disclaimer?: string;
}> {
  const {
    showOriginalPrice = false,
    showExchangeRate = false,
    compactFormat = false,
    includeDisclaimer = true,
  } = options;

  try {
    const convertedPlan = await convertSubscriptionPlan(plan, targetCurrency, {
      showOriginalPrice,
      compactFormat,
    });

    const result: any = {
      displayPrice: convertedPlan.convertedPrice?.formattedPrice || 
                   formatCurrencyAmount(plan.price, plan.currency, { compact: compactFormat }),
    };

    // Add monthly equivalent if available
    if (convertedPlan.convertedMonthlyEquivalent) {
      result.displayMonthlyEquivalent = convertedPlan.convertedMonthlyEquivalent.formattedPrice;
    }

    // Add original prices if requested
    if (showOriginalPrice && convertedPlan.convertedPrice?.formattedOriginalPrice) {
      result.originalPrice = convertedPlan.convertedPrice.formattedOriginalPrice;
      
      if (convertedPlan.convertedMonthlyEquivalent?.formattedOriginalPrice) {
        result.originalMonthlyEquivalent = convertedPlan.convertedMonthlyEquivalent.formattedOriginalPrice;
      }
    }

    // Add exchange rate if requested
    if (showExchangeRate && convertedPlan.convertedPrice?.exchangeRate) {
      result.exchangeRate = convertedPlan.convertedPrice.exchangeRate;
    }

    // Add disclaimer if currency was converted and different from original
    if (includeDisclaimer && plan.currency !== targetCurrency) {
      const currencyInfo = getCurrencyInfo(targetCurrency);
      result.disclaimer = `Prices shown in ${currencyInfo?.name || targetCurrency}. ` +
                         `Original prices in ${plan.currency}. Exchange rates are approximate and may vary.`;
    }

    return result;
  } catch (error) {
    console.error(`Failed to get pricing display info for plan ${plan.id}:`, error);
    
    // Fallback to original pricing
    return {
      displayPrice: formatCurrencyAmount(plan.price, plan.currency, { compact: compactFormat }),
      displayMonthlyEquivalent: plan.monthlyEquivalentPrice 
        ? formatCurrencyAmount(plan.monthlyEquivalentPrice, plan.currency, { compact: compactFormat })
        : undefined,
    };
  }
}

/**
 * Calculate savings percentage between monthly and annual pricing
 */
export function calculateSavingsPercentage(monthlyPrice: number, annualPrice: number): number {
  if (monthlyPrice <= 0 || annualPrice <= 0) return 0;
  
  const annualMonthlyEquivalent = annualPrice / 12;
  const savings = monthlyPrice - annualMonthlyEquivalent;
  const savingsPercentage = (savings / monthlyPrice) * 100;
  
  return Math.max(0, Math.round(savingsPercentage));
}

/**
 * Format savings display with currency conversion
 */
export async function formatSavingsDisplay(
  monthlyPlan: SubscriptionPlan,
  annualPlan: SubscriptionPlan,
  targetCurrency: string,
  options: PricingDisplayOptions = {}
): Promise<{
  savingsPercentage: number;
  savingsAmount: string;
  monthlyEquivalent: string;
}> {
  try {
    // Convert both plans to target currency
    const [convertedMonthly, convertedAnnual] = await Promise.all([
      convertSubscriptionPlan(monthlyPlan, targetCurrency, options),
      convertSubscriptionPlan(annualPlan, targetCurrency, options),
    ]);

    const savingsPercentage = calculateSavingsPercentage(
      convertedMonthly.price,
      convertedAnnual.price
    );

    const annualMonthlyEquivalent = convertedAnnual.price / 12;
    const savingsAmount = convertedMonthly.price - annualMonthlyEquivalent;

    return {
      savingsPercentage,
      savingsAmount: formatCurrencyAmount(savingsAmount, targetCurrency, options),
      monthlyEquivalent: formatCurrencyAmount(annualMonthlyEquivalent, targetCurrency, options),
    };
  } catch (error) {
    console.error('Failed to format savings display:', error);
    
    // Fallback to original currency calculations
    const savingsPercentage = calculateSavingsPercentage(monthlyPlan.price, annualPlan.price);
    const annualMonthlyEquivalent = annualPlan.price / 12;
    const savingsAmount = monthlyPlan.price - annualMonthlyEquivalent;

    return {
      savingsPercentage,
      savingsAmount: formatCurrencyAmount(savingsAmount, monthlyPlan.currency, options),
      monthlyEquivalent: formatCurrencyAmount(annualMonthlyEquivalent, annualPlan.currency, options),
    };
  }
}

/**
 * Get localized pricing text based on currency
 */
export function getLocalizedPricingText(currencyCode: string): {
  perMonth: string;
  perYear: string;
  billedMonthly: string;
  billedAnnually: string;
  save: string;
  startTrial: string;
  choosePlan: string;
} {
  const currencyInfo = getCurrencyInfo(currencyCode);
  const locale = currencyInfo?.locale || 'en-US';

  // Basic localization - can be extended with proper i18n
  const texts: { [key: string]: any } = {
    'en-US': {
      perMonth: 'per month',
      perYear: 'per year',
      billedMonthly: 'Billed monthly',
      billedAnnually: 'Billed annually',
      save: 'Save',
      startTrial: 'Start Free Trial',
      choosePlan: 'Choose Plan',
    },
    'en-GB': {
      perMonth: 'per month',
      perYear: 'per year',
      billedMonthly: 'Billed monthly',
      billedAnnually: 'Billed annually',
      save: 'Save',
      startTrial: 'Start Free Trial',
      choosePlan: 'Choose Plan',
    },
    'de-DE': {
      perMonth: 'pro Monat',
      perYear: 'pro Jahr',
      billedMonthly: 'Monatlich abgerechnet',
      billedAnnually: 'Jährlich abgerechnet',
      save: 'Sparen',
      startTrial: 'Kostenlose Testversion starten',
      choosePlan: 'Plan wählen',
    },
    'fr-FR': {
      perMonth: 'par mois',
      perYear: 'par an',
      billedMonthly: 'Facturé mensuellement',
      billedAnnually: 'Facturé annuellement',
      save: 'Économiser',
      startTrial: 'Commencer l\'essai gratuit',
      choosePlan: 'Choisir le plan',
    },
    'es-ES': {
      perMonth: 'por mes',
      perYear: 'por año',
      billedMonthly: 'Facturado mensualmente',
      billedAnnually: 'Facturado anualmente',
      save: 'Ahorrar',
      startTrial: 'Iniciar prueba gratuita',
      choosePlan: 'Elegir plan',
    },
  };

  return texts[locale] || texts['en-US'];
}

/**
 * Validate if price conversion is reasonable (prevents obvious errors)
 */
export function validatePriceConversion(
  originalAmount: number,
  convertedAmount: number,
  exchangeRate: number
): boolean {
  // Check if conversion is reasonable (rate between 0.01 and 100)
  if (exchangeRate < 0.01 || exchangeRate > 100) {
    console.warn(`Suspicious exchange rate: ${exchangeRate}`);
    return false;
  }

  // Check if converted amount makes sense
  const expectedAmount = originalAmount * exchangeRate;
  const tolerance = 0.01; // 1% tolerance
  const difference = Math.abs(convertedAmount - expectedAmount) / expectedAmount;
  
  if (difference > tolerance) {
    console.warn(`Price conversion validation failed: expected ${expectedAmount}, got ${convertedAmount}`);
    return false;
  }

  return true;
}