using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Authorization;

namespace StockFlowPro.Web.Pages;

[Authorize(Roles = "Admin")]
public class AdminPanelModel : PageModel
{
    public void OnGet()
    {
    }
}
