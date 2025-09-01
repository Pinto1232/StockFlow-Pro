using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Web.Services;

public interface IPendingSubscriptionStore
{
    void CreateSession(string sessionId, string planId, string? cadence = null, PersonalInfoDto? personalInfo = null);
    void LinkEmail(string sessionId, string email);
    void UpdatePersonalInfo(string sessionId, PersonalInfoDto personalInfo);
    (string SessionId, string PlanId, string Email, DateTime CreatedAt, string? Cadence, PersonalInfoDto? PersonalInfo)? TryGetLatestByEmail(string email);
    (string SessionId, string PlanId, string? Email, DateTime CreatedAt, string? Cadence, PersonalInfoDto? PersonalInfo)? TryGetBySessionId(string sessionId);
    void RemoveByEmail(string email);
}
