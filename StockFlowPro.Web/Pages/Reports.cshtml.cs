using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Web.Authorization;
using StockFlowPro.Web.Extensions;

namespace StockFlowPro.Web.Pages;

[Authorize]
public class ReportsModel : PageModel
{
    private readonly IReportService _reportService;
    private readonly ILogger<ReportsModel> _logger;

    public ReportsModel(IReportService reportService, ILogger<ReportsModel> logger)
    {
        _reportService = reportService;
        _logger = logger;
    }

    public async Task<IActionResult> OnGetAsync()
    {
        if (!User.HasPermission(Permissions.Reports.ViewBasic))
        {
            return Forbid();
        }

        try
        {
            // Load initial data for the page
            await LoadInitialData();
            return Page();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading reports page");
            TempData["ErrorMessage"] = "An error occurred while loading the reports page.";
            return Page();
        }
    }

    private async Task LoadInitialData()
    {
        // This method can be used to pre-load any data needed for the page
        // For now, we'll load data via AJAX calls from the client side
        await Task.CompletedTask;
    }
}