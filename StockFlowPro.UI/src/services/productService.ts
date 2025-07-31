import { apiService } from "./api";
import api from "./api";
import type {
    ProductDto,
    CreateProductDto,
    UpdateProductDto,
    UpdateProductStockDto,
    PaginatedResponse,
    ProductFilters,
    PaginationParams,
    ApiResponse,
} from "../types/index";

export const productService = {
    // Get all products with pagination and filters
    getProducts: async (
        pagination: PaginationParams,
        filters?: ProductFilters,
    ): Promise<PaginatedResponse<ProductDto>> => {
        const params: Record<string, string | number | boolean> = {
            pageNumber: pagination.pageNumber,
            pageSize: pagination.pageSize,
        };

        // Map frontend filters to backend parameters
        if (filters?.search) {
            params.search = filters.search;
        }
        if (filters?.isActive !== undefined) {
            params.isActive = filters.isActive;
        }
        if (filters?.isLowStock !== undefined) {
            params.isLowStock = filters.isLowStock;
        }
        if (filters?.inStockOnly !== undefined) {
            params.inStockOnly = filters.inStockOnly;
        }

        return await apiService.get<PaginatedResponse<ProductDto>>(
            "/products",
            params,
        );
    },

    // Get product by ID
    getProductById: async (id: string): Promise<ProductDto> => {
        return await apiService.get<ProductDto>(`/products/${id}`);
    },

    // Create new product
    createProduct: async (
        productData: CreateProductDto,
    ): Promise<ProductDto> => {
        return await apiService.post<ProductDto>("/products", productData);
    },

    // Update product
    updateProduct: async (
        id: string,
        productData: UpdateProductDto,
    ): Promise<ProductDto> => {
        return await apiService.put<ProductDto>(`/products/${id}`, productData);
    },

    // Update product stock
    updateProductStock: async (
        id: string,
        stockData: UpdateProductStockDto,
    ): Promise<ProductDto> => {
        return await apiService.patch<ProductDto>(
            `/products/${id}/stock`,
            stockData,
        );
    },

    // Delete product
    deleteProduct: async (id: string): Promise<void> => {
        await apiService.delete(`/products/${id}`);
    },

    // Activate product
    activateProduct: async (id: string): Promise<ProductDto> => {
        return await apiService.patch<ProductDto>(`/products/${id}/activate`);
    },

    // Deactivate product
    deactivateProduct: async (id: string): Promise<ProductDto> => {
        return await apiService.patch<ProductDto>(`/products/${id}/deactivate`);
    },

    // Get low stock products
    getLowStockProducts: async (): Promise<ProductDto[]> => {
        const response = await apiService.get<ApiResponse<ProductDto[]>>(
            "/products/low-stock",
        );
        return response.data;
    },

    // Search products
    searchProducts: async (query: string): Promise<ProductDto[]> => {
        return await apiService.get<ProductDto[]>("/products/search", {
            q: query,
        });
    },

    // Upload product image
    uploadProductImage: async (id: string, file: File): Promise<ProductDto> => {
        const formData = new FormData();
        formData.append("file", file);

        return await apiService.post<ProductDto>(
            `/products/${id}/image`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );
    },

    // Get product statistics
    getProductStats: async () => {
        return await apiService.get("/products/stats");
    },

    // Download product in any format (pdf, excel, csv, json)
    downloadProduct: async (id: string, format: string): Promise<Blob> => {
        const response = await api.get(`/products/${id}/download/${format}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    // Download all products in bulk
    downloadAllProducts: async (format: string, filters?: ProductFilters): Promise<Blob> => {
        const params: Record<string, string> = {};

        // Add filters as query parameters
        if (filters?.search) {
            params.search = filters.search;
        }
        if (filters?.isActive !== undefined) {
            params.isActive = filters.isActive.toString();
        }
        if (filters?.isLowStock !== undefined) {
            params.isLowStock = filters.isLowStock.toString();
        }
        if (filters?.inStockOnly !== undefined) {
            params.inStockOnly = filters.inStockOnly.toString();
        }

        const queryString = new URLSearchParams(params).toString();
        const url = `/products/download/bulk/${format}${queryString ? `?${queryString}` : ''}`;
        
        const response = await api.get(url, {
            responseType: 'blob'
        });
        return response.data;
    },
};
