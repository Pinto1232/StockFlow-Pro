using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Web.Authorization;

/// <summary>
/// Defines all permissions available in the StockFlow Pro system.
/// </summary>
public static class Permissions
{
    /// <summary>
    /// User management permissions
    /// </summary>
    public static class Users
    {
        public const string View = "users.view";
        public const string Create = "users.create";
        public const string Edit = "users.edit";
        public const string Delete = "users.delete";
        public const string ViewAll = "users.view_all";
        public const string ManageRoles = "users.manage_roles";
        public const string ViewReports = "users.view_reports";
    }

    /// <summary>
    /// System administration permissions
    /// </summary>
    public static class System
    {
        public const string ViewAdminPanel = "system.view_admin_panel";
        public const string ManageSettings = "system.manage_settings";
        public const string ViewLogs = "system.view_logs";
        public const string SyncData = "system.sync_data";
        public const string ViewStatistics = "system.view_statistics";
    }

    /// <summary>
    /// Data management permissions
    /// </summary>
    public static class Data
    {
        public const string Export = "data.export";
        public const string Import = "data.import";
        public const string Backup = "data.backup";
        public const string Restore = "data.restore";
    }

    /// <summary>
    /// Reporting permissions
    /// </summary>
    public static class Reports
    {
        public const string ViewBasic = "reports.view_basic";
        public const string ViewAdvanced = "reports.view_advanced";
        public const string Generate = "reports.generate";
        public const string Schedule = "reports.schedule";
    }
}

/// <summary>
/// Maps user roles to their permissions
/// </summary>
public static class RolePermissions
{
    private static readonly Dictionary<UserRole, HashSet<string>> _rolePermissions = new()
    {
        [UserRole.User] = new HashSet<string>
        {
            // Basic user permissions
            Permissions.Users.View,
            Permissions.Users.Edit, // Can edit their own profile
            Permissions.Reports.ViewBasic
        },
        
        [UserRole.Manager] = new HashSet<string>
        {
            // Manager inherits all User permissions
            Permissions.Users.View,
            Permissions.Users.Edit,
            Permissions.Users.ViewAll,
            Permissions.Users.ViewReports,
            
            // Manager-specific permissions
            Permissions.System.ViewStatistics,
            Permissions.Reports.ViewBasic,
            Permissions.Reports.ViewAdvanced,
            Permissions.Reports.Generate,
            Permissions.Data.Export
        },
        
        [UserRole.Admin] = new HashSet<string>
        {
            // Admin has all permissions
            Permissions.Users.View,
            Permissions.Users.Create,
            Permissions.Users.Edit,
            Permissions.Users.Delete,
            Permissions.Users.ViewAll,
            Permissions.Users.ManageRoles,
            Permissions.Users.ViewReports,
            
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
            Permissions.Reports.Schedule
        }
    };

    /// <summary>
    /// Gets all permissions for a specific role
    /// </summary>
    public static HashSet<string> GetPermissions(UserRole role)
    {
        return _rolePermissions.TryGetValue(role, out var permissions) 
            ? permissions 
            : new HashSet<string>();
    }

    /// <summary>
    /// Checks if a role has a specific permission
    /// </summary>
    public static bool HasPermission(UserRole role, string permission)
    {
        return _rolePermissions.TryGetValue(role, out var permissions) && 
               permissions.Contains(permission);
    }

    /// <summary>
    /// Gets all available permissions in the system
    /// </summary>
    public static IEnumerable<string> GetAllPermissions()
    {
        return _rolePermissions.Values.SelectMany(p => p).Distinct();
    }
}