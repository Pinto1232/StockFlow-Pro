import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  Settings,
  User,
  LogOut,
} from 'lucide-react';
import { useLogout, useCurrentUser } from '../../hooks/useAuth';
import { UserRole } from '../../types/index';

const Sidebar: React.FC = () => {
  const { data: currentUser } = useCurrentUser();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: [UserRole.Admin, UserRole.Manager, UserRole.User],
    },
    {
      name: 'Products',
      href: '/products',
      icon: Package,
      roles: [UserRole.Admin, UserRole.Manager, UserRole.User],
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      roles: [UserRole.Admin, UserRole.Manager],
    },
    {
      name: 'Invoices',
      href: '/invoices',
      icon: FileText,
      roles: [UserRole.Admin, UserRole.Manager],
    },
  ];

  const filteredNavigation = navigationItems.filter((item) =>
    currentUser ? item.roles.includes(currentUser.role) : false
  );

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
        <h1 className="text-xl font-bold text-white">StockFlow Pro</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="space-y-2">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <User className="w-5 h-5 mr-3" />
            Profile
          </NavLink>
          
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </NavLink>
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-5 h-5 mr-3" />
            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
          </button>
        </div>

        {/* User info */}
        {currentUser && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {currentUser.firstName.charAt(0)}
                    {currentUser.lastName.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {currentUser.fullName}
                </p>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;