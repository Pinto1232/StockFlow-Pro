using Microsoft.AspNetCore.Mvc.RazorPages;
using StockFlowPro.Web.Attributes;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Web.Pages;

[RoleAuthorize(UserRole.Admin)]
public class ManageUsersModel : PageModel
{
    public void OnGet()
    {
    }
}
