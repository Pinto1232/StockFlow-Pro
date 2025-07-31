// Architecture Provider
// React context provider that makes the hexagonal architecture available to the entire app

import React, { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getDependencies } from '../../shared/DependencyContainer';
import { ArchitectureContext, Dependencies } from './ArchitectureContext';
import { queryClient } from './QueryClient';

interface ArchitectureProviderProps {
  children: ReactNode;
  dependencies?: Dependencies; // Allow dependency injection for testing
}

export const ArchitectureProvider: React.FC<ArchitectureProviderProps> = ({
  children,
  dependencies,
}) => {
  const deps = dependencies || getDependencies();

  return (
    <QueryClientProvider client={queryClient}>
      <ArchitectureContext.Provider value={deps}>
        {children}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </ArchitectureContext.Provider>
    </QueryClientProvider>
  );
};