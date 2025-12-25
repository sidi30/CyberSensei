#!/bin/bash

# ============================================================================
# CyberSensei - Script d'Arrêt Bash/Linux
# ============================================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo "==========================================================="
echo "   CYBERSENSEI - Arrêt du Projet"
echo "==========================================================="
echo ""

echo -e "${YELLOW}>> Arrêt des services...${NC}"

cd cybersensei-node/compose

docker-compose down

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Tous les services ont été arrêtés${NC}"
    echo ""
    
    echo -e "${YELLOW}Conteneurs Docker actifs:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Erreur lors de l'arrêt des services${NC}"
    echo ""
fi

cd ../..

