#!/bin/bash
# =============================================================================
# CyberSensei - Script de déploiement production
# =============================================================================
# Usage: ./scripts/deploy.sh [--build] [--profile all|ai|monitoring|teams]
#
# Prérequis :
#   1. DNS configuré (*.cybersensei.gwan.fr → IP serveur)
#   2. .env.prod rempli avec les vrais secrets
#   3. Docker + Docker Compose installés
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.prod.yml"
ENV_FILE="$PROJECT_DIR/.env.prod"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }
info() { echo -e "${BLUE}[i]${NC} $1"; }

# Parse args
BUILD=false
PROFILE=""
while [[ $# -gt 0 ]]; do
  case $1 in
    --build) BUILD=true; shift ;;
    --profile) PROFILE="$2"; shift 2 ;;
    *) err "Argument inconnu: $1" ;;
  esac
done

# Checks
info "=== CyberSensei Production Deploy ==="
echo ""

[[ -f "$COMPOSE_FILE" ]] || err "docker-compose.prod.yml introuvable"
[[ -f "$ENV_FILE" ]] || err ".env.prod introuvable. Copiez .env.prod.example et remplissez les valeurs."

# Vérifier que les secrets par défaut ont été changés
if grep -q "CHANGE_ME" "$ENV_FILE"; then
  warn "⚠️  Des valeurs CHANGE_ME sont encore dans .env.prod !"
  warn "Modifiez tous les CHANGE_ME avant un vrai déploiement production."
  echo ""
fi

# Vérifier que le réseau Coolify existe
if ! docker network ls --format '{{.Name}}' | grep -q "^coolify$"; then
  err "Réseau 'coolify' introuvable. Coolify doit tourner sur ce serveur."
fi
log "Réseau Coolify trouvé"

# Charger le domaine
source "$ENV_FILE"
DOMAIN="${DOMAIN:-cybersensei.gwan.fr}"
info "Domaine: $DOMAIN"

# Vérifier DNS
info "Vérification DNS..."
for sub in "" "app." "node." "m365." "api."; do
  host="${sub}${DOMAIN}"
  if dig +short "$host" A 2>/dev/null | head -1 | grep -q '[0-9]'; then
    log "$host → $(dig +short "$host" A 2>/dev/null | head -1)"
  else
    warn "$host - DNS non configuré (Let's Encrypt échouera)"
  fi
done
echo ""

# Build si demandé
COMPOSE_CMD="docker compose -f $COMPOSE_FILE --env-file $ENV_FILE"

if [[ "$BUILD" == "true" ]]; then
  info "Build des images..."
  if [[ -n "$PROFILE" ]]; then
    $COMPOSE_CMD --profile "$PROFILE" build
  else
    $COMPOSE_CMD build
  fi
  log "Build terminé"
  echo ""
fi

# Déploiement
info "Démarrage des services..."
if [[ -n "$PROFILE" ]]; then
  $COMPOSE_CMD --profile "$PROFILE" up -d
else
  $COMPOSE_CMD up -d
fi
log "Services démarrés"
echo ""

# Attente healthchecks
info "Attente des healthchecks (60s max)..."
sleep 10

MAX_WAIT=60
ELAPSED=10
while [[ $ELAPSED -lt $MAX_WAIT ]]; do
  UNHEALTHY=$(docker ps --filter "name=cs-" --format "{{.Names}} {{.Status}}" | grep -c "starting\|unhealthy" || true)
  if [[ "$UNHEALTHY" -eq 0 ]]; then
    break
  fi
  sleep 5
  ELAPSED=$((ELAPSED + 5))
done

echo ""
info "=== État des services ==="
docker ps --filter "name=cs-" --format "table {{.Names}}\t{{.Status}}" | sort
echo ""

# Résumé
info "=== URLs ==="
log "Website:           https://${DOMAIN}"
log "Central Dashboard: https://app.${DOMAIN}"
log "Node Dashboard:    https://node.${DOMAIN}"
log "M365 Dashboard:    https://m365.${DOMAIN}"
log "API Central:       https://api.${DOMAIN}"

if docker ps --filter "name=cs-grafana" --format "{{.Names}}" | grep -q "cs-grafana"; then
  log "Grafana:           https://monitoring.${DOMAIN}"
fi

echo ""
log "Déploiement terminé !"
