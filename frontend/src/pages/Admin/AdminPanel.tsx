import React from "react";
import {
    Shield,
    Users,
    Settings,
    BarChart3,
    Database,
    Activity,
} from "lucide-react";

const AdminPanel: React.FC = () => {
    const adminCards = [
        {
            title: "User Management",
            description: "Manage user accounts, roles, and permissions",
            icon: Users,
            href: "/users",
            color: "bg-blue-500",
        },
        {
            title: "System Settings",
            description: "Configure system preferences and settings",
            icon: Settings,
            href: "/settings",
            color: "bg-green-500",
        },
        {
            title: "Analytics & Reports",
            description: "View system analytics and generate reports",
            icon: BarChart3,
            href: "/reports",
            color: "bg-purple-500",
        },
        {
            title: "Database Management",
            description: "Backup, restore, and manage database",
            icon: Database,
            href: "/database",
            color: "bg-orange-500",
        },
        {
            title: "System Monitoring",
            description: "Monitor system health and performance",
            icon: Activity,
            href: "/monitoring",
            color: "bg-red-500",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-yellow-600" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Admin Panel
                    </h1>
                    <p className="text-gray-600">
                        System administration and management
                    </p>
                </div>
            </div>

            {/* Admin Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.title}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                        >
                            <div className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div
                                        className={`p-3 rounded-lg ${card.color}`}
                                    >
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {card.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {card.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg transition-colors">
                                        Access
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        System Status
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                99.9%
                            </div>
                            <div className="text-sm text-green-700">Uptime</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                1,234
                            </div>
                            <div className="text-sm text-blue-700">
                                Active Users
                            </div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                                5.2GB
                            </div>
                            <div className="text-sm text-purple-700">
                                Storage Used
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
