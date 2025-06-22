using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace StockFlowPro.Web.Pages;

[Authorize]
public class ProductsModel : PageModel
{
    public void OnGet()
    {
        // Page initialization - no specific logic required for this view
        // Product data is loaded via JavaScript and API calls
    }
}