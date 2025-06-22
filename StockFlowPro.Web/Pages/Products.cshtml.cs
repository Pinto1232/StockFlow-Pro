using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace StockFlowPro.Web.Pages;

[Authorize]
public class ProductsModel : PageModel
{
    public void OnGet()
    {
    }
}