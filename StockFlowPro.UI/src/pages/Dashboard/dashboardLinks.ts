import { NavigateFunction } from "react-router-dom";

// Navigation functions
export const createNavigationHandlers = (navigate: NavigateFunction) => ({
    navigateToProducts: () => {
        navigate("/products");
    },

    navigateToInvoices: () => {
        navigate("/invoices");
    },

    navigateToNewInvoice: () => {
        navigate("/invoices");
    },

    navigateToReports: () => {
        navigate("/admin");
    },

    navigateToHealthCheck: () => {
        navigate("/admin");
    },

    navigateToUsers: () => {
        navigate("/users");
    },

    navigateToAdmin: () => {
        navigate("/admin");
    },

    navigateToSettings: () => {
        navigate("/settings");
    },

    navigateToLowStockProducts: () => {
        navigate("/products?filter=lowStock");
    },

    // Account navigation handlers
    navigateToAccount: () => {
        navigate("/account");
    },

    navigateToFinancialReports: () => {
        navigate("/account/financial-reports");
    },

    navigateToPayroll: () => {
        navigate("/account/payroll");
    },

    navigateToExpenseTracking: () => {
        navigate("/account/expense-tracking");
    },

    navigateToInvoicingBilling: () => {
        navigate("/account/invoicing-billing");
    },

    // Project Management navigation handlers
    navigateToProjects: () => {
        navigate("/projects");
    },

    navigateToProjectOverview: () => {
        navigate("/projects/overview");
    },

    navigateToTaskManagement: () => {
        navigate("/projects/tasks");
    },

    navigateToTeamCollaboration: () => {
        navigate("/projects/team");
    },

    navigateToProjectReports: () => {
        navigate("/projects/reports");
    },

    navigateToProjectSettings: () => {
        navigate("/projects/settings");
    }
});

// Quick action links configuration
export const quickActionLinks = [
    {
        id: 'add-product',
        label: 'Add Product',
        icon: 'Package',
        action: 'navigateToProducts',
        description: 'Add new products to inventory'
    },
    {
        id: 'new-invoice',
        label: 'New Invoice',
        icon: 'FileTextIcon',
        action: 'navigateToNewInvoice',
        description: 'Create a new invoice'
    },
    {
        id: 'view-reports',
        label: 'View Reports',
        icon: 'BarChart3',
        action: 'navigateToReports',
        description: 'Access business reports and analytics'
    },
    {
        id: 'health-check',
        label: 'Health Check',
        icon: 'Activity',
        action: 'navigateToHealthCheck',
        description: 'Monitor system health and performance'
    }
];

// Dashboard card links configuration
export const dashboardCardLinks = [
    {
        id: 'admin-panel',
        title: 'Admin Panel',
        category: 'ADMIN',
        description: 'Access system settings, advanced configuration, and administrative tools for managing your StockFlow Pro instance.',
        primaryAction: {
            label: 'Open Panel',
            icon: 'Cog',
            action: 'navigateToAdmin'
        },
        secondaryAction: {
            label: 'Settings',
            icon: 'Settings',
            action: 'navigateToSettings'
        },
        stats: [
            { label: 'ADMIN TOOLS', value: '12' },
            { label: 'STATUS', value: 'Active' }
        ],
        gradient: 'from-purple-50 to-indigo-50',
        iconGradient: 'from-purple-500 to-indigo-600',
        badgeColor: 'purple'
    },
    {
        id: 'products-management',
        title: 'Product Management',
        category: 'INVENTORY',
        description: 'Manage your product inventory, track stock levels, and monitor product performance across your business.',
        primaryAction: {
            label: 'Manage',
            icon: 'Box',
            action: 'navigateToProducts',
            href: '/products'
        },
        secondaryAction: {
            label: 'Add',
            icon: 'Package',
            action: 'navigateToProducts'
        },
        stats: [
            { label: 'TOTAL PRODUCTS', value: '1,234' },
            { label: 'IN STOCK', value: '87.5%' }
        ],
        gradient: 'from-blue-50 to-purple-50',
        iconGradient: 'from-blue-500 to-purple-600',
        badgeColor: 'blue',
        primaryButtonColor: 'from-green-500 to-green-600'
    },
    {
        id: 'users-management',
        title: 'User Management',
        category: 'USERS',
        description: 'Monitor user activity, manage permissions, and track user engagement across your platform.',
        primaryAction: {
            label: 'Manage',
            icon: 'Users',
            action: 'navigateToUsers'
        },
        secondaryAction: {
            label: 'Add Role',
            icon: 'UserPlus',
            action: 'handleAddRole'
        },
        stats: [
            { label: 'ACTIVE USERS', value: 'dynamic' }, // Will be populated from userStats
            { label: 'ROLES', value: 'dynamic' } // Will be populated from userStats
        ],
        gradient: 'from-blue-50 to-purple-50',
        iconGradient: 'from-blue-500 to-purple-600',
        badgeColor: 'blue'
    },
    {
        id: 'invoices-revenue',
        title: 'Invoices & Revenue',
        category: 'FINANCE',
        description: 'Track invoices, monitor revenue streams, and analyze financial performance metrics.',
        primaryAction: {
            label: 'View',
            icon: 'FileText',
            action: 'navigateToInvoices'
        },
        secondaryAction: {
            label: 'New',
            icon: 'DollarSign',
            action: 'navigateToNewInvoice'
        },
        stats: [
            { label: 'TOTAL INVOICES', value: '456' },
            { label: 'REVENUE', value: 'currency' } // Will be formatted with formatCurrency
        ],
        gradient: 'from-blue-50 to-purple-50',
        iconGradient: 'from-blue-500 to-purple-600',
        badgeColor: 'blue',
        primaryButtonColor: 'from-cyan-500 to-cyan-600'
    },
    {
        id: 'low-stock-alerts',
        title: 'Low Stock Alerts',
        category: 'ALERTS',
        description: 'Monitor products with low stock levels and receive alerts when inventory needs attention.',
        primaryAction: {
            label: 'View All',
            icon: 'AlertTriangle',
            action: 'navigateToLowStockProducts'
        },
        secondaryAction: {
            label: 'Manage',
            icon: 'Package',
            action: 'navigateToProducts'
        },
        stats: [], // Dynamic content based on low stock products
        gradient: 'from-orange-50 to-red-50',
        iconGradient: 'from-orange-500 to-red-600',
        badgeColor: 'orange',
        primaryButtonColor: 'from-orange-500 to-orange-600'
    },
    {
        id: 'recent-activity',
        title: 'Recent Activity',
        category: 'ACTIVITY',
        description: 'Track recent system activities and monitor user interactions across your platform.',
        primaryAction: {
            label: 'View All',
            icon: 'Activity',
            action: null // No specific navigation for this action
        },
        secondaryAction: {
            label: 'Refresh',
            icon: 'RefreshCw',
            action: null // Will trigger refresh functionality
        },
        stats: [], // Dynamic content based on recent activity
        gradient: 'from-blue-50 to-purple-50',
        iconGradient: 'from-blue-500 to-purple-600',
        badgeColor: 'blue'
    }
];

