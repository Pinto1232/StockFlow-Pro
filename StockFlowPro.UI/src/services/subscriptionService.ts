import { http } from './api/client';
import type { Entitlements } from '../hooks/useFeatures';
import { getUserPreferredCurrency } from './geoLocationService';
import { convertSubscriptionPlans } from '../utils/priceConverter';

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price: number; // price in the plan's billing interval (monthly or annual)
  interval: 'Monthly' | 'Annual';
  currency: string;
  sortOrder?: number;
  features?: string[];
  isPopular?: boolean;
  monthlyEquivalentPrice?: number;
};

// Backend response type
type BackendSubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingInterval: number; // 1 = Monthly, 4 = Annual
  billingIntervalCount: number;
  isActive: boolean;
  isPublic: boolean;
  trialPeriodDays?: number;
  maxUsers?: number;
  maxProjects?: number;
  maxStorageGB?: number;
  hasAdvancedReporting: boolean;
  hasApiAccess: boolean;
  hasPrioritySupport: boolean;
  createdAt: string;
  updatedAt?: string;
  sortOrder: number;
  monthlyEquivalentPrice: number;
  hasTrial: boolean;
};

type SubscriptionPlansResponse = BackendSubscriptionPlan[] | { items: BackendSubscriptionPlan[] };

type CheckoutSessionResponse = { sessionId?: string; redirectUrl?: string; status?: string };

type CheckoutConfirmRequest = { sessionId: string; email: string };

type CheckoutConfirmResponse = { sessionId: string; status: string };

const mockPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for individuals and small teams getting started',
    price: 29.99,
    interval: 'Monthly',
    currency: 'USD',
    sortOrder: 1,
    features: ['Up to 5 users', 'Basic reports', 'Email support'],
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'Ideal for growing businesses with advanced features',
    price: 79.99,
    interval: 'Monthly',
    currency: 'USD',
    sortOrder: 2,
    features: ['Up to 25 users', 'Advanced reports', 'API access', 'Priority support'],
    isPopular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with premium support',
    price: 199.99,
    interval: 'Monthly',
    currency: 'USD',
    sortOrder: 3,
    features: ['Unlimited users', 'All features', '24/7 support'],
  },
];

// Helper function to calculate annual price from monthly price (12 months)
export function calculateAnnualPrice(monthlyPrice: number): number {
  return monthlyPrice * 12;
}

// Helper function to calculate monthly equivalent from annual price
export function calculateMonthlyEquivalent(annualPrice: number): number {
  return annualPrice / 12;
}

// Helper function to ensure price consistency between monthly and annual plans
export function ensurePriceConsistency(plans: SubscriptionPlan[]): SubscriptionPlan[] {
  const planGroups: { [key: string]: { monthly?: SubscriptionPlan; annual?: SubscriptionPlan } } = {};
  
  // Group plans by name (normalized)
  plans.forEach(plan => {
    const normalizedName = plan.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    if (!planGroups[normalizedName]) {
      planGroups[normalizedName] = {};
    }
    
    if (plan.interval === 'Monthly') {
      planGroups[normalizedName].monthly = plan;
    } else {
      planGroups[normalizedName].annual = plan;
    }
  });
  
  // Ensure consistency within each group
  const consistentPlans: SubscriptionPlan[] = [];
  
  Object.values(planGroups).forEach(group => {
    if (group.monthly && group.annual) {
      // Calculate what the annual price should be based on monthly
      const expectedAnnualPrice = calculateAnnualPrice(group.monthly.price);
      const actualMonthlyEquivalent = calculateMonthlyEquivalent(group.annual.price);
      
      // Update the annual plan's monthly equivalent price
      const updatedAnnualPlan = {
        ...group.annual,
        monthlyEquivalentPrice: actualMonthlyEquivalent
      };
      
      console.log(`🔧 Price consistency check for ${group.monthly.name}:`);
      console.log(`   Monthly: ${group.monthly.price}`);
      console.log(`   Annual: ${group.annual.price}`);
      console.log(`   Expected Annual (12x monthly): ${expectedAnnualPrice}`);
      console.log(`   Actual Monthly Equivalent: ${actualMonthlyEquivalent}`);
      
      consistentPlans.push(group.monthly, updatedAnnualPlan);
    } else if (group.monthly) {
      consistentPlans.push(group.monthly);
    } else if (group.annual) {
      // Calculate monthly equivalent for standalone annual plan
      const updatedAnnualPlan = {
        ...group.annual,
        monthlyEquivalentPrice: calculateMonthlyEquivalent(group.annual.price)
      };
      consistentPlans.push(updatedAnnualPlan);
    }
  });
  
  return consistentPlans;
}

