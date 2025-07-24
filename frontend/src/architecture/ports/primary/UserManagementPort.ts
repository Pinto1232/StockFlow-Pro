// Primary Port: User Management
// Defines the interface for user management operations from the UI perspective

import { UserEntity } from '../../domain/entities/User';

export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleId: number;
}

export interface UpdateUserRequest {
  id: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roleId?: number;
  isActive?: boolean;
}

export interface UserFilters extends Record<string, unknown> {
  search?: string;
  roleId?: number;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PaginatedUsers {
  users: UserEntity[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UserManagementPort {
  // Queries
  getUsers(filters?: UserFilters): Promise<PaginatedUsers>;
  getUserById(id: string): Promise<UserEntity>;
  getCurrentUser(): Promise<UserEntity>;
  
  // Commands
  createUser(request: CreateUserRequest): Promise<UserEntity>;
  updateUser(request: UpdateUserRequest): Promise<UserEntity>;
  deleteUser(id: string): Promise<void>;
  activateUser(id: string): Promise<void>;
  deactivateUser(id: string): Promise<void>;
  
  // Authentication
  login(username: string, password: string): Promise<UserEntity>;
  logout(): Promise<void>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
}