// Header action buttons configuration
export const headerActionButtons = [
    {
        id: 'refresh',
        label: 'Refresh',
        icon: 'RefreshCw',
        action: 'refreshDashboard',
        variant: 'secondary',
        title: 'Refresh Data'
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: 'Settings',
        action: 'navigateToSettings',
        variant: 'primary',
        title: 'Dashboard Settings'
    }
];

// Account navigation links configuration
export const accountLinks = {
    main: {
        id: 'account',
        label: 'Account',
        icon: 'CreditCard',
        href: '/account',
        action: 'navigateToAccount',
        description: 'Manage financial operations and accounting'
    },
    subLinks: [
        {
            id: 'financial-reports',
            label: 'Financial Reports',
            icon: 'BarChart3',
            href: '/account/financial-reports',
            action: 'navigateToFinancialReports',
            description: 'View comprehensive financial reports and analytics'
        },
        {
            id: 'payroll',
            label: 'Payroll',
            icon: 'Banknote',
            href: '/account/payroll',
            action: 'navigateToPayroll',
            description: 'Manage employee payroll and compensation'
        },
        {
            id: 'expense-tracking',
            label: 'Expense Tracking',
            icon: 'CreditCard',
            href: '/account/expense-tracking',
            action: 'navigateToExpenseTracking',
            description: 'Track and categorize business expenses'
        },
        {
            id: 'invoicing-billing',
            label: 'Invoicing & Billing',
            icon: 'FileText',
            href: '/account/invoicing-billing',
            action: 'navigateToInvoicingBilling',
            description: 'Manage invoices, billing, and payment processing'
        }
    ]
};

// Project Management navigation links configuration
export const projectManagementLinks = {
    main: {
        id: 'projects',
        label: 'Project Management',
        icon: 'FolderKanban',
        href: '/projects',
        action: 'navigateToProjects',
        description: 'Manage projects, tasks, and team collaboration'
    },
    subLinks: [
        {
            id: 'project-overview',
            label: 'Project Overview',
            icon: 'LayoutDashboard',
            href: '/projects/overview',
            action: 'navigateToProjectOverview',
            description: 'View project status and key metrics'
        },
        {
            id: 'task-management',
            label: 'Task Management',
            icon: 'CheckSquare',
            href: '/projects/tasks',
            action: 'navigateToTaskManagement',
            description: 'Create, assign, and track project tasks'
        },
        {
            id: 'team-collaboration',
            label: 'Team Collaboration',
            icon: 'Users',
            href: '/projects/team',
            action: 'navigateToTeamCollaboration',
            description: 'Collaborate with team members and manage assignments'
        },
        {
            id: 'project-reports',
            label: 'Project Reports',
            icon: 'BarChart3',
            href: '/projects/reports',
            action: 'navigateToProjectReports',
            description: 'Generate and view project performance reports'
        },
        {
            id: 'project-settings',
            label: 'Project Settings',
            icon: 'Settings',
            href: '/projects/settings',
            action: 'navigateToProjectSettings',
            description: 'Configure project settings and preferences'
        }
    ]
};

// External links (if any)
export const externalLinks = {
    documentation: 'https://docs.stockflow-pro.com',
    support: 'https://support.stockflow-pro.com',
    github: 'https://github.com/stockflow-pro'
};

// Link validation helper
export const validateLink = (link: unknown): boolean => {
    if (!link || typeof link !== 'object') return false;
    const linkObj = link as Record<string, unknown>;
    return !!(linkObj && (linkObj.action || linkObj.href) && linkObj.label);
};

// Get link by ID helper
export const getLinkById = (id: string, linkType: 'quick' | 'card' | 'header') => {
    switch (linkType) {
        case 'quick':
            return quickActionLinks.find(link => link.id === id);
        case 'card':
            return dashboardCardLinks.find(link => link.id === id);
        case 'header':
            return headerActionButtons.find(link => link.id === id);
        default:
            return null;
    }
};