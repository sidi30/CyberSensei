# =============================================================================
# CyberSensei - Script PowerShell Unifie et Professionnel
# =============================================================================
# Version 2.0 - Standardisee et sans conflits de ports
# Usage: .\cybersensei.ps1 [commande] [options]
# =============================================================================

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "status", "logs", "clean", "help", "")]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [ValidateSet("minimal", "node", "central", "teams", "full", "")]
    [string]$Profile = "",
    
    [switch]$Build,
    [switch]$Force,
    [switch]$Follow
)

$ErrorActionPreference = "Stop"
$PROJECT_ROOT = $PSScriptRoot

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------

$DOCKER_COMPOSE_FILE = "docker-compose.unified.yml"
$ENV_FILE = ".env"

# Ports standardises (plus de conflits)
$PORTS = @{
    "postgres"          = 5432
    "pgadmin"           = 5050
    "node-backend"      = 8080
    "node-dashboard"    = 3005
    "central-backend"   = 3006
    "central-dashboard" = 5173
    "node-ai"           = 8000
    "teams-bot"         = 5175
    "teams-tabs"        = 5176
    "website"           = 3002
    "grafana"           = 3300
    "prometheus"        = 9090
}

$PROFILES = @{
    "minimal" = @{
        "Description" = "Database + Node Dashboard (demo rapide)"
        "Services" = @("postgres", "node-dashboard")
        "URLs" = @{
            "Node Dashboard" = "http://localhost:3005"
            "PostgreSQL" = "localhost:5432"
        }
    }
    "node" = @{
        "Description" = "Node complet (Backend + Dashboard + Database)"
        "Services" = @("postgres", "pgadmin", "node-backend", "node-dashboard")
        "URLs" = @{
            "Node Dashboard" = "http://localhost:3005"
            "Node API" = "http://localhost:8080"
            "Node Swagger" = "http://localhost:8080/swagger-ui.html"
            "PgAdmin" = "http://localhost:5050"
        }
    }
    "central" = @{
        "Description" = "Central SaaS (Backend + Dashboard + Databases)"
        "Services" = @("postgres", "mongo", "pgadmin", "central-backend", "central-dashboard")
        "URLs" = @{
            "Central Dashboard" = "http://localhost:5173"
            "Central API" = "http://localhost:3006"
            "PgAdmin" = "http://localhost:5050"
            "MongoDB" = "localhost:27017"
        }
    }
    "teams" = @{
        "Description" = "Node + Teams (Bot + Tabs pour Microsoft Teams)"
        "Services" = @("postgres", "pgadmin", "node-backend", "node-dashboard", "teams-bot", "teams-tabs")
        "URLs" = @{
            "Node Dashboard" = "http://localhost:3005"
            "Node API" = "http://localhost:8080"
            "Teams Bot" = "http://localhost:5175"
            "Teams Tabs" = "http://localhost:5176"
            "PgAdmin" = "http://localhost:5050"
        }
    }
    "full" = @{
        "Description" = "Stack complet (Node + Central + Teams + AI + Monitoring)"
        "Services" = @("tous les services")
        "URLs" = @{
            "Node Dashboard" = "http://localhost:3005"
            "Node API" = "http://localhost:8080"
            "Central Dashboard" = "http://localhost:5173"
            "Central API" = "http://localhost:3006"
            "Teams Bot" = "http://localhost:5175"
            "Teams Tabs" = "http://localhost:5176"
            "Website" = "http://localhost:3002"
            "Node AI" = "http://localhost:8000"
            "Grafana" = "http://localhost:3300"
            "Prometheus" = "http://localhost:9090"
            "PgAdmin" = "http://localhost:5050"
        }
    }
}

# -----------------------------------------------------------------------------
# Fonctions utilitaires
# -----------------------------------------------------------------------------

function Write-Banner {
    Write-Host ""
    Write-Host "  ____      _               ____                       _ " -ForegroundColor Cyan
    Write-Host " / ___|   _| |__   ___ _ __/ ___|  ___ _ __  ___  ___(_)" -ForegroundColor Cyan
    Write-Host "| |  | | | | '_ \ / _ \ '__\___ \ / _ \ '_ \/ __|/ _ \ |" -ForegroundColor Cyan
    Write-Host "| |__| |_| | |_) |  __/ |   ___) |  __/ | | \__ \  __/ |" -ForegroundColor Cyan
    Write-Host " \____\__, |_.__/ \___|_|  |____/ \___|_| |_|___/\___|_|" -ForegroundColor Cyan
    Write-Host "      |___/                                             " -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Plateforme de Formation en Cybersecurite - v2.0" -ForegroundColor White
    Write-Host ""
}

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "[*] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[+] $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "[i] $Message" -ForegroundColor White
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[!] $Message" -ForegroundColor Yellow
}

