using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Interfaces;

public interface IBillingService
{
    /// Creates a hosted checkout session for a given plan and cadence.
    /// Returns the checkout URL and/or sessionId for client-side redirect.
    Task<(string? url, string? sessionId)> CreateCheckoutSessionAsync(Guid planId, string cadence, Guid? userId, string? email, CancellationToken cancellationToken = default);

    /// Processes a webhook payload from payment provider and persists subscription changes.
    Task ProcessWebhookAsync(string provider, string signature, string payload, CancellationToken cancellationToken = default);
}
