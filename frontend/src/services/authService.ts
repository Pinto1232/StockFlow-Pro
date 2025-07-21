import type { LoginRequest, LoginResponse, RegisterRequest, UserDto, UserRole } from '../types/index';
import { UserRole as UserRoleEnum } from '../types/index';

// API base URL - this should be configured based on environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5131/api';

// Interface for backend user response
interface BackendUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  role: number;
}


// Helper function to handle API responses
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Helper function to convert backend role number to UserRole
const convertToUserRole = (roleNumber: number): UserRole => {
  switch (roleNumber) {
    case 1:
      return UserRoleEnum.Admin;
    case 2:
      return UserRoleEnum.User;
    case 3:
      return UserRoleEnum.Manager;
    case 4:
      return UserRoleEnum.Supervisor;
    default:
      return UserRoleEnum.User; // Default to User role
  }
};

// Helper function to convert UserRole number to role name string
export const getRoleName = (role: UserRole): string => {
  switch (role) {
    case UserRoleEnum.Admin:
      return 'Admin';
    case UserRoleEnum.User:
      return 'User';
    case UserRoleEnum.Manager:
      return 'Manager';
    case UserRoleEnum.Supervisor:
      return 'Supervisor';
    default:
      return 'User';
  }
};

// Helper function to create UserDto from backend response
const createUserDto = (backendUser: BackendUserResponse): UserDto => {
  const firstName = backendUser.firstName || '';
  const lastName = backendUser.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'User';
  
  return {
    id: backendUser.id,
    firstName,
    lastName,
    fullName,
    email: backendUser.email,
    phoneNumber: backendUser.phoneNumber || '',
    dateOfBirth: backendUser.dateOfBirth,
    age: calculateAge(backendUser.dateOfBirth),
    isActive: backendUser.isActive ?? true,
    createdAt: backendUser.createdAt || new Date().toISOString(),
    updatedAt: backendUser.updatedAt,
    role: convertToUserRole(backendUser.role),
  };
};

// API service for roles
export const rolesService = {
  // Get available roles from backend
  getAvailableRoles: async (): Promise<{ value: string; label: string }[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/available-roles`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Backend not available');
    } catch (error) {
      console.warn('Backend not available, using fallback roles:', error);
      // Fallback to hardcoded roles if backend is not available
      return [
        { value: 'User', label: 'User' },
        { value: 'Manager', label: 'Manager' },
        { value: 'Admin', label: 'Admin' },
        { value: 'Supervisor', label: 'Supervisor' }
      ];
    }
  },
};

export const authService = {
  // Login user via backend API
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          username: credentials.email, // Backend expects username field
          password: credentials.password,
        }),
      });

      const data = await handleApiResponse(response);
      
      // Since backend uses cookie auth, we'll create a session indicator
      // The actual authentication will be handled by cookies
      const token = `authenticated-${Date.now()}`;
      const refreshToken = `refresh-${Date.now()}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      const userDto = createUserDto(data.user);
      
      const loginResponse: LoginResponse = {
        token,
        refreshToken,
        user: userDto,
        expiresAt,
      };
      
      // Store authentication state in localStorage
      localStorage.setItem('authToken', loginResponse.token);
      localStorage.setItem('refreshToken', loginResponse.refreshToken);
      localStorage.setItem('user', JSON.stringify(loginResponse.user));
      localStorage.setItem('isAuthenticated', 'true');
      
      return loginResponse;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register new user via backend API
  register: async (userData: RegisterRequest): Promise<UserDto> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          dateOfBirth: userData.dateOfBirth,
          password: userData.password,
          confirmPassword: userData.confirmPassword,
        }),
      });

      const data = await handleApiResponse(response);
      
      // The backend returns the created user in the response
      return createUserDto(data.user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Logout user via backend API
  logout: async (): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local cleanup even if backend call fails
    } finally {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    }
  },

  // Refresh token (placeholder for future implementation)
  refreshToken: async (): Promise<LoginResponse> => {
    const refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');
    
    if (!refreshToken || !userStr) {
      throw new Error('No refresh token or user data available');
    }

    const user = JSON.parse(userStr);
    
    // Create new mock tokens (in real implementation, this would call backend)
    const newToken = `session-token-${Date.now()}`;
    const newRefreshToken = `refresh-token-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    const response: LoginResponse = {
      token: newToken,
      refreshToken: newRefreshToken,
      user,
      expiresAt,
    };

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

  // Forgot password via backend API
  forgotPassword: async (email: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      await handleApiResponse(response);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Reset password via backend API
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword: newPassword,
        }),
      });

      await handleApiResponse(response);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // Change password via backend API
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword: newPassword,
        }),
      });

      await handleApiResponse(response);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },
};