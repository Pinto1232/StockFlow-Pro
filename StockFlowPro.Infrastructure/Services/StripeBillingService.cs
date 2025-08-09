using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Shared.Configuration;
using Stripe;
using Stripe.Checkout;

namespace StockFlowPro.Infrastructure.Services;

public class StripeBillingService : IBillingService
{
    private readonly ILogger<StripeBillingService> _logger;
    private readonly ISubscriptionPlanRepository _planRepository;
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly StripeOptions _options;

    public StripeBillingService(
        ILogger<StripeBillingService> logger,
        IOptions<StripeOptions> options,
        ISubscriptionPlanRepository planRepository,
        ISubscriptionRepository subscriptionRepository)
    {
        _logger = logger;
        _planRepository = planRepository;
        _subscriptionRepository = subscriptionRepository;
        _options = options.Value;
    }

    public async Task<(string? url, string? sessionId)> CreateCheckoutSessionAsync(Guid planId, string cadence, Guid? userId, string? email, CancellationToken cancellationToken = default)
    {
        // Placeholder implementation to avoid breaking flow if Stripe not configured
        // In real implementation: use Stripe SDK to create session based on planId and cadence
        _logger.LogInformation("[STRIPE] CreateCheckoutSessionAsync called for Plan {PlanId}, Cadence {Cadence}, User {UserId}, Email {Email}", planId, cadence, userId, email);
        if (!_options.Enabled)
        {
            _logger.LogWarning("[STRIPE] Stripe is disabled. Returning null checkout URL");
            return (null, null);
        }

        // Validate plan exists
        var plan = await _planRepository.GetByIdAsync(planId, cancellationToken);
        if (plan is null)
        {
            _logger.LogWarning("[STRIPE] Plan {PlanId} not found", planId);
            return (null, null);
        }

        // Example Stripe checkout session creation (uses placeholder price id). Replace with real mapping.
        StripeConfiguration.ApiKey = _options.SecretKey;
        var domainSuccess = _options.SuccessUrl ?? "http://localhost:5173/checkout/success";
        var domainCancel = _options.CancelUrl ?? "http://localhost:5173/checkout/cancel";

        // TODO: Look up Stripe Price ID based on planId + cadence (monthly vs annual)
        var priceId = cadence.Equals("annual", StringComparison.OrdinalIgnoreCase)
            ? Environment.GetEnvironmentVariable("STRIPE_PRICE_ANNUAL")
            : Environment.GetEnvironmentVariable("STRIPE_PRICE_MONTHLY");

        if (string.IsNullOrWhiteSpace(priceId))
        {
            _logger.LogWarning("[STRIPE] Missing Stripe price id mapping for cadence {Cadence}. Falling back.", cadence);
            var fakeSessionId = Guid.NewGuid().ToString("N");
            return (domainSuccess, fakeSessionId);
        }

        var options = new SessionCreateOptions
        {
            Mode = "subscription",
            SuccessUrl = domainSuccess + "?session_id={CHECKOUT_SESSION_ID}",
            CancelUrl = domainCancel,
            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    Price = priceId,
                    Quantity = 1,
                },
            },
            CustomerEmail = email,
            Metadata = new Dictionary<string, string>
            {
                ["planId"] = planId.ToString(),
                ["cadence"] = cadence,
                ["userId"] = userId?.ToString() ?? string.Empty
            }
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options, cancellationToken: cancellationToken);
        return (session.Url, session.Id);
    }

    public async Task ProcessWebhookAsync(string provider, string signature, string payload, CancellationToken cancellationToken = default)
    {
        if (!string.Equals(provider, "stripe", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("[WEBHOOK] Unknown provider: {Provider}", provider);
            return;
        }

        if (!_options.Enabled)
        {
            _logger.LogWarning("[STRIPE] Webhook received but Stripe is disabled");
            return;
        }

        try
        {
            StripeConfiguration.ApiKey = _options.SecretKey;

            var stripeEvent = EventUtility.ConstructEvent(
                payload,
                signature,
                _options.WebhookSecret
            );

            _logger.LogInformation("[STRIPE] Event received: {Type}", stripeEvent.Type);

            switch (stripeEvent.Type)
            {
                case "checkout.session.completed":
                {
                    var session = stripeEvent.Data.Object as Session;
                    if (session == null)
                    {
                        _logger.LogWarning("[STRIPE] checkout.session.completed payload was not a Session object");
                        break;
                    }

                    var metadata = session.Metadata ?? new Dictionary<string, string>();
                    metadata.TryGetValue("planId", out var planIdStr);
                    metadata.TryGetValue("userId", out var userIdStr);

                    if (!Guid.TryParse(planIdStr, out var planId) || !Guid.TryParse(userIdStr, out var userId))
                    {
                        _logger.LogWarning("[STRIPE] Missing or invalid planId/userId in session metadata");
                        break;
                    }

                    var plan = await _planRepository.GetByIdAsync(planId, cancellationToken);
                    if (plan == null)
                    {
                        _logger.LogWarning("[STRIPE] Plan not found for planId {PlanId}", planId);
                        break;
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
                        trialEnd
                    );

                    subscription.SetStripeIds(session.SubscriptionId, session.CustomerId);

                    await _subscriptionRepository.AddAsync(subscription, cancellationToken);
                    _logger.LogInformation("[STRIPE] Subscription created for user {UserId} on plan {PlanId} via Stripe. StripeSub={StripeSub}", userId, plan.Id, session.SubscriptionId);
                    break;
                }

                case "customer.subscription.updated":
                case "customer.subscription.created":
                case "invoice.payment_succeeded":
                case "invoice.payment_failed":
                    // TODO: Optionally handle updates to reflect payment status, next billing date, etc.
                    _logger.LogInformation("[STRIPE] Received event {Type} - not yet handled in detail", stripeEvent.Type);
                    break;

                default:
                    _logger.LogInformation("[STRIPE] Event {Type} ignored", stripeEvent.Type);
                    break;
            }
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "[STRIPE] Webhook signature validation or API error");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[STRIPE] Unexpected error processing webhook");
        }
    }
}
