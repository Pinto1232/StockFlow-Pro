using StockFlowPro.Shared.Constants;

namespace StockFlowPro.Shared.Helpers;

/// <summary>
/// Helper class for file operations
/// </summary>
public static class FileHelper
{
    /// <summary>
    /// Gets file size in human-readable format
    /// </summary>
    public static string GetFileSizeString(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB", "TB" };
        double len = bytes;
        int order = 0;

        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len = len / 1024;
        }

        return $"{len:0.##} {sizes[order]}";
    }

    /// <summary>
    /// Validates if file is an allowed image type
    /// </summary>
    public static bool IsValidImageFile(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            {return false;}

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        var allowed = AppConstants.AllowedImageExtensions.ToLowerInvariant().Split(',');
        return allowed.Contains(extension);
    }

    /// <summary>
    /// Validates if file is an allowed document type
    /// </summary>
    public static bool IsValidDocumentFile(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
          {  return false;}

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        var allowed = AppConstants.AllowedDocumentExtensions.ToLowerInvariant().Split(',');
        return allowed.Contains(extension);
    }

    /// <summary>
    /// Validates file extension against allowed extensions
    /// </summary>
    public static bool IsValidFileExtension(string fileName, string allowedExtensions)
    {
        if (string.IsNullOrWhiteSpace(fileName) || string.IsNullOrWhiteSpace(allowedExtensions))
           { return false;}

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        var allowed = allowedExtensions.ToLowerInvariant().Split(',');
        return allowed.Contains(extension);
    }

    /// <summary>
    /// Generates a unique file name to prevent conflicts
    /// </summary>
    public static string GenerateUniqueFileName(string originalFileName)
    {
        var extension = Path.GetExtension(originalFileName);
        var nameWithoutExtension = Path.GetFileNameWithoutExtension(originalFileName);
        var timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");
        var guid = Guid.NewGuid().ToString("N")[..8];

        return $"{nameWithoutExtension}_{timestamp}_{guid}{extension}";
    }

    /// <summary>
    /// Sanitizes file name by removing invalid characters
    /// </summary>
    public static string SanitizeFileName(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            return "file";
        }

        var invalidChars = Path.GetInvalidFileNameChars();
        var sanitized = string.Join("_", fileName.Split(invalidChars, StringSplitOptions.RemoveEmptyEntries));

        // Ensure the file name is not too long
        if (sanitized.Length > 100)
        {
            var extension = Path.GetExtension(sanitized);
            var nameWithoutExtension = Path.GetFileNameWithoutExtension(sanitized);
            sanitized = nameWithoutExtension[..(100 - extension.Length)] + extension;
        }

        return sanitized;
    }

    /// <summary>
    /// Gets MIME type based on file extension
    /// </summary>
    public static string GetMimeType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();

        return extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".bmp" => "image/bmp",
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls" => "application/vnd.ms-excel",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".txt" => "text/plain",
            ".csv" => "text/csv",
            ".json" => "application/json",
            ".xml" => "application/xml",
            ".zip" => "application/zip",
            _ => "application/octet-stream"
        };
    }

    /// <summary>
    /// Checks if file exists and is accessible
    /// </summary>
    public static bool IsFileAccessible(string filePath)
    {
        try
        {
            if (!File.Exists(filePath))
            {
                return false;
            }

            using var stream = File.OpenRead(filePath);
            return true;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Creates directory if it doesn't exist
    /// </summary>
    public static void EnsureDirectoryExists(string directoryPath)
    {
        if (!Directory.Exists(directoryPath))
        {
            Directory.CreateDirectory(directoryPath);
        }
    }

    /// <summary>
    /// Safely deletes a file
    /// </summary>
    public static bool TryDeleteFile(string filePath)
    {
        try
        {
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                return true;
            }
            return false;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Gets file info as a formatted string
    /// </summary>
    public static string GetFileInfo(string filePath)
    {
        try
        {
            var fileInfo = new FileInfo(filePath);
            return $"Name: {fileInfo.Name}, Size: {GetFileSizeString(fileInfo.Length)}, " +
                   $"Created: {fileInfo.CreationTime:yyyy-MM-dd HH:mm}, " +
                   $"Modified: {fileInfo.LastWriteTime:yyyy-MM-dd HH:mm}";
        }
        catch
        {
            return "File information unavailable";
        }
    }
}