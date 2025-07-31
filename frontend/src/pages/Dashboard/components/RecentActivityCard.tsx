import React from "react";
import { Activity, RefreshCw } from "lucide-react";
import DashboardCard from "./DashboardCard";

interface ActivityItem {
    action: string;
    time: string;
}

interface RecentActivityCardProps {
    activities: ActivityItem[];
    onViewAll?: () => void;
    onRefresh?: () => void;
}

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
    activities,
    onViewAll,
    onRefresh,
}) => {
    const renderContent = () => {
        if (activities.length === 0) {
            return (
                <div className="p-4 text-center text-gray-500">
                    No recent activity to display
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {activities.map((activity, index) => (
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
        );
    };

    return (
        <DashboardCard
            title="Recent Activity"
            description="Track recent system activities and monitor user interactions across your platform."
            category="ACTIVITY"
            icon={Activity}
            primaryAction={{
                label: "View All",
                icon: Activity,
                onClick: onViewAll,
            }}
            secondaryAction={{
                label: "Refresh",
                icon: RefreshCw,
                onClick: onRefresh,
                variant: "secondary",
            }}
        >
            {renderContent()}
        </DashboardCard>
    );
};

export default RecentActivityCard;