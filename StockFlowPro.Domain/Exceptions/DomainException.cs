namespace StockFlowPro.Domain.Exceptions;

public class DomainException : Exception
{
    public DomainException(string message) : base(message)
    {
        //TODO: Add log here
    }

    public DomainException(string message, Exception innerException) : base(message, innerException)
    {
        //TODO: Add log here
    }
}