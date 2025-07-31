// Legacy Bridge
// Provides backward compatibility for existing components during migration

import React from 'react';
import { useProducts as useNewProducts, useAuth as useNewAuth } from './hooks';
import type { 
  UserDto, 
  ProductDto, 
  PaginationParams, 
  ProductFilters,
  PaginatedResponse 
} from '../../types/index';

// Bridge for existing useProducts hook
export const useLegacyProducts = (
  pagination: PaginationParams,
  filters?: ProductFilters
) => {
  const {
    products,
    totalProducts,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    error,
    refetchProducts,
    updateFilters,
  } = useNewProducts();

  // Apply filters from parameters
  React.useEffect(() => {
    const newFilters: Record<string, unknown> = {
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
    };

    if (filters?.search) {
      newFilters.search = filters.search;
    }
    if (filters?.isActive !== undefined) {
      newFilters.isActive = filters.isActive;
    }
    if (filters?.lowStock !== undefined) {
      newFilters.stockStatus = filters.lowStock ? 'low' : undefined;
    }

    updateFilters(newFilters);
  }, [pagination.pageNumber, pagination.pageSize, filters, updateFilters]);

  // Transform new architecture data to legacy format
  const transformedData: PaginatedResponse<ProductDto> = {
    data: products.map(product => ({
      id: product.id.toString(),
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      costPerItem: product.cost,
      numberInStock: product.quantity,
      totalValue: product.totalValue,
      isActive: product.isActive,
      isInStock: product.quantity > 0,
      isLowStock: product.isLowStock,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    })),
    totalCount: totalProducts,
    pageNumber: currentPage,
    pageSize: pagination.pageSize,
    totalPages: totalPages,
    hasNextPage: hasNextPage,
    hasPreviousPage: hasPreviousPage,
  };

  return {
    data: transformedData,
    isLoading,
    error: error ? new Error(error.toString()) : null,
    refetch: refetchProducts,
  };
};

// Bridge for existing useAuth hook
export const useLegacyAuth = () => {
  const {
    currentUser,
    isLoggedIn,
    isLoadingCurrentUser,
    isLoggingIn,
    isLoggingOut,
    login,
    logout,
    loginError,
  } = useNewAuth();

  // Transform new architecture user to legacy format
  const transformedUser: UserDto | null = currentUser ? {
    id: currentUser.id.toString(),
    username: currentUser.username,
    email: currentUser.email,
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    role: currentUser.role.name as string, // Legacy role format
    isActive: currentUser.isActive,
    createdAt: currentUser.createdAt.toISOString(),
    lastLoginAt: currentUser.lastLoginAt?.toISOString(),
  } : null;

  return {
    user: transformedUser,
    isAuthenticated: isLoggedIn(),
    isLoading: isLoadingCurrentUser || isLoggingIn || isLoggingOut,
    login: async (email: string, password: string) => {
      return new Promise((resolve, reject) => {
        login(
          { username: email, password },
          {
            onSuccess: (user) => {
              resolve({
                user: {
                  id: user.id.toString(),
                  username: user.username,
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  role: user.role.name as string,
                  isActive: user.isActive,
                  createdAt: user.createdAt.toISOString(),
                  lastLoginAt: user.lastLoginAt?.toISOString(),
                },
                token: 'legacy-token', // Legacy format
              });
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    },
    logout,
    hasPermission: (permission: string) => {
      return currentUser?.hasPermission(permission) || false;
    },
    hasAnyPermission: (permissions: string[]) => {
      return currentUser?.hasAnyPermission(permissions) || false;
    },
    hasAllPermissions: (permissions: string[]) => {
      return permissions.every(p => currentUser?.hasPermission(p)) || false;
    },
    hasRole: (role: string) => {
      return currentUser?.isInRole(role) || false;
    },
    hasAnyRole: (roles: string[]) => {
      return roles.some(r => currentUser?.isInRole(r)) || false;
    },
    refreshUser: async () => {
      // Implementation for refreshing user
    },
    error: loginError,
  };
};