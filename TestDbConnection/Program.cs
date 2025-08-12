using System;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;

class Program
{
    static async Task Main(string[] args)
    {
        Console.WriteLine("Testing SQL Server Connection...");

        string server = "localhost,1433";
        string database = "master";
        string username = "sa";
    string password = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "StockFlow123!";

        string connectionString = $"Server={server};Database={database};User Id={username};Password={password};TrustServerCertificate=True;Encrypt=True;";

        Console.WriteLine($"Connecting to: Server={server};Database={database};User Id={username};");
        Console.WriteLine("Note: If this hangs, the SQL Server might be running but not accepting connections.");

        int retryCount = 0;
        int maxRetries = 5;
        bool connected = false;

        while (retryCount < maxRetries && !connected)
        {
            try
            {
                using (var connection = new SqlConnection(connectionString))
                {
                    Console.WriteLine($"Attempting to connect (Attempt {retryCount + 1}/{maxRetries})...");
                    await connection.OpenAsync();
                    
                    Console.WriteLine("\nSuccessfully connected to SQL Server!");
                    Console.WriteLine($"Server Version: {connection.ServerVersion}");
                    Console.WriteLine($"Database: {connection.Database}");
                    
                    // List all databases
                    Console.WriteLine("\nListing all databases:");
                    using (var command = new SqlCommand("SELECT name, state_desc FROM sys.databases ORDER BY name", connection))
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        Console.WriteLine("Database Name           | State");
                        Console.WriteLine("-------------------------|------------");
                        while (await reader.ReadAsync())
                        {
                            Console.WriteLine($"{reader["name"],-24}| {reader["state_desc"]}");
                        }
                    }
                    
                    connected = true;
                }
            }
            catch (Exception ex)
            {
                retryCount++;
                Console.WriteLine($"Connection attempt {retryCount} failed: {ex.Message}");
                
                if (retryCount < maxRetries)
                {
                    Console.WriteLine("Retrying in 5 seconds...\n");
                    await Task.Delay(5000);
                }
                else
                {
                    Console.WriteLine("\nFailed to connect after multiple attempts. Please check the following:");
                    Console.WriteLine("1. SQL Server is running and accessible");
                    Console.WriteLine("2. The server name and port are correct");
                    Console.WriteLine("3. SQL Server authentication is enabled");
                    Console.WriteLine("4. The username and password are correct");
                    Console.WriteLine("5. The SQL Server is configured to accept remote connections");
                    Console.WriteLine("6. The SQL Server is configured to use SQL authentication");
                    Console.WriteLine("\nError details:");
                    Console.WriteLine(ex);
                }
            }
        }

        Console.WriteLine("\nPress any key to exit...");
        Console.ReadKey();
    }
}
