using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Application.Interfaces;

public interface IEmailService
{
    Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true);
    Task<bool> SendVerificationEmailAsync(string email, string verificationToken, string returnUrl);
    Task<bool> SendCheckoutVerificationEmailAsync(string email, string verificationToken, string sessionId, string planName, string? planId = null, string? cadence = null);
    Task<bool> SendExistingAccountNotificationAsync(string email, string loginUrl);
}