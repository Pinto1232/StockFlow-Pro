namespace StockFlowPro.Domain.Enums;

/// <summary>
/// Defines the available user roles in the StockFlow Pro system.
/// </summary>
public enum UserRole
{
    /// <summary>
    /// Administrator role with full system access and user management capabilities.
    /// </summary>
    Admin = 1,
    
    /// <summary>
    /// Standard user role with basic system access.
    /// </summary>
    User = 2,
    
    /// <summary>
    /// Manager role with elevated privileges including reporting access.
    /// </summary>
    Manager = 3
}
