#!/bin/bash

# ============================================================================
# CyberSensei Monorepo - Script de Réorganisation Automatique
# ============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Réorganisation du monorepo CyberSensei...${NC}"
echo ""

# ============================================================================
# Vérifications préalables
# ============================================================================
echo -e "${YELLOW}⚠️  ATTENTION: Ce script va réorganiser toute la structure du monorepo.${NC}"
echo -e "${YELLOW}   Assurez-vous d'avoir un backup !${NC}"
echo ""
read -p "Continuer ? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Annulé${NC}"
    exit 1
fi

# ============================================================================
# 1. CyberSensei Central
# ============================================================================
echo -e "${BLUE}📦 [1/3] Réorganisation CyberSensei Central...${NC}"

# Backend
if [ -d "CyberSensei - saas/cybersensei-central-backend" ]; then
    echo -e "${GREEN}  → Déplacement backend NestJS...${NC}"
    mkdir -p cybersensei-central/backend
    cp -r "CyberSensei - saas/cybersensei-central-backend/"* cybersensei-central/backend/ 2>/dev/null || true
    # Copier aussi les fichiers cachés
    cp -r "CyberSensei - saas/cybersensei-central-backend/".* cybersensei-central/backend/ 2>/dev/null || true
fi

# Dashboard
if [ -d "CyberSensei - saas/cybersensei-central-dashboard" ]; then
    echo -e "${GREEN}  → Déplacement dashboard React...${NC}"
    mkdir -p cybersensei-central/dashboard
    cp -r "CyberSensei - saas/cybersensei-central-dashboard/"* cybersensei-central/dashboard/ 2>/dev/null || true
    cp -r "CyberSensei - saas/cybersensei-central-dashboard/".* cybersensei-central/dashboard/ 2>/dev/null || true
fi

# Infrastructure (monitoring)
if [ -d "CyberSensei - saas/cybersensei-central-backend/monitoring" ]; then
    echo -e "${GREEN}  → Déplacement infrastructure (monitoring)...${NC}"
    mkdir -p cybersensei-central/infrastructure
    cp -r "CyberSensei - saas/cybersensei-central-backend/monitoring/"* cybersensei-central/infrastructure/ 2>/dev/null || true
fi

echo -e "${GREEN}  ✅ CyberSensei Central réorganisé${NC}"

# ============================================================================
# 2. CyberSensei Node
# ============================================================================
echo -e "${BLUE}📦 [2/3] Réorganisation CyberSensei Node...${NC}"

