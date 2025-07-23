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

interface SidebarProps {
  isCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false }) => {
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
    <nav 
      className="h-full flex flex-col bg-gradient-to-br from-primary-600 to-secondary-600 text-white shadow-2xl" 
      style={{
        background: 'linear-gradient(135deg, #5a5cdb 0%, #7f53ac 100%)'
      }}
      aria-label="Dashboard navigation" 
      role="navigation"
    >
      {/* Sidebar Header */}
      <div className={`p-6 border-b border-white/10 bg-white/5 ${isCollapsed ? 'px-4' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
            <span className="text-white font-bold text-lg">SF</span>
          </div>
          {!isCollapsed && (
            <div>
              <h5 className="font-bold text-white text-lg tracking-wide">StockFlow</h5>
              <p className="text-white/70 text-xs font-medium">Pro Dashboard</p>
            </div>
          )}
        </div>
      </div>

      
            
      {/* Sidebar Content */}
      <div className={`flex-1 overflow-y-auto py-2 scrollbar-hide ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <nav className="space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'} text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                    isActive
                      ? 'bg-white/15 text-white font-semibold shadow-lg transform translate-x-1'
                      : 'text-white/85 hover:bg-white/10 hover:text-white hover:transform hover:translate-x-1'
                  }`
                }
                title={isCollapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCollapsed ? '' : 'mr-3'} transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/20 shadow-md transform scale-110' 
                        : 'bg-white/10 group-hover:bg-white/20 group-hover:scale-105'
                    }`}>
                      <Icon className="h-5 w-5 flex-shrink-0" />
                    </div>
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                    {isActive && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white"></div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
          
          {/* Reports Submenu */}
          {currentUser && (currentUser.role === UserRole.Admin || currentUser.role === UserRole.Manager) && !isCollapsed && (
            <div className="pt-6">
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Reports & Analytics</p>
              </div>
              <button
                type="button"
                className="group flex items-center w-full px-4 py-3 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white transition-all duration-300 hover:transform hover:translate-x-1"
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mr-3 group-hover:bg-white/20 group-hover:scale-105 transition-all duration-300">
                  <BarChart3 className="h-5 w-5 flex-shrink-0" />
                </div>
                <span className="truncate">Analytics</span>
              </button>
            </div>
          )}

          {/* Collapsed Analytics Button */}
          {currentUser && (currentUser.role === UserRole.Admin || currentUser.role === UserRole.Manager) && isCollapsed && (
            <div className="pt-6">
              <button
                type="button"
                className="group flex items-center justify-center w-full px-3 py-3 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white transition-all duration-300"
                title="Analytics"
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 group-hover:scale-105 transition-all duration-300">
                  <BarChart3 className="h-5 w-5 flex-shrink-0" />
                </div>
              </button>
            </div>
          )}
        </nav>
      </div>
      
      {/* Sidebar Footer */}
      <div className={`p-4 border-t border-white/10 space-y-2 bg-white/5 ${isCollapsed ? 'px-2' : ''}`}>
        <button 
          className={`group flex items-center w-full ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'} text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white transition-all duration-300 hover:transform hover:translate-x-1`}
          title={isCollapsed ? "Help & Support" : undefined}
        >
          <div className={`w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center ${isCollapsed ? '' : 'mr-3'} group-hover:bg-white/20 group-hover:scale-105 transition-all duration-300`}>
            <HelpCircle className="h-5 w-5 flex-shrink-0" />
          </div>
          {!isCollapsed && <span>Help & Support</span>}
        </button>
        
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className={`group flex items-center w-full ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'} text-sm font-medium text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-all duration-300 disabled:opacity-50 hover:transform hover:translate-x-1`}
          title={isCollapsed ? (logoutMutation.isPending ? 'Signing out...' : 'Logout') : undefined}
        >
          <div className={`w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center ${isCollapsed ? '' : 'mr-3'} group-hover:bg-red-500/30 group-hover:scale-105 transition-all duration-300`}>
            <LogOut className="h-5 w-5 flex-shrink-0" />
          </div>
          {!isCollapsed && <span>{logoutMutation.isPending ? 'Signing out...' : 'Logout'}</span>}
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;