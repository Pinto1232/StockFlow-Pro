# Email Uniqueness Implementation - Best Practices

## Current Implementation Status ✅

The StockFlow-Pro application already implements email uniqueness validation using multiple layers of protection following industry best practices:

## 1. Database Level Constraints ✅

**File**: `StockFlowPro.Infrastructure/Persistence/Configurations/UserConfiguration.cs`

```csharp
builder.Property(u => u.Email)  
    .IsRequired()
    .HasMaxLength(100);

builder.HasIndex(u => u.Email)
    .IsUnique();
```

**Benefits**:
- Prevents duplicate emails at the database level
- Ensures data integrity even if application-level validation fails
- Provides fast lookup performance for email-based queries

## 2. Application Layer Validation ✅

**File**: `StockFlowPro.Application/Validators/CreateUserCommandValidator.cs`

```csharp
RuleFor(x => x.Email)
    .NotEmpty().WithMessage("Email is required")
    .EmailAddress().WithMessage("Email must be a valid email address")
    .MaximumLength(100).WithMessage("Email must not exceed 100 characters")
    .MustAsync(BeUniqueEmail).WithMessage("Email already exists");

private async Task<bool> BeUniqueEmail(string email, CancellationToken cancellationToken)
{
    return !await _userRepository.EmailExistsAsync(email, cancellationToken: cancellationToken);
}
```

**Benefits**:
- Provides early validation before database operations
- Returns user-friendly error messages
- Integrates with FluentValidation pipeline

## 3. Repository Layer Implementation ✅

**File**: `StockFlowPro.Infrastructure/Repositories/UserRepository.cs`

```csharp
public async Task<bool> EmailExistsAsync(string email, Guid? excludeUserId = null, CancellationToken cancellationToken = default)
{
    var query = _context.Users.Where(u => u.Email == email);
    
    if (excludeUserId.HasValue)
    {
        query = query.Where(u => u.Id != excludeUserId.Value);
    }

    return await query.AnyAsync(cancellationToken);
}
```

**Benefits**:
- Efficient database query using `AnyAsync()`
- Supports exclusion for update scenarios
- Proper cancellation token support

## 4. Service Layer Validation ✅

**File**: `StockFlowPro.Web/Services/AuthenticationService.cs`

```csharp
public async Task<UserDto> RegisterAsync(RegisterUserDto registerUserDto)
{
    var existingUser = await _dataSourceService.GetUserByEmailAsync(registerUserDto.Email);
    if (existingUser != null)
    {
        _logger.LogWarning("User already exists with email: {Email}", registerUserDto.Email);
        throw new InvalidOperationException("User with this email already exists");
    }
    // ... rest of registration logic
}
```

**Benefits**:
- Additional validation at service layer
- Proper logging for security monitoring
- Clear error messages for business logic violations

## 5. API Layer Validation ✅

**File**: `StockFlowPro.Web/Controllers/Api/AuthController.cs`

```csharp
[HttpPost("register")]
[AllowAnonymous]
public async Task<IActionResult> Register([FromBody] RegisterRequest request)
{
    try
    {
        // Model validation
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            
            return BadRequest(new { 
                message = "Validation failed", 
                errors = errors 
            });
        }
        
        // Registration logic with proper exception handling
        var user = await _authenticationService.RegisterAsync(registerUserDto);
        return CreatedAtAction(nameof(Register), new { id = user.Id }, response);
    }
    catch (InvalidOperationException ex)
    {
        _logger.LogWarning("Registration failed due to business rule: {Email} - {Error}", request.Email, ex.Message);
        return Conflict(new { message = ex.Message });
    }
}
```

**Benefits**:
- Comprehensive error handling
- Proper HTTP status codes (409 Conflict for duplicate email)
- Security logging for monitoring

## 6. Validation Pipeline Integration ✅

**File**: `StockFlowPro.Web/Extensions/ServiceCollectionExtensions.cs`

```csharp
public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        if (_validators.Any())
        {
            var context = new ValidationContext<TRequest>(request);
            var validationResults = await Task.WhenAll(_validators.Select(v => v.ValidateAsync(context, cancellationToken)));
            var failures = validationResults.SelectMany(r => r.Errors).Where(f => f != null).ToList();

            if (failures.Count != 0)
            {
                var errorMessage = $"Validation failed for {typeof(TRequest).Name}: {string.Join(", ", failures.Select(f => f.ErrorMessage))}";
                throw new ValidationException(errorMessage, failures);
            }
        }

        return await next();
    }
}
```

