using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using StockFlowPro.Application.Interfaces;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace StockFlowPro.Infrastructure.Services;

public class EmailVerificationService : IEmailVerificationService
{
    private readonly IDistributedCache _cache;
    private readonly ILogger<EmailVerificationService> _logger;
    private const int TokenExpiryHours = 24;
    private const string CacheKeyPrefix = "email_verification:";

    public EmailVerificationService(IDistributedCache cache, ILogger<EmailVerificationService> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public async Task<string> GenerateVerificationTokenAsync(string email, string purpose = "email_verification")
    {
        try
        {
            // Generate a secure random token
            var tokenBytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(tokenBytes);
            }
            var token = Convert.ToBase64String(tokenBytes).Replace("+", "-").Replace("/", "_").Replace("=", "");

            var verificationToken = new EmailVerificationToken
            {
                Token = token,
                Email = email.ToLowerInvariant(),
                Purpose = purpose,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(TokenExpiryHours),
                IsUsed = false
            };

            var cacheKey = $"{CacheKeyPrefix}{token}";
            var serializedToken = JsonSerializer.Serialize(verificationToken);
            var cacheOptions = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(TokenExpiryHours)
            };

            await _cache.SetStringAsync(cacheKey, serializedToken, cacheOptions);

            _logger.LogInformation("Generated verification token for email: {Email}, purpose: {Purpose}", email, purpose);
            return token;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate verification token for email: {Email}", email);
            throw;
        }
    }

    public async Task<bool> ValidateVerificationTokenAsync(string token, string email, string purpose = "email_verification")
    {
        try
        {
            var cacheKey = $"{CacheKeyPrefix}{token}";
            var serializedToken = await _cache.GetStringAsync(cacheKey);

            if (string.IsNullOrEmpty(serializedToken))
            {
                _logger.LogWarning("Verification token not found: {Token}", token);
                return false;
            }

            var verificationToken = JsonSerializer.Deserialize<EmailVerificationToken>(serializedToken);
            if (verificationToken == null)
            {
                _logger.LogWarning("Failed to deserialize verification token: {Token}", token);
                return false;
            }

            // Check if token is expired
            if (DateTime.UtcNow > verificationToken.ExpiresAt)
            {
                _logger.LogWarning("Verification token expired: {Token}", token);
                await _cache.RemoveAsync(cacheKey);
                return false;
            }

            // Check if token is already used
            if (verificationToken.IsUsed)
            {
                _logger.LogWarning("Verification token already used: {Token}", token);
                return false;
            }

            // Validate email and purpose
            if (!verificationToken.Email.Equals(email.ToLowerInvariant(), StringComparison.OrdinalIgnoreCase) ||
                !verificationToken.Purpose.Equals(purpose, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Verification token validation failed - email or purpose mismatch: {Token}", token);
                return false;
            }

            // Mark token as used
            verificationToken.IsUsed = true;
            var updatedSerializedToken = JsonSerializer.Serialize(verificationToken);
            await _cache.SetStringAsync(cacheKey, updatedSerializedToken, new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(TokenExpiryHours)
            });

            _logger.LogInformation("Successfully validated verification token for email: {Email}, purpose: {Purpose}", email, purpose);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating verification token: {Token}", token);
            return false;
        }
    }

    public async Task<string?> GetEmailFromTokenAsync(string token)
    {
        try
        {
            var cacheKey = $"{CacheKeyPrefix}{token}";
            var serializedToken = await _cache.GetStringAsync(cacheKey);

            if (string.IsNullOrEmpty(serializedToken))
            {
                return null;
            }

            var verificationToken = JsonSerializer.Deserialize<EmailVerificationToken>(serializedToken);
            return verificationToken?.Email;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting email from verification token: {Token}", token);
            return null;
        }
    }

    public async Task InvalidateTokenAsync(string token)
    {
        try
        {
            var cacheKey = $"{CacheKeyPrefix}{token}";
            await _cache.RemoveAsync(cacheKey);
            _logger.LogInformation("Invalidated verification token: {Token}", token);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error invalidating verification token: {Token}", token);
        }
    }

    public async Task CleanupExpiredTokensAsync()
    {
        // Redis automatically handles expiration, so this is mainly for logging
        _logger.LogInformation("Cleanup expired tokens called - Redis handles automatic expiration");
        await Task.CompletedTask;
    }
}