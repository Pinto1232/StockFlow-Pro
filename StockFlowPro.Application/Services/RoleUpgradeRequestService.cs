using Microsoft.Extensions.Logging;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Application.Services;

/// <summary>
/// Service for managing role upgrade requests
/// </summary>
public class RoleUpgradeRequestService : IRoleUpgradeRequestService
{
    private readonly ILogger<RoleUpgradeRequestService> _logger;
    private readonly IUserService _userService;
    
    // In-memory storage for demonstration - in production, this would use a database repository
    private static readonly List<RoleUpgradeRequest> _requests = new();
    private static readonly object _lock = new();

    public RoleUpgradeRequestService(
        ILogger<RoleUpgradeRequestService> logger,
        IUserService userService)
    {
        _logger = logger;
        _userService = userService;
    }

    public async Task<RoleUpgradeRequestDto> CreateRequestAsync(Guid userId, CreateRoleUpgradeRequestDto createDto)
    {
        try
        {
            // Get current user to determine their current role
            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
            {
                throw new ArgumentException("User not found", nameof(userId));
            }

            // Validate the request
            if (user.Role >= createDto.RequestedRole)
            {
                throw new InvalidOperationException("Cannot request a role that is equal to or lower than your current role");
            }

            // Check if user already has a pending request for the same role
            lock (_lock)
            {
                var existingRequest = _requests.FirstOrDefault(r => 
                    r.UserId == userId && 
                    r.RequestedRole == createDto.RequestedRole && 
                    r.Status == RoleUpgradeRequestStatus.Pending);

                if (existingRequest != null)
                {
                    throw new InvalidOperationException("You already have a pending request for this role");
                }
            }

            // Create the request
            var request = new RoleUpgradeRequest(
                userId,
                user.Role,
                createDto.RequestedRole,
                createDto.Justification,
                createDto.AdditionalDocuments,
                createDto.Priority);

            lock (_lock)
            {
                _requests.Add(request);
            }

            _logger.LogInformation("Role upgrade request created: {RequestId} for user {UserId} requesting {RequestedRole}", 
                request.Id, userId, createDto.RequestedRole);

            return await MapToDto(request);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating role upgrade request for user {UserId}", userId);
            throw;
        }
    }

    public async Task<IEnumerable<RoleUpgradeRequestDto>> GetAllRequestsAsync(
        RoleUpgradeRequestStatus? status = null,
        UserRole? requestedRole = null,
        bool includeOwnRequests = true)
    {
        try
        {
            List<RoleUpgradeRequest> requests;
            
            lock (_lock)
            {
                requests = _requests.ToList();
            }

            // Apply filters
            if (status.HasValue)
            {
                requests = requests.Where(r => r.Status == status.Value).ToList();
            }

            if (requestedRole.HasValue)
            {
                requests = requests.Where(r => r.RequestedRole == requestedRole.Value).ToList();
            }

            // Sort by priority (descending) then by request date (ascending)
            requests = requests
                .OrderByDescending(r => r.Priority)
                .ThenBy(r => r.RequestedAt)
                .ToList();

            var dtos = new List<RoleUpgradeRequestDto>();
            foreach (var request in requests)
            {
                dtos.Add(await MapToDto(request));
            }

            return dtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving role upgrade requests");
            throw;
        }
    }

    public async Task<IEnumerable<RoleUpgradeRequestDto>> GetUserRequestsAsync(Guid userId)
    {
        try
        {
            List<RoleUpgradeRequest> userRequests;
            
            lock (_lock)
            {
                userRequests = _requests
                    .Where(r => r.UserId == userId)
                    .OrderByDescending(r => r.RequestedAt)
                    .ToList();
            }

            var dtos = new List<RoleUpgradeRequestDto>();
            foreach (var request in userRequests)
            {
                dtos.Add(await MapToDto(request));
            }

            return dtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving role upgrade requests for user {UserId}", userId);
            throw;
        }
    }

