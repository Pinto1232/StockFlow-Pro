import React from 'react';
import LoadingState, { LoadingStateProps } from './LoadingState';
import ErrorState, { ErrorStateProps } from './ErrorState';

export interface DataBoundaryProps {
  isLoading: boolean;
  isError?: boolean;
  error?: unknown;
  loadingProps?: LoadingStateProps;
  errorProps?: Omit<ErrorStateProps, 'error'>;
  children: React.ReactNode;
  retry?: () => void;
}

/**
 * Unified wrapper for query states: loading -> error -> content.
 */
const DataBoundary: React.FC<DataBoundaryProps> = ({
  isLoading,
  isError,
  error,
  loadingProps,
  errorProps,
  children,
  retry,
}) => {
  if (isLoading) {
    return <LoadingState {...loadingProps} />;
  }
  if (isError) {
    return (
      <ErrorState
        error={error}
        onRetry={retry}
        title={errorProps?.title || 'Failed to load data'}
        message={errorProps?.message}
        className={errorProps?.className}
        small={errorProps?.small}
      />
    );
  }
  return <>{children}</>;
};

export default DataBoundary;
