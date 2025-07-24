import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FileText,
    Plus,
    Eye,
    Edit,
    Trash2,
    Download,
    ChevronDown,
    Home,
    ArrowLeft,
    Loader2,
    XCircle,
} from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { useInvoices, useDeleteInvoice, useInvoice, useDownloadInvoice } from "../../hooks/useInvoices";
import { useRealTimeUpdates } from "../../hooks/useRealTimeUpdates";
import InvoiceForm from "../../components/Invoices/InvoiceForm";
import InvoiceDetail from "../../components/Invoices/InvoiceDetail";
import Snackbar from "../../components/ui/Snackbar";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import type { PaginationParams, InvoiceDto } from "../../types/index";
import type { InvoiceFilters } from "../../services/invoiceService";
import "./Invoices.css";

const Invoices: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [userFilter, setUserFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const [editingInvoice, setEditingInvoice] = useState<InvoiceDto | null>(null);

    // Snackbar and confirmation states
    const [snackbar, setSnackbar] = useState<{
        isOpen: boolean;
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
    }>({
        isOpen: false,
        message: '',
        type: 'info',
    });

    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    // Prepare filters for API call
    const filters: InvoiceFilters = {
        search: searchQuery || undefined,
        dateFrom: startDate || undefined,
        dateTo: endDate || undefined,
        // Note: userFilter would need to be mapped to customerId or similar field
    };

    // Prepare pagination for API call
    const pagination: PaginationParams = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
    };

    // Fetch invoices from API
    const { data: invoicesResponse, isLoading, error } = useInvoices(pagination, filters);
    
    // Fetch selected invoice for viewing/editing
    const { data: selectedInvoice } = useInvoice(selectedInvoiceId || "");
    
    // Download invoice mutation
    const downloadInvoiceMutation = useDownloadInvoice();
    
    // Enable real-time updates
    useRealTimeUpdates();

    // Delete invoice mutation
    const deleteInvoiceMutation = useDeleteInvoice();

    // Get data from API responses
    const invoices = invoicesResponse?.data || [];
    const totalPages = invoicesResponse?.totalPages || 1;
    const totalCount = invoicesResponse?.totalCount || 0;

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, startDate, endDate, userFilter]);

    // Reset to page 1 when page size changes
    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getInvoiceNumber = (invoiceNumber: string) => {
        return invoiceNumber || "N/A";
    };

    const handleCreateInvoice = () => {
        setEditingInvoice(null);
        setIsFormOpen(true);
    };

    const handleEditInvoice = (id: string) => {
        setSelectedInvoiceId(id);
        setEditingInvoice(invoices.find(inv => inv.id === id) || null);
        setIsFormOpen(true);
    };

    const handleViewInvoice = (id: string) => {
        setSelectedInvoiceId(id);
        setIsDetailOpen(true);
    };

    const showSnackbar = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        setSnackbar({
            isOpen: true,
            message,
            type,
        });
    };

    const hideSnackbar = () => {
        setSnackbar(prev => ({ ...prev, isOpen: false }));
    };

    const showConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
        setConfirmDialog({
            isOpen: true,
            title,
            message,
            onConfirm,
        });
    };

    const hideConfirmDialog = () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    };

    const handleDeleteInvoice = (id: string) => {
        const invoice = invoices.find(inv => inv.id === id);
        const invoiceNumber = invoice?.invoiceNumber || id;
        
        showConfirmDialog(
            "Delete Invoice",
            `Are you sure you want to delete invoice #${invoiceNumber}? This action cannot be undone.`,
            async () => {
                try {
                    await deleteInvoiceMutation.mutateAsync(id);
                    showSnackbar("Invoice deleted successfully", "success");
                    hideConfirmDialog();
                } catch (error) {
                    console.error("Failed to delete invoice:", error);
                    showSnackbar("Failed to delete invoice. Please try again.", "error");
                    hideConfirmDialog();
                }
            }
        );
    };

    const handleDownload = async (id: string, format: string) => {
        const invoice = invoices.find(inv => inv.id === id);
        const invoiceNumber = invoice?.invoiceNumber || id;

        try {
            showSnackbar(`Generating ${format.toUpperCase()}...`, "info");
            
            // Use the backend for all formats
            const blob = await downloadInvoiceMutation.mutateAsync({ id, format });
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            
            // Set appropriate file extension
            const extensions: Record<string, string> = {
                pdf: 'pdf',
                excel: 'xlsx',
                csv: 'csv',
                json: 'json'
            };
            
            const extension = extensions[format] || format;
            link.download = `invoice-${invoiceNumber}.${extension}`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            showSnackbar(`${format.toUpperCase()} downloaded successfully`, "success");
        } catch (error) {
            console.error(`Failed to download ${format}:`, error);
            showSnackbar(`Failed to download ${format.toUpperCase()}. Please try again.`, "error");
        }
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setEditingInvoice(null);
        setSelectedInvoiceId(null);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingInvoice(null);
        setSelectedInvoiceId(null);
    };

    const handleDetailClose = () => {
        setIsDetailOpen(false);
        setSelectedInvoiceId(null);
    };

    const handleDetailEdit = () => {
        setIsDetailOpen(false);
        setEditingInvoice(selectedInvoice || null);
        setIsFormOpen(true);
    };

    const clearFilters = () => {
        setStartDate("");
        setEndDate("");
        setUserFilter("");
        setSearchQuery("");
    };

    return (
        <div className="min-h-screen bg-gray-50 w-full">
            {/* Navigation Breadcrumb */}
            <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-30 w-full px-4 sm:px-6 lg:px-8 py-4">
                <ol className="flex items-center gap-2 text-sm">
                    <li className="flex items-center gap-2">
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors font-medium"
                        >
                            <Home className="h-4 w-4" />
                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <span className="text-gray-400">/</span>
                    <li className="flex items-center gap-2 text-gray-900 font-semibold">
                        <FileText className="h-4 w-4" />
                        <span>Invoice Management</span>
                    </li>
                </ol>
            </nav>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-6 mb-3">
                                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Invoice Management
                                </h1>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 text-gray-600 rounded-lg hover:bg-gray-400 hover:text-white transition-all duration-200 font-medium"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Dashboard
                            </Link>
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg"
                                onClick={handleCreateInvoice}
                            >
                                <Plus className="h-4 w-4" />
                                Create New Invoice
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label
                                    htmlFor="searchQuery"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Search
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                    id="searchQuery"
                                    placeholder="Search invoices..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="startDate"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                    id="startDate"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="endDate"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                    id="endDate"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="userFilter"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Customer
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                    id="userFilter"
                                    placeholder="Filter by customer..."
                                    value={userFilter}
                                    onChange={(e) => setUserFilter(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap items-end gap-3">
                            <button
                                type="button"
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                onClick={clearFilters}
                            >
                                <span>×</span>
                                Clear
                            </button>
                            <div className="relative">
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) =>
                                        setItemsPerPage(Number(e.target.value))
                                    }
                                    className="appearance-none bg-white border-2 border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                >
                                    <option value={5}>5 per page</option>
                                    <option value={10}>10 per page</option>
                                    <option value={25}>25 per page</option>
                                    <option value={50}>50 per page</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoices Table Card - Full Width */}
                <div className="bg-white border-0 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.08)] overflow-hidden w-full">
                    <div className="p-0">
                        <div className="rounded-2xl overflow-hidden">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                                    <p className="text-gray-500 font-medium">
                                        Loading invoices...
                                    </p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <XCircle className="h-12 w-12 text-red-400 mb-4" />
                                    <h5 className="text-lg font-semibold text-gray-600 mb-2">
                                        Error loading invoices
                                    </h5>
                                    <p className="text-gray-500 text-center mb-4">
                                        {error.message || "Failed to load invoices from the server"}
                                    </p>
                                    {error.message?.includes('401') || error.message?.includes('Unauthorized') ? (
                                        <div className="text-center">
                                            <p className="text-sm text-gray-600 mb-3">
                                                You may need to log in again to access this data.
                                            </p>
                                            <Link
                                                to="/login"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                            >
                                                Go to Login
                                            </Link>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                                        >
                                            Try Again
                                        </button>
                                    )}
                                </div>
                            ) : invoices.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <FileText className="h-12 w-12 text-gray-300 mb-4" />
                                    <h5 className="text-lg font-semibold text-gray-600 mb-2">
                                        No invoices found
                                    </h5>
                                    <p className="text-gray-500">
                                        Create your first invoice to get started.
                                    </p>
                                </div>
                            ) : (
                                <table className="w-full m-0 border-separate border-spacing-0">
                                    <thead>
                                        <tr>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                                Invoice #
                                            </th>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                                Customer
                                            </th>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                                Issue Date
                                            </th>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                                Due Date
                                            </th>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                                Items
                                            </th>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                                Total
                                            </th>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                                Status
                                            </th>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.map(
                                            (invoice, index) => (
                                                <tr
                                                    key={invoice.id}
                                                    className="hover:bg-[#f8fafc] transition-colors duration-200"
                                                >
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== invoices.length - 1 ? "border-b border-[#f1f5f9]" : ""} font-medium text-gray-900`}
                                                    >
                                                        <span className="invoice-number">
                                                            {getInvoiceNumber(
                                                                invoice.invoiceNumber,
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== invoices.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-gray-700`}
                                                    >
                                                        {invoice.customerName || "Unknown Customer"}
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== invoices.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-gray-700`}
                                                    >
                                                        {formatDate(invoice.issueDate)}
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== invoices.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-gray-700`}
                                                    >
                                                        {formatDate(invoice.dueDate)}
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== invoices.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-gray-700`}
                                                    >
                                                        {invoice.items?.length || 0}
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== invoices.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-gray-700`}
                                                    >
                                                        <span className="invoice-total">
                                                            {formatCurrency(invoice.totalAmount)}
                                                        </span>
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== invoices.length - 1 ? "border-b border-[#f1f5f9]" : ""}`}
                                                    >
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${
                                                                invoice.status === 'Paid' 
                                                                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]" 
                                                                    : invoice.status === 'Pending'
                                                                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-[0_2px_8px_rgba(245,158,11,0.3)]"
                                                                    : "bg-[#e2e8f0] text-[#64748b]"
                                                            }`}
                                                        >
                                                            {invoice.status || "Draft"}
                                                        </span>
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== invoices.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-right`}
                                                    >
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(59,130,246,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)] border-0 min-w-[70px]"
                                                                onClick={() =>
                                                                    handleEditInvoice(
                                                                        invoice.id,
                                                                    )
                                                                }
                                                                title="Edit"
                                                            >
                                                                <Edit className="h-3 w-3" />
                                                                <span>
                                                                    Edit
                                                                </span>
                                                            </button>
                                                            <button
                                                                className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(6,182,212,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(6,182,212,0.4)] border-0 min-w-[70px]"
                                                                onClick={() =>
                                                                    handleViewInvoice(
                                                                        invoice.id,
                                                                    )
                                                                }
                                                                title="View"
                                                            >
                                                                <Eye className="h-3 w-3" />
                                                                <span>
                                                                    View
                                                                </span>
                                                            </button>
                                                            <div className="relative group">
                                                                <button
                                                                    className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(16,185,129,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(16,185,129,0.4)] border-0 min-w-[70px]"
                                                                    title="Download"
                                                                >
                                                                    <Download className="h-3 w-3" />
                                                                    <span>
                                                                        Download
                                                                    </span>
                                                                </button>
                                                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[120px] z-[60] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                                                    <button
                                                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                                        onClick={() =>
                                                                            handleDownload(
                                                                                invoice.id,
                                                                                "pdf",
                                                                            )
                                                                        }
                                                                    >
                                                                        <FileText className="h-4 w-4 text-red-600" />
                                                                        PDF
                                                                    </button>
                                                                    <button
                                                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                                        onClick={() =>
                                                                            handleDownload(
                                                                                invoice.id,
                                                                                "excel",
                                                                            )
                                                                        }
                                                                    >
                                                                        <FileText className="h-4 w-4 text-green-600" />
                                                                        Excel
                                                                    </button>
                                                                    <button
                                                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                                        onClick={() =>
                                                                            handleDownload(
                                                                                invoice.id,
                                                                                "csv",
                                                                            )
                                                                        }
                                                                    >
                                                                        <FileText className="h-4 w-4 text-blue-600" />
                                                                        CSV
                                                                    </button>
                                                                    <button
                                                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                                        onClick={() =>
                                                                            handleDownload(
                                                                                invoice.id,
                                                                                "json",
                                                                            )
                                                                        }
                                                                    >
                                                                        <FileText className="h-4 w-4 text-yellow-600" />
                                                                        JSON
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <button
                                                                className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(239,68,68,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(239,68,68,0.4)] border-0 min-w-[70px]"
                                                                onClick={() =>
                                                                    handleDeleteInvoice(
                                                                        invoice.id,
                                                                    )
                                                                }
                                                                title="Delete"
                                                                disabled={deleteInvoiceMutation.isPending}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                                <span>
                                                                    {deleteInvoiceMutation.isPending ? "..." : "Delete"}
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Footer with pagination - Matching Product Management Style */}
                    <div className="bg-[#f8fafc] border-t border-[#e2e8f0] px-6 py-4 flex justify-between items-center">
                        <span className="text-sm text-gray-600 font-medium flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            {totalCount} invoice{totalCount !== 1 ? "s" : ""}
                        </span>
                        {totalPages > 1 && (
                            <nav aria-label="Invoice pagination">
                                <ul className="flex gap-1 justify-end mb-0 text-sm">
                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => i + 1,
                                    ).map((page) => (
                                        <li key={page}>
                                            <button
                                                onClick={() =>
                                                    setCurrentPage(page)
                                                }
                                                className={`px-3 py-1 rounded transition-colors ${
                                                    currentPage === page
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-white text-gray-700 hover:bg-gray-100"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        )}
                    </div>
                </div>
            </div>

            {/* Invoice Form Modal */}
            <InvoiceForm
                invoice={editingInvoice || undefined}
                isOpen={isFormOpen}
                onClose={handleFormClose}
                onSuccess={handleFormSuccess}
            />

            {/* Invoice Detail Modal */}
            {selectedInvoice && (
                <InvoiceDetail
                    invoice={selectedInvoice}
                    isOpen={isDetailOpen}
                    onClose={handleDetailClose}
                    onEdit={handleDetailEdit}
                />
            )}

            {/* Snackbar */}
            <Snackbar
                isOpen={snackbar.isOpen}
                message={snackbar.message}
                type={snackbar.type}
                onClose={hideSnackbar}
            />

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                type="danger"
                onConfirm={confirmDialog.onConfirm}
                onCancel={hideConfirmDialog}
            />
        </div>
    );
};

export default Invoices;