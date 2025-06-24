using StockFlowPro.Shared.Constants;

namespace StockFlowPro.Shared.Extensions;

/// <summary>
/// Extension methods for DateTime manipulation
/// </summary>
public static class DateTimeExtensions
{
    /// <summary>
    /// Formats DateTime for display in the application
    /// </summary>
    public static string ToDisplayFormat(this DateTime dateTime)
    {
        return dateTime.ToString(AppConstants.DisplayDateTimeFormat);
    }

    /// <summary>
    /// Formats DateTime for display (date only)
    /// </summary>
    public static string ToDisplayDateFormat(this DateTime dateTime)
    {
        return dateTime.ToString(AppConstants.DisplayDateFormat);
    }

    /// <summary>
    /// Checks if date is today
    /// </summary>
    public static bool IsToday(this DateTime dateTime)
    {
        return dateTime.Date == DateTime.Today;
    }

    /// <summary>
    /// Checks if date is in the past
    /// </summary>
    public static bool IsPast(this DateTime dateTime)
    {
        return dateTime < DateTime.Now;
    }

    /// <summary>
    /// Checks if date is in the future
    /// </summary>
    public static bool IsFuture(this DateTime dateTime)
    {
        return dateTime > DateTime.Now;
    }

    /// <summary>
    /// Gets the start of the day (00:00:00)
    /// </summary>
    public static DateTime StartOfDay(this DateTime dateTime)
    {
        return dateTime.Date;
    }

    /// <summary>
    /// Gets the end of the day (23:59:59.999)
    /// </summary>
    public static DateTime EndOfDay(this DateTime dateTime)
    {
        return dateTime.Date.AddDays(1).AddTicks(-1);
    }

    /// <summary>
    /// Gets the start of the week (Monday)
    /// </summary>
    public static DateTime StartOfWeek(this DateTime dateTime)
    {
        var diff = (7 + (dateTime.DayOfWeek - DayOfWeek.Monday)) % 7;
        return dateTime.AddDays(-1 * diff).Date;
    }

    /// <summary>
    /// Gets the start of the month
    /// </summary>
    public static DateTime StartOfMonth(this DateTime dateTime)
    {
        return new DateTime(dateTime.Year, dateTime.Month, 1);
    }

    /// <summary>
    /// Gets the end of the month
    /// </summary>
    public static DateTime EndOfMonth(this DateTime dateTime)
    {
        return dateTime.StartOfMonth().AddMonths(1).AddDays(-1);
    }

    /// <summary>
    /// Calculates age from birth date
    /// </summary>
    public static int CalculateAge(this DateTime birthDate)
    {
        var today = DateTime.Today;
        var age = today.Year - birthDate.Year;

        if (birthDate.Date > today.AddYears(-age))
        {
            age--;
        }

        return age;
    }

    /// <summary>
    /// Gets a friendly time description (e.g., "2 hours ago", "in 3 days")
    /// </summary>
    public static string ToFriendlyString(this DateTime dateTime)
    {
        var now = DateTime.Now;
        var timeSpan = now - dateTime;

        if (timeSpan.TotalDays > 365)
        {
             return $"{(int)(timeSpan.TotalDays / 365)} year{((int)(timeSpan.TotalDays / 365) == 1 ? "" : "s")} ago";
        }


        if (timeSpan.TotalDays > 30)
        {
                return $"{(int)(timeSpan.TotalDays / 30)} month{((int)(timeSpan.TotalDays / 30) == 1 ? "" : "s")} ago";
        }

        if (timeSpan.TotalDays > 1)
        {
                return $"{(int)timeSpan.TotalDays} day{((int)timeSpan.TotalDays == 1 ? "" : "s")} ago";
        }

        if (timeSpan.TotalHours > 1)
        {
                return $"{(int)timeSpan.TotalHours} hour{((int)timeSpan.TotalHours == 1 ? "" : "s")} ago";
        }

        if (timeSpan.TotalMinutes > 1)
        {
             return $"{(int)timeSpan.TotalMinutes} minute{((int)timeSpan.TotalMinutes == 1 ? "" : "s")} ago";
        }

        return "Just now";
    }

    /// <summary>
    /// Checks if date is a business day (Monday-Friday)
    /// </summary>
    public static bool IsBusinessDay(this DateTime dateTime)
    {
        return dateTime.DayOfWeek != DayOfWeek.Saturday && dateTime.DayOfWeek != DayOfWeek.Sunday;
    }

    /// <summary>
    /// Gets the next business day
    /// </summary>
    public static DateTime NextBusinessDay(this DateTime dateTime)
    {
        var nextDay = dateTime.AddDays(1);
        while (!nextDay.IsBusinessDay())
        {
            nextDay = nextDay.AddDays(1);
        }
        return nextDay;
    }
}