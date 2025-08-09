import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
    Package,
    Users,
    FileText,
    DollarSign,
    BarChart3,
    Cog,
    Box,
    Settings,
    UserPlus,
    Home,
} from "lucide-react";
import { useLowStockProducts } from "../../hooks/useProducts";
import { useCurrentUser } from "../../hooks/useAuth";
import { useRealTimeUpdates } from "../../hooks/useRealTimeUpdates";
import { formatCurrency } from "../../utils/currency";
import Snackbar from "../../components/ui/Snackbar";
import { createNavigationHandlers } from "./dashboardLinks";

// Import modular components
import {
    DashboardHeader,
    SystemStatusBanner,
    QuickActionsBar,
    DashboardCard,
    LowStockAlertsCard,
    RecentActivityCard,
} from "./components";

// Import modals
import { QuickAddRoleModal, CreateRoleModal } from "./modals";

// Import custom hooks
import { useDashboardData } from "./hooks/useDashboardData";
import { useSnackbar } from "./hooks/useSnackbar";

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { data: currentUser } = useCurrentUser();
    const {
        data: lowStockProducts = [],
        isLoading: isLoadingLowStock,
        error: lowStockError,
    } = useLowStockProducts();

    // Custom hooks for data and UI state
    const { userStats, refreshUserStats } = useDashboardData();
    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

    // Modal state
    const [showQuickAddRoleModal, setShowQuickAddRoleModal] = useState(false);
    const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);

    // Enable real-time updates for SignalR connection and sound notifications
    useRealTimeUpdates();

    // Create navigation handlers using the imported function
    const navigationHandlers = createNavigationHandlers(navigate);

    // Static data - could be moved to a hook or API call
    const recentActivity = [
        { action: "New product added", time: "2 hours ago" },
        { action: "User registered", time: "4 hours ago" },
        { action: "Invoice generated", time: "6 hours ago" },
        { action: "Stock updated", time: "8 hours ago" },
    ];

    // Event handlers
    const handleAddRole = () => {
        setShowQuickAddRoleModal(true);
    };

    const refreshDashboard = () => {
        showSnackbar("Dashboard will be refreshed...", "info");
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    };

    const handleRoleModalSuccess = (message: string) => {
        setShowQuickAddRoleModal(false);
        setShowCreateRoleModal(false);
        showSnackbar(message, 'success');
        refreshUserStats();
    };

    const handleRoleModalError = (message: string) => {
        showSnackbar(message, 'error');
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
            <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-30 w-full py-4">
                <div className="px-4 sm:px-6 lg:px-8">
                    <ol className="flex items-center gap-2 text-sm">
                        <li className="flex items-center gap-2">
                            <Link
                                to="/app/dashboard"
                                className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors font-medium"
                            >
                                <Home className="h-4 w-4" />
                                <span>Dashboard</span>
                            </Link>
                        </li>
                    </ol>
                </div>
            </nav>
            
            {/* Spacer for breadcrumb */}
            <div className="h-4"></div>
            
            {/* Header with Navigation */}
            <div className="mx-4 sm:mx-6 lg:mx-8">
                <DashboardHeader
                    currentUser={currentUser}
                    onRefresh={refreshDashboard}
                    onSettings={navigationHandlers.navigateToSettings}
                />
            </div>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* System Status Banner */}
                <SystemStatusBanner />

                {/* Quick Actions Bar */}
                <QuickActionsBar
                    onNavigateToProducts={navigationHandlers.navigateToProducts}
                    onNavigateToNewInvoice={navigationHandlers.navigateToNewInvoice}
                    onNavigateToReports={navigationHandlers.navigateToReports}
                    onNavigateToHealthCheck={navigationHandlers.navigateToHealthCheck}
                />

                {/* Business Metrics */}
                <div className="mb-8">
                    <h3 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-6">
                        <BarChart3 className="w-6 h-6 text-blue-500" />
                        Business Metrics
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* Admin Panel Card */}
                        <DashboardCard
                            title="Admin Panel"
                            description="Access system settings, advanced configuration, and administrative tools for managing your StockFlow Pro instance."
                            category="ADMIN"
                            icon={Cog}
                            stats={[
                                { label: "ADMIN TOOLS", value: "12" },
                                { label: "STATUS", value: "Active" },
                            ]}
                            gradient="from-purple-50 to-indigo-50"
                            iconGradient="from-purple-500 to-indigo-600"
                            badgeColor="purple"
                            primaryAction={{
                                label: "Open Panel",
                                icon: Cog,
                                onClick: () => navigate("/admin"),
                            }}
                            secondaryAction={{
                                label: "Settings",
                                icon: Settings,
                                onClick: navigationHandlers.navigateToSettings,
                                variant: "secondary",
                            }}
                        />

                        {/* Products Management Card */}
                        <DashboardCard
                            title="Product Management"
                            description="Manage your product inventory, track stock levels, and monitor product performance across your business."
                            category="INVENTORY"
                            icon={Package}
                            stats={[
                                { label: "TOTAL PRODUCTS", value: "1,234" },
                                { label: "IN STOCK", value: "87.5%" },
                            ]}
                            primaryAction={{
                                label: "Manage",
                                icon: Box,
                                href: "/products",
                                color: "from-green-500 to-green-600",
                            }}
                            secondaryAction={{
                                label: "Add",
                                icon: Package,
                                onClick: navigationHandlers.navigateToProducts,
                                variant: "secondary",
                            }}
                        />

                        {/* Users Management Card */}
                        <DashboardCard
                            title="User Management"
                            description="Monitor user activity, manage permissions, and track user engagement across your platform."
                            category="USERS"
                            icon={Users}
                            stats={[
                                { 
                                    label: "ACTIVE USERS", 
                                    value: userStats.activeUsers,
                                    isLoading: userStats.isLoading 
                                },
                                { 
                                    label: "ROLES", 
                                    value: userStats.totalRoles,
                                    isLoading: userStats.isLoading 
                                },
                            ]}
                            primaryAction={{
                                label: "Manage",
                                icon: Users,
                                onClick: () => navigate("/users"),
                            }}
                            secondaryAction={{
                                label: "Add Role",
                                icon: UserPlus,
                                onClick: handleAddRole,
                                variant: "secondary",
                            }}
                        />

                        {/* Invoices & Revenue Card */}
                        <DashboardCard
                            title="Invoices & Revenue"
                            description="Track invoices, monitor revenue streams, and analyze financial performance metrics."
                            category="FINANCE"
                            icon={FileText}
                            stats={[
                                { label: "TOTAL INVOICES", value: "456" },
                                { label: "REVENUE", value: formatCurrency(12345) },
                            ]}
                            primaryAction={{
                                label: "View",
                                icon: FileText,
                                onClick: navigationHandlers.navigateToInvoices,
                                color: "from-cyan-500 to-cyan-600",
                            }}
                            secondaryAction={{
                                label: "New",
                                icon: DollarSign,
                                onClick: navigationHandlers.navigateToNewInvoice,
                                variant: "secondary",
                            }}
                        />

                        {/* Low Stock Alerts Card */}
                        <LowStockAlertsCard
                            lowStockProducts={lowStockProducts}
                            isLoading={isLoadingLowStock}
                            error={lowStockError}
                            onViewAll={() => navigate("/products?filter=lowStock")}
                            onManage={() => navigate("/products")}
                        />

                        {/* Recent Activity Card */}
                        <RecentActivityCard
                            activities={recentActivity}
                            onViewAll={() => {/* TODO: Implement view all activity */}}
                            onRefresh={() => {/* TODO: Implement refresh activity */}}
                        />
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

            {/* Modals */}
            {showQuickAddRoleModal && (
                <QuickAddRoleModal
                    onClose={() => setShowQuickAddRoleModal(false)}
                    onCreateNewRole={() => {
                        setShowQuickAddRoleModal(false);
                        setShowCreateRoleModal(true);
                    }}
                    onSuccess={handleRoleModalSuccess}
                    onError={handleRoleModalError}
                />
            )}

            {showCreateRoleModal && (
                <CreateRoleModal
                    onClose={() => {
                        setShowCreateRoleModal(false);
                        setShowQuickAddRoleModal(true);
                    }}
                    onSuccess={handleRoleModalSuccess}
                    onError={handleRoleModalError}
                />
            )}
        </div>
    );
};

export default Dashboard;