// Helper function to convert backend plan to frontend format
function mapBackendPlanToFrontend(backendPlan: BackendSubscriptionPlan): SubscriptionPlan {
  console.log('🔄 Mapping backend plan:', backendPlan);
  
  const features: string[] = [];
  
  // Add features based on backend flags
  if (backendPlan.maxUsers) {
    features.push(`Up to ${backendPlan.maxUsers} users`);
  } else if (backendPlan.maxUsers === null as unknown as number) {
    features.push('Unlimited users');
  }
  
  if (backendPlan.hasAdvancedReporting) {
    features.push('Advanced reports');
  }
  
  if (backendPlan.hasApiAccess) {
    features.push('API access');
  }
  
  if (backendPlan.hasPrioritySupport) {
    features.push('Priority support');
  }
  
  if (backendPlan.maxStorageGB) {
    features.push(`${backendPlan.maxStorageGB}GB storage`);
  }
  
  if (backendPlan.maxProjects) {
    features.push(`Up to ${backendPlan.maxProjects} projects`);
  }
  
  if (backendPlan.trialPeriodDays) {
    features.push(`${backendPlan.trialPeriodDays}-day free trial`);
  }
  
  // Add basic features if none are specified
  if (features.length === 0) {
    features.push('Essential features', 'Email support', 'Standard reporting');
  }
  
  // Determine if this is a popular plan (Professional is usually popular)
  const isPopular = backendPlan.name.toLowerCase().includes('professional') || 
                   backendPlan.name.toLowerCase().includes('pro');
  
  const isAnnual = backendPlan.billingInterval === 4;
  
  // Calculate monthly equivalent price for annual plans
  // If it's an annual plan, the monthlyEquivalentPrice should be the annual price divided by 12
  let monthlyEquivalentPrice = backendPlan.monthlyEquivalentPrice;
  if (isAnnual && backendPlan.price) {
    monthlyEquivalentPrice = backendPlan.price / 12;
    console.log(`📊 Calculated monthly equivalent for annual plan: ${monthlyEquivalentPrice} (${backendPlan.price} / 12)`);
  }
  
  const mappedPlan = {
    id: backendPlan.id,
    name: backendPlan.name,
    description: backendPlan.description,
    price: backendPlan.price,
    interval: isAnnual ? 'Annual' : 'Monthly' as 'Monthly' | 'Annual',
    currency: backendPlan.currency || 'USD',
    sortOrder: backendPlan.sortOrder || 999,
    features,
    isPopular,
    monthlyEquivalentPrice,
  };
  
  console.log('✅ Mapped plan:', mappedPlan);
  return mappedPlan;
}

