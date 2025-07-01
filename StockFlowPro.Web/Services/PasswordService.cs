using StockFlowPro.Application.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace StockFlowPro.Web.Services;

public class PasswordService : IPasswordService
{
    private readonly ILogger<PasswordService> _logger;
    private const int SaltSize = 32; // 256 bits
    private const int HashSize = 32; // 256 bits
    private const int Iterations = 100000; // OWASP recommended minimum

    public PasswordService(ILogger<PasswordService> logger)
    {
        _logger = logger;
    }

    public Task<string> HashPasswordAsync(string password)
    {
        try
        {
            // Generate a cryptographically secure random salt
            using var rng = RandomNumberGenerator.Create();
            var salt = new byte[SaltSize];
            rng.GetBytes(salt);

            // Hash the password using PBKDF2 with SHA256
            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
            var hash = pbkdf2.GetBytes(HashSize);

            // Combine salt and hash for storage
            var hashBytes = new byte[SaltSize + HashSize];
            Array.Copy(salt, 0, hashBytes, 0, SaltSize);
            Array.Copy(hash, 0, hashBytes, SaltSize, HashSize);

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
            // Handle legacy SHA256 hashes for backward compatibility
            if (hashedPassword.Contains(':'))
            {
                return VerifyLegacyPasswordAsync(password, hashedPassword);
            }

            var hashBytes = Convert.FromBase64String(hashedPassword);
            
            // Verify the hash has the correct length
            if (hashBytes.Length != SaltSize + HashSize)
            {
                return Task.FromResult(false);
            }

            // Extract salt and hash
            var salt = new byte[SaltSize];
            Array.Copy(hashBytes, 0, salt, 0, SaltSize);
            
            var storedHash = new byte[HashSize];
            Array.Copy(hashBytes, SaltSize, storedHash, 0, HashSize);

            // Hash the provided password with the stored salt
            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
            var computedHash = pbkdf2.GetBytes(HashSize);

            // Compare hashes using constant-time comparison to prevent timing attacks
            return Task.FromResult(CryptographicOperations.FixedTimeEquals(storedHash, computedHash));
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
}