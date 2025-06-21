using Microsoft.AspNetCore.Authorization;

namespace StockFlowPro.Web.Authorization;

/// <summary>
/// Attribute for permission-based authorization
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public class PermissionAttribute : AuthorizeAttribute
{
    public PermissionAttribute(string permission) : base(permission)
    {
    }
}

/// <summary>
/// Attribute for multiple permission-based authorization (user needs ANY of the permissions)
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public class AnyPermissionAttribute : AuthorizeAttribute
{
    public AnyPermissionAttribute(params string[] permissions) 
        : base(string.Join(",", permissions))
    {
    }
}

/// <summary>
/// Attribute for multiple permission-based authorization (user needs ALL of the permissions)
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public class AllPermissionsAttribute : AuthorizeAttribute
{
    public AllPermissionsAttribute(params string[] permissions) 
        : base($"AllPermissions:{string.Join(",", permissions)}")
    {
    }
}