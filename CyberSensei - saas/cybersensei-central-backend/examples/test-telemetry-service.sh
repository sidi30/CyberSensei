#!/bin/bash

# Script de test pour TelemetryService
# Usage: ./test-telemetry-service.sh

set -e

BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"
TENANT_ID="${TENANT_ID:-550e8400-e29b-41d4-a716-446655440000}"
ADMIN_TOKEN="${ADMIN_TOKEN:-YOUR_JWT_TOKEN}"

echo "=========================================="
echo "🧪 Test TelemetryService"
echo "=========================================="
echo "Backend URL: $BACKEND_URL"
echo "Tenant ID: $TENANT_ID"
echo ""

# Fonction pour afficher les résultats
print_result() {
  if [ $? -eq 0 ]; then
    echo "✅ $1"
  else
    echo "❌ $1"
  fi
}

# ============================================
# TEST 1: Ingestion de télémétrie (PUBLIC)
# ============================================

echo ""
echo "-------------------------------------------"
echo "TEST 1: POST /telemetry (Node client)"
echo "-------------------------------------------"

curl -X POST "$BACKEND_URL/telemetry" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenantId\": \"$TENANT_ID\",
    \"uptime\": 86400,
    \"activeUsers\": 42,
    \"exercisesCompletedToday\": 156,
    \"aiLatency\": 247.5,
    \"version\": \"1.2.0\",
    \"additionalData\": {
      \"cpuUsage\": 45.2,
      \"memoryUsage\": 62.8,
      \"diskUsage\": 38.1
    }
  }" \
  -w "\n\nStatus: %{http_code}\n" \
  -s

print_result "Ingestion de télémétrie"

# Attendre 2 secondes pour permettre l'insertion
sleep 2

# ============================================
# TEST 2: Dernière métrique (ADMIN)
# ============================================

echo ""
echo "-------------------------------------------"
echo "TEST 2: GET /admin/tenant/{id}/metrics/latest"
echo "-------------------------------------------"

if [ "$ADMIN_TOKEN" = "YOUR_JWT_TOKEN" ]; then
  echo "⚠️  Skipped: ADMIN_TOKEN non configuré"
  echo "   Export ADMIN_TOKEN=your_jwt_token pour tester les endpoints admin"
else
  curl -X GET "$BACKEND_URL/admin/tenant/$TENANT_ID/metrics/latest" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -w "\n\nStatus: %{http_code}\n" \
    -s
  
  print_result "Récupération dernière métrique"
fi

# ============================================
# TEST 3: Historique avec pagination (ADMIN)
# ============================================

echo ""
echo "-------------------------------------------"
echo "TEST 3: GET /admin/tenant/{id}/metrics?limit=10"
echo "-------------------------------------------"

if [ "$ADMIN_TOKEN" = "YOUR_JWT_TOKEN" ]; then
  echo "⚠️  Skipped: ADMIN_TOKEN non configuré"
else
  curl -X GET "$BACKEND_URL/admin/tenant/$TENANT_ID/metrics?limit=10&offset=0" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -w "\n\nStatus: %{http_code}\n" \
    -s
  
  print_result "Récupération historique"
fi

# ============================================
# TEST 4: Métriques agrégées 24h (ADMIN)
# ============================================

echo ""
echo "-------------------------------------------"
echo "TEST 4: GET /admin/tenant/{id}/metrics/aggregated?period=24h"
echo "-------------------------------------------"

if [ "$ADMIN_TOKEN" = "YOUR_JWT_TOKEN" ]; then
  echo "⚠️  Skipped: ADMIN_TOKEN non configuré"
else
  curl -X GET "$BACKEND_URL/admin/tenant/$TENANT_ID/metrics/aggregated?period=24h" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -w "\n\nStatus: %{http_code}\n" \
    -s
  
  print_result "Récupération métriques agrégées 24h"
fi

# ============================================
# TEST 5: Résumé global (ADMIN)
# ============================================

echo ""
echo "-------------------------------------------"
echo "TEST 5: GET /admin/global/summary"
echo "-------------------------------------------"

if [ "$ADMIN_TOKEN" = "YOUR_JWT_TOKEN" ]; then
  echo "⚠️  Skipped: ADMIN_TOKEN non configuré"
else
  curl -X GET "$BACKEND_URL/admin/global/summary" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -w "\n\nStatus: %{http_code}\n" \
    -s
  
  print_result "Récupération résumé global"
fi

# ============================================
# TEST 6: Tendances d'utilisation (ADMIN)
# ============================================

echo ""
echo "-------------------------------------------"
echo "TEST 6: GET /admin/global/usage-trends?days=7"
echo "-------------------------------------------"

if [ "$ADMIN_TOKEN" = "YOUR_JWT_TOKEN" ]; then
  echo "⚠️  Skipped: ADMIN_TOKEN non configuré"
else
  curl -X GET "$BACKEND_URL/admin/global/usage-trends?days=7" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -w "\n\nStatus: %{http_code}\n" \
    -s
  
  print_result "Récupération tendances d'utilisation"
fi

# ============================================
# TEST 7: Envoyer plusieurs métriques
# ============================================

echo ""
echo "-------------------------------------------"
echo "TEST 7: Envoi de 5 métriques supplémentaires"
echo "-------------------------------------------"

for i in {1..5}; do
  USERS=$((30 + RANDOM % 30))
  EXERCISES=$((100 + RANDOM % 100))
  LATENCY=$((200 + RANDOM % 100))
  
  curl -X POST "$BACKEND_URL/telemetry" \
    -H "Content-Type: application/json" \
    -d "{
      \"tenantId\": \"$TENANT_ID\",
      \"uptime\": $((86400 + i * 3600)),
      \"activeUsers\": $USERS,
      \"exercisesCompletedToday\": $EXERCISES,
      \"aiLatency\": $LATENCY,
      \"version\": \"1.2.0\"
    }" \
    -s -o /dev/null
  
  echo "  [$i/5] Envoyé: $USERS users, $EXERCISES exercises, ${LATENCY}ms latency"
  sleep 0.5
done

print_result "Envoi de métriques multiples"

# ============================================
# RÉSUMÉ
# ============================================

echo ""
echo "=========================================="
echo "✅ Tests terminés"
echo "=========================================="
echo ""
echo "Pour tester les endpoints admin:"
echo "1. Se connecter: POST $BACKEND_URL/admin/auth/login"
echo "2. Récupérer le token JWT"
echo "3. Export ADMIN_TOKEN=votre_token"
echo "4. Relancer ce script"
echo ""
echo "Documentation: TELEMETRY_SERVICE_GUIDE.md"
echo ""

