using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Repositories;

/// <summary>
/// Repository interface for payment management operations.
/// </summary>
public interface IPaymentRepository
{
    // Payment CRUD operations
    Task<Payment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Payment?> GetByTransactionIdAsync(string transactionId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Payment>> GetBySubscriptionIdAsync(Guid subscriptionId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Payment>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Payment>> GetByStatusAsync(PaymentStatus status, CancellationToken cancellationToken = default);
    Task<IEnumerable<Payment>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<Payment> AddAsync(Payment payment, CancellationToken cancellationToken = default);
    Task UpdateAsync(Payment payment, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    // Payment queries
    Task<decimal> GetTotalRevenueAsync(DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalRefundsAsync(DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<Payment>> GetFailedPaymentsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Payment>> GetPendingPaymentsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Payment>> GetPaymentsDueForRetryAsync(DateTime beforeDate, CancellationToken cancellationToken = default);
    Task<int> GetPaymentCountByStatusAsync(PaymentStatus status, CancellationToken cancellationToken = default);

    // External provider queries
    Task<Payment?> GetByStripeChargeIdAsync(string stripeChargeId, CancellationToken cancellationToken = default);
    Task<Payment?> GetByPayPalTransactionIdAsync(string payPalTransactionId, CancellationToken cancellationToken = default);
    Task<Payment?> GetByExternalTransactionIdAsync(string externalTransactionId, CancellationToken cancellationToken = default);

    // Analytics
    Task<Dictionary<string, decimal>> GetRevenueByMonthAsync(int year, CancellationToken cancellationToken = default);
    Task<Dictionary<PaymentMethod, int>> GetPaymentMethodDistributionAsync(CancellationToken cancellationToken = default);
    Task<Dictionary<PaymentStatus, int>> GetPaymentStatusDistributionAsync(CancellationToken cancellationToken = default);
}