// Type definitions for the hexagonal architecture

export interface UserFilters {
  search?: string;
  role?: number;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface ProductFilters {
  search?: string;
  category?: number;
  isActive?: boolean;
  lowStock?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  [key: string]: unknown;
}

export interface PaginatedUsers {
  users: UserDto[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedProducts {
  products: ProductDto[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleId: number;
  dateOfBirth?: Date;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roleId?: number;
  isActive?: boolean;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  price: number;
  cost: number;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  categoryId: number;
  description?: string;
}

export interface UpdateProductRequest {
  name?: string;
  sku?: string;
  price?: number;
  cost?: number;
  quantity?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  categoryId?: number;
  description?: string;
  isActive?: boolean;
}

export interface StockAdjustmentRequest {
  productId: number;
  adjustment: number;
  reason: string;
}

// Legacy compatibility types
export interface UserDto {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  sku: string;
  costPerItem: number;
  numberInStock: number;
  totalValue: number;
  isActive: boolean;
  isInStock: boolean;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
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