// Primary Port: Product Management
// Defines the interface for product management operations from the UI perspective

import { ProductEntity, ProductCategory } from '../../domain/entities/Product';
import { StockAlert } from '../../domain/services/StockService';

export interface CreateProductRequest {
  name: string;
  description?: string;
  sku: string;
  price: number;
  cost: number;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  categoryId: number;
}

export interface UpdateProductRequest {
  id: string;
  name?: string;
  description?: string;
  sku?: string;
  price?: number;
  cost?: number;
  quantity?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  categoryId?: number;
  isActive?: boolean;
}

export interface ProductFilters extends Record<string, unknown> {
  search?: string;
  categoryId?: number;
  isActive?: boolean;
  stockStatus?: 'low' | 'out' | 'over' | 'normal';
  priceMin?: number;
  priceMax?: number;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'price' | 'quantity' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedProducts {
  products: ProductEntity[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface StockAdjustmentRequest {
  productId: string;
  adjustment: number;
  reason: string;
}

export interface ProductManagementPort {
  // Queries
  getProducts(filters?: ProductFilters): Promise<PaginatedProducts>;
  getProductById(id: string): Promise<ProductEntity>;
  getProductBySku(sku: string): Promise<ProductEntity>;
  getCategories(): Promise<ProductCategory[]>;
  getStockAlerts(): Promise<StockAlert[]>;
  
  // Commands
  createProduct(request: CreateProductRequest): Promise<ProductEntity>;
  updateProduct(request: UpdateProductRequest): Promise<ProductEntity>;
  deleteProduct(id: string): Promise<void>;
  adjustStock(request: StockAdjustmentRequest): Promise<ProductEntity>;
  
  // Bulk operations
  bulkUpdatePrices(updates: Array<{ id: string; price: number }>): Promise<void>;
  bulkAdjustStock(adjustments: StockAdjustmentRequest[]): Promise<void>;
  
  // Reports
  getLowStockReport(): Promise<ProductEntity[]>;
  getInventoryValueReport(): Promise<{ totalValue: number; products: ProductEntity[] }>;
  
  // Downloads
  downloadProduct(id: string, format: string): Promise<Blob>;
  downloadAllProducts(format: string, filters?: ProductFilters): Promise<Blob>;
}