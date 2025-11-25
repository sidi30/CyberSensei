#!/bin/bash

# Script de test pour Admin Authentication
# Usage: ./test-auth.sh

set -e

BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"

echo "=========================================="
echo "🔐 Test Admin Authentication"
echo "=========================================="
echo "Backend URL: $BACKEND_URL"
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
# TEST 1: Login Admin
# ============================================

echo ""
echo "-------------------------------------------"
echo "TEST 1: POST /auth/login (Admin)"
echo "-------------------------------------------"

LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cybersensei.com",
    "password": "Admin@123456"
  }' \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n 1)
BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

echo "$BODY" | jq . 2>/dev/null || echo "$BODY"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  TOKEN=$(echo "$BODY" | jq -r .access_token 2>/dev/null)
  echo ""
  echo "✅ Login réussi"
  echo "Token: ${TOKEN:0:50}..."
else
  echo ""
  echo "❌ Login échoué (HTTP $HTTP_CODE)"
  exit 1
fi

sleep 1

# ============================================
# TEST 2: Get Profile (/auth/me)
# ============================================

echo ""
echo "-------------------------------------------"
echo "TEST 2: GET /auth/me"
echo "-------------------------------------------"

ME_RESPONSE=$(curl -s -X GET "$BACKEND_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$ME_RESPONSE" | tail -n 1)
BODY=$(echo "$ME_RESPONSE" | sed '$d')

echo "$BODY" | jq . 2>/dev/null || echo "$BODY"

if [ "$HTTP_CODE" = "200" ]; then
  echo ""
  echo "✅ Profil récupéré"
else
  echo ""
  echo "❌ Échec récupération profil (HTTP $HTTP_CODE)"
fi

sleep 1

# ============================================
# TEST 3: Create Support Admin
# ============================================

echo ""
echo "-------------------------------------------"
echo "TEST 3: POST /auth/register (Create Support)"
echo "-------------------------------------------"

RANDOM_NUM=$RANDOM

REGISTER_RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/register" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Support Agent $RANDOM_NUM\",
    \"email\": \"support$RANDOM_NUM@cybersensei.com\",
    \"password\": \"Support@123456\",
    \"role\": \"SUPPORT\"
  }" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n 1)
BODY=$(echo "$REGISTER_RESPONSE" | sed '$d')

echo "$BODY" | jq . 2>/dev/null || echo "$BODY"

if [ "$HTTP_CODE" = "201" ]; then
  SUPPORT_EMAIL="support$RANDOM_NUM@cybersensei.com"
  echo ""
  echo "✅ Support créé: $SUPPORT_EMAIL"
else
  echo ""
  echo "⚠️  Création support (HTTP $HTTP_CODE) - peut-être existe déjà"
  SUPPORT_EMAIL="support@cybersensei.com"
fi

sleep 1

# ============================================
# TEST 4: List All Admins
# ============================================

echo ""
echo "-------------------------------------------"
echo "TEST 4: GET /auth/admins"
echo "-------------------------------------------"

ADMINS_RESPONSE=$(curl -s -X GET "$BACKEND_URL/auth/admins" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$ADMINS_RESPONSE" | tail -n 1)
BODY=$(echo "$ADMINS_RESPONSE" | sed '$d')

echo "$BODY" | jq . 2>/dev/null || echo "$BODY"

if [ "$HTTP_CODE" = "200" ]; then
  ADMIN_COUNT=$(echo "$BODY" | jq '. | length' 2>/dev/null || echo "N/A")
  echo ""
  echo "✅ Liste récupérée: $ADMIN_COUNT administrateur(s)"
else
  echo ""
  echo "❌ Échec récupération liste (HTTP $HTTP_CODE)"
fi

sleep 1

# ============================================
# TEST 5: Login as Support
# ============================================

echo ""
echo "-------------------------------------------"
echo "TEST 5: POST /auth/login (Support)"
echo "-------------------------------------------"

SUPPORT_LOGIN=$(curl -s -X POST "$BACKEND_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$SUPPORT_EMAIL\",
    \"password\": \"Support@123456\"
  }" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$SUPPORT_LOGIN" | tail -n 1)
