# ========================================
# 🚀 CyberSensei - Script de Démarrage
# ========================================
# Lance tous les services nécessaires pour CyberSensei
# Date: 2026-01-11
# ========================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "🚀 CyberSensei - Démarrage Global" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = $PSScriptRoot

# ========================================
# 1. Vérifier PostgreSQL
# ========================================
Write-Host "📊 Étape 1/4 : Vérification PostgreSQL..." -ForegroundColor Yellow
$pgProcess = Get-Process -Name postgres -ErrorAction SilentlyContinue

if ($pgProcess) {
    Write-Host "✅ PostgreSQL est déjà en cours d'exécution (Port 5432)" -ForegroundColor Green
} else {
    Write-Host "⚠️  PostgreSQL n'est pas détecté. Assurez-vous qu'il tourne." -ForegroundColor Red
    Write-Host "   Options:" -ForegroundColor Gray
    Write-Host "   - PostgreSQL local sur port 5432" -ForegroundColor Gray
    Write-Host "   - Docker: cd cybersensei-node/backend/database && docker-compose -f docker-compose-db.yml up -d" -ForegroundColor Gray
    $continue = Read-Host "Continuer quand même? (O/N)"
    if ($continue -ne "O" -and $continue -ne "o") {
        exit
    }
}
Write-Host ""

# ========================================
# 2. Démarrer le Backend Spring Boot
# ========================================
Write-Host "🔧 Étape 2/4 : Lancement du Backend (Port 10000)..." -ForegroundColor Yellow

# Vérifier si le port 10000 est libre
$port10000 = Get-NetTCPConnection -LocalPort 10000 -ErrorAction SilentlyContinue
if ($port10000) {
    Write-Host "✅ Backend est déjà en cours d'exécution sur le port 10000" -ForegroundColor Green
} else {
    Write-Host "   Démarrage du backend Spring Boot..." -ForegroundColor Gray
    $backendPath = Join-Path $rootPath "cybersensei-node\backend"
    $jarPath = Join-Path $backendPath "target\cybersensei-node-backend-1.0.0.jar"
    
    if (Test-Path $jarPath) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; java -jar target\cybersensei-node-backend-1.0.0.jar --server.port=10000" -WindowStyle Normal
        Write-Host "✅ Backend lancé dans une nouvelle fenêtre" -ForegroundColor Green
        Start-Sleep -Seconds 5
    } else {
        Write-Host "❌ JAR non trouvé. Exécutez d'abord:" -ForegroundColor Red
        Write-Host "   cd cybersensei-node/backend" -ForegroundColor Gray
        Write-Host "   mvn clean install -DskipTests" -ForegroundColor Gray
        exit
    }
}
Write-Host ""

# ========================================
# 3. Démarrer le Frontend Employee Tab
# ========================================
Write-Host "💻 Étape 3/4 : Lancement du Frontend Employee (Port 5175)..." -ForegroundColor Yellow

$port5175 = Get-NetTCPConnection -LocalPort 5175 -ErrorAction SilentlyContinue
if ($port5175) {
    Write-Host "✅ Frontend Employee est déjà en cours d'exécution sur le port 5175" -ForegroundColor Green
} else {
    Write-Host "   Démarrage du frontend React..." -ForegroundColor Gray
    $frontendPath = Join-Path $rootPath "cybersensei-teams-app\tabs\employee"
    
    if (Test-Path $frontendPath) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WindowStyle Normal
        Write-Host "✅ Frontend Employee lancé dans une nouvelle fenêtre" -ForegroundColor Green
        Start-Sleep -Seconds 3
    } else {
        Write-Host "❌ Dossier frontend non trouvé" -ForegroundColor Red
        exit
    }
}
Write-Host ""

# ========================================
# 4. Vérifier que tout fonctionne
# ========================================
Write-Host "🔍 Étape 4/4 : Vérification des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "   Vérification du backend..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:10000/actuator/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend répond correctement (200 OK)" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Backend ne répond pas encore. Attendez quelques secondes..." -ForegroundColor Yellow
}

Write-Host ""

# ========================================
# 5. Récapitulatif
# ========================================
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Tous les services sont lancés!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Services Actifs:" -ForegroundColor White
Write-Host "   🗄️  PostgreSQL      : localhost:5432" -ForegroundColor Gray
Write-Host "   🔧 Backend API      : http://localhost:10000" -ForegroundColor Gray
Write-Host "   💻 Frontend Employee: http://localhost:5175" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 Liens Utiles:" -ForegroundColor White
Write-Host "   📱 Application     : http://localhost:5175" -ForegroundColor Cyan
Write-Host "   🏥 Health Check    : http://localhost:10000/actuator/health" -ForegroundColor Cyan
Write-Host "   📚 API Docs        : http://localhost:10000/swagger-ui.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Pour arrêter les services:" -ForegroundColor White
Write-Host "   Fermez les fenêtres PowerShell ou exécutez: .\stop-all-services.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


