import React, { useState, useEffect } from "react";
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
import { useRealTimeUpdates } from "../../hooks/useRealTimeUpdates";
import { formatCurrency } from "../../utils/currency";
import Snackbar from "../../components/ui/Snackbar";
import { createNavigationHandlers } from "./dashboardLinks";

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { data: currentUser } = useCurrentUser();
    const {
        data: lowStockProducts = [],
        isLoading: isLoadingLowStock,
        error: lowStockError,
    } = useLowStockProducts();

    // User Management state
    const [userStats, setUserStats] = useState({
        activeUsers: 0,
        totalRoles: 0,
        isLoading: true,
    });
    const [showAddRoleModal, setShowAddRoleModal] = useState(false);

    // Snackbar state
    const [snackbar, setSnackbar] = useState<{
        isOpen: boolean;
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
    }>({
        isOpen: false,
        message: '',
        type: 'info',
    });

    // Enable real-time updates for SignalR connection and sound notifications
    useRealTimeUpdates();

    // Create navigation handlers using the imported function
    const navigationHandlers = createNavigationHandlers(navigate);

    const recentActivity = [
        { action: "New product added", time: "2 hours ago" },
        { action: "User registered", time: "4 hours ago" },
        { action: "Invoice generated", time: "6 hours ago" },
        { action: "Stock updated", time: "8 hours ago" },
    ];

    // Fetch user statistics
    useEffect(() => {
        const fetchUserStats = async () => {
            try {
                setUserStats(prev => ({ ...prev, isLoading: true }));
                
                // Fetch user statistics
                const statsResponse = await fetch('/api/user-management/statistics');
                
                // Check if response is actually JSON
                const contentType = statsResponse.headers.get('content-type');
                if (statsResponse.ok && contentType && contentType.includes('application/json')) {
                    const stats = await statsResponse.json();
                    setUserStats({
                        activeUsers: stats.ActiveUsers || 0,
                        totalRoles: Object.keys(stats.UsersByRole || {}).length || 0,
                        isLoading: false,
                    });
                } else {
                    console.warn('User statistics API not available or returned non-JSON response');
                    // Fallback to default values if API fails
                    setUserStats({
                        activeUsers: 89,
                        totalRoles: 3,
                        isLoading: false,
                    });
                }
            } catch (error) {
                console.error('Error fetching user statistics:', error);
                // Fallback to default values
                setUserStats({
                    activeUsers: 89,
                    totalRoles: 3,
                    isLoading: false,
                });
            }
        };

        fetchUserStats();
    }, []);

    // Handle Add Role functionality
    const handleAddRole = () => {
        setShowAddRoleModal(true);
    };

    // Snackbar helper functions
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

    const refreshDashboard = () => {
        // Show snackbar notification
        showSnackbar("Dashboard will be refreshed...", "info");
        
        // Refresh the entire dashboard page after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    };

    const openSettings = () => {
        // Navigate to Settings management section
        navigate("/settings");
    };

    const navigateToProducts = () => {
        // Navigate to Product Management section
        navigate("/products");
    };

    const navigateToInvoices = () => {
        navigate("/invoices");
    };

    const navigateToNewInvoice = () => {
        navigate("/invoices");
    };

    const navigateToReports = () => {
        // Navigate to Reports section (admin panel for analytics)
        navigate("/admin");
    };

    const navigateToHealthCheck = () => {
        // Navigate to Health Check section (admin panel for system monitoring)
        navigate("/admin");
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
            <style>{`
                @keyframes lightning-flash {
                    0% { color: #ef4444; }
                    50% { color: #fbbf24; }
                    100% { color: #ef4444; }
                }
                .lightning-flash {
                    animation: lightning-flash 2s ease-in-out infinite;
                }
            `}</style>
            
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
                                onClick={navigationHandlers.navigateToSettings}
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
                            <Zap className="w-5 h-5 lightning-flash fill-current" />
                            <span className="text-lg font-semibold">System Online</span>
                        </div>
                        <div className="flex flex-wrap gap-8 text-base">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">99.9%</div>
                                <div className="text-green-100 font-medium text-sm">Uptime</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">24</div>
                                <div className="text-green-100 font-medium text-sm">Active Users</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">2 min ago</div>
                                <div className="text-green-100 font-medium text-sm">Last Update</div>
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
                        <button 
                            className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                            onClick={navigateToProducts}
                        >
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
                        <button 
                            className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                            onClick={navigateToReports}
                        >
                            <BarChart3 className="w-8 h-8 text-blue-500" />
                            <span className="font-medium text-gray-700">View Reports</span>
                        </button>
                        <button 
                            className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                            onClick={navigateToHealthCheck}
                        >
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
                                    <button 
                                        onClick={openSettings}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                                    >
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
                                        {userStats.isLoading ? (
                                            <div className="text-xl font-bold text-blue-600">
                                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                            </div>
                                        ) : (
                                            <div className="text-xl font-bold text-blue-600">{userStats.activeUsers}</div>
                                        )}
                                        <div className="text-xs text-gray-500 font-medium">ACTIVE USERS</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        {userStats.isLoading ? (
                                            <div className="text-xl font-bold text-blue-600">
                                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                            </div>
                                        ) : (
                                            <div className="text-xl font-bold text-blue-600">{userStats.totalRoles}</div>
                                        )}
                                        <div className="text-xs text-gray-500 font-medium">ROLES</div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-auto">
                                    <button
                                        onClick={() => navigate("/users")}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium text-sm"
                                    >
                                        <Users className="w-4 h-4" />
                                        <span>Manage</span>
                                    </button>
                                    <button 
                                        onClick={handleAddRole}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        <span>Add Role</span>
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

            {/* Snackbar */}
            <Snackbar
                isOpen={snackbar.isOpen}
                message={snackbar.message}
                type={snackbar.type}
                onClose={hideSnackbar}
            />

            {/* Add Role Modal */}
            {showAddRoleModal && (
                <AddRoleModal
                    onClose={() => setShowAddRoleModal(false)}
                    onSuccess={(message) => {
                        setShowAddRoleModal(false);
                        showSnackbar(message, 'success');
                        // Refresh user stats to update role count
                        const fetchUserStats = async () => {
                            try {
                                const statsResponse = await fetch('/api/user-management/statistics');
                                if (statsResponse.ok) {
                                    const stats = await statsResponse.json();
                                    setUserStats({
                                        activeUsers: stats.ActiveUsers || 0,
                                        totalRoles: Object.keys(stats.UsersByRole || {}).length || 0,
                                        isLoading: false,
                                    });
                                }
                            } catch (error) {
                                console.error('Error refreshing user statistics:', error);
                            }
                        };
                        fetchUserStats();
                    }}
                    onError={(message) => {
                        showSnackbar(message, 'error');
                    }}
                />
            )}
        </div>
    );
};