export async function getPublicPlans(targetCurrency?: string): Promise<SubscriptionPlan[]> {
  try {
    // Try primary endpoint first
    const endpoints = ['/api/subscription-plans', '/api/plans', '/api/subscriptions/plans'];
    
    for (const ep of endpoints) {
      try {
        console.log(`🔍 Trying subscription plans endpoint: ${ep}`);
        const data = await http.get<SubscriptionPlansResponse>(ep);
        
        // Handle possible envelope
        const backendPlans = Array.isArray(data) ? data : data.items;
        
        if (backendPlans && backendPlans.length) {
          console.log(`✅ Successfully fetched ${backendPlans.length} plans from ${ep}`);
          console.log('📊 Backend plans:', backendPlans);
          
          // Map backend plans to frontend format
          const mappedPlans = backendPlans.map(mapBackendPlanToFrontend);
          console.log('🎯 Mapped plans for frontend:', mappedPlans);
          
          // Apply currency conversion if needed
          const userCurrency = targetCurrency || await getUserPreferredCurrency();
          if (userCurrency && mappedPlans.length > 0 && mappedPlans[0].currency !== userCurrency) {
            console.log(`💱 Converting plans from ${mappedPlans[0].currency} to ${userCurrency}`);
            const convertedPlans = await convertSubscriptionPlans(mappedPlans, userCurrency);
            return convertedPlans;
          }
          
          return mappedPlans;
        } else {
          console.warn(`⚠️ Endpoint ${ep} returned empty data:`, data);
        }
      } catch (error) {
        console.warn(`❌ Failed to fetch from ${ep}:`, error);
      }
    }
    
    console.warn('🚨 All endpoints failed, falling back to mock data');
    
    // Apply currency conversion to mock plans if needed
    const userCurrency = targetCurrency || await getUserPreferredCurrency();
    if (userCurrency && mockPlans.length > 0 && mockPlans[0].currency !== userCurrency) {
      console.log(`💱 Converting mock plans from ${mockPlans[0].currency} to ${userCurrency}`);
      const convertedMockPlans = await convertSubscriptionPlans(mockPlans, userCurrency);
      return convertedMockPlans;
    }
    
    return mockPlans;
  } catch (error) {
    console.error('🚨 Critical error in getPublicPlans:', error);
    return mockPlans;
  }
}

// Fetch plans by billing interval (Monthly or Annual) with geolocation-aware pricing
export async function getPlansByInterval(interval: 'Monthly' | 'Annual', targetCurrency?: string): Promise<SubscriptionPlan[]> {
  try {
    console.log(`🔍 Fetching plans for interval: ${interval}`);
    
    // Try backend-specific interval endpoints first
    const billingIntervalEndpoints = interval === 'Annual'
      ? ['/api/subscription-plans/billing-interval/Annual', '/api/subscription-plans/billing-interval/4']
      : ['/api/subscription-plans/billing-interval/Monthly', '/api/subscription-plans/billing-interval/1'];

    // Add fallback endpoints
    const fallbackEndpoints = ['/api/subscription-plans', '/api/plans', '/api/subscriptions/plans'];
    const allEndpoints = [...billingIntervalEndpoints, ...fallbackEndpoints];

    for (const ep of allEndpoints) {
      try {
        console.log(`🔍 Trying endpoint: ${ep}`);
        const data = await http.get<SubscriptionPlansResponse>(ep);
        const backendPlans = Array.isArray(data) ? data : data.items;
        
        if (backendPlans && backendPlans.length) {
          console.log(`✅ Fetched ${backendPlans.length} plans from ${ep}`);
          
          const mapped = backendPlans
            .map(mapBackendPlanToFrontend)
            .filter(p => p.interval === interval);
            
          if (mapped.length) {
            console.log(`🎯 Found ${mapped.length} ${interval} plans:`, mapped);
            // Ensure price consistency before returning
            const consistentPlans = ensurePriceConsistency([...backendPlans.map(mapBackendPlanToFrontend)])
              .filter(p => p.interval === interval);
            console.log(`✅ Price-consistent ${interval} plans:`, consistentPlans);
            
            // Apply currency conversion if needed
            const userCurrency = targetCurrency || await getUserPreferredCurrency();
            if (userCurrency && consistentPlans.length > 0 && consistentPlans[0].currency !== userCurrency) {
              console.log(`💱 Converting plans from ${consistentPlans[0].currency} to ${userCurrency}`);
              const convertedPlans = await convertSubscriptionPlans(consistentPlans, userCurrency);
              return convertedPlans;
            }
            
            return consistentPlans;
          } else {
            console.warn(`⚠️ No ${interval} plans found in response from ${ep}`);
          }
        }
      } catch (error) {
        console.warn(`❌ Failed to fetch from ${ep}:`, error);
      }
    }
    
    console.warn(`🚨 All endpoints failed, using mock ${interval} plans`);
    const mockPlansForInterval = mockPlans.filter(p => p.interval === interval);
    
    // Apply currency conversion to mock plans if needed
    const userCurrency = targetCurrency || await getUserPreferredCurrency();
    if (userCurrency && mockPlansForInterval.length > 0 && mockPlansForInterval[0].currency !== userCurrency) {
      console.log(`💱 Converting mock plans from ${mockPlansForInterval[0].currency} to ${userCurrency}`);
      const convertedMockPlans = await convertSubscriptionPlans(mockPlansForInterval, userCurrency);
      return convertedMockPlans;
    }
    
    return mockPlansForInterval;
  } catch (error) {
    console.error(`🚨 Critical error in getPlansByInterval for ${interval}:`, error);
    return mockPlans.filter(p => p.interval === interval);
  }
}

