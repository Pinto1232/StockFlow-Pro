using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Authorization;

[Authorize(Roles = "Admin")]
public class AdminPanelModel : PageModel
{
    public void OnGet()
    {
        // Any logic for admin panel page
    }
}
