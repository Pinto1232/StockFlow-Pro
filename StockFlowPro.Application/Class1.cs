using System.Reflection;

namespace StockFlowPro.Application;

/// <summary>
/// Assembly marker class for StockFlowPro.Application
/// Used for assembly scanning and dependency injection registration
/// </summary>
public static class ApplicationAssemblyMarker
{
    /// <summary>
    /// Gets the assembly containing the application layer
    /// </summary>
    public static Assembly Assembly => typeof(ApplicationAssemblyMarker).Assembly;
}