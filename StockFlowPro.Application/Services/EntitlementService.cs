using Microsoft.Extensions.Caching.Memory;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Domain.Repositories;
using System.Linq;

namespace StockFlowPro.Application.Services;

public class EntitlementService : IEntitlementService
{
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly ISubscriptionPlanRepository _planRepository;
    private readonly IMemoryCache _cache;

    public EntitlementService(
        ISubscriptionRepository subscriptionRepository,
        ISubscriptionPlanRepository planRepository,
        IMemoryCache cache)
    {
        _subscriptionRepository = subscriptionRepository;
        _planRepository = planRepository;
        _cache = cache;
    }

    public async Task<EntitlementsDto> GetEntitlementsForUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"entitlements:{userId}";
        if (_cache.TryGetValue(cacheKey, out EntitlementsDto? cached) && cached is not null)
        {
            return cached;
        }

        var subscription = (await _subscriptionRepository.GetByUserIdAllAsync(userId, cancellationToken))
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefault(s => s.IsActive());

        if (subscription == null)
        {
            // No subscription: treat as free/basic with no premium features
            var none = new EntitlementsDto
            {
                HasAdvancedReporting = false,
                HasApiAccess = false,
                HasPrioritySupport = false,
                MaxUsers = 1,
                MaxProjects = 3,
                MaxStorageGB = 1,
                PlanId = Guid.Empty,
                PlanName = "Free",
                Currency = "USD",
                Price = 0,
                BillingInterval = "Monthly",
                IsTrial = false,
                TrialEndDate = null
            };
            _cache.Set(cacheKey, none, TimeSpan.FromMinutes(5));
            return none;
        }

        var plan = await _planRepository.GetByIdAsync(subscription.SubscriptionPlanId, cancellationToken);
        if (plan == null)
        {
            var none = new EntitlementsDto
            {
                HasAdvancedReporting = false,
                HasApiAccess = false,
                HasPrioritySupport = false,
                MaxUsers = 1,
                MaxProjects = 3,
                MaxStorageGB = 1,
                PlanId = Guid.Empty,
                PlanName = "Free",
                Currency = "USD",
                Price = 0,
                BillingInterval = "Monthly",
                IsTrial = false
            };
            _cache.Set(cacheKey, none, TimeSpan.FromMinutes(5));
            return none;
        }

        var ent = new EntitlementsDto
        {
            HasAdvancedReporting = plan.HasAdvancedReporting,
            HasApiAccess = plan.HasApiAccess,
            HasPrioritySupport = plan.HasPrioritySupport,
            MaxUsers = plan.MaxUsers,
            MaxProjects = plan.MaxProjects,
            MaxStorageGB = plan.MaxStorageGB,
            PlanId = plan.Id,
            PlanName = plan.Name,
            Currency = plan.Currency,
            Price = plan.Price,
            BillingInterval = plan.BillingInterval.ToString(),
            IsTrial = subscription.IsInTrial(),
            TrialEndDate = subscription.TrialEndDate
        };

        _cache.Set(cacheKey, ent, TimeSpan.FromMinutes(5));
        return ent;
    }
}