    public async Task<RoleUpgradeRequestDto?> GetRequestByIdAsync(Guid requestId)
    {
        try
        {
            RoleUpgradeRequest? request;
            
            lock (_lock)
            {
                request = _requests.FirstOrDefault(r => r.Id == requestId);
            }

            return request != null ? await MapToDto(request) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving role upgrade request {RequestId}", requestId);
            throw;
        }
    }

    public async Task<RoleUpgradeRequestDto> ReviewRequestAsync(Guid reviewerUserId, ReviewRoleUpgradeRequestDto reviewDto)
    {
        try
        {
            RoleUpgradeRequest? request;
            
            lock (_lock)
            {
                request = _requests.FirstOrDefault(r => r.Id == reviewDto.RequestId);
            }

            if (request == null)
            {
                throw new ArgumentException("Request not found", nameof(reviewDto.RequestId));
            }

            // Get reviewer to validate permissions
            var reviewer = await _userService.GetByIdAsync(reviewerUserId);
            if (reviewer == null)
            {
                throw new ArgumentException("Reviewer not found", nameof(reviewerUserId));
            }

            if (!request.CanBeReviewedBy(reviewer.Role))
            {
                throw new UnauthorizedAccessException("You do not have permission to review this request");
            }

            // Process the review
            if (reviewDto.Approve)
            {
                request.Approve(reviewerUserId, reviewDto.Comments);
                _logger.LogInformation("Role upgrade request {RequestId} approved by {ReviewerId}", 
                    request.Id, reviewerUserId);
            }
            else
            {
                if (string.IsNullOrWhiteSpace(reviewDto.Comments))
                {
                    throw new ArgumentException("Comments are required when rejecting a request");
                }
                
                request.Reject(reviewerUserId, reviewDto.Comments);
                _logger.LogInformation("Role upgrade request {RequestId} rejected by {ReviewerId}", 
                    request.Id, reviewerUserId);
            }

            return await MapToDto(request);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reviewing role upgrade request {RequestId}", reviewDto.RequestId);
            throw;
        }
    }

    public async Task<RoleUpgradeRequestDto> CancelRequestAsync(Guid requestId, Guid userId)
    {
        try
        {
            RoleUpgradeRequest? request;
            
            lock (_lock)
            {
                request = _requests.FirstOrDefault(r => r.Id == requestId);
            }

            if (request == null)
            {
                throw new ArgumentException("Request not found", nameof(requestId));
            }

            if (request.UserId != userId)
            {
                throw new UnauthorizedAccessException("You can only cancel your own requests");
            }

            request.Cancel();
            
            _logger.LogInformation("Role upgrade request {RequestId} cancelled by user {UserId}", 
                requestId, userId);

            return await MapToDto(request);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling role upgrade request {RequestId}", requestId);
            throw;
        }
    }

    public async Task<RoleUpgradeRequestDto> UpdateRequestPriorityAsync(Guid requestId, int newPriority)
    {
        try
        {
            RoleUpgradeRequest? request;
            
            lock (_lock)
            {
                request = _requests.FirstOrDefault(r => r.Id == requestId);
            }

            if (request == null)
            {
                throw new ArgumentException("Request not found", nameof(requestId));
            }

            request.UpdatePriority(newPriority);
            
            _logger.LogInformation("Role upgrade request {RequestId} priority updated to {Priority}", 
                requestId, newPriority);

            return await MapToDto(request);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating priority for role upgrade request {RequestId}", requestId);
            throw;
        }
    }

