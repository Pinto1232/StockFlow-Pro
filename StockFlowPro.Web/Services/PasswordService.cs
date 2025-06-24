using StockFlowPro.Application.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace StockFlowPro.Web.Services;

public class PasswordService : IPasswordService
{
    private readonly ILogger<PasswordService> _logger;

    public PasswordService(ILogger<PasswordService> logger)
    {
        _logger = logger;
    }

    public Task<string> HashPasswordAsync(string password)
    {
        using var sha256 = SHA256.Create();
        var salt = Guid.NewGuid().ToString();
        var saltedPassword = password + salt;
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword));
        var hashedPassword = Convert.ToBase64String(hashedBytes);
        return Task.FromResult($"{hashedPassword}:{salt}");
    }

    public Task<bool> VerifyPasswordAsync(string password, string hashedPassword)
    {
        if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(hashedPassword))
        {
            return Task.FromResult(false);
        }
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
            _logger.LogError(ex, "Error verifying password hash");
            return Task.FromResult(false);
        }
    }
}