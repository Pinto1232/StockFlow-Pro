using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Application.Interfaces;

/// <summary>
/// Interface for enhanced role management service
/// </summary>
public interface IEnhancedRoleService
{
    Task<Role> CreateCustomRoleAsync(string name, string displayName, string description, List<string> permissionNames, int priority = 0);
    Task<List<Permission>> GetRolePermissionsAsync(Guid roleId);
    Task<bool> UserHasPermissionAsync(Guid userId, string permissionName);
    Task<List<Role>> GetRoleHierarchyAsync();
    Task BulkAssignPermissionsAsync(Guid roleId, List<Guid> permissionIds, Guid assignedBy);
    Task<(List<User> Users, int TotalCount)> GetUsersByRoleAsync(Guid roleId, int page = 1, int pageSize = 50);
    Task<Dictionary<string, object>> GetRoleAnalyticsAsync();
}