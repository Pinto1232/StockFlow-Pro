import React from "react";
import { RefreshCw, Settings } from "lucide-react";

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
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    currentUser,
    onRefresh,
    onSettings,
}) => {
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
            </div>
        </div>
    );
};

export default DashboardHeader;