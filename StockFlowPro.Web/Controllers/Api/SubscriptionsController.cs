using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Web.Controllers.Api;

/// <summary>
/// API controller for subscriptions
/// </summary>
[ApiController]
[Route("api/subscriptions")]
[Produces("application/json")]
public class SubscriptionsController : ControllerBase
{
    private readonly ISubscriptionPlanService _subscriptionPlanService;
    private readonly ILogger<SubscriptionsController> _logger;

    public SubscriptionsController(
        ISubscriptionPlanService subscriptionPlanService,
        ILogger<SubscriptionsController> logger)
    {
        _subscriptionPlanService = subscriptionPlanService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all public subscription plans (monthly only)
    /// </summary>
    /// <returns>Collection of public monthly subscription plans</returns>
    [HttpGet("plans")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<SubscriptionPlanDto>), 200)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<IEnumerable<SubscriptionPlanDto>>> GetPublicPlans()
    {
        try
        {
            _logger.LogInformation("Fetching public monthly subscription plans via SubscriptionsController");
            var allPlans = await _subscriptionPlanService.GetPublicPlansAsync();
            
            // Filter out annual plans (BillingInterval.Annual = 4) and only return monthly plans
            var monthlyPlans = allPlans.Where(p => p.BillingInterval == BillingInterval.Monthly).ToList();
            
            _logger.LogInformation("Successfully retrieved {Count} public monthly subscription plans", monthlyPlans.Count());
            return Ok(monthlyPlans);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching public monthly subscription plans via SubscriptionsController");
            return StatusCode(500, new { error = "An error occurred while fetching subscription plans" });
        }
    }
}
