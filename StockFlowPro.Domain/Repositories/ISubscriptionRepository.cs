using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Repositories;

/// <summary>
/// Repository interface for subscription management operations.
/// </summary>
public interface ISubscriptionRepository
{
    // Subscription CRUD operations
    Task<Subscription?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Subscription?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Subscription>> GetByUserIdAllAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Subscription>> GetActiveSubscriptionsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Subscription>> GetExpiringSubscriptionsAsync(DateTime beforeDate, CancellationToken cancellationToken = default);
    Task<IEnumerable<Subscription>> GetByStatusAsync(SubscriptionStatus status, CancellationToken cancellationToken = default);
    Task<IEnumerable<Subscription>> GetByPlanIdAsync(Guid planId, CancellationToken cancellationToken = default);
    Task<Subscription> AddAsync(Subscription subscription, CancellationToken cancellationToken = default);
    Task UpdateAsync(Subscription subscription, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    // Subscription queries
    Task<bool> HasActiveSubscriptionAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<int> GetActiveSubscriptionCountAsync(CancellationToken cancellationToken = default);
    Task<decimal> GetMonthlyRecurringRevenueAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Subscription>> GetSubscriptionsDueForBillingAsync(DateTime date, CancellationToken cancellationToken = default);
    Task<IEnumerable<Subscription>> GetFailedPaymentSubscriptionsAsync(CancellationToken cancellationToken = default);

    // External provider queries
    Task<Subscription?> GetByStripeSubscriptionIdAsync(string stripeSubscriptionId, CancellationToken cancellationToken = default);
    Task<Subscription?> GetByPayPalSubscriptionIdAsync(string payPalSubscriptionId, CancellationToken cancellationToken = default);
}