import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';

interface AnimatedStatsCardProps {
  title: string;
  value: number;
  formattedValue?: string;
  icon: LucideIcon;
  iconColor: string;
  borderColor: string;
  subtitle?: string;
  isLoading?: boolean;
  error?: boolean;
}

const AnimatedStatsCard: React.FC<AnimatedStatsCardProps> = ({
  title,
  value,
  formattedValue,
  icon: Icon,
  iconColor,
  borderColor,
  subtitle,
  isLoading = false,
  error = false,
}) => {
  const { value: animatedValue, isAnimating } = useCountUp({
    end: value,
    duration: 2000,
    preserveValue: false,
  });

  const displayValue = formattedValue || animatedValue;

  if (isLoading) {
    return (
      <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 bg-gradient-to-br ${iconColor} rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse`}>
            <div className="w-7 h-7 bg-white/30 rounded"></div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {title}
            </div>
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-1"></div>
            {subtitle && (
              <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4"></div>
            )}
          </div>
        </div>
        <div className={`absolute top-0 right-0 w-1 h-full bg-gradient-to-b ${borderColor} rounded-r-2xl`}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-red-200 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Icon className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {title}
            </div>
            <div className="text-2xl font-bold text-red-600">
              Error
            </div>
            <small className="text-red-400 text-xs">
              Failed to load data
            </small>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-red-500 to-red-600 rounded-r-2xl"></div>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 bg-gradient-to-br ${iconColor} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
          <Icon className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {title}
          </div>
          <div className={`text-2xl font-bold text-gray-900 transition-all duration-300 ${isAnimating ? 'text-blue-600' : ''}`}>
            {displayValue}
          </div>
          {subtitle && (
            <small className="text-gray-400 text-xs">
              {subtitle}
            </small>
          )}
        </div>
      </div>
      <div className={`absolute top-0 right-0 w-1 h-full bg-gradient-to-b ${borderColor} rounded-r-2xl`}></div>
    </div>
  );
};

export default AnimatedStatsCard;