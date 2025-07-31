using System;

namespace StockFlowPro.Web.Attributes;

/// <summary>
/// Attribute to provide API request/response examples
/// </summary>
[AttributeUsage(AttributeTargets.Method, AllowMultiple = true)]
public class ApiExampleAttribute : Attribute
{
    /// <summary>
    /// Gets or sets the example type (Request, Response, Error)
    /// </summary>
    public ExampleType Type { get; set; }

    /// <summary>
    /// Gets or sets the HTTP status code for response examples
    /// </summary>
    public int StatusCode { get; set; } = 200;

    /// <summary>
    /// Gets or sets the example name/title
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the example description
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the example content (JSON string)
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the content type
    /// </summary>
    public string ContentType { get; set; } = "application/json";

    /// <summary>
    /// Initializes a new instance of the ApiExampleAttribute class
    /// </summary>
    /// <param name="type">The example type</param>
    /// <param name="name">The example name</param>
    /// <param name="content">The example content</param>
    public ApiExampleAttribute(ExampleType type, string name, string content)
    {
        Type = type;
        Name = name;
        Content = content;
    }
}

/// <summary>
/// Enumeration of example types
/// </summary>
public enum ExampleType
{
    /// <summary>
    /// Request example
    /// </summary>
    Request,

    /// <summary>
    /// Success response example
    /// </summary>
    Response,

    /// <summary>
    /// Error response example
    /// </summary>
    Error
}