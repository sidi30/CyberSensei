#!/bin/bash

# ========================================
# CyberSensei Teams App - Package Script
# ========================================
# Ce script crée un package Teams distribuable
# avec versioning automatique
# ========================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonctions d'affichage
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Banner
echo ""
echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}   CyberSensei Teams App - Package Builder     ${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

# Chemins
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
MANIFEST_DIR="$ROOT_DIR/manifest"
MANIFEST_FILE="$MANIFEST_DIR/manifest.json"
VERSION_FILE="$ROOT_DIR/version.json"
DIST_DIR="$ROOT_DIR/dist"

# Créer le dossier dist
mkdir -p "$DIST_DIR"

# Parse arguments
VERSION=""
APP_ID=""
BOT_ID=""
HOSTNAME=""
CLIENT_NAME=""
AUTO_INCREMENT=false
USE_ENV=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -a|--app-id)
            APP_ID="$2"
            shift 2
            ;;
        -b|--bot-id)
            BOT_ID="$2"
            shift 2
            ;;
        -h|--hostname)
            HOSTNAME="$2"
            shift 2
            ;;
        -c|--client)
            CLIENT_NAME="$2"
            shift 2
            ;;
        --auto-increment)
            AUTO_INCREMENT=true
            shift
            ;;
        --use-env)
            USE_ENV=true
            shift
            ;;
        *)
            echo "Option inconnue: $1"
            exit 1
            ;;
    esac
done

# ========================================
# 1. Gestion du versioning
# ========================================

print_info "Étape 1/7 : Gestion du versioning"

if [ -f "$VERSION_FILE" ]; then
    CURRENT_VERSION=$(jq -r '.version' "$VERSION_FILE")
    echo "   Version actuelle : $CURRENT_VERSION"
else
    CURRENT_VERSION="1.0.0"
    echo '{"version":"1.0.0","builds":[]}' > "$VERSION_FILE"
    print_warning "Aucun fichier version.json trouvé. Utilisation de 1.0.0"
fi

# Déterminer la nouvelle version
if [ -n "$VERSION" ]; then
    NEW_VERSION="$VERSION"
    echo "   Version spécifiée : $NEW_VERSION"
elif [ "$AUTO_INCREMENT" = true ]; then
    IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
    VERSION_PARTS[2]=$((VERSION_PARTS[2] + 1))
    NEW_VERSION="${VERSION_PARTS[0]}.${VERSION_PARTS[1]}.${VERSION_PARTS[2]}"
    echo "   Auto-incrémentation : $NEW_VERSION"
else
    read -p "   Entrez la version (actuelle: $CURRENT_VERSION): " NEW_VERSION
    if [ -z "$NEW_VERSION" ]; then
        NEW_VERSION="$CURRENT_VERSION"
    fi
fi

print_success "Version sélectionnée : $NEW_VERSION"

# ========================================
# 2. Récupération des paramètres
# ========================================

print_info "Étape 2/7 : Configuration"

if [ "$USE_ENV" = true ]; then
    echo "   Utilisation des variables d'environnement..."
    
    if [ -f "$ROOT_DIR/.env" ]; then
        export $(grep -v '^#' "$ROOT_DIR/.env" | xargs)
    fi
    
    APP_ID="${MICROSOFT_APP_ID:-$APP_ID}"
    BOT_ID="${BOT_ID:-$APP_ID}"
    HOSTNAME="${HOSTNAME:-}"
fi

# Demander les paramètres manquants
if [ -z "$APP_ID" ]; then
    read -p "   Microsoft App ID: " APP_ID
fi

if [ -z "$BOT_ID" ]; then
    read -p "   Bot ID (Entrée pour utiliser App ID): " BOT_ID
    if [ -z "$BOT_ID" ]; then
        BOT_ID="$APP_ID"
    fi
fi

if [ -z "$HOSTNAME" ]; then
    read -p "   Hostname (ex: cybersensei-tabs.azurewebsites.net): " HOSTNAME
fi

if [ -z "$CLIENT_NAME" ]; then
    read -p "   Nom du client (optionnel): " CLIENT_NAME
fi

echo ""
print_success "Configuration :"
echo "   App ID    : $APP_ID"
echo "   Bot ID    : $BOT_ID"
echo "   Hostname  : $HOSTNAME"
echo "   Client    : $CLIENT_NAME"

# ========================================
# 3. Validation des icônes
# ========================================

print_info "Étape 3/7 : Validation des icônes"

if [ ! -f "$MANIFEST_DIR/color.png" ]; then
    print_error "L'icône color.png est manquante dans manifest/"
fi

if [ ! -f "$MANIFEST_DIR/outline.png" ]; then
    print_error "L'icône outline.png est manquante dans manifest/"
fi

print_success "Icônes validées"

# ========================================
# 4. Traitement du manifest
# ========================================

print_info "Étape 4/7 : Génération du manifest"

if [ ! -f "$MANIFEST_FILE" ]; then
    print_error "Le fichier manifest.json est manquant"
fi

# Créer une copie temporaire du manifest
TEMP_MANIFEST=$(mktemp)

