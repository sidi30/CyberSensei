#!/bin/bash

# ============================================================================
# CyberSensei - Script de Démarrage Automatique
# ============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Démarrage de CyberSensei...${NC}"
echo ""

# ============================================================================
# 1. Vérifications
# ============================================================================
echo -e "${YELLOW}🔍 Vérification des prérequis...${NC}"

# Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

# Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi

# Vérifier que Docker Desktop est démarré
if ! docker ps &> /dev/null; then
    echo -e "${RED}❌ Docker Desktop n'est pas démarré${NC}"
    echo -e "${YELLOW}📌 Action requise:${NC}"
    echo "  1. Lancez Docker Desktop"
    echo "  2. Attendez que Docker soit prêt (icône bleue)"
    echo "  3. Relancez ce script"
    exit 1
fi

echo -e "${GREEN}✅ Docker OK${NC}"

# ============================================================================
# 2. Secrets
# ============================================================================
echo -e "${YELLOW}🔐 Vérification des secrets...${NC}"

if [ ! -f .env.secrets ]; then
    echo -e "${YELLOW}⚠️  .env.secrets n'existe pas. Génération...${NC}"
    
    if [ -f scripts/generate-secrets.sh ]; then
        chmod +x scripts/generate-secrets.sh
        ./scripts/generate-secrets.sh > .env.secrets
        echo -e "${GREEN}✅ Secrets générés dans .env.secrets${NC}"
        echo -e "${YELLOW}⚠️  Pensez à configurer SMTP_PASSWORD dans .env.secrets${NC}"
    else
        echo -e "${YELLOW}⚠️  Copiez secrets.template vers .env.secrets${NC}"
        cp secrets.template .env.secrets 2>/dev/null || true
    fi
else
    echo -e "${GREEN}✅ .env.secrets existe${NC}"
fi

# ============================================================================
# 3. Modèle AI
# ============================================================================
echo -e "${YELLOW}🤖 Vérification du modèle AI...${NC}"

AI_MODEL="cybersensei-node/ai/models/mistral-7b-instruct.Q4_K_M.gguf"

if [ ! -f "$AI_MODEL" ]; then
    echo -e "${RED}❌ Modèle AI non trouvé: $AI_MODEL${NC}"
    echo ""
    echo -e "${YELLOW}📥 Téléchargez le modèle (4.4GB) :${NC}"
    echo ""
    echo "  mkdir -p cybersensei-node/ai/models"
    echo "  cd cybersensei-node/ai/models"
    echo "  wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf"
    echo "  mv mistral-7b-instruct-v0.2.Q4_K_M.gguf mistral-7b-instruct.Q4_K_M.gguf"
    echo ""
    read -p "Continuer sans AI ? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ Modèle AI trouvé ($(du -h $AI_MODEL | cut -f1))${NC}"
fi

# ============================================================================
# 4. Démarrage Docker Compose
# ============================================================================
echo ""
echo -e "${BLUE}🐳 Démarrage des services Docker...${NC}"
echo ""

cd cybersensei-node/compose

# Arrêter les services existants
echo -e "${YELLOW}Arrêt des services existants...${NC}"
docker-compose down 2>/dev/null || true

# Démarrer
echo -e "${GREEN}Démarrage des services...${NC}"
docker-compose --env-file ../../.env.secrets up -d

echo ""
echo -e "${GREEN}✅ Services démarrés !${NC}"
echo ""

# ============================================================================
# 5. Attente de démarrage
# ============================================================================
echo -e "${YELLOW}⏳ Attente du démarrage complet...${NC}"
echo ""

echo -e "${BLUE}Services en cours de démarrage:${NC}"
echo "  🗄️  PostgreSQL (10-20s)"
echo "  🤖 AI Service (1-2min)"
echo "  ⚙️  Backend (30-60s)"
echo "  🌐 Dashboard (5-10s)"
echo ""

# Attendre PostgreSQL
echo -n "  PostgreSQL: "
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U cybersensei &>/dev/null; then
        echo -e "${GREEN}✅${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Attendre Backend
echo -n "  Backend: "
for i in {1..60}; do
    if curl -s http://localhost:8080/actuator/health &>/dev/null; then
        echo -e "${GREEN}✅${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Attendre Dashboard
echo -n "  Dashboard: "
for i in {1..20}; do
    if curl -s http://localhost:3000 &>/dev/null; then
        echo -e "${GREEN}✅${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Attendre AI (optionnel)
if [ -f "../../$AI_MODEL" ]; then
    echo -n "  AI Service: "
    for i in {1..120}; do
        if curl -s http://localhost:8000/health &>/dev/null; then
            echo -e "${GREEN}✅${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done
fi

echo ""

# ============================================================================
# 6. Afficher les URLs
# ============================================================================
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 CyberSensei est prêt !${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📱 Accès aux services:${NC}"
echo ""
echo "  🌐 Dashboard:     http://localhost:3000"
echo "  ⚙️  Backend API:   http://localhost:8080/api"
echo "  📚 Swagger UI:    http://localhost:8080/swagger-ui.html"
echo "  📧 MailCatcher:   http://localhost:1080  (dev)"
echo "  🗄️  PgAdmin:       http://localhost:5050  (dev)"
echo ""
echo -e "${BLUE}👤 Comptes de test:${NC}"
echo ""
echo "  Manager:   manager@cybersensei.io / demo123"
echo "  Employé:   john.doe@cybersensei.io / demo123"
echo "  Admin:     admin@cybersensei.io / admin123"
echo ""
echo -e "${YELLOW}📋 Commandes utiles:${NC}"
echo ""
echo "  docker-compose ps              # Status"
echo "  docker-compose logs -f         # Logs"
echo "  docker-compose restart backend # Redémarrer un service"
echo "  docker-compose down            # Arrêter tout"
echo ""
echo -e "${GREEN}✨ Bon développement !${NC}"
echo ""

# Ouvrir le dashboard (optionnel)
read -p "Ouvrir le dashboard dans le navigateur ? (Y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:3000
    elif command -v open &> /dev/null; then
        open http://localhost:3000
    elif command -v start &> /dev/null; then
        start http://localhost:3000
    else
        echo "Ouvrez manuellement: http://localhost:3000"
    fi
fi

