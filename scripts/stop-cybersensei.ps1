# ============================================================================
# CyberSensei - Script d'Arrêt Windows PowerShell
# ============================================================================

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "   CYBERSENSEI - Arrêt du Projet" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

# Aller dans le dossier compose
Write-Host ">> Arrêt des services..." -ForegroundColor Yellow

Push-Location "cybersensei-node\compose"

try {
    docker-compose down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Tous les services ont été arrêtés" -ForegroundColor Green
        Write-Host ""
        
        # Afficher les conteneurs restants
        Write-Host "Conteneurs Docker actifs:" -ForegroundColor Yellow
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        Write-Host ""
    }
    else {
        Write-Host ""
        Write-Host "✗ Erreur lors de l'arrêt des services" -ForegroundColor Red
        Write-Host ""
    }
}
finally {
    Pop-Location
}

Write-Host "Appuyez sur une touche pour quitter..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

