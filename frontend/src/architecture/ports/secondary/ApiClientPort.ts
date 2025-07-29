// Secondary Port: API Client
// Defines the interface for communicating with external APIs

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedApiResponse<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiRequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

export interface ApiClientPort {
  // HTTP Methods
  get<T>(url: string, params?: Record<string, unknown>, config?: ApiRequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T>;
  patch<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T>;
  delete<T>(url: string, config?: ApiRequestConfig): Promise<T>;
  
  // File operations
  uploadFile<T>(url: string, file: File, config?: ApiRequestConfig): Promise<T>;
  downloadFile(url: string, filename: string, config?: ApiRequestConfig): Promise<void>;
  downloadBlob(url: string, config?: ApiRequestConfig): Promise<Blob>;
  
  // Configuration
  setBaseUrl(baseUrl: string): void;
  setDefaultHeaders(headers: Record<string, string>): void;
  setAuthToken(token: string): void;
  clearAuthToken(): void;
  
  // Interceptors
  addRequestInterceptor(interceptor: (config: unknown) => unknown): void;
  addResponseInterceptor(
    onSuccess: (response: unknown) => unknown,
    onError: (error: unknown) => unknown
  ): void;
}