// Permission interfaces for type safety
interface PermissionDto {
    id: string;
    name: string;
    displayName: string;
    description: string;
    category: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

interface PermissionCategory {
    category: string;
    permissions: string[];
}

interface RoleOption {
    id: string;
    name: string;
    displayName: string;
    description: string;
    iconClass: string;
    priority: number;
    keyPermissions: string[];
}

// Add Role Modal Component
interface AddRoleModalProps {
    onClose: () => void;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({ onClose, onSuccess, onError }) => {
    // Role creation form data
    const [roleFormData, setRoleFormData] = useState({
        name: '',
        displayName: '',
        description: '',
        priority: 25,
        permissions: [] as string[],
    });
    
    const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
    const [permissionsError, setPermissionsError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

    // Transform permission data into categorized structure
    const transformPermissionsToCategories = (permissions: (PermissionDto | string)[]): PermissionCategory[] => {
        const categoryMap = new Map<string, string[]>();
        
        permissions.forEach((permission) => {
            // Handle both PermissionDto objects and simple strings
            let category: string;
            let permissionName: string;
            
            if (typeof permission === 'string') {
                // Handle simple string permissions like "Users.ViewAll"
                const parts = permission.split('.');
                category = parts.length > 1 ? parts[0] : 'Other';
                permissionName = permission;
            } else if (permission && typeof permission === 'object') {
                // Handle PermissionDto objects
                category = permission.category || 'Other';
                permissionName = permission.name || permission.displayName || '';
            } else {
                return; // Skip invalid entries
            }
            
            if (!categoryMap.has(category)) {
                categoryMap.set(category, []);
            }
            
            if (permissionName) {
                categoryMap.get(category)!.push(permissionName);
            }
        });
        
        return Array.from(categoryMap.entries()).map(([category, perms]) => ({
            category,
            permissions: perms.sort()
        })).sort((a, b) => a.category.localeCompare(b.category));
    };

    // Fallback permissions when API is not available
    const getFallbackPermissions = (): PermissionCategory[] => {
        return [
            {
                category: "Users",
                permissions: ["Users.ViewAll", "Users.ViewTeam", "Users.Create", "Users.Update", "Users.Delete"]
            },
            {
                category: "Products", 
                permissions: ["Products.View", "Products.Create", "Products.Update", "Products.Delete", "Products.Manage"]
            },
            {
                category: "Inventory",
                permissions: ["Inventory.View", "Inventory.Update", "Inventory.Manage", "Inventory.Reports"]
            },
            {
                category: "Reports",
                permissions: ["Reports.ViewBasic", "Reports.ViewAdvanced", "Reports.ViewAll", "Reports.Create", "Reports.Export"]
            },
            {
                category: "System",
                permissions: ["System.ViewAdminPanel", "System.ManageSettings", "System.ViewLogs", "System.Backup"]
            },
            {
                category: "Profile",
                permissions: ["Profile.View", "Profile.Update", "Profile.ChangePassword"]
            }
        ];
    };

    // Fetch available permissions from existing roles
    useEffect(() => {
        const fetchPermissionsFromRoles = async () => {
            try {
                setIsLoadingPermissions(true);
                setPermissionsError(null);
                
                console.log('🔄 Fetching permissions from existing roles...');
                
                const response = await fetch("/api/role-management/roles/options", {
                    credentials: "include", // Include cookies for authentication
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    }
                });
                
                if (response.ok) {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const roles = await response.json();
                        console.log('🔄 Successfully loaded roles:', roles);
                        
                        // Extract all permissions from all roles
                        const allPermissions = new Set<string>();
                        roles.forEach((role: RoleOption) => {
                            if (role.keyPermissions && Array.isArray(role.keyPermissions)) {
                                role.keyPermissions.forEach((permission: string) => {
                                    allPermissions.add(permission);
                                });
                            }
                        });
                        
                        const permissionsArray = Array.from(allPermissions);
                        console.log('🔄 Extracted permissions:', permissionsArray);
                        
                        // Transform permissions into categorized structure
                        const categorizedPermissions = transformPermissionsToCategories(permissionsArray);
                        setPermissionCategories(categorizedPermissions);
                        
                        console.log('✅ Successfully categorized permissions:', categorizedPermissions);
                        
                    } else {
                        throw new Error('Invalid response format');
                    }
                } else if (response.status === 401) {
                    console.warn('User not authenticated for roles API');
                    setPermissionsError('Authentication required to load permissions. Please ensure you are logged in.');
                    setPermissionCategories(getFallbackPermissions());
                } else if (response.status === 403) {
                    console.warn('User not authorized for roles API');
                    setPermissionsError('Insufficient permissions to load role data. Using basic permissions.');
                    setPermissionCategories(getFallbackPermissions());
                } else if (response.status === 404) {
                    console.warn('Roles endpoint not found');
                    setPermissionsError('Roles endpoint not available. Using fallback permissions.');
                    setPermissionCategories(getFallbackPermissions());
                } else {
                    throw new Error(`API returned status ${response.status}`);
                }
                
            } catch (error) {
                console.error("Error fetching permissions from roles:", error);
                setPermissionsError('Failed to load permissions from roles. Using fallback permissions.');
                setPermissionCategories(getFallbackPermissions());
            } finally {
                setIsLoadingPermissions(false);
            }
        };

        fetchPermissionsFromRoles();
    }, []);

