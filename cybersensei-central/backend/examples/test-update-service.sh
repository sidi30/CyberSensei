#!/bin/bash

# Script de test pour UpdateService
# Teste les 3 endpoints principaux

set -e

BASE_URL="http://localhost:3000"
TENANT_ID="a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"  # Tenant depuis seed data
JWT_TOKEN=""  # À remplir avec un vrai token SUPERADMIN

echo "🧪 Test UpdateService - CyberSensei Central Backend"
echo "=================================================="
echo ""

# Fonction pour afficher les résultats
function print_result() {
  if [ $1 -eq 0 ]; then
    echo "✅ $2"
  else
    echo "❌ $2"
  fi
}

# 1. Test de connexion admin
echo "1️⃣ Test: Connexion Admin"
echo "------------------------"

RESPONSE=$(curl -s -X POST "${BASE_URL}/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cybersensei.com",
    "password": "Admin@123456"
  }')

JWT_TOKEN=$(echo $RESPONSE | jq -r '.access_token')

if [ "$JWT_TOKEN" != "null" ] && [ -n "$JWT_TOKEN" ]; then
  echo "✅ Connexion réussie"
  echo "Token: ${JWT_TOKEN:0:20}..."
else
  echo "❌ Échec de connexion"
  echo "Réponse: $RESPONSE"
  exit 1
fi

echo ""

# 2. Test: Créer un package de test
echo "2️⃣ Test: Création d'un package de test"
echo "--------------------------------------"

# Créer un dossier temporaire
TMP_DIR=$(mktemp -d)
echo "Dossier temporaire: $TMP_DIR"

# Créer version.json
cat > "$TMP_DIR/version.json" <<EOF
{
  "version": "1.0.1",
  "changelog": "## Version 1.0.1\n\n- Test de mise à jour\n- Correctifs mineurs",
  "requiredNodeVersion": "1.0.0",
  "platform": "linux",
  "architecture": "x64",
  "breaking": false,
  "securityUpdate": false
}
EOF

# Créer quelques fichiers de test
echo "#!/bin/bash\necho 'CyberSensei Updated!'" > "$TMP_DIR/start.sh"
echo "# Test file" > "$TMP_DIR/README.md"

# Créer le ZIP
ZIP_FILE="$TMP_DIR/cybersensei-test-1.0.1.zip"
cd "$TMP_DIR"
zip -q "$ZIP_FILE" version.json start.sh README.md
cd - > /dev/null

echo "✅ Package créé: $ZIP_FILE"
echo ""

# 3. Test: Upload du package
echo "3️⃣ Test: Upload du package (SUPERADMIN)"
echo "---------------------------------------"

UPLOAD_RESPONSE=$(curl -s -X POST "${BASE_URL}/admin/update/upload" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "file=@$ZIP_FILE")

echo "Réponse:"
echo "$UPLOAD_RESPONSE" | jq '.'

UPDATE_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.id')

if [ "$UPDATE_ID" != "null" ] && [ -n "$UPDATE_ID" ]; then
  echo "✅ Upload réussi - ID: $UPDATE_ID"
else
  echo "❌ Échec de l'upload"
fi

echo ""

# 4. Test: Lister les mises à jour
echo "4️⃣ Test: Liste des mises à jour"
echo "--------------------------------"

LIST_RESPONSE=$(curl -s -X GET "${BASE_URL}/admin/updates" \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "Nombre de mises à jour:"
echo "$LIST_RESPONSE" | jq 'length'

echo "Dernière mise à jour:"
echo "$LIST_RESPONSE" | jq '.[0] | {version, active, createdAt}'

echo ""

# 5. Test: Vérification de mise à jour (Node)
echo "5️⃣ Test: Vérification de mise à jour (Node)"
echo "-------------------------------------------"

CHECK_RESPONSE=$(curl -s -X GET "${BASE_URL}/update/check?tenantId=$TENANT_ID&version=1.0.0")

echo "Réponse:"
echo "$CHECK_RESPONSE" | jq '.'

AVAILABLE=$(echo "$CHECK_RESPONSE" | jq -r '.available')

if [ "$AVAILABLE" == "true" ]; then
  echo "✅ Mise à jour disponible"
  UPDATE_ID_CHECK=$(echo "$CHECK_RESPONSE" | jq -r '.updateId')
  echo "Update ID: $UPDATE_ID_CHECK"
else
  echo "ℹ️ Pas de mise à jour disponible ou node à jour"
fi

echo ""

# 6. Test: Téléchargement de mise à jour
if [ "$AVAILABLE" == "true" ] && [ -n "$UPDATE_ID_CHECK" ]; then
  echo "6️⃣ Test: Téléchargement de mise à jour"
  echo "--------------------------------------"

  DOWNLOAD_FILE="$TMP_DIR/downloaded-update.zip"
  
  curl -s -X GET "${BASE_URL}/update/download/$UPDATE_ID_CHECK" \
    -o "$DOWNLOAD_FILE" \
    -D "$TMP_DIR/headers.txt"

  if [ -f "$DOWNLOAD_FILE" ]; then
    FILE_SIZE=$(wc -c < "$DOWNLOAD_FILE")
    echo "✅ Fichier téléchargé: $DOWNLOAD_FILE"
    echo "Taille: $FILE_SIZE octets"
    
    # Afficher les headers
    echo ""
    echo "Headers reçus:"
    grep -E "X-Update-Version|X-Checksum|Content-Length" "$TMP_DIR/headers.txt"
    
    # Vérifier le contenu
    echo ""
    echo "Contenu du ZIP:"
    unzip -l "$DOWNLOAD_FILE"
  else
    echo "❌ Échec du téléchargement"
  fi

  echo ""
fi

# 7. Test: Statistiques (optionnel)
if [ -n "$UPDATE_ID" ]; then
  echo "7️⃣ Test: Statistiques de mise à jour"
  echo "------------------------------------"

  STATS_RESPONSE=$(curl -s -X GET "${BASE_URL}/admin/update/$UPDATE_ID/stats" \
    -H "Authorization: Bearer $JWT_TOKEN")

  echo "$STATS_RESPONSE" | jq '.'
  
  echo ""
fi

# 8. Nettoyage (optionnel - commenté pour vérification manuelle)
# echo "8️⃣ Nettoyage: Suppression de la mise à jour de test"
# echo "---------------------------------------------------"
#
# if [ -n "$UPDATE_ID" ]; then
#   DELETE_RESPONSE=$(curl -s -X DELETE "${BASE_URL}/admin/update/$UPDATE_ID" \
#     -H "Authorization: Bearer $JWT_TOKEN")
#   
#   echo "$DELETE_RESPONSE" | jq '.'
#   echo "✅ Mise à jour supprimée"
# fi

echo ""
echo "=================================================="
echo "🎉 Tests terminés!"
echo ""
echo "Dossier temporaire: $TMP_DIR"
echo "Pour nettoyer: rm -rf $TMP_DIR"
echo ""
echo "Pour supprimer la mise à jour de test:"
echo "curl -X DELETE \"${BASE_URL}/admin/update/$UPDATE_ID\" \\"
echo "  -H \"Authorization: Bearer $JWT_TOKEN\""

