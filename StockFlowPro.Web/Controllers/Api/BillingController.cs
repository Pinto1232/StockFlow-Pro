using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/billing")]
[Produces("application/json")]
public class BillingController : ControllerBase
{
    private readonly ILogger<BillingController> _logger;
    private readonly Services.IPendingSubscriptionStore _pendingStore;

    public BillingController(ILogger<BillingController> logger, Services.IPendingSubscriptionStore pendingStore)
    {
        _logger = logger;
        _pendingStore = pendingStore;
    }

    public record HostedCheckoutRequest([Required] string PlanId, [Required] string Cadence /* "monthly" | "annual" */);
    public record HostedCheckoutResponse(string? Url);

    /// <summary>
    /// Starts a hosted checkout (simulated) and returns a URL to redirect the user.
    /// In a real integration, this would call Stripe/PayPal/PayFast to create a session.
    /// </summary>
    [HttpPost("checkout")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(HostedCheckoutResponse), 200)]
    public ActionResult<HostedCheckoutResponse> StartHostedCheckout([FromBody] HostedCheckoutRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { error = "Invalid checkout request" });
        }

        // Create a pending session and optionally link to authenticated user email later on success page
        var sessionId = Guid.NewGuid().ToString("N");
        _pendingStore.CreateSession(sessionId, request.PlanId);
        _logger.LogInformation("[BILLING] Hosted checkout session {SessionId} created for plan {PlanId} ({Cadence})", sessionId, request.PlanId, request.Cadence);

        // For this implementation, redirect to success page with the session id
        // In real-world, the payment provider will redirect to success/cancel URLs you configure
        var successUrl = $"/checkout/success?session_id={sessionId}";
        return Ok(new HostedCheckoutResponse(successUrl));
    }
}
