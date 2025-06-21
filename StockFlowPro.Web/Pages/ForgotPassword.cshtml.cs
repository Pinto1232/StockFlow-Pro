using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using StockFlowPro.Web.Services;

namespace StockFlowPro.Web.Pages;

public class ForgotPasswordModel : PageModel
{
    private readonly IUserAuthenticationService _authenticationService;
    private readonly ILogger<ForgotPasswordModel> _logger;

    public ForgotPasswordModel(IUserAuthenticationService authenticationService, ILogger<ForgotPasswordModel> logger)
    {
        _authenticationService = authenticationService;
        _logger = logger;
    }

    [BindProperty]
    public string Email { get; set; } = string.Empty;

    [BindProperty]
    public string Token { get; set; } = string.Empty;

    [BindProperty]
    public string NewPassword { get; set; } = string.Empty;

    [BindProperty]
    public string ConfirmPassword { get; set; } = string.Empty;

    public string? ErrorMessage { get; set; }
    public string? SuccessMessage { get; set; }
    public bool ShowResetForm { get; set; } = false;

    public void OnGet(string? token = null, string? email = null)
    {
        if (!string.IsNullOrEmpty(token) && !string.IsNullOrEmpty(email))
        {
            Token = token;
            Email = email;
            ShowResetForm = true;
        }
    }

    public async Task<IActionResult> OnPostRequestResetAsync()
    {
        if (string.IsNullOrWhiteSpace(Email))
        {
            ErrorMessage = "Please enter your email address.";
            return Page();
        }

        try
        {
            _logger.LogInformation("Password reset requested for email: {Email}", Email);

            // Check if user exists
            var user = await _authenticationService.FindUserByIdentifierAsync(Email);
            if (user == null)
            {
                // For security, don't reveal if email exists or not
                SuccessMessage = "If an account with that email exists, you will receive password reset instructions.";
                _logger.LogWarning("Password reset requested for non-existent email: {Email}", Email);
                return Page();
            }

            // Generate reset token
            var token = await _authenticationService.GeneratePasswordResetTokenAsync(user.Email);
            
            // In a real application, you would send this via email
            // For demo purposes, we'll show the reset link directly
            var resetUrl = Url.Page("/ForgotPassword", pageHandler: null, values: new { token = token, email = user.Email }, protocol: Request.Scheme);
            
            SuccessMessage = $"Password reset link generated! In a real application, this would be sent to your email. " +
                           $"For demo purposes, click here to reset your password: <a href='{resetUrl}' class='alert-link'>Reset Password</a>";

            _logger.LogInformation("Password reset token generated for user: {Email}", user.Email);
            return Page();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing password reset request for email: {Email}", Email);
            ErrorMessage = "An error occurred while processing your request. Please try again.";
            return Page();
        }
    }

    public async Task<IActionResult> OnPostResetPasswordAsync()
    {
        ShowResetForm = true;

        if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Token))
        {
            ErrorMessage = "Invalid reset link. Please request a new password reset.";
            return Page();
        }

        if (string.IsNullOrWhiteSpace(NewPassword))
        {
            ErrorMessage = "Please enter a new password.";
            return Page();
        }

        if (NewPassword != ConfirmPassword)
        {
            ErrorMessage = "Passwords do not match.";
            return Page();
        }

        if (NewPassword.Length < 6)
        {
            ErrorMessage = "Password must be at least 6 characters long.";
            return Page();
        }

        try
        {
            _logger.LogInformation("Attempting to reset password for email: {Email}", Email);

            var success = await _authenticationService.ResetPasswordAsync(Email, Token, NewPassword);
            if (success)
            {
                SuccessMessage = "Your password has been reset successfully! You can now sign in with your new password.";
                _logger.LogInformation("Password reset successful for email: {Email}", Email);
                
                // Clear the form
                Token = string.Empty;
                NewPassword = string.Empty;
                ConfirmPassword = string.Empty;
                ShowResetForm = false;
            }
            else
            {
                ErrorMessage = "Failed to reset password. The reset link may be invalid or expired. Please request a new password reset.";
                _logger.LogWarning("Password reset failed for email: {Email}", Email);
            }

            return Page();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password for email: {Email}", Email);
            ErrorMessage = "An error occurred while resetting your password. Please try again.";
            return Page();
        }
    }
}