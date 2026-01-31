# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CyberSensei Teams - Azure Deployment Script
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Ce script déploie CyberSensei Teams sur Azure :
#   - Azure Bot Service
#   - Azure App Service (Bot)
#   - Azure Static Web Apps (Tabs)
#   - Configuration Azure AD
#
# UTILISATION:
#   .\azure-deploy.ps1 -TenantId "xxx" -SubscriptionId "xxx" -ResourceGroup "cybersensei-rg"
#
# PRÉREQUIS:
#   - Azure CLI installé et connecté (az login)
#   - Droits suffisants sur la souscription
#   - Node.js 18+
#
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$TenantId,

    [Parameter(Mandatory = $false)]
    [string]$SubscriptionId,

    [Parameter(Mandatory = $false)]
    [string]$ResourceGroup = "cybersensei-rg",

    [Parameter(Mandatory = $false)]
    [string]$Location = "westeurope",

    [Parameter(Mandatory = $false)]
    [string]$AppName = "cybersensei",

    [Parameter(Mandatory = $false)]
    [string]$BackendUrl = "",

    [Parameter(Mandatory = $false)]
    [switch]$SkipBuild,

    [Parameter(Mandatory = $false)]
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Get-Item "$ScriptDir\..").FullName

# ─────────────────────────────────────────────────────────────────────────────
# Banner
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "       CyberSensei Teams - Azure Deployment" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# Pre-flight checks
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "Vérification des prérequis..." -ForegroundColor Yellow

