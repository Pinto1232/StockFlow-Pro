import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productService } from "../services/productService";
import type {
    CreateProductDto,
    UpdateProductDto,
    UpdateProductStockDto,
    ProductFilters,
    PaginationParams,
} from "../types/index";

// Query keys
export const productKeys = {
    all: ["products"] as const,
    lists: () => [...productKeys.all, "list"] as const,
    list: (pagination: PaginationParams, filters?: ProductFilters) =>
        [...productKeys.lists(), pagination, filters] as const,
    details: () => [...productKeys.all, "detail"] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,
    lowStock: () => [...productKeys.all, "lowStock"] as const,
    search: (query: string) => [...productKeys.all, "search", query] as const,
    stats: () => [...productKeys.all, "stats"] as const,
};

// Get products with pagination and filters
export const useProducts = (
    pagination: PaginationParams,
    filters?: ProductFilters,
) => {
    return useQuery({
        queryKey: productKeys.list(pagination, filters),
        queryFn: () => productService.getProducts(pagination, filters),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

// Get product by ID
export const useProduct = (id: string) => {
    return useQuery({
        queryKey: productKeys.detail(id),
        queryFn: () => productService.getProductById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Get low stock products
export const useLowStockProducts = () => {
    return useQuery({
        queryKey: productKeys.lowStock(),
        queryFn: () => productService.getLowStockProducts(),
        staleTime: 1 * 60 * 1000, // 1 minute
        retry: 1, // Only retry once on failure
        retryDelay: 1000, // Wait 1 second before retry
    });
};

// Search products
export const useSearchProducts = (query: string) => {
    return useQuery({
        queryKey: productKeys.search(query),
        queryFn: () => productService.searchProducts(query),
        enabled: query.length > 2,
        staleTime: 30 * 1000, // 30 seconds
    });
};

// Get product statistics
export const useProductStats = () => {
    return useQuery({
        queryKey: productKeys.stats(),
        queryFn: () => productService.getProductStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Create product mutation
export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productData: CreateProductDto) =>
            productService.createProduct(productData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.invalidateQueries({ queryKey: productKeys.stats() });
        },
    });
};

// Update product mutation
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
            productService.updateProduct(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.setQueryData(productKeys.detail(data.id), data);
            queryClient.invalidateQueries({ queryKey: productKeys.stats() });
        },
    });
};

// Update product stock mutation
export const useUpdateProductStock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: UpdateProductStockDto;
        }) => productService.updateProductStock(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.setQueryData(productKeys.detail(data.id), data);
            queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
            queryClient.invalidateQueries({ queryKey: productKeys.stats() });
        },
    });
};

// Delete product mutation
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => productService.deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.invalidateQueries({ queryKey: productKeys.stats() });
        },
    });
};

// Activate product mutation
export const useActivateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => productService.activateProduct(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.setQueryData(productKeys.detail(data.id), data);
        },
    });
};

// Deactivate product mutation
export const useDeactivateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => productService.deactivateProduct(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.setQueryData(productKeys.detail(data.id), data);
        },
    });
};

// Upload product image mutation
export const useUploadProductImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) =>
            productService.uploadProductImage(id, file),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.setQueryData(productKeys.detail(data.id), data);
        },
    });
};
