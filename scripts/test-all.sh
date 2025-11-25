#!/bin/bash

# ============================================================================
# CyberSensei - Test All Projects Script
# ============================================================================

set -e

echo "🧪 Testing all CyberSensei projects..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

EXIT_CODE=0

# Test CyberSensei Node Backend
echo -e "${YELLOW}Testing CyberSensei Node Backend...${NC}"
cd cybersensei-node/backend
mvn test || EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ CyberSensei Node Backend tests passed${NC}"
else
    echo -e "${RED}❌ CyberSensei Node Backend tests failed${NC}"
fi
cd ../..

# Test CyberSensei Node Dashboard
echo -e "${YELLOW}Testing CyberSensei Node Dashboard...${NC}"
cd cybersensei-node/dashboard
npm test -- --passWithNoTests || EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ CyberSensei Node Dashboard tests passed${NC}"
else
    echo -e "${RED}❌ CyberSensei Node Dashboard tests failed${NC}"
fi
cd ../..

# Test CyberSensei Central Backend
echo -e "${YELLOW}Testing CyberSensei Central Backend...${NC}"
cd cybersensei-central/backend
mvn test || EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ CyberSensei Central Backend tests passed${NC}"
else
    echo -e "${RED}❌ CyberSensei Central Backend tests failed${NC}"
fi
cd ../..

# Test CyberSensei Central Dashboard
echo -e "${YELLOW}Testing CyberSensei Central Dashboard...${NC}"
cd cybersensei-central/dashboard
npm test -- --passWithNoTests || EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ CyberSensei Central Dashboard tests passed${NC}"
else
    echo -e "${RED}❌ CyberSensei Central Dashboard tests failed${NC}"
fi
cd ../..

# Test Teams Tabs
echo -e "${YELLOW}Testing Teams Tabs...${NC}"
cd cybersensei-teams-app/tabs
npm test -- --passWithNoTests || EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Teams Tabs tests passed${NC}"
else
    echo -e "${RED}❌ Teams Tabs tests failed${NC}"
fi
cd ../..

# Test Teams Bot
echo -e "${YELLOW}Testing Teams Bot...${NC}"
cd cybersensei-teams-app/bot
npm test -- --passWithNoTests || EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Teams Bot tests passed${NC}"
else
    echo -e "${RED}❌ Teams Bot tests failed${NC}"
fi
cd ../..

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
else
    echo -e "${RED}❌ Some tests failed${NC}"
fi
echo ""

exit $EXIT_CODE

