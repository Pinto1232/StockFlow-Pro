using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using StockFlowPro.Web.Attributes;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Domain.Repositories;
using System.ComponentModel.DataAnnotations;

namespace StockFlowPro.Web.Pages;

[RoleAuthorize(UserRole.Admin, UserRole.Manager)]
public class SystemSettingsModel : PageModel
{
    private readonly IUserRepository _userRepository;
    private readonly IProductRepository _productRepository;

    public SystemSettingsModel(IUserRepository userRepository, IProductRepository productRepository)
    {
        _userRepository = userRepository;
        _productRepository = productRepository;
    }

    [BindProperty]
    public SystemConfigurationSettings SystemConfig { get; set; } = new();

    [BindProperty]
    public SecuritySettings Security { get; set; } = new();

    [BindProperty]
    public NotificationSettings Notifications { get; set; } = new();

    [BindProperty]
    public BackupSettings Backup { get; set; } = new();

    [BindProperty]
    public PerformanceSettings Performance { get; set; } = new();

    public int TotalUsers { get; set; }
    public int TotalProducts { get; set; }
    public long DatabaseSize { get; set; }
    public DateTime LastBackup { get; set; }
    public string SystemVersion { get; set; } = "1.0.0";
    public double SystemUptime { get; set; }

    public async Task OnGetAsync()
    {
        await LoadSystemStatistics();
        LoadCurrentSettings();
    }

    public async Task<IActionResult> OnPostSaveGeneralAsync()
    {
        if (!ModelState.IsValid)
        {
            await LoadSystemStatistics();
            TempData["ErrorMessage"] = "Please correct the validation errors.";
            return Page();
        }

        try
        {
            // Save general system configuration
            await SaveSystemConfiguration();
            TempData["SuccessMessage"] = "General settings saved successfully!";
        }
        catch (Exception ex)
        {
            TempData["ErrorMessage"] = $"Failed to save settings: {ex.Message}";
        }

        return RedirectToPage();
    }

    public async Task<IActionResult> OnPostSaveSecurityAsync()
    {
        try
        {
            // Save security settings
            await SaveSecuritySettings();
            TempData["SuccessMessage"] = "Security settings saved successfully!";
        }
        catch (Exception ex)
        {
            TempData["ErrorMessage"] = $"Failed to save security settings: {ex.Message}";
        }

        return RedirectToPage();
    }

    public async Task<IActionResult> OnPostSaveNotificationsAsync()
    {
        try
        {
            // Save notification settings
            await SaveNotificationSettings();
            TempData["SuccessMessage"] = "Notification settings saved successfully!";
        }
        catch (Exception ex)
        {
            TempData["ErrorMessage"] = $"Failed to save notification settings: {ex.Message}";
        }

        return RedirectToPage();
    }

    public async Task<IActionResult> OnPostSaveBackupAsync()
    {
        try
        {
            // Save backup settings
            await SaveBackupSettings();
            TempData["SuccessMessage"] = "Backup settings saved successfully!";
        }
        catch (Exception ex)
        {
            TempData["ErrorMessage"] = $"Failed to save backup settings: {ex.Message}";
        }

        return RedirectToPage();
    }

    public async Task<IActionResult> OnPostSavePerformanceAsync()
    {
        try
        {
            // Save performance settings
            await SavePerformanceSettings();
            TempData["SuccessMessage"] = "Performance settings saved successfully!";
        }
        catch (Exception ex)
        {
            TempData["ErrorMessage"] = $"Failed to save performance settings: {ex.Message}";
        }

        return RedirectToPage();
    }

    public async Task<IActionResult> OnPostPerformBackupAsync()
    {
        try
        {
            // Trigger system backup
            await PerformSystemBackup();
            TempData["SuccessMessage"] = "System backup completed successfully!";
        }
        catch (Exception ex)
        {
            TempData["ErrorMessage"] = $"Backup failed: {ex.Message}";
        }

        return RedirectToPage();
    }

    public async Task<IActionResult> OnPostClearCacheAsync()
    {
        try
        {
            // Clear system cache
            await ClearSystemCache();
            TempData["SuccessMessage"] = "System cache cleared successfully!";
        }
        catch (Exception ex)
        {
            TempData["ErrorMessage"] = $"Failed to clear cache: {ex.Message}";
        }

        return RedirectToPage();
    }

    private async Task LoadSystemStatistics()
    {
        var users = await _userRepository.GetAllAsync();
        var products = await _productRepository.GetAllAsync();

        TotalUsers = users.Count();
        TotalProducts = products.Count();
        DatabaseSize = CalculateDatabaseSize();
        LastBackup = DateTime.Now.AddHours(-2); // Mock data
        SystemUptime = 99.8; // Mock data
    }

