import type { LoginRequest, LoginResponse, RegisterRequest, UserDto, UserRole } from '../types/index';
import { UserRole as UserRoleEnum } from '../types/index';

// Mock user interface
interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phoneNumber: string;
  dateOfBirth: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock users for fake authentication
const MOCK_USERS: MockUser[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'admin@stockflow.com',
    password: 'admin123',
    role: UserRoleEnum.Admin,
    phoneNumber: '+1234567890',
    dateOfBirth: '1990-01-01',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'user@stockflow.com',
    password: 'user123',
    role: UserRoleEnum.User,
    phoneNumber: '+1234567891',
    dateOfBirth: '1992-05-15',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'manager@stockflow.com',
    password: 'manager123',
    role: UserRoleEnum.Manager,
    phoneNumber: '+1234567892',
    dateOfBirth: '1988-12-10',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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

// Helper function to convert mock user to UserDto
const mockUserToUserDto = (mockUser: Omit<MockUser, 'password'>): UserDto => {
  return {
    id: mockUser.id,
    firstName: mockUser.firstName,
    lastName: mockUser.lastName,
    fullName: `${mockUser.firstName} ${mockUser.lastName}`,
    email: mockUser.email,
    phoneNumber: mockUser.phoneNumber,
    dateOfBirth: mockUser.dateOfBirth,
    age: calculateAge(mockUser.dateOfBirth),
    isActive: mockUser.isActive,
    createdAt: mockUser.createdAt,
    updatedAt: mockUser.updatedAt,
    role: mockUser.role,
  };
};

// Helper function to get role from string
const getRoleFromString = (roleString?: string): UserRole => {
  switch (roleString) {
    case 'Admin':
      return UserRoleEnum.Admin;
    case 'Manager':
      return UserRoleEnum.Manager;
    case 'User':
    default:
      return UserRoleEnum.User;
  }
};

// Simulate API delay
const simulateDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Fake login user
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    await simulateDelay(800); // Simulate network delay
    
    // Find user by email and password
    const user = MOCK_USERS.find(
      u => u.email === credentials.email && u.password === credentials.password
    );
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Create mock tokens
    const token = `fake-jwt-token-${user.id}-${Date.now()}`;
    const refreshToken = `fake-refresh-token-${user.id}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now
    
    // Remove password from user object and convert to UserDto
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    const userDto = mockUserToUserDto(userWithoutPassword);
    
    const response: LoginResponse = {
      token,
      refreshToken,
      user: userDto,
      expiresAt,
    };
    
    // Store tokens in localStorage
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  },

  // Fake register new user
  register: async (userData: RegisterRequest): Promise<UserDto> => {
    await simulateDelay(1000); // Simulate network delay
    
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Create new mock user
    const newMockUser: MockUser = {
      id: (MOCK_USERS.length + 1).toString(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      role: getRoleFromString(userData.role),
      phoneNumber: userData.phoneNumber,
      dateOfBirth: userData.dateOfBirth,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add to mock users (in real app, this would be persisted)
    MOCK_USERS.push(newMockUser);
    
    // Convert to UserDto and return
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = newMockUser;
    return mockUserToUserDto(userWithoutPassword);
  },

  // Fake logout user
  logout: async (): Promise<void> => {
    await simulateDelay(300); // Simulate network delay
    
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Fake refresh token
  refreshToken: async (): Promise<LoginResponse> => {
    await simulateDelay(500); // Simulate network delay
    
    const refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');
    
    if (!refreshToken || !userStr) {
      throw new Error('No refresh token or user data available');
    }

    const user = JSON.parse(userStr);
    
    // Create new mock tokens
    const newToken = `fake-jwt-token-${user.id}-${Date.now()}`;
    const newRefreshToken = `fake-refresh-token-${user.id}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now
    
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

  // Fake forgot password
  forgotPassword: async (email: string): Promise<void> => {
    await simulateDelay(1000); // Simulate network delay
    
    // Check if user exists
    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) {
      throw new Error('User with this email does not exist');
    }
    
    // In a real app, this would send an email
    console.log(`Password reset email sent to ${email}`);
  },

  // Fake reset password
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await simulateDelay(800); // Simulate network delay
    
    // In a real app, this would validate the token and update the password
    console.log(`Password reset for token: ${token}, new password: ${newPassword}`);
  },

  // Fake change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await simulateDelay(800); // Simulate network delay
    
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('User not authenticated');
    }
    
    const user = JSON.parse(userStr);
    const mockUser = MOCK_USERS.find(u => u.id === user.id);
    
    if (!mockUser || mockUser.password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }
    
    // Update password in mock data
    mockUser.password = newPassword;
    console.log('Password changed successfully');
  },
};