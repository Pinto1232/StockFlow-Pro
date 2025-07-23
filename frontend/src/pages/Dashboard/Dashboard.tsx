import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Package,
    Users,
    FileText,
    DollarSign,
    AlertTriangle,
    Home,
    BarChart3,
    RefreshCw,
    Settings,
    Zap,
    UserPlus,
    FileText as FileTextIcon,
    Activity,
    Box,
    Cog,
} from "lucide-react";
import { useLowStockProducts } from "../../hooks/useProducts";
import { useCurrentUser } from "../../hooks/useAuth";
import { formatCurrency } from "../../utils/currency";

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { data: currentUser } = useCurrentUser();
    const {
        data: lowStockProducts = [],
        isLoading: isLoadingLowStock,
        error: lowStockError,
    } = useLowStockProducts();

    const recentActivity = [
        { action: "New product added", time: "2 hours ago" },
        { action: "User registered", time: "4 hours ago" },
        { action: "Invoice generated", time: "6 hours ago" },
        { action: "Stock updated", time: "8 hours ago" },
    ];

    const refreshDashboard = () => {
        // Implement refresh functionality
        console.log("Refreshing dashboard...");
    };

    const openSettings = () => {
        // Implement settings functionality
        console.log("Opening settings...");
    };

    const navigateToInvoices = () => {
        navigate("/invoices");
    };

    const navigateToNewInvoice = () => {
        navigate("/invoices/new");
    };

    // Get user's display name
    const getUserDisplayName = () => {
        if (!currentUser) return "";
        
        if (currentUser.fullName) {
            return currentUser.fullName;
        }
        
        if (currentUser.firstName && currentUser.lastName) {
            return `${currentUser.firstName} ${currentUser.lastName}`;
        }
        
        if (currentUser.firstName) {
            return currentUser.firstName;
        }
        
        if (currentUser.email) {
            return currentUser.email.split('@')[0];
        }
        
        return "User";
    };

    return (
        <div className="min-h-screen bg-gray-50 w-full">
            {/* Navigation Breadcrumb */}
            <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-30 w-full px-4 sm:px-6 lg:px-8 py-4">
                <ol className="flex items-center gap-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-900 font-semibold">
                        <Home className="h-4 w-4" />
                        <span>Dashboard</span>
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
                                    Dashboard
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                Welcome back{currentUser ? (
                                    <>
                                        , <strong>{getUserDisplayName()}</strong>
                                    </>
                                ) : ""}! Here's what's happening with your
                                business today.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 text-gray-600 rounded-lg hover:bg-gray-400 hover:text-white transition-all duration-200 font-medium"
                                onClick={refreshDashboard}
                                title="Refresh Data"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Refresh</span>
                            </button>
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg"
                                onClick={openSettings}
                                title="Dashboard Settings"
                            >
                                <Settings className="w-4 h-4" />
                                <span>Settings</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* System Status Banner */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl mb-8 shadow-lg">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                            <span className="text-lg font-semibold">System Online</span>
                        </div>
                        <div className="flex flex-wrap gap-6 text-sm">
                            <div className="text-center">
                                <div className="font-bold">99.9%</div>
                                <div className="opacity-90">Uptime</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold">24</div>
                                <div className="opacity-90">Active Users</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold">2 min ago</div>
                                <div className="opacity-90">Last Update</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Bar */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
                    <h3 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-6">
                        <Zap className="w-6 h-6 text-blue-500" />
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <button className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200">
                            <Package className="w-8 h-8 text-blue-500" />
                            <span className="font-medium text-gray-700">Add Product</span>
                        </button>
                        <button 
                            className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                            onClick={navigateToNewInvoice}
                        >
                            <FileTextIcon className="w-8 h-8 text-blue-500" />
                            <span className="font-medium text-gray-700">New Invoice</span>
                        </button>
                        <button className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200">
                            <BarChart3 className="w-8 h-8 text-blue-500" />
                            <span className="font-medium text-gray-700">View Reports</span>
                        </button>
                        <button className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200">
                            <Activity className="w-8 h-8 text-blue-500" />
                            <span className="font-medium text-gray-700">Health Check</span>
                        </button>
                    </div>
                </div>

                {/* Enhanced Dashboard Cards */}
                <div className="mb-8">
                    <h3 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-6">
                        <BarChart3 className="w-6 h-6 text-blue-500" />
                        Business Metrics
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* Admin Panel Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                        <Cog className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                                        ADMIN
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <h5 className="text-lg font-bold text-gray-900 mb-2">Admin Panel</h5>
                                <p className="text-gray-600 text-sm mb-4">
                                    Access system settings, advanced configuration,
                                    and administrative tools for managing your
                                    StockFlow Pro instance.
                                </p>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xl font-bold text-purple-600">12</div>
                                        <div className="text-xs text-gray-500 font-medium">ADMIN TOOLS</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xl font-bold text-purple-600">Active</div>
                                        <div className="text-xs text-gray-500 font-medium">STATUS</div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-auto">
                                    <button
                                        onClick={() => navigate("/admin")}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium text-sm"
                                    >
                                        <Cog className="w-4 h-4" />
                                        <span>Open Panel</span>
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm">
                                        <Settings className="w-4 h-4" />
                                        <span>Settings</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Products Management Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <Package className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                        INVENTORY
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <h5 className="text-lg font-bold text-gray-900 mb-2">
                                    Product Management
                                </h5>
                                <p className="text-gray-600 text-sm mb-4">
                                    Manage your product inventory, track stock
                                    levels, and monitor product performance
                                    across your business.
                                </p>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xl font-bold text-blue-600">1,234</div>
                                        <div className="text-xs text-gray-500 font-medium">TOTAL PRODUCTS</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xl font-bold text-blue-600">87.5%</div>
                                        <div className="text-xs text-gray-500 font-medium">IN STOCK</div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-auto">
                                    <a
                                        href="/products"
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium text-sm"
                                    >
                                        <Box className="w-4 h-4" />
                                        <span>Manage</span>
                                    </a>
                                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm">
                                        <Package className="w-4 h-4" />
                                        <span>Add</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Users Management Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                        USERS
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <h5 className="text-lg font-bold text-gray-900 mb-2">User Management</h5>
                                <p className="text-gray-600 text-sm mb-4">
                                    Monitor user activity, manage permissions,
                                    and track user engagement across your
                                    platform.
                                </p>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xl font-bold text-blue-600">89</div>
                                        <div className="text-xs text-gray-500 font-medium">ACTIVE USERS</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xl font-bold text-blue-600">+5%</div>
                                        <div className="text-xs text-gray-500 font-medium">GROWTH</div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-auto">
                                    <a
                                        href="/users"
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium text-sm"
                                    >
                                        <Users className="w-4 h-4" />
                                        <span>Manage</span>
                                    </a>
                                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm">
                                        <UserPlus className="w-4 h-4" />
                                        <span>Add</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Invoices & Revenue Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                        FINANCE
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <h5 className="text-lg font-bold text-gray-900 mb-2">
                                    Invoices & Revenue
                                </h5>
                                <p className="text-gray-600 text-sm mb-4">
                                    Track invoices, monitor revenue streams, and
                                    analyze financial performance metrics.
                                </p>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xl font-bold text-blue-600">456</div>
                                        <div className="text-xs text-gray-500 font-medium">TOTAL INVOICES</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xl font-bold text-blue-600">
                                            {formatCurrency(12345)}
                                        </div>
                                        <div className="text-xs text-gray-500 font-medium">REVENUE</div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-auto">
                                    <button
                                        onClick={navigateToInvoices}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 font-medium text-sm"
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span>View</span>
                                    </button>
                                    <button
                                        onClick={navigateToNewInvoice}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                                    >
                                        <DollarSign className="w-4 h-4" />
                                        <span>New</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Low Stock Alerts Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">
                                        ALERTS
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <h5 className="text-lg font-bold text-gray-900 mb-2">Low Stock Alerts</h5>
                                <p className="text-gray-600 text-sm mb-4">
                                    Monitor products with low stock levels and
                                    receive alerts when inventory needs
                                    attention.
                                </p>
                                <div className="space-y-3 mb-4 flex-1">
                                    {isLoadingLowStock ? (
                                        <div className="flex items-center justify-center p-4">
                                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="ml-2 text-sm text-gray-500">
                                                Loading low stock products...
                                            </span>
                                        </div>
                                    ) : lowStockError ? (
                                        <div className="p-3 bg-red-50 rounded-lg">
                                            <span className="text-sm text-red-600">
                                                Failed to load low stock
                                                products
                                            </span>
                                        </div>
                                    ) : lowStockProducts.length === 0 ? (
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <span className="text-sm text-green-600 font-medium">
                                                ✓ All products are well stocked!
                                            </span>
                                        </div>
                                    ) : (
                                        lowStockProducts
                                            .slice(0, 3)
                                            .map((product) => (
                                                <div
                                                    key={product.id}
                                                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {product.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {formatCurrency(
                                                                product.costPerItem,
                                                            )}{" "}
                                                            per item
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-sm text-orange-600 font-medium">
                                                            {
                                                                product.numberInStock
                                                            }{" "}
                                                            left
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                    {lowStockProducts.length > 3 && (
                                        <div className="p-2 text-center">
                                            <span className="text-xs text-gray-500">
                                                +{lowStockProducts.length - 3}{" "}
                                                more products with low stock
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 mt-auto">
                                    <button
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium text-sm"
                                        onClick={() =>
                                            navigate(
                                                "/products?filter=lowStock",
                                            )
                                        }
                                    >
                                        <AlertTriangle className="w-4 h-4" />
                                        <span>View All</span>
                                    </button>
                                    <button
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                                        onClick={() => navigate("/products")}
                                    >
                                        <Package className="w-4 h-4" />
                                        <span>Manage</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <Activity className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                        ACTIVITY
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <h5 className="text-lg font-bold text-gray-900 mb-2">Recent Activity</h5>
                                <p className="text-gray-600 text-sm mb-4">
                                    Track recent system activities and monitor
                                    user interactions across your platform.
                                </p>
                                <div className="space-y-3 mb-4 flex-1">
                                    {recentActivity.map((activity, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 border-b border-gray-100 last:border-b-0"
                                        >
                                            <span className="text-sm text-gray-900">
                                                {activity.action}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {activity.time}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 mt-auto">
                                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium text-sm">
                                        <Activity className="w-4 h-4" />
                                        <span>View All</span>
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm">
                                        <RefreshCw className="w-4 h-4" />
                                        <span>Refresh</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;