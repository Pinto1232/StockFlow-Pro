using StockFlowPro.Domain.Interfaces;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

public class User : IEntity
{
    public Guid Id { get; private set; }
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string PhoneNumber { get; private set; } = string.Empty;
    public DateTime DateOfBirth { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public UserRole Role { get; private set; }
    public string? PasswordHash { get; private set; }
    public string? ProfilePhotoUrl { get; private set; }
    
    // SQL Server enhanced fields
    public Guid? RoleId { get; private set; }
    public DateTime? LastLoginAt { get; private set; }
    public string? LastLoginIp { get; private set; }
    public int FailedLoginAttempts { get; private set; }
    public DateTime? LockedUntil { get; private set; }
    public bool RequirePasswordChange { get; private set; }
    public DateTime? PasswordChangedAt { get; private set; }
    public string? SecurityStamp { get; private set; }
    
    // Navigation properties for SQL Server relationships
    public virtual Role? DatabaseRole { get; private set; }

    private User() { }

    public User(string firstName, string lastName, string email, string phoneNumber, DateTime dateOfBirth, UserRole role = UserRole.User, string? passwordHash = null)
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
        PasswordHash = passwordHash;
        SecurityStamp = Guid.NewGuid().ToString();
        PasswordChangedAt = DateTime.UtcNow;
    }

    public void UpdatePersonalInfo(string firstName, string lastName, string phoneNumber, DateTime dateOfBirth)
    {
        FirstName = firstName;
        LastName = lastName;
        PhoneNumber = phoneNumber;
        DateOfBirth = dateOfBirth;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateEmail(string email)
    {
        Email = email;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetRole(UserRole role)
    {
        Role = role;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdatePasswordHash(string? passwordHash)
    {
        PasswordHash = passwordHash;
        PasswordChangedAt = DateTime.UtcNow;
        SecurityStamp = Guid.NewGuid().ToString();
        RequirePasswordChange = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateProfilePhoto(string? profilePhotoUrl)
    {
        ProfilePhotoUrl = profilePhotoUrl;
        UpdatedAt = DateTime.UtcNow;
    }

    // SQL Server enhanced security methods
    public void RecordLogin(string ipAddress)
    {
        LastLoginAt = DateTime.UtcNow;
        LastLoginIp = ipAddress;
        FailedLoginAttempts = 0;
        LockedUntil = null;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RecordFailedLogin()
    {
        FailedLoginAttempts++;
        if (FailedLoginAttempts >= 5)
        {
            LockedUntil = DateTime.UtcNow.AddMinutes(30);
        }
        UpdatedAt = DateTime.UtcNow;
    }

    public void UnlockAccount()
    {
        FailedLoginAttempts = 0;
        LockedUntil = null;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RequirePasswordReset()
    {
        RequirePasswordChange = true;
        SecurityStamp = Guid.NewGuid().ToString();
        UpdatedAt = DateTime.UtcNow;
    }

    public void AssignDatabaseRole(Guid roleId)
    {
        RoleId = roleId;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsAccountLocked() => LockedUntil.HasValue && LockedUntil > DateTime.UtcNow;

    public string GetFullName() => $"{FirstName} {LastName}";

    public int GetAge() => DateTime.UtcNow.Year - DateOfBirth.Year - 
                          (DateTime.UtcNow.DayOfYear < DateOfBirth.DayOfYear ? 1 : 0);
}
