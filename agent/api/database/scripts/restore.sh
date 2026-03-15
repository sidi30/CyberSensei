#!/bin/bash
# PostgreSQL Restore Script for CyberSensei
# Usage: ./restore.sh <backup_file.sql.gz>

set -e

# Configuration
CONTAINER_NAME="cybersensei-postgres"
DB_NAME="cybersensei"
DB_USER="cybersensei"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check arguments
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Error: No backup file specified${NC}"
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh /backups/*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1

# Check if backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
    echo -e "${RED}❌ Error: Backup file not found: ${BACKUP_FILE}${NC}"
    exit 1
fi

# Check if container is running
if ! docker ps | grep -q ${CONTAINER_NAME}; then
    echo -e "${RED}❌ Error: Container ${CONTAINER_NAME} is not running${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will REPLACE all data in the database!${NC}"
echo "Backup file: ${BACKUP_FILE}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${YELLOW}❌ Restore cancelled${NC}"
    exit 1
fi

echo -e "${GREEN}🔄 Starting restore...${NC}"

# Drop existing connections
echo -e "${YELLOW}Dropping existing connections...${NC}"
docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();"

# Drop and recreate database
echo -e "${YELLOW}Recreating database...${NC}"
docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"
docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -d postgres -c "CREATE DATABASE ${DB_NAME};"

# Restore backup
echo -e "${YELLOW}Restoring backup...${NC}"
gunzip -c ${BACKUP_FILE} | docker exec -i ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Restore completed successfully${NC}"
    
    # Display database statistics
    echo ""
    echo -e "${GREEN}📊 Database Statistics:${NC}"
    docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -c \
        "SELECT schemaname, tablename, n_live_tup as rows FROM pg_stat_user_tables ORDER BY n_live_tup DESC;"
else
    echo -e "${RED}❌ Restore failed${NC}"
    exit 1
fi


