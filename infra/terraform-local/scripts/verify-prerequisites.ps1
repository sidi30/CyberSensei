# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CyberSensei - Verify Prerequisites
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Run this script to verify all prerequisites are met

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "      CyberSensei - Prerequisites Check" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$AllGood = $true

# ─────────────────────────────────────────────────────────────────────────────
# Check Docker
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "[1/4] Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "  ✓ Docker installed: $dockerVersion" -ForegroundColor Green
    
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Docker daemon is running" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Docker daemon is NOT running" -ForegroundColor Red
        Write-Host "    → Start Docker Desktop" -ForegroundColor Gray
        $AllGood = $false
    }
} catch {
    Write-Host "  ✗ Docker is NOT installed" -ForegroundColor Red
    Write-Host "    → Install Docker Desktop: https://docs.docker.com/desktop/install/windows-install/" -ForegroundColor Gray
    $AllGood = $false
}

# ─────────────────────────────────────────────────────────────────────────────
# Check Terraform
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n[2/4] Checking Terraform..." -ForegroundColor Yellow
try {
    $terraformVersion = terraform --version | Select-Object -First 1
    Write-Host "  ✓ Terraform installed: $terraformVersion" -ForegroundColor Green
    
    # Check version >= 1.5.0
    $versionMatch = $terraformVersion -match "v(\d+)\.(\d+)"
    if ($versionMatch) {
        $major = [int]$Matches[1]
        $minor = [int]$Matches[2]
        if ($major -lt 1 -or ($major -eq 1 -and $minor -lt 5)) {
            Write-Host "  ⚠ Terraform version should be >= 1.5.0" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "  ✗ Terraform is NOT installed" -ForegroundColor Red
    Write-Host "    → Install: https://developer.hashicorp.com/terraform/install" -ForegroundColor Gray
    Write-Host "    → Or use: winget install Hashicorp.Terraform" -ForegroundColor Gray
    $AllGood = $false
}

# ─────────────────────────────────────────────────────────────────────────────
# Check Hosts File
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n[3/4] Checking hosts file..." -ForegroundColor Yellow
$hostsContent = Get-Content "C:\Windows\System32\drivers\etc\hosts" -Raw

$requiredHosts = @(
    "central.local",
    "api.central.local", 
    "node.local",
    "api.node.local",
    "grafana.local"
)

$hostsConfigured = $true
foreach ($host in $requiredHosts) {
    if ($hostsContent -match $host) {
        Write-Host "  ✓ $host configured" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $host NOT configured" -ForegroundColor Red
        $hostsConfigured = $false
    }
}

if (-not $hostsConfigured) {
    Write-Host "  → Run: .\scripts\setup-hosts.ps1 (as Administrator)" -ForegroundColor Gray
    $AllGood = $false
}

# ─────────────────────────────────────────────────────────────────────────────
# Check Docker Images
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n[4/4] Checking Docker images..." -ForegroundColor Yellow

$requiredImages = @(
    "cybersensei-central-backend:local",
    "cybersensei-central-dashboard:local",
    "cybersensei-node-backend:local",
    "cybersensei-node-dashboard:local",
    "cybersensei-node-ai:local"
)

$imagesExist = $true
foreach ($image in $requiredImages) {
    $exists = docker images $image --format "{{.Repository}}:{{.Tag}}" 2>$null
    if ($exists) {
        Write-Host "  ✓ $image exists" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ $image NOT built" -ForegroundColor Yellow
        $imagesExist = $false
    }
}

if (-not $imagesExist) {
    Write-Host "  → Run: .\scripts\bootstrap.ps1" -ForegroundColor Gray
}

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if ($AllGood) {
    Write-Host "  ✓ All prerequisites met! Ready to deploy." -ForegroundColor Green
    Write-Host ""
    Write-Host "  Next steps:" -ForegroundColor Cyan
    Write-Host "    1. terraform init"
    Write-Host "    2. terraform apply"
} else {
    Write-Host "  ⚠ Some prerequisites are missing. Please fix them first." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Quick fix commands:" -ForegroundColor Cyan
    Write-Host "    1. Start Docker Desktop"
    Write-Host "    2. .\scripts\setup-hosts.ps1 (as Admin)"
    Write-Host "    3. .\scripts\bootstrap.ps1"
    Write-Host "    4. terraform init && terraform apply"
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

