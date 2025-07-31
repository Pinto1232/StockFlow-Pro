// Application Service: User Management
// Orchestrates user management use cases

import { UserEntity } from '../domain/entities/User';
import { Email } from '../domain/valueObjects/Email';
import { 
  UserManagementPort, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserFilters, 
  PaginatedUsers 
} from '../ports/primary/UserManagementPort';
import { ApiClientPort } from '../ports/secondary/ApiClientPort';
import { StoragePort } from '../ports/secondary/StoragePort';
import { 
  UserApiResponse, 
  LoginApiResponse 
} from '../types/ApiTypes';

export class UserManagementService implements UserManagementPort {
  constructor(
    private apiClient: ApiClientPort,
    private storage: StoragePort
  ) {}

  async getUsers(filters?: UserFilters): Promise<PaginatedUsers> {
    try {
      const response = await this.apiClient.get<UserApiResponse[]>('/users', filters);
      
      // Since the backend returns a direct array, we need to implement pagination on the frontend
      const allUsers = Array.isArray(response) ? response : [];
      
      // Apply search filter if provided
      let filteredUsers = allUsers;
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredUsers = allUsers.filter(user => 
          user.firstName?.toLowerCase().includes(searchTerm) ||
          user.lastName?.toLowerCase().includes(searchTerm) ||
          user.username?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm)
        );
      }

      // Apply role filter if provided
      if (filters?.roleId) {
        filteredUsers = filteredUsers.filter(user => user.role === filters.roleId);
      }

      // Apply status filter if provided
      if (filters?.isActive !== undefined) {
        filteredUsers = filteredUsers.filter(user => user.isActive === filters.isActive);
      }

      // Pagination parameters
      const page = filters?.page || 1;
      const pageSize = filters?.pageSize || 5; // Default to 5 users per page
      const totalCount = filteredUsers.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      
      // Calculate pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
      
      return {
        users: paginatedUsers.map((user: UserApiResponse) => UserEntity.fromApiResponse(user)),
        totalCount,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async getUserById(id: string): Promise<UserEntity> {
    try {
      const response = await this.apiClient.get<UserApiResponse>(`/users/${id}`);
      return UserEntity.fromApiResponse(response);
    } catch (error) {
      console.error(`Failed to fetch user ${id}:`, error);
      throw new Error(`Failed to fetch user with ID ${id}`);
    }
  }

  async getCurrentUser(): Promise<UserEntity> {
    try {
      // Try to get from cache first
      const cachedUser = this.storage.getObject<UserApiResponse>('currentUser');
      if (cachedUser) {
        return UserEntity.fromApiResponse(cachedUser);
      }

      // If not in cache, fetch from API
      const response = await this.apiClient.get<UserApiResponse>('/profile');
      const user = UserEntity.fromApiResponse(response);
      
      // Cache the user
      this.storage.setObject('currentUser', response);
      
      return user;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      
      // If it's an authentication error, clear stored data
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
        this.storage.removeItem('currentUser');
        // No need to clear tokens as we're using cookies
      }
      
      throw new Error('Failed to fetch current user');
    }
  }

  async createUser(request: CreateUserRequest): Promise<UserEntity> {
    try {
      // Validate email format
      new Email(request.email);

      // Validate required fields
      if (!request.username || !request.firstName || !request.lastName || !request.password) {
        throw new Error('All required fields must be provided');
      }

      const response = await this.apiClient.post<UserApiResponse>('/users', request);
      return UserEntity.fromApiResponse(response);
    } catch (error) {
      console.error('Failed to create user:', error);
      throw new Error('Failed to create user');
    }
  }

  async updateUser(request: UpdateUserRequest): Promise<UserEntity> {
    try {
      // Validate email format if provided
      if (request.email) {
        new Email(request.email);
      }

      const response = await this.apiClient.put<UserApiResponse>(`/users/${request.id}`, request);
      const user = UserEntity.fromApiResponse(response);

      // Update cache if this is the current user
      const currentUser = this.storage.getObject<UserApiResponse>('currentUser');
      if (currentUser && currentUser.id === request.id) {
        this.storage.setObject('currentUser', response);
      }

      return user;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw new Error('Failed to update user');
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.apiClient.delete(`/users/${id}`);
    } catch (error) {
      console.error(`Failed to delete user ${id}:`, error);
      throw new Error(`Failed to delete user with ID ${id}`);
    }
  }

  async activateUser(id: string): Promise<void> {
    try {
      await this.apiClient.patch(`/users/${id}/activate`);
    } catch (error) {
      console.error(`Failed to activate user ${id}:`, error);
      throw new Error(`Failed to activate user with ID ${id}`);
    }
  }

  async deactivateUser(id: string): Promise<void> {
    try {
      await this.apiClient.patch(`/users/${id}/deactivate`);
    } catch (error) {
      console.error(`Failed to deactivate user ${id}:`, error);
      throw new Error(`Failed to deactivate user with ID ${id}`);
    }
  }

  async login(username: string, password: string): Promise<UserEntity> {
    try {
      const response = await this.apiClient.post<LoginApiResponse>('/auth/login', {
        username,
        password,
      });

      const user = UserEntity.fromApiResponse(response.user);
      
      // Store user in cache
      this.storage.setObject('currentUser', response.user);

      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Invalid username or password');
    }
  }

  async logout(): Promise<void> {
    try {
      await this.apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
      // Continue with local cleanup even if server request fails
    } finally {
      // Only clear cached user data
      this.storage.removeItem('currentUser');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      if (!currentPassword || !newPassword) {
        throw new Error('Both current and new passwords are required');
      }

      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      await this.apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      throw new Error('Failed to change password');
    }
  }

  // Additional utility methods
  async refreshCurrentUser(): Promise<UserEntity> {
    this.storage.removeItem('currentUser');
    return this.getCurrentUser();
  }

  isLoggedIn(): boolean {
    return this.storage.hasItem('currentUser');
  }

  getCurrentUserFromCache(): UserEntity | null {
    const cachedUser = this.storage.getObject<UserApiResponse>('currentUser');
    return cachedUser ? UserEntity.fromApiResponse(cachedUser) : null;
  }
}