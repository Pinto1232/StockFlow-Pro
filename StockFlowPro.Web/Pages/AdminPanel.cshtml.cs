using Microsoft.AspNetCore.Mvc.RazorPages;
using StockFlowPro.Web.Attributes;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Web.Pages;

[RoleAuthorize(UserRole.Admin, UserRole.Manager)]
public class AdminPanelModel : PageModel
{
    public void OnGet()
    {
    }
}
