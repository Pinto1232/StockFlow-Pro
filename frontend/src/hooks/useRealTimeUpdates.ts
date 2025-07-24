import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSignalR } from './useSignalR';
import { productKeys } from './useProducts';
import { invoiceKeys } from './useInvoices';
import type { ProductDto, InvoiceDto } from '../types/index';

export interface RealTimeEvent {
    type: 'ProductCreated' | 'ProductUpdated' | 'ProductDeleted' | 
          'InvoiceCreated' | 'InvoiceUpdated' | 'InvoiceDeleted' |
          'StockUpdated' | 'LowStockAlert';
    entityId: string;
    data?: unknown;
    timestamp: string;
    userId?: string;
}

export const useRealTimeUpdates = () => {
    const queryClient = useQueryClient();
    const { isConnected } = useSignalR();

    useEffect(() => {
        if (!isConnected) return;

        // Handler for product events
        const handleProductEvent = (event: CustomEvent<RealTimeEvent>) => {
            const { type, entityId, data } = event.detail;
            
            console.log('Received product event:', event.detail);

            switch (type) {
                case 'ProductCreated':
                    // Invalidate product lists to refetch with new product
                    queryClient.invalidateQueries({ queryKey: productKeys.lists() });
                    queryClient.invalidateQueries({ queryKey: productKeys.stats() });
                    queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
                    break;

                case 'ProductUpdated':
                    // Update specific product in cache if we have the data
                    if (data) {
                        queryClient.setQueryData(productKeys.detail(entityId), data);
                    }
                    // Invalidate lists to ensure consistency
                    queryClient.invalidateQueries({ queryKey: productKeys.lists() });
                    queryClient.invalidateQueries({ queryKey: productKeys.stats() });
                    queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
                    break;

                case 'ProductDeleted':
                    // Remove from cache and invalidate lists
                    queryClient.removeQueries({ queryKey: productKeys.detail(entityId) });
                    queryClient.invalidateQueries({ queryKey: productKeys.lists() });
                    queryClient.invalidateQueries({ queryKey: productKeys.stats() });
                    queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
                    break;

                case 'StockUpdated':
                    // Update product data and invalidate related queries
                    if (data) {
                        queryClient.setQueryData(productKeys.detail(entityId), data);
                    }
                    queryClient.invalidateQueries({ queryKey: productKeys.lists() });
                    queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
                    queryClient.invalidateQueries({ queryKey: productKeys.stats() });
                    break;

                case 'LowStockAlert':
                    // Invalidate low stock queries
                    queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
                    break;
            }
        };

        // Handler for invoice events
        const handleInvoiceEvent = (event: CustomEvent<RealTimeEvent>) => {
            const { type, entityId, data } = event.detail;
            
            console.log('Received invoice event:', event.detail);

            switch (type) {
                case 'InvoiceCreated':
                    // Invalidate invoice lists to refetch with new invoice
                    queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
                    queryClient.invalidateQueries({ queryKey: invoiceKeys.stats() });
                    break;

                case 'InvoiceUpdated':
                    // Update specific invoice in cache if we have the data
                    if (data) {
                        queryClient.setQueryData(invoiceKeys.detail(entityId), data);
                    }
                    // Invalidate lists to ensure consistency
                    queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
                    queryClient.invalidateQueries({ queryKey: invoiceKeys.stats() });
                    break;

                case 'InvoiceDeleted':
                    // Remove from cache and invalidate lists
                    queryClient.removeQueries({ queryKey: invoiceKeys.detail(entityId) });
                    queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
                    queryClient.invalidateQueries({ queryKey: invoiceKeys.stats() });
                    break;
            }
        };

        // Handler for dashboard updates
        const handleDashboardUpdate = (event: CustomEvent<unknown>) => {
            console.log('Received dashboard update:', event.detail);
            
            // Invalidate dashboard-related queries
            queryClient.invalidateQueries({ queryKey: productKeys.stats() });
            queryClient.invalidateQueries({ queryKey: invoiceKeys.stats() });
            queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
        };

        // Add event listeners
        window.addEventListener('signalr-product-event', handleProductEvent as EventListener);
        window.addEventListener('signalr-invoice-event', handleInvoiceEvent as EventListener);
        window.addEventListener('signalr-dashboard-update', handleDashboardUpdate as EventListener);

        // Cleanup
        return () => {
            window.removeEventListener('signalr-product-event', handleProductEvent as EventListener);
            window.removeEventListener('signalr-invoice-event', handleInvoiceEvent as EventListener);
            window.removeEventListener('signalr-dashboard-update', handleDashboardUpdate as EventListener);
        };
    }, [isConnected, queryClient]);

    return {
        isConnected,
    };
};

// Hook for optimistic updates
export const useOptimisticUpdates = () => {
    const queryClient = useQueryClient();

    const optimisticProductUpdate = (productId: string, updatedData: Partial<ProductDto>) => {
        // Update the specific product in cache optimistically
        queryClient.setQueryData(productKeys.detail(productId), (oldData: ProductDto | undefined) => {
            if (!oldData) return oldData;
            return { ...oldData, ...updatedData };
        });

        // Update the product in any list queries
        queryClient.setQueriesData(
            { queryKey: productKeys.lists() },
            (oldData: unknown) => {
                const typedOldData = oldData as { data?: ProductDto[] } | undefined;
                if (!typedOldData?.data) return oldData;
                
                return {
                    ...typedOldData,
                    data: typedOldData.data.map((product: ProductDto) =>
                        product.id === productId ? { ...product, ...updatedData } : product
                    ),
                };
            }
        );
    };

    const optimisticInvoiceUpdate = (invoiceId: string, updatedData: Partial<InvoiceDto>) => {
        // Update the specific invoice in cache optimistically
        queryClient.setQueryData(invoiceKeys.detail(invoiceId), (oldData: InvoiceDto | undefined) => {
            if (!oldData) return oldData;
            return { ...oldData, ...updatedData };
        });

        // Update the invoice in any list queries
        queryClient.setQueriesData(
            { queryKey: invoiceKeys.lists() },
            (oldData: unknown) => {
                const typedOldData = oldData as { data?: InvoiceDto[] } | undefined;
                if (!typedOldData?.data) return oldData;
                
                return {
                    ...typedOldData,
                    data: typedOldData.data.map((invoice: InvoiceDto) =>
                        invoice.id === invoiceId ? { ...invoice, ...updatedData } : invoice
                    ),
                };
            }
        );
    };

    return {
        optimisticProductUpdate,
        optimisticInvoiceUpdate,
    };
};