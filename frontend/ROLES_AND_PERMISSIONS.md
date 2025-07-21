# Roles and Permissions System

This document describes the comprehensive role-based access control (RBAC) system implemented in the StockFlow Pro frontend application.

## Overview

The system provides fine-grained access control through:
- **Role-based permissions**: Users are assigned roles that determine their capabilities
- **Permission-based components**: UI elements that show/hide based on user permissions
- **Route protection**: Pages that require specific permissions to access
- **Conditional rendering**: Content that appears based on user roles and permissions

## User Roles

### 1. User (Role ID: 2)
- **Description**: Standard user with basic system access
- **Capabilities**: 
  - View products
  - Edit own profile
  - View basic reports
- **Typical Use Case**: Regular employees who need to view product information

### 2. Manager (Role ID: 3)
- **Description**: Manager with elevated privileges including reporting access
- **Capabilities**:
  - All User permissions
  - Manage products (create, edit, update stock)
  - Manage invoices (create, edit, view all)
  - View user reports
  - Export data
  - Generate reports
- **Typical Use Case**: Department managers who need to manage inventory and invoices

### 3. Admin (Role ID: 1)
- **Description**: Administrator with full system access and user management capabilities
- **Capabilities**:
  - All Manager permissions
  - Full user management (create, edit, delete users)
  - System administration (admin panel, settings, logs)
  - Data management (backup, restore, import)
  - Advanced reporting and scheduling
- **Typical Use Case**: System administrators and IT staff

## Permission Categories

### User Management (`users.*`)
- `users.view` - View user profiles
- `users.create` - Create new users
- `users.edit` - Edit user information
- `users.delete` - Delete users
- `users.view_all` - View all users in the system
- `users.manage_roles` - Assign and modify user roles
- `users.view_reports` - View user-related reports

### Product Management (`product.*`)
- `product.view` - View product information
- `product.create` - Create new products
- `product.edit` - Edit product details
- `product.delete` - Delete products
- `product.update_stock` - Update product stock levels
- `product.view_reports` - View product reports

### Invoice Management (`invoice.*`)
- `invoice.view` - View invoices
- `invoice.create` - Create new invoices
- `invoice.edit` - Edit invoice details
- `invoice.delete` - Delete invoices
- `invoice.view_all` - View all invoices in the system
- `invoice.manage_items` - Manage invoice line items

### System Administration (`system.*`)
- `system.view_admin_panel` - Access admin panel
- `system.manage_settings` - Modify system settings
- `system.view_logs` - View system logs
- `system.sync_data` - Perform data synchronization
- `system.view_statistics` - View system statistics

### Data Management (`data.*`)
- `data.export` - Export data
- `data.import` - Import data
- `data.backup` - Create system backups
- `data.restore` - Restore from backups

### Reports (`reports.*`)
- `reports.view_basic` - View basic reports
- `reports.view_advanced` - View advanced reports
- `reports.generate` - Generate custom reports
- `reports.schedule` - Schedule automated reports

## Components

### Authentication Components

#### `<ProtectedRoute>`
Protects routes that require authentication.
```tsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

#### `<PermissionRoute>`
Protects routes that require specific permissions.
```tsx
<PermissionRoute permission={Permissions.Users.ViewAll}>
  <Users />
</PermissionRoute>
```

#### `<Permission>`
Conditionally renders content based on permissions.
```tsx
<Permission permission={Permissions.Users.Create}>
  <CreateUserButton />
</Permission>

<Permission 
  permissions={[Permissions.Reports.ViewAdvanced, Permissions.Reports.Generate]}
  requireAll={true}
>
  <AdvancedReportSection />
</Permission>
```

#### `<RoleGuard>`
Conditionally renders content based on user roles.
```tsx
<RoleGuard allowedRoles={[UserRole.Admin]}>
  <AdminOnlyContent />
</RoleGuard>

<RoleGuard allowedRoles={[UserRole.Manager, UserRole.Admin]}>
  <ManagerAndAdminContent />
</RoleGuard>
```

#### `<PermissionButton>`
Button that's enabled/disabled based on permissions.
```tsx
<PermissionButton
  permission={Permissions.Users.Create}
  className="btn btn-primary"
>
  Create User
</PermissionButton>
```

#### `<UserRoleBadge>`
Displays user role as a styled badge.
```tsx
<UserRoleBadge role={UserRole.Admin} size="md" showIcon={true} />
```

#### `<RoleBasedNavigation>`
Navigation component that shows/hides items based on permissions.
```tsx
<RoleBasedNavigation className="sidebar-nav" />
```

#### `<PermissionTable>`
Displays a comprehensive permissions matrix.
```tsx
<PermissionTable className="permissions-overview" />
```

#### `<AccessDenied>`
Shows access denied message with optional back button.
```tsx
<AccessDenied 
  message="You don't have permission to access this resource."
  showBackButton={true}
  backTo="/dashboard"
