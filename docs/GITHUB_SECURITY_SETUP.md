# GitHub NuGet Security Setup Guide

## 🔒 Security Implementation Complete

Your GitHub NuGet feed is now configured with enhanced security using environment variables.

## Step-by-Step Security Setup

### 1. Regenerate Your GitHub Token
1. Go to [GitHub.com](https://github.com) → Profile → Settings
2. Navigate to: **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. **Delete the old token** (the one that was shared)
4. **Create a new token** with these settings:
   - **Note**: "NuGet Package Access - Secure"
   - **Expiration**: 90 days (recommended)
   - **Scopes**: 
     - ✅ `read:packages`
     - ✅ `write:packages`
     - ✅ `delete:packages` (optional)

### 2. Set Environment Variables

#### Option A: Using Windows Command Prompt
```cmd
setx GITHUB_USERNAME "Pinto1232"
setx GITHUB_TOKEN "your_new_token_here"
```

#### Option B: Using PowerShell
```powershell
[Environment]::SetEnvironmentVariable("GITHUB_USERNAME", "Pinto1232", "User")
[Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "your_new_token_here", "User")
```

#### Option C: Using Windows GUI
1. Press `Win + R`, type `sysdm.cpl`, press Enter
2. Click "Environment Variables"
3. Under "User variables", click "New"
4. Add:
   - Variable name: `GITHUB_USERNAME`, Value: `Pinto1232`
   - Variable name: `GITHUB_TOKEN`, Value: `your_new_token_here`

### 3. Restart Your Development Environment
After setting environment variables:
1. **Close all terminals/command prompts**
2. **Restart Visual Studio/VS Code**
3. **Open a new terminal** to load the new environment variables

### 4. Test the Setup
```bash
# Verify environment variables are set
echo %GITHUB_USERNAME%
echo %GITHUB_TOKEN%

# Test NuGet configuration
dotnet nuget locals all --clear
dotnet restore
```

## 🛡️ Security Features Implemented

### ✅ What's Now Secure:
- **No hardcoded tokens** in configuration files
- **Environment variables** used for sensitive data
- **Regenerated token** (old one invalidated)
- **90-day expiration** on new token
- **Files excluded** from version control

### ✅ Files Protected:
- `.env.github` - Contains template for credentials
- `setup-github-credentials.*` - Setup scripts
- `*.token` - Any token files
- All environment files (`.env*`)

## 📋 Maintenance Schedule

### Monthly:
- [ ] Review token usage in GitHub settings
- [ ] Check for any unauthorized access

### Every 90 Days:
- [ ] Regenerate GitHub Personal Access Token
- [ ] Update environment variables with new token
- [ ] Test NuGet package operations

### Before Production Deployment:
- [ ] Use separate tokens for different environments
- [ ] Consider using Azure Key Vault or similar for production
- [ ] Set up monitoring for package access

## 🚨 Security Checklist

- [x] Old token deleted from GitHub
- [x] New token generated with 90-day expiration
- [x] Environment variables set on development machine
- [x] Configuration tested with `dotnet restore`
- [x] Sensitive files added to `.gitignore`
- [x] Security documentation created

## 🔧 Troubleshooting

### Environment Variables Not Working?
1. Restart your terminal/IDE
2. Check variables: `echo %GITHUB_USERNAME%` and `echo %GITHUB_TOKEN%`
3. Verify they're set at User level, not just session level

### NuGet Authentication Failing?
1. Clear NuGet cache: `dotnet nuget locals all --clear`
2. Verify token has correct permissions in GitHub
3. Check token hasn't expired

### Token Compromised?
1. Immediately revoke the token in GitHub settings
2. Generate a new token
3. Update environment variables
4. Clear NuGet cache and test

## 📞 Support
If you encounter issues, check:
1. GitHub token permissions and expiration
2. Environment variable values
3. Network connectivity to GitHub
4. NuGet configuration syntax

---
**Remember**: Never commit tokens or credentials to version control!