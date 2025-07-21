import { apiService } from './api';
import type {
  ProductDto,
  CreateProductDto,
  UpdateProductDto,
  UpdateProductStockDto,
  PaginatedResponse,
  ProductFilters,
  PaginationParams,
  ApiResponse,
} from '../types/index';

export const productService = {
  // Get all products with pagination and filters
  getProducts: async (
    pagination: PaginationParams,
    filters?: ProductFilters
  ): Promise<PaginatedResponse<ProductDto>> => {
    const params = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      ...filters,
    };
    return await apiService.get<PaginatedResponse<ProductDto>>('/products', params);
  },

  // Get product by ID
  getProductById: async (id: string): Promise<ProductDto> => {
    return await apiService.get<ProductDto>(`/products/${id}`);
  },

  // Create new product
  createProduct: async (productData: CreateProductDto): Promise<ProductDto> => {
    return await apiService.post<ProductDto>('/products', productData);
  },

  // Update product
  updateProduct: async (id: string, productData: UpdateProductDto): Promise<ProductDto> => {
    return await apiService.put<ProductDto>(`/products/${id}`, productData);
  },

  // Update product stock
  updateProductStock: async (
    id: string,
    stockData: UpdateProductStockDto
  ): Promise<ProductDto> => {
    return await apiService.patch<ProductDto>(`/products/${id}/stock`, stockData);
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
    const response = await apiService.get<ApiResponse<ProductDto[]>>('/products/low-stock');
    return response.data;
  },

  // Search products
  searchProducts: async (query: string): Promise<ProductDto[]> => {
    return await apiService.get<ProductDto[]>('/products/search', { q: query });
  },

  // Upload product image
  uploadProductImage: async (id: string, file: File): Promise<ProductDto> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return await apiService.post<ProductDto>(`/products/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get product statistics
  getProductStats: async () => {
    return await apiService.get('/products/stats');
  },
};