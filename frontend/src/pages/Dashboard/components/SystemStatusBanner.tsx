import React from "react";
import { Zap } from "lucide-react";

interface SystemStatusBannerProps {
    uptime?: string;
    activeUsers?: number;
    lastUpdate?: string;
}

const SystemStatusBanner: React.FC<SystemStatusBannerProps> = ({
    uptime = "99.9%",
    activeUsers = 24,
    lastUpdate = "2 min ago",
}) => {
    return (
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl mb-8 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Zap className="w-5 h-5 lightning-flash fill-current" />
                    <span className="text-lg font-semibold">System Online</span>
                </div>
                <div className="flex flex-wrap gap-8 text-base">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">{uptime}</div>
                        <div className="text-green-100 font-medium text-sm">Uptime</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">{activeUsers}</div>
                        <div className="text-green-100 font-medium text-sm">Active Users</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">{lastUpdate}</div>
                        <div className="text-green-100 font-medium text-sm">Last Update</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemStatusBanner;