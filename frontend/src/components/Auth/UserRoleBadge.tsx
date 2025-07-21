import React from 'react';
import { UserRole } from '../../types/index';
import { 
  ShieldCheckIcon, 
  UserGroupIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';

interface UserRoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

/**
 * Component to display user role as a styled badge
 */
const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ 
  role, 
  size = 'md',
  showIcon = true,
  className = '' 
}) => {
  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case UserRole.Admin:
        return {
          label: 'Administrator',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: ShieldCheckIcon,
        };
      case UserRole.Manager:
        return {
          label: 'Manager',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: UserGroupIcon,
        };
      case UserRole.User:
        return {
          label: 'User',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: UserIcon,
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: UserIcon,
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      case 'md':
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const getIconSize = (size: string) => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3';
      case 'lg':
        return 'h-5 w-5';
      case 'md':
      default:
        return 'h-4 w-4';
    }
  };

  const config = getRoleConfig(role);
  const sizeClasses = getSizeClasses(size);
  const iconSizeClasses = getIconSize(size);
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${config.color} ${sizeClasses} ${className}
      `}
    >
      {showIcon && (
        <Icon className={`${iconSizeClasses} mr-1`} />
      )}
      {config.label}
    </span>
  );
};

export default UserRoleBadge;