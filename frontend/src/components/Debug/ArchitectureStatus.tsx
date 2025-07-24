// Architecture Status Component
// Debug component to verify the hexagonal architecture is properly loaded

import React from 'react';
import { useArchitecture } from '../../architecture/adapters/primary/hooks';

interface ArchitectureStatusProps {
  showDetails?: boolean;
}

export const ArchitectureStatus: React.FC<ArchitectureStatusProps> = ({ 
  showDetails = false 
}) => {
  try {
    const dependencies = useArchitecture();
    
    const status = {
      apiClient: !!dependencies.apiClient,
      localStorage: !!dependencies.localStorage,
      sessionStorage: !!dependencies.sessionStorage,
      notificationService: !!dependencies.notificationService,
      userManagementService: !!dependencies.userManagementService,
      productManagementService: !!dependencies.productManagementService,
    };

    const allLoaded = Object.values(status).every(Boolean);

    if (!showDetails) {
      return (
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          allLoaded 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            allLoaded ? 'bg-green-400' : 'bg-red-400'
          }`} />
          Architecture: {allLoaded ? 'Active' : 'Error'}
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            allLoaded ? 'bg-green-400' : 'bg-red-400'
          }`} />
          Hexagonal Architecture Status
        </h3>
        
        <div className="space-y-2">
          {Object.entries(status).map(([service, isLoaded]) => (
            <div key={service} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 capitalize">
                {service.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isLoaded 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isLoaded ? '✓ Loaded' : '✗ Missing'}
              </span>
            </div>
          ))}
        </div>

        {allLoaded && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">
              ✅ All architecture components are properly initialized and ready to use.
            </p>
          </div>
        )}

        {!allLoaded && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">
              ❌ Some architecture components failed to initialize. Check the console for errors.
            </p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Architecture Error
        </h3>
        <p className="text-sm text-red-700">
          Failed to access architecture context. Make sure ArchitectureProvider is wrapping your app.
        </p>
        {showDetails && (
          <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        )}
      </div>
    );
  }
};

export default ArchitectureStatus;