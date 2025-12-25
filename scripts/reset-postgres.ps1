Write-Host "=== RESET COMPLET POSTGRESQL ===" -ForegroundColor Red

Set-Location "C:\Users\ramzi\Desktop\devs\CyberSensei\cybersensei-node\compose"

Write-Host ""
Write-Host "1. Arret de tous les conteneurs..." -ForegroundColor Yellow
docker-compose down

Write-Host ""
Write-Host "2. Suppression FORCEE du volume PostgreSQL..." -ForegroundColor Yellow
docker volume rm compose_postgres-data -f

Write-Host ""
Write-Host "3. Verification - le volume ne doit PAS apparaitre:" -ForegroundColor Yellow
docker volume ls

Write-Host ""
Write-Host "4. Nettoyage des conteneurs orphelins..." -ForegroundColor Yellow
docker system prune -f

Write-Host ""
Write-Host "5. Redemarrage COMPLET..." -ForegroundColor Green
docker-compose up -d postgres

Write-Host ""
Write-Host "Attente 15 secondes pour init PostgreSQL..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "6. Verification du mot de passe PostgreSQL..." -ForegroundColor Yellow
$env:PGPASSWORD = "changeme_secure_password_here"
docker-compose exec -T postgres psql -U cybersensei -d cybersensei -c "SELECT 'CONNEXION OK' as status;"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "OK PostgreSQL fonctionne - Demarrage du backend..." -ForegroundColor Green
    docker-compose up -d backend
    
    Write-Host ""
    Write-Host "Attente 30 secondes pour Liquibase..." -ForegroundColor Cyan
    Start-Sleep -Seconds 30
    
    Write-Host ""
    Write-Host "7. Verification backend..." -ForegroundColor Yellow
    docker-compose logs backend --tail 50
    
    Write-Host ""
    Write-Host "8. Test endpoint health..." -ForegroundColor Yellow
    curl http://localhost:8080/api/health
    
    Write-Host ""
    Write-Host ""
    Write-Host "=== RESET TERMINE ===" -ForegroundColor Green
    Write-Host "Si le backend demarre sans erreur, lancez:" -ForegroundColor White
    Write-Host "docker-compose up -d" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "ERREUR - PostgreSQL refuse toujours la connexion" -ForegroundColor Red
    Write-Host "Verifiez le fichier .env" -ForegroundColor Yellow
}