# Check Azure CLI
try {
    $azVersion = az version --output json | ConvertFrom-Json
    Write-Host "✓ Azure CLI installé (v$($azVersion.'azure-cli'))" -ForegroundColor Green
} catch {
    Write-Host "✗ Azure CLI non trouvé. Installez-le depuis https://aka.ms/installazurecli" -ForegroundColor Red
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installé ($nodeVersion)" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js non trouvé. Installez-le depuis https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check Azure login
$azAccount = az account show --output json 2>$null | ConvertFrom-Json
if (-not $azAccount) {
    Write-Host "✗ Non connecté à Azure. Exécutez 'az login'" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Connecté à Azure en tant que $($azAccount.user.name)" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────────

if (-not $SubscriptionId) {
    $SubscriptionId = $azAccount.id
}

if (-not $TenantId) {
    $TenantId = $azAccount.tenantId
}

$botName = "$AppName-bot"
$tabsName = "$AppName-tabs"
$appServicePlan = "$AppName-plan"

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Tenant ID:       $TenantId"
Write-Host "  Subscription ID: $SubscriptionId"
Write-Host "  Resource Group:  $ResourceGroup"
Write-Host "  Location:        $Location"
Write-Host "  Bot Name:        $botName"
Write-Host "  Tabs Name:       $tabsName"
Write-Host ""

if ($DryRun) {
    Write-Host "[DRY RUN] Le script s'arrête ici. Utilisez sans -DryRun pour déployer." -ForegroundColor Yellow
    exit 0
}

# ─────────────────────────────────────────────────────────────────────────────
# Set subscription
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "Configuration de la souscription Azure..." -ForegroundColor Yellow
az account set --subscription $SubscriptionId

# ─────────────────────────────────────────────────────────────────────────────
# Create Resource Group
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "[1/7] Création du groupe de ressources..." -ForegroundColor Yellow

$rgExists = az group exists --name $ResourceGroup
if ($rgExists -eq "true") {
    Write-Host "  Le groupe de ressources existe déjà" -ForegroundColor Gray
} else {
    az group create --name $ResourceGroup --location $Location --output none
    Write-Host "  ✓ Groupe de ressources créé" -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────────────────────
# Create App Registration
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "[2/7] Création de l'App Registration Azure AD..." -ForegroundColor Yellow

$appDisplayName = "CyberSensei Teams Bot"
$existingApp = az ad app list --display-name $appDisplayName --output json | ConvertFrom-Json

if ($existingApp.Count -gt 0) {
    $appId = $existingApp[0].appId
    Write-Host "  L'application existe déjà (ID: $appId)" -ForegroundColor Gray
} else {
    $appJson = az ad app create `
        --display-name $appDisplayName `
        --sign-in-audience AzureADMultipleOrgs `
        --output json | ConvertFrom-Json
    $appId = $appJson.appId
    Write-Host "  ✓ Application créée (ID: $appId)" -ForegroundColor Green
}

# Create client secret
Write-Host "  Création du client secret..."
$secretJson = az ad app credential reset `
    --id $appId `
    --years 2 `
    --output json | ConvertFrom-Json
$appPassword = $secretJson.password

Write-Host "  ✓ Client secret généré" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────────────────
# Create App Service Plan
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "[3/7] Création du plan App Service..." -ForegroundColor Yellow

$planExists = az appservice plan show --name $appServicePlan --resource-group $ResourceGroup 2>$null
if ($planExists) {
    Write-Host "  Le plan existe déjà" -ForegroundColor Gray
} else {
    az appservice plan create `
        --name $appServicePlan `
        --resource-group $ResourceGroup `
        --location $Location `
        --sku B1 `
        --is-linux `
        --output none
    Write-Host "  ✓ Plan créé (SKU: B1 Linux)" -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────────────────────
# Create Bot Web App
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "[4/7] Création de l'App Service pour le Bot..." -ForegroundColor Yellow

$webAppExists = az webapp show --name $botName --resource-group $ResourceGroup 2>$null
if ($webAppExists) {
    Write-Host "  L'App Service existe déjà" -ForegroundColor Gray
} else {
    az webapp create `
        --name $botName `
        --resource-group $ResourceGroup `
        --plan $appServicePlan `
        --runtime "NODE:20-lts" `
        --output none
    Write-Host "  ✓ App Service créé" -ForegroundColor Green
}

# Configure app settings
Write-Host "  Configuration des variables d'environnement..."
$botEndpoint = "https://$botName.azurewebsites.net/api/messages"

az webapp config appsettings set `
    --name $botName `
    --resource-group $ResourceGroup `
    --settings `
        MICROSOFT_APP_ID=$appId `
        MICROSOFT_APP_PASSWORD=$appPassword `
        MICROSOFT_APP_TENANT_ID=$TenantId `
        BOT_ID=$appId `
        BOT_PASSWORD=$appPassword `
        BACKEND_BASE_URL=$BackendUrl `
        NODE_ENV=production `
    --output none

Write-Host "  ✓ Variables configurées" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────────────────
# Create Azure Bot Service
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "[5/7] Création du Azure Bot Service..." -ForegroundColor Yellow

$botExists = az bot show --name $botName --resource-group $ResourceGroup 2>$null
if ($botExists) {
    Write-Host "  Le Bot Service existe déjà" -ForegroundColor Gray
} else {
    az bot create `
        --name $botName `
        --resource-group $ResourceGroup `
        --kind registration `
        --appid $appId `
        --endpoint $botEndpoint `
        --output none
    Write-Host "  ✓ Bot Service créé" -ForegroundColor Green
}

# Enable Teams channel
Write-Host "  Activation du canal Teams..."
az bot msteams create --name $botName --resource-group $ResourceGroup --output none 2>$null
Write-Host "  ✓ Canal Teams activé" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────────────────
# Create Static Web App for Tabs
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "[6/7] Création de la Static Web App pour les Tabs..." -ForegroundColor Yellow

$swaExists = az staticwebapp show --name $tabsName --resource-group $ResourceGroup 2>$null
if ($swaExists) {
    Write-Host "  La Static Web App existe déjà" -ForegroundColor Gray
    $swaUrl = (az staticwebapp show --name $tabsName --resource-group $ResourceGroup --output json | ConvertFrom-Json).defaultHostname
} else {
    $swaJson = az staticwebapp create `
        --name $tabsName `
        --resource-group $ResourceGroup `
        --location $Location `
        --sku Free `
        --output json | ConvertFrom-Json
    $swaUrl = $swaJson.defaultHostname
    Write-Host "  ✓ Static Web App créée (URL: https://$swaUrl)" -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────────────────────
# Build and Deploy
# ─────────────────────────────────────────────────────────────────────────────

if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "[7/7] Build et déploiement..." -ForegroundColor Yellow

    # Build Bot
    Write-Host "  Build du Bot..."
    Push-Location "$ProjectRoot\bot"
    npm ci --silent
    npm run build
    Pop-Location
    Write-Host "  ✓ Bot compilé" -ForegroundColor Green

    # Build Tabs
    Write-Host "  Build des Tabs..."
    Push-Location "$ProjectRoot\tabs\employee"
    npm ci --silent
    $env:VITE_BACKEND_URL = $BackendUrl
    $env:VITE_MICROSOFT_APP_ID = $appId
    npm run build
    Pop-Location

    Push-Location "$ProjectRoot\tabs\manager"
    npm ci --silent
    npm run build
    Pop-Location
    Write-Host "  ✓ Tabs compilés" -ForegroundColor Green

    # Deploy Bot
    Write-Host "  Déploiement du Bot..."
    Push-Location "$ProjectRoot\bot"
    Compress-Archive -Path "dist\*", "package.json", "package-lock.json", "node_modules" -DestinationPath "deploy.zip" -Force
    az webapp deployment source config-zip `
        --name $botName `
        --resource-group $ResourceGroup `
        --src "deploy.zip" `
        --output none
    Remove-Item "deploy.zip" -Force
    Pop-Location
    Write-Host "  ✓ Bot déployé" -ForegroundColor Green

    # Deploy Tabs
    Write-Host "  Déploiement des Tabs..."
    $deploymentToken = az staticwebapp secrets list --name $tabsName --resource-group $ResourceGroup --query "properties.apiKey" -o tsv
    
    # Note: Pour une vraie CI/CD, utilisez swa deploy ou GitHub Actions
    Write-Host "  ⚠ Pour déployer les tabs, utilisez: npx @azure/static-web-apps-cli deploy" -ForegroundColor Yellow
}

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "       Déploiement terminé !" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "Ressources créées:" -ForegroundColor Cyan
Write-Host "  Bot App Service:   https://$botName.azurewebsites.net"
Write-Host "  Bot Endpoint:      $botEndpoint"
Write-Host "  Tabs Static App:   https://$swaUrl"
Write-Host ""
Write-Host "Configuration Azure AD:" -ForegroundColor Cyan
Write-Host "  App ID:            $appId"
Write-Host "  Tenant ID:         $TenantId"
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Yellow
Write-Host "  1. Mettez à jour le fichier manifest/manifest.json avec:"
Write-Host "     - MICROSOFT_APP_ID: $appId"
Write-Host "     - BOT_ID: $appId"
Write-Host "     - HOSTNAME: $swaUrl"
Write-Host ""
Write-Host "  2. Créez le package Teams:"
Write-Host "     npm run package"
Write-Host ""
Write-Host "  3. Sideloadez l'app dans Teams"
Write-Host ""

# Save configuration to file
$configPath = "$ProjectRoot\.azure-deployment.json"
@{
    tenantId = $TenantId
    subscriptionId = $SubscriptionId
    resourceGroup = $ResourceGroup
    appId = $appId
    botName = $botName
    botEndpoint = $botEndpoint
    tabsUrl = "https://$swaUrl"
    deployedAt = (Get-Date).ToString("o")
} | ConvertTo-Json | Out-File $configPath

Write-Host "Configuration sauvegardée dans: $configPath" -ForegroundColor Gray
