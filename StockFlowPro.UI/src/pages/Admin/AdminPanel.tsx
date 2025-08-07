import React from "react";
import { Link } from "react-router-dom";
import {
    Shield,
    Users,
    Settings,
    BarChart3,
    Database,
    Activity,
    Home
} from "lucide-react";

const AdminPanel: React.FC = () => {
    const adminCards = [
        {
            title: "User Management",
            description: "Manage user accounts, roles and permissions",
            icon: Users,
            href: "/users",
            color: "bg-blue-500"
        },
        {
            title: "System Settings",
            description: "Configure system preferences and settings",
            icon: Settings,
            href: "/settings",
            color: "bg-green-500"
        },
        {
            title: "Analytics & Reports",
            description: "View system analytics and generate reports",
            icon: BarChart3,
            href: "/reports",
            color: "bg-purple-500"
        },
        {
            title: "Database Management",
            description: "Backup, restore and manage database",
            icon: Database,
            href: "/database",
            color: "bg-orange-500"
        },
        {
            title: "System Monitoring",
            description: "Monitor system health and performance",
            icon: Activity,
            href: "/monitoring",
            color: "bg-red-500"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 w-full">
            {/* Navigation Breadcrumb */}
            <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-30 w-full py-4">
                <div className="px-4 sm:px-6 lg:px-8">
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
                            <Shield className="h-4 w-4" />
                            <span>Admin Panel</span>
                        </li>
                    </ol>
                </div>
            </nav>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
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
                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {adminCards.map((card, index) => {
                            const Icon = card.icon;
                            return (
                                <div
                                    key={card.title}
                                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-gray-200 hover:-translate-y-2 overflow-hidden"
                                    style={{
                                        animationDelay: `${index * 100}ms`
                                    }}
                                >
                                    {/* Gradient Background Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    {/* Top Accent Bar */}
                                    <div className={`h-1 w-full ${card.color.replace('bg-', 'bg-gradient-to-r from-').replace('-500', '-400 to-').replace('blue', 'blue').replace('green', 'green').replace('purple', 'purple').replace('orange', 'orange').replace('red', 'red')}-600`}></div>

                                    <div className="relative p-4 sm:p-6 lg:p-8">
                                        {/* Icon Section */}
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="relative">
                                                <div
                                                    className={`p-4 rounded-2xl ${card.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                                >
                                                    <Icon className="h-8 w-8 text-white" />
                                                </div>
                                                {/* Icon Glow Effect */}
                                                <div className={`absolute inset-0 p-4 rounded-2xl ${card.color} opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-300`}></div>
                                            </div>

                                            {/* Status Indicator */}
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Active</span>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-200">
                                                    {card.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                                    {card.description}
                                                </p>
                                            </div>

                                            {/* Feature Tags */}
                                            <div className="flex flex-wrap gap-2">
                                                {card.title === "User Management" && (
                                                    <>
                                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">Roles</span>
                                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">Permissions</span>
                                                    </>
                                                )}
                                                {card.title === "System Settings" && (
                                                    <>
                                                        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">Config</span>
                                                        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">Security</span>
                                                    </>
                                                )}
                                                {card.title === "Analytics & Reports" && (
                                                    <>
                                                        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">Charts</span>
                                                        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">Export</span>
                                                    </>
                                                )}
                                                {card.title === "Database Management" && (
                                                    <>
                                                        <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">Backup</span>
                                                        <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">Restore</span>
                                                    </>
                                                )}
                                                {card.title === "System Monitoring" && (
                                                    <>
                                                        <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">Health</span>
                                                        <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">Alerts</span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Action Button */}
                                            <div className="pt-6 border-t border-gray-100 mt-6">
                                                <button className={`w-full ${card.color} text-white py-4 px-6 rounded-xl font-bold text-base hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group-hover:shadow-2xl shadow-lg`}>
                                                    <span className="flex items-center justify-center space-x-3">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                        </svg>
                                                        <span className="tracking-wide">ACCESS PANEL</span>
                                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Shine Effect */}
                                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                            );
                        })}
                    </div>

                    {/* System Status */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-white p-4 sm:p-6 border-b border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                        System Status
                                    </h2>
                                </div>
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full uppercase tracking-wide self-start sm:self-auto">
                                    All Systems Operational
                                </span>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                <div className="group relative bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border border-green-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl sm:text-3xl font-bold text-green-700 group-hover:scale-110 transition-transform duration-300">
                                                99.9%
                                            </div>
                                            <div className="text-xs sm:text-sm font-semibold text-green-600 uppercase tracking-wide">System Uptime</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 bg-green-200 rounded-full h-2">
                                            <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{width: '99.9%'}}></div>
                                        </div>
                                        <span className="text-xs font-medium text-green-700 hidden sm:inline">Excellent</span>
                                    </div>
                                </div>

                                <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border border-blue-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                            </svg>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl sm:text-3xl font-bold text-blue-700 group-hover:scale-110 transition-transform duration-300">
                                                1234
                                            </div>
                                            <div className="text-xs sm:text-sm font-semibold text-blue-600 uppercase tracking-wide">Active Users</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                        </div>
                                        <span className="text-xs font-medium text-blue-700 hidden sm:inline">+12% from yesterday</span>
                                    </div>
                                </div>

                                <div className="group relative bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border border-purple-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                            </svg>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl sm:text-3xl font-bold text-purple-700 group-hover:scale-110 transition-transform duration-300">
                                                5.2GB
                                            </div>
                                            <div className="text-xs sm:text-sm font-semibold text-purple-600 uppercase tracking-wide">Storage Used</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 bg-purple-200 rounded-full h-2">
                                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full" style={{width: '52%'}}></div>
                                        </div>
                                        <span className="text-xs font-medium text-purple-700 hidden sm:inline">52% of 10GB</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;