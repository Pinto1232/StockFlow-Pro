using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using StockFlowPro.Application.Interfaces;
using System.Net;
using System.Net.Mail;
using System.Text;

namespace StockFlowPro.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _smtpUsername;
    private readonly string _smtpPassword;
    private readonly bool _smtpUseSsl;
    private readonly string _fromEmail;
    private readonly string _fromName;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        
        _smtpHost = _configuration["SMTP_HOST"] ?? "localhost";
        _smtpPort = int.Parse(_configuration["SMTP_PORT"] ?? "1025");
        _smtpUsername = _configuration["SMTP_USERNAME"] ?? "";
        _smtpPassword = _configuration["SMTP_PASSWORD"] ?? "";
        _smtpUseSsl = bool.Parse(_configuration["SMTP_USE_SSL"] ?? "false");
        _fromEmail = _configuration["SMTP_FROM_EMAIL"] ?? "noreply@stockflowpro.local";
        _fromName = _configuration["SMTP_FROM_NAME"] ?? "StockFlow Pro";
    }

    public async Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true)
    {
        try
        {
            using var client = new SmtpClient(_smtpHost, _smtpPort);
            
            if (!string.IsNullOrEmpty(_smtpUsername))
            {
                client.Credentials = new NetworkCredential(_smtpUsername, _smtpPassword);
            }
            
            client.EnableSsl = _smtpUseSsl;

            using var message = new MailMessage();
            message.From = new MailAddress(_fromEmail, _fromName);
            message.To.Add(to);
            message.Subject = subject;
            message.Body = body;
            message.IsBodyHtml = isHtml;
            message.BodyEncoding = Encoding.UTF8;
            message.SubjectEncoding = Encoding.UTF8;

            await client.SendMailAsync(message);
            
            _logger.LogInformation("Email sent successfully to {Email} with subject: {Subject}", to, subject);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email} with subject: {Subject}", to, subject);
            return false;
        }
    }

    public async Task<bool> SendVerificationEmailAsync(string email, string verificationToken, string returnUrl)
    {
        var subject = "Verify Your Email Address - StockFlow Pro";
        var verificationUrl = $"{GetBaseUrl()}/verify-email?token={verificationToken}&returnUrl={Uri.EscapeDataString(returnUrl)}";
        
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Verify Your Email</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .button {{ display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
    </style>
</head>
<body>
    <div class='header'>
        <h1>Welcome to StockFlow Pro!</h1>
    </div>
    <div class='content'>
        <h2>Verify Your Email Address</h2>
        <p>Thank you for signing up with StockFlow Pro. To complete your registration and access your account, please verify your email address by clicking the button below:</p>
        
        <div style='text-align: center;'>
            <a href='{verificationUrl}' class='button'>Verify Email Address</a>
        </div>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style='word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;'>{verificationUrl}</p>
        
        <p><strong>This verification link will expire in 24 hours.</strong></p>
        
        <p>If you didn't create an account with StockFlow Pro, you can safely ignore this email.</p>
    </div>
    <div class='footer'>
        <p>&copy; {DateTime.UtcNow.Year} StockFlow Pro. All rights reserved.</p>
    </div>
</body>
</html>";

        return await SendEmailAsync(email, subject, body, true);
    }

    public async Task<bool> SendCheckoutVerificationEmailAsync(string email, string verificationToken, string sessionId, string planName)
    {
        var subject = "Complete Your StockFlow Pro Subscription";
        var verificationUrl = $"{GetBaseUrl()}/verify-checkout?token={verificationToken}&session={sessionId}";
        
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Complete Your Subscription</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .button {{ display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .plan-info {{ background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
    </style>
</head>
<body>
    <div class='header'>
        <h1>Complete Your Subscription</h1>
    </div>
    <div class='content'>
        <h2>Verify Your Email to Activate Your Plan</h2>
        <p>Thank you for choosing StockFlow Pro! To complete your subscription and activate your account, please verify your email address.</p>
        
        <div class='plan-info'>
            <h3>Your Selected Plan: {planName}</h3>
            <p>Your payment has been processed successfully. Once you verify your email, your subscription will be activated immediately.</p>
        </div>
        
        <div style='text-align: center;'>
            <a href='{verificationUrl}' class='button'>Verify Email & Activate Subscription</a>
        </div>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style='word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;'>{verificationUrl}</p>
        
        <p><strong>This verification link will expire in 24 hours.</strong></p>
        
        <p>If you didn't make this purchase, please contact our support team immediately.</p>
    </div>
    <div class='footer'>
        <p>&copy; {DateTime.UtcNow.Year} StockFlow Pro. All rights reserved.</p>
        <p>Need help? Contact us at support@stockflowpro.com</p>
    </div>
</body>
</html>";

        return await SendEmailAsync(email, subject, body, true);
    }

    public async Task<bool> SendExistingAccountNotificationAsync(string email, string loginUrl)
    {
        var subject = "Account Found - Sign In to Continue";
        
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Account Found</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .button {{ display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .info-box {{ background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
    </style>
</head>
<body>
    <div class='header'>
        <h1>Account Found</h1>
    </div>
    <div class='content'>
        <h2>Welcome Back!</h2>
        <p>We found an existing StockFlow Pro account associated with this email address.</p>
        
        <div class='info-box'>
            <h3>To complete your purchase:</h3>
            <p>Please sign in to your existing account to continue with your subscription purchase. This ensures your new subscription is properly linked to your account.</p>
        </div>
        
        <div style='text-align: center;'>
            <a href='{loginUrl}' class='button'>Sign In to Continue</a>
        </div>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style='word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;'>{loginUrl}</p>
        
        <p>If you forgot your password, you can reset it on the sign-in page.</p>
        
        <p>If you didn't try to make a purchase, you can safely ignore this email.</p>
    </div>
    <div class='footer'>
        <p>&copy; {DateTime.UtcNow.Year} StockFlow Pro. All rights reserved.</p>
        <p>Need help? Contact us at support@stockflowpro.com</p>
    </div>
</body>
</html>";

        return await SendEmailAsync(email, subject, body, true);
    }

    private string GetBaseUrl()
    {
        // In development, use localhost. In production, use the actual domain.
        var baseUrl = _configuration["BaseUrl"] ?? "http://localhost:8080";
        return baseUrl.TrimEnd('/');
    }
}