namespace StockFlowPro.Domain.Enums;

/// <summary>
/// Defines the billing intervals for subscription plans.
/// </summary>
public enum BillingInterval
{
    /// <summary>
    /// Monthly billing cycle.
    /// </summary>
    Monthly = 1,
    
    /// <summary>
    /// Quarterly billing cycle (every 3 months).
    /// </summary>
    Quarterly = 2,
    
    /// <summary>
    /// Semi-annual billing cycle (every 6 months).
    /// </summary>
    SemiAnnual = 3,
    
    /// <summary>
    /// Annual billing cycle.
    /// </summary>
    Annual = 4,
    
    /// <summary>
    /// Weekly billing cycle.
    /// </summary>
    Weekly = 5,
    
    /// <summary>
    /// One-time payment (no recurring billing).
    /// </summary>
    OneTime = 6
}