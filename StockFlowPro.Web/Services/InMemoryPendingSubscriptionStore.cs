namespace StockFlowPro.Web.Services;

public class InMemoryPendingSubscriptionStore : IPendingSubscriptionStore
{
    private class Pending
    {
        public string SessionId { get; init; } = string.Empty;
        public string PlanId { get; init; } = string.Empty;
        public string? Email { get; set; }
        public DateTime CreatedAt { get; init; }
    }

    private static readonly List<Pending> _items = new();
    private static readonly object _lock = new();

    public void CreateSession(string sessionId, string planId)
    {
        lock (_lock)
        {
            _items.RemoveAll(x => x.SessionId == sessionId);
            _items.Add(new Pending { SessionId = sessionId, PlanId = planId, CreatedAt = DateTime.UtcNow });
        }
    }

    public void LinkEmail(string sessionId, string email)
    {
        lock (_lock)
        {
            var row = _items.FirstOrDefault(x => x.SessionId == sessionId);
            if (row != null)
            {
                row.Email = email.ToLowerInvariant();
            }
        }
    }

    public (string SessionId, string PlanId, string? Email, DateTime CreatedAt)? TryGetBySessionId(string sessionId)
    {
        lock (_lock)
        {
            var row = _items.FirstOrDefault(x => x.SessionId == sessionId);
            if (row == null) return null;
            return (row.SessionId, row.PlanId, row.Email, row.CreatedAt);
        }
    }

    public (string SessionId, string PlanId, string Email, DateTime CreatedAt)? TryGetLatestByEmail(string email)
    {
        var normalized = email.ToLowerInvariant();
        lock (_lock)
        {
            var found = _items.Where(x => x.Email == normalized)
                               .OrderByDescending(x => x.CreatedAt)
                               .FirstOrDefault();
            if (found == null) return null;
            return (found.SessionId, found.PlanId, found.Email!, found.CreatedAt);
        }
    }

    public void RemoveByEmail(string email)
    {
        var normalized = email.ToLowerInvariant();
        lock (_lock)
        {
            _items.RemoveAll(x => x.Email == normalized);
        }
    }
}
