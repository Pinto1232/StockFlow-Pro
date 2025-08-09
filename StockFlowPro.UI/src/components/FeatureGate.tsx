import React from 'react';
import { useFeatures } from '../hooks/useFeatures';

type Props = {
  feature: 'AdvancedReporting' | 'ApiAccess' | 'PrioritySupport';
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export const FeatureGate: React.FC<Props> = ({ feature, fallback = null, children }) => {
  const { data } = useFeatures();

  const allowed = (() => {
    if (!data) return false;
    switch (feature) {
      case 'AdvancedReporting': return data.hasAdvancedReporting;
      case 'ApiAccess': return data.hasApiAccess;
      case 'PrioritySupport': return data.hasPrioritySupport;
      default: return false;
    }
  })();

  return allowed ? <>{children}</> : <>{fallback}</>;
};
