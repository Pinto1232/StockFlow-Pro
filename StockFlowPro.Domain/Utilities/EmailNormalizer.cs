using System.Text.RegularExpressions;

namespace StockFlowPro.Domain.Utilities;

/// <summary>
/// Utility class for email normalization and validation
/// </summary>
public static class EmailNormalizer
{
    private static readonly Regex EmailRegex = new(
        @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    /// <summary>
    /// Normalizes an email address for consistent storage and comparison
    /// </summary>
    /// <param name="email">The email address to normalize</param>
    /// <returns>Normalized email address</returns>
    public static string Normalize(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return string.Empty;
        }
            
        return email.Trim().ToLowerInvariant();
    }

    /// <summary>
    /// Validates if an email address has a valid format
    /// </summary>
    /// <param name="email">The email address to validate</param>
    /// <returns>True if the email format is valid, false otherwise</returns>
    public static bool IsValidFormat(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return false;
        }
            
        return EmailRegex.IsMatch(email);
    }

    /// <summary>
    /// Checks if an email domain is in the blocked list
    /// </summary>
    /// <param name="email">The email address to check</param>
    /// <param name="blockedDomains">List of blocked domains</param>
    /// <returns>True if the domain is blocked, false otherwise</returns>
    public static bool IsBlockedDomain(string email, IEnumerable<string> blockedDomains)
    {
        if (string.IsNullOrWhiteSpace(email) || blockedDomains == null)
        {
            return false;
        }
            
        var domain = ExtractDomain(email);
        if (string.IsNullOrEmpty(domain))
        {
            return false;
        }
            
        return blockedDomains.Any(blocked => 
            string.Equals(domain, blocked, StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// Extracts the domain part from an email address
    /// </summary>
    /// <param name="email">The email address</param>
    /// <returns>The domain part of the email, or empty string if invalid</returns>
    public static string ExtractDomain(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return string.Empty;
        }
            
        var atIndex = email.LastIndexOf('@');
        if (atIndex < 0 || atIndex == email.Length - 1)
        {
            return string.Empty;
        }
            
        return email.Substring(atIndex + 1).ToLowerInvariant();
    }

    /// <summary>
    /// Gets a list of commonly blocked temporary email domains
    /// </summary>
    /// <returns>List of blocked domains</returns>
    public static IEnumerable<string> GetCommonBlockedDomains()
    {
        return new[]
        {
            "10minutemail.com",
            "tempmail.org",
            "guerrillamail.com",
            "mailinator.com",
            "throwaway.email",
            "temp-mail.org",
            "getnada.com",
            "maildrop.cc",
            "yopmail.com",
            "sharklasers.com"
        };
    }
}