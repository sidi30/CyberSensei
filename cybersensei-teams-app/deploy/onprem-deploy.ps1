# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CyberSensei Teams - On-Premise Deployment Script
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Ce script déploie CyberSensei Teams sur un serveur On-Premise via Docker :
#   - Bot Teams (port 3978)
#   - Tabs Employee/Manager (port 5175)
#   - Backend Node optionnel (port 8080)
#   - Service IA Mistral optionnel
#
# UTILISATION:
#   .\onprem-deploy.ps1 -BackendUrl "http://localhost:8080"
#   .\onprem-deploy.ps1 -FullStack                          # Avec backend + AI
#   .\onprem-deploy.ps1 -WithNgrok -NgrokToken "xxx"        # Avec tunnel ngrok
#
# PRÉREQUIS:
#   - Docker Desktop installé et en cours d'exécution
#   - (Optionnel) ngrok pour exposer le bot sur Internet
#
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$BackendUrl = "http://localhost:8080",

    [Parameter(Mandatory = $false)]
    [string]$BotId = "",

    [Parameter(Mandatory = $false)]
    [string]$BotPassword = "",

    [Parameter(Mandatory = $false)]
    [string]$MicrosoftAppId = "",

    [Parameter(Mandatory = $false)]
    [string]$MicrosoftAppPassword = "",

    [Parameter(Mandatory = $false)]
    [string]$MicrosoftAppTenantId = "",

    [Parameter(Mandatory = $false)]
    [switch]$FullStack,

    [Parameter(Mandatory = $false)]
    [switch]$WithNgrok,

    [Parameter(Mandatory = $false)]
    [string]$NgrokToken = "",

    [Parameter(Mandatory = $false)]
    [switch]$Build,

    [Parameter(Mandatory = $false)]
    [switch]$Stop,

    [Parameter(Mandatory = $false)]
    [switch]$Logs
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Get-Item "$ScriptDir\..").FullName

# ─────────────────────────────────────────────────────────────────────────────
# Banner
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "       CyberSensei Teams - On-Premise Deployment" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# Pre-flight checks
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "Vérification des prérequis..." -ForegroundColor Yellow

