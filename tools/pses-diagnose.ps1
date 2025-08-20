# PowerShell Editor Services Diagnostic Script
# Usage: pwsh -NoProfile -File .\tools\pses-diagnose.ps1
# Collects environment info to troubleshoot Integrated Console crashes.

Write-Host "=== PowerShell Core Version ===" -ForegroundColor Cyan
$PSVersionTable | Format-List

Write-Host "`n=== Bitness ===" -ForegroundColor Cyan
"[IntPtr]::Size = $([IntPtr]::Size) (8 = 64-bit, 4 = 32-bit)" | Write-Host

Write-Host "`n=== Execution Policy ===" -ForegroundColor Cyan
Get-ExecutionPolicy -List | Format-Table

Write-Host "`n=== Profile Files (Existing) ===" -ForegroundColor Cyan
$profileMap = [ordered]@{
  CurrentUserCurrentHost = $PROFILE
  CurrentUserAllHosts    = $PROFILE.CurrentUserAllHosts
  AllUsersCurrentHost    = $PROFILE.AllUsersCurrentHost
  AllUsersAllHosts       = $PROFILE.AllUsersAllHosts
}
$profileMap.GetEnumerator() | ForEach-Object {
  $path = $_.Value
  if (Test-Path $path) {
    $item = Get-Item $path
    [pscustomobject]@{ Profile = $_.Key; Path = $item.FullName; SizeKB = [math]::Round($item.Length/1KB,2); LastWrite = $item.LastWriteTime }
  }
} | Format-Table -AutoSize

Write-Host "`n=== Module Size (Top 12) ===" -ForegroundColor Cyan
Get-Module -ListAvailable |
  Sort-Object { (Get-ChildItem $_.ModuleBase -Recurse -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum } -Descending |
  Select-Object -First 12 Name, Version, ModuleBase |
  Format-Table -AutoSize

Write-Host "`n=== PowerShellEditorServices Module (if present) ===" -ForegroundColor Cyan
Get-Module -ListAvailable PowerShellEditorServices | Select-Object Name, Version, ModuleBase | Format-Table -AutoSize

Write-Host "`n=== Environment Summary ===" -ForegroundColor Cyan
[pscustomobject]@{
  ProcessArchitecture = $env:PROCESSOR_ARCHITECTURE
  OS                  = (Get-CimInstance Win32_OperatingSystem).Caption
  Machine             = $env:COMPUTERNAME
  UserProfile         = $env:USERPROFILE
  PSModulePathEntries = ($env:PSModulePath -split ";").Count
} | Format-List

Write-Host "`nTip: Re-enable profile loading in VS Code settings AFTER stability is confirmed." -ForegroundColor Yellow
