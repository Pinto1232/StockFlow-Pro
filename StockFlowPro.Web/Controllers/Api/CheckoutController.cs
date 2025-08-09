using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Web.Controllers.Api;

[ApiController]
[Route("api/checkout")]
[Produces("application/json")]
public class CheckoutController : ControllerBase
{
    private readonly ILogger<CheckoutController> _logger;
    private readonly Services.IPendingSubscriptionStore _pendingStore;
    private readonly ISubscriptionPlanRepository _planRepository;
    private readonly ISubscriptionRepository _subscriptionRepository;

    public CheckoutController(
        ILogger<CheckoutController> logger,
        Services.IPendingSubscriptionStore pendingStore,
        ISubscriptionPlanRepository planRepository,
        ISubscriptionRepository subscriptionRepository,
        StockFlowPro.Application.Interfaces.IBillingService? billing = null)
    {
        _logger = logger;
        _pendingStore = pendingStore;
        _planRepository = planRepository;
        _subscriptionRepository = subscriptionRepository;
        _billing = billing;
    }

    public record CheckoutRequest([Required] string PlanId, [Required] string Cadence); // cadence: "monthly" | "annual"
    public record CheckoutSessionResponse(string SessionId, string? RedirectUrl = null, string Status = "initialized");
    private readonly StockFlowPro.Application.Interfaces.IBillingService? _billing;

    [HttpPost("session")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CheckoutSessionResponse), 200)]
    public async Task<ActionResult<CheckoutSessionResponse>> CreateSession([FromBody] CheckoutRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { error = "Invalid checkout request" });
        }

        var sessionId = Guid.NewGuid().ToString("N");
        _pendingStore.CreateSession(sessionId, request.PlanId);
        _logger.LogInformation("[CHECKOUT] Created session {SessionId} for plan {PlanId} ({Cadence})", sessionId, request.PlanId, request.Cadence);

        string? redirectUrl = null;
        if (_billing is not null)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Guid? userId = Guid.TryParse(userIdStr, out var uid) ? uid : null;

            if (Guid.TryParse(request.PlanId, out var planGuid))
            {
                var (url, providerSessionId) = await _billing.CreateCheckoutSessionAsync(planGuid, request.Cadence, userId, email);
                if (!string.IsNullOrEmpty(providerSessionId)) { sessionId = providerSessionId; }
                redirectUrl = url;
            }
        }

        return Ok(new CheckoutSessionResponse(sessionId, redirectUrl));
    }

    [HttpPost("initialize")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CheckoutSessionResponse), 200)]
    public ActionResult<CheckoutSessionResponse> Initialize([FromBody] CheckoutRequest request)
    {
        var sessionId = Guid.NewGuid().ToString("N");
        _pendingStore.CreateSession(sessionId, request.PlanId);
        _logger.LogInformation("[CHECKOUT] Initialized session {SessionId} for plan {PlanId} ({Cadence})", sessionId, request.PlanId, request.Cadence);
        return Ok(new CheckoutSessionResponse(sessionId));
    }

    public record CheckoutConfirmRequest([Required] string SessionId, [Required, EmailAddress] string Email);
    public record CheckoutConfirmResponse(string SessionId, string Status);

    public record CheckoutAttachResponse(bool Attached, EntitlementsDto? Entitlements = null, string? Message = null);

    [HttpPost("confirm")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CheckoutConfirmResponse), 200)]
    public ActionResult<CheckoutConfirmResponse> Confirm([FromBody] CheckoutConfirmRequest request)
    {
        _pendingStore.LinkEmail(request.SessionId, request.Email);
        _logger.LogInformation("[CHECKOUT] Confirmed session {SessionId} for {Email}", request.SessionId, request.Email);
        return Ok(new CheckoutConfirmResponse(request.SessionId, "confirmed"));
    }

    /// <summary>
    /// Attaches the latest pending subscription for the authenticated user's email and returns fresh entitlements.
    /// </summary>
    [HttpPost("attach")]
    [Authorize]
    [ProducesResponseType(typeof(CheckoutAttachResponse), 200)]
    public async Task<ActionResult<CheckoutAttachResponse>> AttachForCurrentUser()
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(email) || !Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized(new CheckoutAttachResponse(false, null, "Invalid user session"));
        }

        var pending = _pendingStore.TryGetLatestByEmail(email);
        if (!pending.HasValue)
        {
            return NotFound(new CheckoutAttachResponse(false, null, "No pending subscription found for this user"));
        }

        if (!Guid.TryParse(pending.Value.PlanId, out var planGuid))
        {
            return BadRequest(new CheckoutAttachResponse(false, null, "Invalid plan id in pending subscription"));
        }

        var plan = await _planRepository.GetByIdAsync(planGuid);
        if (plan is null)
        {
            return NotFound(new CheckoutAttachResponse(false, null, "Subscription plan not found"));
        }

        var startDate = DateTime.UtcNow;
        DateTime? trialEnd = null;
        if (plan.TrialPeriodDays.HasValue && plan.TrialPeriodDays.Value > 0)
        {
            trialEnd = startDate.AddDays(plan.TrialPeriodDays.Value);
        }

        var subscription = new StockFlowPro.Domain.Entities.Subscription(
            userId,
            plan.Id,
            startDate,
            plan.Price,
            plan.Currency,
            trialEnd);

        await _subscriptionRepository.AddAsync(subscription);
        _logger.LogInformation("[CHECKOUT] Attached subscription {SubscriptionId} for user {UserId} on plan {PlanId}", subscription.Id, userId, plan.Id);

        // Clear pending entry
        _pendingStore.RemoveByEmail(email);

        // Build fresh entitlements from the plan we just attached
        var entitlements = new EntitlementsDto
        {
            HasAdvancedReporting = plan.HasAdvancedReporting,
            HasApiAccess = plan.HasApiAccess,
            HasPrioritySupport = plan.HasPrioritySupport,
            MaxUsers = plan.MaxUsers,
            MaxProjects = plan.MaxProjects,
            MaxStorageGB = plan.MaxStorageGB,
            PlanId = plan.Id,
            PlanName = plan.Name,
            Currency = plan.Currency,
            Price = plan.Price,
            BillingInterval = plan.BillingInterval.ToString(),
            IsTrial = subscription.IsInTrial(),
            TrialEndDate = subscription.TrialEndDate
        };

        return Ok(new CheckoutAttachResponse(true, entitlements));
    }
}
