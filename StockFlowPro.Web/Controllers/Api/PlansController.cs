using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;

namespace StockFlowPro.Web.Controllers.Api;

/// <summary>
/// API controller for plans (alias for subscription plans)
/// </summary>
[ApiController]
[Route("api/plans")]
[Produces("application/json")]
public class PlansController : ControllerBase
{
    private readonly ISubscriptionPlanService _subscriptionPlanService;
    private readonly ILogger<PlansController> _logger;

    public PlansController(
        ISubscriptionPlanService subscriptionPlanService,
        ILogger<PlansController> logger)
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
            _logger.LogInformation("Fetching public subscription plans via PlansController");
            var plans = await _subscriptionPlanService.GetPublicPlansAsync();
            
            _logger.LogInformation("Successfully retrieved {Count} public subscription plans", plans.Count());
            return Ok(plans);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching public subscription plans via PlansController");
            return StatusCode(500, new { error = "An error occurred while fetching subscription plans" });
        }
    }
}
