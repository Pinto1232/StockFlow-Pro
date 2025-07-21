import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import type { LoginRequest, RegisterRequest } from '../types/index';

// Query keys
export const authKeys = {
  currentUser: ['auth', 'currentUser'] as const,
};

// Get current user hook
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: () => {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('No authenticated user');
      return user;
    },
    enabled: authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.currentUser, data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
      // Redirect to dashboard after successful login
      window.location.href = '/dashboard';
    },
  });
};

// Register mutation
export const useRegister = () => {
  return useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/login';
    },
  });
};

// Forgot password mutation
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });
};

// Reset password mutation
export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authService.resetPassword(token, newPassword),
  });
};

// Change password mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => authService.changePassword(currentPassword, newPassword),
  });
};

// Custom hook to check authentication status
export const useIsAuthenticated = () => {
  return authService.isAuthenticated();
};