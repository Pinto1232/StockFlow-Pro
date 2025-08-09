import { useQuery } from '@tanstack/react-query';
import { http } from '../services/api/client';

export type Entitlements = {
  hasAdvancedReporting: boolean;
  hasApiAccess: boolean;
  hasPrioritySupport: boolean;
  maxUsers?: number | null;
  maxProjects?: number | null;
  maxStorageGB?: number | null;
  planId: string;
  planName: string;
  currency: string;
  price: number;
  billingInterval: string;
  isTrial: boolean;
  trialEndDate?: string | null;
};

export const featuresQueryKey = ['features'];

export function useFeatures() {
  return useQuery({
    queryKey: featuresQueryKey,
    queryFn: async (): Promise<Entitlements> => await http.get<Entitlements>('/api/profile/features'),
    staleTime: 5 * 60 * 1000,
  });
}
