import { apiService } from './api';
import type { LoginRequest, LoginResponse, RegisterRequest, UserDto } from '../types/index';

export const authService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiService.post<LoginResponse>('/auth/login', credentials);
    
    // Store tokens in localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  // Register new user
  register: async (userData: RegisterRequest): Promise<UserDto> => {
    return await apiService.post<UserDto>('/auth/register', userData);
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await apiService.post('/auth/logout');
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Refresh token
  refreshToken: async (): Promise<LoginResponse> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiService.post<LoginResponse>('/auth/refresh', {
      refreshToken,
    });

    // Update stored tokens
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response;
  },

  // Get current user
  getCurrentUser: (): UserDto | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    await apiService.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiService.post('/auth/reset-password', { token, newPassword });
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiService.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },
};