
namespace StockFlowPro.Domain.Enums;

/// <summary>
/// Defines the possible statuses for role upgrade requests
/// </summary>
public enum RoleUpgradeRequestStatus
{
    /// <summary>
    /// Request is pending review by an administrator
    /// </summary>
    Pending = 1,

    /// <summary>
    /// Request has been approved and role upgrade is authorized
    /// </summary>
    Approved = 2,

    /// <summary>
    /// Request has been rejected by an administrator
    /// </summary>
    Rejected = 3,

    /// <summary>
    /// Request has been cancelled by the requesting user
    /// </summary>
    Cancelled = 4
}