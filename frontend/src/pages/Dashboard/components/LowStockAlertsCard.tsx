import React from "react";
import { AlertTriangle, Package } from "lucide-react";
import { formatCurrency } from "../../../utils/currency";
import DashboardCard from "./DashboardCard";

interface LowStockProduct {
    id: string;
    name: string;
    costPerItem: number;
    numberInStock: number;
}

interface LowStockAlertsCardProps {
    lowStockProducts: LowStockProduct[];
    isLoading: boolean;
    error: Error | null | undefined;
    onViewAll: () => void;
    onManage: () => void;
}

const LowStockAlertsCard: React.FC<LowStockAlertsCardProps> = ({
    lowStockProducts,
    isLoading,
    error,
    onViewAll,
    onManage,
}) => {
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center p-4">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2 text-sm text-gray-500">
                        Loading low stock products...
                    </span>
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-3 bg-red-50 rounded-lg">
                    <span className="text-sm text-red-600">
                        Failed to load low stock products
                    </span>
                </div>
            );
        }

        if (lowStockProducts.length === 0) {
            return (
                <div className="p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-green-600 font-medium">
                        ✓ All products are well stocked!
                    </span>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {lowStockProducts.slice(0, 3).map((product) => (
                    <div
                        key={product.id}
                        className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                    >
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                                {product.name}
                            </span>
                            <span className="text-xs text-gray-500">
                                {formatCurrency(product.costPerItem)} per item
                            </span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-sm text-orange-600 font-medium">
                                {product.numberInStock} left
                            </span>
                        </div>
                    </div>
                ))}
                {lowStockProducts.length > 3 && (
                    <div className="p-2 text-center">
                        <span className="text-xs text-gray-500">
                            +{lowStockProducts.length - 3} more products with low stock
                        </span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <DashboardCard
            title="Low Stock Alerts"
            description="Monitor products with low stock levels and receive alerts when inventory needs attention."
            category="ALERTS"
            icon={AlertTriangle}
            gradient="from-orange-50 to-red-50"
            iconGradient="from-orange-500 to-red-600"
            badgeColor="orange"
            primaryAction={{
                label: "View All",
                icon: AlertTriangle,
                onClick: onViewAll,
                color: "from-orange-500 to-orange-600",
            }}
            secondaryAction={{
                label: "Manage",
                icon: Package,
                onClick: onManage,
                variant: "secondary",
            }}
        >
            {renderContent()}
        </DashboardCard>
    );
};

export default LowStockAlertsCard;