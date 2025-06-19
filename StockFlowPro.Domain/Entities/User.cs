using StockFlowPro.Domain.Interfaces;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

/// <summary>
/// Represents a user entity in the StockFlow Pro system.
/// </summary>
public class User : IEntity
{
    /// <summary>
    /// Gets the unique identifier for the user.
    /// </summary>
    public Guid Id { get; private set; }
    
    /// <summary>
    /// Gets the user's first name.
    /// </summary>
    public string FirstName { get; private set; } = string.Empty;
    
    /// <summary>
    /// Gets the user's last name.
    /// </summary>
    public string LastName { get; private set; } = string.Empty;
    
    /// <summary>
    /// Gets the user's email address.
    /// </summary>
    public string Email { get; private set; } = string.Empty;
    
    /// <summary>
    /// Gets the user's phone number.
    /// </summary>
    public string PhoneNumber { get; private set; } = string.Empty;
    
    /// <summary>
    /// Gets the user's date of birth.
    /// </summary>
    public DateTime DateOfBirth { get; private set; }
    
    /// <summary>
    /// Gets a value indicating whether the user account is active.
    /// </summary>
    public bool IsActive { get; private set; }
    
    /// <summary>
    /// Gets the date and time when the user was created.
    /// </summary>
    public DateTime CreatedAt { get; private set; }
    
    /// <summary>
    /// Gets the date and time when the user was last updated, if any.
    /// </summary>
    public DateTime? UpdatedAt { get; private set; }
    
    /// <summary>
    /// Gets the user's role in the system.
    /// </summary>
    public UserRole Role { get; private set; }

    /// <summary>
    /// Initializes a new instance of the <see cref="User"/> class.
    /// Private constructor for Entity Framework Core.
    /// </summary>
    private User() { }

    /// <summary>
    /// Initializes a new instance of the <see cref="User"/> class.
    /// </summary>
    /// <param name="firstName">The user's first name.</param>
    /// <param name="lastName">The user's last name.</param>
    /// <param name="email">The user's email address.</param>
    /// <param name="phoneNumber">The user's phone number.</param>
    /// <param name="dateOfBirth">The user's date of birth.</param>
    /// <param name="role">The user's role in the system. Defaults to <see cref="UserRole.User"/>.</param>
    public User(string firstName, string lastName, string email, string phoneNumber, DateTime dateOfBirth, UserRole role = UserRole.User)
    {
        Id = Guid.NewGuid();
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        PhoneNumber = phoneNumber;
        DateOfBirth = dateOfBirth;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
        Role = role;
    }

    /// <summary>
    /// Updates the user's personal information.
    /// </summary>
    /// <param name="firstName">The new first name.</param>
    /// <param name="lastName">The new last name.</param>
    /// <param name="phoneNumber">The new phone number.</param>
    /// <param name="dateOfBirth">The new date of birth.</param>
    public void UpdatePersonalInfo(string firstName, string lastName, string phoneNumber, DateTime dateOfBirth)
    {
        FirstName = firstName;
        LastName = lastName;
        PhoneNumber = phoneNumber;
        DateOfBirth = dateOfBirth;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Updates the user's email address.
    /// </summary>
    /// <param name="email">The new email address.</param>
    public void UpdateEmail(string email)
    {
        Email = email;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Activates the user account.
    /// </summary>
    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Deactivates the user account.
    /// </summary>
    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Sets the user's role in the system.
    /// </summary>
    /// <param name="role">The new role to assign to the user.</param>
    public void SetRole(UserRole role)
    {
        Role = role;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Gets the user's full name by combining first and last names.
    /// </summary>
    /// <returns>The user's full name.</returns>
    public string GetFullName() => $"{FirstName} {LastName}";

    /// <summary>
    /// Calculates and returns the user's current age based on their date of birth.
    /// </summary>
    /// <returns>The user's age in years.</returns>
    public int GetAge() => DateTime.UtcNow.Year - DateOfBirth.Year - 
                          (DateTime.UtcNow.DayOfYear < DateOfBirth.DayOfYear ? 1 : 0);
}
