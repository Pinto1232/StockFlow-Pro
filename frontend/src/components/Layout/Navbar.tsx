import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Shield,
  RefreshCw,
  Package,
  FileText,
  Home
} from 'lucide-react';
import { useCurrentUser, useLogout } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { Permissions } from '../../utils/permissions';
import ConnectionStatus from '../SignalR/ConnectionStatus';
import '../../styles/dropdown.css';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: currentUser } = useCurrentUser();
  const { hasPermission } = usePermissions();
  const logoutMutation = useLogout();
  const location = useLocation();
  const navigate = useNavigate();
  
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Memoize handleLogout to prevent unnecessary re-renders
  const handleLogout = useCallback(() => {
    setIsUserDropdownOpen(false);
    logoutMutation.mutate();
  }, [logoutMutation]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case 'p':
            event.preventDefault();
            navigate('/profile');
            break;
          case 'a':
            if (hasPermission(Permissions.System.ViewAdminPanel)) {
              event.preventDefault();
              navigate('/admin');
            }
            break;
          case 'g':
            if (hasPermission(Permissions.System.ManageSettings)) {
              event.preventDefault();
              navigate('/settings');
            }
            break;
          case 's':
            if (hasPermission(Permissions.System.SyncData)) {
              event.preventDefault();
              navigate('/sync');
            }
            break;
          case 'l':
            event.preventDefault();
            handleLogout();
            break;
        }
      }
      
      // Close mobile menu with Escape
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasPermission, navigate, handleLogout]);

  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      show: true,
    },
    {
      name: 'Products',
      href: '/products',
      icon: Package,
      show: true,
    },
    {
      name: 'Invoices',
      href: '/invoices',
      icon: FileText,
      show: hasPermission(Permissions.Invoice.ViewInvoices),
    },
  ];

  const userMenuItems = [
    {
      name: 'Edit Profile',
      href: '/profile',
      icon: User,
      description: 'Update your personal information',
      shortcut: 'Ctrl+P',
      show: true,
    },
    {
      name: 'Account Sync',
      href: '/sync',
      icon: RefreshCw,
      description: 'Synchronize account data',
      shortcut: 'Ctrl+S',
      show: hasPermission(Permissions.System.SyncData),
    },
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: Shield,
      description: 'System overview and management',
      shortcut: 'Ctrl+A',
      show: hasPermission(Permissions.System.ViewAdminPanel),
      isAdmin: true,
    },
    {
      name: 'System Settings',
      href: '/settings',
      icon: Settings,
      description: 'Configure system preferences',
      shortcut: 'Ctrl+G',
      show: hasPermission(Permissions.System.ManageSettings),
      isAdmin: true,
    },
  ];

  if (!currentUser) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">
                StockFlowPro
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Brand and Navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold text-primary-600">StockFlowPro</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              {navigationItems.filter(item => item.show).map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Center - Search */}
          <div className="flex-1 items-center justify-center max-w-lg mx-4 hidden md:flex">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full h-10 pl-10 pr-3 py-0 text-sm leading-10 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Right side - SignalR Status, Notifications, User Menu */}
          <div className="flex items-center space-x-4">
            {/* SignalR Connection Status */}
            <div className="hidden md:flex">
              <ConnectionStatus />
            </div>

            {/* Notifications */}
            <button className="flex items-center justify-center p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="user-dropdown-trigger"
                aria-expanded={isUserDropdownOpen}
                aria-haspopup="true"
                aria-label={`User account menu for ${currentUser.fullName}`}
                title="Click to open account menu"
              >
                <div className="user-avatar-wrapper">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center user-avatar-icon">
                    <span className="text-sm font-medium text-white">
                      {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="online-indicator" title="Online"></div>
                </div>
                <div className="user-info-wrapper">
                  <span className="user-name">{currentUser.fullName}</span>
                  <span className="user-role-badge">{currentUser.role.toString()}</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className="user-dropdown-menu animate-dropdown-fade-in">
                  {/* User Info Header */}
                  <div className="account-header">
                    <div className="account-avatar">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="account-details">
                      <h6 className="account-name">{currentUser.fullName}</h6>
                      <p className="account-email">{currentUser.email}</p>
                      <span className="account-role-tag">{currentUser.role.toString()}</span>
                    </div>
                  </div>

                  <hr className="modern-dropdown-divider" />

                  {/* Menu Items */}
                  <div>
                    {userMenuItems.filter(item => item.show).map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsUserDropdownOpen(false)}
                          className={`user-menu-item ${item.isAdmin ? 'border-l-4 border-l-yellow-400' : ''}`}
                          role="menuitem"
                          tabIndex={0}
                          aria-label={item.description}
                        >
                          <div className={`item-icon ${item.isAdmin ? 'admin-icon' : ''}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="item-content">
                            <span className="item-title">{item.name}</span>
                            <span className="item-subtitle">{item.description}</span>
                          </div>
                          <div className="item-shortcut">
                            <kbd>{item.shortcut}</kbd>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <hr className="modern-dropdown-divider" />

                  {/* Logout */}
                  <div>
                    <button
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className={`user-menu-item logout-item ${logoutMutation.isPending ? 'loading' : ''}`}
                      role="menuitem"
                      tabIndex={0}
                      aria-label="Sign out of your account"
                    >
                      <div className="item-icon logout-icon">
                        <LogOut className="h-4 w-4" />
                      </div>
                      <div className="item-content">
                        <span className="item-title">
                          {logoutMutation.isPending ? 'Signing out...' : 'Logout'}
                        </span>
                        <span className="item-subtitle">Sign out of your account</span>
                      </div>
                      <div className="item-shortcut">
                        <kbd>Ctrl+L</kbd>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" ref={mobileMenuRef}>
          <div className="px-4 pt-4 pb-6 space-y-4 bg-white border-t border-gray-200 shadow-lg">
            {/* Mobile Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full h-10 pl-10 pr-3 py-0 text-sm leading-10 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Mobile SignalR Status */}
            <div className="flex justify-center py-2">
              <ConnectionStatus />
            </div>

            {/* Mobile Navigation Items */}
            <div className="space-y-1">
              {navigationItems.filter(item => item.show).map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={handleMobileNavClick}
                    className={`flex items-center px-3 py-3 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Mobile User Menu Items */}
            <div className="border-t border-gray-200 pt-4 space-y-1">
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account</p>
              </div>
              {userMenuItems.filter(item => item.show).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={handleMobileNavClick}
                    className={`flex items-center px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors ${
                      item.isAdmin ? 'border-l-4 border-l-yellow-400' : ''
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
              
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="flex items-center w-full px-3 py-3 rounded-md text-base font-medium text-red-700 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
                {logoutMutation.isPending ? 'Signing out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;