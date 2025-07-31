// Architecture Test Page
// Page to test and verify the hexagonal architecture implementation

import React from 'react';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ArchitectureTest from '../../components/Debug/ArchitectureTest';

const ArchitectureTestPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900">
              Architecture Test
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">Hexagonal Architecture</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Architecture Verification
              </h2>
              <p className="text-gray-600 mb-4">
                This page helps you verify that your frontend is running on the new hexagonal architecture.
                It tests the dependency injection container, service adapters, and React hooks integration.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">What this page tests:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Dependency injection container initialization</li>
                  <li>• API client adapter (Axios implementation)</li>
                  <li>• Storage adapters (LocalStorage/SessionStorage)</li>
                  <li>• Notification service adapter (SignalR)</li>
                  <li>• Application services (User & Product management)</li>
                  <li>• React hooks integration (useAuth, useProducts)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture Test Component */}
        <ArchitectureTest />

        {/* Migration Guide */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Migration Guide
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-2">
                1. Replace Old Hooks
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                Replace old hooks with new architecture hooks:
              </p>
              <div className="bg-gray-50 rounded-md p-3 text-sm font-mono">
                <div className="text-red-600">- import {'{ useCurrentUser }'} from './hooks/useAuth';</div>
                <div className="text-green-600">+ import {'{ useAuth }'} from './architecture/adapters/primary/hooks';</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-2">
                2. Update Component Logic
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                Update your components to use the new hook structure:
              </p>
              <div className="bg-gray-50 rounded-md p-3 text-sm font-mono">
                <div className="text-red-600">- const {'{ data: currentUser }'} = useCurrentUser();</div>
                <div className="text-green-600">+ const {'{ currentUser }'} = useAuth();</div>
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium text-gray-900 mb-2">
                3. Verify Architecture Provider
              </h3>
              <p className="text-gray-600 text-sm">
                Ensure your App.tsx is wrapped with ArchitectureProvider (✅ Already done in your app).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureTestPage;