using StockFlowPro.Domain.Enums;
using StockFlowPro.Web.Authorization;
using System.Security.Claims;

namespace StockFlowPro.Web.Extensions;

/// <summary>
/// Extension methods for ClaimsPrincipal to check permissions
/// </summary>
public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// Checks if the user has a specific permission
    /// </summary>
    public static bool HasPermission(this ClaimsPrincipal user, string permission)
    {
        var userRole = user.GetUserRole();
        return userRole.HasValue && RolePermissions.HasPermission(userRole.Value, permission);
    }

    /// <summary>
    /// Checks if the user has any of the specified permissions
    /// </summary>
    public static bool HasAnyPermission(this ClaimsPrincipal user, params string[] permissions)
    {
        return permissions.Any(permission => user.HasPermission(permission));
    }

    /// <summary>
    /// Checks if the user has all of the specified permissions
    /// </summary>
    public static bool HasAllPermissions(this ClaimsPrincipal user, params string[] permissions)
    {
        return permissions.All(permission => user.HasPermission(permission));
    }

    /// <summary>
    /// Gets the user's role
    /// </summary>
    public static UserRole? GetUserRole(this ClaimsPrincipal user)
    {
        if (user?.Identity?.IsAuthenticated != true)
           { return null;}
            
        var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value;
        return !string.IsNullOrEmpty(roleClaim) && Enum.TryParse<UserRole>(roleClaim, out var role) 
            ? role 
            : null;
    }

    /// <summary>
    /// Gets the user's ID
    /// </summary>
    public static Guid? GetUserId(this ClaimsPrincipal user)
    {
        if (user?.Identity?.IsAuthenticated != true)
            {return null;}
            
        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    /// <summary>
    /// Gets the user's full name
    /// </summary>
    public static string GetFullName(this ClaimsPrincipal user)
    {
        if (user?.Identity?.IsAuthenticated != true)
           { return "Unknown User";}
            
        return user.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown User";
    }

    /// <summary>
    /// Gets the user's email
    /// </summary>
    public static string GetEmail(this ClaimsPrincipal user)
    {
        if (user?.Identity?.IsAuthenticated != true)
            {return "";}
            
        return user.FindFirst(ClaimTypes.Email)?.Value ?? "";
    }

    /// <summary>
    /// Checks if the user is in a specific role
    /// </summary>
    public static bool IsInRole(this ClaimsPrincipal user, UserRole role)
    {
        var userRole = user.GetUserRole();
        return userRole.HasValue && userRole.Value == role;
    }

    /// <summary>
    /// Checks if the user is an admin
    /// </summary>
    public static bool IsAdmin(this ClaimsPrincipal user)
    {
        return user.IsInRole(UserRole.Admin);
    }

    /// <summary>
    /// Checks if the user is a manager
    /// </summary>
    public static bool IsManager(this ClaimsPrincipal user)
    {
        return user.IsInRole(UserRole.Manager);
    }

    /// <summary>
    /// Checks if the user is a regular user
    /// </summary>
    public static bool IsUser(this ClaimsPrincipal user)
    {
        return user.IsInRole(UserRole.User);
    }

    /// <summary>
    /// Checks if the user can access another user's data
    /// </summary>
    public static bool CanAccessUser(this ClaimsPrincipal currentUser, Guid targetUserId)
    {
        // Admins can access any user
        if (currentUser.IsAdmin()) {return true;}

        // Users can only access their own data
        var currentUserId = currentUser.GetUserId();
        return currentUserId.HasValue && currentUserId.Value == targetUserId;
    }
}