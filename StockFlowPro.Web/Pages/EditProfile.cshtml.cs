using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace StockFlowPro.Web.Pages;

[Authorize]
public class EditProfileModel : PageModel
{
    public void OnGet()
    {
        // Page initialization logic if needed
    }
}