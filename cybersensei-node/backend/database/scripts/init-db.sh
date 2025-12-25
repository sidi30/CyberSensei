#!/bin/bash
# Initialize CyberSensei Database
# This script sets up the complete database with all seeds

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║   CyberSensei Database Initialization        ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# Configuration
CONTAINER_NAME="cybersensei-postgres"
DB_NAME="cybersensei"
DB_USER="cybersensei"
DB_PASSWORD="cybersensei123"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Start PostgreSQL container
echo -e "${YELLOW}🚀 Starting PostgreSQL container...${NC}"
cd "$(dirname "$0")/.."
docker-compose -f docker-compose-db.yml up -d postgres

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
for i in {1..30}; do
    if docker exec ${CONTAINER_NAME} pg_isready -U ${DB_USER} -d ${DB_NAME} > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL is ready!${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Execute seed scripts
echo ""
echo -e "${YELLOW}🌱 Running seed scripts...${NC}"
echo ""

# 1. Extensions
echo -e "${BLUE}📦 Installing PostgreSQL extensions...${NC}"
docker exec -i ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} < init-scripts/01-init-extensions.sql

# 2. Roles
echo -e "${BLUE}👥 Creating database roles...${NC}"
docker exec -i ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} < init-scripts/02-create-roles.sql

# 3. Admin config
echo -e "${BLUE}⚙️  Seeding admin configuration...${NC}"
docker exec -i ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} < seeds/01-seed-admin-config.sql

# 4. Exercises
echo -e "${BLUE}📚 Seeding exercises...${NC}"
docker exec -i ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} < seeds/02-seed-exercises.sql

# 5. Phishing templates
echo -e "${BLUE}📧 Seeding phishing templates...${NC}"
docker exec -i ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} < seeds/03-seed-phishing-templates.sql

# 6. Demo data
echo -e "${BLUE}🎭 Seeding demo data...${NC}"
docker exec -i ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} < seeds/04-seed-demo-data.sql

# Display statistics
echo ""
echo -e "${GREEN}📊 Database Statistics:${NC}"
docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -c \
    "SELECT 
        schemaname, 
        tablename, 
        n_live_tup as rows 
    FROM pg_stat_user_tables 
    ORDER BY n_live_tup DESC;"

echo ""
echo -e "${GREEN}✅ Database initialization completed successfully!${NC}"
echo ""
echo -e "${BLUE}📝 Connection Details:${NC}"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: ${DB_NAME}"
echo "  User: ${DB_USER}"
echo "  Password: ${DB_PASSWORD}"
echo ""
echo -e "${BLUE}🌐 PgAdmin:${NC}"
echo "  URL: http://localhost:5050"
echo "  Email: admin@cybersensei.io"
echo "  Password: admin123"
echo ""
echo -e "${BLUE}👤 Default Users:${NC}"
echo "  admin@cybersensei.io     (ADMIN)"
echo "  manager@cybersensei.io   (MANAGER)"
echo "  employee@cybersensei.io  (EMPLOYEE)"
echo "  Password: Demo123!"
echo ""
echo -e "${GREEN}🎉 Ready to use!${NC}"


