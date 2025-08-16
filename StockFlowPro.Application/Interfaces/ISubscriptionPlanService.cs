using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Application.Interfaces;

/// <summary>
/// Service interface for subscription plan operations
/// </summary>
public interface ISubscriptionPlanService
{
    /// <summary>
    /// Gets a subscription plan by its ID
    /// </summary>
    /// <param name="id">The plan ID</param>
    /// <returns>Subscription plan DTO if found, null otherwise</returns>
        System.Threading.Tasks.Task<SubscriptionPlanDto?> GetByIdAsync(Guid id);

    /// <summary>
    /// Gets a subscription plan by its name
    /// </summary>
    /// <param name="name">The plan name</param>
    /// <returns>Subscription plan DTO if found, null otherwise</returns>
        System.Threading.Tasks.Task<SubscriptionPlanDto?> GetByNameAsync(string name);

    /// <summary>
    /// Gets all subscription plans
    /// </summary>
    /// <returns>Collection of subscription plan DTOs</returns>
        System.Threading.Tasks.Task<IEnumerable<SubscriptionPlanDto>> GetAllAsync();

    /// <summary>
    /// Gets all active subscription plans
    /// </summary>
    /// <returns>Collection of active subscription plan DTOs</returns>
        System.Threading.Tasks.Task<IEnumerable<SubscriptionPlanDto>> GetActiveAsync();

    /// <summary>
    /// Gets all public subscription plans (visible to customers)
    /// </summary>
    /// <returns>Collection of public subscription plan DTOs</returns>
        System.Threading.Tasks.Task<IEnumerable<SubscriptionPlanDto>> GetPublicPlansAsync();

    /// <summary>
    /// Gets subscription plans by billing interval
    /// </summary>
    /// <param name="billingInterval">The billing interval</param>
    /// <returns>Collection of subscription plan DTOs</returns>
        System.Threading.Tasks.Task<IEnumerable<SubscriptionPlanDto>> GetByBillingIntervalAsync(BillingInterval billingInterval);

    /// <summary>
    /// Gets subscription plans ordered by sort order
    /// </summary>
    /// <returns>Collection of subscription plan DTOs ordered by sort order</returns>
        System.Threading.Tasks.Task<IEnumerable<SubscriptionPlanDto>> GetOrderedBySortOrderAsync();

    /// <summary>
    /// Gets the cheapest available plan
    /// </summary>
    /// <returns>Cheapest subscription plan DTO if found, null otherwise</returns>
        System.Threading.Tasks.Task<SubscriptionPlanDto?> GetCheapestPlanAsync();

    /// <summary>
    /// Gets the most expensive available plan
    /// </summary>
    /// <returns>Most expensive subscription plan DTO if found, null otherwise</returns>
        System.Threading.Tasks.Task<SubscriptionPlanDto?> GetMostExpensivePlanAsync();

    /// <summary>
    /// Gets a subscription plan by Stripe product ID
    /// </summary>
    /// <param name="stripeProductId">The Stripe product ID</param>
    /// <returns>Subscription plan DTO if found, null otherwise</returns>
        System.Threading.Tasks.Task<SubscriptionPlanDto?> GetByStripeProductIdAsync(string stripeProductId);

    /// <summary>
    /// Gets a subscription plan by Stripe price ID
    /// </summary>
    /// <param name="stripePriceId">The Stripe price ID</param>
    /// <returns>Subscription plan DTO if found, null otherwise</returns>
        System.Threading.Tasks.Task<SubscriptionPlanDto?> GetByStripePriceIdAsync(string stripePriceId);

    /// <summary>
    /// Gets a subscription plan by PayPal plan ID
    /// </summary>
    /// <param name="payPalPlanId">The PayPal plan ID</param>
    /// <returns>Subscription plan DTO if found, null otherwise</returns>
        System.Threading.Tasks.Task<SubscriptionPlanDto?> GetByPayPalPlanIdAsync(string payPalPlanId);

    /// <summary>
    /// Checks if a subscription plan exists by name
    /// </summary>
    /// <param name="name">The plan name</param>
    /// <param name="excludeId">Optional ID to exclude from the check</param>
    /// <returns>True if plan exists, false otherwise</returns>
        System.Threading.Tasks.Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null);
}