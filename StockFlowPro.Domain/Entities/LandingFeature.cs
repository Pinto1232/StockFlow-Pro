using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Entities;

public class LandingFeature : IEntity
{
    public Guid Id { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string IconName { get; private set; } = string.Empty;
    public string ColorClass { get; private set; } = string.Empty;
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private LandingFeature() { }

    public LandingFeature(string title, string description, string iconName, string colorClass, int sortOrder = 0)
    {
        Id = Guid.NewGuid();
        Title = title;
        Description = description;
        IconName = iconName;
        ColorClass = colorClass;
        SortOrder = sortOrder;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(string title, string description, string iconName, string colorClass)
    {
        Title = title;
        Description = description;
        IconName = iconName;
        ColorClass = colorClass;
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