function Write-Err {
    param([string]$Message)
    Write-Host "[x] $Message" -ForegroundColor Red
}

# -----------------------------------------------------------------------------
# Verifications
# -----------------------------------------------------------------------------

function Test-Prerequisites {
    Write-Step "Verification des prerequis..."
    
    # Docker
    try {
        $dockerVersion = docker --version 2>$null
        if ($dockerVersion) {
            Write-Success "Docker: $($dockerVersion.Split(' ')[2])"
        } else {
            throw "Docker non trouve"
        }
    } catch {
        Write-Err "Docker n'est pas installe ou demarre !"
        Write-Info "Telechargez Docker Desktop: https://www.docker.com/products/docker-desktop/"
        exit 1
    }
    
    # Docker Compose
    try {
        $composeVersion = docker-compose --version 2>$null
        Write-Success "Docker Compose: OK"
    } catch {
        Write-Err "Docker Compose n'est pas disponible !"
        exit 1
    }
    
    # Fichier de configuration
    if (-not (Test-Path $ENV_FILE)) {
        Write-Warn "Fichier .env manquant, creation depuis le template..."
        if (Test-Path ".env.template") {
            Copy-Item ".env.template" $ENV_FILE
            Write-Success "Fichier .env cree"
        } else {
            Write-Err "Template .env.template introuvable !"
            exit 1
        }
    }
    
    # Fichier Docker Compose
    if (-not (Test-Path $DOCKER_COMPOSE_FILE)) {
        Write-Err "Fichier $DOCKER_COMPOSE_FILE introuvable !"
        exit 1
    }
}

function Test-PortAvailable {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        return -not $connection
    } catch {
        return $true
    }
}

# -----------------------------------------------------------------------------
# Commandes principales
# -----------------------------------------------------------------------------

function Show-Help {
    Write-Banner
    
    Write-Host "UTILISATION :" -ForegroundColor Yellow
    Write-Host "  .\cybersensei.ps1 [commande] [profile] [options]"
    Write-Host ""
    
    Write-Host "COMMANDES PRINCIPALES :" -ForegroundColor Yellow
    Write-Host "  start    Demarre les services"
    Write-Host "  stop     Arrete les services"
    Write-Host "  status   Affiche l'etat des services"
    Write-Host "  logs     Affiche les logs"
    Write-Host "  clean    Nettoie tout (ATTENTION: perte de donnees)"
    Write-Host "  help     Affiche cette aide"
    Write-Host ""
    
    Write-Host "PROFILS DISPONIBLES :" -ForegroundColor Yellow
    foreach ($p in $PROFILES.Keys | Sort-Object) {
        $desc = $PROFILES[$p]["Description"]
        Write-Host "  $($p.PadRight(10)) $desc" -ForegroundColor White
    }
    Write-Host ""
    
    Write-Host "EXEMPLES :" -ForegroundColor Yellow
    Write-Host "  .\cybersensei.ps1 start minimal      # Demo rapide"
    Write-Host "  .\cybersensei.ps1 start node         # Developpement"
    Write-Host "  .\cybersensei.ps1 start full         # Tout le stack"
    Write-Host "  .\cybersensei.ps1 status             # Etat des services"
    Write-Host "  .\cybersensei.ps1 logs -Follow       # Logs en continu"
    Write-Host "  .\cybersensei.ps1 stop               # Arreter tout"
    Write-Host ""
    
    Write-Host "OPTIONS :" -ForegroundColor Yellow
    Write-Host "  -Build     Force la reconstruction des images"
    Write-Host "  -Force     Force l'action sans confirmation"
    Write-Host "  -Follow    Suit les logs en continu"
    Write-Host ""
}

