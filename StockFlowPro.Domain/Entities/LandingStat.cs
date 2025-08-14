using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Entities;

public class LandingStat : IEntity
{
    public Guid Id { get; private set; }
    public string Number { get; private set; } = string.Empty;
    public string Label { get; private set; } = string.Empty;
    public string IconName { get; private set; } = string.Empty;
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private LandingStat() { }

    public LandingStat(string number, string label, string iconName, int sortOrder = 0)
    {
        Id = Guid.NewGuid();
        Number = number;
        Label = label;
        IconName = iconName;
        SortOrder = sortOrder;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(string number, string label, string iconName)
    {
        Number = number;
        Label = label;
        IconName = iconName;
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
