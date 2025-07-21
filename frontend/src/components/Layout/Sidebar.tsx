import React from 'react';
import { NavLink } from 'react-router-dom';
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
      name: 'Overview',
      href: '/dashboard',
      icon: 'fas fa-home',
      roles: [UserRole.Admin, UserRole.Manager, UserRole.User],
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: 'fas fa-project-diagram',
      roles: [UserRole.Admin, UserRole.Manager, UserRole.User],
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: 'fas fa-tasks',
      roles: [UserRole.Admin, UserRole.Manager, UserRole.User],
    },
    {
      name: 'Team',
      href: '/team',
      icon: 'fas fa-users',
      roles: [UserRole.Admin, UserRole.Manager],
    },
    {
      name: 'Income',
      href: '/income',
      icon: 'fas fa-dollar-sign',
      roles: [UserRole.Admin, UserRole.Manager],
    },
    {
      name: 'Expenses',
      href: '/expenses',
      icon: 'fas fa-credit-card',
      roles: [UserRole.Admin, UserRole.Manager],
    },
    {
      name: 'Invoices',
      href: '/invoices',
      icon: 'fas fa-file-invoice-dollar',
      roles: [UserRole.Admin, UserRole.Manager],
    },
    {
      name: 'Employees',
      href: '/employees',
      icon: 'fas fa-user-tie',
      roles: [UserRole.Admin, UserRole.Manager],
    },
    {
      name: 'Attendance',
      href: '/attendance',
      icon: 'fas fa-calendar-check',
      roles: [UserRole.Admin, UserRole.Manager],
    },
    {
      name: 'Payroll',
      href: '/payroll',
      icon: 'fas fa-money-check-alt',
      roles: [UserRole.Admin, UserRole.Manager],
    },
    {
      name: 'Leaves',
      href: '/leaves',
      icon: 'fas fa-calendar-times',
      roles: [UserRole.Admin, UserRole.Manager],
    },
  ];

  const filteredNavigation = navigationItems.filter((item) =>
    currentUser ? item.roles.includes(currentUser.role) : false
  );

  return (
    <nav className="sidebar-drawer" aria-label="Main navigation" role="navigation">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <i className="fas fa-cube brand-icon"></i>
          <h5 className="sidebar-title">StockFlow Pro</h5>
        </div>
      </div>
      
      {/* User Info */}
      {currentUser && (
        <div className="sidebar-user-info">
          <div className="user-avatar">
            <i className="fas fa-user-circle user-avatar-icon"></i>
            <div className="user-status-dot"></div>
          </div>
          <div className="user-details">
            <span className="user-name">{currentUser.fullName}</span>
            <span className="user-role">{currentUser.role}</span>
          </div>
        </div>
      )}
      
      {/* Sidebar Content */}
      <div className="sidebar-content">
        <ul className="sidebar-menu">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={() => ''}
            >
              {({ isActive }) => (
                <li className={`sidebar-menu-item ${isActive ? 'active' : ''}`}>
                  <div
                    className="sidebar-menu-link"
                    data-tooltip={item.name}
                  >
                    <div className="menu-icon">
                      <i className={item.icon}></i>
                    </div>
                    <span className="menu-text">{item.name}</span>
                    <div className="menu-indicator"></div>
                  </div>
                </li>
              )}
            </NavLink>
          ))}
          
          {/* Reports Submenu */}
          {currentUser && (currentUser.role === UserRole.Admin || currentUser.role === UserRole.Manager) && (
            <li className="sidebar-menu-item has-submenu">
              <button
                type="button"
                className="sidebar-menu-link"
                data-tooltip="Reports"
              >
                <div className="menu-icon">
                  <i className="fas fa-chart-bar"></i>
                </div>
                <span className="menu-text">Reports</span>
                <i className="fas fa-chevron-down submenu-arrow"></i>
              </button>
            </li>
          )}
        </ul>
        
        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-divider"></div>
          <div className="sidebar-help">
            <a href="#" className="help-link" data-tooltip="Help & Support">
              <i className="fas fa-question-circle"></i>
              <span>Help & Support</span>
            </a>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="help-link w-full text-left border-0 bg-transparent"
            disabled={logoutMutation.isPending}
            style={{ background: 'transparent', border: 'none' }}
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;