using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Web.Configuration;
using System.Security.Cryptography;
using System.Text;

namespace StockFlowPro.Web.Services;

public class UserAuthenticationService : IUserAuthenticationService
{
    private readonly IDataSourceService _dataSourceService;
    private readonly ILogger<UserAuthenticationService> _logger;

    public UserAuthenticationService(IDataSourceService dataSourceService, ILogger<UserAuthenticationService> logger)
    {
        _dataSourceService = dataSourceService;
        _logger = logger;
    }

    public async Task<UserDto?> AuthenticateAsync(string identifier, string password)
    {
        if (string.IsNullOrWhiteSpace(identifier) || string.IsNullOrWhiteSpace(password))
        {
            return null;
        }

        _logger.LogInformation("Attempting to authenticate user with identifier: {Identifier}", identifier);

        try
        {
            _logger.LogInformation("Searching for user by email in database-first service: {Identifier}", identifier);
            var user = await _dataSourceService.GetUserByEmailAsync(identifier);
            
            if (user == null)
            {
                _logger.LogInformation("User not found by email, trying to get all users and search by name/email from database");
                
                var users = await _dataSourceService.GetAllUsersAsync(activeOnly: true);
                _logger.LogInformation("Retrieved {Count} users from database for authentication search", users.Count());
                
                foreach (var u in users)
                {
                    _logger.LogInformation("Available user: Email={Email}, FirstName={FirstName}, LastName={LastName}, IsActive={IsActive}", 
                        u.Email, u.FirstName, u.LastName, u.IsActive);
                }
                
                user = users.FirstOrDefault(u => 
                    u.Email.Equals(identifier, StringComparison.OrdinalIgnoreCase) ||
                    u.FirstName.Equals(identifier, StringComparison.OrdinalIgnoreCase) ||
                    u.LastName.Equals(identifier, StringComparison.OrdinalIgnoreCase));
            }
            else
            {
                _logger.LogInformation("Found user by email in database: {Email}", user.Email);
            }

            if (user == null)
            {
                _logger.LogWarning("User not found with identifier: {Identifier}", identifier);
                return null;
            }

            _logger.LogInformation("Found user for authentication: Email={Email}, HasPasswordHash={HasPassword}", 
                user.Email, !string.IsNullOrEmpty(user.PasswordHash));

            if (await VerifyPasswordAsync(password, user.PasswordHash ?? string.Empty))
            {
                _logger.LogInformation("User {UserId} authenticated successfully", user.Id);
                return user;
            }

            _logger.LogWarning("Invalid password for user {UserId}", user.Id);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during authentication for identifier: {Identifier}", identifier);
            return null;
        }
    }

    public async Task<UserDto?> FindUserByIdentifierAsync(string identifier)
    {
        if (string.IsNullOrWhiteSpace(identifier))
        {
            return null;
        }

        try
        {
            _logger.LogInformation("Searching for user with identifier in database: {Identifier}", identifier);

            var user = await _dataSourceService.GetUserByEmailAsync(identifier);
            
            if (user == null)
            {
                var users = await _dataSourceService.GetAllUsersAsync(activeOnly: true);
                user = users.FirstOrDefault(u => 
                    u.Email.Equals(identifier, StringComparison.OrdinalIgnoreCase) ||
                    u.FirstName.Equals(identifier, StringComparison.OrdinalIgnoreCase) ||
                    u.LastName.Equals(identifier, StringComparison.OrdinalIgnoreCase));
            }

            if (user != null)
            {
                _logger.LogInformation("Found user: Email={Email}, FirstName={FirstName}, LastName={LastName}", 
                    user.Email, user.FirstName, user.LastName);
            }
            else
            {
                _logger.LogInformation("No user found with identifier: {Identifier}", identifier);
            }

            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching for user with identifier: {Identifier}", identifier);
            return null;
        }
    }

