# Enhanced Email Validation Usage Guide

## Overview

This guide demonstrates how to use the enhanced email uniqueness validation system in StockFlow-Pro, which implements industry best practices for preventing duplicate email registrations.

## Current Implementation ✅

The application already has robust email uniqueness validation at multiple layers:

### 1. Database Level
- Unique index on email column
- Case-sensitive constraint (can be enhanced)

### 2. Application Level
- FluentValidation with async email existence check
- Comprehensive validation rules

### 3. Service Level
- Business logic validation
- Proper error handling and logging

## Enhanced Components

### 1. EmailNormalizer Utility

```csharp
using StockFlowPro.Domain.Utilities;

// Normalize email for consistent comparison
var normalizedEmail = EmailNormalizer.Normalize("  TEST@EXAMPLE.COM  ");
// Result: "test@example.com"

// Validate email format
bool isValid = EmailNormalizer.IsValidFormat("user@domain.com");

// Check for blocked domains
var blockedDomains = EmailNormalizer.GetCommonBlockedDomains();
bool isBlocked = EmailNormalizer.IsBlockedDomain("user@tempmail.org", blockedDomains);

// Extract domain
string domain = EmailNormalizer.ExtractDomain("user@example.com");
// Result: "example.com"
```

### 2. Enhanced Repository

```csharp
using StockFlowPro.Infrastructure.Repositories;

// Case-insensitive email existence check
var repository = new EnhancedUserRepository(context);
bool exists = await repository.EmailExistsAsync("TEST@EXAMPLE.COM");

// With exclusion for updates
bool existsForOthers = await repository.EmailExistsAsync("test@example.com", currentUserId);
```

### 3. Enhanced Validator

```csharp
using StockFlowPro.Application.Validators;

// Use enhanced validator with domain blocking
var validator = new EnhancedCreateUserCommandValidator(userRepository);
var result = await validator.ValidateAsync(command);
```

## API Usage Examples

### 1. User Registration

```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}
```

**Success Response (201 Created):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "User"
  }
}
```

**Duplicate Email Response (409 Conflict):**
```json
{
  "message": "User with this email already exists"
}
```

**Validation Error Response (400 Bad Request):**
```json
{
  "message": "Validation failed",
  "errors": [
    "Email already exists",
    "Email domain is not allowed"
  ]
}
```

### 2. User Creation (Admin)

```http
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@company.com",
  "phoneNumber": "+1234567891",
  "dateOfBirth": "1985-05-15",
  "role": "Manager"
}
```

## Validation Rules

### Email Format Validation
- Must be a valid email format
- Maximum 100 characters
- Required field

### Email Uniqueness Validation
- Case-insensitive comparison
- Checks across all existing users
- Excludes current user for updates

### Domain Blocking
- Blocks common temporary email providers
- Configurable blocked domain list
- Prevents spam registrations

### Additional Validations
- Name fields: Letters, spaces, hyphens, apostrophes, periods only
- Phone: Valid international format
- Age: Between 13 and 120 years old

## Error Handling

### Validation Errors
```csharp
try
{
    var user = await _mediator.Send(createUserCommand);
    return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
}
catch (ValidationException ex)
{
    return BadRequest(new { 
        message = "Validation failed", 
        errors = ex.Errors.Select(e => e.ErrorMessage) 
    });
}
catch (InvalidOperationException ex)
{
    return Conflict(new { message = ex.Message });
}
```

### Database Constraint Violations
```csharp
try
{
    await _context.SaveChangesAsync();
}
catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("IX_Users_Email_Unique") == true)
{
    throw new InvalidOperationException("Email address is already in use");
}
```

## Testing

### Unit Tests
```csharp
[Fact]
public async Task CreateUser_WithExistingEmail_ShouldFailValidation()
{
    // Arrange
    await CreateTestUser("existing@example.com");
    var command = new CreateUserCommand { Email = "existing@example.com" };
    
    // Act
    var result = await _validator.TestValidateAsync(command);
    
    // Assert
    result.ShouldHaveValidationErrorFor(x => x.Email)
        .WithErrorMessage("Email already exists");
}
```

### Integration Tests
```csharp
[Fact]
public async Task Register_WithDuplicateEmail_ShouldReturn409()
{
    // Arrange
    var request = new RegisterRequest { Email = "test@example.com" };
    await RegisterUser(request);
    
    // Act
    var response = await _client.PostAsJsonAsync("/api/auth/register", request);
    
    // Assert
    Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
}
```

## Configuration

### Blocked Domains
```csharp
// In appsettings.json
{
  "EmailValidation": {
    "BlockedDomains": [
      "tempmail.org",
      "10minutemail.com",
      "guerrillamail.com"
    ],
    "AllowedDomains": [
      "company.com",
      "partner.com"
    ]
  }
}
```

### Database Configuration
```csharp
// In UserConfiguration.cs
builder.HasIndex(u => u.Email)
    .IsUnique()
    .HasDatabaseName("IX_Users_Email_Unique");
```

## Performance Considerations

### Database Indexes
- Unique index on email column for fast lookups
- Consider case-insensitive collation for SQL Server

### Caching
- Cache validation results for frequently checked emails
- Use distributed cache for multi-instance deployments

### Rate Limiting
- Implement rate limiting for registration endpoints
- Prevent brute force email enumeration attacks

## Security Best Practices

### 1. Email Enumeration Prevention
```csharp
// Always return the same message regardless of email existence
return Ok(new { 
    message = "If an account with that email exists, a password reset link has been sent." 
});
```

### 2. Logging and Monitoring
```csharp
_logger.LogWarning("Duplicate email registration attempt: {Email} from IP: {IP}", 
    email, httpContext.Connection.RemoteIpAddress);
```

### 3. Input Sanitization
```csharp
// Always normalize and validate input
var normalizedEmail = EmailNormalizer.Normalize(inputEmail);
if (!EmailNormalizer.IsValidFormat(normalizedEmail))
{
    throw new ArgumentException("Invalid email format");
}
```

## Migration Guide

### From Basic to Enhanced Validation

1. **Install Enhanced Components**
   - Add `EmailNormalizer` utility
   - Update validators to use enhanced version
   - Update repositories for case-insensitive comparison

2. **Update Database**
   ```sql
   -- Add case-insensitive collation if needed
   ALTER TABLE Users ALTER COLUMN Email NVARCHAR(100) COLLATE SQL_Latin1_General_CP1_CI_AS;
   ```

3. **Update Existing Data**
   ```sql
   -- Normalize existing emails
   UPDATE Users SET Email = LOWER(LTRIM(RTRIM(Email)));
   ```

4. **Test Thoroughly**
   - Run all validation tests
   - Test case-insensitive scenarios
   - Verify database constraints

## Conclusion

The enhanced email validation system provides:

- ✅ Multi-layer validation (database, application, service, API)
- ✅ Case-insensitive email comparison
- ✅ Domain blocking for temporary emails
- ✅ Comprehensive error handling
- ✅ Performance optimization
- ✅ Security best practices
- ✅ Extensive testing coverage

This implementation ensures that users cannot register with duplicate emails while providing a robust and secure user experience.