BODY=$(echo "$SUPPORT_LOGIN" | sed '$d')

echo "$BODY" | jq . 2>/dev/null || echo "$BODY"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  SUPPORT_TOKEN=$(echo "$BODY" | jq -r .access_token 2>/dev/null)
  echo ""
  echo "✅ Login support réussi"
  echo "Token: ${SUPPORT_TOKEN:0:50}..."
else
  echo ""
  echo "❌ Login support échoué (HTTP $HTTP_CODE)"
  SUPPORT_TOKEN=""
fi

sleep 1

# ============================================
# TEST 6: Support tries to create admin (should fail)
# ============================================

if [ -n "$SUPPORT_TOKEN" ]; then
  echo ""
  echo "-------------------------------------------"
  echo "TEST 6: Support essaie de créer un admin (doit échouer)"
  echo "-------------------------------------------"

  FORBIDDEN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/register" \
    -H "Authorization: Bearer $SUPPORT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Hacker",
      "email": "hacker@test.com",
      "password": "Password123!",
      "role": "SUPERADMIN"
    }' \
    -w "\n%{http_code}")

  HTTP_CODE=$(echo "$FORBIDDEN_RESPONSE" | tail -n 1)
  BODY=$(echo "$FORBIDDEN_RESPONSE" | sed '$d')

  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"

  if [ "$HTTP_CODE" = "403" ]; then
    echo ""
    echo "✅ Accès refusé correctement (HTTP 403)"
  else
    echo ""
    echo "⚠️  Réponse inattendue (HTTP $HTTP_CODE)"
  fi
fi

sleep 1

# ============================================
# TEST 7: Support accesses metrics (should work)
# ============================================

if [ -n "$SUPPORT_TOKEN" ]; then
  echo ""
  echo "-------------------------------------------"
  echo "TEST 7: Support accède au résumé global (doit fonctionner)"
  echo "-------------------------------------------"

  METRICS_RESPONSE=$(curl -s -X GET "$BACKEND_URL/admin/global/summary" \
    -H "Authorization: Bearer $SUPPORT_TOKEN" \
    -w "\n%{http_code}")

  HTTP_CODE=$(echo "$METRICS_RESPONSE" | tail -n 1)
  BODY=$(echo "$METRICS_RESPONSE" | sed '$d')

  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"

  if [ "$HTTP_CODE" = "200" ]; then
    echo ""
    echo "✅ Accès aux métriques réussi"
  else
    echo ""
    echo "⚠️  Échec accès métriques (HTTP $HTTP_CODE)"
  fi
fi

sleep 1

# ============================================
# TEST 8: Invalid token (should fail)
# ============================================

echo ""
echo "-------------------------------------------"
echo "TEST 8: Token invalide (doit échouer)"
echo "-------------------------------------------"

INVALID_RESPONSE=$(curl -s -X GET "$BACKEND_URL/auth/me" \
  -H "Authorization: Bearer invalid_token_123" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$INVALID_RESPONSE" | tail -n 1)
BODY=$(echo "$INVALID_RESPONSE" | sed '$d')

echo "$BODY" | jq . 2>/dev/null || echo "$BODY"

if [ "$HTTP_CODE" = "401" ]; then
  echo ""
  echo "✅ Rejet correct du token invalide (HTTP 401)"
else
  echo ""
  echo "⚠️  Réponse inattendue (HTTP $HTTP_CODE)"
fi

# ============================================
# RÉSUMÉ
# ============================================

echo ""
echo "=========================================="
echo "✅ Tests d'authentification terminés"
echo "=========================================="
echo ""
echo "Tokens générés:"
echo "- Admin Token: ${TOKEN:0:30}..."
echo "- Support Token: ${SUPPORT_TOKEN:0:30}..."
echo ""
echo "Pour utiliser les tokens:"
echo "  export ADMIN_TOKEN=\"$TOKEN\""
echo "  export SUPPORT_TOKEN=\"$SUPPORT_TOKEN\""
echo ""
echo "Documentation: ADMIN_AUTHENTICATION_GUIDE.md"
echo ""

