import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";
import type { ApiResponse, PaginatedResponse } from "../types/index";

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5131/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Include cookies for authentication
});

// Request interceptor (cookies are automatically included with withCredentials: true)
api.interceptors.request.use(
    (config) => {
        // No need to add Authorization header since backend uses cookie auth
        // Cookies are automatically included with withCredentials: true
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Response interceptor to handle common errors
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Clear any client-side auth remnants
            localStorage.removeItem("authToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");

            // Determine if the current route is public; if so, do not force redirect
            const path = window.location.pathname;
            const isPublicRoute =
                path === "/" ||
                path.startsWith("/pricing") ||
                path.startsWith("/checkout") ||
                path.startsWith("/login") ||
                path.startsWith("/register");

            if (!isPublicRoute) {
                console.warn("Authentication failed on a protected route, redirecting to login");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    },
);

// Generic API methods
export const apiService = {
    // GET request
    get: async <T>(
        url: string,
        params?: Record<string, unknown>,
    ): Promise<T> => {
        const response = await api.get<T>(url, { params });
        return response.data;
    },

    // POST request
    post: async <T>(
        url: string,
        data?: unknown,
        config?: Record<string, unknown>,
    ): Promise<T> => {
        const response = await api.post<T>(url, data, config);
        return response.data;
    },

    // PUT request
    put: async <T>(url: string, data?: unknown): Promise<T> => {
        const response = await api.put<T>(url, data);
        return response.data;
    },

    // PATCH request
    patch: async <T>(url: string, data?: unknown): Promise<T> => {
        const response = await api.patch<T>(url, data);
        return response.data;
    },

    // DELETE request
    delete: async <T>(url: string): Promise<T> => {
        const response = await api.delete<T>(url);
        return response.data;
    },
};

// Helper functions for handling API responses
export const handleApiResponse = <T>(response: ApiResponse<T>): T => {
    if (!response.success) {
        throw new Error(response.message || "API request failed");
    }
    return response.data;
};

export const handlePaginatedResponse = <T>(
    response: PaginatedResponse<T>,
): PaginatedResponse<T> => {
    return response;
};

export default api;
