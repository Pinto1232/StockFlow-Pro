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
    Loader2,
    Eye,
    Download,
    FileText,
} from "lucide-react";
import { formatCurrency, formatCurrencyCompact } from "../../utils/currency";
import { useProducts as useArchitectureProducts } from "../../architecture/adapters/primary/hooks";
import { useRealTimeUpdates } from "../../hooks/useRealTimeUpdates";
import { CreateProductRequest, UpdateProductRequest, StockAdjustmentRequest } from "../../architecture/ports/primary/ProductManagementPort";
import { ProductEntity } from "../../architecture/domain/entities/Product";
import ProductForm from "../../components/Products/ProductForm";
import StockAdjustmentModal from "../../components/Products/StockAdjustmentModal";
import DeleteProductModal from "../../components/Products/DeleteProductModal";
import ProductDetail from "../../components/Products/ProductDetail";

const Products: React.FC = () => {
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

    // Modal states
    const [showProductForm, setShowProductForm] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductEntity | null>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    // Use hexagonal architecture hooks
    const productManagement = useArchitectureProducts();

    // Extract stable function to avoid infinite re-renders
    const { updateFilters } = productManagement;

    // Update filters when they change
    useEffect(() => {
        const filters = {
            search: searchQuery || undefined,
            isActive: activeOnlyFilter || undefined,
            stockStatus: lowStockOnlyFilter ? 'low' as const : undefined,
            page: currentPage,
            pageSize: pageSize,
        };
        updateFilters(filters);
    }, [
        searchQuery, 
        activeOnlyFilter, 
        lowStockOnlyFilter, 
        currentPage, 
        pageSize,
        updateFilters
    ]);

    // Enable real-time updates
    useRealTimeUpdates();

    // Get data from architecture hooks
    const products = productManagement.products;
    const totalPages = productManagement.totalPages;
    const totalCount = productManagement.totalProducts;
    const isLoading = productManagement.isLoading;
    const error = productManagement.error;
    const categories = productManagement.categories;

    // Calculate stats from API data
    const totalProducts = totalCount;
    const totalValue = productManagement.inventoryValueReport?.totalValue || products.reduce((sum, product) => sum + (product.totalValue || product.calculatedTotalValue), 0);
    const lowStockCount = products.filter(product => product.isLowStock).length;
    const outOfStockCount = products.filter(product => product.isOutOfStock).length;

    // Log API calls to console
    useEffect(() => {
        if (isLoading) {
            addConsoleEntry(`Fetching products from API with pageSize: ${pageSize}, pageNumber: ${currentPage}`, "api");
        } else if (error) {
            addConsoleEntry(`API Error: ${error.message}`, "error");
        } else if (products.length > 0) {
            addConsoleEntry(
                `API Success: Requested pageSize: ${pageSize}, Received ${products.length} products (Page ${currentPage} of ${totalPages}, Total: ${totalProducts})`,
                "api"
            );
        }
    }, [isLoading, error, products, pageSize, currentPage, totalPages, totalProducts]);

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
        productManagement.clearFilters();
        addConsoleEntry("All filters cleared", "system");
    };

    const clearSearch = () => {
        setSearchQuery("");
    };

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeOnlyFilter, inStockOnlyFilter, lowStockOnlyFilter]);

    // Reset to page 1 when page size changes
    useEffect(() => {
        setCurrentPage(1);
    }, [pageSize]);

    // CRUD handlers
    const handleCreateProduct = () => {
        setFormMode('create');
        setSelectedProduct(null);
        setShowProductForm(true);
        addConsoleEntry("Opening create product form", "system");
    };

    const handleEditProduct = (product: ProductEntity) => {
        setFormMode('edit');
        setSelectedProduct(product);
        setShowProductForm(true);
        addConsoleEntry(`Opening edit form for product: ${product.name}`, "system");
    };

    const handleStockAdjustment = (product: ProductEntity) => {
        setSelectedProduct(product);
        setShowStockModal(true);
        addConsoleEntry(`Opening stock adjustment for product: ${product.name}`, "system");
    };

    const handleDeleteProduct = (product: ProductEntity) => {
        setSelectedProduct(product);
        setShowDeleteModal(true);
        addConsoleEntry(`Opening delete confirmation for product: ${product.name}`, "system");
    };

    const handleViewProduct = (product: ProductEntity) => {
        setSelectedProduct(product);
        setShowDetailModal(true);
        addConsoleEntry(`Opening product details for: ${product.name}`, "system");
    };

    const handleDownloadProduct = async (product: ProductEntity, format: string) => {
        try {
            addConsoleEntry(`Generating ${format.toUpperCase()} for product: ${product.name}`, "system");
            
            // Use the architecture's download method directly
            productManagement.downloadProduct({ id: product.id, format });
        } catch (error) {
            addConsoleEntry(`Failed to download ${format}: ${error}`, "error");
        }
    };

    const handleDownloadAllProducts = async (format: string) => {
        try {
            addConsoleEntry(`Generating bulk ${format.toUpperCase()} for all products`, "system");
            
            // Use current filters for bulk download
            const currentFilters = {
                search: searchQuery || undefined,
                isActive: activeOnlyFilter || undefined,
                stockStatus: lowStockOnlyFilter ? 'low' as const : undefined,
            };
            
            // Use the architecture's bulk download method directly
            productManagement.downloadAllProducts({ format, filters: currentFilters });
        } catch (error) {
            addConsoleEntry(`Failed to download bulk ${format}: ${error}`, "error");
        }
    };

    const handleProductSubmit = async (data: CreateProductRequest | UpdateProductRequest) => {
        try {
            if (formMode === 'create') {
                await productManagement.createProduct(data as CreateProductRequest);
                addConsoleEntry(`Product created successfully: ${data.name}`, "database");
            } else {
                await productManagement.updateProduct(data as UpdateProductRequest);
                addConsoleEntry(`Product updated successfully: ${data.name}`, "database");
            }
            setShowProductForm(false);
            setSelectedProduct(null);
        } catch (error) {
            addConsoleEntry(`Failed to ${formMode} product: ${error}`, "error");
        }
    };

    const handleStockSubmit = async (request: StockAdjustmentRequest) => {
        try {
            await productManagement.adjustStock(request);
            addConsoleEntry(`Stock adjusted for product ID ${request.productId}: ${request.adjustment > 0 ? '+' : ''}${request.adjustment}`, "database");
            
            // Explicitly refetch products to ensure table updates
            await productManagement.refetchProducts();
            addConsoleEntry("Product table refreshed after stock adjustment", "system");
            
            setShowStockModal(false);
            setSelectedProduct(null);
        } catch (error) {
            addConsoleEntry(`Failed to adjust stock: ${error}`, "error");
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedProduct) return;
        
        try {
            await productManagement.deleteProduct(selectedProduct.id);
            addConsoleEntry(`Product deleted successfully: ${selectedProduct.name}`, "database");
            setShowDeleteModal(false);
            setSelectedProduct(null);
        } catch (error) {
            addConsoleEntry(`Failed to delete product: ${error}`, "error");
        }
    };

    const getStatusBadgeClasses = (isActive: boolean) => {
        return isActive
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

    // Format date helper
    const formatDate = (date: Date) => {
        return date.toLocaleDateString();
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
                            <button 
                                onClick={handleCreateProduct}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg"
                                disabled={productManagement.isCreatingProduct}
                            >
                                {productManagement.isCreatingProduct ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
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

                {/* Products Table */}
                <div className="bg-white border-0 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.08)] mx-6 overflow-hidden">
                    <div className="p-0">
                        <div className="rounded-2xl overflow-hidden">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                                    <p className="text-gray-500 font-medium">
                                        Loading products...
                                    </p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <XCircle className="h-12 w-12 text-red-400 mb-4" />
                                    <h5 className="text-lg font-semibold text-gray-600 mb-2">
                                        Error loading products
                                    </h5>
                                    <p className="text-gray-500 text-center">
                                        {error.message || "Failed to load products from the server"}
                                    </p>
                                </div>
                            ) : products.length === 0 ? (
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
                                        {products.map(
                                            (product, index) => (
                                                <tr
                                                    key={product.id}
                                                    className="hover:bg-[#f8fafc] transition-colors duration-200"
                                                >
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== products.length - 1 ? "border-b border-[#f1f5f9]" : ""} font-medium text-gray-900`}
                                                    >
                                                        {product.name}
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== products.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-gray-700`}
                                                    >
                                                        {formatCurrency(product.cost)}
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== products.length - 1 ? "border-b border-[#f1f5f9]" : ""}`}
                                                    >
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${getStockBadgeClasses(product.quantity)}`}
                                                        >
                                                            {product.quantity}
                                                        </span>
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== products.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-gray-700`}
                                                    >
                                                        {formatCurrency(product.totalValue || product.calculatedTotalValue)}
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== products.length - 1 ? "border-b border-[#f1f5f9]" : ""}`}
                                                    >
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${getStatusBadgeClasses(product.isActive)}`}
                                                        >
                                                            {product.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== products.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-gray-700`}
                                                    >
                                                        {formatDate(product.createdAt)}
                                                    </td>
                                                    <td
                                                        className={`align-middle text-sm p-4 ${index !== products.length - 1 ? "border-b border-[#f1f5f9]" : ""} text-right`}
                                                    >
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleEditProduct(product)}
                                                                className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(59,130,246,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)] border-0 min-w-[70px]"
                                                                title="Edit Product"
                                                                disabled={productManagement.isUpdatingProduct}
                                                            >
                                                                {productManagement.isUpdatingProduct ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                ) : (
                                                                    <Edit className="h-3 w-3" />
                                                                )}
                                                                <span>Edit</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleViewProduct(product)}
                                                                className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(6,182,212,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(6,182,212,0.4)] border-0 min-w-[70px]"
                                                                title="View Product"
                                                            >
                                                                <Eye className="h-3 w-3" />
                                                                <span>View</span>
                                                            </button>
                                                            <div className="relative group">
                                                                <button
                                                                    className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(16,185,129,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(16,185,129,0.4)] border-0 min-w-[70px]"
                                                                    title="Download"
                                                                >
                                                                    <Download className="h-3 w-3" />
                                                                    <span>Download</span>
                                                                </button>
                                                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[120px] z-[60] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                                                    <button
                                                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                                        onClick={() => handleDownloadProduct(product, "pdf")}
                                                                    >
                                                                        <FileText className="h-4 w-4 text-red-600" />
                                                                        PDF
                                                                    </button>
                                                                    <button
                                                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                                        onClick={() => handleDownloadProduct(product, "excel")}
                                                                    >
                                                                        <FileText className="h-4 w-4 text-green-600" />
                                                                        Excel
                                                                    </button>
                                                                    <button
                                                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                                        onClick={() => handleDownloadProduct(product, "csv")}
                                                                    >
                                                                        <FileText className="h-4 w-4 text-blue-600" />
                                                                        CSV
                                                                    </button>
                                                                    <button
                                                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                                        onClick={() => handleDownloadProduct(product, "json")}
                                                                    >
                                                                        <FileText className="h-4 w-4 text-yellow-600" />
                                                                        JSON
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleStockAdjustment(product)}
                                                                className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(245,158,11,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(245,158,11,0.4)] border-0 min-w-[70px]"
                                                                title="Update Stock"
                                                                disabled={productManagement.isAdjustingStock}
                                                            >
                                                                {productManagement.isAdjustingStock ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                ) : (
                                                                    <Package className="h-3 w-3" />
                                                                )}
                                                                <span>Stock</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteProduct(product)}
                                                                className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(239,68,68,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(239,68,68,0.4)] border-0 min-w-[70px]"
                                                                title="Delete Product"
                                                                disabled={productManagement.isDeletingProduct}
                                                            >
                                                                {productManagement.isDeletingProduct ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="h-3 w-3" />
                                                                )}
                                                                <span>Delete</span>
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

                    {/* Footer with pagination and bulk download - Matching Invoice Management Style */}
                    <div className="bg-[#f8fafc] border-t border-[#e2e8f0] px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600 font-medium flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                {totalCount} product{totalCount !== 1 ? "s" : ""}
                            </span>
                            {totalCount > 0 && (
                                <div className="relative group z-[70]">
                                    <button
                                        className="flex items-center gap-2 px-3 py-2 text-xs bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-[0_2px_8px_rgba(147,51,234,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(147,51,234,0.4)] border-0"
                                        title="Download All Products"
                                        disabled={productManagement.isDownloadingAllProducts}
                                    >
                                        {productManagement.isDownloadingAllProducts ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            <Download className="h-3 w-3" />
                                        )}
                                        <span>
                                            {productManagement.isDownloadingAllProducts ? "Generating..." : "Download All"}
                                        </span>
                                    </button>
                                    <div className="absolute left-0 bottom-full mb-1 bg-white border border-gray-200 rounded-lg shadow-xl p-2 min-w-[120px] z-[80] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <button
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                            onClick={() => handleDownloadAllProducts("pdf")}
                                        >
                                            <FileText className="h-4 w-4 text-red-600" />
                                            PDF
                                        </button>
                                        <button
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                            onClick={() => handleDownloadAllProducts("excel")}
                                        >
                                            <FileText className="h-4 w-4 text-green-600" />
                                            Excel
                                        </button>
                                        <button
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                            onClick={() => handleDownloadAllProducts("csv")}
                                        >
                                            <FileText className="h-4 w-4 text-blue-600" />
                                            CSV
                                        </button>
                                        <button
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                            onClick={() => handleDownloadAllProducts("json")}
                                        >
                                            <FileText className="h-4 w-4 text-yellow-600" />
                                            JSON
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
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
                                                    setCurrentPage(Number(page))
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

            {/* Modals */}
            <ProductForm
                product={selectedProduct}
                categories={categories}
                isOpen={showProductForm}
                onClose={() => {
                    setShowProductForm(false);
                    setSelectedProduct(null);
                }}
                onSubmit={handleProductSubmit}
                isLoading={productManagement.isCreatingProduct || productManagement.isUpdatingProduct}
                mode={formMode}
            />

            {selectedProduct && (
                <StockAdjustmentModal
                    product={selectedProduct}
                    isOpen={showStockModal}
                    onClose={() => {
                        setShowStockModal(false);
                        setSelectedProduct(null);
                    }}
                    onSubmit={handleStockSubmit}
                    isLoading={productManagement.isAdjustingStock}
                />
            )}

            {selectedProduct && (
                <DeleteProductModal
                    product={selectedProduct}
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedProduct(null);
                    }}
                    onConfirm={handleDeleteConfirm}
                    isLoading={productManagement.isDeletingProduct}
                />
            )}

            {selectedProduct && (
                <ProductDetail
                    product={selectedProduct}
                    isOpen={showDetailModal}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedProduct(null);
                    }}
                    onEdit={() => {
                        setShowDetailModal(false);
                        handleEditProduct(selectedProduct);
                    }}
                />
            )}
        </div>
    );
};

export default Products;