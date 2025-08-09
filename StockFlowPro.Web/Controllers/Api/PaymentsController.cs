using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.Interfaces;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/payments/stripe")]
[Produces("application/json")]
public class PaymentsController : ControllerBase
{
    private readonly IBillingService _billing;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(IBillingService billing, ILogger<PaymentsController> logger)
    {
        _billing = billing;
        _logger = logger;
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> StripeWebhook()
    {
        using var reader = new StreamReader(Request.Body);
        var payload = await reader.ReadToEndAsync();
        var signature = Request.Headers["Stripe-Signature"].ToString();
        await _billing.ProcessWebhookAsync("stripe", signature, payload);
        return Ok();
    }
}
