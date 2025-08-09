namespace StockFlowPro.Web.Services;

public interface IPendingSubscriptionStore
{
    void CreateSession(string sessionId, string planId);
    void LinkEmail(string sessionId, string email);
    (string SessionId, string PlanId, string Email, DateTime CreatedAt)? TryGetLatestByEmail(string email);
    void RemoveByEmail(string email);
}
