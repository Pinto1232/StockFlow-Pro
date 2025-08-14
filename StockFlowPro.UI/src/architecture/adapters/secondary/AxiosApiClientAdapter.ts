// Secondary Adapter: Axios API Client
// Implements ApiClientPort using Axios

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiClientPort, ApiRequestConfig } from '../../ports/secondary/ApiClientPort';

export class AxiosApiClientAdapter implements ApiClientPort {
  private axiosInstance: AxiosInstance;

  constructor(baseURL?: string) {
    this.axiosInstance = axios.create({
      baseURL: baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5131/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Required for cookie-based authentication
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Set XSRF token if needed (for CSRF protection)
        const xsrfToken = document.cookie.match(/XSRF-TOKEN=([\w-]+)/);
        if (xsrfToken && config.headers) {
          config.headers['X-XSRF-TOKEN'] = xsrfToken[1];
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Clear any client-side auth remnants
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');

          // Only redirect to login from protected routes; allow public routes to remain
          const path = window.location.pathname;
          const isPublicRoute =
            path === '/' ||
            path.startsWith('/pricing') ||
            path.startsWith('/checkout') ||
            path.startsWith('/login') ||
            path.startsWith('/register');

          if (!isPublicRoute) {
            console.warn('Authentication failed on a protected route, redirecting to login');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private convertConfig(config?: ApiRequestConfig): AxiosRequestConfig {
    if (!config) return {};
    
    return {
      headers: config.headers,
      timeout: config.timeout,
      // Note: Axios doesn't have built-in retry logic, would need axios-retry plugin
    };
  }

  async get<T>(url: string, params?: Record<string, unknown>, config?: ApiRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, {
      params,
      ...this.convertConfig(config),
    });
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, this.convertConfig(config));
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, this.convertConfig(config));
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, this.convertConfig(config));
    return response.data;
  }

  async delete<T>(url: string, config?: ApiRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, this.convertConfig(config));
    return response.data;
  }

  async uploadFile<T>(url: string, file: File, config?: ApiRequestConfig): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.axiosInstance.post<T>(url, formData, {
      ...this.convertConfig(config),
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
    return response.data;
  }

  async downloadFile(url: string, filename: string, config?: ApiRequestConfig): Promise<void> {
    const response = await this.axiosInstance.get(url, {
      ...this.convertConfig(config),
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  async downloadBlob(url: string, config?: ApiRequestConfig): Promise<Blob> {
    const response = await this.axiosInstance.get(url, {
      ...this.convertConfig(config),
      responseType: 'blob',
    });
    return new Blob([response.data]);
  }

  setBaseUrl(baseUrl: string): void {
    this.axiosInstance.defaults.baseURL = baseUrl;
  }

  setDefaultHeaders(headers: Record<string, string>): void {
    Object.assign(this.axiosInstance.defaults.headers.common, headers);
  }

  setAuthToken(): void {
    // No-op: Authentication is handled by cookies
  }

  clearAuthToken(): void {
    // No-op: Authentication is handled by cookies
  }

  addRequestInterceptor(interceptor: (config: unknown) => unknown): void {
    this.axiosInstance.interceptors.request.use(interceptor as (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig);
  }

  addResponseInterceptor(onSuccess: (response: unknown) => unknown, onError: (error: unknown) => unknown): void {
    this.axiosInstance.interceptors.response.use(onSuccess as (response: AxiosResponse) => AxiosResponse, onError);
  }
}