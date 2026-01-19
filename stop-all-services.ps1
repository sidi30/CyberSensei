# ========================================
# 🛑 CyberSensei - Script d'Arrêt
# ========================================
# Arrête tous les services CyberSensei
# Date: 2026-01-11
# ========================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "🛑 CyberSensei - Arrêt des Services" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# ========================================
# 1. Arrêter les processus Java (Backend)
# ========================================
Write-Host "🔧 Arrêt du Backend Spring Boot..." -ForegroundColor Yellow
$javaProcesses = Get-Process -Name java -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -like "*cybersensei*" -or 
    (Get-NetTCPConnection -OwningProcess $_.Id -ErrorAction SilentlyContinue | Where-Object {$_.LocalPort -eq 10000})
}

if ($javaProcesses) {
    $javaProcesses | ForEach-Object {
        Stop-Process -Id $_.Id -Force
        Write-Host "   ✅ Processus Java arrêté (PID: $($_.Id))" -ForegroundColor Green
    }
} else {
    Write-Host "   ℹ️  Aucun processus Java détecté" -ForegroundColor Gray
}
Write-Host ""

# ========================================
# 2. Arrêter les processus Node (Frontend)
# ========================================
Write-Host "💻 Arrêt des Frontends Node.js..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        Stop-Process -Id $_.Id -Force
        Write-Host "   ✅ Processus Node arrêté (PID: $($_.Id))" -ForegroundColor Green
    }
} else {
    Write-Host "   ℹ️  Aucun processus Node détecté" -ForegroundColor Gray
}
Write-Host ""

# ========================================
# 3. Vérifier les ports
# ========================================
Write-Host "🔍 Vérification des ports..." -ForegroundColor Yellow

$ports = @(10000, 5175, 5176, 3000)
$portsOccupied = @()

foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $portsOccupied += $port
        Write-Host "   ⚠️  Port $port encore occupé" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Port $port libre" -ForegroundColor Green
    }
}
Write-Host ""

# ========================================
# 4. Arrêter Docker (optionnel)
# ========================================
$stopDocker = Read-Host "Voulez-vous arrêter les conteneurs Docker PostgreSQL? (O/N)"
if ($stopDocker -eq "O" -or $stopDocker -eq "o") {
    Write-Host "🐳 Arrêt des conteneurs Docker..." -ForegroundColor Yellow
    $rootPath = $PSScriptRoot
    $dockerPath = Join-Path $rootPath "cybersensei-node\backend\database"
    
    if (Test-Path $dockerPath) {
        Push-Location $dockerPath
        docker-compose -f docker-compose-db.yml down
        Pop-Location
        Write-Host "   ✅ Conteneurs Docker arrêtés" -ForegroundColor Green
    }
}
Write-Host ""

# ========================================
# 5. Récapitulatif
# ========================================
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Arrêt terminé!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

if ($portsOccupied.Count -gt 0) {
    Write-Host "⚠️  Ports encore occupés: $($portsOccupied -join ', ')" -ForegroundColor Yellow
    Write-Host "   Vous devrez peut-être les libérer manuellement." -ForegroundColor Gray
} else {
    Write-Host "✅ Tous les ports sont libres" -ForegroundColor Green
}

Write-Host ""
Write-Host "Pour redémarrer les services: .\start-all-services.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


