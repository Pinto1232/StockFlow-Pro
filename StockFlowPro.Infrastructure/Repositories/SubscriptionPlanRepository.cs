using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Infrastructure.Repositories;

public class SubscriptionPlanRepository : ISubscriptionPlanRepository
{
    private readonly ApplicationDbContext _context;

    public SubscriptionPlanRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SubscriptionPlan?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.SubscriptionPlans
            .Include(sp => sp.PlanFeatures)
            .ThenInclude(pf => pf.PlanFeature)
            .FirstOrDefaultAsync(sp => sp.Id == id, cancellationToken);
    }

    public async Task<SubscriptionPlan?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.SubscriptionPlans
            .Include(sp => sp.PlanFeatures)
            .ThenInclude(pf => pf.PlanFeature)
            .FirstOrDefaultAsync(sp => sp.Name == name, cancellationToken);
    }

    public async Task<IEnumerable<SubscriptionPlan>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SubscriptionPlans
            .Include(sp => sp.PlanFeatures)
            .ThenInclude(pf => pf.PlanFeature)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<SubscriptionPlan>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SubscriptionPlans
            .Include(sp => sp.PlanFeatures)
            .ThenInclude(pf => pf.PlanFeature)
            .Where(sp => sp.IsActive)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<SubscriptionPlan>> GetPublicAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SubscriptionPlans
            .Include(sp => sp.PlanFeatures)
            .ThenInclude(pf => pf.PlanFeature)
            .Where(sp => sp.IsPublic && sp.IsActive)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<SubscriptionPlan>> GetByBillingIntervalAsync(BillingInterval billingInterval, CancellationToken cancellationToken = default)
    {
        return await _context.SubscriptionPlans
            .Include(sp => sp.PlanFeatures)
            .ThenInclude(pf => pf.PlanFeature)
            .Where(sp => sp.BillingInterval == billingInterval && sp.IsActive)
            .ToListAsync(cancellationToken);
    }

    public async Task<SubscriptionPlan> AddAsync(SubscriptionPlan plan, CancellationToken cancellationToken = default)
    {
        await _context.SubscriptionPlans.AddAsync(plan, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return plan;
    }

    public async Task UpdateAsync(SubscriptionPlan plan, CancellationToken cancellationToken = default)
    {
        _context.SubscriptionPlans.Update(plan);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var plan = await GetByIdAsync(id, cancellationToken);
        if (plan != null)
        {
            _context.SubscriptionPlans.Remove(plan);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.SubscriptionPlans.Where(sp => sp.Name == name);
        
        if (excludeId.HasValue)
        {
            query = query.Where(sp => sp.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<IEnumerable<SubscriptionPlan>> GetOrderedBySortOrderAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SubscriptionPlans
            .Include(sp => sp.PlanFeatures)
            .ThenInclude(pf => pf.PlanFeature)
            .Where(sp => sp.IsActive)
            .OrderBy(sp => sp.SortOrder)
            .ThenBy(sp => sp.Price)
            .ToListAsync(cancellationToken);
    }

    public async Task<SubscriptionPlan?> GetCheapestPlanAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SubscriptionPlans
            .Include(sp => sp.PlanFeatures)
            .ThenInclude(pf => pf.PlanFeature)
            .Where(sp => sp.IsActive && sp.IsPublic)
            .OrderBy(sp => sp.Price)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<SubscriptionPlan?> GetMostExpensivePlanAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SubscriptionPlans
            .Include(sp => sp.PlanFeatures)
            .ThenInclude(pf => pf.PlanFeature)
            .Where(sp => sp.IsActive && sp.IsPublic)
            .OrderByDescending(sp => sp.Price)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<SubscriptionPlan?> GetByStripeProductIdAsync(string stripeProductId, CancellationToken cancellationToken = default)
    {
        return await _context.SubscriptionPlans
            .Include(sp => sp.PlanFeatures)
            .ThenInclude(pf => pf.PlanFeature)
            .FirstOrDefaultAsync(sp => sp.StripeProductId == stripeProductId, cancellationToken);
    }

    public async Task<SubscriptionPlan?> GetByStripePriceIdAsync(string stripePriceId, CancellationToken cancellationToken = default)
    {
        return await _context.SubscriptionPlans
            .Include(sp => sp.PlanFeatures)
            .ThenInclude(pf => pf.PlanFeature)
            .FirstOrDefaultAsync(sp => sp.StripePriceId == stripePriceId, cancellationToken);
    }

    public async Task<SubscriptionPlan?> GetByPayPalPlanIdAsync(string payPalPlanId, CancellationToken cancellationToken = default)
    {
        return await _context.SubscriptionPlans
            .Include(sp => sp.PlanFeatures)
            .ThenInclude(pf => pf.PlanFeature)
            .FirstOrDefaultAsync(sp => sp.PayPalPlanId == payPalPlanId, cancellationToken);
    }

    public async Task<IEnumerable<SubscriptionPlanFeature>> GetPlanFeaturesAsync(Guid planId, CancellationToken cancellationToken = default)
    {
        return await _context.SubscriptionPlanFeatures
            .Include(spf => spf.PlanFeature)
            .Where(spf => spf.SubscriptionPlanId == planId)
            .ToListAsync(cancellationToken);
    }

    public async Task<SubscriptionPlanFeature?> GetPlanFeatureAsync(Guid planId, Guid featureId, CancellationToken cancellationToken = default)
    {
        return await _context.SubscriptionPlanFeatures
            .Include(spf => spf.PlanFeature)
            .FirstOrDefaultAsync(spf => spf.SubscriptionPlanId == planId && spf.PlanFeatureId == featureId, cancellationToken);
    }

    public async Task AddPlanFeatureAsync(SubscriptionPlanFeature planFeature, CancellationToken cancellationToken = default)
    {
        await _context.SubscriptionPlanFeatures.AddAsync(planFeature, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdatePlanFeatureAsync(SubscriptionPlanFeature planFeature, CancellationToken cancellationToken = default)
    {
        _context.SubscriptionPlanFeatures.Update(planFeature);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RemovePlanFeatureAsync(Guid planId, Guid featureId, CancellationToken cancellationToken = default)
    {
        var planFeature = await GetPlanFeatureAsync(planId, featureId, cancellationToken);
        if (planFeature != null)
        {
            _context.SubscriptionPlanFeatures.Remove(planFeature);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<Dictionary<Guid, int>> GetSubscriptionCountByPlanAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Subscriptions
            .GroupBy(s => s.SubscriptionPlanId)
            .Select(g => new { PlanId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.PlanId, x => x.Count, cancellationToken);
    }

    public async Task<Dictionary<Guid, decimal>> GetRevenueByPlanAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Subscriptions
            .Include(s => s.SubscriptionPlan)
            .Include(s => s.Payments)
            .GroupBy(s => s.SubscriptionPlanId)
            .Select(g => new { 
                PlanId = g.Key, 
                Revenue = g.SelectMany(s => s.Payments).Sum(p => p.Amount) 
            })
            .ToDictionaryAsync(x => x.PlanId, x => x.Revenue, cancellationToken);
    }
}