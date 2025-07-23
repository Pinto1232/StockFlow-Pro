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
    Download,
    FileText as FileTextIcon,
    Activity,
    Box,
    PieChart,
} from "lucide-react";
import { useLowStockProducts } from "../../hooks/useProducts";
import { formatCurrency } from "../../utils/currency";

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
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

    return (
        <div className="admin-panel-layout">
            {/* Navigation Breadcrumb */}
            <nav className="admin-breadcrumb" aria-label="Breadcrumb">
                <ol className="breadcrumb-list">
                    <li className="breadcrumb-item active" aria-current="page">
                        <Home className="w-4 h-4" />
                        <span>Dashboard</span>
                    </li>
                </ol>
            </nav>

            <div className="admin-content-wrapper">
                {/* Enhanced Header */}
                <header className="admin-header">
                    <div className="header-main">
                        <div className="header-content">
                            <h1 className="admin-title">
                                <div className="title-icon">
                                    <BarChart3 className="w-7 h-7" />
                                </div>
                                <div className="title-text">
                                    <span className="title-main">
                                        Dashboard
                                    </span>
                                    <span className="title-sub">
                                        Business Overview
                                    </span>
                                </div>
                            </h1>
                            <p className="admin-subtitle">
                                Welcome back! Here's what's happening with your
                                business today.
                            </p>
                        </div>
                        <div className="header-actions">
                            <button
                                className="action-btn refresh-btn"
                                onClick={refreshDashboard}
                                title="Refresh Data"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Refresh</span>
                            </button>
                            <button
                                className="action-btn settings-btn"
                                onClick={openSettings}
                                title="Dashboard Settings"
                            >
                                <Settings className="w-4 h-4" />
                                <span>Settings</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* System Status Banner */}
                <div className="status-banner">
                    <div className="status-indicator">
                        <div className="status-dot status-online"></div>
                        <span className="status-text">System Online</span>
                    </div>
                    <div className="status-stats">
                        <div className="stat-item">
                            <span className="stat-label">Uptime</span>
                            <span className="stat-value">99.9%</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Active Users</span>
                            <span className="stat-value">24</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Last Update</span>
                            <span className="stat-value">2 minutes ago</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Bar */}
                <div className="quick-actions">
                    <h3 className="section-title">
                        <Zap className="w-5 h-5" />
                        Quick Actions
                    </h3>
                    <div className="quick-actions-grid">
                        <button
                            className="quick-action-btn"
                            data-tooltip="Add New Product"
                        >
                            <Package className="w-6 h-6" />
                            <span>Add Product</span>
                        </button>
                        <button
                            className="quick-action-btn"
                            onClick={navigateToNewInvoice}
                            data-tooltip="Create New Invoice"
                        >
                            <FileTextIcon className="w-6 h-6" />
                            <span>New Invoice</span>
                        </button>
                        <button
                            className="quick-action-btn"
                            data-tooltip="View Reports"
                        >
                            <BarChart3 className="w-6 h-6" />
                            <span>View Reports</span>
                        </button>
                        <button
                            className="quick-action-btn"
                            data-tooltip="System Health Check"
                        >
                            <Activity className="w-6 h-6" />
                            <span>Health Check</span>
                        </button>
                    </div>
                </div>

                {/* Enhanced Dashboard Cards */}
                <div className="admin-section">
                    <h3 className="section-title">
                        <BarChart3 className="w-5 h-5" />
                        Business Metrics
                    </h3>
                    <div className="admin-cards-grid">
                        {/* Products Management Card */}
                        <div className="admin-card" data-category="inventory">
                            <div className="card-header">
                                <div className="card-icon-wrapper">
                                    <Package className="card-icon w-7 h-7" />
                                </div>
                                <div className="card-badge">
                                    <span className="badge-text">
                                        Inventory
                                    </span>
                                </div>
                            </div>
                            <div className="card-body">
                                <h5 className="card-title">
                                    Product Management
                                </h5>
                                <p className="card-text">
                                    Manage your product inventory, track stock
                                    levels, and monitor product performance
                                    across your business.
                                </p>
                                <div className="card-stats">
                                    <div className="stat">
                                        <span className="stat-number">
                                            1,234
                                        </span>
                                        <span className="stat-label">
                                            Total Products
                                        </span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-number">
                                            87.5%
                                        </span>
                                        <span className="stat-label">
                                            In Stock
                                        </span>
                                    </div>
                                </div>
                                <div className="card-actions">
                                    <a
                                        href="/products"
                                        className="btn btn-success"
                                    >
                                        <Box className="w-4 h-4" />
                                        <span>Manage Products</span>
                                    </a>
                                    <button className="btn btn-outline">
                                        <Package className="w-4 h-4" />
                                        <span>Add Product</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Users Management Card */}
                        <div className="admin-card" data-category="users">
                            <div className="card-header">
                                <div className="card-icon-wrapper">
                                    <Users className="card-icon w-7 h-7" />
                                </div>
                                <div className="card-badge">
                                    <span className="badge-text">Users</span>
                                </div>
                            </div>
                            <div className="card-body">
                                <h5 className="card-title">User Management</h5>
                                <p className="card-text">
                                    Monitor user activity, manage permissions,
                                    and track user engagement across your
                                    platform.
                                </p>
                                <div className="card-stats">
                                    <div className="stat">
                                        <span className="stat-number">89</span>
                                        <span className="stat-label">
                                            Active Users
                                        </span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-number">+5%</span>
                                        <span className="stat-label">
                                            Growth
                                        </span>
                                    </div>
                                </div>
                                <div className="card-actions">
                                    <a
                                        href="/users"
                                        className="btn btn-primary"
                                    >
                                        <Users className="w-4 h-4" />
                                        <span>Manage Users</span>
                                    </a>
                                    <button className="btn btn-outline">
                                        <UserPlus className="w-4 h-4" />
                                        <span>Add User</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Invoices & Revenue Card */}
                        <div className="admin-card" data-category="finance">
                            <div className="card-header">
                                <div className="card-icon-wrapper">
                                    <FileText className="card-icon w-7 h-7" />
                                </div>
                                <div className="card-badge">
                                    <span className="badge-text">Finance</span>
                                </div>
                            </div>
                            <div className="card-body">
                                <h5 className="card-title">
                                    Invoices & Revenue
                                </h5>
                                <p className="card-text">
                                    Track invoices, monitor revenue streams, and
                                    analyze financial performance metrics.
                                </p>
                                <div className="card-stats">
                                    <div className="stat">
                                        <span className="stat-number">456</span>
                                        <span className="stat-label">
                                            Total Invoices
                                        </span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-number">
                                            {formatCurrency(12345)}
                                        </span>
                                        <span className="stat-label">
                                            Revenue
                                        </span>
                                    </div>
                                </div>
                                <div className="card-actions">
                                    <button
                                        onClick={navigateToInvoices}
                                        className="btn btn-info"
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span>View Invoices</span>
                                    </button>
                                    <button
                                        onClick={navigateToNewInvoice}
                                        className="btn btn-outline"
                                    >
                                        <DollarSign className="w-4 h-4" />
                                        <span>New Invoice</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Reports & Analytics Card */}
                        <div className="admin-card" data-category="analytics">
                            <div className="card-header">
                                <div className="card-icon-wrapper">
                                    <PieChart className="card-icon w-7 h-7" />
                                </div>
                                <div className="card-badge">
                                    <span className="badge-text">
                                        Analytics
                                    </span>
                                </div>
                            </div>
                            <div className="card-body">
                                <h5 className="card-title">
                                    Reports & Analytics
                                </h5>
                                <p className="card-text">
                                    Generate detailed reports and gain insights
                                    into your business performance and trends.
                                </p>
                                <div className="card-stats">
                                    <div className="stat">
                                        <span className="stat-number">15</span>
                                        <span className="stat-label">
                                            Reports
                                        </span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-number">
                                            Daily
                                        </span>
                                        <span className="stat-label">
                                            Updates
                                        </span>
                                    </div>
                                </div>
                                <div className="card-actions">
                                    <button className="btn btn-warning">
                                        <BarChart3 className="w-4 h-4" />
                                        <span>View Reports</span>
                                    </button>
                                    <button className="btn btn-outline">
                                        <Download className="w-4 h-4" />
                                        <span>Export Data</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Low Stock Alerts Card */}
                        <div className="admin-card" data-category="alerts">
                            <div className="card-header">
                                <div className="card-icon-wrapper">
                                    <AlertTriangle className="card-icon w-7 h-7" />
                                </div>
                                <div className="card-badge">
                                    <span className="badge-text">Alerts</span>
                                </div>
                            </div>
                            <div className="card-body">
                                <h5 className="card-title">Low Stock Alerts</h5>
                                <p className="card-text">
                                    Monitor products with low stock levels and
                                    receive alerts when inventory needs
                                    attention.
                                </p>
                                <div className="space-y-3 mb-4">
                                    {isLoadingLowStock ? (
                                        <div className="flex items-center justify-center p-4">
                                            <div className="loading-spinner"></div>
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
                                            .slice(0, 5)
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
                                                        <span className="text-xs text-gray-500">
                                                            {formatCurrency(
                                                                product.numberInStock *
                                                                    product.costPerItem,
                                                            )}{" "}
                                                            value
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                    {lowStockProducts.length > 5 && (
                                        <div className="p-2 text-center">
                                            <span className="text-xs text-gray-500">
                                                +{lowStockProducts.length - 5}{" "}
                                                more products with low stock
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="card-actions">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            navigate(
                                                "/products?filter=lowStock",
                                            )
                                        }
                                    >
                                        <AlertTriangle className="w-4 h-4" />
                                        <span>View All Alerts</span>
                                    </button>
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => navigate("/products")}
                                    >
                                        <Package className="w-4 h-4" />
                                        <span>Manage Stock</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Card */}
                        <div className="admin-card" data-category="activity">
                            <div className="card-header">
                                <div className="card-icon-wrapper">
                                    <Activity className="card-icon w-7 h-7" />
                                </div>
                                <div className="card-badge">
                                    <span className="badge-text">Activity</span>
                                </div>
                            </div>
                            <div className="card-body">
                                <h5 className="card-title">Recent Activity</h5>
                                <p className="card-text">
                                    Track recent system activities and monitor
                                    user interactions across your platform.
                                </p>
                                <div className="space-y-3 mb-4">
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
                                <div className="card-actions">
                                    <button className="btn btn-primary">
                                        <Activity className="w-4 h-4" />
                                        <span>View All Activity</span>
                                    </button>
                                    <button className="btn btn-outline">
                                        <RefreshCw className="w-4 h-4" />
                                        <span>Refresh</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        /* Admin Panel Layout and Styles */
        .admin-panel-layout {
          width: 100%;
          background: linear-gradient(135deg, #f4f6fb 0%, #e8ecf4 100%);
          min-height: 100vh;
          overflow-x: hidden;
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          margin: 0;
          padding: 0;
        }

        /* Breadcrumb Navigation */
        .admin-breadcrumb {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          padding: 1rem 2rem;
          border-bottom: 1px solid rgba(90,92,219,0.1);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .breadcrumb-list {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .breadcrumb-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #232946;
          font-weight: 600;
        }

        .admin-content-wrapper {
          padding: 2rem 3rem;
          max-width: 100%;
          overflow-x: hidden;
        }

        /* Enhanced Header */
        .admin-header {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(90,92,219,0.08);
          border: 1px solid rgba(90,92,219,0.1);
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .header-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2.5rem;
          background: linear-gradient(135deg, #fff 0%, #f8f9fb 100%);
        }

        .header-content {
          flex: 1;
        }

        .admin-title {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .title-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #5a5cdb 0%, #7f53ac 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 4px 16px rgba(90,92,219,0.3);
        }

        .title-text {
          display: flex;
          flex-direction: column;
        }

        .title-main {
          font-size: 2.5rem;
          font-weight: 800;
          color: #232946;
          line-height: 1.2;
          margin: 0;
        }

        .title-sub {
          font-size: 1rem;
          color: #6c7a89;
          font-weight: 500;
          margin-top: 0.25rem;
        }

        .admin-subtitle {
          font-size: 1.1rem;
          color: #6c7a89;
          margin: 0;
          line-height: 1.5;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #fff;
          border: 2px solid #e5e7ef;
          color: #5a5cdb;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .action-btn:hover {
          background: #5a5cdb;
          color: #fff;
          border-color: #5a5cdb;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(90,92,219,0.3);
        }

        /* System Status Banner */
        .status-banner {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: #fff;
          padding: 1.5rem 2rem;
          border-radius: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          box-shadow: 0 4px 20px rgba(40,167,69,0.2);
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          animation: pulse-status 2s infinite;
        }

        .status-online {
          background: #fff;
        }

        .status-text {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .status-stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 0.85rem;
          opacity: 0.9;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          display: block;
          font-size: 1.1rem;
          font-weight: 700;
        }

        /* Quick Actions */
        .quick-actions {
          margin-bottom: 2.5rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.4rem;
          font-weight: 700;
          color: #232946;
          margin-bottom: 1.5rem;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .quick-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          background: #fff;
          border: 2px solid #e5e7ef;
          padding: 1.5rem 1rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          color: #5a5cdb;
          font-weight: 600;
        }

        .quick-action-btn:hover {
          background: #5a5cdb;
          color: #fff;
          border-color: #5a5cdb;
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(90,92,219,0.2);
        }

        /* Enhanced Admin Cards */
        .admin-section {
          margin-bottom: 3rem;
        }

        .admin-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .admin-card {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(90,92,219,0.08);
          border: 1px solid rgba(90,92,219,0.1);
          transition: all 0.4s cubic-bezier(.4,0,.2,1);
          overflow: hidden;
          height: 100%;
          position: relative;
        }

        .admin-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 16px 48px rgba(90,92,219,0.15);
        }

        .card-header {
          background: linear-gradient(135deg, #f8f9fb 0%, #e8ecf4 100%);
          padding: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(90,92,219,0.1);
        }

        .card-icon-wrapper {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #5a5cdb 0%, #7f53ac 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(90,92,219,0.3);
        }

        .card-icon {
          color: #fff;
        }

        .card-badge {
          background: rgba(90,92,219,0.1);
          color: #5a5cdb;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card-body {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          height: calc(100% - 140px);
        }

        .card-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #232946;
          margin-bottom: 0.75rem;
        }

        .card-text {
          color: #6c7a89;
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          flex-grow: 1;
        }

        .card-stats {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #f8f9fb;
          border-radius: 12px;
        }

        .stat {
          text-align: center;
          flex: 1;
        }

        .stat-number {
          display: block;
          font-size: 1.4rem;
          font-weight: 700;
          color: #5a5cdb;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #000000;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 10px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          flex: 1;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .btn-primary {
          background: linear-gradient(135deg, #5a5cdb 0%, #7f53ac 100%);
          color: #fff;
          box-shadow: 0 2px 8px rgba(90,92,219,0.3);
        }

        .btn-success {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: #fff;
          box-shadow: 0 2px 8px rgba(40,167,69,0.3);
        }

        .btn-info {
          background: linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%);
          color: #fff;
          box-shadow: 0 2px 8px rgba(23,162,184,0.3);
        }

        .btn-warning {
          background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
          color: #fff;
          box-shadow: 0 2px 8px rgba(255,193,7,0.3);
        }

        .btn-secondary {
          background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
          color: #fff;
          box-shadow: 0 2px 8px rgba(108,117,125,0.3);
        }

        .btn-outline {
          background: transparent;
          color: #5a5cdb;
          border: 2px solid #e5e7ef;
        }

        .btn:hover {
          transform: translateY(-2px);
          text-decoration: none;
          color: #fff;
        }

        .btn-outline:hover {
          background: #5a5cdb;
          border-color: #5a5cdb;
          color: #fff;
        }

        /* Loading Spinner */
        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e5e7ef;
          border-top: 2px solid #5a5cdb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Animations */
        @keyframes pulse-status {
          0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.7); }
          70% { box-shadow: 0 0 0 6px rgba(255,255,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
        }

        /* Tooltips */
        [data-tooltip] {
          position: relative;
        }

        [data-tooltip]:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.9);
          color: #fff;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          white-space: nowrap;
          z-index: 1000;
          margin-bottom: 0.5rem;
          opacity: 0;
          animation: fadeInTooltip 0.3s ease forwards;
        }

        @keyframes fadeInTooltip {
          from { opacity: 0; transform: translateX(-50%) translateY(5px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* Responsive Design */
        @media (max-width: 991.98px) {
          .admin-content-wrapper {
            padding: 1.5rem 2rem;
          }
          
          .title-main {
            font-size: 2rem;
          }
          
          .admin-cards-grid {
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 1.5rem;
          }

          .header-main {
            flex-direction: column;
            gap: 1.5rem;
            text-align: center;
          }

          .status-banner {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .status-stats {
            justify-content: center;
          }
        }

        @media (max-width: 576px) {
          .admin-content-wrapper {
            padding: 1rem;
          }

          .admin-title {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .title-main {
            font-size: 1.8rem;
          }

          .admin-cards-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .header-main {
            padding: 1.5rem;
          }

          .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .card-actions {
            flex-direction: column;
          }

          .status-stats {
            gap: 1rem;
          }
        }
      `}</style>
        </div>
    );
};

export default Dashboard;
