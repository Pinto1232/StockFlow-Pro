import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
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
  Home,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useCurrentUser, useLogout } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { Permissions } from '../../utils/permissions';
import { getRoleName } from '../../services/authService';
import ConnectionStatus from '../SignalR/ConnectionStatus';
import '../../styles/dropdown.css';

interface NavbarProps {
  onMobileSidebarToggle?: () => void;
  onSidebarToggle?: () => void;
  isSidebarCollapsed?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onMobileSidebarToggle,
  onSidebarToggle,
  isSidebarCollapsed = false
}) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: currentUser } = useCurrentUser();
  const { hasPermission } = usePermissions();
  const logoutMutation = useLogout();
  const location = useLocation();
  const navigate = useNavigate();
  
  const userDropdownRef = useRef<HTMLDivElement>(null);

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
      
      // Close dropdowns with Escape
      if (event.key === 'Escape') {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasPermission, navigate, handleLogout]);

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
      <nav className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">
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
    <nav 
      className="w-full shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, #5a5cdb 0%, #7f53ac 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Brand and Navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button
                onClick={onSidebarToggle}
                className="group flex items-center justify-center p-2 text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded-xl transition-all duration-300 hover:bg-white/10"
                aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-white/20 group-hover:scale-105 transition-all duration-300">
                  {isSidebarCollapsed ? (
                    <PanelLeftOpen className="h-5 w-5" />
                  ) : (
                    <PanelLeftClose className="h-5 w-5" />
                  )}
                </div>
              </button>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-2">
              {navigationItems.filter(item => item.show).map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-white/15 text-white font-semibold shadow-lg'
                        : 'text-white/85 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-2 transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/20 shadow-md transform scale-110' 
                        : 'bg-white/10 group-hover:bg-white/20 group-hover:scale-105'
                    }`}>
                      <Icon className="h-4 w-4 flex-shrink-0" />
                    </div>
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
                <Search className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full h-10 pl-10 pr-3 py-0 text-sm leading-10 border border-gray-300 rounded-xl bg-white placeholder-gray-500 text-black focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Right side - SignalR Status, Notifications, User Menu */}
          <div className="flex items-center space-x-3">
            {/* SignalR Connection Status */}
            <div className="hidden md:flex">
              <ConnectionStatus />
            </div>

            {/* Notifications */}
            <button className="group flex items-center justify-center p-2 text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded-xl transition-all duration-300 hover:bg-white/10">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-white/20 group-hover:scale-105 transition-all duration-300">
                <Bell className="h-5 w-5" />
              </div>
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="group flex items-center space-x-3 px-3 py-2 rounded-xl text-white/85 hover:text-white hover:bg-white/10 transition-all duration-300"
                aria-expanded={isUserDropdownOpen}
                aria-haspopup="true"
                aria-label={`User account menu for ${currentUser.fullName}`}
                title="Click to open account menu"
              >
                <div className="user-avatar-wrapper">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                    <span className="text-sm font-medium text-white">
                      {currentUser.firstName?.charAt(0) || 'U'}{currentUser.lastName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="user-info-wrapper hidden lg:block">
                  <span className="user-name block text-sm font-semibold">{currentUser.fullName || currentUser.email || 'User'}</span>
                  <span className="user-role-badge block text-xs text-white/70">{getRoleName(currentUser.role)}</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-white/60 transition-transform duration-300 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className="user-dropdown-menu animate-dropdown-fade-in">
                  {/* User Info Header */}
                  <div className="account-header">
                    <div className="account-avatar">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {currentUser.firstName?.charAt(0) || 'U'}{currentUser.lastName?.charAt(0) || 'U'}
                        </span></div>
                    </div>
                    <div className="account-details">
                      <h6 className="account-name">{currentUser.fullName || currentUser.email || 'User'}</h6>
                      <p className="account-email">{currentUser.email}</p>
                      {/* <span className="account-role-tag">{getRoleName(currentUser.role)}</span> */}
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

            {/* Mobile sidebar toggle button */}
            <button
              onClick={onMobileSidebarToggle}
              className="lg:hidden group flex items-center justify-center p-2 text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded-xl transition-all duration-300 hover:bg-white/10"
              aria-label="Toggle sidebar"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-white/20 group-hover:scale-105 transition-all duration-300">
                <Menu className="h-6 w-6" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;