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
    Task<RoleUpgradeRequestDto> CreateRequestAsync(Guid userId, CreateRoleUpgradeRequestDto createDto);
    
    /// <summary>
    /// Gets all role upgrade requests with optional filtering
    /// </summary>
    Task<IEnumerable<RoleUpgradeRequestDto>> GetAllRequestsAsync(
        RoleUpgradeRequestStatus? status = null,
        UserRole? requestedRole = null,
        bool includeOwnRequests = true);
    
    /// <summary>
    /// Gets role upgrade requests for a specific user
    /// </summary>
    Task<IEnumerable<RoleUpgradeRequestDto>> GetUserRequestsAsync(Guid userId);
    
    /// <summary>
    /// Gets a specific role upgrade request by ID
    /// </summary>
    Task<RoleUpgradeRequestDto?> GetRequestByIdAsync(Guid requestId);
    
    /// <summary>
    /// Reviews a role upgrade request (approve or reject)
    /// </summary>
    Task<RoleUpgradeRequestDto> ReviewRequestAsync(Guid reviewerUserId, ReviewRoleUpgradeRequestDto reviewDto);
    
    /// <summary>
    /// Cancels a pending role upgrade request
    /// </summary>
    Task<RoleUpgradeRequestDto> CancelRequestAsync(Guid requestId, Guid userId);
    
    /// <summary>
    /// Updates the priority of a pending request
    /// </summary>
    Task<RoleUpgradeRequestDto> UpdateRequestPriorityAsync(Guid requestId, int newPriority);
    
    /// <summary>
    /// Gets statistics about role upgrade requests
    /// </summary>
    Task<RoleUpgradeRequestStatsDto> GetRequestStatisticsAsync();
    
    /// <summary>
    /// Checks if a user can request a specific role upgrade
    /// </summary>
    Task<bool> CanUserRequestRoleAsync(Guid userId, UserRole requestedRole);
    
    /// <summary>
    /// Gets pending requests that require attention (high priority or old requests)
    /// </summary>
    Task<IEnumerable<RoleUpgradeRequestDto>> GetRequestsRequiringAttentionAsync();
}