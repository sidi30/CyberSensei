#!/bin/bash

# ============================================================================
# CyberSensei - Build All Projects Script
# ============================================================================

set -e

echo "🔨 Building all CyberSensei projects..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Build CyberSensei Node
echo -e "${YELLOW}Building CyberSensei Node...${NC}"

echo -e "${YELLOW}  Building backend...${NC}"
cd cybersensei-node/backend
mvn clean package -DskipTests
echo -e "${GREEN}  ✅ Backend built${NC}"

echo -e "${YELLOW}  Building dashboard...${NC}"
cd ../dashboard
npm run build
echo -e "${GREEN}  ✅ Dashboard built${NC}"

cd ../..

# Build CyberSensei Central
echo -e "${YELLOW}Building CyberSensei Central...${NC}"

echo -e "${YELLOW}  Building backend...${NC}"
cd cybersensei-central/backend
mvn clean package -DskipTests
echo -e "${GREEN}  ✅ Central backend built${NC}"

echo -e "${YELLOW}  Building dashboard...${NC}"
cd ../dashboard
npm run build
echo -e "${GREEN}  ✅ Central dashboard built${NC}"

cd ../..

# Build Teams App
echo -e "${YELLOW}Building Teams App...${NC}"

echo -e "${YELLOW}  Building tabs...${NC}"
cd cybersensei-teams-app/tabs
npm run build
echo -e "${GREEN}  ✅ Tabs built${NC}"

echo -e "${YELLOW}  Building bot...${NC}"
cd ../bot
npm run build
echo -e "${GREEN}  ✅ Bot built${NC}"

cd ../..

echo ""
echo -e "${GREEN}🎉 All projects built successfully!${NC}"
echo ""
echo -e "${YELLOW}Build artifacts:${NC}"
echo "  CyberSensei Node Backend: cybersensei-node/backend/target/"
echo "  CyberSensei Node Dashboard: cybersensei-node/dashboard/dist/"
echo "  CyberSensei Central Backend: cybersensei-central/backend/target/"
echo "  CyberSensei Central Dashboard: cybersensei-central/dashboard/dist/"
echo "  Teams Tabs: cybersensei-teams-app/tabs/dist/"
echo "  Teams Bot: cybersensei-teams-app/bot/dist/"
echo ""

