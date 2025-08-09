using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Infrastructure.Repositories;

public class SubscriptionRepository : ISubscriptionRepository
{
    private readonly ApplicationDbContext _context;

    public SubscriptionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Subscription?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Subscriptions
            .Include(s => s.SubscriptionPlan)
            .Include(s => s.Payments)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<Subscription?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Subscriptions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<Subscription>> GetByUserIdAllAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Subscriptions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Subscription>> GetActiveSubscriptionsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Subscriptions
            .Where(s => s.Status == SubscriptionStatus.Active || s.Status == SubscriptionStatus.Trial)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Subscription>> GetExpiringSubscriptionsAsync(DateTime beforeDate, CancellationToken cancellationToken = default)
    {
        return await _context.Subscriptions
            .Where(s => s.CurrentPeriodEnd <= beforeDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Subscription>> GetByStatusAsync(SubscriptionStatus status, CancellationToken cancellationToken = default)
    {
        return await _context.Subscriptions
            .Where(s => s.Status == status)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Subscription>> GetByPlanIdAsync(Guid planId, CancellationToken cancellationToken = default)
    {
        return await _context.Subscriptions
            .Where(s => s.SubscriptionPlanId == planId)
            .ToListAsync(cancellationToken);
    }

    public async Task<Subscription> AddAsync(Subscription subscription, CancellationToken cancellationToken = default)
    {
        await _context.Subscriptions.AddAsync(subscription, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return subscription;
    }

    public async Task UpdateAsync(Subscription subscription, CancellationToken cancellationToken = default)
    {
        _context.Subscriptions.Update(subscription);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var sub = await _context.Subscriptions.FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        if (sub != null)
        {
            _context.Subscriptions.Remove(sub);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<bool> HasActiveSubscriptionAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Subscriptions.AnyAsync(
            s => s.UserId == userId && (s.Status == SubscriptionStatus.Active || s.Status == SubscriptionStatus.Trial),
            cancellationToken);
    }

    public async Task<int> GetActiveSubscriptionCountAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Subscriptions.CountAsync(
            s => s.Status == SubscriptionStatus.Active || s.Status == SubscriptionStatus.Trial,
            cancellationToken);
    }

    public async Task<decimal> GetMonthlyRecurringRevenueAsync(CancellationToken cancellationToken = default)
    {
        // Sum current price for active subscriptions; assumes all monthly for simplicity.
        return await _context.Subscriptions
            .Where(s => s.Status == SubscriptionStatus.Active || s.Status == SubscriptionStatus.Trial)
            .SumAsync(s => s.CurrentPrice * s.Quantity, cancellationToken);
    }

    public async Task<IEnumerable<Subscription>> GetSubscriptionsDueForBillingAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        return await _context.Subscriptions
            .Where(s => s.NextBillingDate != null && s.NextBillingDate <= date)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Subscription>> GetFailedPaymentSubscriptionsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Subscriptions
            .Where(s => s.FailedPaymentAttempts > 0 || s.Status == SubscriptionStatus.PastDue)
            .ToListAsync(cancellationToken);
    }

    public async Task<Subscription?> GetByStripeSubscriptionIdAsync(string stripeSubscriptionId, CancellationToken cancellationToken = default)
    {
        return await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.StripeSubscriptionId == stripeSubscriptionId, cancellationToken);
    }

    public async Task<Subscription?> GetByPayPalSubscriptionIdAsync(string payPalSubscriptionId, CancellationToken cancellationToken = default)
    {
        return await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.PayPalSubscriptionId == payPalSubscriptionId, cancellationToken);
    }
}