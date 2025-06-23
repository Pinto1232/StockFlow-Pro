using System;
using System.Security.Cryptography;
using System.Text;

namespace HashGenerator
{
    class Program
    {
        static void Main(string[] args)
        {
            string password = "admin";
            string adminUserId = "1b6f550e-6b8a-47ae-bc0b-52d88e507272"; // Admin user ID from JSON
            
            // Generate hash using the same method as the authentication service
            string hashedPassword = HashPassword(password, adminUserId);
            
            Console.WriteLine($"Password: {password}");
            Console.WriteLine($"Admin User ID: {adminUserId}");
            Console.WriteLine($"Generated Hash: {hashedPassword}");
            Console.WriteLine();
            Console.WriteLine("Copy this hash and update the admin user's passwordHash in mock-users.json");
        }
        
        public static string HashPassword(string password, string salt)
        {
            using var sha256 = SHA256.Create();
            var saltedPassword = password + salt;
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword));
            var hashedPassword = Convert.ToBase64String(hashedBytes);
            return $"{hashedPassword}:{salt}";
        }
    }
}