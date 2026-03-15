# ========================================
# CyberSensei Teams App - Package Script
# ========================================
# Ce script crée un package Teams distribuable
# avec versioning automatique
# ========================================

param(
    [Parameter(Mandatory=$false)]
    [string]$Version,
    
    [Parameter(Mandatory=$false)]
    [string]$AppId,
    
    [Parameter(Mandatory=$false)]
    [string]$BotId,
    
    [Parameter(Mandatory=$false)]
    [string]$Hostname,
    
    [Parameter(Mandatory=$false)]
    [string]$ClientName,
    
    [Parameter(Mandatory=$false)]
    [switch]$AutoIncrement,
    
    [Parameter(Mandatory=$false)]
    [switch]$UseEnv
)

# Couleurs pour l'output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success($message) {
    Write-ColorOutput Green "✅ $message"
}

function Write-Info($message) {
    Write-ColorOutput Cyan "ℹ️  $message"
}

function Write-Warning($message) {
    Write-ColorOutput Yellow "⚠️  $message"
}

function Write-Error($message) {
    Write-ColorOutput Red "❌ $message"
}

# Banner
Write-Host ""
Write-ColorOutput Cyan "================================================"
Write-ColorOutput Cyan "   CyberSensei Teams App - Package Builder     "
Write-ColorOutput Cyan "================================================"
Write-Host ""

# Chemins
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$manifestDir = Join-Path $rootDir "manifest"
$manifestFile = Join-Path $manifestDir "manifest.json"
$versionFile = Join-Path $rootDir "version.json"
$distDir = Join-Path $rootDir "dist"

# Créer le dossier dist s'il n'existe pas
if (-not (Test-Path $distDir)) {
    New-Item -ItemType Directory -Path $distDir | Out-Null
}

# ========================================
# 1. Gestion du versioning
# ========================================

Write-Info "Étape 1/7 : Gestion du versioning"

# Charger ou créer version.json
if (Test-Path $versionFile) {
    $versionData = Get-Content $versionFile | ConvertFrom-Json
    $currentVersion = $versionData.version
    Write-Host "   Version actuelle : $currentVersion"
} else {
    $versionData = @{
        version = "1.0.0"
        builds = @()
    }
    $currentVersion = "1.0.0"
    Write-Warning "Aucun fichier version.json trouvé. Utilisation de 1.0.0"
}

# Déterminer la nouvelle version
if ($Version) {
    $newVersion = $Version
    Write-Host "   Version spécifiée : $newVersion"
} elseif ($AutoIncrement) {
    # Incrémenter automatiquement (patch version)
    $versionParts = $currentVersion -split '\.'
    $versionParts[2] = [int]$versionParts[2] + 1
    $newVersion = $versionParts -join '.'
    Write-Host "   Auto-incrémentation : $newVersion"
} else {
    $newVersion = Read-Host "   Entrez la version (actuelle: $currentVersion)"
    if ([string]::IsNullOrWhiteSpace($newVersion)) {
        $newVersion = $currentVersion
    }
}

Write-Success "Version sélectionnée : $newVersion"

# ========================================
# 2. Récupération des paramètres
# ========================================

Write-Info "Étape 2/7 : Configuration"

if ($UseEnv) {
    Write-Host "   Utilisation des variables d'environnement..."
    
    # Charger depuis .env si disponible
    $envFile = Join-Path $rootDir ".env"
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim()
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
            }
        }
    }
    
    $AppId = [Environment]::GetEnvironmentVariable("MICROSOFT_APP_ID")
    $BotId = [Environment]::GetEnvironmentVariable("BOT_ID")
    $Hostname = [Environment]::GetEnvironmentVariable("HOSTNAME")
    
    if ([string]::IsNullOrWhiteSpace($BotId)) {
        $BotId = $AppId
    }
}

# Demander les paramètres manquants
if ([string]::IsNullOrWhiteSpace($AppId)) {
    $AppId = Read-Host "   Microsoft App ID"
}

if ([string]::IsNullOrWhiteSpace($BotId)) {
    $BotId = Read-Host "   Bot ID (Entrée pour utiliser App ID)"
    if ([string]::IsNullOrWhiteSpace($BotId)) {
        $BotId = $AppId
    }
}

if ([string]::IsNullOrWhiteSpace($Hostname)) {
    $Hostname = Read-Host "   Hostname (ex: cybersensei-tabs.azurewebsites.net)"
}

if ([string]::IsNullOrWhiteSpace($ClientName)) {
    $ClientName = Read-Host "   Nom du client (optionnel, pour nommer le package)"
}

Write-Host ""
Write-Success "Configuration :"
Write-Host "   App ID    : $AppId"
Write-Host "   Bot ID    : $BotId"
Write-Host "   Hostname  : $Hostname"
Write-Host "   Client    : $ClientName"

# ========================================
# 3. Validation des icônes
# ========================================

Write-Info "Étape 3/7 : Validation des icônes"

$colorIcon = Join-Path $manifestDir "color.png"
$outlineIcon = Join-Path $manifestDir "outline.png"

if (-not (Test-Path $colorIcon)) {
    Write-Error "L'icône color.png est manquante dans manifest/"
    Write-Host "   Exécutez : node manifest/generate-icons.js"
    exit 1
}

