namespace StockFlowPro.Application.Interfaces;

public interface IRealTimeService
{
    Task BroadcastStockUpdateAsync(int productId, int newQuantity);
    Task BroadcastInvoiceUpdateAsync(int invoiceId, string status, string userId);
    Task BroadcastUserActivityAsync(string userId, string activity);
    Task BroadcastSystemMetricsAsync(Dictionary<string, object> metrics);
    Task JoinUserGroupAsync(string connectionId, string userId);
    Task LeaveUserGroupAsync(string connectionId, string userId);
    Task JoinRoleGroupAsync(string connectionId, string role);
    Task LeaveRoleGroupAsync(string connectionId, string role);
}