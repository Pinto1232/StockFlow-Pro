// Architecture Test Component
// Component to test and demonstrate the new hexagonal architecture

import React, { useState } from 'react';
import { useProducts, useAuth } from '../../architecture/adapters/primary/hooks';
import ArchitectureStatus from './ArchitectureStatus';

export const ArchitectureTest: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Test the new architecture hooks
  const { 
    products, 
    isLoading: isLoadingProducts, 
    error: productsError,
    totalProducts 
  } = useProducts();
  
  const { 
    currentUser, 
    isLoggedIn, 
    isLoadingCurrentUser 
  } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Architecture Test Dashboard
          </h2>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        <ArchitectureStatus showDetails={showDetails} />
      </div>

      {/* Authentication Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Authentication Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Login Status</h4>
            <p className={`text-sm ${isLoggedIn() ? 'text-green-600' : 'text-red-600'}`}>
              {isLoggedIn() ? '✓ Logged In' : '✗ Not Logged In'}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Current User</h4>
            {isLoadingCurrentUser ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : currentUser ? (
              <div className="text-sm">
                <p className="text-gray-700">{currentUser.username}</p>
                <p className="text-gray-500">{currentUser.email}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No user data</p>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">User Role</h4>
            <p className="text-sm text-gray-700">
              {currentUser?.role ? 
                (typeof currentUser.role === 'object' ? currentUser.role.name : String(currentUser.role)) 
                : 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* Products Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Products Service Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Loading State</h4>
            <p className={`text-sm ${isLoadingProducts ? 'text-yellow-600' : 'text-green-600'}`}>
              {isLoadingProducts ? '⏳ Loading...' : '✓ Ready'}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Total Products</h4>
            <p className="text-sm text-gray-700">
              {totalProducts || 0} products
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Error Status</h4>
            <p className={`text-sm ${productsError ? 'text-red-600' : 'text-green-600'}`}>
              {productsError ? '✗ Error occurred' : '✓ No errors'}
            </p>
          </div>
        </div>

        {productsError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">
              Error: {productsError.toString()}
            </p>
          </div>
        )}

        {products.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Sample Products</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                Showing first 3 products (via new architecture):
              </p>
              <ul className="space-y-1">
                {products.slice(0, 3).map((product) => (
                  <li key={product.id} className="text-sm text-gray-700">
                    • {product.name} - {product.sku}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* API Client Test */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">API Client Test</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> If you see data above, your new hexagonal architecture is working correctly!
            The components are using the new hooks (useProducts, useAuth) which internally use the 
            dependency injection container and secondary adapters.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureTest;