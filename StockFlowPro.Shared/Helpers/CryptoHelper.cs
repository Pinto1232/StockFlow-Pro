using System.Security.Cryptography;
using System.Text;

namespace StockFlowPro.Shared.Helpers;

/// <summary>
/// Helper class for cryptographic operations
/// </summary>
public static class CryptoHelper
{
    /// <summary>
    /// Generates a random salt for password hashing
    /// </summary>
    public static string GenerateSalt(int length = 32)
    {
        using var rng = RandomNumberGenerator.Create();
        var saltBytes = new byte[length];
        rng.GetBytes(saltBytes);
        return Convert.ToBase64String(saltBytes);
    }

    /// <summary>
    /// Hashes a password with salt using PBKDF2
    /// </summary>
    public static string HashPassword(string password, string salt, int iterations = 10000)
    {
        using var pbkdf2 = new Rfc2898DeriveBytes(password, Encoding.UTF8.GetBytes(salt), iterations, HashAlgorithmName.SHA256);
        var hash = pbkdf2.GetBytes(32);
        return Convert.ToBase64String(hash);
    }

    /// <summary>
    /// Verifies a password against its hash
    /// </summary>
    public static bool VerifyPassword(string password, string salt, string hash, int iterations = 10000)
    {
        var computedHash = HashPassword(password, salt, iterations);
        return computedHash == hash;
    }

    /// <summary>
    /// Generates a secure random string
    /// </summary>
    public static string GenerateRandomString(int length = 16, bool includeSpecialChars = false)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const string specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
        
        var characterSet = includeSpecialChars ? chars + specialChars : chars;
        
        using var rng = RandomNumberGenerator.Create();
        var result = new StringBuilder(length);
        var buffer = new byte[4];

        for (int i = 0; i < length; i++)
        {
            rng.GetBytes(buffer);
            var randomIndex = BitConverter.ToUInt32(buffer, 0) % characterSet.Length;
            result.Append(characterSet[(int)randomIndex]);
        }

        return result.ToString();
    }

    /// <summary>
    /// Generates a cryptographically secure GUID
    /// </summary>
    public static string GenerateSecureGuid()
    {
        using var rng = RandomNumberGenerator.Create();
        var bytes = new byte[16];
        rng.GetBytes(bytes);
        return new Guid(bytes).ToString();
    }

    /// <summary>
    /// Creates an MD5 hash of a string (for non-security purposes like ETags)
    /// </summary>
    public static string CreateMD5Hash(string input)
    {
        using var md5 = MD5.Create();
        var inputBytes = Encoding.UTF8.GetBytes(input);
        var hashBytes = md5.ComputeHash(inputBytes);
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }

    /// <summary>
    /// Creates a SHA256 hash of a string
    /// </summary>
    public static string CreateSHA256Hash(string input)
    {
        using var sha256 = SHA256.Create();
        var inputBytes = Encoding.UTF8.GetBytes(input);
        var hashBytes = sha256.ComputeHash(inputBytes);
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }

    /// <summary>
    /// Generates a time-based one-time password (TOTP) token
    /// </summary>
    public static string GenerateTimeBasedToken(int length = 6)
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds() / 30; // 30-second window
        using var rng = RandomNumberGenerator.Create();
        var buffer = new byte[4];
        rng.GetBytes(buffer);
        
        var code = (BitConverter.ToUInt32(buffer, 0) + timestamp) % (int)Math.Pow(10, length);
        return code.ToString().PadLeft(length, '0');
    }

    /// <summary>
    /// Encrypts a string using AES encryption
    /// </summary>
    public static string EncryptString(string plainText, string key)
    {
        using var aes = Aes.Create();
        aes.Key = SHA256.HashData(Encoding.UTF8.GetBytes(key))[..32];
        aes.GenerateIV();

        using var encryptor = aes.CreateEncryptor();
        using var msEncrypt = new MemoryStream();
        using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
        using (var swEncrypt = new StreamWriter(csEncrypt))
        {
            swEncrypt.Write(plainText);
        }

        var iv = aes.IV;
        var encrypted = msEncrypt.ToArray();
        var result = new byte[iv.Length + encrypted.Length];
        Buffer.BlockCopy(iv, 0, result, 0, iv.Length);
        Buffer.BlockCopy(encrypted, 0, result, iv.Length, encrypted.Length);

        return Convert.ToBase64String(result);
    }

    /// <summary>
    /// Decrypts a string using AES encryption
    /// </summary>
    public static string DecryptString(string cipherText, string key)
    {
        var fullCipher = Convert.FromBase64String(cipherText);
        var iv = new byte[16];
        var cipher = new byte[fullCipher.Length - 16];

        Buffer.BlockCopy(fullCipher, 0, iv, 0, iv.Length);
        Buffer.BlockCopy(fullCipher, iv.Length, cipher, 0, cipher.Length);

        using var aes = Aes.Create();
        aes.Key = SHA256.HashData(Encoding.UTF8.GetBytes(key))[..32];
        aes.IV = iv;

        using var decryptor = aes.CreateDecryptor();
        using var msDecrypt = new MemoryStream(cipher);
        using var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read);
        using var srDecrypt = new StreamReader(csDecrypt);

        return srDecrypt.ReadToEnd();
    }
}