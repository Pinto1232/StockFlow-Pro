import React from 'react';
import { config, isDevelopment, isStaging, isProduction, isDocker } from '../../config/environment';

interface EnvironmentInfoProps {
  className?: string;
  showDetails?: boolean;
}

export const EnvironmentInfo: React.FC<EnvironmentInfoProps> = ({ 
  className = '', 
  showDetails = false 
}) => {
  // Only show in development and staging environments
  if (isProduction && !showDetails) {
    return null;
  }

  const getEnvironmentColor = () => {
    if (isDevelopment) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (isStaging) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (isProduction) return 'bg-red-100 text-red-800 border-red-200';
    if (isDocker) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getEnvironmentIcon = () => {
    if (isDevelopment) return '🔧';
    if (isStaging) return '🚧';
    if (isProduction) return '🚀';
    if (isDocker) return '🐳';
    return '❓';
  };

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-md border text-xs font-medium ${getEnvironmentColor()} ${className}`}>
      <span className="mr-1">{getEnvironmentIcon()}</span>
      <span className="uppercase">{config.APP_ENV}</span>
      
      {showDetails && (
        <div className="ml-2 text-xs opacity-75">
          | API: {config.API_BASE_URL}
        </div>
      )}
    </div>
  );
};

export const EnvironmentDetails: React.FC = () => {
  // Only show in development environments
  if (!isDevelopment && !isStaging) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-xs max-w-sm z-50">
      <h3 className="font-semibold mb-2 flex items-center">
        <span className="mr-2">{getEnvironmentIcon()}</span>
        Environment Configuration
      </h3>
      
      <div className="space-y-1 text-gray-600">
        <div><strong>Environment:</strong> {config.APP_ENV}</div>
        <div><strong>Node ENV:</strong> {config.NODE_ENV}</div>
        <div><strong>API URL:</strong> {config.API_BASE_URL}</div>
        <div><strong>WebSocket:</strong> {config.WS_URL}</div>
        <div><strong>Debug:</strong> {config.ENABLE_DEBUG ? '✅' : '❌'}</div>
        <div><strong>DevTools:</strong> {config.ENABLE_DEVTOOLS ? '✅' : '❌'}</div>
        <div><strong>API Logging:</strong> {config.ENABLE_API_LOGGING ? '✅' : '❌'}</div>
        <div><strong>Cache:</strong> {config.ENABLE_CACHE ? '✅' : '❌'}</div>
        <div><strong>Timeout:</strong> {config.API_TIMEOUT}ms</div>
      </div>
    </div>
  );

  function getEnvironmentIcon() {
    if (isDevelopment) return '🔧';
    if (isStaging) return '🚧';
    if (isProduction) return '🚀';
    if (isDocker) return '🐳';
    return '❓';
  }
};

export default EnvironmentInfo;