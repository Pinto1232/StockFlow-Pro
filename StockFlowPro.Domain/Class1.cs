using System.Reflection;

namespace StockFlowPro.Domain;

/// <summary>
/// Assembly marker class for the StockFlowPro Domain layer.
/// This class provides a reference point for assembly scanning and dependency injection registration.
/// </summary>
public static class DomainAssemblyMarker
{
    /// <summary>
    /// Gets the assembly containing the domain entities and value objects.
    /// </summary>
    public static Assembly Assembly => typeof(DomainAssemblyMarker).Assembly;
    
    /// <summary>
    /// Gets the name of the domain assembly.
    /// </summary>
    public static string AssemblyName => Assembly.GetName().Name ?? "StockFlowPro.Domain";
}
