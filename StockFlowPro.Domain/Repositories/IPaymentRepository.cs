using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Repositories;

/// <summary>
/// Repository interface for payment management operations.
/// </summary>
public interface IPaymentRepository
{
    // Payment CRUD operations
    System.Threading.Tasks.Task<Payment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<Payment?> GetByTransactionIdAsync(string transactionId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<Payment>> GetBySubscriptionIdAsync(Guid subscriptionId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<Payment>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<Payment>> GetByStatusAsync(PaymentStatus status, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<Payment>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<Payment> AddAsync(Payment payment, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task UpdateAsync(Payment payment, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    // Payment queries
    System.Threading.Tasks.Task<decimal> GetTotalRevenueAsync(DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<decimal> GetTotalRefundsAsync(DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<Payment>> GetFailedPaymentsAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<Payment>> GetPendingPaymentsAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<Payment>> GetPaymentsDueForRetryAsync(DateTime beforeDate, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<int> GetPaymentCountByStatusAsync(PaymentStatus status, CancellationToken cancellationToken = default);

    // External provider queries
    System.Threading.Tasks.Task<Payment?> GetByStripeChargeIdAsync(string stripeChargeId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<Payment?> GetByPayPalTransactionIdAsync(string payPalTransactionId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<Payment?> GetByExternalTransactionIdAsync(string externalTransactionId, CancellationToken cancellationToken = default);

    // Analytics
    System.Threading.Tasks.Task<Dictionary<string, decimal>> GetRevenueByMonthAsync(int year, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<Dictionary<PaymentMethod, int>> GetPaymentMethodDistributionAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<Dictionary<PaymentStatus, int>> GetPaymentStatusDistributionAsync(CancellationToken cancellationToken = default);
}