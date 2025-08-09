import { http } from './api/client';

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price: number; // monthly price
  interval: 'Monthly' | 'Annual';
  currency: string;
  sortOrder?: number;
  features?: string[];
  isPopular?: boolean;
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

// Helper function to convert backend plan to frontend format
function mapBackendPlanToFrontend(backendPlan: BackendSubscriptionPlan): SubscriptionPlan {
  const features: string[] = [];
  
  // Add features based on backend flags
  if (backendPlan.maxUsers) {
    features.push(`Up to ${backendPlan.maxUsers} users`);
  } else if (backendPlan.maxUsers === null) {
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
  
  // Determine if this is a popular plan (Professional is usually popular)
  const isPopular = backendPlan.name.toLowerCase().includes('professional');
  
  return {
    id: backendPlan.id,
    name: backendPlan.name,
    description: backendPlan.description,
    price: backendPlan.monthlyEquivalentPrice, // Use monthly equivalent for comparison
    interval: backendPlan.billingInterval === 4 ? 'Annual' : 'Monthly',
    currency: backendPlan.currency,
    sortOrder: backendPlan.sortOrder,
    features,
    isPopular,
  };
}

export async function getPublicPlans(): Promise<SubscriptionPlan[]> {
  try {
    // Try a few common endpoints; backend may not expose yet
    const endpoints = ['/api/subscription-plans', '/api/plans', '/api/subscriptions/plans'];
    for (const ep of endpoints) {
      try {
        const data = await http.get<SubscriptionPlansResponse>(ep);
        // Handle possible envelope
        const backendPlans = Array.isArray(data) ? data : data.items;
        if (backendPlans && backendPlans.length) {
          // Map backend plans to frontend format
          return backendPlans.map(mapBackendPlanToFrontend);
        }
      } catch { /* try next */ }
    }
    // Fallback to mock if no endpoint is available
    return mockPlans;
  } catch {
    return mockPlans;
  }
}

export async function createCheckoutSession(planId: string, yearly: boolean): Promise<{ redirectUrl?: string }>
{
  try {
    const body = { planId, cadence: yearly ? 'annual' : 'monthly' };
    const endpoints = ['/api/checkout/session', '/api/checkout/initialize'];
    for (const ep of endpoints) {
      try {
        const res = await http.post<{ url?: string; redirectUrl?: string }>(ep, body);
        return { redirectUrl: res?.url || res?.redirectUrl };
      } catch { /* try next */ }
    }
    return {};
  } catch {
    return {};
  }
}
