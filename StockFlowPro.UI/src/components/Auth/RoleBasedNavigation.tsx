import React from "react";
import { Link, useLocation } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import { Permissions } from "../../utils/permissions";
import {
    HomeIcon,
    CubeIcon,
    DocumentTextIcon,
    UsersIcon,
    CogIcon,
    ChartBarIcon,
    ShieldCheckIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface NavigationItem {
    name: string;
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
}

const navigationItems: NavigationItem[] = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: HomeIcon,
    },
    {
        name: "Products",
        href: "/products",
        icon: CubeIcon,
        permission: Permissions.Product.ViewProducts,
    },
    {
        name: "Invoices",
        href: "/invoices",
        icon: DocumentTextIcon,
        permission: Permissions.Invoice.ViewInvoices,
    },
    {
        name: "Users",
        href: "/users",
        icon: UsersIcon,
        permission: Permissions.Users.ViewAll,
    },
    {
        name: "Reports",
        href: "/reports",
        icon: ChartBarIcon,
        permission: Permissions.Reports.ViewBasic,
    },
    {
        name: "Admin Panel",
        href: "/admin",
        icon: ShieldCheckIcon,
        permission: Permissions.System.ViewAdminPanel,
    },
    {
        name: "Sync Data",
        href: "/sync",
        icon: ArrowPathIcon,
        permission: Permissions.System.SyncData,
    },
    {
        name: "Settings",
        href: "/settings",
        icon: CogIcon,
        permission: Permissions.System.ManageSettings,
    },
];

interface RoleBasedNavigationProps {
    className?: string;
    onItemClick?: () => void;
}

/**
 * Navigation component that shows/hides items based on user permissions
 */
const RoleBasedNavigation: React.FC<RoleBasedNavigationProps> = ({
    className = "",
    onItemClick,
}) => {
    const location = useLocation();
    const { hasPermission, hasAnyPermission, hasAllPermissions } =
        usePermissions();

    const isItemVisible = (item: NavigationItem): boolean => {
        if (item.permission) {
            return hasPermission(item.permission);
        }

        if (item.permissions && item.permissions.length > 0) {
            return item.requireAll
                ? hasAllPermissions(item.permissions)
                : hasAnyPermission(item.permissions);
        }

        // If no permissions specified, item is always visible
        return true;
    };

    const isCurrentPath = (href: string): boolean => {
        return (
            location.pathname === href ||
            location.pathname.startsWith(href + "/")
        );
    };

    const visibleItems = navigationItems.filter(isItemVisible);

    return (
        <nav className={className}>
            <ul className="space-y-1">
                {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isCurrentPath(item.href);

                    return (
                        <li key={item.name}>
                            <Link
                                to={item.href}
                                onClick={onItemClick}
                                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150
                  ${
                      isActive
                          ? "bg-indigo-100 text-indigo-900 border-r-2 border-indigo-500"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
                            >
                                <Icon
                                    className={`
                    mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150
                    ${isActive ? "text-indigo-500" : "text-gray-400 group-hover:text-gray-500"}
                  `}
                                />
                                {item.name}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default RoleBasedNavigation;
