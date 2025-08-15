param(
    [switch]$Apply,
    [switch]$Verbose
)

# Codebase cleanup script
# - Removes common build artifacts, caches, temp files and logs
# - Preserves node_modules folders
# - Supports dry run by default; pass -Apply to actually delete

$ErrorActionPreference = 'Stop'

function Write-Info($msg) {
    if ($Verbose) { Write-Host "[info] $msg" -ForegroundColor Cyan }
}

function Remove-Paths($paths) {
    foreach ($p in $paths) {
        if (-not (Test-Path $p)) { continue }
        if ($Apply) {
            try {
                if (Test-Path $p -PathType Container) {
                    Remove-Item -LiteralPath $p -Recurse -Force -ErrorAction Stop
                    Write-Host "Removed dir: $p" -ForegroundColor Green
                } else {
                    Remove-Item -LiteralPath $p -Force -ErrorAction Stop
                    Write-Host "Removed file: $p" -ForegroundColor Green
                }
            } catch {
                Write-Host "Failed to remove: $p - $_" -ForegroundColor Yellow
            }
        } else {
            Write-Host "[dry-run] Would remove: $p" -ForegroundColor DarkGray
        }
    }
}

# Root is the repo folder (script location's parent)
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptRoot
Set-Location $RepoRoot

Write-Info "Repo root: $RepoRoot"

# Collect removal targets, excluding node_modules
$dirs = @()
$files = @()

# Dotnet build artifacts
$dirs += Get-ChildItem -Path $RepoRoot -Recurse -Directory -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -in @('bin','obj') -and $_.FullName -notmatch "\\node_modules(\\|$)" } |
    Select-Object -ExpandProperty FullName

# JS/TS build artifacts except node_modules
$dirs += Get-ChildItem -Path $RepoRoot -Recurse -Directory -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -in @('dist','.next','.nuxt','out','.turbo','.parcel-cache','.cache','.vite','coverage','.angular','.svelte-kit') -and $_.FullName -notmatch "\\node_modules(\\|$)" } |
    Select-Object -ExpandProperty FullName

# Python caches
$dirs += Get-ChildItem -Path $RepoRoot -Recurse -Directory -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -in @('__pycache__','.pytest_cache','.mypy_cache') -and $_.FullName -notmatch "\\node_modules(\\|$)" } |
    Select-Object -ExpandProperty FullName

# General temp/log folders
$dirs += Get-ChildItem -Path $RepoRoot -Recurse -Directory -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -in @('tmp','temp','.tmp','.gradle','.DS_Store') -and $_.FullName -notmatch "\\node_modules(\\|$)" } |
    Select-Object -ExpandProperty FullName

# Standalone files to clean
$files += Get-ChildItem -Path $RepoRoot -Recurse -File -Force -ErrorAction SilentlyContinue |
    Where-Object {
        $_.Extension -in @('.log','.tmp','.cache') -and $_.FullName -notmatch "\\node_modules(\\|$)"
    } |
    Select-Object -ExpandProperty FullName

# Common lock and build outputs (safe to delete, will be regenerated)
# NOTE: We purposely keep package manager lockfiles (package-lock.json, yarn.lock, pnpm-lock.yaml)
# as they are part of reproducible builds. If you want to remove them, uncomment the block below.
# $files += Get-ChildItem -Path $RepoRoot -Recurse -File -Force -ErrorAction SilentlyContinue |
#     Where-Object { $_.Name -in @('package-lock.json','pnpm-lock.yaml','yarn.lock') -and $_.FullName -notmatch "\\node_modules(\\|$)" } |
#     Select-Object -ExpandProperty FullName

# Docker intermediates (non-essential logs)
$files += Get-ChildItem -Path $RepoRoot -Recurse -File -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match '^docker-.*\.(log|tmp)$' -and $_.FullName -notmatch "\\node_modules(\\|$)" } |
    Select-Object -ExpandProperty FullName

# De-duplicate and sort by path length descending so inner-most are removed first
$dirs = $dirs | Sort-Object -Unique | Sort-Object { $_.Length } -Descending
$files = $files | Sort-Object -Unique

Write-Host "Found $($dirs.Count) directories and $($files.Count) files to clean." -ForegroundColor Cyan
if ($dirs.Count -eq 0 -and $files.Count -eq 0) {
    Write-Host "Nothing to clean. You're all set." -ForegroundColor Green
}

if (-not $Apply) {
    Write-Host "Dry run only. Pass -Apply to actually delete. Use -Verbose for more details." -ForegroundColor Yellow
}

Remove-Paths $files
Remove-Paths $dirs

Write-Host "Cleanup completed." -ForegroundColor Cyan
