# ============================================================================
# CyberSensei - Script de Démarrage Windows PowerShell
# ============================================================================

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "   CYBERSENSEI - Démarrage du Projet" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# Fonction pour vérifier Docker
# ============================================================================
function Test-Docker {
    Write-Host ">> Vérification de Docker..." -ForegroundColor Yellow
    
    try {
        $dockerVersion = docker --version 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "✗ Docker n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
            Write-Host "  Veuillez installer Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Red
            return $false
        }
        
        $dockerPs = docker ps 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "✗ Docker Desktop n'est pas démarré" -ForegroundColor Red
            Write-Host "  Veuillez démarrer Docker Desktop et réessayer" -ForegroundColor Red
            return $false
        }
        
        Write-Host "✓ Docker est opérationnel ($dockerVersion)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "✗ Erreur lors de la vérification de Docker: $_" -ForegroundColor Red
        return $false
    }
}

# ============================================================================
# Fonction pour nettoyer les anciens conteneurs
# ============================================================================
function Stop-OldContainers {
    Write-Host ""
    Write-Host ">> Nettoyage des anciens conteneurs..." -ForegroundColor Yellow
    
    $containers = docker ps -a --filter "name=cybersensei" --format "{{.Names}}" 2>&1
    
    if ($containers -and $containers.Count -gt 0) {
        Write-Host "  Arrêt et suppression des conteneurs existants..." -ForegroundColor Gray
        docker stop $containers 2>&1 | Out-Null
        docker rm $containers 2>&1 | Out-Null
        Write-Host "✓ Conteneurs nettoyés" -ForegroundColor Green
    }
    else {
        Write-Host "✓ Aucun conteneur à nettoyer" -ForegroundColor Green
    }
}

# ============================================================================
# Fonction pour créer le fichier .env s'il n'existe pas
# ============================================================================
function Initialize-EnvFile {
    Write-Host ""
    Write-Host ">> Vérification du fichier .env..." -ForegroundColor Yellow
    
    $envFile = "cybersensei-node\compose\.env"
    $envTemplate = "cybersensei-node\compose\ENV_TEMPLATE"
    
    if (-not (Test-Path $envFile)) {
        if (Test-Path $envTemplate) {
            Write-Host "  Création du fichier .env depuis le template..." -ForegroundColor Gray
            Copy-Item $envTemplate $envFile
            Write-Host "✓ Fichier .env créé" -ForegroundColor Green
        }
        else {
            Write-Host "⚠ Template .env introuvable, création d'un fichier minimal" -ForegroundColor Yellow
            
            $minimalEnv = @"
# CyberSensei Configuration

# Database
POSTGRES_DB=cybersensei
POSTGRES_USER=cybersensei
POSTGRES_PASSWORD=cybersensei123

# JWT
JWT_SECRET=YourSuperSecretKeyForJWTTokenGenerationWithAtLeast256BitsLongPlease

# Ports
BACKEND_PORT=8080
DASHBOARD_PORT=3000

# Features
PHISHING_ENABLED=true
SYNC_ENABLED=false
METRICS_ENABLED=true

# Spring Profile
SPRING_PROFILES_ACTIVE=docker
"@
            Set-Content -Path $envFile -Value $minimalEnv
            Write-Host "✓ Fichier .env minimal créé" -ForegroundColor Green
        }
    }
    else {
        Write-Host "✓ Fichier .env existe déjà" -ForegroundColor Green
    }
}

# ============================================================================
# Fonction pour demander si on inclut l'IA
# ============================================================================
function Get-AIChoice {
    Write-Host ""
    Write-Host "===========================================================" -ForegroundColor Cyan
    Write-Host " Configuration de l'IA" -ForegroundColor Cyan
    Write-Host "===========================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "L'IA (Mistral 7B) nécessite :" -ForegroundColor Yellow
    Write-Host "  - 4 GB de téléchargement du modèle" -ForegroundColor Gray
    Write-Host "  - 8 GB de RAM minimum" -ForegroundColor Gray
    Write-Host "  - Premier démarrage : ~30-45 minutes" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Sans IA :" -ForegroundColor Yellow
    Write-Host "  - Démarrage rapide : ~5-10 minutes" -ForegroundColor Gray
    Write-Host "  - Toutes les fonctionnalités sauf chat IA" -ForegroundColor Gray
    Write-Host ""
    
    $response = Read-Host "Voulez-vous démarrer AVEC l'IA ? (o/n)"
    return ($response -eq "o" -or $response -eq "O" -or $response -eq "y" -or $response -eq "Y")
}

# ============================================================================
# Fonction pour démarrer les services
# ============================================================================
function Start-Services {
    param (
        [bool]$includeAI
    )
    
    Write-Host ""
    Write-Host ">> Démarrage des services..." -ForegroundColor Yellow
    Write-Host ""
    
    Push-Location "cybersensei-node\compose"
    
    try {
        if ($includeAI) {
            Write-Host "  Démarrage de TOUS les services (PostgreSQL + Backend + Dashboard + IA)..." -ForegroundColor Gray
            docker-compose up -d
        }
        else {
            Write-Host "  Démarrage des services essentiels (PostgreSQL + Backend + Dashboard)..." -ForegroundColor Gray
            docker-compose up -d postgres backend dashboard
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Services démarrés avec succès" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "✗ Erreur lors du démarrage des services" -ForegroundColor Red
            return $false
        }
    }
    finally {
        Pop-Location
    }
}

