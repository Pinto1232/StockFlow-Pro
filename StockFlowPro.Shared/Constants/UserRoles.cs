namespace StockFlowPro.Shared.Constants;

/// <summary>
/// User roles and permissions for StockFlow Pro
/// </summary>
public static class UserRoles
{
    public const string Administrator = "Administrator";
    public const string Manager = "Manager";
    public const string Employee = "Employee";
    public const string Viewer = "Viewer";

    /// <summary>
    /// Get all available roles
    /// </summary>
    public static readonly string[] AllRoles = 
    {
        Administrator,
        Manager,
        Employee,
        Viewer
    };

    /// <summary>
    /// Roles that can manage inventory
    /// </summary>
    public static readonly string[] InventoryManagers = 
    {
        Administrator,
        Manager,
        Employee
    };

    /// <summary>
    /// Roles that can view reports
    /// </summary>
    public static readonly string[] ReportViewers = 
    {
        Administrator,
        Manager,
        Viewer
    };

    /// <summary>
    /// Roles that can manage users
    /// </summary>
    public static readonly string[] UserManagers = 
    {
        Administrator
    };
}