/>
```

### Hooks

#### `usePermissions()`
Hook for checking user permissions and roles.
```tsx
const {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
  getUserPermissions,
  userRole,
  user,
  isAdmin,
  isManager,
  isUser,
  canManageUsers,
  canAccessAdminPanel
} = usePermissions();

// Check single permission
if (hasPermission(Permissions.Users.Create)) {
  // Show create user button
}

// Check multiple permissions (ANY)
if (hasAnyPermission([Permissions.Users.Edit, Permissions.Users.Delete])) {
  // Show user actions
}

// Check multiple permissions (ALL)
if (hasAllPermissions([Permissions.Reports.ViewAdvanced, Permissions.Reports.Generate])) {
  // Show advanced report generation
}

// Check roles
if (isAdmin()) {
  // Admin-specific logic
}
```

#### `useAuth()`
Hook for authentication context.
```tsx
const {
  user,
  isAuthenticated,
  isLoading,
  login,
  logout,
  hasPermission,
  hasRole,
  refreshUser
} = useAuth();
```

## Usage Examples

### Route Protection
```tsx
// Protect entire route
<Route 
  path="admin" 
  element={
    <PermissionRoute permission={Permissions.System.ViewAdminPanel}>
      <AdminPanel />
    </PermissionRoute>
  } 
/>
```

### Conditional UI Elements
```tsx
function UserManagement() {
  return (
    <div>
      <h1>Users</h1>
      
      {/* Show create button only to users with create permission */}
      <Permission permission={Permissions.Users.Create}>
        <button onClick={createUser}>Create User</button>
      </Permission>
      
      {/* Show different content based on role */}
      <RoleGuard allowedRoles={[UserRole.Admin]}>
        <AdminUserControls />
      </RoleGuard>
      
      <RoleGuard allowedRoles={[UserRole.Manager, UserRole.Admin]}>
        <ManagerUserControls />
      </RoleGuard>
    </div>
  );
}
```

### Permission-based Buttons
```tsx
function ProductActions({ productId }) {
  return (
    <div className="action-buttons">
      <PermissionButton
        permission={Permissions.Product.EditProducts}
        onClick={() => editProduct(productId)}
        className="btn btn-primary"
      >
        Edit Product
      </PermissionButton>
      
      <PermissionButton
        permission={Permissions.Product.DeleteProducts}
        onClick={() => deleteProduct(productId)}
        className="btn btn-danger"
        disabledMessage="You don't have permission to delete products"
      >
        Delete Product
      </PermissionButton>
    </div>
  );
}
```

### Navigation with Permissions
```tsx
function Sidebar() {
  return (
    <nav>
      <RoleBasedNavigation />
    </nav>
  );
}
```

## Demo Page

Visit `/permissions-demo` to see all the role and permission features in action. This page demonstrates:
- Current user information and role
- Permission-based conditional rendering
- Role-based guards
- Permission buttons
- User permissions list
- Complete permissions matrix

## Integration with Backend

The frontend permissions system mirrors the backend implementation:
- Role definitions match the backend `UserRole` enum
- Permission strings match the backend `Permissions` class
- Role-permission mappings are synchronized between frontend and backend

## Best Practices

1. **Use Permission Components**: Always use `<Permission>` or `<PermissionRoute>` instead of manual permission checks in JSX
2. **Centralized Permissions**: Keep all permission strings in the `Permissions` constant object
3. **Fallback Content**: Provide meaningful fallback content for users without permissions
4. **Role Hierarchy**: Consider using role hierarchy instead of exact role matching when appropriate
5. **Loading States**: Handle loading states when checking permissions
6. **Error Boundaries**: Implement error boundaries around permission-protected content

## Security Notes

- **Frontend permissions are for UX only**: Always validate permissions on the backend
- **Route protection**: Use `<PermissionRoute>` for sensitive pages
- **API calls**: Ensure API endpoints validate permissions server-side
- **Token validation**: Implement proper token validation and refresh logic

## Testing

Test different user roles by logging in with these demo credentials:
- **Admin**: admin@stockflow.com / admin123
- **Manager**: manager@stockflow.com / manager123  
- **User**: user@stockflow.com / user123

Each role will show different UI elements and have access to different features based on their permissions.