# ============================================================================
# Fonction pour attendre que les services soient prêts
# ============================================================================
function Wait-ForServices {
    param (
        [bool]$includeAI
    )
    
    Write-Host ""
    Write-Host ">> Attente du démarrage complet des services..." -ForegroundColor Yellow
    Write-Host "  (Cela peut prendre 2-3 minutes pour le backend)" -ForegroundColor Gray
    Write-Host ""
    
    $maxAttempts = 60
    $attempt = 0
    
    # Attendre PostgreSQL
    Write-Host "  [1/3] PostgreSQL..." -ForegroundColor Cyan
    while ($attempt -lt $maxAttempts) {
        $health = docker inspect --format='{{.State.Health.Status}}' cybersensei-postgres 2>&1
        if ($health -eq "healthy") {
            Write-Host "        ✓ PostgreSQL prêt" -ForegroundColor Green
            break
        }
        Start-Sleep -Seconds 2
        $attempt++
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
    
    # Attendre Backend
    Write-Host ""
    Write-Host "  [2/3] Backend..." -ForegroundColor Cyan
    $attempt = 0
    while ($attempt -lt $maxAttempts) {
        $health = docker inspect --format='{{.State.Health.Status}}' cybersensei-backend 2>&1
        if ($health -eq "healthy") {
            Write-Host "        ✓ Backend prêt" -ForegroundColor Green
            break
        }
        Start-Sleep -Seconds 3
        $attempt++
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
    
    # Attendre Dashboard
    Write-Host ""
    Write-Host "  [3/3] Dashboard..." -ForegroundColor Cyan
    $attempt = 0
    while ($attempt -lt $maxAttempts) {
        $health = docker inspect --format='{{.State.Health.Status}}' cybersensei-dashboard 2>&1
        if ($health -eq "healthy") {
            Write-Host "        ✓ Dashboard prêt" -ForegroundColor Green
            break
        }
        Start-Sleep -Seconds 2
        $attempt++
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
    
    Write-Host ""
}

# ============================================================================
# Fonction pour afficher le statut final
# ============================================================================
function Show-Status {
    Write-Host ""
    Write-Host "===========================================================" -ForegroundColor Cyan
    Write-Host " Statut des Services" -ForegroundColor Cyan
    Write-Host "===========================================================" -ForegroundColor Cyan
    Write-Host ""
    
    Push-Location "cybersensei-node\compose"
    docker-compose ps
    Pop-Location
}

# ============================================================================
# Fonction pour afficher les informations de connexion
# ============================================================================
function Show-ConnectionInfo {
    Write-Host ""
    Write-Host "===========================================================" -ForegroundColor Green
    Write-Host " CYBERSENSEI EST PRÊT !" -ForegroundColor Green
    Write-Host "===========================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Dashboard:  http://localhost:3000" -ForegroundColor Cyan
    Write-Host "  Backend:    http://localhost:8080" -ForegroundColor Cyan
    Write-Host "  API Docs:   http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
    Write-Host "  Health:     http://localhost:8080/actuator/health" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Identifiants de connexion:" -ForegroundColor Yellow
    Write-Host "    Email:    admin@cybersensei.io" -ForegroundColor White
    Write-Host "    Password: Demo123!" -ForegroundColor White
    Write-Host ""
    Write-Host "===========================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Pour arrêter les services:" -ForegroundColor Yellow
    Write-Host "  cd cybersensei-node\compose" -ForegroundColor Gray
    Write-Host "  docker-compose down" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Pour voir les logs:" -ForegroundColor Yellow
    Write-Host "  cd cybersensei-node\compose" -ForegroundColor Gray
    Write-Host "  docker-compose logs -f" -ForegroundColor Gray
    Write-Host ""
}

# ============================================================================
# SCRIPT PRINCIPAL
# ============================================================================

# Vérifier Docker
if (-not (Test-Docker)) {
    Write-Host ""
    Write-Host "Appuyez sur une touche pour quitter..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Nettoyer les anciens conteneurs
Stop-OldContainers

# Initialiser le fichier .env
Initialize-EnvFile

# Demander si on inclut l'IA
$includeAI = Get-AIChoice

# Démarrer les services
if (Start-Services -includeAI $includeAI) {
    # Attendre que les services soient prêts
    Wait-ForServices -includeAI $includeAI
    
    # Afficher le statut
    Show-Status
    
    # Afficher les informations de connexion
    Show-ConnectionInfo
    
    Write-Host "✓ Démarrage terminé avec succès !" -ForegroundColor Green
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "✗ Échec du démarrage" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pour voir les logs d'erreur:" -ForegroundColor Yellow
    Write-Host "  cd cybersensei-node\compose" -ForegroundColor Gray
    Write-Host "  docker-compose logs" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Appuyez sur une touche pour quitter..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "Appuyez sur une touche pour quitter..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