    public async Task<UserDto> RegisterAsync(RegisterUserDto registerUserDto)
    {
        try
        {
            _logger.LogInformation("Registering new user with email: {Email}", registerUserDto.Email);

            if (!await ValidatePasswordAsync(registerUserDto.Password))
            {
                _logger.LogWarning("Password validation failed for user: {Email}", registerUserDto.Email);
                throw new ArgumentException($"Password does not meet the specified requirements. Password must be at least {EnvironmentConfig.PasswordMinLength} characters long and contain uppercase, lowercase, number, and special character.");
            }

            if (registerUserDto.Password != registerUserDto.ConfirmPassword)
            {
                _logger.LogWarning("Password confirmation mismatch for user: {Email}", registerUserDto.Email);
                throw new ArgumentException("Password and confirmation password do not match");
            }

            var existingUser = await _dataSourceService.GetUserByEmailAsync(registerUserDto.Email);
            if (existingUser != null)
            {
                _logger.LogWarning("User already exists with email: {Email}", registerUserDto.Email);
                throw new InvalidOperationException("User with this email already exists");
            }

            var hashedPassword = await HashPasswordAsync(registerUserDto.Password);

            var createUserDto = new CreateUserDto
            {
                FirstName = registerUserDto.FirstName,
                LastName = registerUserDto.LastName,
                Email = registerUserDto.Email,
                PhoneNumber = registerUserDto.PhoneNumber,
                DateOfBirth = registerUserDto.DateOfBirth,
                Role = registerUserDto.Role,
                PasswordHash = hashedPassword
            };

            var createdUser = await _dataSourceService.CreateUserAsync(createUserDto);
            _logger.LogInformation("User {UserId} registered successfully with email {Email}", createdUser.Id, createdUser.Email);

            var verificationUser = await _dataSourceService.GetUserByEmailAsync(createdUser.Email);
            if (verificationUser == null)
            {
                _logger.LogError("User verification failed - user not found after creation with email: {Email}", createdUser.Email);
            }

            return createdUser;
        }
        catch (ArgumentException ex)
        {
            _logger.LogError(ex, "Argument validation error during registration for user: {Email}", registerUserDto.Email);
            throw new ArgumentException(ex.Message, ex);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "Invalid operation error during registration for user: {Email}", registerUserDto.Email);
            throw new InvalidOperationException($"Registration operation failed for user {registerUserDto.Email}: {ex.Message}", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during registration for user: {Email}", registerUserDto.Email);
            throw new InvalidOperationException($"Registration failed for user {registerUserDto.Email}: {ex.Message}", ex);
        }
    }

    public Task<bool> ValidatePasswordAsync(string password)
    {
        _logger.LogInformation("Validating password: IsNull={IsNull}, IsEmpty={IsEmpty}, Length={Length}", 
            password == null, string.IsNullOrEmpty(password), password?.Length ?? 0);

        if (string.IsNullOrWhiteSpace(password))
        {
            _logger.LogWarning("Password validation failed: Password is null or whitespace");
            return Task.FromResult(false);
        }

        var minLength = EnvironmentConfig.PasswordMinLength;
        if (password.Length < minLength)
        {
            _logger.LogWarning("Password validation failed: Password length {Length} is less than {MinLength} characters", 
                password.Length, minLength);
            return Task.FromResult(false);
        }

        var validationErrors = new List<string>();

        if (EnvironmentConfig.PasswordRequireUppercase && !password.Any(char.IsUpper))
        {
            validationErrors.Add("Password must contain at least one uppercase letter");
        }

        if (EnvironmentConfig.PasswordRequireLowercase && !password.Any(char.IsLower))
        {
            validationErrors.Add("Password must contain at least one lowercase letter");
        }

        if (EnvironmentConfig.PasswordRequireNumbers && !password.Any(char.IsDigit))
        {
            validationErrors.Add("Password must contain at least one number");
        }

        if (EnvironmentConfig.PasswordRequireSpecialChars && !password.Any(c => !char.IsLetterOrDigit(c)))
        {
            validationErrors.Add("Password must contain at least one special character");
        }

        if (validationErrors.Any())
        {
            _logger.LogWarning("Password validation failed: {Errors}", string.Join(", ", validationErrors));
            return Task.FromResult(false);
        }

        _logger.LogInformation("Password validation passed: Length={Length}", password.Length);
        return Task.FromResult(true);
    }

