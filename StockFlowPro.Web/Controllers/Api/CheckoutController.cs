using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;

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
    private readonly IEntitlementService _entitlementService;
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;
    private readonly IEmailVerificationService _emailVerificationService;
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;

    public CheckoutController(
        ILogger<CheckoutController> logger,
        Services.IPendingSubscriptionStore pendingStore,
        ISubscriptionPlanRepository planRepository,
        ISubscriptionRepository subscriptionRepository,
        IEntitlementService entitlementService,
        IUserRepository userRepository,
        IEmailService emailService,
        IEmailVerificationService emailVerificationService,
        IWebHostEnvironment environment,
        IConfiguration configuration)
    {
        _logger = logger;
        _pendingStore = pendingStore;
        _planRepository = planRepository;
        _subscriptionRepository = subscriptionRepository;
        _entitlementService = entitlementService;
        _userRepository = userRepository;
        _emailService = emailService;
        _emailVerificationService = emailVerificationService;
        _environment = environment;
        _configuration = configuration;
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
        _pendingStore.CreateSession(sessionId, request.PlanId);
        _logger.LogInformation("[CHECKOUT] Created session {SessionId} for plan {PlanId} ({Cadence})", sessionId, request.PlanId, request.Cadence);

        return Ok(new CheckoutSessionResponse(sessionId));
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
    public record CheckoutAttachRequest(string? SessionId = null);

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
    public async Task<ActionResult<CheckoutAttachResponse>> AttachForCurrentUser([FromBody] CheckoutAttachRequest? request)
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(email) || !Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized(new CheckoutAttachResponse(false, null, "Invalid user session"));
        }

        // Prefer explicit session id when supplied, fallback to latest by email
        (string SessionId, string PlanId, string? Email, DateTime CreatedAt)? pending;
        if (!string.IsNullOrWhiteSpace(request?.SessionId))
        {
            pending = _pendingStore.TryGetBySessionId(request!.SessionId!);
        }
        else
        {
            var byEmail = _pendingStore.TryGetLatestByEmail(email);
            pending = byEmail.HasValue ? (byEmail.Value.SessionId, byEmail.Value.PlanId, byEmail.Value.Email, byEmail.Value.CreatedAt) : null;
        }
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

        // Invalidate server-side entitlements cache so next fetch returns fresh plan
        _entitlementService.InvalidateEntitlementsForUser(userId);

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

    public record EmailCheckRequest([Required, EmailAddress] string Email);
    public record EmailCheckResponse(bool AccountExists, string Status, string? Message = null);

    /// <summary>
    /// Check if an email belongs to an existing account
    /// </summary>
    [HttpPost("check-email")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(EmailCheckResponse), 200)]
    public async Task<ActionResult<EmailCheckResponse>> CheckEmail([FromBody] EmailCheckRequest request)
    {
        try
        {
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            var accountExists = existingUser != null;

            _logger.LogInformation("[CHECKOUT] Email check for {Email}: Account exists = {AccountExists}", 
                request.Email, accountExists);

            return Ok(new EmailCheckResponse(
                accountExists, 
                accountExists ? "existing_account" : "new_account",
                accountExists ? "Please sign in to continue with your purchase" : "We'll create an account for you"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[CHECKOUT] Error checking email: {Email}", request.Email);
            return StatusCode(500, new EmailCheckResponse(false, "error", "Unable to verify email"));
        }
    }

    public record SendVerificationRequest([Required, EmailAddress] string Email, [Required] string SessionId, [Required] string PlanId);
    public record SendVerificationResponse(bool Sent, string Status, string? Message = null, string? Token = null);

    /// <summary>
    /// Send verification email for checkout process
    /// </summary>
    [HttpPost("send-verification")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(SendVerificationResponse), 200)]
    public async Task<ActionResult<SendVerificationResponse>> SendVerificationEmail([FromBody] SendVerificationRequest request)
    {
        try
        {
            // Check if email already has an account
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null)
            {
                // Send existing account notification
                var loginUrl = $"{GetBaseUrl()}/login?returnUrl={Uri.EscapeDataString($"/checkout/success?session_id={request.SessionId}")}";
                var sent = await _emailService.SendExistingAccountNotificationAsync(request.Email, loginUrl);
                
                if (sent)
                {
                    _logger.LogInformation("[CHECKOUT] Sent existing account notification to {Email}", request.Email);
                    return Ok(new SendVerificationResponse(true, "existing_account", 
                        "We found an existing account. Please check your email for sign-in instructions."));
                }
                else
                {
                    return StatusCode(500, new SendVerificationResponse(false, "error", 
                        "Failed to send email notification"));
                }
            }

            // Get plan details for the email
            if (!Guid.TryParse(request.PlanId, out var planGuid))
            {
                return BadRequest(new SendVerificationResponse(false, "error", "Invalid plan ID"));
            }

            var plan = await _planRepository.GetByIdAsync(planGuid);
            if (plan == null)
            {
                return NotFound(new SendVerificationResponse(false, "error", "Plan not found"));
            }

            // Generate verification token
            var verificationToken = await _emailVerificationService.GenerateVerificationTokenAsync(
                request.Email, "checkout_verification");

            // Send verification email
            var emailSent = await _emailService.SendCheckoutVerificationEmailAsync(
                request.Email, verificationToken, request.SessionId, plan.Name);

            if (emailSent)
            {
                // Link the session with the email
                _pendingStore.LinkEmail(request.SessionId, request.Email);
                
                _logger.LogInformation("[CHECKOUT] Sent verification email to {Email} for session {SessionId}", 
                    request.Email, request.SessionId);
                
                // Include token in response for development/testing purposes
                var tokenForResponse = _environment.IsDevelopment() ? verificationToken : null;
                
                return Ok(new SendVerificationResponse(true, "verification_sent", 
                    "Please check your email and click the verification link to complete your purchase.", tokenForResponse));
            }
            else
            {
                return StatusCode(500, new SendVerificationResponse(false, "error", 
                    "Failed to send verification email"));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[CHECKOUT] Error sending verification email to {Email}", request.Email);
            return StatusCode(500, new SendVerificationResponse(false, "error", 
                "An error occurred while sending the verification email"));
        }
    }

    public record VerifyEmailRequest([Required] string Token, [Required] string SessionId);
    public record VerifyEmailResponse(bool Verified, string Status, string? Message = null, string? RedirectUrl = null);

    /// <summary>
    /// Verify email token and complete checkout process
    /// </summary>
    [HttpPost("verify-email")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(VerifyEmailResponse), 200)]
    public async Task<ActionResult<VerifyEmailResponse>> VerifyEmail([FromBody] VerifyEmailRequest request)
    {
        try
        {
            // Get email from token
            var email = await _emailVerificationService.GetEmailFromTokenAsync(request.Token);
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest(new VerifyEmailResponse(false, "invalid_token", 
                    "Invalid or expired verification token"));
            }

            // Validate the token
            var isValid = await _emailVerificationService.ValidateVerificationTokenAsync(
                request.Token, email, "checkout_verification");

            if (!isValid)
            {
                return BadRequest(new VerifyEmailResponse(false, "invalid_token", 
                    "Invalid or expired verification token"));
            }

            // Get the pending session
            var pending = _pendingStore.TryGetBySessionId(request.SessionId);
            if (!pending.HasValue)
            {
                return NotFound(new VerifyEmailResponse(false, "session_not_found", 
                    "Checkout session not found"));
            }

            // Confirm the checkout
            _pendingStore.LinkEmail(request.SessionId, email);
            
            var redirectUrl = $"{GetBaseUrl()}/checkout/success?session_id={request.SessionId}";
            
            _logger.LogInformation("[CHECKOUT] Email verified successfully for {Email}, session {SessionId}", 
                email, request.SessionId);

            return Ok(new VerifyEmailResponse(true, "verified", 
                "Email verified successfully! Redirecting to complete your purchase.", redirectUrl));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[CHECKOUT] Error verifying email token: {Token}", request.Token);
            return StatusCode(500, new VerifyEmailResponse(false, "error", 
                "An error occurred while verifying your email"));
        }
    }

    private string GetBaseUrl()
    {
        // Use the configured BaseUrl for consistent external URLs
        var baseUrl = _configuration["BaseUrl"] ?? "http://localhost:8080";
        return baseUrl.TrimEnd('/');
    }
}
