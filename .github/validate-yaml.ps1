# PowerShell YAML Validation Script
# This script validates YAML files without requiring external modules

param(
    [string[]]$Files = @(
        ".github\ISSUE_TEMPLATE\config.yml",
        ".github\workflows\project-automation.yml", 
        ".github\workflows\pr-review.yml"
    )
)

Write-Host "Validating YAML files with PowerShell..." -ForegroundColor Cyan
Write-Host ""

$allValid = $true

foreach ($file in $Files) {
    $fullPath = Join-Path $PWD $file
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "FAILED $file : File not found" -ForegroundColor Red
        $allValid = $false
        continue
    }
    
    try {
        # Read file content
        $content = Get-Content $fullPath -Raw -ErrorAction Stop
        
        # Basic YAML validation checks
        $lines = $content -split "`n"
        $errors = @()
        $inScriptBlock = $false
        
        for ($i = 0; $i -lt $lines.Count; $i++) {
            $line = $lines[$i]
            $lineNum = $i + 1
            
            # Skip empty lines and comments
            if ([string]::IsNullOrWhiteSpace($line) -or $line.Trim().StartsWith('#')) {
                continue
            }
            
            # Check for script blocks
            if ($line -match 'script:\s*\|') {
                $inScriptBlock = $true
                continue
            }
            
            # Exit script block on next YAML key
            if ($inScriptBlock -and $line -match '^\s*\w+:' -and -not $line.Contains('  ')) {
                $inScriptBlock = $false
            }
            
            # Skip validation inside script blocks
            if ($inScriptBlock) {
                continue
            }
            
            # Check basic YAML structure
            if ($line.Contains(':')) {
                $parts = $line -split ':', 2
                if ($parts.Count -gt 1) {
                    $afterColon = $parts[1]
                    if ($afterColon -and -not $afterColon.StartsWith(' ') -and $afterColon.Trim() -ne '') {
                        $errors += "Line $lineNum : Missing space after colon"
                    }
                }
            }
            
            # Check for tab characters (YAML doesn't allow tabs)
            if ($line.Contains("`t")) {
                $errors += "Line $lineNum : Contains tab characters (use spaces instead)"
            }
        }
        
        # Check for basic structure
        if (-not ($content -match '^name:\s*\S+' -or $content -match '^blank_issues_enabled:')) {
            $errors += "Missing required 'name' field at root level"
        }
        
        if ($errors.Count -gt 0) {
            Write-Host "FAILED $file :" -ForegroundColor Red
            foreach ($error in $errors) {
                Write-Host "  $error" -ForegroundColor Red
            }
            $allValid = $false
        } else {
            Write-Host "PASSED $file : Valid" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "FAILED $file : $($_.Exception.Message)" -ForegroundColor Red
        $allValid = $false
    }
}

Write-Host ""
if ($allValid) {
    Write-Host "SUCCESS: All YAML files are valid!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "ERROR: Some YAML files have issues." -ForegroundColor Red
    exit 1
}