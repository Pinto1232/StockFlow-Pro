namespace StockFlowPro.Web.Services;

public interface IPendingSubscriptionStore
{
    void CreateSession(string sessionId, string planId);
    void LinkEmail(string sessionId, string email);
    (string SessionId, string PlanId, string Email, DateTime CreatedAt)? TryGetLatestByEmail(string email);
    (string SessionId, string PlanId, string? Email, DateTime CreatedAt)? TryGetBySessionId(string sessionId);
    void RemoveByEmail(string email);
}
