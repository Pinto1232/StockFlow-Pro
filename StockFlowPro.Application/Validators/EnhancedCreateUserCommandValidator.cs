using FluentValidation;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Domain.Repositories;
using StockFlowPro.Domain.Utilities;

namespace StockFlowPro.Application.Validators;

/// <summary>
/// Enhanced validator for CreateUserCommand with improved email validation
/// </summary>
public class EnhancedCreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    private readonly IUserRepository _userRepository;

    public EnhancedCreateUserCommandValidator(IUserRepository userRepository)
    {
        _userRepository = userRepository;

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .MaximumLength(50).WithMessage("First name must not exceed 50 characters")
            .Matches(@"^[a-zA-Z\s\-'\.]+$").WithMessage("First name contains invalid characters");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .MaximumLength(50).WithMessage("Last name must not exceed 50 characters")
            .Matches(@"^[a-zA-Z\s\-'\.]+$").WithMessage("Last name contains invalid characters");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .MaximumLength(100).WithMessage("Email must not exceed 100 characters")
            .Must(BeValidEmailFormat).WithMessage("Email must be a valid email address")
            .Must(NotBeBlockedDomain).WithMessage("Email domain is not allowed")
            .MustAsync(BeUniqueEmailAsync).WithMessage("Email already exists");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("Phone number is required")
            .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Phone number must be a valid format");

        RuleFor(x => x.DateOfBirth)
            .NotEmpty().WithMessage("Date of birth is required")
            .Must(BeValidAge).WithMessage("User must be at least 13 years old and not more than 120 years old");

        RuleFor(x => x.Role)
            .IsInEnum().WithMessage("Invalid role specified");
    }

    /// <summary>
    /// Validates email format using the EmailNormalizer utility
    /// </summary>
    private static bool BeValidEmailFormat(string email)
    {
        return EmailNormalizer.IsValidFormat(email);
    }

    /// <summary>
    /// Checks if the email domain is not in the blocked list
    /// </summary>
    private static bool NotBeBlockedDomain(string email)
    {
        var blockedDomains = EmailNormalizer.GetCommonBlockedDomains();
        return !EmailNormalizer.IsBlockedDomain(email, blockedDomains);
    }

    /// <summary>
    /// Checks if the email is unique using case-insensitive comparison
    /// </summary>
    private async Task<bool> BeUniqueEmailAsync(string email, CancellationToken cancellationToken)
    {
        var normalizedEmail = EmailNormalizer.Normalize(email);
        return !await _userRepository.EmailExistsAsync(normalizedEmail, cancellationToken: cancellationToken);
    }

    /// <summary>
    /// Validates that the user's age is within acceptable limits
    /// </summary>
    private static bool BeValidAge(DateTime dateOfBirth)
    {
        var today = DateTime.UtcNow.Date;
        var age = today.Year - dateOfBirth.Year;
        
        // Adjust if birthday hasn't occurred this year
        if (dateOfBirth.Date > today.AddYears(-age))
        {
            age--;
        }

        return age >= 13 && age <= 120;
    }
}