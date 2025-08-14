using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Entities;

public class LandingTestimonial : IEntity
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Role { get; private set; } = string.Empty;
    public string Company { get; private set; } = string.Empty;
    public string ImageUrl { get; private set; } = string.Empty;
    public string Quote { get; private set; } = string.Empty;
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private LandingTestimonial() { }

    public LandingTestimonial(string name, string role, string company, string imageUrl, string quote, int sortOrder = 0)
    {
        Id = Guid.NewGuid();
        Name = name;
        Role = role;
        Company = company;
        ImageUrl = imageUrl;
        Quote = quote;
        SortOrder = sortOrder;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(string name, string role, string company, string imageUrl, string quote)
    {
        Name = name;
        Role = role;
        Company = company;
        ImageUrl = imageUrl;
        Quote = quote;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateSortOrder(int sortOrder)
    {
        SortOrder = sortOrder;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetActive(bool isActive)
    {
        IsActive = isActive;
        UpdatedAt = DateTime.UtcNow;
    }
}