# Check Docker
try {
    docker info | Out-Null
    Write-Host "✓ Docker est en cours d'exécution" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker n'est pas en cours d'exécution. Démarrez Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check docker-compose
try {
    docker compose version | Out-Null
    Write-Host "✓ Docker Compose disponible" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker Compose non trouvé" -ForegroundColor Red
    exit 1
}

# ─────────────────────────────────────────────────────────────────────────────
# Handle Stop command
# ─────────────────────────────────────────────────────────────────────────────

if ($Stop) {
    Write-Host ""
    Write-Host "Arrêt des conteneurs..." -ForegroundColor Yellow
    Push-Location $ProjectRoot
    docker compose down
    Pop-Location
    Write-Host "✓ Conteneurs arrêtés" -ForegroundColor Green
    exit 0
}

# ─────────────────────────────────────────────────────────────────────────────
# Handle Logs command
# ─────────────────────────────────────────────────────────────────────────────

if ($Logs) {
    Push-Location $ProjectRoot
    docker compose logs -f
    Pop-Location
    exit 0
}

# ─────────────────────────────────────────────────────────────────────────────
# Create .env file
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "Configuration de l'environnement..." -ForegroundColor Yellow

$envContent = @"
# CyberSensei Teams - Configuration générée le $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
NODE_ENV=production

# Microsoft Azure AD
MICROSOFT_APP_ID=$MicrosoftAppId
MICROSOFT_APP_PASSWORD=$MicrosoftAppPassword
MICROSOFT_APP_TENANT_ID=$MicrosoftAppTenantId

# Bot Configuration
BOT_ID=$BotId
BOT_PASSWORD=$BotPassword

# Backend
BACKEND_BASE_URL=$BackendUrl

# Ports
BOT_PORT=3978
TABS_PORT=5175
BACKEND_PORT=8080

# Database (pour FullStack)
POSTGRES_DB=cybersensei
POSTGRES_USER=cybersensei
POSTGRES_PASSWORD=cybersensei123

# JWT
JWT_SECRET=$(New-Guid)

# SSO
ENABLE_SSO=true

# ngrok
NGROK_AUTHTOKEN=$NgrokToken
"@

$envPath = "$ProjectRoot\.env"
$envContent | Out-File -FilePath $envPath -Encoding utf8
Write-Host "✓ Fichier .env créé" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────────────────
# Build images if requested
# ─────────────────────────────────────────────────────────────────────────────

if ($Build) {
    Write-Host ""
    Write-Host "Construction des images Docker..." -ForegroundColor Yellow
    
    Push-Location $ProjectRoot
    
    # Build bot
    Write-Host "  Building bot..." -ForegroundColor Gray
    docker build -t cybersensei-teams-bot:local -f bot/Dockerfile bot/
    
    # Build tabs
    Write-Host "  Building tabs..." -ForegroundColor Gray
    docker build -t cybersensei-teams-tabs:local `
        --build-arg VITE_BACKEND_URL=$BackendUrl `
        --build-arg VITE_MICROSOFT_APP_ID=$MicrosoftAppId `
        -f tabs/Dockerfile tabs/
    
    Pop-Location
    Write-Host "✓ Images construites" -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────────────────────
# Start containers
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "Démarrage des conteneurs..." -ForegroundColor Yellow

Push-Location $ProjectRoot

# Determine profile
$profile = ""
if ($FullStack) {
    $profile = "--profile full"
    Write-Host "  Mode: Full Stack (Bot + Tabs + Backend + AI)" -ForegroundColor Cyan
} elseif ($WithNgrok) {
    $profile = "--profile dev"
    Write-Host "  Mode: Development avec ngrok" -ForegroundColor Cyan
} else {
    Write-Host "  Mode: Teams App only (Bot + Tabs)" -ForegroundColor Cyan
}

# Start containers
$cmd = "docker compose $profile up -d"
Invoke-Expression $cmd

Pop-Location

# Wait for containers to be healthy
Write-Host ""
Write-Host "Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# ─────────────────────────────────────────────────────────────────────────────
# Health checks
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "Vérification de l'état des services..." -ForegroundColor Yellow

# Check bot
try {
    $botHealth = Invoke-RestMethod -Uri "http://localhost:3978/health" -TimeoutSec 5
    Write-Host "✓ Bot:  http://localhost:3978 ($($botHealth.status))" -ForegroundColor Green
} catch {
    Write-Host "✗ Bot:  Non accessible sur http://localhost:3978" -ForegroundColor Red
}

# Check tabs
try {
    $tabsHealth = Invoke-RestMethod -Uri "http://localhost:5175/health.json" -TimeoutSec 5
    Write-Host "✓ Tabs: http://localhost:5175 ($($tabsHealth.status))" -ForegroundColor Green
} catch {
    Write-Host "✗ Tabs: Non accessible sur http://localhost:5175" -ForegroundColor Red
}

# Check backend if full stack
if ($FullStack) {
    try {
        $backendHealth = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -TimeoutSec 10
        Write-Host "✓ Backend: http://localhost:8080 (healthy)" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Backend: En cours de démarrage..." -ForegroundColor Yellow
    }
}

# Check ngrok if enabled
if ($WithNgrok -and $NgrokToken) {
    Start-Sleep -Seconds 3
    try {
        $ngrokTunnels = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -TimeoutSec 5
        $publicUrl = $ngrokTunnels.tunnels[0].public_url
        Write-Host "✓ ngrok: $publicUrl" -ForegroundColor Green
        Write-Host ""
        Write-Host "  URL du Bot pour Azure: $publicUrl/api/messages" -ForegroundColor Cyan
    } catch {
        Write-Host "⚠ ngrok: Interface non accessible" -ForegroundColor Yellow
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "       Déploiement On-Premise terminé !" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "Services disponibles:" -ForegroundColor Cyan
Write-Host "  Bot:             http://localhost:3978"
Write-Host "  Bot Endpoint:    http://localhost:3978/api/messages"
Write-Host "  Employee Tab:    http://localhost:5175/tabs/employee/"
Write-Host "  Manager Tab:     http://localhost:5175/tabs/manager/"

if ($FullStack) {
    Write-Host "  Backend API:     http://localhost:8080"
    Write-Host "  Swagger:         http://localhost:8080/swagger-ui.html"
}

Write-Host ""
Write-Host "Commandes utiles:" -ForegroundColor Yellow
Write-Host "  Voir les logs:   .\onprem-deploy.ps1 -Logs"
Write-Host "  Arrêter:         .\onprem-deploy.ps1 -Stop"
Write-Host "  Reconstruire:    .\onprem-deploy.ps1 -Build"
Write-Host ""

if (-not $WithNgrok) {
    Write-Host "⚠ Pour tester avec Teams, vous avez besoin d'un tunnel HTTPS." -ForegroundColor Yellow
    Write-Host "  Utilisez ngrok: .\onprem-deploy.ps1 -WithNgrok -NgrokToken 'votre-token'" -ForegroundColor Yellow
    Write-Host "  Ou Cloudflare Tunnel: cloudflared tunnel --url http://localhost:3978" -ForegroundColor Yellow
}

Write-Host ""