function Start-Services {
    param([string]$ProfileName)
    
    if (-not $ProfileName) {
        Write-Err "Profile requis. Utilisez: minimal, node, central, ou full"
        Write-Info "Exemple: .\cybersensei.ps1 start node"
        exit 1
    }
    
    if (-not $PROFILES.ContainsKey($ProfileName)) {
        Write-Err "Profile '$ProfileName' inconnu. Profiles disponibles: $($PROFILES.Keys -join ', ')"
        exit 1
    }
    
    $p = $PROFILES[$ProfileName]
    
    Write-Step "Demarrage du profile '$ProfileName'"
    Write-Info "Description: $($p['Description'])"
    
    # Verifier les conflits de ports
    Write-Info "Verification des ports..."
    $portsInUse = @()
    foreach ($service in $p["Services"]) {
        if ($PORTS.ContainsKey($service)) {
            $port = $PORTS[$service]
            if (-not (Test-PortAvailable -Port $port)) {
                $portsInUse += "$service ($port)"
            }
        }
    }
    
    if ($portsInUse.Count -gt 0 -and -not $Force) {
        Write-Warn "Ports deja utilises: $($portsInUse -join ', ')"
        $response = Read-Host "Continuer quand meme ? (y/N)"
        if ($response -ne 'y') {
            exit 0
        }
    }
    
    # Construire la commande Docker Compose
    $composeArgs = @("-f", $DOCKER_COMPOSE_FILE)
    
    # Gestion des profils combinés
    switch ($ProfileName) {
        "teams" {
            # Teams nécessite Node + Teams
            $composeArgs += @("--profile", "node", "--profile", "teams")
        }
        "full" {
            # Full inclut tout
            $composeArgs += @("--profile", "full")
        }
        default {
            $composeArgs += @("--profile", $ProfileName)
        }
    }
    
    if ($Build) {
        Write-Info "Reconstruction des images..."
        & docker-compose @composeArgs build
    }
    
    Write-Info "Demarrage des services..."
    & docker-compose @composeArgs up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services demarres avec succes !"
        
        Write-Host ""
        Write-Host "URLs disponibles :" -ForegroundColor Yellow
        foreach ($url in $p["URLs"].GetEnumerator()) {
            Write-Host "  - $($url.Key.PadRight(20)) $($url.Value)" -ForegroundColor White
        }
        
        Write-Host ""
        Write-Host "Identifiants par defaut :" -ForegroundColor Yellow
        Write-Host "  - PostgreSQL:  cybersensei / cybersensei123" -ForegroundColor Gray
        Write-Host "  - PgAdmin:     admin@cybersensei.io / admin123" -ForegroundColor Gray
        Write-Host "  - Grafana:     admin / admin123" -ForegroundColor Gray
        
    } else {
        Write-Err "Erreur lors du demarrage des services"
        exit 1
    }
}

function Stop-Services {
    Write-Step "Arret de tous les services..."
    
    & docker-compose -f $DOCKER_COMPOSE_FILE down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Tous les services ont ete arretes"
    } else {
        Write-Err "Erreur lors de l'arret des services"
        exit 1
    }
}

function Show-Status {
    Write-Step "Etat des services CyberSensei"
    Write-Host ""
    
    & docker-compose -f $DOCKER_COMPOSE_FILE ps
}

function Show-Logs {
    Write-Step "Logs des services"
    
    if ($Follow) {
        Write-Info "Logs en continu (Ctrl+C pour quitter)..."
        & docker-compose -f $DOCKER_COMPOSE_FILE logs -f
    } else {
        & docker-compose -f $DOCKER_COMPOSE_FILE logs
    }
}

function Clean-All {
    if (-not $Force) {
        Write-Warn "ATTENTION : Cette action va supprimer TOUTES les donnees !"
        Write-Warn "   - Tous les containers"
        Write-Warn "   - Tous les volumes (base de donnees incluse)"
        Write-Warn "   - Tous les reseaux"
        Write-Host ""
        $response = Read-Host "Etes-vous sur ? Tapez 'SUPPRIMER' pour confirmer"
        if ($response -ne "SUPPRIMER") {
            Write-Info "Annulation"
            exit 0
        }
    }
    
    Write-Step "Nettoyage complet..."
    
    & docker-compose -f $DOCKER_COMPOSE_FILE down -v --remove-orphans
    & docker system prune -f
    
    Write-Success "Nettoyage termine"
}

# -----------------------------------------------------------------------------
# Point d'entree principal
# -----------------------------------------------------------------------------

# Changer vers le repertoire du script
Set-Location $PROJECT_ROOT

# Verifier les prerequis pour toutes les commandes sauf help
if ($Command -ne "help" -and $Command -ne "") {
    Test-Prerequisites
}

# Router vers la bonne commande
switch ($Command) {
    "start" {
        Start-Services -ProfileName $Profile
    }
    "stop" {
        Stop-Services
    }
    "status" {
        Show-Status
    }
    "logs" {
        Show-Logs
    }
    "clean" {
        Clean-All
    }
    "help" {
        Show-Help
    }
    "" {
        Show-Help
    }
    default {
        Write-Err "Commande inconnue: $Command"
        Show-Help
        exit 1
    }
}
