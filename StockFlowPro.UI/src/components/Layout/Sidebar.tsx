import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
    Home,
    FolderOpen,
    CheckSquare,
    DollarSign,
    CreditCard,
    FileText,
    Calendar,
    Banknote,
    CalendarX,
    BarChart3,
    HelpCircle,
    LogOut,
    ChevronDown,
    ChevronRight,
    Target,
    MessageSquare,
    Users,
    UserCheck,
    Receipt,
    Clock,
    Briefcase,
} from "lucide-react";
import { useLogout, useCurrentUser } from "../../hooks/useAuth";
import { UserRole } from "../../types/index";

type NavigationItem = {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: UserRole[];
};

interface SidebarProps {
    isCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false }) => {
    const { data: currentUser } = useCurrentUser();
    const logoutMutation = useLogout();
    const [isAccountExpanded, setIsAccountExpanded] = useState(false);
    const [isProjectExpanded, setIsProjectExpanded] = useState(false);
    const [isHRExpanded, setIsHRExpanded] = useState(false);

    const handleLogout = () => {
        logoutMutation.mutate();
    };

    const toggleAccountSubmenu = () => {
        setIsAccountExpanded(!isAccountExpanded);
    };

    const toggleProjectSubmenu = () => {
        setIsProjectExpanded(!isProjectExpanded);
    };

    const toggleHRSubmenu = () => {
        setIsHRExpanded(!isHRExpanded);
    };

    const navigationItems: NavigationItem[] = [
        {
            name: "Overview",
            href: "/app/dashboard",
            icon: Home,
            roles: [UserRole.Admin, UserRole.Manager, UserRole.User],
        },
        {
            name: "Income",
            href: "/app/income",
            icon: DollarSign,
            roles: [UserRole.Admin, UserRole.Manager],
        },
        {
            name: "Leaves",
            href: "/app/leaves",
            icon: CalendarX,
            roles: [UserRole.Admin, UserRole.Manager],
        },
    ];

    // Project Management sub-navigation items
    const projectSubItems = [
        {
            name: "Task Management",
            href: "/app/project-management/task-management",
            icon: CheckSquare,
            roles: [UserRole.Admin, UserRole.Manager, UserRole.User],
        },
        {
            name: "Reports",
            href: "/app/project-management/reports",
            icon: BarChart3,
            roles: [UserRole.Admin, UserRole.Manager],
        },
        {
            name: "Team Collaboration",
            href: "/app/project-management/team-collaboration",
            icon: MessageSquare,
            roles: [UserRole.Admin, UserRole.Manager, UserRole.User],
        },
        {
            name: "Milestones & Deadlines",
            href: "/app/project-management/milestones-deadlines",
            icon: Target,
            roles: [UserRole.Admin, UserRole.Manager],
        },
    ];

    // Account sub-navigation items
    const accountSubItems = [
        {
            name: "Financial Reports",
            href: "/app/account/financial-reports",
            icon: BarChart3,
            roles: [UserRole.Admin, UserRole.Manager],
        },
        {
            name: "Payroll",
            href: "/app/account/payroll",
            icon: Banknote,
            roles: [UserRole.Admin, UserRole.Manager],
        },
        {
            name: "Expense Tracking",
            href: "/app/account/expense-tracking",
            icon: CreditCard,
            roles: [UserRole.Admin, UserRole.Manager],
        },
        {
            name: "Invoicing & Billing",
            href: "/app/account/invoicing-billing",
            icon: FileText,
            roles: [UserRole.Admin, UserRole.Manager],
        },
    ];

    // Human Resources sub-navigation items
    const hrSubItems = [
        {
            name: "Employee Directory",
            href: "/app/hr/employee-directory",
            icon: Users,
            roles: [UserRole.Admin, UserRole.Manager],
        },
        {
            name: "Employee Performance",
            href: "/app/hr/employee-performance",
            icon: UserCheck,
            roles: [UserRole.Admin, UserRole.Manager],
        },
        {
            name: "Payslip",
            href: "/app/hr/payslip",
            icon: Receipt,
            roles: [UserRole.Admin, UserRole.Manager],
        },
        {
            name: "Attendance",
            href: "/app/hr/attendance",
            icon: Clock,
            roles: [UserRole.Admin, UserRole.Manager],
        },
        {
            name: "Holidays",
            href: "/app/hr/holidays",
            icon: Calendar,
            roles: [UserRole.Admin, UserRole.Manager],
        },
    ];

    const filteredNavigation = navigationItems.filter((item) =>
        currentUser ? item.roles.some(role => role === currentUser.role) : false,
    );

    return (
        <nav
            className="h-full flex flex-col text-white shadow-2xl sidebar-nav"
            style={{
                background: "linear-gradient(135deg, #5a5cdb 0%, #7f53ac 100%)",
            }}
            aria-label="Dashboard navigation"
            role="navigation"
        >
            {/* Sidebar Header */}
            <div
                className={`p-6 border-b border-white/10 bg-white/5 ${isCollapsed ? "px-4" : ""}`}
            >
                <div
                    className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"}`}
                >
                    <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
                        <span className="text-white font-bold text-lg">SF</span>
                    </div>
                    {!isCollapsed && (
                        <div>
                            <h5 className="font-bold text-white text-lg tracking-wide">
                                StockFlow
                            </h5>
                            <p className="text-white/70 text-xs font-medium">
                                Pro Dashboard
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Content */}
            <div
                className={`flex-1 overflow-y-auto py-2 scrollbar-hide ${isCollapsed ? "px-2" : "px-4"}`}
            >
                <nav className="space-y-1">
                    {filteredNavigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }) =>
                                    `group flex items-center ${isCollapsed ? "px-3 py-3 justify-center" : "px-4 py-3"} text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                                        isActive
                                            ? "bg-white/15 text-white font-semibold shadow-lg transform translate-x-1"
                                            : "text-white/85 hover:bg-white/10 hover:text-white hover:transform hover:translate-x-1"
                                    }`
                                }
                                title={isCollapsed ? item.name : undefined}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCollapsed ? "" : "mr-3"} transition-all duration-300 ${
                                                isActive
                                                    ? "bg-white/20 shadow-md transform scale-110"
                                                    : "bg-white/10 group-hover:bg-white/20 group-hover:scale-105"
                                            }`}
                                        >
                                            <Icon className="h-5 w-5 flex-shrink-0" />
                                        </div>
                                        {!isCollapsed && (
                                            <span className="truncate">
                                                {item.name}
                                            </span>
                                        )}
                                        {isActive && (
                                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white"></div>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}

                    {/* Project Management Section */}
                    {currentUser && (
                        <div className="pt-6">
                            {!isCollapsed && (
                                <div className="px-4 py-2">
                                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                                        Project Management
                                    </p>
                                </div>
                            )}
                            
                            {/* Project Management Main Link */}
                            {!isCollapsed ? (
                                <button
                                    type="button"
                                    onClick={toggleProjectSubmenu}
                                    className="group flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white transition-all duration-300 hover:transform hover:translate-x-1"
                                >
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mr-3 group-hover:bg-white/20 group-hover:scale-105 transition-all duration-300">
                                            <FolderOpen className="h-5 w-5 flex-shrink-0" />
                                        </div>
                                        <span className="truncate">Project Management</span>
                                    </div>
                                    {isProjectExpanded ? (
                                        <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                                    )}
                                </button>
                            ) : (
                                <NavLink
                                    to="/app/project-management"
                                    className={({ isActive }) =>
                                        `group flex items-center justify-center px-3 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                                            isActive
                                                ? "bg-white/15 text-white font-semibold shadow-lg transform translate-x-1"
                                                : "text-white/85 hover:bg-white/10 hover:text-white hover:transform hover:translate-x-1"
                                        }`
                                    }
                                    title="Project Management"
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                                    isActive
                                                        ? "bg-white/20 shadow-md transform scale-110"
                                                        : "bg-white/10 group-hover:bg-white/20 group-hover:scale-105"
                                                }`}
                                            >
                                                <FolderOpen className="h-5 w-5 flex-shrink-0" />
                                            </div>
                                            {isActive && (
                                                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white"></div>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            )}

                            {/* Project Management Sub-links */}
                            {!isCollapsed && (
                                <div 
                                    className={`ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-out ${
                                        isProjectExpanded 
                                            ? "max-h-64 opacity-100" 
                                            : "max-h-0 opacity-0"
                                    }`}
                                >
                                    <div className={`transition-all duration-200 ${isProjectExpanded ? 'pt-1' : 'pt-0'}`}>
                                        {projectSubItems
                                            .filter((item) =>
                                                currentUser ? item.roles.some(role => role === currentUser.role) : false,
                                            )
                                            .map((subItem) => {
                                                const SubIcon = subItem.icon;
                                                return (
                                                    <NavLink
                                                        key={subItem.name}
                                                        to={subItem.href}
                                                        className={({ isActive }) =>
                                                            `group flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 relative overflow-hidden rounded-lg mb-1 ${
                                                                isActive
                                                                    ? "bg-black/30 text-white font-semibold shadow-lg transform translate-x-1 border-l-2 border-white/50"
                                                                    : "text-white/70 hover:bg-black/20 hover:text-white hover:transform hover:translate-x-1 bg-black/10"
                                                            }`
                                                        }
                                                    >
                                                        {({ isActive }) => (
                                                            <>
                                                                <div
                                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                                                                        isActive
                                                                            ? "bg-white/25 shadow-md transform scale-110 border border-white/20"
                                                                            : "bg-black/20 group-hover:bg-white/15 group-hover:scale-105"
                                                                    }`}
                                                                >
                                                                    <SubIcon className="h-4 w-4 flex-shrink-0" />
                                                                </div>
                                                                <span className="truncate text-xs font-medium">
                                                                    {subItem.name}
                                                                </span>
                                                                {isActive && (
                                                                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-l-full"></div>
                                                                )}
                                                            </>
                                                        )}
                                                    </NavLink>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Human Resources Section */}
                    {currentUser &&
                        (currentUser.role === UserRole.Admin ||
                            currentUser.role === UserRole.Manager) && (
                            <div className="pt-6">
                                {!isCollapsed && (
                                    <div className="px-4 py-2">
                                        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                                            Human Resources
                                        </p>
                                    </div>
                                )}
                                
                                {/* HR Main Link */}
                                {!isCollapsed ? (
                                    <button
                                        type="button"
                                        onClick={toggleHRSubmenu}
                                        className="group flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white transition-all duration-300 hover:transform hover:translate-x-1"
                                    >
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mr-3 group-hover:bg-white/20 group-hover:scale-105 transition-all duration-300">
                                                <Briefcase className="h-5 w-5 flex-shrink-0" />
                                            </div>
                                            <span className="truncate">Human Resources</span>
                                        </div>
                                        {isHRExpanded ? (
                                            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                                        )}
                                    </button>
                                ) : (
                                                                    <NavLink
                                    to="/app/hr"
                                    className={({ isActive }) =>
                                        `group flex items-center justify-center px-3 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                                            isActive
                                                ? "bg-white/15 text-white font-semibold shadow-lg transform translate-x-1"
                                                : "text-white/85 hover:bg-white/10 hover:text-white hover:transform hover:translate-x-1"
                                        }`
                                    }
                                    title="Human Resources"
                                >
                                        {({ isActive }) => (
                                            <>
                                                <div
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                                        isActive
                                                            ? "bg-white/20 shadow-md transform scale-110"
                                                            : "bg-white/10 group-hover:bg-white/20 group-hover:scale-105"
                                                    }`}
                                                >
                                                    <Briefcase className="h-5 w-5 flex-shrink-0" />
                                                </div>
                                                {isActive && (
                                                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white"></div>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                )}

                                {/* HR Sub-links */}
                                {!isCollapsed && (
                                    <div 
                                        className={`ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-out ${
                                            isHRExpanded 
                                                ? "max-h-64 opacity-100" 
                                                : "max-h-0 opacity-0"
                                        }`}
                                    >
                                        <div className={`transition-all duration-200 ${isHRExpanded ? 'pt-1' : 'pt-0'}`}>
                                            {hrSubItems
                                                .filter((item) =>
                                                    currentUser ? item.roles.some(role => role === currentUser.role) : false,
                                                )
                                                .map((subItem) => {
                                                    const SubIcon = subItem.icon;
                                                    return (
                                                        <NavLink
                                                            key={subItem.name}
                                                            to={subItem.href}
                                                            className={({ isActive }) =>
                                                                `group flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 relative overflow-hidden rounded-lg mb-1 ${
                                                                    isActive
                                                                        ? "bg-black/30 text-white font-semibold shadow-lg transform translate-x-1 border-l-2 border-white/50"
                                                                        : "text-white/70 hover:bg-black/20 hover:text-white hover:transform hover:translate-x-1 bg-black/10"
                                                                }`
                                                            }
                                                        >
                                                            {({ isActive }) => (
                                                                <>
                                                                    <div
                                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                                                                            isActive
                                                                                ? "bg-white/25 shadow-md transform scale-110 border border-white/20"
                                                                                : "bg-black/20 group-hover:bg-white/15 group-hover:scale-105"
                                                                        }`}
                                                                    >
                                                                        <SubIcon className="h-4 w-4 flex-shrink-0" />
                                                                    </div>
                                                                    <span className="truncate text-xs font-medium">
                                                                        {subItem.name}
                                                                    </span>
                                                                    {isActive && (
                                                                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-l-full"></div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </NavLink>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    {/* Account Section */}
                    {currentUser &&
                        (currentUser.role === UserRole.Admin ||
                            currentUser.role === UserRole.Manager) && (
                            <div className="pt-6">
                                {!isCollapsed && (
                                    <div className="px-4 py-2">
                                        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                                            Financial Management
                                        </p>
                                    </div>
                                )}
                                
                                {/* Account Main Link */}
                                {!isCollapsed ? (
                                    <button
                                        type="button"
                                        onClick={toggleAccountSubmenu}
                                        className="group flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white transition-all duration-300 hover:transform hover:translate-x-1"
                                    >
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mr-3 group-hover:bg-white/20 group-hover:scale-105 transition-all duration-300">
                                                <CreditCard className="h-5 w-5 flex-shrink-0" />
                                            </div>
                                            <span className="truncate">Account</span>
                                        </div>
                                        {isAccountExpanded ? (
                                            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                                        )}
                                    </button>
                                ) : (
                                                                    <NavLink
                                    to="/app/account"
                                    className={({ isActive }) =>
                                        `group flex items-center justify-center px-3 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                                            isActive
                                                ? "bg-white/15 text-white font-semibold shadow-lg transform translate-x-1"
                                                : "text-white/85 hover:bg-white/10 hover:text-white hover:transform hover:translate-x-1"
                                        }`
                                    }
                                    title="Account"
                                >
                                        {({ isActive }) => (
                                            <>
                                                <div
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                                        isActive
                                                            ? "bg-white/20 shadow-md transform scale-110"
                                                            : "bg-white/10 group-hover:bg-white/20 group-hover:scale-105"
                                                    }`}
                                                >
                                                    <CreditCard className="h-5 w-5 flex-shrink-0" />
                                                </div>
                                                {isActive && (
                                                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white"></div>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                )}

                                {/* Account Sub-links */}
                                {!isCollapsed && (
                                    <div 
                                        className={`ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-out ${
                                            isAccountExpanded 
                                                ? "max-h-64 opacity-100" 
                                                : "max-h-0 opacity-0"
                                        }`}
                                    >
                                        <div className={`transition-all duration-200 ${isAccountExpanded ? 'pt-1' : 'pt-0'}`}>
                                            {accountSubItems
                                                .filter((item) =>
                                                    currentUser ? item.roles.some(role => role === currentUser.role) : false,
                                                )
                                                .map((subItem) => {
                                                    const SubIcon = subItem.icon;
                                                    return (
                                                        <NavLink
                                                            key={subItem.name}
                                                            to={subItem.href}
                                                            className={({ isActive }) =>
                                                                `group flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 relative overflow-hidden rounded-lg mb-1 ${
                                                                    isActive
                                                                        ? "bg-black/30 text-white font-semibold shadow-lg transform translate-x-1 border-l-2 border-white/50"
                                                                        : "text-white/70 hover:bg-black/20 hover:text-white hover:transform hover:translate-x-1 bg-black/10"
                                                                }`
                                                            }
                                                        >
                                                            {({ isActive }) => (
                                                                <>
                                                                    <div
                                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                                                                            isActive
                                                                                ? "bg-white/25 shadow-md transform scale-110 border border-white/20"
                                                                                : "bg-black/20 group-hover:bg-white/15 group-hover:scale-105"
                                                                        }`}
                                                                    >
                                                                        <SubIcon className="h-4 w-4 flex-shrink-0" />
                                                                    </div>
                                                                    <span className="truncate text-xs font-medium">
                                                                        {subItem.name}
                                                                    </span>
                                                                    {isActive && (
                                                                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-l-full"></div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </NavLink>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    {/* Reports & Analytics Section */}
                    {currentUser &&
                        (currentUser.role === UserRole.Admin ||
                            currentUser.role === UserRole.Manager) && (
                            <div className="pt-6">
                                {!isCollapsed && (
                                    <div className="px-4 py-2">
                                        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                                            Reports & Analytics
                                        </p>
                                    </div>
                                )}
                                
                                {/* Analytics Main Link */}
                                {!isCollapsed ? (
                                    <button
                                        type="button"
                                        className="group flex items-center w-full px-4 py-3 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white transition-all duration-300 hover:transform hover:translate-x-1"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mr-3 group-hover:bg-white/20 group-hover:scale-105 transition-all duration-300">
                                            <BarChart3 className="h-5 w-5 flex-shrink-0" />
                                        </div>
                                        <span className="truncate">Analytics</span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="group flex items-center justify-center w-full px-3 py-3 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white transition-all duration-300"
                                        title="Analytics"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 group-hover:scale-105 transition-all duration-300">
                                            <BarChart3 className="h-5 w-5 flex-shrink-0" />
                                        </div>
                                    </button>
                                )}
                            </div>
                        )}
                </nav>
            </div>

            {/* Sidebar Footer */}
            <div
                className={`p-4 border-t border-white/10 space-y-2 bg-white/5 ${isCollapsed ? "px-2" : ""}`}
            >
                <button
                    className={`group flex items-center w-full ${isCollapsed ? "px-3 py-3 justify-center" : "px-4 py-3"} text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white transition-all duration-300 hover:transform hover:translate-x-1`}
                    title={isCollapsed ? "Help & Support" : undefined}
                >
                    <div
                        className={`w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center ${isCollapsed ? "" : "mr-3"} group-hover:bg-white/20 group-hover:scale-105 transition-all duration-300`}
                    >
                        <HelpCircle className="h-5 w-5 flex-shrink-0" />
                    </div>
                    {!isCollapsed && <span>Help & Support</span>}
                </button>

                <button
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className={`group flex items-center w-full ${isCollapsed ? "px-3 py-3 justify-center" : "px-4 py-3"} text-sm font-medium text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-all duration-300 disabled:opacity-50 hover:transform hover:translate-x-1`}
                    title={
                        isCollapsed
                            ? logoutMutation.isPending
                                ? "Signing out..."
                                : "Logout"
                            : undefined
                    }
                >
                    <div
                        className={`w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center ${isCollapsed ? "" : "mr-3"} group-hover:bg-red-500/30 group-hover:scale-105 transition-all duration-300`}
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                    </div>
                    {!isCollapsed && (
                        <span>
                            {logoutMutation.isPending
                                ? "Signing out..."
                                : "Logout"}
                        </span>
                    )}
                </button>
            </div>
        </nav>
    );
};

export default Sidebar;