using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

/// <summary>
/// Represents a request for role upgrade in the system
/// </summary>
public class RoleUpgradeRequest
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public UserRole CurrentRole { get; private set; }
    public UserRole RequestedRole { get; private set; }
    public string Justification { get; private set; }
    public RoleUpgradeRequestStatus Status { get; private set; }
    public DateTime RequestedAt { get; private set; }
    public Guid? ReviewedByUserId { get; private set; }
    public DateTime? ReviewedAt { get; private set; }
    public string? ReviewComments { get; private set; }
    public string? AdditionalDocuments { get; private set; }
    public int Priority { get; private set; }

    // Navigation properties
    public User User { get; private set; } = null!;
    public User? ReviewedByUser { get; private set; }

    private RoleUpgradeRequest() 
    { 
        // For EF Core - initialize required properties to avoid nullable warnings
        Justification = string.Empty;
    }

    public RoleUpgradeRequest(
        Guid userId,
        UserRole currentRole,
        UserRole requestedRole,
        string justification,
        string? additionalDocuments = null,
        int priority = 1)
    {
        if (userId == Guid.Empty)
            {throw new ArgumentException("User ID cannot be empty", nameof(userId));}
        
        if (string.IsNullOrWhiteSpace(justification))
            {throw new ArgumentException("Justification is required", nameof(justification));}
        
        if (currentRole >= requestedRole)
           { throw new ArgumentException("Requested role must be higher than current role", nameof(requestedRole));
}
        Id = Guid.NewGuid();
        UserId = userId;
        CurrentRole = currentRole;
        RequestedRole = requestedRole;
        Justification = justification.Trim();
        Status = RoleUpgradeRequestStatus.Pending;
        RequestedAt = DateTime.UtcNow;
        AdditionalDocuments = additionalDocuments?.Trim();
        Priority = Math.Max(1, Math.Min(5, priority)); // Ensure priority is between 1-5
    }

    public void Approve(Guid reviewerUserId, string? comments = null)
    {
        if (Status != RoleUpgradeRequestStatus.Pending)
           { throw new InvalidOperationException("Only pending requests can be approved");
}
        Status = RoleUpgradeRequestStatus.Approved;
        ReviewedByUserId = reviewerUserId;
        ReviewedAt = DateTime.UtcNow;
        ReviewComments = comments?.Trim();
    }

    public void Reject(Guid reviewerUserId, string comments)
    {
        if (Status != RoleUpgradeRequestStatus.Pending)
           { throw new InvalidOperationException("Only pending requests can be rejected");}

        if (string.IsNullOrWhiteSpace(comments))
           { throw new ArgumentException("Comments are required when rejecting a request", nameof(comments));}

        Status = RoleUpgradeRequestStatus.Rejected;
        ReviewedByUserId = reviewerUserId;
        ReviewedAt = DateTime.UtcNow;
        ReviewComments = comments.Trim();
    }

    public void Cancel()
    {
        if (Status != RoleUpgradeRequestStatus.Pending)
            {throw new InvalidOperationException("Only pending requests can be cancelled");}

        Status = RoleUpgradeRequestStatus.Cancelled;
        ReviewedAt = DateTime.UtcNow;
    }

    public void UpdatePriority(int newPriority)
    {
        if (Status != RoleUpgradeRequestStatus.Pending)
            {throw new InvalidOperationException("Cannot update priority of non-pending requests");
}
        Priority = Math.Max(1, Math.Min(5, newPriority));
    }

    public bool CanBeReviewedBy(UserRole reviewerRole)
    {
        return RequestedRole switch
        {
            UserRole.Manager => reviewerRole == UserRole.Admin,
            UserRole.Admin => reviewerRole == UserRole.Admin,
            _ => false
        };
    }

    public string GetStatusDisplayText()
    {
        return Status switch
        {
            RoleUpgradeRequestStatus.Pending => "Pending Review",
            RoleUpgradeRequestStatus.Approved => "Approved",
            RoleUpgradeRequestStatus.Rejected => "Rejected",
            RoleUpgradeRequestStatus.Cancelled => "Cancelled",
            _ => "Unknown"
        };
    }

    public string GetPriorityDisplayText()
    {
        return Priority switch
        {
            1 => "Low",
            2 => "Normal",
            3 => "Medium",
            4 => "High",
            5 => "Critical",
            _ => "Normal"
        };
    }
}