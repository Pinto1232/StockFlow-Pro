import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  FolderOpen, 
  CheckSquare, 
  Users, 
  DollarSign, 
  CreditCard, 
  FileText, 
  User, 
  Calendar, 
  Banknote, 
  CalendarX, 
  BarChart3,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { useLogout, useCurrentUser } from '../../hooks/useAuth';
import { UserRole } from '../../types/index';

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
};

const Sidebar: React.FC = () => {
  const { data: currentUser } = useCurrentUser();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigationItems: NavigationItem[] = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: Home,
      roles: [UserRole.Admin, UserRole.Manager, UserRole.User],
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: FolderOpen,
      roles: [UserRole.Admin, UserRole.Manager, UserRole.User],
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: CheckSquare,
      roles: [UserRole.Admin, UserRole.Manager, UserRole.User],
    },
    {
      name: 'Team',
      href: '/team',
      icon: Users,
      roles: [UserRole.Admin, UserRole.Manager],
    },
    {
      name: 'Income',
      href: '/income',
      icon: DollarSign,
      roles: [UserRole.Admin, UserRole.Manager],
    },
    {
      name: 'Expenses',
      href: '/expenses',
      icon: CreditCard,
      roles: [UserRole.Admin, UserRole.Manager],
    },
    {
      name: 'Invoices',
      href: '/invoices',
      icon: FileText,
      roles: [UserRole.Admin, UserRole.Manager],
    },
    {
      name: 'Employees',
      href: '/employees',
      icon: User,
      roles: [UserRole.Admin, UserRole.Manager],
    },
    {
      name: 'Attendance',
      href: '/attendance',
      icon: Calendar,
      roles: [UserRole.Admin, UserRole.Manager],
    },
    {
      name: 'Payroll',
      href: '/payroll',
      icon: Banknote,
      roles: [UserRole.Admin, UserRole.Manager],
    },
    {
      name: 'Leaves',
      href: '/leaves',
      icon: CalendarX,
      roles: [UserRole.Admin, UserRole.Manager],
    },
  ];

  const filteredNavigation = navigationItems.filter((item) =>
    currentUser ? item.roles.includes(currentUser.role) : false
  );

  return (
    <nav className="h-full bg-white border-r border-gray-200 flex flex-col" aria-label="Dashboard navigation" role="navigation">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SF</span>
          </div>
          <h5 className="font-semibold text-gray-900">Dashboard</h5>
        </div>
      </div>
      
      {/* User Info */}
      {currentUser && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
                </span>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{currentUser.fullName}</p>
              <p className="text-xs text-gray-500 capitalize">{currentUser.role.toString().toLowerCase()}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
          
          {/* Reports Submenu */}
          {currentUser && (currentUser.role === UserRole.Admin || currentUser.role === UserRole.Manager) && (
            <div className="pt-2">
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reports</p>
              </div>
              <button
                type="button"
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <BarChart3 className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="truncate">Analytics</span>
              </button>
            </div>
          )}
        </nav>
      </div>
      
      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors">
          <HelpCircle className="h-5 w-5 mr-3 flex-shrink-0" />
          <span>Help & Support</span>
        </button>
        
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-700 rounded-lg hover:bg-red-50 hover:text-red-900 transition-colors disabled:opacity-50"
        >
          <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
          <span>{logoutMutation.isPending ? 'Signing out...' : 'Logout'}</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;