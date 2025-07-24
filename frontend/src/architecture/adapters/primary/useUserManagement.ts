// Primary Adapter: User Management Hook
// React hook that provides user management functionality to UI components

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserEntity } from '../../domain/entities/User';
import { UserManagementService } from '../../application/UserManagementService';
import { 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserFilters
} from '../../ports/primary/UserManagementPort';

interface UseUserManagementProps {
  userService: UserManagementService;
  enableUsersQuery?: boolean; // Optional parameter to enable users query
}

export const useUserManagement = ({ userService, enableUsersQuery = false }: UseUserManagementProps) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<UserFilters>({});

  // Query: Get users with pagination and filtering
  // Only enabled when explicitly requested or when user has ViewAll permission
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.getUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: enableUsersQuery, // Only enabled when explicitly requested
  });

  // Query: Get current user
  const {
    data: currentUser,
    isLoading: isLoadingCurrentUser,
    error: currentUserError,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => userService.getCurrentUser(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry on auth failures
    enabled: userService.isLoggedIn(), // Only run if user is logged in
  });

  // Mutation: Create user
  const createUserMutation = useMutation({
    mutationFn: (request: CreateUserRequest) => userService.createUser(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Mutation: Update user
  const updateUserMutation = useMutation({
    mutationFn: (request: UpdateUserRequest) => userService.updateUser(request),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.setQueryData(['user', updatedUser.id], updatedUser);
      
      // If updating current user, update that cache too
      if (currentUser && currentUser.id === updatedUser.id) {
        queryClient.setQueryData(['currentUser'], updatedUser);
      }
    },
  });

  // Mutation: Delete user
  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => userService.deleteUser(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Mutation: Activate user
  const activateUserMutation = useMutation({
    mutationFn: (id: number) => userService.activateUser(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Mutation: Deactivate user
  const deactivateUserMutation = useMutation({
    mutationFn: (id: number) => userService.deactivateUser(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Mutation: Login
  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      userService.login(username, password),
    onSuccess: (user) => {
      queryClient.setQueryData(['currentUser'], user);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Mutation: Logout
  const logoutMutation = useMutation({
    mutationFn: () => userService.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });

  // Mutation: Change password
  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      userService.changePassword(currentPassword, newPassword),
  });

  // Helper functions
  const updateFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const getUserById = useCallback(async (id: number): Promise<UserEntity> => {
    // Check cache first
    const cachedUser = queryClient.getQueryData<UserEntity>(['user', id]);
    if (cachedUser) {
      return cachedUser;
    }

    // Fetch from service
    const user = await userService.getUserById(id.toString());
    queryClient.setQueryData(['user', id], user);
    return user;
  }, [queryClient, userService]);

  const refreshCurrentUser = useCallback(async () => {
    const user = await userService.refreshCurrentUser();
    queryClient.setQueryData(['currentUser'], user);
    return user;
  }, [queryClient, userService]);

  const isLoggedIn = useCallback(() => {
    return userService.isLoggedIn();
  }, [userService]);

  // Computed values
  const users = usersData?.users || [];
  const totalUsers = usersData?.totalCount || 0;
  const currentPage = usersData?.currentPage || 1;
  const totalPages = usersData?.totalPages || 1;
  const hasNextPage = usersData?.hasNextPage || false;
  const hasPreviousPage = usersData?.hasPreviousPage || false;

  const isLoading = isLoadingUsers || isLoadingCurrentUser;
  const error = usersError || currentUserError;

  return {
    // Data
    users,
    currentUser,
    totalUsers,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    filters,

    // Loading states
    isLoading,
    isLoadingUsers,
    isLoadingCurrentUser,
    error,

    // Mutations
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    activateUser: activateUserMutation.mutate,
    deactivateUser: deactivateUserMutation.mutate,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    changePassword: changePasswordMutation.mutate,

    // Mutation states
    isCreatingUser: createUserMutation.isPending,
    isUpdatingUser: updateUserMutation.isPending,
    isDeletingUser: deleteUserMutation.isPending,
    isActivatingUser: activateUserMutation.isPending,
    isDeactivatingUser: deactivateUserMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,

    // Mutation errors
    createUserError: createUserMutation.error,
    updateUserError: updateUserMutation.error,
    deleteUserError: deleteUserMutation.error,
    loginError: loginMutation.error,
    changePasswordError: changePasswordMutation.error,

    // Helper functions
    updateFilters,
    clearFilters,
    getUserById,
    refreshCurrentUser,
    refetchUsers,
    isLoggedIn,
  };
};

export type UseUserManagementReturn = ReturnType<typeof useUserManagement>;