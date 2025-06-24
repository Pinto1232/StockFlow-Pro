using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace StockFlowPro.Web.Pages;

[Authorize]
public class UserSyncModel : PageModel
{
    public void OnGet()
    {
        // Page initialization if needed
    }
}