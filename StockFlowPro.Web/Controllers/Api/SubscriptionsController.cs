using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;

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
    /// Gets all public subscription plans
    /// </summary>
    /// <returns>Collection of public subscription plans</returns>
    [HttpGet("plans")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<SubscriptionPlanDto>), 200)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<IEnumerable<SubscriptionPlanDto>>> GetPublicPlans()
    {
        try
        {
            _logger.LogInformation("Fetching public subscription plans via SubscriptionsController");
            var plans = await _subscriptionPlanService.GetPublicPlansAsync();
            
            _logger.LogInformation("Successfully retrieved {Count} public subscription plans", plans.Count());
            return Ok(plans);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching public subscription plans via SubscriptionsController");
            return StatusCode(500, new { error = "An error occurred while fetching subscription plans" });
        }
    }
}
