import React, { useState } from "react";
import { RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react";

const UserSync: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(new Date());

    const handleSync = async () => {
        setIsLoading(true);
        // Simulate sync process
        setTimeout(() => {
            setIsLoading(false);
            setLastSync(new Date());
        }, 3000);
    };

    const syncItems = [
        {
            name: "User Profile",
            status: "synced",
            lastSync: "2 minutes ago",
            icon: CheckCircle,
            color: "text-green-500",
        },
        {
            name: "Permissions",
            status: "synced",
            lastSync: "2 minutes ago",
            icon: CheckCircle,
            color: "text-green-500",
        },
        {
            name: "Settings",
            status: "pending",
            lastSync: "1 hour ago",
            icon: Clock,
            color: "text-yellow-500",
        },
        {
            name: "Activity Log",
            status: "error",
            lastSync: "3 hours ago",
            icon: AlertCircle,
            color: "text-red-500",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <RefreshCw className="h-8 w-8 text-blue-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Account Sync
                        </h1>
                        <p className="text-gray-600">
                            Synchronize your account data with the server
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSync}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                    <RefreshCw
                        className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                    <span>{isLoading ? "Syncing..." : "Sync Now"}</span>
                </button>
            </div>

            {/* Sync Status */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Sync Status
                </h2>

                {lastSync && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-green-700 font-medium">
                                Last successful sync:{" "}
                                {lastSync.toLocaleString()}
                            </span>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {syncItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.name}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                            >
                                <div className="flex items-center space-x-3">
                                    <Icon className={`h-5 w-5 ${item.color}`} />
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            {item.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Last sync: {item.lastSync}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        item.status === "synced"
                                            ? "bg-green-100 text-green-800"
                                            : item.status === "pending"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : "bg-red-100 text-red-800"
                                    }`}
                                >
                                    {item.status}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sync Options */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Sync Options
                </h2>
                <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            defaultChecked
                        />
                        <span className="text-gray-700">
                            Auto-sync every 15 minutes
                        </span>
                    </label>
                    <label className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            defaultChecked
                        />
                        <span className="text-gray-700">
                            Sync profile changes immediately
                        </span>
                    </label>
                    <label className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">
                            Sync when network connection is restored
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default UserSync;
