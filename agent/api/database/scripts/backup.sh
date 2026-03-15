#!/bin/bash
# Automatic PostgreSQL Backup Script for CyberSensei
# Usage: ./backup.sh [daily|weekly|monthly]

set -e

# Configuration
BACKUP_DIR="/backups"
CONTAINER_NAME="cybersensei-postgres"
DB_NAME="cybersensei"
DB_USER="cybersensei"
RETENTION_DAYS=30
RETENTION_WEEKS=12
RETENTION_MONTHS=12

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backup type (default: daily)
BACKUP_TYPE="${1:-daily}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_TYPE}_backup_${TIMESTAMP}.sql.gz"

echo -e "${GREEN}🔄 Starting ${BACKUP_TYPE} backup...${NC}"

# Check if container is running
if ! docker ps | grep -q ${CONTAINER_NAME}; then
    echo -e "${RED}❌ Error: Container ${CONTAINER_NAME} is not running${NC}"
    exit 1
fi

# Create backup directory if not exists
docker exec ${CONTAINER_NAME} mkdir -p ${BACKUP_DIR}

# Perform backup
echo -e "${YELLOW}📦 Creating backup: ${BACKUP_FILE}${NC}"
docker exec ${CONTAINER_NAME} pg_dump -U ${DB_USER} ${DB_NAME} | gzip > ${BACKUP_FILE}

# Check if backup was successful
if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h ${BACKUP_FILE} | cut -f1)
    echo -e "${GREEN}✅ Backup completed successfully: ${BACKUP_SIZE}${NC}"
else
    echo -e "${RED}❌ Backup failed${NC}"
    exit 1
fi

# Cleanup old backups based on type
echo -e "${YELLOW}🧹 Cleaning up old backups...${NC}"

case ${BACKUP_TYPE} in
    daily)
        find ${BACKUP_DIR} -name "daily_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
        echo -e "${GREEN}Removed daily backups older than ${RETENTION_DAYS} days${NC}"
        ;;
    weekly)
        find ${BACKUP_DIR} -name "weekly_backup_*.sql.gz" -mtime +$((${RETENTION_WEEKS} * 7)) -delete
        echo -e "${GREEN}Removed weekly backups older than ${RETENTION_WEEKS} weeks${NC}"
        ;;
    monthly)
        find ${BACKUP_DIR} -name "monthly_backup_*.sql.gz" -mtime +$((${RETENTION_MONTHS} * 30)) -delete
        echo -e "${GREEN}Removed monthly backups older than ${RETENTION_MONTHS} months${NC}"
        ;;
esac

# Display backup statistics
echo ""
echo -e "${GREEN}📊 Backup Statistics:${NC}"
echo "  Type: ${BACKUP_TYPE}"
echo "  File: ${BACKUP_FILE}"
echo "  Size: ${BACKUP_SIZE}"
echo "  Date: $(date)"
echo ""

# List recent backups
echo -e "${GREEN}📁 Recent backups:${NC}"
ls -lh ${BACKUP_DIR}/${BACKUP_TYPE}_backup_* 2>/dev/null | tail -5 || echo "No backups found"

echo -e "${GREEN}✅ Backup process completed${NC}"


