using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Web.Pages;

public class IndexModel : PageModel
{
    private readonly ILogger<IndexModel> _logger;
    private readonly ISubscriptionPlanService _subscriptionPlanService;

    public IndexModel(ILogger<IndexModel> logger, ISubscriptionPlanService subscriptionPlanService)
    {
        _logger = logger;
        _subscriptionPlanService = subscriptionPlanService;
    }

    public IList<SubscriptionPlanDto> SubscriptionPlans { get; set; } = new List<SubscriptionPlanDto>();

    public async Task<IActionResult> OnGetAsync()
    {
        if (User.Identity?.IsAuthenticated == true)
        {
            return RedirectToPage("/Dashboard");
        }

        try
        {
            // Get public subscription plans for display
            var plans = await _subscriptionPlanService.GetPublicPlansAsync();
            SubscriptionPlans = plans.Take(3).ToList(); 
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading subscription plans for home page");
            // Continue with empty list if there's an error
        }

        return Page();
    }
}
