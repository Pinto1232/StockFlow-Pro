import { apiService } from "./api";
import api from "./api";
import type {
    InvoiceDto,
    PaginatedResponse,
    PaginationParams,
} from "../types/index";

export interface InvoiceFilters {
    search?: string;
    status?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface CreateInvoiceDto {
    customerId: string;
    customerName: string;
    dueDate: string;
    notes?: string;
    items: CreateInvoiceItemDto[];
}

export interface CreateInvoiceItemDto {
    productId: string;
    quantity: number;
    unitPrice: number;
}

export interface UpdateInvoiceDto {
    customerId: string;
    customerName: string;
    dueDate: string;
    notes?: string;
    items: CreateInvoiceItemDto[];
}

export const invoiceService = {
    // Get all invoices with pagination and filters
    getInvoices: async (
        pagination: PaginationParams,
        filters?: InvoiceFilters,
    ): Promise<PaginatedResponse<InvoiceDto>> => {
        const params: Record<string, string | number | boolean> = {
            pageNumber: pagination.pageNumber,
            pageSize: pagination.pageSize,
        };

        // Map frontend filters to backend parameters
        if (filters?.search) {
            params.search = filters.search;
        }
        if (filters?.status) {
            params.status = filters.status;
        }
        if (filters?.customerId) {
            params.customerId = filters.customerId;
        }
        if (filters?.dateFrom) {
            params.dateFrom = filters.dateFrom;
        }
        if (filters?.dateTo) {
            params.dateTo = filters.dateTo;
        }

        return await apiService.get<PaginatedResponse<InvoiceDto>>(
            "/invoices",
            params,
        );
    },

    // Get invoice by ID
    getInvoiceById: async (id: string): Promise<InvoiceDto> => {
        return await apiService.get<InvoiceDto>(`/invoices/${id}`);
    },

    // Create new invoice
    createInvoice: async (
        invoiceData: CreateInvoiceDto,
    ): Promise<InvoiceDto> => {
        return await apiService.post<InvoiceDto>("/invoices", invoiceData);
    },

    // Update invoice
    updateInvoice: async (
        id: string,
        invoiceData: UpdateInvoiceDto,
    ): Promise<InvoiceDto> => {
        return await apiService.put<InvoiceDto>(`/invoices/${id}`, invoiceData);
    },

    // Delete invoice
    deleteInvoice: async (id: string): Promise<void> => {
        await apiService.delete(`/invoices/${id}`);
    },

    // Get invoice statistics
    getInvoiceStats: async () => {
        return await apiService.get("/invoices/stats");
    },

    // Generate invoice PDF
    generateInvoicePdf: async (id: string): Promise<Blob> => {
        const response = await api.get(`/invoices/${id}/download/pdf`, {
            responseType: 'blob'
        });
        return response.data;
    },

    // Download invoice in any format (pdf, excel, csv, json)
    downloadInvoice: async (id: string, format: string): Promise<Blob> => {
        const response = await api.get(`/invoices/${id}/download/${format}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    // Send invoice via email
    sendInvoiceEmail: async (id: string, email: string): Promise<void> => {
        await apiService.post(`/invoices/${id}/send`, { email });
    },

    // Download all invoices in bulk
    downloadAllInvoices: async (format: string, filters?: InvoiceFilters): Promise<Blob> => {
        const params: Record<string, string> = {};

        // Add filters as query parameters
        if (filters?.search) {
            params.search = filters.search;
        }
        if (filters?.status) {
            params.status = filters.status;
        }
        if (filters?.customerId) {
            params.customerId = filters.customerId;
        }
        if (filters?.dateFrom) {
            params.dateFrom = filters.dateFrom;
        }
        if (filters?.dateTo) {
            params.dateTo = filters.dateTo;
        }

        const queryString = new URLSearchParams(params).toString();
        const url = `/invoices/download/bulk/${format}${queryString ? `?${queryString}` : ''}`;
        
        const response = await api.get(url, {
            responseType: 'blob'
        });
        return response.data;
    },
};