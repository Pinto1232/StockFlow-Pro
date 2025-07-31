# VS Code Setup and Troubleshooting

This document explains how to properly configure VS Code for the StockFlow Pro project and resolve common validation issues.

## 🚨 Common VS Code Validation Issues

### Issue Template Config Validation Errors

**Problem**: VS Code shows validation errors for `.github/ISSUE_TEMPLATE/config.yml` claiming missing properties like `name`, `description`, and `body`.

**Root Cause**: VS Code's YAML extension is incorrectly trying to validate the file against the GitHub Issue Forms schema instead of the Issue Template Configuration schema.

**Solutions**:

1. **Use the provided workspace file** (Recommended):
   ```bash
   # Open the workspace file instead of the folder
   code StockFlow-Pro.code-workspace
   ```

2. **Disable YAML validation for this specific file**:
   - The file is already configured as `plaintext` in VS Code settings
   - This prevents incorrect schema validation while maintaining functionality

3. **Ignore the validation errors**:
   - The file is correct and will work properly on GitHub
   - VS Code validation errors don't affect GitHub functionality

### Workflow File Validation

**Problem**: VS Code shows errors in GitHub Actions workflow files.

**Solution**: The workflow files are now properly configured and should validate correctly with the GitHub Actions schema.

### OpenAPI Validation

**Problem**: VS Code shows version pattern errors for OpenAPI files.

**Solution**: Updated to OpenAPI 3.1.0 which follows the correct version pattern.

## 🛠️ Recommended VS Code Setup

### 1. Install Required Extensions

```bash
# Install recommended extensions
code --install-extension redhat.vscode-yaml
code --install-extension ms-vscode.vscode-json
code --install-extension github.vscode-github-actions
```

### 2. Use the Workspace File

Always open the project using the workspace file:

```bash
code StockFlow-Pro.code-workspace
```

This ensures all settings are properly applied.

### 3. Verify Settings

Check that these settings are active in VS Code:

- **Files > Associations**: `.github/ISSUE_TEMPLATE/config.yml` should be associated with `plaintext`
- **YAML > Schemas**: GitHub workflow schema should be applied to workflow files
- **YAML > Validation**: Should be enabled for most files except config.yml

## 📁 File-Specific Configurations

### `.github/ISSUE_TEMPLATE/config.yml`
- **Type**: Issue Template Configuration (legacy format)
- **VS Code Treatment**: Plaintext (to avoid incorrect validation)
- **Status**: ✅ Correct and functional on GitHub

### `.github/workflows/project-automation.yml`
- **Type**: GitHub Actions Workflow
- **VS Code Treatment**: YAML with GitHub Actions schema
- **Status**: ✅ Valid workflow syntax

### `docs/openapi.yaml`
- **Type**: OpenAPI 3.1.0 Specification
- **VS Code Treatment**: YAML with OpenAPI schema
- **Status**: ✅ Valid OpenAPI specification

## 🔧 Manual Configuration

If the automatic configuration doesn't work, manually add these settings to your VS Code:

### User Settings (`settings.json`)

```json
{
  "yaml.schemas": {
    "https://json.schemastore.org/github-workflow.json": [
      ".github/workflows/*.yml",
      ".github/workflows/*.yaml"
    ]
  },
  "files.associations": {
    ".github/ISSUE_TEMPLATE/config.yml": "plaintext"
  },
  "yaml.validate": true,
  "yaml.schemaStore.enable": true,
  "redhat.telemetry.enabled": false
}
```

### Workspace Settings

The workspace file (`StockFlow-Pro.code-workspace`) contains project-specific settings that override user settings.

## 🚫 What NOT to Do

### Don't Convert to Issue Forms

The `config.yml` file uses the legacy Issue Template Configuration format, which is still supported and widely used. Don't convert it to the new Issue Forms format unless you want to completely change how issues are created.

### Don't Disable All YAML Validation

YAML validation is useful for most files. Only disable it for specific files that have schema conflicts.

### Don't Ignore All Validation Errors

Most validation errors indicate real problems. Only ignore errors for files you've verified are correct.

## 🔍 Verification Steps

### 1. Check File Associations

1. Open `.github/ISSUE_TEMPLATE/config.yml`
2. Look at the bottom-right corner of VS Code
3. It should show "Plain Text" not "YAML"

### 2. Check Workflow Validation

1. Open `.github/workflows/project-automation.yml`
2. It should show "YAML" in the bottom-right
3. No validation errors should appear

### 3. Check OpenAPI Validation

1. Open `docs/openapi.yaml`
2. It should show "YAML" in the bottom-right
3. No version pattern errors should appear

## 🆘 Still Having Issues?

### Reset VS Code Configuration

1. Close VS Code
2. Delete `.vscode/settings.json` (if you made manual changes)
3. Open the workspace file: `code StockFlow-Pro.code-workspace`
4. Reload the window: `Ctrl+Shift+P` → "Developer: Reload Window"

### Check Extension Conflicts

Some extensions may interfere with YAML validation:
- Disable other YAML extensions temporarily
- Check if any extensions are overriding file associations
- Restart VS Code after making changes

### Alternative: Use Different Editor

If VS Code continues to show false validation errors:
- The files are correct and will work on GitHub
- Consider using a different editor for these specific files
- Or simply ignore the validation errors

## 📚 Additional Resources

- [GitHub Issue Templates Documentation](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [OpenAPI Specification](https://swagger.io/specification/)
- [VS Code YAML Extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)

---

**Remember**: VS Code validation errors don't affect the actual functionality of these files on GitHub. The files are correct and will work as intended.