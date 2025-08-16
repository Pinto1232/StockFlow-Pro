using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Repositories;

/// <summary>
/// Repository interface for subscription plan management operations.
/// </summary>
public interface ISubscriptionPlanRepository
{
    // Subscription Plan CRUD operations
    System.Threading.Tasks.Task<SubscriptionPlan?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<SubscriptionPlan?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<SubscriptionPlan>> GetAllAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<SubscriptionPlan>> GetActiveAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<SubscriptionPlan>> GetPublicAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<SubscriptionPlan>> GetByBillingIntervalAsync(BillingInterval billingInterval, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<SubscriptionPlan> AddAsync(SubscriptionPlan plan, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task UpdateAsync(SubscriptionPlan plan, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    // Plan queries
    System.Threading.Tasks.Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<SubscriptionPlan>> GetOrderedBySortOrderAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<SubscriptionPlan?> GetCheapestPlanAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<SubscriptionPlan?> GetMostExpensivePlanAsync(CancellationToken cancellationToken = default);

    // External provider queries
    System.Threading.Tasks.Task<SubscriptionPlan?> GetByStripeProductIdAsync(string stripeProductId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<SubscriptionPlan?> GetByStripePriceIdAsync(string stripePriceId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<SubscriptionPlan?> GetByPayPalPlanIdAsync(string payPalPlanId, CancellationToken cancellationToken = default);

    // Plan features
    System.Threading.Tasks.Task<IEnumerable<SubscriptionPlanFeature>> GetPlanFeaturesAsync(Guid planId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<SubscriptionPlanFeature?> GetPlanFeatureAsync(Guid planId, Guid featureId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task AddPlanFeatureAsync(SubscriptionPlanFeature planFeature, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task UpdatePlanFeatureAsync(SubscriptionPlanFeature planFeature, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task RemovePlanFeatureAsync(Guid planId, Guid featureId, CancellationToken cancellationToken = default);

    // Analytics
    System.Threading.Tasks.Task<Dictionary<Guid, int>> GetSubscriptionCountByPlanAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<Dictionary<Guid, decimal>> GetRevenueByPlanAsync(CancellationToken cancellationToken = default);
}