if (-not (Test-Path $outlineIcon)) {
    Write-Error "L'icône outline.png est manquante dans manifest/"
    Write-Host "   Exécutez : node manifest/generate-icons.js"
    exit 1
}

Write-Success "Icônes validées"

# ========================================
# 4. Traitement du manifest
# ========================================

Write-Info "Étape 4/7 : Génération du manifest"

if (-not (Test-Path $manifestFile)) {
    Write-Error "Le fichier manifest.json est manquant"
    exit 1
}

# Lire le manifest
$manifest = Get-Content $manifestFile -Raw | ConvertFrom-Json

# Remplacer les variables
$manifest.id = $AppId
$manifest.version = $newVersion

# Remplacer dans le JSON sérialisé (pour les nested objects)
$manifestJson = $manifest | ConvertTo-Json -Depth 10

$manifestJson = $manifestJson -replace '\{\{MICROSOFT_APP_ID\}\}', $AppId
$manifestJson = $manifestJson -replace '\{\{BOT_ID\}\}', $BotId
$manifestJson = $manifestJson -replace '\{\{HOSTNAME\}\}', $Hostname

# Reconvertir
$manifest = $manifestJson | ConvertFrom-Json

Write-Success "Manifest généré avec succès"

# ========================================
# 5. Création du package temporaire
# ========================================

Write-Info "Étape 5/7 : Création du package"

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$tempDir = Join-Path $env:TEMP "cybersensei-teams-$timestamp"

# Créer le dossier temporaire
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

try {
    # Copier les icônes
    Copy-Item $colorIcon -Destination (Join-Path $tempDir "color.png")
    Copy-Item $outlineIcon -Destination (Join-Path $tempDir "outline.png")
    
    # Écrire le manifest modifié
    $manifest | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $tempDir "manifest.json") -Encoding UTF8
    
    Write-Success "Fichiers préparés"
    
    # ========================================
    # 6. Création du ZIP
    # ========================================
    
    Write-Info "Étape 6/7 : Compression du package"
    
    $packageName = "cybersensei-teams-app"
    if ($ClientName) {
        $packageName += "-$ClientName"
    }
    $packageName += "-v$newVersion"
    $packageName += ".zip"
    
    $packagePath = Join-Path $distDir $packageName
    
    # Supprimer le package existant si présent
    if (Test-Path $packagePath) {
        Remove-Item $packagePath -Force
    }
    
    # Créer le ZIP
    Compress-Archive -Path "$tempDir\*" -DestinationPath $packagePath -Force
    
    $packageSize = (Get-Item $packagePath).Length / 1KB
    
    Write-Success "Package créé : $packageName"
    Write-Host "   Taille : $([math]::Round($packageSize, 2)) KB"
    
    # ========================================
    # 7. Mise à jour du fichier version.json
    # ========================================
    
    Write-Info "Étape 7/7 : Mise à jour du versioning"
    
    $buildInfo = @{
        version = $newVersion
        timestamp = (Get-Date).ToString("o")
        appId = $AppId
        botId = $BotId
        hostname = $Hostname
        clientName = $ClientName
        packageFile = $packageName
        packageSize = [math]::Round($packageSize, 2)
    }
    
    $versionData.version = $newVersion
    if (-not $versionData.builds) {
        $versionData.builds = @()
    }
    $versionData.builds += $buildInfo
    
    # Garder seulement les 10 derniers builds
    if ($versionData.builds.Count -gt 10) {
        $versionData.builds = $versionData.builds | Select-Object -Last 10
    }
    
    $versionData | ConvertTo-Json -Depth 10 | Set-Content $versionFile -Encoding UTF8
    
    Write-Success "Version.json mis à jour"
    
    # ========================================
    # Résumé
    # ========================================
    
    Write-Host ""
    Write-ColorOutput Green "================================================"
    Write-ColorOutput Green "   ✨ Package créé avec succès !               "
    Write-ColorOutput Green "================================================"
    Write-Host ""
    Write-Host "📦 Package       : $packagePath"
    Write-Host "📊 Version       : $newVersion"
    Write-Host "💾 Taille        : $([math]::Round($packageSize, 2)) KB"
    Write-Host ""
    Write-ColorOutput Cyan "Prochaines étapes :"
    Write-Host "1. Testez le package en le sideloadant dans Teams"
    Write-Host "2. Déployez via Teams Admin Center"
    Write-Host "3. Consultez docs/teams-deployment.md pour les détails"
    Write-Host ""
    
    # Générer le changelog
    $changelogFile = Join-Path $distDir "CHANGELOG-v$newVersion.md"
    @"
# CyberSensei Teams App - Version $newVersion

**Date de build** : $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Informations de déploiement

- **Microsoft App ID** : ``$AppId``
- **Bot ID** : ``$BotId``
- **Hostname** : ``$Hostname``
- **Client** : $ClientName
- **Package** : ``$packageName``

## Installation

1. Téléchargez le package : ``$packageName``
2. Accédez au Teams Admin Center
3. Suivez les instructions dans ``docs/teams-deployment.md``

## Changements

[Ajoutez ici les changements de cette version]

---

**Build ID** : $timestamp
"@ | Set-Content $changelogFile -Encoding UTF8
    
    Write-Success "Changelog généré : CHANGELOG-v$newVersion.md"
    Write-Host ""
    
} finally {
    # Nettoyer le dossier temporaire
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force
    }
}

