// Primary Adapter: Product Management Hook
// React hook that provides product management functionality to UI components

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductEntity } from '../../domain/entities/Product';
import { ProductManagementService } from '../../application/ProductManagementService';
import { 
  CreateProductRequest, 
  UpdateProductRequest, 
  ProductFilters,
  StockAdjustmentRequest 
} from '../../ports/primary/ProductManagementPort';

interface UseProductManagementProps {
  productService: ProductManagementService;
}

export const useProductManagement = ({ productService }: UseProductManagementProps) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ProductFilters>({});

  // Query: Get products with pagination and filtering
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes (products change more frequently)
  });

  // Query: Get categories
  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: ['productCategories'],
    queryFn: () => productService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes (categories change rarely)
  });

  // Query: Get stock alerts
  const {
    data: stockAlerts,
    isLoading: isLoadingStockAlerts,
    error: stockAlertsError,
    refetch: refetchStockAlerts,
  } = useQuery({
    queryKey: ['stockAlerts'],
    queryFn: () => productService.getStockAlerts(),
    staleTime: 1 * 60 * 1000, // 1 minute (alerts should be fresh)
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });

  // Query: Low stock report
  const {
    data: lowStockProducts,
    isLoading: isLoadingLowStock,
    error: lowStockError,
  } = useQuery({
    queryKey: ['lowStockReport'],
    queryFn: () => productService.getLowStockReport(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query: Inventory value report
  const {
    data: inventoryValueReport,
    isLoading: isLoadingInventoryValue,
    error: inventoryValueError,
  } = useQuery({
    queryKey: ['inventoryValueReport'],
    queryFn: () => productService.getInventoryValueReport(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutation: Create product
  const createProductMutation = useMutation({
    mutationFn: (request: CreateProductRequest) => productService.createProduct(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['lowStockReport'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryValueReport'] });
    },
  });

  // Mutation: Update product
  const updateProductMutation = useMutation({
    mutationFn: (request: UpdateProductRequest) => productService.updateProduct(request),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockAlerts'] });
      queryClient.setQueryData(['product', updatedProduct.id], updatedProduct);
    },
  });

  // Mutation: Delete product
  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['lowStockReport'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryValueReport'] });
    },
  });

  // Mutation: Adjust stock
  const adjustStockMutation = useMutation({
    mutationFn: (request: StockAdjustmentRequest) => productService.adjustStock(request),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['lowStockReport'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryValueReport'] });
      queryClient.setQueryData(['product', updatedProduct.id], updatedProduct);
    },
  });

  // Mutation: Bulk update prices
  const bulkUpdatePricesMutation = useMutation({
    mutationFn: (updates: Array<{ id: number; price: number }>) => 
      productService.bulkUpdatePrices(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryValueReport'] });
    },
  });

  // Mutation: Bulk adjust stock
  const bulkAdjustStockMutation = useMutation({
    mutationFn: (adjustments: StockAdjustmentRequest[]) => 
      productService.bulkAdjustStock(adjustments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['lowStockReport'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryValueReport'] });
    },
  });

  // Helper functions
  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const getProductById = useCallback(async (id: number): Promise<ProductEntity> => {
    // Check cache first
    const cachedProduct = queryClient.getQueryData<ProductEntity>(['product', id]);
    if (cachedProduct) {
      return cachedProduct;
    }

    // Fetch from service
    const product = await productService.getProductById(id);
    queryClient.setQueryData(['product', id], product);
    return product;
  }, [queryClient, productService]);

  const getProductBySku = useCallback(async (sku: string): Promise<ProductEntity> => {
    return productService.getProductBySku(sku);
  }, [productService]);

  const searchProducts = useCallback(async (query: string): Promise<ProductEntity[]> => {
    return productService.searchProducts(query);
  }, [productService]);

  const getProductsByCategory = useCallback(async (categoryId: number): Promise<ProductEntity[]> => {
    return productService.getProductsByCategory(categoryId);
  }, [productService]);

  const getReorderSuggestions = useCallback(() => {
    if (!productsData?.products) return [];
    return productService.calculateReorderSuggestions(productsData.products);
  }, [productService, productsData]);

  // Computed values
  const products = productsData?.products || [];
  const totalProducts = productsData?.totalCount || 0;
  const currentPage = productsData?.currentPage || 1;
  const totalPages = productsData?.totalPages || 1;
  const hasNextPage = productsData?.hasNextPage || false;
  const hasPreviousPage = productsData?.hasPreviousPage || false;

  const isLoading = isLoadingProducts || isLoadingCategories;
  const error = productsError || categoriesError;

  // Stock alert counts
  const criticalAlerts = stockAlerts?.filter(alert => alert.severity === 'critical').length || 0;
  const warningAlerts = stockAlerts?.filter(alert => alert.severity === 'warning').length || 0;
  const totalAlerts = stockAlerts?.length || 0;

  return {
    // Data
    products,
    categories: categories || [],
    stockAlerts: stockAlerts || [],
    lowStockProducts: lowStockProducts || [],
    inventoryValueReport,
    totalProducts,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    filters,

    // Loading states
    isLoading,
    isLoadingProducts,
    isLoadingCategories,
    isLoadingStockAlerts,
    isLoadingLowStock,
    isLoadingInventoryValue,
    error,
    stockAlertsError,
    lowStockError,
    inventoryValueError,

    // Alert counts
    criticalAlerts,
    warningAlerts,
    totalAlerts,

    // Mutations
    createProduct: createProductMutation.mutate,
    updateProduct: updateProductMutation.mutate,
    deleteProduct: deleteProductMutation.mutate,
    adjustStock: adjustStockMutation.mutate,
    bulkUpdatePrices: bulkUpdatePricesMutation.mutate,
    bulkAdjustStock: bulkAdjustStockMutation.mutate,

    // Mutation states
    isCreatingProduct: createProductMutation.isPending,
    isUpdatingProduct: updateProductMutation.isPending,
    isDeletingProduct: deleteProductMutation.isPending,
    isAdjustingStock: adjustStockMutation.isPending,
    isBulkUpdatingPrices: bulkUpdatePricesMutation.isPending,
    isBulkAdjustingStock: bulkAdjustStockMutation.isPending,

    // Mutation errors
    createProductError: createProductMutation.error,
    updateProductError: updateProductMutation.error,
    deleteProductError: deleteProductMutation.error,
    adjustStockError: adjustStockMutation.error,
    bulkUpdatePricesError: bulkUpdatePricesMutation.error,
    bulkAdjustStockError: bulkAdjustStockMutation.error,

    // Helper functions
    updateFilters,
    clearFilters,
    getProductById,
    getProductBySku,
    searchProducts,
    getProductsByCategory,
    getReorderSuggestions,
    refetchProducts,
    refetchStockAlerts,
  };
};

export type UseProductManagementReturn = ReturnType<typeof useProductManagement>;