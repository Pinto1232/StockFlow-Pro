namespace StockFlowPro.Shared.Configuration;

public class StripeOptions
{
    public const string SectionName = "Stripe";

    public bool Enabled { get; set; } = false;
    public string? SecretKey { get; set; }
    public string? PublishableKey { get; set; }
    public string? WebhookSecret { get; set; }

    // Success/Cancel URLs for hosted checkout
    public string? SuccessUrl { get; set; }
    public string? CancelUrl { get; set; }

    public void ValidateBasic()
    {
        if (!Enabled)
        {
            return;
        }
        if (string.IsNullOrWhiteSpace(SecretKey))
        {
            throw new InvalidOperationException("Stripe:SecretKey is required when Stripe is enabled.");
        }
        if (string.IsNullOrWhiteSpace(PublishableKey))
        {
            throw new InvalidOperationException("Stripe:PublishableKey is required when Stripe is enabled.");
        }
    }
}
