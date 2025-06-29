using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Web.Extensions;
using System.Security.Claims;

namespace StockFlowPro.Web.Pages;

[Authorize(Roles = "User,Manager")]
public class RequestRoleUpgradeModel : PageModel
{
    private readonly IRoleUpgradeRequestService _roleUpgradeRequestService;
    private readonly ILogger<RequestRoleUpgradeModel> _logger;

    public RequestRoleUpgradeModel(
        IRoleUpgradeRequestService roleUpgradeRequestService,
        ILogger<RequestRoleUpgradeModel> logger)
    {
        _roleUpgradeRequestService = roleUpgradeRequestService;
        _logger = logger;
    }

    public string CurrentUserRole { get; set; } = string.Empty;
    public List<AvailableRoleInfo> AvailableRoles { get; set; } = new();
    public List<RoleUpgradeRequestDto> UserRequests { get; set; } = new();
    public string? ErrorMessage { get; set; }
    public string? SuccessMessage { get; set; }

    [BindProperty]
    public UserRole RequestedRole { get; set; }

    [BindProperty]
    public string Justification { get; set; } = string.Empty;

    [BindProperty]
    public string? AdditionalDocuments { get; set; }

    [BindProperty]
    public int Priority { get; set; } = 2;

    public async Task<IActionResult> OnGetAsync()
    {
        try
        {
            await LoadPageDataAsync();
            return Page();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading role upgrade request page");
            ErrorMessage = "An error occurred while loading the page. Please try again.";
            return Page();
        }
    }

    public async Task<IActionResult> OnPostCreateRequestAsync()
    {
        try
        {
            if (!ModelState.IsValid)
            {
                await LoadPageDataAsync();
                return Page();
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                ErrorMessage = "Invalid user authentication. Please log in again.";
                await LoadPageDataAsync();
                return Page();
            }

            // Validate justification
            if (string.IsNullOrWhiteSpace(Justification) || Justification.Length < 50)
            {
                ErrorMessage = "Please provide a detailed justification (at least 50 characters) for your role upgrade request.";
                await LoadPageDataAsync();
                return Page();
            }

            var createDto = new CreateRoleUpgradeRequestDto
            {
                RequestedRole = RequestedRole,
                Justification = Justification.Trim(),
                AdditionalDocuments = string.IsNullOrWhiteSpace(AdditionalDocuments) ? null : AdditionalDocuments.Trim(),
                Priority = Priority
            };

            var request = await _roleUpgradeRequestService.CreateRequestAsync(userId, createDto);

            SuccessMessage = $"Your role upgrade request for {RequestedRole} has been submitted successfully. " +
                           "You will be notified when a system administrator reviews your request.";

            _logger.LogInformation("Role upgrade request created successfully for user {UserId} requesting {RequestedRole}", 
                userId, RequestedRole);

            // Clear form data
            RequestedRole = UserRole.User;
            Justification = string.Empty;
            AdditionalDocuments = null;
            Priority = 2;

            await LoadPageDataAsync();
            return Page();
        }
        catch (InvalidOperationException ex)
        {
            ErrorMessage = ex.Message;
            await LoadPageDataAsync();
            return Page();
        }
        catch (ArgumentException ex)
        {
            ErrorMessage = ex.Message;
            await LoadPageDataAsync();
            return Page();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating role upgrade request");
            ErrorMessage = "An error occurred while submitting your request. Please try again.";
            await LoadPageDataAsync();
            return Page();
        }
    }

    private async Task LoadPageDataAsync()
    {
        var currentUserRole = User.GetUserRole();
        CurrentUserRole = currentUserRole?.ToString() ?? "Unknown";

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var userId))
        {
            // Load available roles
            await LoadAvailableRolesAsync(userId, currentUserRole);

            // Load user's existing requests
            try
            {
                var requests = await _roleUpgradeRequestService.GetUserRequestsAsync(userId);
                UserRequests = requests.OrderByDescending(r => r.RequestedAt).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not load user requests for user {UserId}", userId);
                UserRequests = new List<RoleUpgradeRequestDto>();
            }
        }
    }

    private async Task LoadAvailableRolesAsync(Guid userId, UserRole? currentUserRole)
    {
        AvailableRoles = new List<AvailableRoleInfo>();

        if (!currentUserRole.HasValue)
           { return;}

        try
        {
            // Users can request Manager role
            if (currentUserRole.Value == UserRole.User)
            {
                var canRequestManager = await _roleUpgradeRequestService.CanUserRequestRoleAsync(userId, UserRole.Manager);
                if (canRequestManager)
                {
                    AvailableRoles.Add(new AvailableRoleInfo
                    {
                        Role = UserRole.Manager,
                        DisplayName = "Manager",
                        Description = "Elevated privileges including product and invoice management, reporting access, and team oversight capabilities."
                    });
                }
            }

            // Managers can request Admin role
            if (currentUserRole.Value == UserRole.Manager)
            {
                var canRequestAdmin = await _roleUpgradeRequestService.CanUserRequestRoleAsync(userId, UserRole.Admin);
                if (canRequestAdmin)
                {
                    AvailableRoles.Add(new AvailableRoleInfo
                    {
                        Role = UserRole.Admin,
                        DisplayName = "Administrator",
                        Description = "Full system access including user management, system settings, data management, and all administrative functions."
                    });
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not load available roles for user {UserId}", userId);
        }
    }

    public class AvailableRoleInfo
    {
        public UserRole Role { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}