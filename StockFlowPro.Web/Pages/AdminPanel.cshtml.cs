using Microsoft.AspNetCore.Mvc.RazorPages;
using StockFlowPro.Web.Attributes;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Domain.Repositories;

namespace StockFlowPro.Web.Pages;

[RoleAuthorize(UserRole.Admin, UserRole.Manager)]
public class AdminPanelModel : PageModel
{
    private readonly IProductRepository _productRepository;
    private readonly IUserRepository _userRepository;

    public AdminPanelModel(IProductRepository productRepository, IUserRepository userRepository)
    {
        _productRepository = productRepository;
        _userRepository = userRepository;
    }

    public int TotalProducts { get; set; }
    public int InStockProducts { get; set; }
    public decimal InStockPercentage { get; set; }
    
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int TotalRoles { get; set; }

    public async Task OnGetAsync()
    {
        try
        {
            // Product statistics
            var allProducts = await _productRepository.GetAllAsync();
            var inStockProducts = await _productRepository.GetInStockProductsAsync();
            
            TotalProducts = allProducts.Count();
            InStockProducts = inStockProducts.Count();
            InStockPercentage = TotalProducts > 0 ? Math.Round((decimal)InStockProducts / TotalProducts * 100, 1) : 0;

            // User statistics
            var allUsers = await _userRepository.GetAllAsync();
            var activeUsers = await _userRepository.GetActiveUsersAsync();
            
            TotalUsers = allUsers.Count();
            ActiveUsers = activeUsers.Count();
            TotalRoles = Enum.GetValues<UserRole>().Length;
        }
        catch (Exception ex)
        {
            // Log the error and set default values
            Console.WriteLine($"Error in AdminPanel OnGetAsync: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            
            // Set default values to prevent page crash
            TotalProducts = 0;
            InStockProducts = 0;
            InStockPercentage = 0;
            TotalUsers = 0;
            ActiveUsers = 0;
            TotalRoles = Enum.GetValues<UserRole>().Length;
        }
    }
}
