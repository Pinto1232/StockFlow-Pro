using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.Interfaces;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.Extensions.Options;
using StockFlowPro.Shared.Configuration;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/billing")]
[Produces("application/json")]
public class BillingController : ControllerBase
{
    private readonly IBillingService _billingService;
    private readonly ILogger<BillingController> _logger;
    private readonly StripeOptions _stripeOptions;

    public BillingController(IBillingService billingService, ILogger<BillingController> logger, IOptions<StripeOptions> stripeOptions)
    {
        _billingService = billingService;
        _logger = logger;
        _stripeOptions = stripeOptions.Value;
    }

    public record BillingCheckoutRequest([Required] Guid PlanId, [Required] string Cadence); // "monthly" | "annual"
    public record BillingCheckoutResponse(string? Url);

    /// <summary>
    /// Creates a hosted checkout session (Stripe Checkout) for the authenticated user and selected plan.
    /// </summary>
    [HttpPost("checkout")]
    [Authorize]
    [ProducesResponseType(typeof(BillingCheckoutResponse), 200)]
    public async Task<ActionResult<BillingCheckoutResponse>> CreateCheckout([FromBody] BillingCheckoutRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Invalid request" });
        }

        if (!string.Equals(request.Cadence, "monthly", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(request.Cadence, "annual", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Cadence must be 'monthly' or 'annual'" });
        }

        if (!_stripeOptions.Enabled || string.IsNullOrWhiteSpace(_stripeOptions.SecretKey))
        {
            _logger.LogWarning("[BILLING] Stripe not enabled or missing secret key");
            return StatusCode(503, new { message = "Payments are temporarily unavailable. Please try again later." });
        }

        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized(new { message = "Invalid user session" });
        }

        try
        {
            var (url, _) = await _billingService.CreateCheckoutSessionAsync(request.PlanId, request.Cadence, userId, null);
            if (string.IsNullOrWhiteSpace(url))
            {
                _logger.LogWarning("[BILLING] No checkout URL returned for user {UserId} plan {PlanId} cadence {Cadence}", userId, request.PlanId, request.Cadence);
                return StatusCode(502, new { message = "Unable to create checkout session. Check plan price configuration." });
            }
            return Ok(new BillingCheckoutResponse(url));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[BILLING] Error creating checkout session for user {UserId} plan {PlanId}", userId, request.PlanId);
            return StatusCode(500, new { message = "Failed to create checkout session" });
        }
    }

    /// <summary>
    /// Returns billing configuration status for diagnostics.
    /// </summary>
    [HttpGet("status")]
    [Authorize]
    public ActionResult GetStatus()
    {
        return Ok(new
        {
            enabled = _stripeOptions.Enabled,
            hasSecret = !string.IsNullOrWhiteSpace(_stripeOptions.SecretKey),
            hasWebhook = !string.IsNullOrWhiteSpace(_stripeOptions.WebhookSecret),
            successUrl = _stripeOptions.SuccessUrl,
            cancelUrl = _stripeOptions.CancelUrl
        });
    }
}