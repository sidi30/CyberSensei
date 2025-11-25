#!/bin/bash

# ============================================================================
# CyberSensei - Development Environment Setup Script
# ============================================================================

set -e

echo "🚀 Setting up CyberSensei development environment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

command -v java >/dev/null 2>&1 || { echo -e "${RED}❌ Java 17+ is required${NC}"; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js 18+ is required${NC}"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker is required${NC}"; exit 1; }
command -v mvn >/dev/null 2>&1 || { echo -e "${RED}❌ Maven is required${NC}"; exit 1; }

echo -e "${GREEN}✅ Prerequisites OK${NC}"

# Setup environment files
echo -e "${YELLOW}Setting up environment files...${NC}"

if [ ! -f .env ]; then
    if [ -f env.template ]; then
        cp env.template .env
        echo -e "${GREEN}✅ Created .env file from env.template${NC}"
    elif [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file from .env.example${NC}"
    else
        echo -e "${YELLOW}⚠️  No env.template or .env.example found, skipping${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env already exists, skipping${NC}"
fi

# Install dependencies - CyberSensei Node
echo -e "${YELLOW}Installing CyberSensei Node dependencies...${NC}"

cd cybersensei-node/backend
mvn clean install -DskipTests
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

cd ../dashboard
npm install
echo -e "${GREEN}✅ Dashboard dependencies installed${NC}"

cd ../ai
pip install -r requirements.txt
echo -e "${GREEN}✅ AI service dependencies installed${NC}"

cd ../..

# Install dependencies - CyberSensei Central
echo -e "${YELLOW}Installing CyberSensei Central dependencies...${NC}"

cd cybersensei-central/backend
mvn clean install -DskipTests
echo -e "${GREEN}✅ Central backend dependencies installed${NC}"

cd ../dashboard
npm install
echo -e "${GREEN}✅ Central dashboard dependencies installed${NC}"

cd ../..

# Install dependencies - Teams App
echo -e "${YELLOW}Installing Teams App dependencies...${NC}"

cd cybersensei-teams-app/tabs
npm install
echo -e "${GREEN}✅ Teams tabs dependencies installed${NC}"

cd ../bot
npm install
echo -e "${GREEN}✅ Teams bot dependencies installed${NC}"

cd ../..

# Start Docker services
echo -e "${YELLOW}Starting Docker services...${NC}"
docker-compose -f docker-compose.dev.yml up -d postgres
echo -e "${GREEN}✅ PostgreSQL started${NC}"

# Wait for PostgreSQL
echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
sleep 5

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
cd cybersensei-node/backend
mvn liquibase:update
echo -e "${GREEN}✅ Migrations applied${NC}"

cd ../..

echo ""
echo -e "${GREEN}🎉 Development environment setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Start CyberSensei Node:"
echo "     cd cybersensei-node && docker-compose up -d"
echo ""
echo "  2. Or run services individually:"
echo "     Terminal 1: cd cybersensei-node/backend && mvn spring-boot:run"
echo "     Terminal 2: cd cybersensei-node/dashboard && npm run dev"
echo "     Terminal 3: cd cybersensei-node/ai && ./run.sh"
echo ""
echo "  3. Access:"
echo "     Dashboard: http://localhost:3000"
echo "     Backend: http://localhost:8080"
echo "     Swagger: http://localhost:8080/swagger-ui.html"
echo ""

