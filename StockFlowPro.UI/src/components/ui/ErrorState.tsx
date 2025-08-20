import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface ErrorStateProps {
  error?: unknown;
  title?: string;
  message?: string;
  onRetry?: () => void;
  small?: boolean;
  className?: string;
}

const extractMessage = (err: unknown): string => {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  // @ts-expect-error axios style
  if (err?.response?.data?.message) return String(err.response.data.message);
  try { return JSON.stringify(err); } catch { return 'Unexpected error'; }
};

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  title = 'Something went wrong',
  message,
  onRetry,
  small = false,
  className = ''
}) => {
  const finalMessage = message || extractMessage(error);
  return (
    <div className={`flex ${small ? 'flex-row items-center gap-2 py-2' : 'flex-col items-center text-center py-10'} text-red-600 ${className}`}>
      <AlertTriangle className={small ? 'h-4 w-4' : 'h-10 w-10 mb-4'} />
      <div className={small ? 'flex-1' : ''}>
        <p className={`font-semibold ${small ? 'text-sm' : 'text-lg'}`}>{title}</p>
        <p className={`mt-1 ${small ? 'text-xs' : 'text-sm text-gray-600'}`}>{finalMessage}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
