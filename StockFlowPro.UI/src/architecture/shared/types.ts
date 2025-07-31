// Shared Types
// Common types used across the architecture

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SortInfo {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterInfo {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
  value: unknown;
}

export interface QueryOptions {
  pagination?: Partial<PaginationInfo>;
  sorting?: SortInfo[];
  filters?: FilterInfo[];
}

// Event types for cross-component communication
export interface DomainEvent {
  id: string;
  type: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

export interface UserEvent extends DomainEvent {
  type: 'user.created' | 'user.updated' | 'user.deleted' | 'user.loggedIn' | 'user.loggedOut';
  userId: number;
}

export interface ProductEvent extends DomainEvent {
  type: 'product.created' | 'product.updated' | 'product.deleted' | 'product.stockAdjusted';
  productId: number;
}

export interface StockEvent extends DomainEvent {
  type: 'stock.low' | 'stock.out' | 'stock.adjusted';
  productId: number;
  currentStock: number;
  threshold?: number;
}

// Configuration types
export interface ApiConfiguration {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

export interface NotificationConfiguration {
  enableBrowserNotifications: boolean;
  enableRealTimeUpdates: boolean;
  notificationDuration: number;
  maxNotifications: number;
}

export interface ApplicationConfiguration {
  api: ApiConfiguration;
  notifications: NotificationConfiguration;
  features: {
    enableAdvancedReporting: boolean;
    enableBulkOperations: boolean;
    enableRealTimeUpdates: boolean;
  };
}

// Result types for operations
export type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

export const createSuccess = <T>(data: T): Result<T> => ({
  success: true,
  data,
});

export const createError = <E = Error>(error: E): Result<never, E> => ({
  success: false,
  error,
});

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Permission types
export type Permission = 
  | 'users.view'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'products.view'
  | 'products.create'
  | 'products.update'
  | 'products.delete'
  | 'inventory.view'
  | 'inventory.adjust'
  | 'reports.view'
  | 'reports.export'
  | 'admin.access';

export type Role = 'User' | 'Manager' | 'Admin';

// UI State types
export interface LoadingState {
  isLoading: boolean;
  operation?: string;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error | null;
  errorMessage?: string;
}

export interface UIState extends LoadingState, ErrorState {
  isInitialized: boolean;
}