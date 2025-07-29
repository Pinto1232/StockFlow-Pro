// Application Service: Product Management
// Orchestrates product management use cases

import { ProductEntity, ProductCategory } from '../domain/entities/Product';
import { StockService, StockAlert } from '../domain/services/StockService';
import { 
  ProductManagementPort, 
  CreateProductRequest, 
  UpdateProductRequest, 
  ProductFilters, 
  PaginatedProducts,
  StockAdjustmentRequest 
} from '../ports/primary/ProductManagementPort';
import { ApiClientPort } from '../ports/secondary/ApiClientPort';
import { StoragePort } from '../ports/secondary/StoragePort';
import { 
  PaginatedApiResponse, 
  ProductApiResponse, 
  InventoryValueApiResponse 
} from '../types/ApiTypes';

export class ProductManagementService implements ProductManagementPort {
  constructor(
    private apiClient: ApiClientPort,
    private storage: StoragePort
  ) {}

  async getProducts(filters?: ProductFilters): Promise<PaginatedProducts> {
    try {
      const response = await this.apiClient.get<PaginatedApiResponse<ProductApiResponse>>('/products', filters);
      
      return {
        products: response.data.map((product: ProductApiResponse) => ProductEntity.fromApiResponse(product)),
        totalCount: response.totalCount,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        hasNextPage: response.hasNextPage,
        hasPreviousPage: response.hasPreviousPage,
      };
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  async getProductById(id: string): Promise<ProductEntity> {
    try {
      const response = await this.apiClient.get<ProductApiResponse>(`/products/${id}`);
      return ProductEntity.fromApiResponse(response);
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      throw new Error(`Failed to fetch product with ID ${id}`);
    }
  }

  async getProductBySku(sku: string): Promise<ProductEntity> {
    try {
      const response = await this.apiClient.get<ProductApiResponse>(`/products/sku/${sku}`);
      return ProductEntity.fromApiResponse(response);
    } catch (error) {
      console.error(`Failed to fetch product with SKU ${sku}:`, error);
      throw new Error(`Failed to fetch product with SKU ${sku}`);
    }
  }

  async getCategories(): Promise<ProductCategory[]> {
    try {
      // Try to get from cache first
      const cachedCategories = this.storage.getObject<ProductCategory[]>('productCategories');
      if (cachedCategories) {
        return cachedCategories;
      }

      const response = await this.apiClient.get<{ data: ProductCategory[] }>('/products/categories');
      
      // Extract data from ApiResponse wrapper
      const categories = response.data || (response as unknown as ProductCategory[]);
      
      // Cache the categories
      this.storage.setObject('productCategories', categories);
      
      return categories;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw new Error('Failed to fetch product categories');
    }
  }

  async getStockAlerts(): Promise<StockAlert[]> {
    try {
      // Get all products and generate alerts using domain service
      const productsResponse = await this.getProducts({ 
        pageSize: 1000, // Get all products for alert calculation
        isActive: true 
      });
      
      return StockService.generateStockAlerts(productsResponse.products);
    } catch (error) {
      console.error('Failed to generate stock alerts:', error);
      throw new Error('Failed to generate stock alerts');
    }
  }

  async createProduct(request: CreateProductRequest): Promise<ProductEntity> {
    try {
      // Validate business rules
      this.validateProductRequest(request);

      const response = await this.apiClient.post<ProductApiResponse>('/products', request);
      const product = ProductEntity.fromApiResponse(response);

      // Clear categories cache as it might have changed
      this.storage.removeItem('productCategories');

      return product;
    } catch (error) {
      console.error('Failed to create product:', error);
      throw new Error('Failed to create product');
    }
  }

  async updateProduct(request: UpdateProductRequest): Promise<ProductEntity> {
    try {
      // Validate business rules if values are provided
      if (request.price !== undefined || request.cost !== undefined) {
        this.validatePricing(request.price, request.cost);
      }

      if (request.minStockLevel !== undefined || request.maxStockLevel !== undefined) {
        this.validateStockLevels(request.minStockLevel, request.maxStockLevel);
      }

      const response = await this.apiClient.put<ProductApiResponse>(`/products/${request.id}`, request);
      return ProductEntity.fromApiResponse(response);
    } catch (error) {
      console.error('Failed to update product:', error);
      throw new Error('Failed to update product');
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await this.apiClient.delete(`/products/${id}`);
    } catch (error) {
      console.error(`Failed to delete product ${id}:`, error);
      throw new Error(`Failed to delete product with ID ${id}`);
    }
  }

  async adjustStock(request: StockAdjustmentRequest): Promise<ProductEntity> {
    try {
      // Get current product to validate adjustment
      const currentProduct = await this.getProductById(request.productId);
      
      // Validate adjustment using domain service
      const validation = StockService.validateStockAdjustment(currentProduct, request.adjustment);
      if (!validation.isValid) {
        throw new Error(validation.reason);
      }

      const response = await this.apiClient.post<ProductApiResponse>(`/products/${request.productId}/adjust-stock`, {
        adjustment: request.adjustment,
        reason: request.reason,
      });

      return ProductEntity.fromApiResponse(response);
    } catch (error) {
      console.error('Failed to adjust stock:', error);
      throw new Error('Failed to adjust stock');
    }
  }

  async bulkUpdatePrices(updates: Array<{ id: string; price: number }>): Promise<void> {
    try {
      // Validate all price updates
      for (const update of updates) {
        if (update.price < 0) {
          throw new Error(`Invalid price for product ${update.id}: price cannot be negative`);
        }
      }

      await this.apiClient.post('/products/bulk-update-prices', { updates });
    } catch (error) {
      console.error('Failed to bulk update prices:', error);
      throw new Error('Failed to bulk update prices');
    }
  }

  async bulkAdjustStock(adjustments: StockAdjustmentRequest[]): Promise<void> {
    try {
      // Validate all adjustments
      for (const adjustment of adjustments) {
        const product = await this.getProductById(adjustment.productId);
        const validation = StockService.validateStockAdjustment(product, adjustment.adjustment);
        if (!validation.isValid) {
          throw new Error(`Invalid adjustment for product ${adjustment.productId}: ${validation.reason}`);
        }
      }

      await this.apiClient.post('/products/bulk-adjust-stock', { adjustments });
    } catch (error) {
      console.error('Failed to bulk adjust stock:', error);
      throw new Error('Failed to bulk adjust stock');
    }
  }

  async getLowStockReport(): Promise<ProductEntity[]> {
    try {
      const response = await this.apiClient.get<{ data: ProductApiResponse[] }>('/products/reports/low-stock');
      
      // Extract data from ApiResponse wrapper
      const products = response.data || (response as unknown as ProductApiResponse[]);
      
      return products.map((product: ProductApiResponse) => ProductEntity.fromApiResponse(product));
    } catch (error) {
      console.error('Failed to fetch low stock report:', error);
      throw new Error('Failed to fetch low stock report');
    }
  }

  async getInventoryValueReport(): Promise<{ totalValue: number; products: ProductEntity[] }> {
    try {
      const response = await this.apiClient.get<{ data: InventoryValueApiResponse }>('/products/reports/inventory-value');
      
      // Extract data from ApiResponse wrapper
      const reportData = response.data || (response as unknown as InventoryValueApiResponse);
      
      return {
        totalValue: reportData.totalValue,
        products: reportData.products?.map((product: ProductApiResponse) => ProductEntity.fromApiResponse(product)) || [],
      };
    } catch (error) {
      console.error('Failed to fetch inventory value report:', error);
      throw new Error('Failed to fetch inventory value report');
    }
  }

  // Private validation methods
  private validateProductRequest(request: CreateProductRequest): void {
    if (!request.name || request.name.trim().length === 0) {
      throw new Error('Product name is required');
    }

    if (!request.sku || request.sku.trim().length === 0) {
      throw new Error('Product SKU is required');
    }

    this.validatePricing(request.price, request.cost);
    this.validateStockLevels(request.minStockLevel, request.maxStockLevel);

    if (request.quantity < 0) {
      throw new Error('Initial quantity cannot be negative');
    }
  }

  private validatePricing(price?: number, cost?: number): void {
    if (price !== undefined && price < 0) {
      throw new Error('Price cannot be negative');
    }

    if (cost !== undefined && cost < 0) {
      throw new Error('Cost cannot be negative');
    }

    if (price !== undefined && cost !== undefined && price < cost) {
      console.warn('Price is lower than cost - this will result in negative profit margin');
    }
  }

  private validateStockLevels(minStock?: number, maxStock?: number): void {
    if (minStock !== undefined && minStock < 0) {
      throw new Error('Minimum stock level cannot be negative');
    }

    if (maxStock !== undefined && maxStock < 0) {
      throw new Error('Maximum stock level cannot be negative');
    }

    if (minStock !== undefined && maxStock !== undefined && minStock >= maxStock) {
      throw new Error('Minimum stock level must be less than maximum stock level');
    }
  }

  // Additional utility methods
  async searchProducts(query: string): Promise<ProductEntity[]> {
    const response = await this.getProducts({
      search: query,
      pageSize: 50,
    });
    return response.products;
  }

  async getProductsByCategory(categoryId: number): Promise<ProductEntity[]> {
    const response = await this.getProducts({
      categoryId,
      pageSize: 1000,
    });
    return response.products;
  }

  calculateReorderSuggestions(products: ProductEntity[]): Array<{ product: ProductEntity; suggestedQuantity: number }> {
    return products
      .filter(product => product.isLowStock)
      .map(product => ({
        product,
        suggestedQuantity: StockService.calculateReorderQuantity(product),
      }))
      .filter(suggestion => suggestion.suggestedQuantity > 0);
  }

  async downloadProduct(id: string, format: string): Promise<Blob> {
    try {
      const response = await this.apiClient.downloadBlob(`/products/${id}/download/${format}`);
      return response;
    } catch (error) {
      console.error(`Failed to download product ${id} as ${format}:`, error);
      throw new Error(`Failed to download product as ${format}`);
    }
  }

  async downloadAllProducts(format: string, filters?: ProductFilters): Promise<Blob> {
    try {
      const params: Record<string, string> = {};

      // Add filters as query parameters
      if (filters?.search) {
        params.search = filters.search;
      }
      if (filters?.isActive !== undefined) {
        params.isActive = filters.isActive.toString();
      }
      if (filters?.stockStatus) {
        params.stockStatus = filters.stockStatus;
      }

      const queryString = new URLSearchParams(params).toString();
      const url = `/products/download/bulk/${format}${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.apiClient.downloadBlob(url);
      return response;
    } catch (error) {
      console.error(`Failed to download all products as ${format}:`, error);
      throw new Error(`Failed to download all products as ${format}`);
    }
  }
}