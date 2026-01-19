# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CyberSensei Local Infrastructure - Windows Hosts Setup
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Run this script as Administrator

#Requires -RunAsAdministrator

$hostsFile = "C:\Windows\System32\drivers\etc\hosts"
$backupFile = "C:\Windows\System32\drivers\etc\hosts.backup"

$entries = @"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CyberSensei Local Development
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
127.0.0.1 central.local
127.0.0.1 api.central.local
127.0.0.1 node.local
127.0.0.1 api.node.local
127.0.0.1 grafana.local
127.0.0.1 prometheus.local
127.0.0.1 alertmanager.local
127.0.0.1 mailhog.local
127.0.0.1 traefik.local
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"@

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "    CyberSensei - Windows Hosts File Setup" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Check if entries already exist
$currentContent = Get-Content $hostsFile -Raw
if ($currentContent -match "CyberSensei Local Development") {
    Write-Host "⚠️  CyberSensei entries already exist in hosts file." -ForegroundColor Yellow
    $response = Read-Host "Do you want to update them? (y/n)"
    if ($response -ne "y") {
        Write-Host "Aborted." -ForegroundColor Red
        exit
    }
    
    # Remove existing entries
    Write-Host "Removing existing entries..." -ForegroundColor Yellow
    $newContent = $currentContent -replace "(?s)# ━+\r?\n# CyberSensei Local Development.*?# ━+\r?\n", ""
    Set-Content -Path $hostsFile -Value $newContent.Trim()
}

# Backup existing hosts file
Write-Host "Creating backup at $backupFile..." -ForegroundColor Gray
Copy-Item -Path $hostsFile -Destination $backupFile -Force

# Add entries
Write-Host "Adding CyberSensei entries..." -ForegroundColor Yellow
Add-Content -Path $hostsFile -Value $entries

# Flush DNS
Write-Host "Flushing DNS cache..." -ForegroundColor Yellow
ipconfig /flushdns | Out-Null

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "    ✓ Hosts file updated successfully!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "You can now access:" -ForegroundColor Cyan
Write-Host "  • http://central.local:8088"
Write-Host "  • http://node.local:8088"
Write-Host "  • http://grafana.local:8088"
Write-Host ""
Write-Host "To remove entries, run:" -ForegroundColor Gray
Write-Host "  .\scripts\cleanup-hosts.ps1" -ForegroundColor Gray

