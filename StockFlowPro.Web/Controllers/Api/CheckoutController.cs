using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/checkout")]
[Produces("application/json")]
public class CheckoutController : ControllerBase
{
    private readonly ILogger<CheckoutController> _logger;

    public CheckoutController(ILogger<CheckoutController> logger)
    {
        _logger = logger;
    }

    public record CheckoutRequest([Required] string PlanId, [Required] string Cadence); // cadence: "monthly" | "annual"
    public record CheckoutSessionResponse(string SessionId, string? RedirectUrl = null, string Status = "initialized");

    [HttpPost("session")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CheckoutSessionResponse), 200)]
    public ActionResult<CheckoutSessionResponse> CreateSession([FromBody] CheckoutRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { error = "Invalid checkout request" });
        }

        var sessionId = Guid.NewGuid().ToString("N");
        _logger.LogInformation("[CHECKOUT] Created session {SessionId} for plan {PlanId} ({Cadence})", sessionId, request.PlanId, request.Cadence);

        // No redirect for modal flow; frontend will complete steps and confirm
        return Ok(new CheckoutSessionResponse(sessionId));
    }

    [HttpPost("initialize")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CheckoutSessionResponse), 200)]
    public ActionResult<CheckoutSessionResponse> Initialize([FromBody] CheckoutRequest request)
    {
        var sessionId = Guid.NewGuid().ToString("N");
        _logger.LogInformation("[CHECKOUT] Initialized session {SessionId} for plan {PlanId} ({Cadence})", sessionId, request.PlanId, request.Cadence);
        return Ok(new CheckoutSessionResponse(sessionId));
    }

    // Optional confirm endpoint stub for later extension
    public record CheckoutConfirmRequest([Required] string SessionId, [Required] string Email);
    public record CheckoutConfirmResponse(string SessionId, string Status);

    [HttpPost("confirm")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CheckoutConfirmResponse), 200)]
    public ActionResult<CheckoutConfirmResponse> Confirm([FromBody] CheckoutConfirmRequest request)
    {
        _logger.LogInformation("[CHECKOUT] Confirmed session {SessionId} for {Email}", request.SessionId, request.Email);
        return Ok(new CheckoutConfirmResponse(request.SessionId, "confirmed"));
    }
}
