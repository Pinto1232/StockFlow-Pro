using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Repositories;

/// <summary>
/// Repository interface for subscription plan management operations.
/// </summary>
public interface ISubscriptionPlanRepository
{
    // Subscription Plan CRUD operations
    Task<SubscriptionPlan?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SubscriptionPlan?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<IEnumerable<SubscriptionPlan>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<SubscriptionPlan>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<SubscriptionPlan>> GetPublicAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<SubscriptionPlan>> GetByBillingIntervalAsync(BillingInterval billingInterval, CancellationToken cancellationToken = default);
    Task<SubscriptionPlan> AddAsync(SubscriptionPlan plan, CancellationToken cancellationToken = default);
    Task UpdateAsync(SubscriptionPlan plan, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    // Plan queries
    Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<SubscriptionPlan>> GetOrderedBySortOrderAsync(CancellationToken cancellationToken = default);
    Task<SubscriptionPlan?> GetCheapestPlanAsync(CancellationToken cancellationToken = default);
    Task<SubscriptionPlan?> GetMostExpensivePlanAsync(CancellationToken cancellationToken = default);

    // External provider queries
    Task<SubscriptionPlan?> GetByStripeProductIdAsync(string stripeProductId, CancellationToken cancellationToken = default);
    Task<SubscriptionPlan?> GetByStripePriceIdAsync(string stripePriceId, CancellationToken cancellationToken = default);
    Task<SubscriptionPlan?> GetByPayPalPlanIdAsync(string payPalPlanId, CancellationToken cancellationToken = default);

    // Plan features
    Task<IEnumerable<SubscriptionPlanFeature>> GetPlanFeaturesAsync(Guid planId, CancellationToken cancellationToken = default);
    Task<SubscriptionPlanFeature?> GetPlanFeatureAsync(Guid planId, Guid featureId, CancellationToken cancellationToken = default);
    Task AddPlanFeatureAsync(SubscriptionPlanFeature planFeature, CancellationToken cancellationToken = default);
    Task UpdatePlanFeatureAsync(SubscriptionPlanFeature planFeature, CancellationToken cancellationToken = default);
    Task RemovePlanFeatureAsync(Guid planId, Guid featureId, CancellationToken cancellationToken = default);

    // Analytics
    Task<Dictionary<Guid, int>> GetSubscriptionCountByPlanAsync(CancellationToken cancellationToken = default);
    Task<Dictionary<Guid, decimal>> GetRevenueByPlanAsync(CancellationToken cancellationToken = default);
}