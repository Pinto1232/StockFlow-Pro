# StockFlowPro.Shared

Shared utilities, constants, extensions, and helpers for StockFlow Pro applications.

## Features

- **Constants**: Application-wide constants and configuration values
- **Extensions**: Useful extension methods for common types
- **Helpers**: Utility classes and helper methods

## Installation

```bash
dotnet add package StockFlowPro.Shared
```

## Usage

```csharp
using StockFlowPro.Shared.Constants;
using StockFlowPro.Shared.Extensions;
using StockFlowPro.Shared.Helpers;

// Use constants
var defaultTimeout = AppConstants.DefaultTimeout;

// Use extensions
var result = someString.ToTitleCase();

// Use helpers
var formatted = DateHelper.FormatForDisplay(DateTime.Now);
```

## Version History

- **1.0.0**: Initial release with constants, extensions, and helpers