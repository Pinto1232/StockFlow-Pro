// Architecture Hooks
// React hooks for accessing architecture dependencies

import { useContext } from 'react';
import { ArchitectureContext, Dependencies } from './ArchitectureContext';
import { useUserManagement } from './useUserManagement';
import { useProductManagement } from './useProductManagement';

// Hook to access dependencies
export const useArchitecture = (): Dependencies => {
  const context = useContext(ArchitectureContext);
  if (!context) {
    throw new Error('useArchitecture must be used within an ArchitectureProvider');
  }
  return context;
};

// Individual hooks for specific services
export const useApiClient = () => {
  const { apiClient } = useArchitecture();
  return apiClient;
};

export const useLocalStorage = () => {
  const { localStorage } = useArchitecture();
  return localStorage;
};

export const useSessionStorage = () => {
  const { sessionStorage } = useArchitecture();
  return sessionStorage;
};

export const useNotificationService = () => {
  const { notificationService } = useArchitecture();
  return notificationService;
};

export const useUserManagementService = () => {
  const { userManagementService } = useArchitecture();
  return userManagementService;
};

export const useProductManagementService = () => {
  const { productManagementService } = useArchitecture();
  return productManagementService;
};

// High-level hooks that combine services with React Query
export const useUsers = () => {
  const userManagementService = useUserManagementService();
  return useUserManagement({ userService: userManagementService, enableUsersQuery: true });
};

export const useProducts = () => {
  const productManagementService = useProductManagementService();
  return useProductManagement({ productService: productManagementService });
};

// Authentication hook that extracts auth-related functionality from user management
// This hook only fetches current user, not all users
export const useAuth = () => {
  const userManagementService = useUserManagementService();
  const userManagement = useUserManagement({ userService: userManagementService, enableUsersQuery: false });
  
  return {
    currentUser: userManagement.currentUser,
    isLoggedIn: userManagement.isLoggedIn,
    isLoadingCurrentUser: userManagement.isLoadingCurrentUser,
    isLoggingIn: userManagement.isLoggingIn,
    isLoggingOut: userManagement.isLoggingOut,
    login: userManagement.login,
    logout: userManagement.logout,
    loginError: userManagement.loginError,
    refreshCurrentUser: userManagement.refreshCurrentUser,
  };
};