# Remplacer les variables
jq --arg version "$NEW_VERSION" \
   --arg appId "$APP_ID" \
   --arg botId "$BOT_ID" \
   --arg hostname "$HOSTNAME" \
   '.version = $version | .id = $appId' \
   "$MANIFEST_FILE" > "$TEMP_MANIFEST"

# Remplacer les placeholders dans le JSON
sed -i.bak "s/{{MICROSOFT_APP_ID}}/$APP_ID/g" "$TEMP_MANIFEST"
sed -i.bak "s/{{BOT_ID}}/$BOT_ID/g" "$TEMP_MANIFEST"
sed -i.bak "s/{{HOSTNAME}}/$HOSTNAME/g" "$TEMP_MANIFEST"

print_success "Manifest généré avec succès"

# ========================================
# 5. Création du package temporaire
# ========================================

print_info "Étape 5/7 : Création du package"

TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
TEMP_DIR=$(mktemp -d)

# Copier les fichiers
cp "$MANIFEST_DIR/color.png" "$TEMP_DIR/"
cp "$MANIFEST_DIR/outline.png" "$TEMP_DIR/"
cp "$TEMP_MANIFEST" "$TEMP_DIR/manifest.json"

print_success "Fichiers préparés"

# ========================================
# 6. Création du ZIP
# ========================================

print_info "Étape 6/7 : Compression du package"

PACKAGE_NAME="cybersensei-teams-app"
if [ -n "$CLIENT_NAME" ]; then
    PACKAGE_NAME="${PACKAGE_NAME}-${CLIENT_NAME}"
fi
PACKAGE_NAME="${PACKAGE_NAME}-v${NEW_VERSION}.zip"

PACKAGE_PATH="$DIST_DIR/$PACKAGE_NAME"

# Créer le ZIP
cd "$TEMP_DIR"
zip -q "$PACKAGE_PATH" *
cd - > /dev/null

PACKAGE_SIZE=$(du -k "$PACKAGE_PATH" | cut -f1)

print_success "Package créé : $PACKAGE_NAME"
echo "   Taille : ${PACKAGE_SIZE} KB"

# ========================================
# 7. Mise à jour du fichier version.json
# ========================================

print_info "Étape 7/7 : Mise à jour du versioning"

# Créer l'entrée de build
BUILD_INFO=$(jq -n \
    --arg version "$NEW_VERSION" \
    --arg timestamp "$(date -Iseconds)" \
    --arg appId "$APP_ID" \
    --arg botId "$BOT_ID" \
    --arg hostname "$HOSTNAME" \
    --arg clientName "$CLIENT_NAME" \
    --arg packageFile "$PACKAGE_NAME" \
    --arg packageSize "$PACKAGE_SIZE" \
    '{
        version: $version,
        timestamp: $timestamp,
        appId: $appId,
        botId: $botId,
        hostname: $hostname,
        clientName: $clientName,
        packageFile: $packageFile,
        packageSize: $packageSize
    }')

# Mettre à jour version.json
jq --arg version "$NEW_VERSION" \
   --argjson build "$BUILD_INFO" \
   '.version = $version | .builds += [$build] | .builds = .builds[-10:]' \
   "$VERSION_FILE" > "${VERSION_FILE}.tmp" && mv "${VERSION_FILE}.tmp" "$VERSION_FILE"

print_success "Version.json mis à jour"

# ========================================
# Résumé
# ========================================

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   ✨ Package créé avec succès !               ${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "📦 Package       : $PACKAGE_PATH"
echo "📊 Version       : $NEW_VERSION"
echo "💾 Taille        : ${PACKAGE_SIZE} KB"
echo ""
echo -e "${CYAN}Prochaines étapes :${NC}"
echo "1. Testez le package en le sideloadant dans Teams"
echo "2. Déployez via Teams Admin Center"
echo "3. Consultez docs/teams-deployment.md pour les détails"
echo ""

# Générer le changelog
CHANGELOG_FILE="$DIST_DIR/CHANGELOG-v${NEW_VERSION}.md"
cat > "$CHANGELOG_FILE" << EOF
# CyberSensei Teams App - Version $NEW_VERSION

**Date de build** : $(date "+%Y-%m-%d %H:%M:%S")

## Informations de déploiement

- **Microsoft App ID** : \`$APP_ID\`
- **Bot ID** : \`$BOT_ID\`
- **Hostname** : \`$HOSTNAME\`
- **Client** : $CLIENT_NAME
- **Package** : \`$PACKAGE_NAME\`

## Installation

1. Téléchargez le package : \`$PACKAGE_NAME\`
2. Accédez au Teams Admin Center
3. Suivez les instructions dans \`docs/teams-deployment.md\`

## Changements

[Ajoutez ici les changements de cette version]

---

**Build ID** : $TIMESTAMP
EOF

print_success "Changelog généré : CHANGELOG-v${NEW_VERSION}.md"
echo ""

# Nettoyer
rm -f "$TEMP_MANIFEST" "${TEMP_MANIFEST}.bak"
rm -rf "$TEMP_DIR"