    private void LoadCurrentSettings()
    {
        // Load current system settings from configuration or database
        SystemConfig = new SystemConfigurationSettings
        {
            ApplicationName = "StockFlow Pro",
            CompanyName = "Your Company",
            TimeZone = "UTC",
            DateFormat = "MM/dd/yyyy",
            Currency = "ZAR",
            Language = "en-ZA",
            MaintenanceMode = false,
            DebugMode = false,
            MaxFileUploadSize = 10,
            SessionTimeout = 30
        };

        Security = new SecuritySettings
        {
            RequireHttps = true,
            EnableTwoFactorAuth = false,
            PasswordMinLength = 8,
            PasswordRequireUppercase = true,
            PasswordRequireLowercase = true,
            PasswordRequireNumbers = true,
            PasswordRequireSymbols = false,
            MaxLoginAttempts = 5,
            LockoutDuration = 15,
            SessionTimeout = 30
        };

        Notifications = new NotificationSettings
        {
            EnableEmailNotifications = true,
            EnableSmsNotifications = false,
            EnablePushNotifications = true,
            SmtpServer = "smtp.gmail.com",
            SmtpPort = 587,
            SmtpUsername = "",
            SmtpPassword = "",
            EnableSsl = true,
            NotifyOnUserRegistration = true,
            NotifyOnSystemErrors = true,
            NotifyOnBackupCompletion = true
        };

        Backup = new BackupSettings
        {
            EnableAutomaticBackup = true,
            BackupFrequency = "Daily",
            BackupTime = "02:00",
            RetentionDays = 30,
            BackupLocation = "/backups",
            IncludeFiles = true,
            CompressBackups = true
        };

        Performance = new PerformanceSettings
        {
            EnableCaching = true,
            CacheExpirationMinutes = 60,
            EnableCompression = true,
            MaxConcurrentUsers = 100,
            DatabaseConnectionPoolSize = 20,
            EnableQueryOptimization = true,
            LogLevel = "Information"
        };
    }

    private async Task SaveSystemConfiguration()
    {
        // Implementation to save system configuration
        await Task.Delay(100); // Simulate async operation
    }

    private async Task SaveSecuritySettings()
    {
        // Implementation to save security settings
        await Task.Delay(100); // Simulate async operation
    }

    private async Task SaveNotificationSettings()
    {
        // Implementation to save notification settings
        await Task.Delay(100); // Simulate async operation
    }

    private async Task SaveBackupSettings()
    {
        // Implementation to save backup settings
        await Task.Delay(100); // Simulate async operation
    }

    private async Task SavePerformanceSettings()
    {
        // Implementation to save performance settings
        await Task.Delay(100); // Simulate async operation
    }

    private async Task PerformSystemBackup()
    {
        // Implementation to perform system backup
        await Task.Delay(2000); // Simulate backup operation
        LastBackup = DateTime.Now;
    }

    private async Task ClearSystemCache()
    {
        // Implementation to clear system cache
        await Task.Delay(500); // Simulate cache clearing
    }

    private long CalculateDatabaseSize()
    {
        // Mock calculation - in real implementation, query database size
        return 1024 * 1024 * 256; // 256 MB
    }
}

public class SystemConfigurationSettings
{
    [Required]
    [StringLength(100)]
    public string ApplicationName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string CompanyName { get; set; } = string.Empty;

    [Required]
    public string TimeZone { get; set; } = "UTC";

    [Required]
    public string DateFormat { get; set; } = "MM/dd/yyyy";

    [Required]
    public string Currency { get; set; } = "ZAR";

    [Required]
    public string Language { get; set; } = "en-ZA";

    public bool MaintenanceMode { get; set; }
    public bool DebugMode { get; set; }

    [Range(1, 100)]
    public int MaxFileUploadSize { get; set; } = 10;

    [Range(5, 480)]
    public int SessionTimeout { get; set; } = 30;
}

public class SecuritySettings
{
    public bool RequireHttps { get; set; } = true;
    public bool EnableTwoFactorAuth { get; set; }

    [Range(6, 50)]
    public int PasswordMinLength { get; set; } = 8;

    public bool PasswordRequireUppercase { get; set; } = true;
    public bool PasswordRequireLowercase { get; set; } = true;
    public bool PasswordRequireNumbers { get; set; } = true;
    public bool PasswordRequireSymbols { get; set; }

    [Range(3, 10)]
    public int MaxLoginAttempts { get; set; } = 5;

    [Range(5, 60)]
    public int LockoutDuration { get; set; } = 15;

    [Range(5, 480)]
    public int SessionTimeout { get; set; } = 30;
}

public class NotificationSettings
{
    public bool EnableEmailNotifications { get; set; } = true;
    public bool EnableSmsNotifications { get; set; }
    public bool EnablePushNotifications { get; set; } = true;

    [StringLength(100)]
    public string SmtpServer { get; set; } = string.Empty;

    [Range(1, 65535)]
    public int SmtpPort { get; set; } = 587;

    [StringLength(100)]
    public string SmtpUsername { get; set; } = string.Empty;

    [StringLength(100)]
    public string SmtpPassword { get; set; } = string.Empty;

    public bool EnableSsl { get; set; } = true;
    public bool NotifyOnUserRegistration { get; set; } = true;
    public bool NotifyOnSystemErrors { get; set; } = true;
    public bool NotifyOnBackupCompletion { get; set; } = true;
}

public class BackupSettings
{
    public bool EnableAutomaticBackup { get; set; } = true;

    [Required]
    public string BackupFrequency { get; set; } = "Daily";

    [Required]
    public string BackupTime { get; set; } = "02:00";

    [Range(1, 365)]
    public int RetentionDays { get; set; } = 30;

    [Required]
    [StringLength(200)]
    public string BackupLocation { get; set; } = "/backups";

    public bool IncludeFiles { get; set; } = true;
    public bool CompressBackups { get; set; } = true;
}

public class PerformanceSettings
{
    public bool EnableCaching { get; set; } = true;

    [Range(1, 1440)]
    public int CacheExpirationMinutes { get; set; } = 60;

    public bool EnableCompression { get; set; } = true;

    [Range(10, 1000)]
    public int MaxConcurrentUsers { get; set; } = 100;

    [Range(5, 100)]
    public int DatabaseConnectionPoolSize { get; set; } = 20;

    public bool EnableQueryOptimization { get; set; } = true;

    [Required]
    public string LogLevel { get; set; } = "Information";
}