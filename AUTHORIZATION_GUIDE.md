# StockFlow Pro - Role-Based Authorization System

## Overview

This document describes the comprehensive role-based authorization system implemented in StockFlow Pro. The system provides fine-grained permission control while maintaining backward compatibility with existing role-based checks.

## User Roles

### 1. **User** (Role = 2)
- **Description**: Standard users with basic system access
- **Permissions**:
  - View their own profile
  - Edit their own profile
  - View basic reports

### 2. **Manager** (Role = 3)
- **Description**: Managers with elevated privileges including reporting access
- **Permissions**:
  - All User permissions
  - View all users
  - View user reports
  - View system statistics
  - View basic and advanced reports
  - Generate reports
  - Export data

### 3. **Admin** (Role = 1)
- **Description**: Administrators with full system access and user management capabilities
- **Permissions**:
  - All Manager permissions
  - Create users
  - Delete users
  - Manage user roles
  - View admin panel
  - Manage system settings
  - View system logs
  - Sync data sources
  - Import/export/backup/restore data
  - Schedule reports

## Permission Categories

### User Management
- `users.view` - View user profiles
- `users.create` - Create new users
- `users.edit` - Edit user information
- `users.delete` - Delete users
- `users.view_all` - View all users in the system
- `users.manage_roles` - Change user roles
- `users.view_reports` - View user-related reports

### System Administration
- `system.view_admin_panel` - Access admin panel
- `system.manage_settings` - Modify system settings
- `system.view_logs` - View system logs
- `system.sync_data` - Synchronize data sources
- `system.view_statistics` - View system statistics

### Data Management
- `data.export` - Export data
- `data.import` - Import data
- `data.backup` - Create backups
- `data.restore` - Restore from backups

### Reporting
- `reports.view_basic` - View basic reports
- `reports.view_advanced` - View advanced reports
- `reports.generate` - Generate custom reports
- `reports.schedule` - Schedule automated reports

## Implementation

### 1. Permission-Based Authorization

#### Using Attributes
```csharp
[Permission(Permissions.Users.Create)]
public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto createUserDto)
{
    // Only users with users.create permission can access this
}

[AnyPermission(Permissions.Users.View, Permissions.Users.ViewAll)]
public async Task<ActionResult<UserDto>> GetUser(Guid id)
{
    // Users with either permission can access this
}
```

#### Using Extension Methods in Views
```html
@if (User.HasPermission(Permissions.Users.Create))
{
    <button class="btn btn-primary">Create User</button>
}

@if (User.IsAdmin())
{
    <a href="/AdminPanel">Admin Panel</a>
}
```

#### Using Authorization Service
```csharp
public class SomeController : ControllerBase
{
    private readonly IAuthorizationService _authService;
    
    public SomeController(IAuthorizationService authService)
    {
        _authService = authService;
    }
    
    public IActionResult SomeAction()
    {
        if (_authService.HasPermission(User, Permissions.Users.Create))
        {
            // User has permission
        }
    }
}
```

### 2. Role-Based Navigation

The navigation system automatically shows/hides menu items based on user permissions:

- **Dashboard**: Available to all authenticated users
- **Admin Panel**: Only visible to users with `system.view_admin_panel` permission
- **Manage Users**: Only visible to users with `users.view_all` permission
- **Reports**: Dropdown with items based on reporting permissions

### 3. User Profile Access Control

Users can only access their own profile data unless they have elevated permissions:

```csharp
// Check if user can access another user's data
if (!User.CanAccessUser(targetUserId) && !User.HasPermission(Permissions.Users.ViewAll))
{
    return Forbid("You can only access your own user information.");
}
```

## Security Features

### 1. **Automatic Permission Checking**
- All API endpoints are protected with permission-based authorization
- UI elements are automatically hidden based on user permissions
- Navigation is role-aware

