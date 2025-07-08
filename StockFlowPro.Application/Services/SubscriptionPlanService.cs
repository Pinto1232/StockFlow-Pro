using MediatR;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Application.Queries.SubscriptionPlans;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Application.Services;

/// <summary>
/// Service implementation for subscription plan operations using MediatR
/// </summary>
public class SubscriptionPlanService : ISubscriptionPlanService
{
    private readonly IMediator _mediator;
    private readonly ISubscriptionPlanRepository _subscriptionPlanRepository;

    public SubscriptionPlanService(IMediator mediator, ISubscriptionPlanRepository subscriptionPlanRepository)
    {
        _mediator = mediator;
        _subscriptionPlanRepository = subscriptionPlanRepository;
    }

    public async Task<SubscriptionPlanDto?> GetByIdAsync(Guid id)
    {
        return await _mediator.Send(new GetSubscriptionPlanByIdQuery { Id = id });
    }

    public async Task<SubscriptionPlanDto?> GetByNameAsync(string name)
    {
        return await _mediator.Send(new GetSubscriptionPlanByNameQuery { Name = name });
    }

    public async Task<IEnumerable<SubscriptionPlanDto>> GetAllAsync()
    {
        return await _mediator.Send(new GetAllSubscriptionPlansQuery());
    }

    public async Task<IEnumerable<SubscriptionPlanDto>> GetActiveAsync()
    {
        return await _mediator.Send(new GetAllSubscriptionPlansQuery { ActiveOnly = true });
    }

    public async Task<IEnumerable<SubscriptionPlanDto>> GetPublicPlansAsync()
    {
        return await _mediator.Send(new GetAllSubscriptionPlansQuery { PublicOnly = true });
    }