    const validateInput = (field: string, value: string | number) => {
        const errors = { ...validationErrors };
        
        switch (field) {
            case 'name':
                if (!value || (typeof value === 'string' && value.trim().length < 2)) {
                    errors.name = 'Role name must be at least 2 characters';
                } else {
                    delete errors.name;
                }
                break;
            case 'priority':
                if (typeof value === 'number' && (value < 0 || value > 100)) {
                    errors.priority = 'Priority must be between 0 and 100';
                } else {
                    delete errors.priority;
                }
                break;
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (field: string, value: string | number) => {
        setRoleFormData(prev => ({ ...prev, [field]: value }));
        validateInput(field, value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate all fields
        const nameValid = validateInput('name', roleFormData.name);
        const priorityValid = validateInput('priority', roleFormData.priority);
        
        if (!nameValid || !priorityValid) {
            onError('Please fix the validation errors before submitting');
            return;
        }

        try {
            setIsLoading(true);
            console.log('🔄 Creating role with data:', {
                name: roleFormData.name.trim(),
                displayName: roleFormData.displayName.trim() || roleFormData.name.trim(),
                description: roleFormData.description.trim(),
                priority: roleFormData.priority,
                permissions: roleFormData.permissions,
            });

            const response = await fetch('/api/role-management/roles', {
                method: 'POST',
                credentials: 'include', // Include cookies for authentication
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    name: roleFormData.name.trim(),
                    displayName: roleFormData.displayName.trim() || roleFormData.name.trim(),
                    description: roleFormData.description.trim(),
                    priority: roleFormData.priority,
                    permissions: roleFormData.permissions,
                }),
            });

            console.log('🔄 Response status:', response.status);
            console.log('🔄 Response headers:', response.headers);

            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const newRole = await response.json();
                    console.log('✅ Role created successfully:', newRole);
                    onSuccess(`Role "${newRole.displayName || newRole.name}" created successfully!`);
                } else {
                    console.warn('⚠️ Response is not JSON');
                    onSuccess('Role created successfully!');
                }
            } else if (response.status === 401) {
                onError('Authentication required. Please ensure you are logged in as an Admin.');
            } else if (response.status === 403) {
                onError('Insufficient permissions. Admin role required to create roles.');
            } else if (response.status === 404) {
                onError('Role creation endpoint not found. Please check if the backend service is running.');
            } else {
                // Try to get error message from response
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        onError(errorData.message || `Failed to create role (Status: ${response.status})`);
                    } else {
                        const errorText = await response.text();
                        console.error('❌ Non-JSON error response:', errorText);
                        onError(`Failed to create role (Status: ${response.status})`);
                    }
                } catch (parseError) {
                    console.error('❌ Error parsing error response:', parseError);
                    onError(`Failed to create role (Status: ${response.status})`);
                }
            }
        } catch (error) {
            console.error('❌ Error creating role:', error);
            if (error instanceof TypeError && error.message.includes('fetch')) {
                onError('Network error. Please check if the backend service is running.');
            } else {
                onError('Failed to create role. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePermissionToggle = (permission: string) => {
        setRoleFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission]
        }));
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
            style={{ animation: 'fadeIn 0.3s ease' }}
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative"
                style={{ 
                    animation: 'modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: '0 24px 64px rgba(0, 0, 0, 0.2)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div 
                    className="relative p-8 pb-6 text-white overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #5a5cdb 0%, #7f53ac 100%)',
                    }}
                >
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                            <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H11V21H5V19H13V17H5V15H13V13H5V11H13V9H21ZM13 7H18L13 2V7ZM20 15V18H23V20H20V23H18V20H15V18H18V15H20Z"/>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold">Create New Role</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:rotate-90"
                            style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                            disabled={isLoading}
                            title="Close modal"
                        >
                            <span className="text-2xl font-light">×</span>
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-10 max-h-[calc(90vh-200px)] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Role Name */}
                        <div>
                            <label className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-3">
                                Role Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={roleFormData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className={`w-full px-5 py-4 border-2 rounded-xl text-base transition-all duration-300 ${
                                    validationErrors.name 
                                        ? 'border-red-500 focus:ring-4 focus:ring-red-100 focus:border-red-500' 
                                        : 'border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300'
                                } focus:outline-none`}
                                placeholder="Enter role name"
                                required
                                disabled={isLoading}
                            />
                            {validationErrors.name && (
                                <div className="text-sm text-red-600 mt-2">
                                    {validationErrors.name}
                                </div>
                            )}
                        </div>

                        {/* Display Name */}
                        <div>
                            <label className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-3">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={roleFormData.displayName}
                                onChange={(e) => handleInputChange('displayName', e.target.value)}
                                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300"
                                placeholder="Enter display name"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-3">
                                Description
                            </label>
                            <textarea
                                value={roleFormData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300"
                                rows={3}
                                placeholder="Describe the role's purpose and responsibilities"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Priority Level */}
                        <div>
                            <label className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-3">
                                Priority Level
                            </label>
                            <input
                                type="number"
                                value={roleFormData.priority}
                                onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 0)}
                                className={`w-full px-5 py-4 border-2 rounded-xl text-base transition-all duration-300 ${
                                    validationErrors.priority 
                                        ? 'border-red-500 focus:ring-4 focus:ring-red-100 focus:border-red-500' 
                                        : 'border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300'
                                } focus:outline-none`}
                                min="0"
                                max="100"
                                placeholder="0"
                                disabled={isLoading}
                            />
                            {validationErrors.priority && (
                                <div className="text-sm text-red-600 mt-2">
                                    {validationErrors.priority}
                                </div>
                            )}
                        </div>

                        {/* Permissions */}
                        <div>
                            <label className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-4">
                                Permissions
                            </label>
                            {isLoadingPermissions ? (
                                <div className="flex flex-col items-center justify-center p-12 border-2 border-gray-200 rounded-xl bg-gray-50">
                                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <div className="text-base text-gray-600 font-medium">Loading permissions...</div>
                                </div>
                            ) : permissionsError ? (
                                <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                                    <div className="text-center text-sm text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-200">
                                        <div className="font-medium mb-2">Permissions Loaded with Fallback</div>
                                        <div>{permissionsError}</div>
                                    </div>
                                </div>
                            ) : permissionCategories.length === 0 ? (
                                <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                                    <div className="text-center text-sm text-gray-500 p-4">
                                        No permissions available to assign.
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-gray-200 rounded-xl p-4 max-h-80 overflow-y-auto bg-gray-50">
                                    <div className="space-y-6">
                                        {permissionCategories.map((category) => (
                                            <div key={category.category} className="mb-6">
                                                <h5 className="text-base font-semibold mb-3 pb-2 border-b border-blue-200 text-blue-600">
                                                    {category.category}
                                                </h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {category.permissions.map((permission) => (
                                                        <label
                                                            key={permission}
                                                            className="flex items-center space-x-3 p-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-all duration-200"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={roleFormData.permissions.includes(permission)}
                                                                onChange={() => handlePermissionToggle(permission)}
                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                disabled={isLoading}
                                                            />
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {permission.replace(/^[^.]+\./, '')}
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end space-x-4 bg-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-all duration-200 border-2 border-gray-200 rounded-xl hover:bg-gray-50"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-8 py-3 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg min-w-32"
                        style={{
                            background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #5a5cdb 0%, #7f53ac 100%)',
                            boxShadow: '0 2px 8px rgba(90, 92, 219, 0.3)'
                        }}
                        disabled={isLoading || isLoadingPermissions || Object.keys(validationErrors).length > 0}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                Create Role
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes modalSlideIn {
                    from {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;