import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Home,
    Package,
    ArrowLeft,
    Plus,
    Search,
    X,
    DollarSign,
    AlertTriangle,
    XCircle,
    Edit,
    Trash2,
    Terminal,
    EyeOff,
} from "lucide-react";
import { formatCurrency, formatCurrencyCompact } from "../../utils/currency";

interface Product {
    id: number;
    name: string;
    costPerItem: number;
    stock: number;
    totalValue: number;
    status: "Active" | "Inactive";
    createdAt: string;
}

const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeOnlyFilter, setActiveOnlyFilter] = useState(false);
    const [inStockOnlyFilter, setInStockOnlyFilter] = useState(false);
    const [lowStockOnlyFilter, setLowStockOnlyFilter] = useState(false);
    const [pageSize, setPageSize] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [showConsole, setShowConsole] = useState(false);
    const [consoleEntries, setConsoleEntries] = useState<
        Array<{
            timestamp: string;
            message: string;
            type: "system" | "database" | "api" | "error";
        }>
    >([
        {
            timestamp: "[System]",
            message:
                "Product Management Console initialized - Ready to log database operations",
            type: "system",
        },
    ]);

    // Mock data for demonstration
    useEffect(() => {
        const mockProducts: Product[] = [
            {
                id: 1,
                name: "Wireless Headphones",
                costPerItem: 99.99,
                stock: 150,
                totalValue: 14998.5,
                status: "Active",
                createdAt: "2024-01-15",
            },
            {
                id: 2,
                name: "Smartphone Case",
                costPerItem: 24.99,
                stock: 5,
                totalValue: 124.95,
                status: "Active",
                createdAt: "2024-01-10",
            },
            {
                id: 3,
                name: "USB Cable",
                costPerItem: 12.99,
                stock: 0,
                totalValue: 0,
                status: "Active",
                createdAt: "2024-01-08",
            },
            {
                id: 4,
                name: "Laptop Stand",
                costPerItem: 45.99,
                stock: 75,
                totalValue: 3449.25,
                status: "Inactive",
                createdAt: "2024-01-05",
            },
        ];

        setTimeout(() => {
            setProducts(mockProducts);
            setLoading(false);
            addConsoleEntry(
                "Database connection established - Products loaded successfully",
                "database",
            );
        }, 1000);
    }, []);

    const addConsoleEntry = (
        message: string,
        type: "system" | "database" | "api" | "error",
    ) => {
        const timestamp = new Date().toLocaleTimeString();
        setConsoleEntries((prev) => [
            ...prev,
            { timestamp: `[${timestamp}]`, message, type },
        ]);
    };

    const clearConsole = () => {
        setConsoleEntries([
            {
                timestamp: "[System]",
                message: "Console cleared - Product Management Console ready",
                type: "system",
            },
        ]);
    };

    const clearFilters = () => {
        setActiveOnlyFilter(false);
        setInStockOnlyFilter(false);
        setLowStockOnlyFilter(false);
        setSearchQuery("");
        addConsoleEntry("All filters cleared", "system");
    };

    const clearSearch = () => {
        setSearchQuery("");
    };

    // Calculate stats
    const totalProducts = products.length;
    const totalValue = products.reduce(
        (sum, product) => sum + product.totalValue,
        0,
    );
    const lowStockCount = products.filter(
        (product) => product.stock > 0 && product.stock <= 10,
    ).length;
    const outOfStockCount = products.filter(
        (product) => product.stock === 0,
    ).length;

    // Filter products
    const filteredProducts = products.filter((product) => {
        if (
            searchQuery &&
            !product.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
            return false;
        }
        if (activeOnlyFilter && product.status !== "Active") {
            return false;
        }
        if (inStockOnlyFilter && product.stock === 0) {
            return false;
        }
        if (lowStockOnlyFilter && (product.stock === 0 || product.stock > 10)) {
            return false;
        }
        return true;
    });

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedProducts = filteredProducts.slice(
        startIndex,
        startIndex + pageSize,
    );

    const getStatusBadgeClasses = (status: string) => {
        return status === "Active"
            ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
            : "bg-[#e2e8f0] text-[#64748b]";
    };

    const getStockBadgeClasses = (stock: number) => {
        if (stock === 0) {
            return "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-[0_2px_8px_rgba(239,68,68,0.3)]";
        } else if (stock <= 10) {
            return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-[0_2px_8px_rgba(245,158,11,0.3)]";
        }
        return "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]";
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
                        <Package className="h-4 w-4" />
                        <span>Product Management</span>
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
                                    Product Management
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
                            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg">
                                <Plus className="h-4 w-4" />
                                Add New Product
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <Package className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Total Products
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {totalProducts}
                                </div>
                                <small className="text-gray-400 text-xs">
                                    Enhanced formatting
                                </small>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-600 rounded-r-2xl"></div>
                    </div>

                    <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <DollarSign className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Total Value
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatCurrencyCompact(totalValue)}
                                </div>
                                <small className="text-gray-400 text-xs">
                                    South African Rand (ZAR)
                                </small>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-green-500 to-green-600 rounded-r-2xl"></div>
                    </div>

                    <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <AlertTriangle className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Low Stock
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {lowStockCount}
                                </div>
                                <small className="text-gray-400 text-xs">
                                    Count & percentage
                                </small>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-r-2xl"></div>
                    </div>

                    <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <XCircle className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Out of Stock
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {outOfStockCount}
                                </div>
                                <small className="text-gray-400 text-xs">
                                    Count & percentage
                                </small>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-red-500 to-red-600 rounded-r-2xl"></div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search by product name..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={activeOnlyFilter}
                                    onChange={(e) =>
                                        setActiveOnlyFilter(e.target.checked)
                                    }
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Active Only
                                </span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={inStockOnlyFilter}
                                    onChange={(e) =>
                                        setInStockOnlyFilter(e.target.checked)
                                    }
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    In Stock Only
                                </span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={lowStockOnlyFilter}
                                    onChange={(e) =>
                                        setLowStockOnlyFilter(e.target.checked)
                                    }
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Low Stock Only
                                </span>
                            </label>
                            <button
                                onClick={clearFilters}
                                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Clear Filters
                            </button>
                            <button
                                onClick={() => setShowConsole(!showConsole)}
                                className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-900 hover:to-black transition-all duration-200 font-medium"
                            >
                                <Terminal className="h-4 w-4" />
                                {showConsole ? "Hide" : "Show"} Console Log
                            </button>
                            <div className="relative">
                                <select
                                    value={pageSize}
                                    onChange={(e) =>
                                        setPageSize(Number(e.target.value))
                                    }
                                    className="appearance-none bg-white border-2 border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                >
                                    <option value={5}>5 per page</option>
                                    <option value={10}>10 per page</option>
                                    <option value={25}>25 per page</option>
                                    <option value={50}>50 per page</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Console Log */}
                {showConsole && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 flex justify-between items-center">
                            <h6 className="font-semibold flex items-center gap-2">
                                <Terminal className="h-5 w-5" />
                                Product Management Console Log
                            </h6>
                            <div className="flex gap-2">
                                <button
                                    onClick={clearConsole}
                                    className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    Clear
                                </button>
                                <button
                                    onClick={() => setShowConsole(false)}
                                    className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                                >
                                    <EyeOff className="h-3 w-3" />
                                    Hide
                                </button>
                            </div>
                        </div>
                        <div className="bg-gray-900 text-gray-100 p-4 max-h-80 overflow-y-auto font-mono text-sm">
                            {consoleEntries.map((entry, index) => (
                                <div
                                    key={index}
                                    className="flex gap-3 py-1 border-b border-gray-700/30 last:border-b-0"
                                >
                                    <span
                                        className={`text-xs font-medium min-w-fit ${
                                            entry.type === "system"
                                                ? "text-blue-400"
                                                : entry.type === "database"
                                                  ? "text-green-400"
                                                  : entry.type === "api"
                                                    ? "text-yellow-400"
                                                    : "text-red-400"
                                        }`}
                                    >
                                        {entry.timestamp}
                                    </span>
                                    <span
                                        className={`${
                                            entry.type === "system"
                                                ? "text-blue-200"
                                                : entry.type === "database"
                                                  ? "text-green-200"
                                                  : entry.type === "api"
                                                    ? "text-yellow-200"
                                                    : "text-red-200"
                                        }`}
                                    >
                                        {entry.message}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Products Table - Matching Razor View Exactly */}
                <div className="bg-white border-0 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.08)] mx-6 overflow-hidden">
                    <div className="p-0">
                        <div className="rounded-2xl overflow-hidden">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-gray-500 font-medium">
                                        Loading products...
                                    </p>
                                </div>
                            ) : paginatedProducts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Package className="h-12 w-12 text-gray-300 mb-4" />
                                    <h5 className="text-lg font-semibold text-gray-600 mb-2">
                                        No products found
                                    </h5>
                                    <p className="text-gray-500">
                                        Try adjusting your search or filters
                                    </p>
                                </div>
                            ) : (
                                <table className="w-full m-0 border-separate border-spacing-0">
                                    <thead>
                                        <tr>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                                Name
                                            </th>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                                Cost per Item
                                            </th>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                                Stock
                                            </th>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                                Total Value
                                            </th>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                                Status
                                            </th>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-left">
                                                Created
                                            </th>
                                            <th className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-[0.5px] text-[#475569] p-4 sticky top-0 z-10 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedProducts.map(
                                            (product, index) => (
                                                <tr
                                                    key={product.id}
                                                    className="hover:bg-[#f8fafc] transition-colors duration-200"
                                                >
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== paginatedProducts.length - 1 ? "border-b border-[#f1f5f9]" : ""} font-medium text-gray-900`}
                                                    >
                                                        {product.name}
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== paginatedProducts.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-gray-700`}
                                                    >
                                                        {formatCurrency(
                                                            product.costPerItem,
                                                        )}
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== paginatedProducts.length - 1 ? "border-b border-[#f1f5f9]" : ""}`}
                                                    >
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${getStockBadgeClasses(product.stock)}`}
                                                        >
                                                            {product.stock}
                                                        </span>
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== paginatedProducts.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-gray-700`}
                                                    >
                                                        {formatCurrency(
                                                            product.totalValue,
                                                        )}
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== paginatedProducts.length - 1 ? "border-b border-[#f1f5f9]" : ""}`}
                                                    >
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${getStatusBadgeClasses(product.status)}`}
                                                        >
                                                            {product.status}
                                                        </span>
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== paginatedProducts.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-gray-700`}
                                                    >
                                                        {product.createdAt}
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== paginatedProducts.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-right`}
                                                    >
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(59,130,246,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)] border-0 min-w-[70px]"
                                                                title="Edit Product"
                                                            >
                                                                <Edit className="h-3 w-3" />
                                                                <span>
                                                                    Edit
                                                                </span>
                                                            </button>
                                                            <button
                                                                className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(245,158,11,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(245,158,11,0.4)] border-0 min-w-[70px]"
                                                                title="Update Stock"
                                                            >
                                                                <Package className="h-3 w-3" />
                                                                <span>
                                                                    Stock
                                                                </span>
                                                            </button>
                                                            <button
                                                                className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(239,68,68,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(239,68,68,0.4)] border-0 min-w-[70px]"
                                                                title="Delete Product"
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

                    {/* Footer with pagination - Matching Razor View */}
                    <div className="bg-[#f8fafc] border-t border-[#e2e8f0] px-6 py-4 flex justify-between items-center">
                        <span className="text-sm text-gray-600 font-medium flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            {filteredProducts.length} products
                        </span>
                        {totalPages > 1 && (
                            <nav aria-label="Product pagination">
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

export default Products;
