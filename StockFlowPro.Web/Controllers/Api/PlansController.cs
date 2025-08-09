using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Domain.Enums;

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
    /// Gets all public subscription plans (monthly only)
    /// </summary>
    /// <returns>Collection of public monthly subscription plans</returns>
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<SubscriptionPlanDto>), 200)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<IEnumerable<SubscriptionPlanDto>>> GetPublicPlans()
    {
        try
        {
            _logger.LogInformation("Fetching public monthly subscription plans via PlansController");
            var allPlans = await _subscriptionPlanService.GetPublicPlansAsync();
            
            // Filter out annual plans (BillingInterval.Annual = 4) and only return monthly plans
            var monthlyPlans = allPlans.Where(p => p.BillingInterval == BillingInterval.Monthly).ToList();
            
            _logger.LogInformation("Successfully retrieved {Count} public monthly subscription plans", monthlyPlans.Count());
            return Ok(monthlyPlans);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching public monthly subscription plans via PlansController");
            return StatusCode(500, new { error = "An error occurred while fetching subscription plans" });
        }
    }
}
