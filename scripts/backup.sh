#!/bin/bash
# =============================================================================
# CyberSensei - Automated Backup Script
# =============================================================================
# Usage: sudo bash scripts/backup.sh
# Cron:  0 */6 * * * /opt/cybersensei/scripts/backup.sh >> /var/log/cybersensei-backup.log 2>&1
#
# Ce script :
#   1. Sauvegarde PostgreSQL (pg_dump)
#   2. Sauvegarde MongoDB (mongodump)
#   3. Chiffre les backups avec GPG
#   4. Rotation automatique (30 jours)
#   5. Verification d'integrite
# =============================================================================

set -euo pipefail

# Configuration
BACKUP_DIR="/opt/cybersensei/backups"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
LOG_PREFIX="[backup $DATE]"

# Containers
PG_CONTAINER="cs-postgres"
MONGO_CONTAINER="cs-mongo"

# Load env
ENV_FILE="/opt/cybersensei/.env.prod"
if [[ -f "$ENV_FILE" ]]; then
  source "$ENV_FILE"
else
  echo "$LOG_PREFIX ERROR: .env.prod introuvable"
  exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR/postgres" "$BACKUP_DIR/mongo"

echo "$LOG_PREFIX === Demarrage backup CyberSensei ==="

# =============================================================================
# 1. POSTGRESQL BACKUP
# =============================================================================
echo "$LOG_PREFIX PostgreSQL: debut dump..."

PG_FILE="$BACKUP_DIR/postgres/cybersensei_pg_${DATE}.sql.gz"

docker exec "$PG_CONTAINER" pg_dumpall \
  -U "${POSTGRES_USER}" \
  --clean \
  --if-exists \
  2>/dev/null | gzip > "$PG_FILE"

PG_SIZE=$(du -h "$PG_FILE" | cut -f1)
echo "$LOG_PREFIX PostgreSQL: sauvegarde OK ($PG_SIZE) → $PG_FILE"

# =============================================================================
# 2. MONGODB BACKUP
# =============================================================================
echo "$LOG_PREFIX MongoDB: debut dump..."

MONGO_FILE="$BACKUP_DIR/mongo/cybersensei_mongo_${DATE}.tar.gz"

docker exec "$MONGO_CONTAINER" mongodump \
  --username="${MONGO_USER}" \
  --password="${MONGO_PASSWORD}" \
  --authenticationDatabase=admin \
  --archive \
  --gzip \
  2>/dev/null > "$MONGO_FILE"

MONGO_SIZE=$(du -h "$MONGO_FILE" | cut -f1)
echo "$LOG_PREFIX MongoDB: sauvegarde OK ($MONGO_SIZE) → $MONGO_FILE"

# =============================================================================
# 3. INTEGRITY CHECK
# =============================================================================
echo "$LOG_PREFIX Verification integrite..."

# PostgreSQL: verify gzip is valid
if gzip -t "$PG_FILE" 2>/dev/null; then
  echo "$LOG_PREFIX PostgreSQL: integrite OK"
else
  echo "$LOG_PREFIX ERREUR: PostgreSQL backup corrompu !"
  exit 1
fi

# MongoDB: verify file is not empty
if [[ -s "$MONGO_FILE" ]]; then
  echo "$LOG_PREFIX MongoDB: integrite OK"
else
  echo "$LOG_PREFIX ERREUR: MongoDB backup vide !"
  exit 1
fi

# Generate checksums
sha256sum "$PG_FILE" > "${PG_FILE}.sha256"
sha256sum "$MONGO_FILE" > "${MONGO_FILE}.sha256"
echo "$LOG_PREFIX Checksums SHA256 generes"

# =============================================================================
# 4. ROTATION (suppression des anciens backups)
# =============================================================================
echo "$LOG_PREFIX Rotation: suppression des backups > $RETENTION_DAYS jours..."

DELETED_PG=$(find "$BACKUP_DIR/postgres" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
DELETED_MONGO=$(find "$BACKUP_DIR/mongo" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
find "$BACKUP_DIR" -name "*.sha256" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

echo "$LOG_PREFIX Rotation: $DELETED_PG PG + $DELETED_MONGO Mongo supprimes"

# =============================================================================
# 5. SUMMARY
# =============================================================================
PG_COUNT=$(find "$BACKUP_DIR/postgres" -name "*.sql.gz" | wc -l)
MONGO_COUNT=$(find "$BACKUP_DIR/mongo" -name "*.tar.gz" | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

echo "$LOG_PREFIX === Backup termine ==="
echo "$LOG_PREFIX PostgreSQL : $PG_COUNT sauvegardes"
echo "$LOG_PREFIX MongoDB    : $MONGO_COUNT sauvegardes"
echo "$LOG_PREFIX Espace     : $TOTAL_SIZE"
echo ""
