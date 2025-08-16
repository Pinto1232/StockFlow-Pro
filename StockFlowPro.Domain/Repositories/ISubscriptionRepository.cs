using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Repositories;

/// <summary>
/// Repository interface for subscription management operations.
/// </summary>
public interface ISubscriptionRepository
{
    // Subscription CRUD operations
    System.Threading.Tasks.Task<Subscription?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<Subscription?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<Subscription>> GetByUserIdAllAsync(Guid userId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<Subscription>> GetActiveSubscriptionsAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<Subscription>> GetExpiringSubscriptionsAsync(DateTime beforeDate, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<Subscription>> GetByStatusAsync(SubscriptionStatus status, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<Subscription>> GetByPlanIdAsync(Guid planId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<Subscription> AddAsync(Subscription subscription, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task UpdateAsync(Subscription subscription, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    // Subscription queries
    System.Threading.Tasks.Task<bool> HasActiveSubscriptionAsync(Guid userId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<int> GetActiveSubscriptionCountAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<decimal> GetMonthlyRecurringRevenueAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<Subscription>> GetSubscriptionsDueForBillingAsync(DateTime date, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<Subscription>> GetFailedPaymentSubscriptionsAsync(CancellationToken cancellationToken = default);

    // External provider queries
    System.Threading.Tasks.Task<Subscription?> GetByStripeSubscriptionIdAsync(string stripeSubscriptionId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<Subscription?> GetByPayPalSubscriptionIdAsync(string payPalSubscriptionId, CancellationToken cancellationToken = default);
}