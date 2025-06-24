using System.Globalization;
using System.Text.RegularExpressions;

namespace StockFlowPro.Shared.Extensions;

/// <summary>
/// Extension methods for string manipulation
/// </summary>
public static class StringExtensions
{
    /// <summary>
    /// Converts string to title case (e.g., "hello world" -> "Hello World")
    /// </summary>
    public static string ToTitleCase(this string input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
          return input;
        }
       
        return CultureInfo.CurrentCulture.TextInfo.ToTitleCase(input.ToLower());
    }

    /// <summary>
    /// Checks if string is a valid email address
    /// </summary>
    public static bool IsValidEmail(this string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
             return false;
        }
           
        try
        {
            var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase);
            return emailRegex.IsMatch(email);
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Truncates string to specified length and adds ellipsis if needed
    /// </summary>
    public static string Truncate(this string input, int maxLength, string suffix = "...")
    {
        if (string.IsNullOrEmpty(input) || input.Length <= maxLength)
        {
           return input;
  
        }
           
        return input.Substring(0, maxLength - suffix.Length) + suffix;
    }

    /// <summary>
    /// Removes all whitespace from string
    /// </summary>
    public static string RemoveWhitespace(this string input)
    {
        if (string.IsNullOrEmpty(input))
        {
            return input;
        }

        return Regex.Replace(input, @"\s+", "");
    }

    /// <summary>
    /// Converts string to slug format (URL-friendly)
    /// </summary>
    public static string ToSlug(this string input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
               return string.Empty;
        }

        // Convert to lowercase
        var slug = input.ToLowerInvariant();

        // Replace spaces and special characters with hyphens
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", "-");
        slug = Regex.Replace(slug, @"-+", "-");

        // Trim hyphens from start and end
        return slug.Trim('-');
    }

    /// <summary>
    /// Checks if string contains any of the specified values (case-insensitive)
    /// </summary>
    public static bool ContainsAny(this string input, params string[] values)
    {
        if (string.IsNullOrEmpty(input) || values == null || values.Length == 0)
        {
              return false;
        }

        return values.Any(value => input.Contains(value, StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// Masks sensitive information (e.g., credit card numbers, passwords)
    /// </summary>
    public static string Mask(this string input, int visibleChars = 4, char maskChar = '*')
    {
        if (string.IsNullOrEmpty(input) || input.Length <= visibleChars)
        {
             return input;
        }

        var visiblePart = input.Substring(input.Length - visibleChars);
        var maskedPart = new string(maskChar, input.Length - visibleChars);

        return maskedPart + visiblePart;
    }

    /// <summary>
    /// Converts string to enum value safely
    /// </summary>
    public static T ToEnum<T>(this string value, T defaultValue = default) where T : struct, Enum
    {
        if (string.IsNullOrWhiteSpace(value))
        {
             return defaultValue;
        }

        return Enum.TryParse<T>(value, true, out var result) ? result : defaultValue;
    }
}