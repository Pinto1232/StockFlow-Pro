# 🚀 Private NuGet Packages - Usage Guide

## 📋 **Overview**
Your Private NuGet packages setup is fully configured and ready for use. This guide shows you how to create, publish, and consume private packages.

## 🎯 **What You Can Do Now**

### 1. **Create Private Packages** from your existing projects
### 2. **Publish Packages** to GitHub Packages
### 3. **Install Private Packages** in other projects
### 4. **Manage Package Versions** and updates

---

## 📦 **1. Creating Your First Private Package**

### Example: Create a Package from StockFlowPro.Shared

Let's create a shared utilities package that other projects can use:

```bash
# Navigate to your shared project (or create one)
cd StockFlowPro.Shared

# Add package metadata to the .csproj file
# (See the example below)

# Build the package
dotnet pack --configuration Release
```

### Update Project File for Packaging

Add this to your `StockFlowPro.Shared.csproj`:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    
    <!-- Package Information -->
    <PackageId>StockFlowPro.Shared</PackageId>
    <PackageVersion>1.0.0</PackageVersion>
    <Authors>Pinto1232</Authors>
    <Company>StockFlow Pro</Company>
    <Description>Shared utilities and models for StockFlow Pro applications</Description>
    <PackageTags>stockflow;utilities;shared;business</PackageTags>
    <RepositoryUrl>https://github.com/Pinto1232/StockFlow-Pro</RepositoryUrl>
    <PackageLicenseExpression>MIT</PackageLicenseExpression>
    
    <!-- Generate package on build -->
    <GeneratePackageOnBuild>true</GeneratePackageOnBuild>
    <IncludeSymbols>true</IncludeSymbols>
    <SymbolPackageFormat>snupkg</SymbolPackageFormat>
  </PropertyGroup>

  <!-- Your existing dependencies -->
  <ItemGroup>
    <!-- Add your package references here -->
  </ItemGroup>

</Project>
```

---

## 🚀 **2. Publishing to GitHub Packages**

### Publish Your Package

```bash
# Build and pack the project
dotnet pack --configuration Release

# Publish to GitHub Packages
dotnet nuget push "bin/Release/StockFlowPro.Shared.1.0.0.nupkg" \
  --source "github" \
  --api-key $env:GITHUB_TOKEN
```

### Alternative: Publish with Explicit Source

```bash
# Publish with full source URL
dotnet nuget push "bin/Release/StockFlowPro.Shared.1.0.0.nupkg" \
  --source "https://nuget.pkg.github.com/Pinto1232/index.json" \
  --api-key $env:GITHUB_TOKEN
```

### Verify Publication

Check your GitHub repository:
1. Go to `https://github.com/Pinto1232/StockFlow-Pro`
2. Click on "Packages" tab
3. You should see your published package

---

## 📥 **3. Installing Private Packages**

### In Another Project

```bash
# Install your private package
dotnet add package StockFlowPro.Shared

# Or specify version
dotnet add package StockFlowPro.Shared --version 1.0.0

# Or specify source explicitly
dotnet add package StockFlowPro.Shared --source github
```

### In Project File

Add directly to `.csproj`:

```xml
<ItemGroup>
  <PackageReference Include="StockFlowPro.Shared" Version="1.0.0" />
</ItemGroup>
```

Then restore:
```bash
dotnet restore
```

---

## 🔄 **4. Package Management Workflows**

### Update Package Version

1. **Update version in .csproj**:
```xml
<PackageVersion>1.0.1</PackageVersion>
```

2. **Build and publish**:
```bash
dotnet pack --configuration Release
dotnet nuget push "bin/Release/StockFlowPro.Shared.1.0.1.nupkg" --source "github"
```

### Update Package in Consumer Projects

```bash
# Update to latest version
dotnet add package StockFlowPro.Shared

# Update to specific version
dotnet add package StockFlowPro.Shared --version 1.0.1
```

---

## 🛠️ **5. Practical Examples**

### Example 1: Create a Domain Models Package

```bash
# Create new class library for shared models
dotnet new classlib -n StockFlowPro.Models
cd StockFlowPro.Models

# Add to solution
dotnet sln ../StockFlowPro.sln add StockFlowPro.Models.csproj

# Add package metadata and build
dotnet pack --configuration Release

# Publish
dotnet nuget push "bin/Release/StockFlowPro.Models.1.0.0.nupkg" --source "github"
```

### Example 2: Create a Utilities Package

```bash
# Pack existing shared project
cd StockFlowPro.Shared
dotnet pack --configuration Release

# Publish to GitHub
dotnet nuget push "bin/Release/StockFlowPro.Shared.1.0.0.nupkg" --source "github"
```

### Example 3: Use Package in Web Project

```bash
cd StockFlowPro.Web

# Install your private package
dotnet add package StockFlowPro.Shared

# Use in code
```

```csharp
// In your C# files
using StockFlowPro.Shared;
using StockFlowPro.Shared.Models;

// Use your shared utilities
var result = SharedUtility.SomeMethod();
```

---

## 🔍 **6. Troubleshooting & Tips**

### Check Package Sources
```bash
dotnet nuget list source
```

### Clear Cache if Issues
```bash
dotnet nuget locals all --clear
dotnet restore
```

### List Installed Packages
```bash
dotnet list package
```

### Search for Packages
```bash
# Search in all sources
dotnet package search StockFlowPro

# Search in specific source
dotnet package search StockFlowPro --source github
```

---

## 📁 **7. Recommended Package Structure**

### Suggested Packages for Your Solution:

1. **StockFlowPro.Shared** - Common utilities and helpers
2. **StockFlowPro.Models** - Shared data models and DTOs
3. **StockFlowPro.Contracts** - Interfaces and contracts
4. **StockFlowPro.Common** - Cross-cutting concerns

### Package Naming Convention:
- Use your organization prefix: `StockFlowPro.*`
- Be descriptive: `StockFlowPro.Authentication`, `StockFlowPro.Reporting`
- Follow semantic versioning: `1.0.0`, `1.0.1`, `1.1.0`, `2.0.0`

---

## 🚀 **8. Quick Start Commands**

### Create and Publish a Package:
```bash
# 1. Add package metadata to .csproj
# 2. Build package
dotnet pack --configuration Release

# 3. Publish to GitHub
dotnet nuget push "bin/Release/YourPackage.1.0.0.nupkg" --source "github"
```

### Install and Use a Package:
```bash
# 1. Install package
dotnet add package YourPackage

# 2. Restore packages
dotnet restore

# 3. Use in code with appropriate using statements
```

---

## 🎯 **Next Steps**

1. **Choose a project** to convert into your first private package
2. **Add package metadata** to the .csproj file
3. **Build and publish** your first package
4. **Install and test** the package in another project
5. **Set up CI/CD** for automatic package publishing (optional)

Your Private NuGet setup is ready - start creating and sharing packages across your projects! 🚀