import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoiceService, type InvoiceFilters, type CreateInvoiceDto, type UpdateInvoiceDto } from "../services/invoiceService";
import type {
    PaginationParams,
} from "../types/index";

// Query keys
export const invoiceKeys = {
    all: ["invoices"] as const,
    lists: () => [...invoiceKeys.all, "list"] as const,
    list: (pagination: PaginationParams, filters?: InvoiceFilters) =>
        [...invoiceKeys.lists(), pagination, filters] as const,
    details: () => [...invoiceKeys.all, "detail"] as const,
    detail: (id: string) => [...invoiceKeys.details(), id] as const,
    stats: () => [...invoiceKeys.all, "stats"] as const,
};

// Get invoices with pagination and filters
export const useInvoices = (
    pagination: PaginationParams,
    filters?: InvoiceFilters,
) => {
    return useQuery({
        queryKey: invoiceKeys.list(pagination, filters),
        queryFn: () => invoiceService.getInvoices(pagination, filters),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

// Get invoice by ID
export const useInvoice = (id: string) => {
    return useQuery({
        queryKey: invoiceKeys.detail(id),
        queryFn: () => invoiceService.getInvoiceById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Get invoice statistics
export const useInvoiceStats = () => {
    return useQuery({
        queryKey: invoiceKeys.stats(),
        queryFn: () => invoiceService.getInvoiceStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Create invoice mutation
export const useCreateInvoice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (invoiceData: CreateInvoiceDto) =>
            invoiceService.createInvoice(invoiceData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
            queryClient.invalidateQueries({ queryKey: invoiceKeys.stats() });
        },
    });
};

// Update invoice mutation
export const useUpdateInvoice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateInvoiceDto }) =>
            invoiceService.updateInvoice(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
            queryClient.setQueryData(invoiceKeys.detail(data.id), data);
            queryClient.invalidateQueries({ queryKey: invoiceKeys.stats() });
        },
    });
};

// Delete invoice mutation
export const useDeleteInvoice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => invoiceService.deleteInvoice(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
            queryClient.invalidateQueries({ queryKey: invoiceKeys.stats() });
        },
    });
};

// Generate invoice PDF mutation
export const useGenerateInvoicePdf = () => {
    return useMutation({
        mutationFn: (id: string) => invoiceService.generateInvoicePdf(id),
    });
};

// Download invoice in any format mutation
export const useDownloadInvoice = () => {
    return useMutation({
        mutationFn: ({ id, format }: { id: string; format: string }) =>
            invoiceService.downloadInvoice(id, format),
    });
};

// Send invoice email mutation
export const useSendInvoiceEmail = () => {
    return useMutation({
        mutationFn: ({ id, email }: { id: string; email: string }) =>
            invoiceService.sendInvoiceEmail(id, email),
    });
};

// Download all invoices in bulk mutation
export const useDownloadAllInvoices = () => {
    return useMutation({
        mutationFn: ({ format, filters }: { format: string; filters?: InvoiceFilters }) =>
            invoiceService.downloadAllInvoices(format, filters),
    });
};