export async function createCheckoutSession(planId: string, yearly: boolean, personalInfo?: any): Promise<{ redirectUrl?: string; sessionId?: string }>
{
  try {
    const body: any = { planId, cadence: yearly ? 'annual' : 'monthly' };
    
    // Include personal information if provided
    if (personalInfo) {
      body.personalInfo = personalInfo;
    }
    
    const endpoints = ['/api/checkout/session', '/api/checkout/initialize'];
    for (const ep of endpoints) {
      try {
        const res = await http.post<CheckoutSessionResponse>(ep, body);
        // return either redirect or sessionId for modal flow
        return { redirectUrl: res?.redirectUrl, sessionId: res?.sessionId };
      } catch { /* try next */ }
    }
    return {};
  } catch {
    return {};
  }
}

export async function confirmCheckout(sessionId: string, email: string): Promise<CheckoutConfirmResponse | null>
{
  try {
    const body: CheckoutConfirmRequest = { sessionId, email };
    const res = await http.post<CheckoutConfirmResponse>('/api/checkout/confirm', body);
    return res ?? null;
  } catch {
    return null;
  }
}

// Attach pending subscription to authenticated user and return fresh entitlements
export type AttachResponse = { attached: boolean; entitlements?: Entitlements; message?: string };
export async function attachPendingSubscription(sessionId?: string): Promise<AttachResponse>
{
  try {
    const res = await http.post<AttachResponse>(
      '/api/checkout/attach',
      sessionId ? { sessionId } : {}
    );
    return res;
  } catch {
    return { attached: false, message: 'Attach failed' };
  }
}

// Start hosted Stripe checkout for authenticated user
export async function startHostedCheckout(planId: string, yearly: boolean, personalInfo?: any): Promise<{ url?: string }>
{
  try {
    const cadence = yearly ? 'annual' : 'monthly';
    const payload: any = { planId, cadence };
    
    // Include personal information if provided
    if (personalInfo) {
      payload.personalInfo = personalInfo;
    }
    
    const res = await http.post<{ url?: string }>(
      '/api/billing/checkout',
      payload
    );
    return res ?? {};
  } catch {
    return {};
  }
}

// Email verification functions
export type EmailCheckResponse = { accountExists: boolean; status: string; message?: string };
export async function checkEmail(email: string): Promise<EmailCheckResponse | null>
{
  try {
    const res = await http.post<EmailCheckResponse>('/api/checkout/check-email', { email });
    return res;
  } catch {
    return null;
  }
}

export type SendVerificationResponse = { sent: boolean; status: string; message?: string };
export async function sendVerificationEmail(email: string, sessionId: string, planId: string, cadence?: string): Promise<SendVerificationResponse | null>
{
  try {
    const res = await http.post<SendVerificationResponse>('/api/checkout/send-verification', {
      email,
      sessionId,
      planId,
      cadence
    });
    return res;
  } catch {
    return null;
  }
}

export type VerifyEmailResponse = { verified: boolean; status: string; message?: string; redirectUrl?: string };
export async function verifyEmail(token: string, sessionId: string): Promise<VerifyEmailResponse | null>
{
  try {
    const res = await http.post<VerifyEmailResponse>('/api/checkout/verify-email', {
      token,
      sessionId
    });
    return res;
  } catch {
    return null;
  }
}
