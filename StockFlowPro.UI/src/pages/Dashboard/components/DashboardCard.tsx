import React from "react";

interface DashboardCardAction {
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    onClick?: () => void;
    href?: string;
    variant?: "primary" | "secondary";
    color?: string;
}

interface DashboardCardStat {
    label: string;
    value: string | number;
    isLoading?: boolean;
}

interface DashboardCardProps {
    title: string;
    description: string;
    category: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    stats?: DashboardCardStat[];
    primaryAction?: DashboardCardAction;
    secondaryAction?: DashboardCardAction;
    gradient?: string;
    iconGradient?: string;
    badgeColor?: string;
    children?: React.ReactNode;
    className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
    title,
    description,
    category,
    icon: IconComponent,
    stats = [],
    primaryAction,
    secondaryAction,
    gradient = "from-blue-50 to-purple-50",
    iconGradient = "from-blue-500 to-purple-600",
    badgeColor = "blue",
    children,
    className = "",
}) => {
    const getBadgeClasses = (color: string) => {
        const colorMap: Record<string, string> = {
            blue: "bg-blue-100 text-blue-800",
            purple: "bg-purple-100 text-purple-800",
            orange: "bg-orange-100 text-orange-800",
            green: "bg-green-100 text-green-800",
        };
        return colorMap[color] || colorMap.blue;
    };

    const getButtonClasses = (action: DashboardCardAction) => {
        if (action.color) {
            return `flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r ${action.color} text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium text-sm`;
        }
        
        if (action.variant === "secondary") {
            return "flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm";
        }
        
        return `flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r ${iconGradient} text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium text-sm`;
    };

    const renderAction = (action: DashboardCardAction) => {
        const ActionIcon = action.icon;
        const classes = getButtonClasses(action);
        
        if (action.href) {
            return (
                <a href={action.href} className={classes}>
                    <ActionIcon className="w-4 h-4" />
                    <span>{action.label}</span>
                </a>
            );
        }
        
        return (
            <button onClick={action.onClick} className={classes}>
                <ActionIcon className="w-4 h-4" />
                <span>{action.label}</span>
            </button>
        );
    };

    return (
        <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col ${className}`}>
            <div className={`bg-gradient-to-r ${gradient} p-6 border-b border-gray-200`}>
                <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 bg-gradient-to-r ${iconGradient} rounded-lg flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <span className={`${getBadgeClasses(badgeColor)} text-xs font-semibold px-3 py-1 rounded-full`}>
                        {category}
                    </span>
                </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
                <h5 className="text-lg font-bold text-gray-900 mb-2">{title}</h5>
                <p className="text-gray-600 text-sm mb-4">{description}</p>
                
                {children ? (
                    <div className="mb-4 flex-1">{children}</div>
                ) : stats.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                                {stat.isLoading ? (
                                    <div className="text-xl font-bold text-blue-600">
                                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </div>
                                ) : (
                                    <div className="text-xl font-bold text-blue-600">{stat.value}</div>
                                )}
                                <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                ) : null}
                
                {(primaryAction || secondaryAction) && (
                    <div className="flex gap-2 mt-auto">
                        {primaryAction && renderAction(primaryAction)}
                        {secondaryAction && renderAction(secondaryAction)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardCard;