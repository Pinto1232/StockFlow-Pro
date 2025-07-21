import { useCurrentUser } from './useAuth';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../utils/permissions';

/**
 * Hook for checking user permissions
 */
export const usePermissions = () => {
  const { data: currentUser } = useCurrentUser();

  const checkPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    return hasPermission(currentUser.role, permission);
  };

  const checkAnyPermission = (permissions: string[]): boolean => {
    if (!currentUser) return false;
    return hasAnyPermission(currentUser.role, permissions);
  };

  const checkAllPermissions = (permissions: string[]): boolean => {
    if (!currentUser) return false;
    return hasAllPermissions(currentUser.role, permissions);
  };

  return {
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    userRole: currentUser?.role,
  };
};