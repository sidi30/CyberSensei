# Script de nettoyage des workflows legacy
# À exécuter après avoir vérifié que les nouveaux workflows fonctionnent

Write-Host "🧹 Nettoyage des workflows GitHub Actions legacy..." -ForegroundColor Cyan

$legacyWorkflows = @(
    ".github/workflows/central-backend.yml",
    ".github/workflows/central-dashboard.yml",
    ".github/workflows/node-backend.yml",
    ".github/workflows/node-dashboard.yml",
    ".github/workflows/node-ai.yml",
    ".github/workflows/teams-app.yml",
    ".github/workflows/docker-build.yml",
    ".github/workflows/ci.yml",
    ".github/workflows/ci-fixed.yml"
)

$removed = 0
$notFound = 0

foreach ($workflow in $legacyWorkflows) {
    if (Test-Path $workflow) {
        Write-Host "  ❌ Suppression: $workflow" -ForegroundColor Yellow
        Remove-Item $workflow -Force
        $removed++
    } else {
        Write-Host "  ⏭️  Déjà supprimé: $workflow" -ForegroundColor Gray
        $notFound++
    }
}

Write-Host ""
Write-Host "✅ Nettoyage terminé!" -ForegroundColor Green
Write-Host "  - $removed fichiers supprimés" -ForegroundColor White
Write-Host "  - $notFound fichiers déjà absents" -ForegroundColor White
Write-Host ""
Write-Host "📌 Workflows actifs:" -ForegroundColor Cyan
Write-Host "  - .github/workflows/build-and-test.yml" -ForegroundColor Green
Write-Host "  - .github/workflows/docker-publish.yml" -ForegroundColor Green
Write-Host ""
Write-Host "💡 N'oublie pas de commit et push ces changements!" -ForegroundColor Yellow

