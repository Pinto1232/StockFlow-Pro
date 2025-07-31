# 🎯 **DEMO: Using Your Private NuGet Packages**

## 🚀 **Step-by-Step Demo**

### **Step 1: Build Your First Private Package**

```bash
# Navigate to the shared project
cd StockFlowPro.Shared

# Build the package
dotnet pack --configuration Release

# You should see output like:
# Successfully created package 'C:\...\StockFlowPro.Shared\bin\Release\StockFlowPro.Shared.1.0.0.nupkg'
```

### **Step 2: Publish to GitHub Packages**

```bash
# Publish your package
dotnet nuget push "bin/Release/StockFlowPro.Shared.1.0.0.nupkg" --source "github"

# Expected output:
# Pushing StockFlowPro.Shared.1.0.0.nupkg to 'https://nuget.pkg.github.com/Pinto1232/index.json'...
# Your package was pushed.
```

### **Step 3: Install in Another Project**

```bash
# Go to another project (e.g., Web project)
cd ..\StockFlowPro.Web

# Install your private package
dotnet add package StockFlowPro.Shared

# Restore packages
dotnet restore
```

### **Step 4: Use Your Package**

Add this to any C# file in StockFlowPro.Web:

```csharp
using StockFlowPro.Shared.Constants;
using StockFlowPro.Shared.Extensions;
using StockFlowPro.Shared.Helpers;

// Now you can use your shared code across projects!
```

---

## 🎮 **Try It Now!**

### **Quick Test Commands:**

```bash
# 1. Build the package
cd StockFlowPro.Shared
dotnet pack --configuration Release

# 2. Check if package was created
ls bin/Release/*.nupkg

# 3. Publish to GitHub (optional - you can test locally first)
dotnet nuget push "bin/Release/StockFlowPro.Shared.1.0.0.nupkg" --source "github"

# 4. Install in Web project
cd ..\StockFlowPro.Web
dotnet add package StockFlowPro.Shared --source github

# 5. Verify installation
dotnet list package
```

---

## 🔍 **What You'll See**

### **After Building Package:**
```
Successfully created package 'C:\...\bin\Release\StockFlowPro.Shared.1.0.0.nupkg'.
```

### **After Publishing:**
```
Pushing StockFlowPro.Shared.1.0.0.nupkg to 'https://nuget.pkg.github.com/Pinto1232/index.json'...
Your package was pushed.
```

### **After Installing:**
```
PackageReference for 'StockFlowPro.Shared' version '1.0.0' added to file 'StockFlowPro.Web.csproj'.
```

---

## 🎯 **Real-World Usage Examples**

### **Example 1: Shared Constants**

Create `StockFlowPro.Shared/Constants/AppConstants.cs`:
```csharp
namespace StockFlowPro.Shared.Constants;

public static class AppConstants
{
    public const int DefaultPageSize = 10;
    public const int MaxPageSize = 100;
    public const string DateFormat = "yyyy-MM-dd";
    public const string TimeFormat = "HH:mm:ss";
}
```

Use in any project:
```csharp
using StockFlowPro.Shared.Constants;

var pageSize = AppConstants.DefaultPageSize;
```

### **Example 2: Extension Methods**

Create `StockFlowPro.Shared/Extensions/StringExtensions.cs`:
```csharp
namespace StockFlowPro.Shared.Extensions;

public static class StringExtensions
{
    public static string ToTitleCase(this string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;
            
        return System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(input.ToLower());
    }
    
    public static bool IsValidEmail(this string email)
    {
        return !string.IsNullOrEmpty(email) && email.Contains("@");
    }
}
```

Use in any project:
```csharp
using StockFlowPro.Shared.Extensions;

var title = "hello world".ToTitleCase(); // "Hello World"
var isValid = "user@example.com".IsValidEmail(); // true
```

### **Example 3: Helper Classes**

Create `StockFlowPro.Shared/Helpers/DateHelper.cs`:
```csharp
namespace StockFlowPro.Shared.Helpers;

public static class DateHelper
{
    public static string FormatForDisplay(DateTime date)
    {
        return date.ToString("MMM dd, yyyy");
    }
    
    public static bool IsBusinessDay(DateTime date)
    {
        return date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday;
    }
}
```

Use in any project:
```csharp
using StockFlowPro.Shared.Helpers;

var formatted = DateHelper.FormatForDisplay(DateTime.Now);
var isBusiness = DateHelper.IsBusinessDay(DateTime.Today);
```

---

## 🔄 **Package Update Workflow**

### **When You Make Changes:**

1. **Update version** in `StockFlowPro.Shared.csproj`:
```xml
<PackageVersion>1.0.1</PackageVersion>
```

2. **Build and publish**:
```bash
dotnet pack --configuration Release
dotnet nuget push "bin/Release/StockFlowPro.Shared.1.0.1.nupkg" --source "github"
```

3. **Update in consumer projects**:
```bash
dotnet add package StockFlowPro.Shared --version 1.0.1
```

---

## 🎉 **You're Ready!**

Your Private NuGet setup is fully operational. Start with the commands above and you'll have your first private package published and consumed within minutes!

### **Next Steps:**
1. **Run the demo commands** above
2. **Add real utility code** to your Shared project
3. **Create more packages** from other projects
4. **Set up automated publishing** with GitHub Actions (optional)

Happy packaging! 🚀📦