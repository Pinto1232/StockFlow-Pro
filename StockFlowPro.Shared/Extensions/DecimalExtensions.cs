using System.Globalization;

namespace StockFlowPro.Shared.Extensions;

/// <summary>
/// Extension methods for decimal/money operations
/// </summary>
public static class DecimalExtensions
{
    /// <summary>
    /// Formats decimal as currency
    /// </summary>
    public static string ToCurrency(this decimal amount, string currencySymbol = "R")
    {
        return $"{currencySymbol}{amount:N2}";
    }

    /// <summary>
    /// Formats decimal as currency with culture info
    /// </summary>
    public static string ToCurrency(this decimal amount, CultureInfo culture)
    {
        return amount.ToString("C", culture);
    }

    /// <summary>
    /// Formats decimal as percentage
    /// </summary>
    public static string ToPercentage(this decimal amount, int decimals = 2)
    {
        return amount.ToString($"P{decimals}");
    }

    /// <summary>
    /// Rounds to specified decimal places
    /// </summary>
    public static decimal RoundTo(this decimal amount, int decimals = 2)
    {
        return Math.Round(amount, decimals, MidpointRounding.AwayFromZero);
    }

    /// <summary>
    /// Checks if amount is positive
    /// </summary>
    public static bool IsPositive(this decimal amount)
    {
        return amount > 0;
    }

    /// <summary>
    /// Checks if amount is negative
    /// </summary>
    public static bool IsNegative(this decimal amount)
    {
        return amount < 0;
    }

    /// <summary>
    /// Checks if amount is zero
    /// </summary>
    public static bool IsZero(this decimal amount)
    {
        return amount == 0;
    }

    /// <summary>
    /// Calculates percentage of total
    /// </summary>
    public static decimal PercentageOf(this decimal amount, decimal total)
    {
        if (total == 0) {return 0;}
        return (amount / total) * 100;
    }

    /// <summary>
    /// Calculates discount amount
    /// </summary>
    public static decimal CalculateDiscount(this decimal amount, decimal discountPercentage)
    {
        return amount * (discountPercentage / 100);
    }

    /// <summary>
    /// Applies discount and returns final amount
    /// </summary>
    public static decimal ApplyDiscount(this decimal amount, decimal discountPercentage)
    {
        var discount = amount.CalculateDiscount(discountPercentage);
        return amount - discount;
    }

    /// <summary>
    /// Calculates tax amount
    /// </summary>
    public static decimal CalculateTax(this decimal amount, decimal taxPercentage)
    {
        return amount * (taxPercentage / 100);
    }

    /// <summary>
    /// Applies tax and returns total amount
    /// </summary>
    public static decimal ApplyTax(this decimal amount, decimal taxPercentage)
    {
        var tax = amount.CalculateTax(taxPercentage);
        return amount + tax;
    }

    /// <summary>
    /// Formats large numbers with K, M, B suffixes
    /// </summary>
    public static string ToShortFormat(this decimal amount)
    {
        if (amount >= 1_000_000_000)
          {  return $"{amount / 1_000_000_000:F1}B";}
        
        if (amount >= 1_000_000)
           { return $"{amount / 1_000_000:F1}M";}
        
        if (amount >= 1_000)
           { return $"{amount / 1_000:F1}K";}
        
        return amount.ToString("F2");
    }
}