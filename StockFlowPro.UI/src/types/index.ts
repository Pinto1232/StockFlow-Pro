// Const assertions for type safety
export const UserRole = {
    Admin: 1,
    User: 2,
    Manager: 3,
    Supervisor: 4,
} as const;

export const PaymentStatus = {
    Pending: 1,
    Completed: 2,
    Failed: 3,
    Cancelled: 4,
} as const;

export const SubscriptionStatus = {
    Active: 1,
    Inactive: 2,
    Cancelled: 3,
    Expired: 4,
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
export type SubscriptionStatus =
    (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

// User DTOs
export interface UserDto {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    age: number;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    role: UserRole;
    passwordHash?: string;
    profilePhotoUrl?: string;
}

export interface CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    role?: UserRole;
    passwordHash?: string;
}

export interface UpdateUserDto {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth: string;
    role?: UserRole;
}

export interface UpdateUserEmailDto {
    email: string;
}

// Product DTOs
export interface ProductDto {
    id: string;
    name: string;
    costPerItem: number;
    numberInStock: number;
    isActive: boolean;
    imageUrl?: string;
    createdAt: string;
    updatedAt?: string;
    totalValue: number;
    isInStock: boolean;
    isLowStock: boolean;
}

export interface CreateProductDto {
    name: string;
    costPerItem: number;
    numberInStock: number;
    imageUrl?: string;
}

export interface UpdateProductDto {
    name: string;
    costPerItem: number;
    numberInStock: number;
    imageUrl?: string;
}

export interface UpdateProductStockDto {
    numberInStock: number;
}

// Invoice DTOs
export interface InvoiceDto {
    id: string;
    invoiceNumber: string;
    customerId: string;
    customerName: string;
    issueDate: string;
    dueDate: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    status: string;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
    items: InvoiceItemDto[];
}

export interface InvoiceItemDto {
    id: string;
    invoiceId: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

// Permission DTOs
export interface PermissionDto {
    id: string;
    name: string;
    displayName: string;
    description: string;
    category: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreatePermissionDto {
    name: string;
    displayName: string;
    description: string;
    category: string;
}

export interface UpdatePermissionDto {
    displayName: string;
    description: string;
    category: string;
}

// Role Permission DTOs
export interface RolePermissionDto {
    id: string;
    roleId: string;
    permissionId: string;
    grantedAt: string;
    grantedBy: string;
    role?: RoleDto;
    permission?: PermissionDto;
}

export interface CreateRolePermissionDto {
    roleId: string;
    permissionId: string;
    grantedBy: string;
}

// Role DTOs
export interface RoleDto {
    id: string;
    name: string;
    displayName: string;
    description: string;
    permissions: string[];
    isActive: boolean;
    isSystemRole: boolean;
    priority: number;
    createdAt: string;
    updatedAt?: string;
    users?: UserDto[];
    rolePermissions?: RolePermissionDto[];
}

export interface CreateRoleDto {
    name: string;
    displayName?: string;
    description?: string;
    permissions?: string[];
    priority?: number;
    isSystemRole?: boolean;
}

export interface UpdateRoleDto {
    displayName: string;
    description: string;
    permissions: string[];
    priority: number;
}

// Permission Category for grouping
export interface PermissionCategory {
    category: string;
    permissions: PermissionDto[];
}

// User permissions response
export interface UserPermissionsDto {
    userId: string;
    userRole: string;
    permissions: string[];
    rolePermissions: RolePermissionDto[];
}

// Subscription DTOs
export interface SubscriptionPlanDto {
    id: string;
    name: string;
    description: string;
    price: number;
    billingInterval: string;
    features: string[];
    isActive: boolean;
}

// API Response Types
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    errors?: string[];
}

export interface PaginatedResponse<T> {
    data: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

// Auth Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    refreshToken: string;
    user: UserDto;
    expiresAt: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    dateOfBirth: string;
    role?: string;
}

// Dashboard Types
export interface DashboardStats {
    totalUsers: number;
    totalProducts: number;
    totalInvoices: number;
    totalRevenue: number;
    lowStockProducts: number;
    recentActivity: ActivityItem[];
}

export interface ActivityItem {
    id: string;
    type: string;
    description: string;
    timestamp: string;
    userId?: string;
    userName?: string;
}

// Filter and Search Types
export interface ProductFilters {
    search?: string;
    isActive?: boolean;
    isLowStock?: boolean;
    inStockOnly?: boolean;
    minPrice?: number;
    maxPrice?: number;
}

export interface UserFilters {
    search?: string;
    role?: UserRole;
    isActive?: boolean;
}

export interface PaginationParams {
    pageNumber: number;
    pageSize: number;
}

// Re-export notification types
export * from './notification';
