using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Web.Attributes;
using StockFlowPro.Web.Extensions;
using System.ComponentModel.DataAnnotations;

namespace StockFlowPro.Web.Pages;

[RoleAuthorize(UserRole.Admin)]
public class ReviewRoleRequestsModel : PageModel
{
    private readonly IRoleUpgradeRequestService _roleUpgradeRequestService;
    private readonly ILogger<ReviewRoleRequestsModel> _logger;

    public ReviewRoleRequestsModel(
        IRoleUpgradeRequestService roleUpgradeRequestService,
        ILogger<ReviewRoleRequestsModel> logger)
    {
        _roleUpgradeRequestService = roleUpgradeRequestService;
        _logger = logger;
    }

    // Properties for displaying data
    public List<RoleUpgradeRequestDto> PendingRequests { get; set; } = new();
    public List<RoleUpgradeRequestDto> RecentlyReviewed { get; set; } = new();
    public List<RoleUpgradeRequestDto> HighPriorityRequests { get; set; } = new();
    public RoleUpgradeRequestStatsDto Statistics { get; set; } = new();
    
    // Filter properties
    [BindProperty(SupportsGet = true)]
    public RoleUpgradeRequestStatus? StatusFilter { get; set; }
    
    [BindProperty(SupportsGet = true)]
    public UserRole? RoleFilter { get; set; }
    
    [BindProperty(SupportsGet = true)]
    public string? SearchTerm { get; set; }

    // Review form properties
    [BindProperty]
    public ReviewFormModel ReviewForm { get; set; } = new();

    // Messages
    public string? SuccessMessage { get; set; }
    public string? ErrorMessage { get; set; }

    public async Task OnGetAsync()
    {
        try
        {
            await LoadDataAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading role upgrade requests");
            ErrorMessage = "An error occurred while loading the requests. Please try again.";
        }
    }

    public async Task<IActionResult> OnPostApproveAsync()
    {
        if (!ModelState.IsValid)
        {
            await LoadDataAsync();
            return Page();
        }

        try
        {
            var userId = User.GetUserId();
            if (userId == null)
            {
                ErrorMessage = "Unable to identify current user.";
                await LoadDataAsync();
                return Page();
            }

            var reviewDto = new ReviewRoleUpgradeRequestDto
            {
                RequestId = ReviewForm.RequestId,
                Approve = true,
                Comments = ReviewForm.Comments
            };

            await _roleUpgradeRequestService.ReviewRequestAsync(userId.Value, reviewDto);
            SuccessMessage = "Request approved successfully.";
            
            // Clear the form
            ReviewForm = new ReviewFormModel();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving role upgrade request {RequestId}", ReviewForm.RequestId);
            ErrorMessage = "An error occurred while approving the request. Please try again.";
        }

        await LoadDataAsync();
        return Page();
    }

    public async Task<IActionResult> OnPostRejectAsync()
    {
        if (!ModelState.IsValid)
        {
            await LoadDataAsync();
            return Page();
        }

        if (string.IsNullOrWhiteSpace(ReviewForm.Comments))
        {
            ModelState.AddModelError("ReviewForm.Comments", "Comments are required when rejecting a request.");
            await LoadDataAsync();
            return Page();
        }

        try
        {
            var userId = User.GetUserId();
            if (userId == null)
            {
                ErrorMessage = "Unable to identify current user.";
                await LoadDataAsync();
                return Page();
            }

            var reviewDto = new ReviewRoleUpgradeRequestDto
            {
                RequestId = ReviewForm.RequestId,
                Approve = false,
                Comments = ReviewForm.Comments
            };

            await _roleUpgradeRequestService.ReviewRequestAsync(userId.Value, reviewDto);
            SuccessMessage = "Request rejected successfully.";
            
            // Clear the form
            ReviewForm = new ReviewFormModel();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting role upgrade request {RequestId}", ReviewForm.RequestId);
            ErrorMessage = "An error occurred while rejecting the request. Please try again.";
        }

        await LoadDataAsync();
        return Page();
    }

    public async Task<IActionResult> OnPostUpdatePriorityAsync(Guid requestId, int newPriority)
    {
        try
        {
            await _roleUpgradeRequestService.UpdateRequestPriorityAsync(requestId, newPriority);
            SuccessMessage = "Priority updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating priority for request {RequestId}", requestId);
            ErrorMessage = "An error occurred while updating the priority. Please try again.";
        }

        await LoadDataAsync();
        return Page();
    }

    private async Task LoadDataAsync()
    {
        // Load statistics
        Statistics = await _roleUpgradeRequestService.GetRequestStatisticsAsync();

        // Load all requests with filters
        var allRequests = await _roleUpgradeRequestService.GetAllRequestsAsync(StatusFilter, RoleFilter);
        
        // Apply search filter if provided
        if (!string.IsNullOrWhiteSpace(SearchTerm))
        {
            var searchLower = SearchTerm.ToLower();
            allRequests = allRequests.Where(r => 
                r.UserName.ToLower().Contains(searchLower) ||
                r.UserEmail.ToLower().Contains(searchLower) ||
                r.Justification.ToLower().Contains(searchLower) ||
                (r.ReviewComments?.ToLower().Contains(searchLower) ?? false));
        }

        var requestsList = allRequests.OrderByDescending(r => r.RequestedAt).ToList();

        // Separate pending requests
        PendingRequests = requestsList
            .Where(r => r.Status == RoleUpgradeRequestStatus.Pending)
            .OrderByDescending(r => r.Priority)
            .ThenBy(r => r.RequestedAt)
            .ToList();

        // Recently reviewed requests (last 30 days)
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
        RecentlyReviewed = requestsList
            .Where(r => r.Status != RoleUpgradeRequestStatus.Pending && 
                       r.ReviewedAt.HasValue && 
                       r.ReviewedAt.Value > thirtyDaysAgo)
            .OrderByDescending(r => r.ReviewedAt)
            .Take(10)
            .ToList();

        // High priority requests requiring attention
        var highPriorityRequests = await _roleUpgradeRequestService.GetRequestsRequiringAttentionAsync();
        HighPriorityRequests = highPriorityRequests.ToList();
    }

    public class ReviewFormModel
    {
        [Required]
        public Guid RequestId { get; set; }

        [StringLength(1000, ErrorMessage = "Comments cannot exceed 1000 characters.")]
        public string? Comments { get; set; }
    }
}