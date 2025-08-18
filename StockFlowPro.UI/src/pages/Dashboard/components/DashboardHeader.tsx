import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, RefreshCw, Settings } from "lucide-react";
import OverviewPerformanceChart from "./OverviewPerformanceChart";
import DepartmentManagementModal from "../../../components/modals/DepartmentManagementModal";

interface User {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
}

interface DashboardHeaderProps {
    currentUser: User | null | undefined;
    onRefresh: () => void;
    onSettings: () => void;
    entitlements?: {
        planName: string;
        isTrial: boolean;
        trialEndDate?: string;
        billingInterval: string;
        price: number;
        currency: string;
        maxUsers: number | null;
        maxProjects: number | null;
        maxStorageGB: number | null;
    };
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    currentUser,
    onRefresh,
    onSettings,
    entitlements,
}) => {
    const navigate = useNavigate();
    const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
    
    // Destructure with default values to prevent undefined errors
    const {
        planName = 'Professional',
        isTrial = false,
        trialEndDate,
        billingInterval = 'Monthly',
        price = 0,
        currency = 'ZAR',
        maxUsers = null,
        maxProjects = null,
        maxStorageGB = null
    } = entitlements || {};

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

    // Handle upgrade button click - navigate to checkout
    const handleUpgrade = () => {
        // Navigate to checkout page - the checkout page will automatically fill in the user's email
        // if they are logged in (handled by the Checkout component's useEffect)
        navigate('/checkout');
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="relative">
                {/* Buttons in top-right corner */}
                <div className="absolute top-0 right-0 flex gap-3">
                    <button
                        className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 text-gray-600 rounded-lg hover:bg-gray-400 hover:text-white transition-all duration-200 font-medium"
                        onClick={onRefresh}
                        title="Refresh Data"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                    </button>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg"
                        onClick={onSettings}
                        title="Dashboard Settings"
                    >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                    </button>
                </div>

                {/* Main content */}
                <div className="flex flex-col gap-6">
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
                                ) : ""}! Here's what's happening with your business today.
                            </p>
                        </div>
                    </div>

                       
                    {/* Overview Performance Chart */}
                    <div className="mt-6">
                        <OverviewPerformanceChart />
                    </div>
                    
                    {/* Current Plan Section */}
                    <div className="p-5 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
                        {entitlements && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-blue-700 uppercase tracking-wider">Current Plan</h3>
                                    <button
                                        onClick={handleUpgrade}
                                        className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                                    >
                                        <ArrowUp className="w-3.5 h-3.5" />
                                        <span>Upgrade</span>
                                    </button>
                                </div>
                                
                                <div className="flex items-center flex-wrap gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{planName}</span>
                                    
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                        {billingInterval}
                                    </span>
                                    
                                    {isTrial && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                            Trial
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex items-baseline space-x-1">
                                    <span className="text-base font-medium text-gray-900">{currency} {price?.toLocaleString()}</span>
                                    {isTrial && trialEndDate && (
                                        <span className="text-sm text-amber-600">
                                            (Trial ends {new Date(trialEndDate).toLocaleDateString()})
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex flex-wrap gap-3 pt-3">
                                    <div className="inline-flex items-center rounded-xl bg-gradient-to-br from-purple-50 to-white px-4 py-1.5 text-sm font-medium text-purple-800 shadow-sm transition-all duration-200 hover:shadow-md border border-purple-100 hover:-translate-y-0.5">
                                        <span className="mr-2 text-purple-500">👥</span>
                                        <span className="font-medium text-purple-600">Users</span>
                                        <span className="ml-1.5 px-2 py-0.5 rounded-full bg-white text-purple-900 font-semibold text-xs border border-purple-100">
                                            {maxUsers !== null ? maxUsers : '∞'}
                                        </span>
                                    </div>
                                    <div className="inline-flex items-center rounded-xl bg-gradient-to-br from-green-50 to-white px-4 py-1.5 text-sm font-medium text-green-800 shadow-sm transition-all duration-200 hover:shadow-md border border-green-100 hover:-translate-y-0.5">
                                        <span className="mr-2 text-green-500">📁</span>
                                        <span className="font-medium text-green-600">Projects</span>
                                        <span className="ml-1.5 px-2 py-0.5 rounded-full bg-white text-green-900 font-semibold text-xs border border-green-100">
                                            {maxProjects !== null ? maxProjects : '∞'}
                                        </span>
                                    </div>
                                    <div className="inline-flex items-center rounded-xl bg-gradient-to-br from-amber-50 to-white px-4 py-1.5 text-sm font-medium text-amber-800 shadow-sm transition-all duration-200 hover:shadow-md border border-amber-100 hover:-translate-y-0.5">
                                        <span className="mr-2 text-amber-500">💾</span>
                                        <span className="font-medium text-amber-600">Storage</span>
                                        <span className="ml-1.5 px-2 py-0.5 rounded-full bg-white text-amber-900 font-semibold text-xs border border-amber-100">
                                            {maxStorageGB !== null ? `${maxStorageGB}GB` : '∞'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                 
                </div>
            </div>

            {/* Department Management Modal */}
            <DepartmentManagementModal 
                isOpen={isDepartmentModalOpen}
                onClose={() => setIsDepartmentModalOpen(false)}
            />
        </div>
    );
};

export default DashboardHeader;