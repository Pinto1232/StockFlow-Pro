using StockFlowPro.Domain.Interfaces;

namespace StockFlowPro.Domain.Entities;

public class LandingHero : IEntity
{
    public Guid Id { get; private set; }
    public string Title { get; private set; }
    public string Subtitle { get; private set; }
    public string Description { get; private set; }
    public string PrimaryButtonText { get; private set; }
    public string PrimaryButtonUrl { get; private set; }
    public string SecondaryButtonText { get; private set; }
    public string SecondaryButtonUrl { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    // Private constructor for EF Core
    private LandingHero() 
    {
        Title = string.Empty;
        Subtitle = string.Empty;
        Description = string.Empty;
        PrimaryButtonText = string.Empty;
        PrimaryButtonUrl = string.Empty;
        SecondaryButtonText = string.Empty;
        SecondaryButtonUrl = string.Empty;
    }

    public LandingHero(
        string title,
        string subtitle,
        string description,
        string primaryButtonText,
        string primaryButtonUrl,
        string secondaryButtonText,
        string secondaryButtonUrl)
    {
        Id = Guid.NewGuid();
        Title = title ?? throw new ArgumentNullException(nameof(title));
        Subtitle = subtitle ?? throw new ArgumentNullException(nameof(subtitle));
        Description = description ?? throw new ArgumentNullException(nameof(description));
        PrimaryButtonText = primaryButtonText ?? throw new ArgumentNullException(nameof(primaryButtonText));
        PrimaryButtonUrl = primaryButtonUrl ?? throw new ArgumentNullException(nameof(primaryButtonUrl));
        SecondaryButtonText = secondaryButtonText ?? throw new ArgumentNullException(nameof(secondaryButtonText));
        SecondaryButtonUrl = secondaryButtonUrl ?? throw new ArgumentNullException(nameof(secondaryButtonUrl));
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateContent(
        string title,
        string subtitle,
        string description,
        string primaryButtonText,
        string primaryButtonUrl,
        string secondaryButtonText,
        string secondaryButtonUrl)
    {
        Title = title ?? throw new ArgumentNullException(nameof(title));
        Subtitle = subtitle ?? throw new ArgumentNullException(nameof(subtitle));
        Description = description ?? throw new ArgumentNullException(nameof(description));
        PrimaryButtonText = primaryButtonText ?? throw new ArgumentNullException(nameof(primaryButtonText));
        PrimaryButtonUrl = primaryButtonUrl ?? throw new ArgumentNullException(nameof(primaryButtonUrl));
        SecondaryButtonText = secondaryButtonText ?? throw new ArgumentNullException(nameof(secondaryButtonText));
        SecondaryButtonUrl = secondaryButtonUrl ?? throw new ArgumentNullException(nameof(secondaryButtonUrl));
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetActiveStatus(bool isActive)
    {
        IsActive = isActive;
        UpdatedAt = DateTime.UtcNow;
    }
}