### 2. **Granular Access Control**
- Users can only edit their own profiles (unless they're admins)
- Managers can view all users but cannot delete them
- Only admins can create, delete, and manage user roles

### 3. **Secure Session Management**
- 8-hour session timeout with sliding expiration
- Automatic logout on browser close
- Session validation on each request

## Usage Examples

### 1. **Controller Authorization**
```csharp
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    [HttpGet]
    [Permission(Permissions.Users.ViewAll)]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
    {
        // Only managers and admins can access this
    }
    
    [HttpPost]
    [Permission(Permissions.Users.Create)]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto dto)
    {
        // Only admins can create users
    }
}
```

### 2. **Page Authorization**
```csharp
[RoleAuthorize(UserRole.Admin, UserRole.Manager)]
public class AdminPanelModel : PageModel
{
    // Only admins and managers can access this page
}
```

### 3. **Conditional UI Rendering**
```html
@if (User.HasPermission(Permissions.Users.Create))
{
    <div class="admin-section">
        <h3>User Management</h3>
        <button class="btn btn-primary" onclick="createUser()">Create New User</button>
    </div>
}

@if (User.IsManager() || User.IsAdmin())
{
    <div class="reports-section">
        <h3>Reports</h3>
        <!-- Manager and Admin content -->
    </div>
}
```

## Migration from Role-Based to Permission-Based

The system maintains backward compatibility:

### Old Way (Still Supported)
```csharp
[Authorize(Roles = "Admin,Manager")]
public IActionResult SomeAction() { }
```

### New Way (Recommended)
```csharp
[Permission(Permissions.Users.ViewAll)]
public IActionResult SomeAction() { }
```

## Testing Authorization

### 1. **Unit Testing**
```csharp
[Test]
public void User_ShouldNotHave_AdminPermissions()
{
    var userRole = UserRole.User;
    var hasAdminPermission = RolePermissions.HasPermission(userRole, Permissions.System.ViewAdminPanel);
    Assert.False(hasAdminPermission);
}
```

### 2. **Integration Testing**
```csharp
[Test]
public async Task CreateUser_WithoutPermission_ShouldReturn403()
{
    // Arrange: Login as regular user
    await LoginAsUser();
    
    // Act: Try to create user
    var response = await Client.PostAsync("/api/users", content);
    
    // Assert: Should be forbidden
    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
}
```

## Best Practices

### 1. **Use Permission-Based Authorization**
- Prefer `[Permission]` attributes over `[Authorize(Roles)]`
- Use specific permissions rather than broad role checks
- Check permissions at both API and UI levels

### 2. **Principle of Least Privilege**
- Grant users only the minimum permissions needed
- Regularly review and audit user permissions
- Use role hierarchy (User < Manager < Admin)

### 3. **Consistent Authorization**
- Apply authorization at all entry points (API, UI, direct access)
- Use the same permission checks across different components
- Document permission requirements for each feature

### 4. **Error Handling**
- Return appropriate HTTP status codes (401, 403)
- Provide clear error messages
- Log authorization failures for security monitoring

## Troubleshooting

### Common Issues

1. **User sees "Access Denied" page**
   - Check if user has required permissions
   - Verify user role is correctly set
   - Ensure permission mapping is correct

2. **Navigation items not showing**
   - Check permission requirements in layout
   - Verify user claims are properly set
   - Ensure authorization extensions are imported

3. **API returns 403 Forbidden**
   - Verify permission attribute on controller action
   - Check if user has required permission
   - Ensure authorization policies are registered

### Debugging

1. **Check User Claims**
```csharp
var userRole = User.GetUserRole();
var permissions = User.GetUserPermissions();
// Log or debug these values
```

2. **Verify Permission Mapping**
```csharp
var hasPermission = RolePermissions.HasPermission(UserRole.Manager, Permissions.Users.ViewAll);
// Should return true for managers
```

## Future Enhancements

1. **Dynamic Permissions**: Allow runtime permission assignment
2. **Permission Groups**: Group related permissions for easier management
3. **Audit Trail**: Track permission changes and access attempts
4. **External Authorization**: Integration with external identity providers
5. **Resource-Based Authorization**: Permissions based on specific resources

---

This authorization system provides a robust, scalable foundation for managing user access in StockFlow Pro while maintaining flexibility for future enhancements.