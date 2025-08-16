namespace StockFlowPro.Application.Interfaces;

public interface IPasswordService
{
        System.Threading.Tasks.Task<string> HashPasswordAsync(string password);
        System.Threading.Tasks.Task<bool> VerifyPasswordAsync(string password, string hashedPassword);
}