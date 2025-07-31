import React from "react";
import { Zap, Package, FileText as FileTextIcon, BarChart3, Activity } from "lucide-react";

interface QuickAction {
    id: string;
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    onClick: () => void;
}

interface QuickActionsBarProps {
    onNavigateToProducts: () => void;
    onNavigateToNewInvoice: () => void;
    onNavigateToReports: () => void;
    onNavigateToHealthCheck: () => void;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
    onNavigateToProducts,
    onNavigateToNewInvoice,
    onNavigateToReports,
    onNavigateToHealthCheck,
}) => {
    const quickActions: QuickAction[] = [
        {
            id: "add-product",
            label: "Add Product",
            icon: Package,
            onClick: onNavigateToProducts,
        },
        {
            id: "new-invoice",
            label: "New Invoice",
            icon: FileTextIcon,
            onClick: onNavigateToNewInvoice,
        },
        {
            id: "view-reports",
            label: "View Reports",
            icon: BarChart3,
            onClick: onNavigateToReports,
        },
        {
            id: "health-check",
            label: "Health Check",
            icon: Activity,
            onClick: onNavigateToHealthCheck,
        },
    ];

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
            <h3 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-6">
                <Zap className="w-6 h-6 text-blue-500" />
                Quick Actions
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => {
                    const IconComponent = action.icon;
                    return (
                        <button
                            key={action.id}
                            className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                            onClick={action.onClick}
                        >
                            <IconComponent className="w-8 h-8 text-blue-500" />
                            <span className="font-medium text-gray-700">{action.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuickActionsBar;