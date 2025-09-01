namespace StockFlowPro.Application.Interfaces;

public interface IEmailVerificationService
{
    Task<string> GenerateVerificationTokenAsync(string email, string purpose = "email_verification");
    Task<bool> ValidateVerificationTokenAsync(string token, string email, string purpose = "email_verification");
    Task<string?> GetEmailFromTokenAsync(string token);
    Task InvalidateTokenAsync(string token);
    Task CleanupExpiredTokensAsync();
}

public class EmailVerificationToken
{
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public string? SessionId { get; set; }
    public string? AdditionalData { get; set; }
}