import { UserRole } from '../types/index';

/**
 * Defines all permissions available in the StockFlow Pro system.
 */
export const Permissions = {
  Users: {
    View: 'users.view',
    Create: 'users.create',
    Edit: 'users.edit',
    Delete: 'users.delete',
    ViewAll: 'users.view_all',
    ManageRoles: 'users.manage_roles',
    ViewReports: 'users.view_reports',
  },
  System: {
    ViewAdminPanel: 'system.view_admin_panel',
    ManageSettings: 'system.manage_settings',
    ViewLogs: 'system.view_logs',
    SyncData: 'system.sync_data',
    ViewStatistics: 'system.view_statistics',
  },
  Data: {
    Export: 'data.export',
    Import: 'data.import',
    Backup: 'data.backup',
    Restore: 'data.restore',
  },
  Invoice: {
    ViewInvoices: 'invoice.view',
    CreateInvoices: 'invoice.create',
    EditInvoices: 'invoice.edit',
    DeleteInvoices: 'invoice.delete',
    ViewAllInvoices: 'invoice.view_all',
    ManageInvoiceItems: 'invoice.manage_items',
  },
  Product: {
    ViewProducts: 'product.view',
    CreateProducts: 'product.create',
    EditProducts: 'product.edit',
    DeleteProducts: 'product.delete',
    UpdateStock: 'product.update_stock',
    ViewReports: 'product.view_reports',
  },
  Reports: {
    ViewBasic: 'reports.view_basic',
    ViewAdvanced: 'reports.view_advanced',
    Generate: 'reports.generate',
    Schedule: 'reports.schedule',
  },
} as const;

/**
 * Maps user roles to their permissions
 */
const rolePermissions: Record<UserRole, Set<string>> = {
  [UserRole.User]: new Set([
    Permissions.Users.View,
    Permissions.Users.Edit,
    Permissions.Product.ViewProducts,
    Permissions.Reports.ViewBasic,
  ]),
  [UserRole.Manager]: new Set([
    // Manager inherits all User permissions plus additional ones
    Permissions.Users.View,
    Permissions.Users.Edit,
    Permissions.Users.ViewAll,
    Permissions.Users.ViewReports,
    
    // Product permissions
    Permissions.Product.ViewProducts,
    Permissions.Product.CreateProducts,
    Permissions.Product.EditProducts,
    Permissions.Product.UpdateStock,
    Permissions.Product.ViewReports,
    
    // Invoice permissions
    Permissions.Invoice.ViewInvoices,
    Permissions.Invoice.CreateInvoices,
    Permissions.Invoice.EditInvoices,
    Permissions.Invoice.ViewAllInvoices,
    Permissions.Invoice.ManageInvoiceItems,
    
    // Manager-specific permissions
    Permissions.System.ViewStatistics,
    Permissions.Reports.ViewBasic,
    Permissions.Reports.ViewAdvanced,
    Permissions.Reports.Generate,
    Permissions.Data.Export,
  ]),
  [UserRole.Supervisor]: new Set([
    // Supervisor inherits all Manager permissions plus additional ones
    Permissions.Users.View,
    Permissions.Users.Create,
    Permissions.Users.Edit,
    Permissions.Users.ViewAll,
    Permissions.Users.ViewReports,
    
    // Product permissions
    Permissions.Product.ViewProducts,
    Permissions.Product.CreateProducts,
    Permissions.Product.EditProducts,
    Permissions.Product.DeleteProducts,
    Permissions.Product.UpdateStock,
    Permissions.Product.ViewReports,
    
    // Invoice permissions
    Permissions.Invoice.ViewInvoices,
    Permissions.Invoice.CreateInvoices,
    Permissions.Invoice.EditInvoices,
    Permissions.Invoice.DeleteInvoices,
    Permissions.Invoice.ViewAllInvoices,
    Permissions.Invoice.ManageInvoiceItems,
    
    // Supervisor-specific permissions
    Permissions.System.ViewStatistics,
    Permissions.System.ViewLogs,
    Permissions.Reports.ViewBasic,
    Permissions.Reports.ViewAdvanced,
    Permissions.Reports.Generate,
    Permissions.Data.Export,
    Permissions.Data.Import,
  ]),
  [UserRole.Admin]: new Set([
    // Admin has all permissions
    Permissions.Users.View,
    Permissions.Users.Create,
    Permissions.Users.Edit,
    Permissions.Users.Delete,
    Permissions.Users.ViewAll,
    Permissions.Users.ManageRoles,
    Permissions.Users.ViewReports,
    
    // Product permissions
    Permissions.Product.ViewProducts,
    Permissions.Product.CreateProducts,
    Permissions.Product.EditProducts,
    Permissions.Product.DeleteProducts,
    Permissions.Product.UpdateStock,
    Permissions.Product.ViewReports,
    
    // Invoice permissions
    Permissions.Invoice.ViewInvoices,
    Permissions.Invoice.CreateInvoices,
    Permissions.Invoice.EditInvoices,
    Permissions.Invoice.DeleteInvoices,
    Permissions.Invoice.ViewAllInvoices,
    Permissions.Invoice.ManageInvoiceItems,
    
    Permissions.System.ViewAdminPanel,
    Permissions.System.ManageSettings,
    Permissions.System.ViewLogs,
    Permissions.System.SyncData,
    Permissions.System.ViewStatistics,
    
    Permissions.Data.Export,
    Permissions.Data.Import,
    Permissions.Data.Backup,
    Permissions.Data.Restore,
    
    Permissions.Reports.ViewBasic,
    Permissions.Reports.ViewAdvanced,
    Permissions.Reports.Generate,
    Permissions.Reports.Schedule,
  ]),
};

/**
 * Gets all permissions for a specific role
 */
export const getPermissions = (role: UserRole): Set<string> => {
  return rolePermissions[role] || new Set();
};

/**
 * Checks if a role has a specific permission
 */
export const hasPermission = (role: UserRole, permission: string): boolean => {
  const permissions = rolePermissions[role];
  return permissions ? permissions.has(permission) : false;
};

/**
 * Checks if a role has any of the specified permissions
 */
export const hasAnyPermission = (role: UserRole, permissions: string[]): boolean => {
  return permissions.some(permission => hasPermission(role, permission));
};

/**
 * Checks if a role has all of the specified permissions
 */
export const hasAllPermissions = (role: UserRole, permissions: string[]): boolean => {
  return permissions.every(permission => hasPermission(role, permission));
};

/**
 * Gets all available permissions in the system
 */
export const getAllPermissions = (): string[] => {
  const allPermissions = new Set<string>();
  Object.values(rolePermissions).forEach(permissions => {
    permissions.forEach(permission => allPermissions.add(permission));
  });
  return Array.from(allPermissions);
};