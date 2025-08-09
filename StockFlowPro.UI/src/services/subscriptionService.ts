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

export async function getPublicPlans(): Promise<SubscriptionPlan[]> {
  try {
    // Try a few common endpoints; backend may not expose yet
    const endpoints = ['/api/subscription-plans', '/api/plans', '/api/subscriptions/plans'];
    for (const ep of endpoints) {
      try {
        const data = await http.get<SubscriptionPlan[] | { items: SubscriptionPlan[] }>(ep);
        // Handle possible envelope
        const plans = Array.isArray(data) ? data : (data as any).items;
        if (plans && plans.length) return plans as SubscriptionPlan[];
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
