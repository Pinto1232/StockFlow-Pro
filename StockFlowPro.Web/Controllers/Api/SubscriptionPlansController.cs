using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace StockFlowPro.Web.Controllers.Api;

/// <summary>
/// API controller for subscription plan operations
/// </summary>
[ApiController]
[Route("api/subscription-plans")]
[Produces("application/json")]
public class SubscriptionPlansController : ControllerBase
{
    private readonly ISubscriptionPlanService _subscriptionPlanService;
    private readonly ILogger<SubscriptionPlansController> _logger;

    public SubscriptionPlansController(
        ISubscriptionPlanService subscriptionPlanService,
        ILogger<SubscriptionPlansController> logger)
    {
        _subscriptionPlanService = subscriptionPlanService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all public subscription plans
    /// </summary>
    /// <returns>Collection of public subscription plans</returns>
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<SubscriptionPlanDto>), 200)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<IEnumerable<SubscriptionPlanDto>>> GetPublicPlans()
    {
        try
        {
            _logger.LogInformation("Fetching public subscription plans");
            var plans = await _subscriptionPlanService.GetPublicPlansAsync();
            
            _logger.LogInformation("Successfully retrieved {Count} public subscription plans", plans.Count());
            return Ok(plans);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching public subscription plans");
            return StatusCode(500, new { error = "An error occurred while fetching subscription plans" });
        }
    }

    /// <summary>
    /// Gets all active subscription plans
    /// </summary>
    /// <returns>Collection of active subscription plans</returns>
    [HttpGet("active")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<SubscriptionPlanDto>), 200)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<IEnumerable<SubscriptionPlanDto>>> GetActivePlans()
    {
        try
        {
            _logger.LogInformation("Fetching active subscription plans");
            var plans = await _subscriptionPlanService.GetActiveAsync();
            
            _logger.LogInformation("Successfully retrieved {Count} active subscription plans", plans.Count());
            return Ok(plans);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching active subscription plans");
            return StatusCode(500, new { error = "An error occurred while fetching active subscription plans" });
        }
    }

    /// <summary>
    /// Gets all subscription plans (admin only)
    /// </summary>
    /// <returns>Collection of all subscription plans</returns>
    [HttpGet("all")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(IEnumerable<SubscriptionPlanDto>), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<IEnumerable<SubscriptionPlanDto>>> GetAllPlans()
    {
        try
        {
            _logger.LogInformation("Fetching all subscription plans");
            var plans = await _subscriptionPlanService.GetAllAsync();
            
            _logger.LogInformation("Successfully retrieved {Count} subscription plans", plans.Count());
            return Ok(plans);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching all subscription plans");
            return StatusCode(500, new { error = "An error occurred while fetching all subscription plans" });
        }
    }

    /// <summary>
    /// Gets a subscription plan by ID
    /// </summary>
    /// <param name="id">The plan ID</param>
    /// <returns>Subscription plan if found</returns>
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(SubscriptionPlanDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<SubscriptionPlanDto>> GetPlanById(Guid id)
    {
        try
        {
            _logger.LogInformation("Fetching subscription plan with ID: {PlanId}", id);
            var plan = await _subscriptionPlanService.GetByIdAsync(id);
            
            if (plan == null)
            {
                _logger.LogWarning("Subscription plan with ID {PlanId} not found", id);
                return NotFound(new { error = "Subscription plan not found" });
            }
            
            _logger.LogInformation("Successfully retrieved subscription plan: {PlanName}", plan.Name);
            return Ok(plan);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching subscription plan with ID: {PlanId}", id);
            return StatusCode(500, new { error = "An error occurred while fetching the subscription plan" });
        }
    }

    /// <summary>
    /// Gets a subscription plan by name
    /// </summary>
    /// <param name="name">The plan name</param>
    /// <returns>Subscription plan if found</returns>
    [HttpGet("name/{name}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(SubscriptionPlanDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<SubscriptionPlanDto>> GetPlanByName([Required] string name)
    {
        try
        {
            _logger.LogInformation("Fetching subscription plan with name: {PlanName}", name);
            var plan = await _subscriptionPlanService.GetByNameAsync(name);
            
            if (plan == null)
            {
                _logger.LogWarning("Subscription plan with name '{PlanName}' not found", name);
                return NotFound(new { error = "Subscription plan not found" });
            }
            
            _logger.LogInformation("Successfully retrieved subscription plan: {PlanName}", plan.Name);
            return Ok(plan);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching subscription plan with name: {PlanName}", name);
            return StatusCode(500, new { error = "An error occurred while fetching the subscription plan" });
        }
    }

    /// <summary>
    /// Gets subscription plans by billing interval
    /// </summary>
    /// <param name="billingInterval">The billing interval</param>
    /// <returns>Collection of subscription plans with the specified billing interval</returns>
    [HttpGet("billing-interval/{billingInterval}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<SubscriptionPlanDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<IEnumerable<SubscriptionPlanDto>>> GetPlansByBillingInterval(BillingInterval billingInterval)
    {
        try
        {
            _logger.LogInformation("Fetching subscription plans with billing interval: {BillingInterval}", billingInterval);
            var plans = await _subscriptionPlanService.GetByBillingIntervalAsync(billingInterval);
            
            _logger.LogInformation("Successfully retrieved {Count} subscription plans with billing interval {BillingInterval}", 
                plans.Count(), billingInterval);
            return Ok(plans);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching subscription plans with billing interval: {BillingInterval}", billingInterval);
            return StatusCode(500, new { error = "An error occurred while fetching subscription plans" });
        }
    }

    /// <summary>
    /// Gets subscription plans ordered by sort order
    /// </summary>
    /// <returns>Collection of subscription plans ordered by sort order</returns>
    [HttpGet("ordered")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<SubscriptionPlanDto>), 200)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<IEnumerable<SubscriptionPlanDto>>> GetOrderedPlans()
    {
        try
        {
            _logger.LogInformation("Fetching subscription plans ordered by sort order");
            var plans = await _subscriptionPlanService.GetOrderedBySortOrderAsync();
            
            _logger.LogInformation("Successfully retrieved {Count} ordered subscription plans", plans.Count());
            return Ok(plans);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching ordered subscription plans");
            return StatusCode(500, new { error = "An error occurred while fetching ordered subscription plans" });
        }
    }

    /// <summary>
    /// Gets the cheapest subscription plan
    /// </summary>
    /// <returns>The cheapest subscription plan</returns>
    [HttpGet("cheapest")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(SubscriptionPlanDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<SubscriptionPlanDto>> GetCheapestPlan()
    {
        try
        {
            _logger.LogInformation("Fetching cheapest subscription plan");
            var plan = await _subscriptionPlanService.GetCheapestPlanAsync();
            
            if (plan == null)
            {
                _logger.LogWarning("No subscription plans found");
                return NotFound(new { error = "No subscription plans found" });
            }
            
            _logger.LogInformation("Successfully retrieved cheapest subscription plan: {PlanName}", plan.Name);
            return Ok(plan);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching cheapest subscription plan");
            return StatusCode(500, new { error = "An error occurred while fetching the cheapest subscription plan" });
        }
    }
}
