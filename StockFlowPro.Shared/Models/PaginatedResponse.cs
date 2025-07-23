namespace StockFlowPro.Shared.Models;

/// <summary>
/// Represents a paginated response that matches frontend expectations
/// </summary>
/// <typeparam name="T">Type of items in the response</typeparam>
public class PaginatedResponse<T>
{
    public List<T> Data { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }

    public PaginatedResponse()
    {
    }

    public PaginatedResponse(List<T> data, int totalCount, int pageNumber, int pageSize)
    {
        Data = data;
        TotalCount = totalCount;
        PageNumber = pageNumber;
        PageSize = pageSize;
        TotalPages = (int)Math.Ceiling((double)totalCount / pageSize);
        HasPreviousPage = pageNumber > 1;
        HasNextPage = pageNumber < TotalPages;
    }

    /// <summary>
    /// Creates a PaginatedResponse from a PagedResult
    /// </summary>
    public static PaginatedResponse<T> FromPagedResult(PagedResult<T> pagedResult)
    {
        return new PaginatedResponse<T>(
            pagedResult.Items,
            pagedResult.TotalCount,
            pagedResult.PageNumber,
            pagedResult.PageSize);
    }

    /// <summary>
    /// Creates an empty paginated response
    /// </summary>
    public static PaginatedResponse<T> Empty(int pageNumber = 1, int pageSize = 10)
    {
        return new PaginatedResponse<T>(new List<T>(), 0, pageNumber, pageSize);
    }
}