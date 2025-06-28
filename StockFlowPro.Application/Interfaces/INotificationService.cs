using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Application.Interfaces;

public interface INotificationService
{
    Task SendStockLevelAlertAsync(Product product, int currentStock, int minimumStock);
    Task SendInvoiceStatusUpdateAsync(string userId, int invoiceId, string status);
    Task SendUserNotificationAsync(string userId, string message, string type = "info");
    Task SendDashboardUpdateAsync(object data);
    Task SendToGroupAsync(string groupName, string method, object data);
    Task SendToUserAsync(string userId, string method, object data);
    Task SendToAllAsync(string method, object data);
}