using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using StockFlowPro.Web.Services;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Web.Pages;

public class LoginModel : PageModel
{
    private readonly IUserAuthenticationService _authenticationService;

    public LoginModel(IUserAuthenticationService authenticationService)
    {
        _authenticationService = authenticationService;
        RegisterModel = new RegisterUserDto();
    }

    [BindProperty]
    public string? Username { get; set; }
    [BindProperty]
    public string? Password { get; set; }
    [BindProperty]
    public RegisterUserDto RegisterModel { get; set; }
    
    public string? ErrorMessage { get; set; }
    public string? RegisterErrorMessage { get; set; }
    public string? RegisterSuccessMessage { get; set; }

    public bool IsLoggedIn => User.Identity != null && User.Identity.IsAuthenticated;

    public void OnGet()
    {
        // Initialize the page - no additional logic needed for GET request
    }

    public async Task<IActionResult> OnPostLoginAsync()
    {
        if (string.IsNullOrWhiteSpace(Username) || string.IsNullOrWhiteSpace(Password))
        {
            ErrorMessage = "Please enter both username and password.";
            return Page();
        }

        var user = await _authenticationService.AuthenticateAsync(Username, Password);
        if (user != null)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("FirstName", user.FirstName),
                new Claim("LastName", user.LastName)
            };

            var claimsIdentity = new ClaimsIdentity(claims, "MyCookieAuth");
            var authProperties = new AuthenticationProperties { IsPersistent = true };
            await HttpContext.SignInAsync("MyCookieAuth", new ClaimsPrincipal(claimsIdentity), authProperties);

            return user.Role switch
            {
                UserRole.Admin => RedirectToPage("/AdminPanel"),
                UserRole.Manager => RedirectToPage("/AdminPanel"),
                _ => RedirectToPage("/Index")
            };
        }

        // Authentication failed - check if user exists to offer password reset
        var existingUser = await _authenticationService.FindUserByIdentifierAsync(Username);
        if (existingUser != null)
        {
            // User exists but password is wrong - offer password reset
            ErrorMessage = $"Invalid password for user '{existingUser.FirstName} {existingUser.LastName}' ({existingUser.Email}). " +
                          "If you forgot your password, please contact an administrator for password reset assistance.";
        }
        else
        {
            // User doesn't exist
            ErrorMessage = "Invalid credentials. Please check your email/name and password.";
        }
        
        return Page();
    }

    public async Task<IActionResult> OnPostRegisterAsync()
    {
        try
        {
            if (!ModelState.IsValid)
            {
                RegisterErrorMessage = "Please fill in all required fields correctly.";
                return Page();
            }

            await _authenticationService.RegisterAsync(RegisterModel);
            RegisterSuccessMessage = "Registration successful! You can now sign in with your credentials.";
            
            RegisterModel = new RegisterUserDto();
            return Page();
        }
        catch (ArgumentException ex)
        {
            RegisterErrorMessage = ex.Message;
            // Keep the form data so user doesn't have to re-enter everything
            return Page();
        }
        catch (InvalidOperationException ex)
        {
            RegisterErrorMessage = ex.Message;
            return Page();
        }
        catch (Exception ex)
        {
            RegisterErrorMessage = "An error occurred during registration. Please try again.";
            // Log the actual exception for debugging
            Console.WriteLine($"Registration error: {ex.Message}");
            return Page();
        }
    }

    public async Task<IActionResult> OnPostLogoutAsync()
    {
        await HttpContext.SignOutAsync("MyCookieAuth");
        return RedirectToPage("/Index");
    }
}