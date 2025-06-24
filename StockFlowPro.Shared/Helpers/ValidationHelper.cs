using System.Text.RegularExpressions;

namespace StockFlowPro.Shared.Helpers;

/// <summary>
/// Helper class for common validation operations
/// </summary>
public static class ValidationHelper
{
    /// <summary>
    /// Validates email address format
    /// </summary>
    public static bool IsValidEmail(string email)
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
    /// Validates phone number format (supports various formats)
    /// </summary>
    public static bool IsValidPhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            {return false;}

        // Remove all non-digit characters
        var digitsOnly = Regex.Replace(phoneNumber, @"[^\d]", "");

        // Check if it's a valid length (10-15 digits)
        return digitsOnly.Length >= 10 && digitsOnly.Length <= 15;
    }

    /// <summary>
    /// Validates password strength
    /// </summary>
    public static bool IsValidPassword(string password, int minLength = 6, bool requireUppercase = false, 
        bool requireLowercase = false, bool requireNumbers = false, bool requireSpecialChars = false)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < minLength)
            {return false;}

        if (requireUppercase && !password.Any(char.IsUpper))
            {return false;}

        if (requireLowercase && !password.Any(char.IsLower))
            {return false;}

        if (requireNumbers && !password.Any(char.IsDigit))
            {return false;}

        if (requireSpecialChars && !password.Any(c => !char.IsLetterOrDigit(c)))
            {return false;}

        return true;
    }

    /// <summary>
    /// Validates URL format
    /// </summary>
    public static bool IsValidUrl(string url)
    {
        if (string.IsNullOrWhiteSpace(url))
           { return false;}

        return Uri.TryCreate(url, UriKind.Absolute, out var result) &&
               (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps);
    }

    /// <summary>
    /// Validates if string contains only letters and spaces
    /// </summary>
    public static bool IsValidName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            {return false;}

        return Regex.IsMatch(name, @"^[a-zA-Z\s]+$");
    }

    /// <summary>
    /// Validates if string is a valid SKU format
    /// </summary>
    public static bool IsValidSku(string sku)
    {
        if (string.IsNullOrWhiteSpace(sku))
            {return false;}

        // SKU should be alphanumeric with optional hyphens/underscores, 3-20 characters
        return Regex.IsMatch(sku, @"^[a-zA-Z0-9_-]{3,20}$");
    }

    /// <summary>
    /// Validates if number is within specified range
    /// </summary>
    public static bool IsInRange(decimal value, decimal min, decimal max)
    {
        return value >= min && value <= max;
    }

    /// <summary>
    /// Validates if date is within specified range
    /// </summary>
    public static bool IsDateInRange(DateTime date, DateTime? minDate = null, DateTime? maxDate = null)
    {
        if (minDate.HasValue && date < minDate.Value)
            {return false;}

        if (maxDate.HasValue && date > maxDate.Value)
            {return false;}

        return true;
    }

    /// <summary>
    /// Validates file extension
    /// </summary>
    public static bool IsValidFileExtension(string fileName, string allowedExtensions)
    {
        if (string.IsNullOrWhiteSpace(fileName) || string.IsNullOrWhiteSpace(allowedExtensions))
            {return false;}

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        var allowed = allowedExtensions.ToLowerInvariant().Split(',');

        return allowed.Contains(extension);
    }

    /// <summary>
    /// Validates file size
    /// </summary>
    public static bool IsValidFileSize(long fileSizeBytes, long maxSizeBytes)
    {
        return fileSizeBytes > 0 && fileSizeBytes <= maxSizeBytes;
    }

    /// <summary>
    /// Gets password strength score (0-5)
    /// </summary>
    public static int GetPasswordStrength(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            {return 0;}

        int score = 0;

        // Length
        if (password.Length >= 8) {score++;}
        if (password.Length >= 12) {score++;}

        // Character types
        if (password.Any(char.IsUpper)) {score++;}
        if (password.Any(char.IsLower)) {score++;}
        if (password.Any(char.IsDigit)) {score++;}
        if (password.Any(c => !char.IsLetterOrDigit(c))){ score++;}

        return Math.Min(score, 5);
    }
}