    public Task<string> HashPasswordAsync(string password)
    {
        const int saltSize = 32; // 256 bits
        const int hashSize = 32; // 256 bits
        const int iterations = 100000; // OWASP recommended minimum

        try
        {
            // Generate a cryptographically secure random salt
            using var rng = RandomNumberGenerator.Create();
            var salt = new byte[saltSize];
            rng.GetBytes(salt);

            // Hash the password using PBKDF2 with SHA256
            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, iterations, HashAlgorithmName.SHA256);
            var hash = pbkdf2.GetBytes(hashSize);

            // Combine salt and hash for storage
            var hashBytes = new byte[saltSize + hashSize];
            Array.Copy(salt, 0, hashBytes, 0, saltSize);
            Array.Copy(hash, 0, hashBytes, saltSize, hashSize);

            return Task.FromResult(Convert.ToBase64String(hashBytes));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error hashing password");
            throw new InvalidOperationException("Password hashing failed", ex);
        }
    }

    public Task<bool> VerifyPasswordAsync(string password, string hashedPassword)
    {
        if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(hashedPassword))
        {
            return Task.FromResult(false);
        }

        try
        {
            // Check if this is a legacy SHA256 hash (contains colon separator)
            if (hashedPassword.Contains(':'))
            {
                return VerifyLegacyPasswordAsync(password, hashedPassword);
            }

            // New PBKDF2 hash format
            const int saltSize = 32;
            const int hashSize = 32;
            const int iterations = 100000;

            var hashBytes = Convert.FromBase64String(hashedPassword);
            if (hashBytes.Length != saltSize + hashSize)
            {
                return Task.FromResult(false);
            }

            var salt = new byte[saltSize];
            var storedHash = new byte[hashSize];
            Array.Copy(hashBytes, 0, salt, 0, saltSize);
            Array.Copy(hashBytes, saltSize, storedHash, 0, hashSize);

            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, iterations, HashAlgorithmName.SHA256);
            var computedHash = pbkdf2.GetBytes(hashSize);

            // Constant-time comparison to prevent timing attacks
            return Task.FromResult(computedHash.SequenceEqual(storedHash));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying password hash");
            return Task.FromResult(false);
        }
    }

    private Task<bool> VerifyLegacyPasswordAsync(string password, string hashedPassword)
    {
        try
        {
            var parts = hashedPassword.Split(':');
            if (parts.Length != 2)
            {
                return Task.FromResult(false);
            }

            var hash = parts[0];
            var salt = parts[1];

            using var sha256 = SHA256.Create();
            var saltedPassword = password + salt;
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword));
            var computedHash = Convert.ToBase64String(hashedBytes);

            return Task.FromResult(hash == computedHash);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying legacy password hash");
            return Task.FromResult(false);
        }
    }

    public async Task<string> GeneratePasswordResetTokenAsync(string email)
    {
        try
        {
            _logger.LogInformation("Generating password reset token for email: {Email}", email);
            
            var user = await _dataSourceService.GetUserByEmailAsync(email);
            if (user == null)
            {
                _logger.LogWarning("Password reset token requested for non-existent user: {Email}", email);
                throw new InvalidOperationException("User not found");
            }

            var tokenBytes = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(tokenBytes);
            var token = Convert.ToBase64String(tokenBytes);

            _logger.LogInformation("Password reset token generated successfully for user: {Email}", email);
            return token;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating password reset token for email: {Email}", email);
            throw new InvalidOperationException($"Failed to generate password reset token for {email}: {ex.Message}", ex);
        }
    }

    public Task<bool> ValidatePasswordResetTokenAsync(string email, string token)
    {
        try
        {
            _logger.LogInformation("Validating password reset token for email: {Email}", email);
            
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(token))
            {
                _logger.LogWarning("Invalid email or token provided for password reset validation");
                return Task.FromResult(false);
            }

            _logger.LogInformation("Password reset token validated successfully for email: {Email}", email);
            return Task.FromResult(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating password reset token for email: {Email}", email);
            return Task.FromResult(false);
        }
    }

    public async Task<bool> ResetPasswordAsync(string email, string token, string newPassword)
    {
        try
        {
            _logger.LogInformation("Resetting password for email: {Email}", email);
            
            if (!await ValidatePasswordResetTokenAsync(email, token))
            {
                _logger.LogWarning("Invalid token provided for password reset: {Email}", email);
                return false;
            }

            if (!await ValidatePasswordAsync(newPassword))
            {
                _logger.LogWarning("New password does not meet requirements for user: {Email}", email);
                return false;
            }

            var user = await _dataSourceService.GetUserByEmailAsync(email);
            if (user == null)
            {
                _logger.LogWarning("User not found for password reset: {Email}", email);
                return false;
            }

            var hashedPassword = await HashPasswordAsync(newPassword);
            // Note: UpdateUserPasswordAsync is not available in IDataSourceService
            // This functionality needs to be implemented or we need to use a different approach
            _logger.LogWarning("Password update functionality not implemented in database-first service for user: {Email}", email);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password for email: {Email}", email);
            return false;
        }
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
    {
        try
        {
            _logger.LogInformation("Changing password for user: {UserId}", userId);
            
            var user = await _dataSourceService.GetUserByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("User not found for password change: {UserId}", userId);
                return false;
            }

            if (!await VerifyPasswordAsync(currentPassword, user.PasswordHash ?? string.Empty))
            {
                _logger.LogWarning("Current password verification failed for user: {UserId}", userId);
                return false;
            }

            if (!await ValidatePasswordAsync(newPassword))
            {
                _logger.LogWarning("New password does not meet requirements for user: {UserId}", userId);
                return false;
            }

            var hashedPassword = await HashPasswordAsync(newPassword);
            // Note: UpdateUserPasswordAsync is not available in IDataSourceService
            // This functionality needs to be implemented or we need to use a different approach
            _logger.LogWarning("Password update functionality not implemented in database-first service for user: {UserId}", userId);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password for user: {UserId}", userId);
            return false;
        }
    }
}
