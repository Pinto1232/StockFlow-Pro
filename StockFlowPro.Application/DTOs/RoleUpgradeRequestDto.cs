using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Application.DTOs;

/// <summary>
/// DTO for role upgrade request information
/// </summary>
public class RoleUpgradeRequestDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public UserRole CurrentRole { get; set; }
    public UserRole RequestedRole { get; set; }
    public string Justification { get; set; } = string.Empty;
    public RoleUpgradeRequestStatus Status { get; set; }
    public string StatusDisplayText { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; }
    public Guid? ReviewedByUserId { get; set; }
    public string? ReviewedByUserName { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewComments { get; set; }
    public string? AdditionalDocuments { get; set; }
    public int Priority { get; set; }
    public string PriorityDisplayText { get; set; } = string.Empty;
    public bool CanBeApproved { get; set; }
    public bool CanBeRejected { get; set; }
    public bool CanBeCancelled { get; set; }
}

/// <summary>
/// DTO for creating a new role upgrade request
/// </summary>
public class CreateRoleUpgradeRequestDto
{
    public UserRole RequestedRole { get; set; }
    public string Justification { get; set; } = string.Empty;
    public string? AdditionalDocuments { get; set; }
    public int Priority { get; set; } = 2; // Default to Normal priority
}

/// <summary>
/// DTO for reviewing a role upgrade request
/// </summary>
public class ReviewRoleUpgradeRequestDto
{
    public Guid RequestId { get; set; }
    public bool Approve { get; set; }
    public string? Comments { get; set; }
}

/// <summary>
/// DTO for role upgrade request statistics
/// </summary>
public class RoleUpgradeRequestStatsDto
{
    public int TotalRequests { get; set; }
    public int PendingRequests { get; set; }
    public int ApprovedRequests { get; set; }
    public int RejectedRequests { get; set; }
    public int CancelledRequests { get; set; }
    public int HighPriorityRequests { get; set; }
    public Dictionary<string, int> RequestsByRole { get; set; } = new();
    public DateTime LastUpdated { get; set; }
}