    public async Task<IEnumerable<SubscriptionPlanDto>> GetByBillingIntervalAsync(BillingInterval billingInterval)
    {
        // For this method, we'll use the repository directly since it's a specific filter
        var plans = await _subscriptionPlanRepository.GetByBillingIntervalAsync(billingInterval);
        return plans.Select(p => new SubscriptionPlanDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            Currency = p.Currency,
            BillingInterval = p.BillingInterval,
            BillingIntervalCount = p.BillingIntervalCount,
            IsActive = p.IsActive,
            IsPublic = p.IsPublic,
            TrialPeriodDays = p.TrialPeriodDays,
            MaxUsers = p.MaxUsers,
            MaxProjects = p.MaxProjects,
            MaxStorageGB = p.MaxStorageGB,
            HasAdvancedReporting = p.HasAdvancedReporting,
            HasApiAccess = p.HasApiAccess,
            HasPrioritySupport = p.HasPrioritySupport,
            Features = p.Features,
            Metadata = p.Metadata,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt,
            SortOrder = p.SortOrder,
            StripeProductId = p.StripeProductId,
            StripePriceId = p.StripePriceId,
            PayPalPlanId = p.PayPalPlanId
        });
    }

    public async Task<IEnumerable<SubscriptionPlanDto>> GetOrderedBySortOrderAsync()
    {
        var plans = await _subscriptionPlanRepository.GetOrderedBySortOrderAsync();
        return plans.Select(p => new SubscriptionPlanDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            Currency = p.Currency,
            BillingInterval = p.BillingInterval,
            BillingIntervalCount = p.BillingIntervalCount,
            IsActive = p.IsActive,
            IsPublic = p.IsPublic,
            TrialPeriodDays = p.TrialPeriodDays,
            MaxUsers = p.MaxUsers,
            MaxProjects = p.MaxProjects,
            MaxStorageGB = p.MaxStorageGB,
            HasAdvancedReporting = p.HasAdvancedReporting,
            HasApiAccess = p.HasApiAccess,
            HasPrioritySupport = p.HasPrioritySupport,
            Features = p.Features,
            Metadata = p.Metadata,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt,
            SortOrder = p.SortOrder,
            StripeProductId = p.StripeProductId,
            StripePriceId = p.StripePriceId,
            PayPalPlanId = p.PayPalPlanId
        });
    }

    public async Task<SubscriptionPlanDto?> GetCheapestPlanAsync()
    {
        var plan = await _subscriptionPlanRepository.GetCheapestPlanAsync();
        if (plan == null) return null;

        return new SubscriptionPlanDto
        {
            Id = plan.Id,
            Name = plan.Name,
            Description = plan.Description,
            Price = plan.Price,
            Currency = plan.Currency,
            BillingInterval = plan.BillingInterval,
            BillingIntervalCount = plan.BillingIntervalCount,
            IsActive = plan.IsActive,
            IsPublic = plan.IsPublic,
            TrialPeriodDays = plan.TrialPeriodDays,
            MaxUsers = plan.MaxUsers,
            MaxProjects = plan.MaxProjects,
            MaxStorageGB = plan.MaxStorageGB,
            HasAdvancedReporting = plan.HasAdvancedReporting,
            HasApiAccess = plan.HasApiAccess,
            HasPrioritySupport = plan.HasPrioritySupport,
            Features = plan.Features,
            Metadata = plan.Metadata,
            CreatedAt = plan.CreatedAt,
            UpdatedAt = plan.UpdatedAt,
            SortOrder = plan.SortOrder,
            StripeProductId = plan.StripeProductId,
            StripePriceId = plan.StripePriceId,
            PayPalPlanId = plan.PayPalPlanId
        };
    }

    public async Task<SubscriptionPlanDto?> GetMostExpensivePlanAsync()
    {
        var plan = await _subscriptionPlanRepository.GetMostExpensivePlanAsync();
        if (plan == null) return null;

        return new SubscriptionPlanDto
        {
            Id = plan.Id,
            Name = plan.Name,
            Description = plan.Description,
            Price = plan.Price,
            Currency = plan.Currency,
            BillingInterval = plan.BillingInterval,
            BillingIntervalCount = plan.BillingIntervalCount,
            IsActive = plan.IsActive,
            IsPublic = plan.IsPublic,
            TrialPeriodDays = plan.TrialPeriodDays,
            MaxUsers = plan.MaxUsers,
            MaxProjects = plan.MaxProjects,
            MaxStorageGB = plan.MaxStorageGB,
            HasAdvancedReporting = plan.HasAdvancedReporting,
            HasApiAccess = plan.HasApiAccess,
            HasPrioritySupport = plan.HasPrioritySupport,
            Features = plan.Features,
            Metadata = plan.Metadata,
            CreatedAt = plan.CreatedAt,
            UpdatedAt = plan.UpdatedAt,
            SortOrder = plan.SortOrder,
            StripeProductId = plan.StripeProductId,
            StripePriceId = plan.StripePriceId,
            PayPalPlanId = plan.PayPalPlanId
        };
    }

    public async Task<SubscriptionPlanDto?> GetByStripeProductIdAsync(string stripeProductId)
    {
        var plan = await _subscriptionPlanRepository.GetByStripeProductIdAsync(stripeProductId);
        if (plan == null) return null;

        return new SubscriptionPlanDto
        {
            Id = plan.Id,
            Name = plan.Name,
            Description = plan.Description,
            Price = plan.Price,
            Currency = plan.Currency,
            BillingInterval = plan.BillingInterval,
            BillingIntervalCount = plan.BillingIntervalCount,
            IsActive = plan.IsActive,
            IsPublic = plan.IsPublic,
            TrialPeriodDays = plan.TrialPeriodDays,
            MaxUsers = plan.MaxUsers,
            MaxProjects = plan.MaxProjects,
            MaxStorageGB = plan.MaxStorageGB,
            HasAdvancedReporting = plan.HasAdvancedReporting,
            HasApiAccess = plan.HasApiAccess,
            HasPrioritySupport = plan.HasPrioritySupport,
            Features = plan.Features,
            Metadata = plan.Metadata,
            CreatedAt = plan.CreatedAt,
            UpdatedAt = plan.UpdatedAt,
            SortOrder = plan.SortOrder,
            StripeProductId = plan.StripeProductId,
            StripePriceId = plan.StripePriceId,
            PayPalPlanId = plan.PayPalPlanId
        };
    }

    public async Task<SubscriptionPlanDto?> GetByStripePriceIdAsync(string stripePriceId)
    {
        var plan = await _subscriptionPlanRepository.GetByStripePriceIdAsync(stripePriceId);
        if (plan == null) return null;

        return new SubscriptionPlanDto
        {
            Id = plan.Id,
            Name = plan.Name,
            Description = plan.Description,
            Price = plan.Price,
            Currency = plan.Currency,
            BillingInterval = plan.BillingInterval,
            BillingIntervalCount = plan.BillingIntervalCount,
            IsActive = plan.IsActive,
            IsPublic = plan.IsPublic,
            TrialPeriodDays = plan.TrialPeriodDays,
            MaxUsers = plan.MaxUsers,
            MaxProjects = plan.MaxProjects,
            MaxStorageGB = plan.MaxStorageGB,
            HasAdvancedReporting = plan.HasAdvancedReporting,
            HasApiAccess = plan.HasApiAccess,
            HasPrioritySupport = plan.HasPrioritySupport,
            Features = plan.Features,
            Metadata = plan.Metadata,
            CreatedAt = plan.CreatedAt,
            UpdatedAt = plan.UpdatedAt,
            SortOrder = plan.SortOrder,
            StripeProductId = plan.StripeProductId,
            StripePriceId = plan.StripePriceId,
            PayPalPlanId = plan.PayPalPlanId
        };
    }

    public async Task<SubscriptionPlanDto?> GetByPayPalPlanIdAsync(string payPalPlanId)
    {
        var plan = await _subscriptionPlanRepository.GetByPayPalPlanIdAsync(payPalPlanId);
        if (plan == null) return null;

        return new SubscriptionPlanDto
        {
            Id = plan.Id,
            Name = plan.Name,
            Description = plan.Description,
            Price = plan.Price,
            Currency = plan.Currency,
            BillingInterval = plan.BillingInterval,
            BillingIntervalCount = plan.BillingIntervalCount,
            IsActive = plan.IsActive,
            IsPublic = plan.IsPublic,
            TrialPeriodDays = plan.TrialPeriodDays,
            MaxUsers = plan.MaxUsers,
            MaxProjects = plan.MaxProjects,
            MaxStorageGB = plan.MaxStorageGB,
            HasAdvancedReporting = plan.HasAdvancedReporting,
            HasApiAccess = plan.HasApiAccess,
            HasPrioritySupport = plan.HasPrioritySupport,
            Features = plan.Features,
            Metadata = plan.Metadata,
            CreatedAt = plan.CreatedAt,
            UpdatedAt = plan.UpdatedAt,
            SortOrder = plan.SortOrder,
            StripeProductId = plan.StripeProductId,
            StripePriceId = plan.StripePriceId,
            PayPalPlanId = plan.PayPalPlanId
        };
    }

    public async Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null)
    {
        return await _subscriptionPlanRepository.ExistsByNameAsync(name, excludeId);
    }
}