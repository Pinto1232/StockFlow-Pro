import { apiService } from './api';
import type {
  UserDto,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserEmailDto,
  PaginatedResponse,
  UserFilters,
  PaginationParams,
} from '../types/index';

export const userService = {
  // Get all users with pagination and filters
  getUsers: async (
    pagination: PaginationParams,
    filters?: UserFilters
  ): Promise<PaginatedResponse<UserDto>> => {
    const params = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      ...filters,
    };
    return await apiService.get<PaginatedResponse<UserDto>>('/users', params);
  },

  // Get user by ID
  getUserById: async (id: string): Promise<UserDto> => {
    return await apiService.get<UserDto>(`/users/${id}`);
  },

  // Create new user
  createUser: async (userData: CreateUserDto): Promise<UserDto> => {
    return await apiService.post<UserDto>('/users', userData);
  },

  // Update user
  updateUser: async (id: string, userData: UpdateUserDto): Promise<UserDto> => {
    return await apiService.put<UserDto>(`/users/${id}`, userData);
  },

  // Update user email
  updateUserEmail: async (id: string, emailData: UpdateUserEmailDto): Promise<UserDto> => {
    return await apiService.patch<UserDto>(`/users/${id}/email`, emailData);
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await apiService.delete(`/users/${id}`);
  },

  // Activate user
  activateUser: async (id: string): Promise<UserDto> => {
    return await apiService.patch<UserDto>(`/users/${id}/activate`);
  },

  // Deactivate user
  deactivateUser: async (id: string): Promise<UserDto> => {
    return await apiService.patch<UserDto>(`/users/${id}/deactivate`);
  },

  // Get user profile
  getProfile: async (): Promise<UserDto> => {
    return await apiService.get<UserDto>('/users/profile');
  },

  // Update user profile
  updateProfile: async (userData: UpdateUserDto): Promise<UserDto> => {
    return await apiService.put<UserDto>('/users/profile', userData);
  },

  // Upload profile photo
  uploadProfilePhoto: async (file: File): Promise<UserDto> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return await apiService.post<UserDto>('/users/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Search users
  searchUsers: async (query: string): Promise<UserDto[]> => {
    return await apiService.get<UserDto[]>('/users/search', { q: query });
  },
};