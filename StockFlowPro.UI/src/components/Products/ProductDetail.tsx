import React from "react";
import { X, Download, Edit, Printer, FileText, Package, DollarSign, Hash, Tag, Calendar, Building, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { ProductEntity } from "../../architecture/domain/entities/Product";

interface ProductDetailProps {
    product: ProductEntity;
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
    product,
    isOpen,
    onClose,
    onEdit,
}) => {
    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const handleDownloadPdf = async () => {
        try {
            // TODO: Implement PDF generation for products
            console.log("Download PDF for product:", product.id);
            alert("PDF download functionality will be implemented soon!");
        } catch (error) {
            console.error("Failed to download PDF:", error);
            alert("Failed to download PDF. Please try again.");
        }
    };

    const handleDownloadExcel = async () => {
        try {
            // TODO: Implement Excel export for products
            console.log("Download Excel for product:", product.id);
            alert("Excel export functionality will be implemented soon!");
        } catch (error) {
            console.error("Failed to download Excel:", error);
            alert("Failed to download Excel. Please try again.");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const getStockStatus = () => {
        if (product.quantity === 0) {
            return { text: "Out of Stock", color: "from-red-500 to-red-600", bgColor: "from-red-50 to-red-100" };
        } else if (product.quantity <= product.minStockLevel) {
            return { text: "Low Stock", color: "from-yellow-500 to-yellow-600", bgColor: "from-yellow-50 to-yellow-100" };
        } else {
            return { text: "In Stock", color: "from-green-500 to-green-600", bgColor: "from-green-50 to-green-100" };
        }
    };

    const stockStatus = getStockStatus();
    const profitMargin = product.price > 0 && product.cost > 0 ? (((product.price - product.cost) / product.cost) * 100) : 0;
    const totalValue = product.totalValue || product.calculatedTotalValue || (product.quantity * product.cost);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden border border-gray-100">
                {/* Enhanced Header */}
                <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 text-white p-6 print:hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-blue-700/90"></div>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <Package className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold">Product Details</h2>
                                <p className="text-indigo-100 mt-1">View and manage product information</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onEdit}
                                className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium backdrop-blur-sm border border-white/20"
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </button>
                            <button
                                onClick={handleDownloadPdf}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500/90 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-medium backdrop-blur-sm"
                            >
                                <Download className="h-4 w-4" />
                                PDF
                            </button>
                            <button
                                onClick={handleDownloadExcel}
                                className="flex items-center gap-2 px-4 py-2 bg-green-500/90 text-white rounded-xl hover:bg-green-600 transition-all duration-200 font-medium backdrop-blur-sm"
                            >
                                <Download className="h-4 w-4" />
                                Excel
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-500/90 text-white rounded-xl hover:bg-purple-600 transition-all duration-200 font-medium backdrop-blur-sm"
                            >
                                <Printer className="h-4 w-4" />
                                Print
                            </button>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                            >
                                <X className="h-6 w-6 text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Enhanced Product Content */}
                <div className="overflow-y-auto max-h-[calc(95vh-100px)] scrollbar-hide scroll-smooth">
                    <div className="p-8 print:p-0 bg-gradient-to-br from-gray-50 to-white">
                        {/* Professional Product Header */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl">
                                        <Package className="h-12 w-12 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                            {product.name}
                                        </h1>
                                        <p className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                                            <Hash className="h-5 w-5" />
                                            SKU: {product.sku}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                        StockFlow Pro
                                    </div>
                                    <p className="text-gray-600 font-medium">Product Management System</p>
                                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                                        <Building className="h-4 w-4" />
                                        <span>Inventory Management</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status Badges */}
                            <div className="flex justify-end gap-3 mb-6">
                                <span
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                                        product.isActive
                                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                                            : "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg"
                                    }`}
                                >
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                    {product.isActive ? "Active" : "Inactive"}
                                </span>
                                <span
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${stockStatus.color} text-white shadow-lg`}
                                >
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                    {stockStatus.text}
                                </span>
                            </div>
                        </div>

                        {/* Product Information Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Basic Information */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-500 rounded-lg">
                                        <FileText className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                                        <span className="text-gray-600 font-medium flex items-center gap-2">
                                            <Package className="h-4 w-4" />
                                            Product Name:
                                        </span>
                                        <span className="font-semibold text-gray-900">{product.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                                        <span className="text-gray-600 font-medium flex items-center gap-2">
                                            <Hash className="h-4 w-4" />
                                            SKU:
                                        </span>
                                        <span className="font-semibold text-gray-900">{product.sku}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                                        <span className="text-gray-600 font-medium flex items-center gap-2">
                                            <Tag className="h-4 w-4" />
                                            Category:
                                        </span>
                                        <span className="font-semibold text-gray-900">{product.category?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                                        <span className="text-gray-600 font-medium flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Created:
                                        </span>
                                        <span className="font-semibold text-gray-900">{formatDate(product.createdAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Information */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-green-500 rounded-lg">
                                        <DollarSign className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Pricing Information</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                        <span className="text-gray-600 font-medium flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            Selling Price:
                                        </span>
                                        <span className="font-semibold text-gray-900">{formatCurrency(product.price)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                        <span className="text-gray-600 font-medium flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            Cost Price:
                                        </span>
                                        <span className="font-semibold text-gray-900">{formatCurrency(product.cost)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                        <span className="text-gray-600 font-medium flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4" />
                                            Profit Margin:
                                        </span>
                                        <span className={`font-semibold ${profitMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {profitMargin.toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                        <span className="text-gray-600 font-medium flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            Profit per Unit:
                                        </span>
                                        <span className={`font-semibold ${(product.price - product.cost) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(product.price - product.cost)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Inventory Information */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-500 rounded-lg">
                                    <BarChart3 className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Inventory Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className={`bg-gradient-to-br ${stockStatus.bgColor} rounded-xl p-6 border border-gray-200`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <Package className="h-6 w-6 text-gray-600" />
                                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Current Stock</span>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">{product.quantity}</div>
                                    <div className="text-sm text-gray-600 mt-1">units available</div>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <AlertTriangle className="h-6 w-6 text-blue-600" />
                                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Min Level</span>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">{product.minStockLevel}</div>
                                    <div className="text-sm text-gray-600 mt-1">minimum threshold</div>
                                </div>
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <BarChart3 className="h-6 w-6 text-amber-600" />
                                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Max Level</span>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">{product.maxStockLevel}</div>
                                    <div className="text-sm text-gray-600 mt-1">maximum capacity</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <DollarSign className="h-6 w-6 text-green-600" />
                                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Value</span>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</div>
                                    <div className="text-sm text-gray-600 mt-1">inventory value</div>
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        {product.description && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-amber-500 rounded-lg">
                                        <FileText className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Product Description</h3>
                                </div>
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                                    <p className="text-gray-700 leading-relaxed">{product.description}</p>
                                </div>
                            </div>
                        )}

                        {/* Professional Footer */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <div className="text-center">
                                <div className="border-t-2 border-gradient-to-r from-indigo-200 to-purple-200 pt-6">
                                    <p className="text-lg font-semibold text-gray-700 mb-2">Product Information Report</p>
                                    <p className="text-sm text-gray-500">
                                        Generated on {formatDate(new Date())} by StockFlow Pro
                                    </p>
                                    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                                        <span>Professional Inventory Management System</span>
                                        <span>•</span>
                                        <span>Powered by StockFlow Pro</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom CSS for scrollbar hiding */}
            <style>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default ProductDetail;