# Backend (Spring Boot)
if [ -d "cybersensei-node-backend" ]; then
    echo -e "${GREEN}  → Déplacement backend Spring Boot...${NC}"
    mkdir -p cybersensei-node/backend
    cp -r cybersensei-node-backend/* cybersensei-node/backend/ 2>/dev/null || true
    cp -r cybersensei-node-backend/.* cybersensei-node/backend/ 2>/dev/null || true
fi

# Dashboard (React)
if [ -d "cybersensei-node-dashboard" ]; then
    echo -e "${GREEN}  → Déplacement dashboard React...${NC}"
    mkdir -p cybersensei-node/dashboard
    cp -r cybersensei-node-dashboard/* cybersensei-node/dashboard/ 2>/dev/null || true
    cp -r cybersensei-node-dashboard/.* cybersensei-node/dashboard/ 2>/dev/null || true
fi

# AI Service (Python)
if [ -d "cybersensei-node-ai" ]; then
    echo -e "${GREEN}  → Déplacement AI Service (Mistral 7B)...${NC}"
    mkdir -p cybersensei-node/ai
    cp -r cybersensei-node-ai/* cybersensei-node/ai/ 2>/dev/null || true
    cp -r cybersensei-node-ai/.* cybersensei-node/ai/ 2>/dev/null || true
fi

# Compose (Docker configs)
echo -e "${GREEN}  → Création dossier compose et déplacement configs Docker...${NC}"
mkdir -p cybersensei-node/compose

# Déplacer docker-compose
if [ -f "docker-compose.yml" ]; then
    cp docker-compose*.yml cybersensei-node/compose/ 2>/dev/null || true
fi

# Déplacer Makefile
if [ -f "Makefile" ]; then
    cp Makefile cybersensei-node/compose/
fi

# Déplacer docs Docker
cp DOCKER_*.md cybersensei-node/compose/ 2>/dev/null || true
if [ -f "START_HERE.md" ]; then
    cp START_HERE.md cybersensei-node/compose/
fi
if [ -f "README_DOCKER.md" ]; then
    cp README_DOCKER.md cybersensei-node/compose/
fi

echo -e "${GREEN}  ✅ CyberSensei Node réorganisé${NC}"

# ============================================================================
# 3. CyberSensei Teams App
# ============================================================================
echo -e "${BLUE}📦 [3/3] Réorganisation CyberSensei Teams App...${NC}"

if [ -d "CyberSensei - teams/cybersensei-teams-app" ]; then
    # Tabs
    echo -e "${GREEN}  → Déplacement tabs React...${NC}"
    mkdir -p cybersensei-teams-app/tabs
    if [ -d "CyberSensei - teams/cybersensei-teams-app/tabs" ]; then
        cp -r "CyberSensei - teams/cybersensei-teams-app/tabs/"* cybersensei-teams-app/tabs/ 2>/dev/null || true
        cp -r "CyberSensei - teams/cybersensei-teams-app/tabs/".* cybersensei-teams-app/tabs/ 2>/dev/null || true
    fi
    
    # Bot
    echo -e "${GREEN}  → Déplacement bot Bot Framework...${NC}"
    mkdir -p cybersensei-teams-app/bot
    if [ -d "CyberSensei - teams/cybersensei-teams-app/bot" ]; then
        cp -r "CyberSensei - teams/cybersensei-teams-app/bot/"* cybersensei-teams-app/bot/ 2>/dev/null || true
        cp -r "CyberSensei - teams/cybersensei-teams-app/bot/".* cybersensei-teams-app/bot/ 2>/dev/null || true
    fi
    
    # Manifest
    echo -e "${GREEN}  → Déplacement manifest Teams...${NC}"
    mkdir -p cybersensei-teams-app/manifest
    if [ -d "CyberSensei - teams/cybersensei-teams-app/manifest" ]; then
        cp -r "CyberSensei - teams/cybersensei-teams-app/manifest/"* cybersensei-teams-app/manifest/ 2>/dev/null || true
    fi
    
    # Common (utilitaires partagés)
    if [ -d "CyberSensei - teams/cybersensei-teams-app/common" ]; then
        echo -e "${GREEN}  → Déplacement common (utilitaires)...${NC}"
        cp -r "CyberSensei - teams/cybersensei-teams-app/common" cybersensei-teams-app/
    fi
    
    # Scripts
    if [ -d "CyberSensei - teams/cybersensei-teams-app/scripts" ]; then
        echo -e "${GREEN}  → Déplacement scripts...${NC}"
        cp -r "CyberSensei - teams/cybersensei-teams-app/scripts" cybersensei-teams-app/
    fi
    
    # Docs et configs racine
    echo -e "${GREEN}  → Déplacement docs et configs...${NC}"
    cp "CyberSensei - teams/cybersensei-teams-app/"*.md cybersensei-teams-app/ 2>/dev/null || true
    cp "CyberSensei - teams/cybersensei-teams-app/package.json" cybersensei-teams-app/ 2>/dev/null || true
    cp "CyberSensei - teams/cybersensei-teams-app/tsconfig.json" cybersensei-teams-app/ 2>/dev/null || true
    cp "CyberSensei - teams/cybersensei-teams-app/LICENSE" cybersensei-teams-app/ 2>/dev/null || true
fi

echo -e "${GREEN}  ✅ CyberSensei Teams App réorganisé${NC}"

# ============================================================================
# 4. Nettoyage (suppression des anciens dossiers)
# ============================================================================
echo ""
echo -e "${YELLOW}🗑️  Nettoyage des anciens dossiers...${NC}"
echo ""
echo -e "${RED}⚠️  Attention: Ceci va SUPPRIMER les anciens dossiers !${NC}"
echo -e "${YELLOW}   Les fichiers ont été copiés dans la nouvelle structure.${NC}"
echo ""
read -p "Supprimer les anciens dossiers ? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}  → Suppression CyberSensei - saas/...${NC}"
    rm -rf "CyberSensei - saas/"
    
    echo -e "${YELLOW}  → Suppression CyberSensei - teams/...${NC}"
    rm -rf "CyberSensei - teams/"
    
    echo -e "${YELLOW}  → Suppression cybersensei-frontend/ (obsolète)...${NC}"
    rm -rf cybersensei-frontend/
    
    echo -e "${YELLOW}  → Suppression anciens dossiers node à la racine...${NC}"
    rm -rf cybersensei-node-backend/
    rm -rf cybersensei-node-dashboard/
    rm -rf cybersensei-node-ai/
    
    echo -e "${YELLOW}  → Suppression dossier node vide...${NC}"
    # Le nouveau dossier cybersensei-node/ avec contenu a été créé
    
    echo -e "${YELLOW}  → Suppression fichiers Docker à la racine...${NC}"
    rm -f docker-compose.yml
    rm -f docker-compose.dev.yml
    rm -f docker-compose.prod.yml
    rm -f Makefile
    rm -f DOCKER_*.md
    rm -f START_HERE.md
    
    echo -e "${GREEN}  ✅ Nettoyage terminé${NC}"
else
    echo -e "${YELLOW}  ⏭️  Nettoyage ignoré (anciens dossiers conservés)${NC}"
fi

# ============================================================================
# 5. Résumé
# ============================================================================
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Réorganisation terminée avec succès !${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📁 Nouvelle structure du monorepo:${NC}"
echo ""
echo "  cybersensei/"
echo "  ├── cybersensei-central/      (SaaS Platform)"
echo "  │   ├── backend/              (NestJS)"
echo "  │   ├── dashboard/            (React)"
echo "  │   └── infrastructure/       (Monitoring)"
echo "  │"
echo "  ├── cybersensei-node/         (On-Premise)"
echo "  │   ├── backend/              (Spring Boot)"
echo "  │   ├── dashboard/            (React)"
echo "  │   ├── ai/                   (Python/Mistral)"
echo "  │   └── compose/              (Docker configs)"
echo "  │"
echo "  └── cybersensei-teams-app/    (Teams Extension)"
echo "      ├── tabs/                 (React)"
echo "      ├── bot/                  (Bot Framework)"
echo "      └── manifest/             (Teams manifest)"
echo ""
echo -e "${YELLOW}📝 Prochaines étapes:${NC}"
echo "  1. Vérifier la structure: tree -L 3 cybersensei-*/"
echo "  2. Mettre à jour les chemins dans scripts/setup-dev.sh"
echo "  3. Mettre à jour les READMEs si nécessaire"
echo "  4. Tester les builds: ./scripts/build-all.sh"
echo "  5. Commit: git add -A && git commit -m 'chore: reorganize monorepo structure'"
echo ""

