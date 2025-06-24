using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace StockFlowPro.Web.Pages;

[Authorize(Roles = "Manager,Admin")]
public class InvoicesModel : PageModel
{
    public void OnGet()
    {
    }
}