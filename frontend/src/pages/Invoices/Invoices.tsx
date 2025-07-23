import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FileText,
    Plus,
    Filter,
    Eye,
    Edit,
    Trash2,
    Download,
    ChevronDown,
    Home,
    ArrowLeft,
} from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import "./Invoices.css";

interface Invoice {
    id: string;
    createdDate: string;
    createdByUserName: string;
    totalItemCount: number;
    total: number;
    isActive: boolean;
}

const Invoices: React.FC = () => {
    const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [userFilter, setUserFilter] = useState("");

    // Mock data for demonstration
    useEffect(() => {
        const mockInvoices: Invoice[] = [
            {
                id: "inv-001-2024-001",
                createdDate: "2024-01-15",
                createdByUserName: "John Smith",
                totalItemCount: 5,
                total: 2450.75,
                isActive: true,
            },
            {
                id: "inv-002-2024-002",
                createdDate: "2024-01-14",
                createdByUserName: "Sarah Johnson",
                totalItemCount: 12,
                total: 5890.25,
                isActive: true,
            },
            {
                id: "inv-003-2024-003",
                createdDate: "2024-01-13",
                createdByUserName: "Mike Davis",
                totalItemCount: 3,
                total: 1275.5,
                isActive: false,
            },
            {
                id: "inv-004-2024-004",
                createdDate: "2024-01-12",
                createdByUserName: "Emily Wilson",
                totalItemCount: 8,
                total: 3420.0,
                isActive: true,
            },
            {
                id: "inv-005-2024-005",
                createdDate: "2024-01-11",
                createdByUserName: "David Brown",
                totalItemCount: 15,
                total: 7850.9,
                isActive: true,
            },
            {
                id: "inv-006-2024-006",
                createdDate: "2024-01-10",
                createdByUserName: "Lisa Anderson",
                totalItemCount: 6,
                total: 2100.25,
                isActive: false,
            },
            {
                id: "inv-007-2024-007",
                createdDate: "2024-01-09",
                createdByUserName: "Robert Taylor",
                totalItemCount: 9,
                total: 4567.8,
                isActive: true,
            },
            {
                id: "inv-008-2024-008",
                createdDate: "2024-01-08",
                createdByUserName: "Jennifer Martinez",
                totalItemCount: 4,
                total: 1890.45,
                isActive: true,
            },
            {
                id: "inv-009-2024-009",
                createdDate: "2024-01-07",
                createdByUserName: "Christopher Lee",
                totalItemCount: 11,
                total: 6234.7,
                isActive: false,
            },
            {
                id: "inv-010-2024-010",
                createdDate: "2024-01-06",
                createdByUserName: "Amanda White",
                totalItemCount: 7,
                total: 3156.85,
                isActive: true,
            },
            {
                id: "inv-011-2024-011",
                createdDate: "2024-01-05",
                createdByUserName: "Kevin Garcia",
                totalItemCount: 13,
                total: 8945.6,
                isActive: true,
            },
            {
                id: "inv-012-2024-012",
                createdDate: "2024-01-04",
                createdByUserName: "Michelle Rodriguez",
                totalItemCount: 2,
                total: 875.3,
                isActive: false,
            },
        ];

        // Simulate loading
        setTimeout(() => {
            setFilteredInvoices(mockInvoices);
            setLoading(false);
        }, 1000);
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getInvoiceNumber = (id: string) => {
        return id.substring(0, 8).toUpperCase();
    };

    const handleCreateInvoice = () => {
        console.log("Create invoice clicked");
    };

    const handleEditInvoice = (id: string) => {
        console.log("Edit invoice:", id);
    };

    const handleViewInvoice = (id: string) => {
        console.log("View invoice:", id);
    };

    const handleDeleteInvoice = (id: string) => {
        if (
            window.confirm(
                "Are you sure you want to delete this invoice? This action cannot be undone.",
            )
        ) {
            console.log("Delete invoice:", id);
        }
    };

    const handleDownload = (id: string, format: string) => {
        console.log("Download invoice:", id, "as", format);
    };

    const handleFilter = () => {
        console.log("Filter invoices");
    };

    const clearFilters = () => {
        setStartDate("");
        setEndDate("");
        setUserFilter("");
        setFilteredInvoices([]);
    };

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

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
                            <a
                                href="/admin"
                                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 text-gray-600 rounded-lg hover:bg-gray-400 hover:text-white transition-all duration-200 font-medium"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Admin Panel
                            </a>
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
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    Created By
                                </label>
                                <select
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                    id="userFilter"
                                    value={userFilter}
                                    onChange={(e) =>
                                        setUserFilter(e.target.value)
                                    }
                                >
                                    <option value="">All Users</option>
                                    <option value="John Smith">
                                        John Smith
                                    </option>
                                    <option value="Sarah Johnson">
                                        Sarah Johnson
                                    </option>
                                    <option value="Mike Davis">
                                        Mike Davis
                                    </option>
                                    <option value="Emily Wilson">
                                        Emily Wilson
                                    </option>
                                    <option value="David Brown">
                                        David Brown
                                    </option>
                                    <option value="Lisa Anderson">
                                        Lisa Anderson
                                    </option>
                                    <option value="Robert Taylor">
                                        Robert Taylor
                                    </option>
                                    <option value="Jennifer Martinez">
                                        Jennifer Martinez
                                    </option>
                                    <option value="Christopher Lee">
                                        Christopher Lee
                                    </option>
                                    <option value="Amanda White">
                                        Amanda White
                                    </option>
                                    <option value="Kevin Garcia">
                                        Kevin Garcia
                                    </option>
                                    <option value="Michelle Rodriguez">
                                        Michelle Rodriguez
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-end gap-3">
                            <button
                                type="button"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium"
                                onClick={handleFilter}
                            >
                                <Filter className="h-4 w-4" />
                                Filter
                            </button>
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
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-gray-500 font-medium">
                                        Loading invoices...
                                    </p>
                                </div>
                            ) : filteredInvoices.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <FileText className="h-12 w-12 text-gray-300 mb-4" />
                                    <h5 className="text-lg font-semibold text-gray-600 mb-2">
                                        No invoices found
                                    </h5>
                                    <p className="text-gray-500">
                                        Create your first invoice to get
                                        started.
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
                                                Date Created
                                            </th>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                                Created By
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
                                        {currentInvoices.map(
                                            (invoice, index) => (
                                                <tr
                                                    key={invoice.id}
                                                    className="hover:bg-[#f8fafc] transition-colors duration-200"
                                                >
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== currentInvoices.length - 1 ? "border-b border-[#f1f5f9]" : ""} font-medium text-gray-900`}
                                                    >
                                                        <span className="invoice-number">
                                                            {getInvoiceNumber(
                                                                invoice.id,
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== currentInvoices.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-gray-700`}
                                                    >
                                                        {formatDate(
                                                            invoice.createdDate,
                                                        )}
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== currentInvoices.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-gray-700`}
                                                    >
                                                        {invoice.createdByUserName ||
                                                            "Unknown User"}
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== currentInvoices.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-gray-700`}
                                                    >
                                                        {invoice.totalItemCount ||
                                                            0}
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== currentInvoices.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-gray-700`}
                                                    >
                                                        <span className="invoice-total">
                                                            {formatCurrency(
                                                                invoice.total ||
                                                                    0,
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== currentInvoices.length - 1 ? "border-b border-[#f1f5f9]" : ""}`}
                                                    >
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${invoice.isActive ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]" : "bg-[#e2e8f0] text-[#64748b]"}`}
                                                        >
                                                            {invoice.isActive
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </span>
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== currentInvoices.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-right`}
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
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                                <span>
                                                                    Delete
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
                            {filteredInvoices.length} invoice
                            {filteredInvoices.length !== 1 ? "s" : ""}
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
        </div>
    );
};

export default Invoices;
