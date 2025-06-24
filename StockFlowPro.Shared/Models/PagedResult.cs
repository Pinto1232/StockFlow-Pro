namespace StockFlowPro.Shared.Models;

/// <summary>
/// Represents a paged result set
/// </summary>
/// <typeparam name="T">Type of items in the result</typeparam>
public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
    public int StartIndex => (PageNumber - 1) * PageSize + 1;
    public int EndIndex => Math.Min(StartIndex + PageSize - 1, TotalCount);

    public PagedResult()
    {
    }

    public PagedResult(List<T> items, int totalCount, int pageNumber, int pageSize)
    {
        Items = items;
        TotalCount = totalCount;
        PageNumber = pageNumber;
        PageSize = pageSize;
    }

    /// <summary>
    /// Creates an empty paged result
    /// </summary>
    public static PagedResult<T> Empty(int pageNumber = 1, int pageSize = 10)
    {
        return new PagedResult<T>(new List<T>(), 0, pageNumber, pageSize);
    }

    /// <summary>
    /// Creates a paged result from a full list
    /// </summary>
    public static PagedResult<T> Create(List<T> allItems, int pageNumber, int pageSize)
    {
        var totalCount = allItems.Count;
        var items = allItems
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new PagedResult<T>(items, totalCount, pageNumber, pageSize);
    }
}

/// <summary>
/// Pagination parameters
/// </summary>
public class PaginationParams
{
    private int _pageSize = 10;
    private int _pageNumber = 1;

    public int PageNumber
    {
        get => _pageNumber;
        set => _pageNumber = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value switch
        {
            < 1 => 1,
            > 100 => 100,
            _ => value
        };
    }

    public int Skip => (PageNumber - 1) * PageSize;
    public int Take => PageSize;
}