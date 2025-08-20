import React from 'react';

export interface LoadingStateProps {
  message?: string;
  dimmed?: boolean;
  inline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'spinner' | 'skeleton' | 'bar';
  skeletonLines?: number;
}

const sizeMap: Record<string, { spinner: string; gap: string; text: string }> = {
  sm: { spinner: 'h-4 w-4', gap: 'gap-2', text: 'text-xs' },
  md: { spinner: 'h-8 w-8', gap: 'gap-3', text: 'text-sm' },
  lg: { spinner: 'h-12 w-12', gap: 'gap-4', text: 'text-base' },
};

const shimmer = 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  dimmed = false,
  inline = false,
  size = 'md',
  className = '',
  variant = 'spinner',
  skeletonLines = 3,
}) => {
  const sizing = sizeMap[size] || sizeMap.md;

  const spinnerEl = (
    <div className="relative">
      <div
        className={[
          'rounded-full border-[3px] md:border-4 border-transparent',
          'bg-[conic-gradient(var(--tw-gradient-stops))] from-blue-500 via-indigo-500 to-blue-500',
          'animate-spin-slow',
          sizing.spinner,
          'p-[2px] shadow-lg shadow-blue-500/20',
        ].join(' ')}
      >
        <div className="h-full w-full rounded-full bg-white dark:bg-slate-900" />
      </div>
      <div className="absolute inset-0 animate-ping-slow rounded-full bg-blue-500/10" />
    </div>
  );

  const skeletonEl = (
    <div className={`w-full flex flex-col ${sizing.gap}`} aria-hidden>
      {Array.from({ length: skeletonLines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 rounded-md bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 ${shimmer} ${i === 0 ? 'w-3/4' : i === skeletonLines - 1 ? 'w-1/2' : 'w-full'}`}
        />
      ))}
    </div>
  );

  const barEl = (
    <div className="w-full max-w-xs h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
      <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 animate-loading-bar" />
    </div>
  );

  const body = (
    <div
      className={[
        'flex items-center',
        inline ? 'flex-row' : 'flex-col',
        sizing.gap,
        !inline && 'py-8',
        'animate-fade-in',
        className,
      ].filter(Boolean).join(' ')}
      role="status"
      aria-busy="true"
    >
      {variant === 'spinner' && spinnerEl}
      {variant === 'skeleton' && skeletonEl}
      {variant === 'bar' && barEl}
      {message && (
        <span className={`${sizing.text} font-medium bg-clip-text text-transparent bg-gradient-to-r from-slate-500 via-slate-700 to-slate-500 animate-gradient-x dark:from-slate-300 dark:via-slate-100 dark:to-slate-300`}>{message}</span>
      )}
    </div>
  );

  if (dimmed && !inline) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-10">
          {body}
        </div>
      </div>
    );
  }

  return body;
};

export default LoadingState;

// Tailwind keyframes (if not already in a global CSS, these comments indicate expected custom utilities):
// .animate-spin-slow { animation: spin 1.2s linear infinite; }
// .animate-ping-slow { animation: ping 2s cubic-bezier(0,0,0.2,1) infinite; }
// @keyframes shimmer { 100% { transform: translateX(100%); } }
// .animate-loading-bar { animation: loading-bar 1.2s ease-in-out infinite; }
// @keyframes loading-bar { 0% { transform: translateX(-100%); } 50% { transform: translateX(50%); } 100% { transform: translateX(300%); } }
