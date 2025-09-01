using StockFlowPro.Domain.Enums;
using System.Security.Claims;

namespace StockFlowPro.Web.Services;

public interface IAuthorizationService
{
    bool HasPermission(ClaimsPrincipal user, string permission);
    bool HasAnyPermission(ClaimsPrincipal user, params string[] permissions);
    bool HasAllPermissions(ClaimsPrincipal user, params string[] permissions);
    UserRole? GetUserRole(ClaimsPrincipal user);
    IEnumerable<string> GetUserPermissions(ClaimsPrincipal user);
    bool CanAccessUser(ClaimsPrincipal currentUser, Guid targetUserId);
}

public class AuthorizationService : IAuthorizationService
{
    public bool HasPermission(ClaimsPrincipal user, string permission)
    {
        var userRole = GetUserRole(user);
        return userRole.HasValue && Authorization.RolePermissions.HasPermission(userRole.Value, permission);
    }

    public bool HasAnyPermission(ClaimsPrincipal user, params string[] permissions)
    {
        return permissions.Any(permission => HasPermission(user, permission));
    }

    public bool HasAllPermissions(ClaimsPrincipal user, params string[] permissions)
    {
        return permissions.All(permission => HasPermission(user, permission));
    }

    public UserRole? GetUserRole(ClaimsPrincipal user)
    {
        var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value;
        return !string.IsNullOrEmpty(roleClaim) && Enum.TryParse<UserRole>(roleClaim, out var role) 
            ? role 
            : null;
    }

    public IEnumerable<string> GetUserPermissions(ClaimsPrincipal user)
    {
        var userRole = GetUserRole(user);
        return userRole.HasValue 
            ? Authorization.RolePermissions.GetPermissions(userRole.Value) 
            : Enumerable.Empty<string>();
    }

    public bool CanAccessUser(ClaimsPrincipal currentUser, Guid targetUserId)
    {
        var userRole = GetUserRole(currentUser);
        if (!userRole.HasValue) {return false;}

        if (userRole.Value == UserRole.Admin) {return true;}

        var currentUserId = currentUser.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(currentUserId, out var currentUserGuid))
        {
            return currentUserGuid == targetUserId;
        }

        return false;
    }
}
