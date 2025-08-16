using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Application.Interfaces;

/// <summary>
/// Service interface for managing role upgrade requests
/// </summary>
public interface IRoleUpgradeRequestService
{
    /// <summary>
    /// Creates a new role upgrade request
    /// </summary>
        System.Threading.Tasks.Task<RoleUpgradeRequestDto> CreateRequestAsync(Guid userId, CreateRoleUpgradeRequestDto createDto);
    
    /// <summary>
    /// Gets all role upgrade requests with optional filtering
    /// </summary>
        System.Threading.Tasks.Task<IEnumerable<RoleUpgradeRequestDto>> GetAllRequestsAsync(
        RoleUpgradeRequestStatus? status = null,
        UserRole? requestedRole = null,
        bool includeOwnRequests = true);
    
    /// <summary>
    /// Gets role upgrade requests for a specific user
    /// </summary>
        System.Threading.Tasks.Task<IEnumerable<RoleUpgradeRequestDto>> GetUserRequestsAsync(Guid userId);
    
    /// <summary>
    /// Gets a specific role upgrade request by ID
    /// </summary>
        System.Threading.Tasks.Task<RoleUpgradeRequestDto?> GetRequestByIdAsync(Guid requestId);
    
    /// <summary>
    /// Reviews a role upgrade request (approve or reject)
    /// </summary>
        System.Threading.Tasks.Task<RoleUpgradeRequestDto> ReviewRequestAsync(Guid reviewerUserId, ReviewRoleUpgradeRequestDto reviewDto);
    
    /// <summary>
    /// Cancels a pending role upgrade request
    /// </summary>
        System.Threading.Tasks.Task<RoleUpgradeRequestDto> CancelRequestAsync(Guid requestId, Guid userId);
    
    /// <summary>
    /// Updates the priority of a pending request
    /// </summary>
        System.Threading.Tasks.Task<RoleUpgradeRequestDto> UpdateRequestPriorityAsync(Guid requestId, int newPriority);
    
    /// <summary>
    /// Gets statistics about role upgrade requests
    /// </summary>
        System.Threading.Tasks.Task<RoleUpgradeRequestStatsDto> GetRequestStatisticsAsync();
    
    /// <summary>
    /// Checks if a user can request a specific role upgrade
    /// </summary>
        System.Threading.Tasks.Task<bool> CanUserRequestRoleAsync(Guid userId, UserRole requestedRole);
    
    /// <summary>
    /// Gets pending requests that require attention (high priority or old requests)
    /// </summary>
        System.Threading.Tasks.Task<IEnumerable<RoleUpgradeRequestDto>> GetRequestsRequiringAttentionAsync();
}