**Benefits**:
- Automatic validation for all MediatR requests
- Consistent error handling across the application
- Integration with FluentValidation

## Additional Recommendations for Enhanced Security

### 1. Case-Insensitive Email Comparison

**Current Implementation**: The database index and queries are case-sensitive by default.

**Recommendation**: Ensure case-insensitive email comparison:

```csharp
// In UserConfiguration.cs
builder.HasIndex(u => u.Email)
    .IsUnique()
    .HasDatabaseName("IX_Users_Email_Unique");

// In repository queries
public async Task<bool> EmailExistsAsync(string email, Guid? excludeUserId = null, CancellationToken cancellationToken = default)
{
    var normalizedEmail = email.ToLowerInvariant();
    var query = _context.Users.Where(u => u.Email.ToLower() == normalizedEmail);
    
    if (excludeUserId.HasValue)
    {
        query = query.Where(u => u.Id != excludeUserId.Value);
    }

    return await query.AnyAsync(cancellationToken);
}
```

### 2. Email Normalization

**Recommendation**: Normalize emails before storage:

```csharp
public static class EmailNormalizer
{
    public static string Normalize(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return string.Empty;
            
        return email.Trim().ToLowerInvariant();
    }
}

// Use in User entity constructor
public User(string firstName, string lastName, string email, ...)
{
    // ... other properties
    Email = EmailNormalizer.Normalize(email);
}
```

### 3. Enhanced Validation Rules

**Recommendation**: Add more comprehensive email validation:

```csharp
RuleFor(x => x.Email)
    .NotEmpty().WithMessage("Email is required")
    .EmailAddress().WithMessage("Email must be a valid email address")
    .MaximumLength(100).WithMessage("Email must not exceed 100 characters")
    .Must(BeValidEmailDomain).WithMessage("Email domain is not allowed")
    .MustAsync(BeUniqueEmail).WithMessage("Email already exists");

private bool BeValidEmailDomain(string email)
{
    // Add domain whitelist/blacklist logic if needed
    var domain = email.Split('@').LastOrDefault()?.ToLowerInvariant();
    var blockedDomains = new[] { "tempmail.com", "10minutemail.com" };
    return !blockedDomains.Contains(domain);
}
```

### 4. Rate Limiting for Registration

**Recommendation**: Implement rate limiting for registration attempts:

```csharp
[HttpPost("register")]
[AllowAnonymous]
[RateLimit(MaxRequests = 5, WindowMinutes = 15)] // Custom attribute
public async Task<IActionResult> Register([FromBody] RegisterRequest request)
{
    // Registration logic
}
```

## Testing Recommendations

### 1. Unit Tests for Email Uniqueness

```csharp
[Test]
public async Task CreateUser_WithExistingEmail_ShouldThrowValidationException()
{
    // Arrange
    var existingEmail = "test@example.com";
    await CreateUserWithEmail(existingEmail);
    
    var command = new CreateUserCommand { Email = existingEmail };
    
    // Act & Assert
    var exception = await Assert.ThrowsAsync<ValidationException>(
        () => _mediator.Send(command));
    
    Assert.Contains("Email already exists", exception.Message);
}
```

### 2. Integration Tests

```csharp
[Test]
public async Task Register_WithDuplicateEmail_ShouldReturn409Conflict()
{
    // Arrange
    var registerRequest = new RegisterRequest { Email = "test@example.com" };
    await RegisterUser(registerRequest);
    
    // Act
    var response = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);
    
    // Assert
    Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
}
```

## Monitoring and Logging

The current implementation includes comprehensive logging for security monitoring:

- Registration attempts with duplicate emails
- Failed validation attempts
- Database constraint violations
- Performance metrics for email lookup operations

## Conclusion

The StockFlow-Pro application already implements email uniqueness validation following industry best practices with multiple layers of protection:

1. ✅ Database constraints (unique index)
2. ✅ Application-layer validation (FluentValidation)
3. ✅ Repository-layer checks
4. ✅ Service-layer validation
5. ✅ API-layer error handling
6. ✅ Comprehensive logging and monitoring

The implementation is robust and follows the defense-in-depth security principle. The additional recommendations above can further enhance the security and user experience.