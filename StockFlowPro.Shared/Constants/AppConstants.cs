namespace StockFlowPro.Shared.Constants;

/// <summary>
/// Application-wide constants for StockFlow Pro
/// </summary>
public static class AppConstants
{
    #region Pagination
    public const int DefaultPageSize = 10;
    public const int MaxPageSize = 100;
    public const int MinPageSize = 1;
    #endregion

    #region Date Formats
    public const string DateFormat = "yyyy-MM-dd";
    public const string DateTimeFormat = "yyyy-MM-dd HH:mm:ss";
    public const string TimeFormat = "HH:mm:ss";
    public const string DisplayDateFormat = "MMM dd, yyyy";
    public const string DisplayDateTimeFormat = "MMM dd, yyyy HH:mm";
    #endregion

    #region Business Rules
    public const int MaxProductNameLength = 100;
    public const int MaxDescriptionLength = 500;
    public const int MinStockLevel = 0;
    public const int DefaultReorderLevel = 10;
    public const decimal MaxPrice = 999999.99m;
    public const decimal MinPrice = 0.01m;
    #endregion

    #region File Upload
    public const int MaxFileSize = 5 * 1024 * 1024; // 5MB
    public const string AllowedImageExtensions = ".jpg,.jpeg,.png,.gif,.bmp";
    public const string AllowedDocumentExtensions = ".pdf,.doc,.docx,.xls,.xlsx,.txt";
    #endregion

    #region Cache Keys
    public const string ProductsCacheKey = "products_cache";
    public const string CategoriesCacheKey = "categories_cache";
    public const string UsersCacheKey = "users_cache";
    public const int DefaultCacheExpirationMinutes = 30;
    #endregion

    #region API
    public const string ApiVersion = "v1";
    public const int DefaultTimeoutSeconds = 30;
    public const int MaxRetryAttempts = 3;
    #endregion

    #region Validation Messages
    public const string RequiredFieldMessage = "This field is required.";
    public const string InvalidEmailMessage = "Please enter a valid email address.";
    public const string InvalidPhoneMessage = "Please enter a valid phone number.";
    public const string PasswordTooShortMessage = "Password must be at least 6 characters long.";
    #endregion
}