# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CyberSensei Local Infrastructure - Remove Hosts Entries
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Run this script as Administrator to remove CyberSensei hosts entries

#Requires -RunAsAdministrator

$hostsFile = "C:\Windows\System32\drivers\etc\hosts"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "    CyberSensei - Remove Hosts Entries" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$currentContent = Get-Content $hostsFile -Raw

if ($currentContent -match "CyberSensei Local Development") {
    Write-Host "Removing CyberSensei entries..." -ForegroundColor Yellow
    
    # Remove CyberSensei block
    $newContent = $currentContent -replace "(?s)\r?\n# ━+\r?\n# CyberSensei Local Development.*?# ━+", ""
    
    # Clean up extra newlines
    $newContent = $newContent -replace "(\r?\n){3,}", "`r`n`r`n"
    
    Set-Content -Path $hostsFile -Value $newContent.Trim()
    
    # Flush DNS
    ipconfig /flushdns | Out-Null
    
    Write-Host ""
    Write-Host "✓ CyberSensei entries removed successfully!" -ForegroundColor Green
} else {
    Write-Host "No CyberSensei entries found in hosts file." -ForegroundColor Yellow
}

