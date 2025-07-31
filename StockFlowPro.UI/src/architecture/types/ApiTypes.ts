// API Response Types
// Proper typing for API responses to replace 'any' types

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSize: number;
}

export interface ProductApiResponse {
  id: string; // Backend returns Guid as string
  name: string;
  description?: string;
  sku?: string;
  price?: number;
  costPerItem: number; // Backend field name
  numberInStock: number; // Backend field name
  totalValue: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  category?: {
    id: number;
    name: string;
    description?: string;
  };
  isActive: boolean;
  isInStock: boolean;
  isLowStock: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserApiResponse {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  age: number;
  role: number; // UserRole enum value
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  profilePhotoUrl?: string;
}

export interface LoginApiResponse {
  user: UserApiResponse;
  token: string;
  refreshToken?: string;
  expiresAt: string;
}

export interface CategoryApiResponse {
  id: number;
  name: string;
  description?: string;
}

export interface InventoryValueApiResponse {
  totalValue: number;
  products: ProductApiResponse[];
}

export interface StockAdjustmentApiResponse {
  id: number;
  productId: number;
  adjustment: number;
  reason: string;
  performedBy: number;
  performedAt: string;
}

export interface DashboardStatsApiResponse {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  inStockCount: number;
  totalProductsFormatted: string;
  totalValueFormatted: string;
  totalValueShort: string;
  lowStockPercentage: string;
  outOfStockPercentage: string;
  inStockPercentage: string;
  lastUpdated: string;
  lastUpdatedFull: string;
  averageProductValue: string;
  healthScore: number;
  statusSummary: string;
}

export interface DashboardStatsResponse {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  inStockCount: number;
  formattedTotalValue: string;
  formattedTotalValueShort: string;
  lowStockPercentage: string;
  outOfStockPercentage: string;
  inStockPercentage: string;
  healthScore: number;
  statusSummary: string;
  lastUpdated: string;
}

// Generic error response
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}