    public async Task<RoleUpgradeRequestStatsDto> GetRequestStatisticsAsync()
    {
        try
        {
            List<RoleUpgradeRequest> allRequests;
            
            lock (_lock)
            {
                allRequests = _requests.ToList();
            }

            var stats = new RoleUpgradeRequestStatsDto
            {
                TotalRequests = allRequests.Count,
                PendingRequests = allRequests.Count(r => r.Status == RoleUpgradeRequestStatus.Pending),
                ApprovedRequests = allRequests.Count(r => r.Status == RoleUpgradeRequestStatus.Approved),
                RejectedRequests = allRequests.Count(r => r.Status == RoleUpgradeRequestStatus.Rejected),
                CancelledRequests = allRequests.Count(r => r.Status == RoleUpgradeRequestStatus.Cancelled),
                HighPriorityRequests = allRequests.Count(r => r.Priority >= 4 && r.Status == RoleUpgradeRequestStatus.Pending),
                RequestsByRole = allRequests
                    .GroupBy(r => r.RequestedRole.ToString())
                    .ToDictionary(g => g.Key, g => g.Count()),
                LastUpdated = DateTime.UtcNow
            };

            return await Task.FromResult(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving role upgrade request statistics");
            throw;
        }
    }

    public async Task<bool> CanUserRequestRoleAsync(Guid userId, UserRole requestedRole)
    {
        try
        {
            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
            {
                return false;
            }

            // User can only request roles higher than their current role
            if (user.Role >= requestedRole)
            {
                return false;
            }

            // Check if user already has a pending request for this role
            lock (_lock)
            {
                var existingRequest = _requests.FirstOrDefault(r => 
                    r.UserId == userId && 
                    r.RequestedRole == requestedRole && 
                    r.Status == RoleUpgradeRequestStatus.Pending);

                return existingRequest == null;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if user {UserId} can request role {RequestedRole}", userId, requestedRole);
            return false;
        }
    }

    public async Task<IEnumerable<RoleUpgradeRequestDto>> GetRequestsRequiringAttentionAsync()
    {
        try
        {
            List<RoleUpgradeRequest> attentionRequests;
            var cutoffDate = DateTime.UtcNow.AddDays(-7); // Requests older than 7 days
            
            lock (_lock)
            {
                attentionRequests = _requests
                    .Where(r => r.Status == RoleUpgradeRequestStatus.Pending && 
                               (r.Priority >= 4 || r.RequestedAt < cutoffDate))
                    .OrderByDescending(r => r.Priority)
                    .ThenBy(r => r.RequestedAt)
                    .ToList();
            }

            var dtos = new List<RoleUpgradeRequestDto>();
            foreach (var request in attentionRequests)
            {
                dtos.Add(await MapToDto(request));
            }

            return dtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving role upgrade requests requiring attention");
            throw;
        }
    }

    private async Task<RoleUpgradeRequestDto> MapToDto(RoleUpgradeRequest request)
    {
        var user = await _userService.GetByIdAsync(request.UserId);
        UserDto? reviewer = null;
        
        if (request.ReviewedByUserId.HasValue)
        {
            reviewer = await _userService.GetByIdAsync(request.ReviewedByUserId.Value);
        }

        return new RoleUpgradeRequestDto
        {
            Id = request.Id,
            UserId = request.UserId,
            UserName = user != null ? $"{user.FirstName} {user.LastName}" : "Unknown User",
            UserEmail = user?.Email ?? "Unknown",
            CurrentRole = request.CurrentRole,
            RequestedRole = request.RequestedRole,
            Justification = request.Justification,
            Status = request.Status,
            StatusDisplayText = request.GetStatusDisplayText(),
            RequestedAt = request.RequestedAt,
            ReviewedByUserId = request.ReviewedByUserId,
            ReviewedByUserName = reviewer != null ? $"{reviewer.FirstName} {reviewer.LastName}" : null,
            ReviewedAt = request.ReviewedAt,
            ReviewComments = request.ReviewComments,
            AdditionalDocuments = request.AdditionalDocuments,
            Priority = request.Priority,
            PriorityDisplayText = request.GetPriorityDisplayText(),
            CanBeApproved = request.Status == RoleUpgradeRequestStatus.Pending,
            CanBeRejected = request.Status == RoleUpgradeRequestStatus.Pending,
            CanBeCancelled = request.Status == RoleUpgradeRequestStatus.Pending
        };
    }
}