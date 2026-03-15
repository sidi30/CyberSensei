#!/bin/bash
# =============================================================================
# CyberSensei - Script de déploiement production (sécurisé)
# =============================================================================
# Usage: ./scripts/deploy.sh [--build] [--profile all|ai|monitoring|teams]
#
# Prérequis :
#   1. DNS configuré (cs-*.gwani.fr → IP serveur)
#   2. .env.prod rempli avec les vrais secrets (aucun CHANGE_ME)
#   3. Docker + Docker Compose installés
#   4. Firewall configuré (UFW : 22, 80, 443 uniquement)
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

log()  { echo -e "${GREEN}[+]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[x]${NC} $1"; exit 1; }
info() { echo -e "${BLUE}[i]${NC} $1"; }

# Parse args
BUILD=false
PROFILE=""
SKIP_SECURITY=false
while [[ $# -gt 0 ]]; do
  case $1 in
    --build) BUILD=true; shift ;;
    --profile) PROFILE="$2"; shift 2 ;;
    --skip-security-check) SKIP_SECURITY=true; shift ;;
    *) err "Argument inconnu: $1" ;;
  esac
done

# =============================================================================
# SECURITY CHECKS
# =============================================================================
info "=== CyberSensei Production Deploy (Secured) ==="
echo ""

[[ -f "$COMPOSE_FILE" ]] || err "docker-compose.prod.yml introuvable"
[[ -f "$ENV_FILE" ]] || err ".env.prod introuvable. Copiez .env.prod et remplissez les valeurs."

# FATAL: Block deployment if CHANGE_ME values remain
if grep -q "CHANGE_ME" "$ENV_FILE"; then
  echo ""
  err "DEPLOIEMENT BLOQUE : Des valeurs CHANGE_ME sont encore dans .env.prod !
  Modifiez TOUS les secrets avant de deployer en production.
  Utilisez: openssl rand -base64 32 pour generer des mots de passe forts.

  Valeurs a changer:
$(grep "CHANGE_ME" "$ENV_FILE" | sed 's/=.*//' | sed 's/^/    - /')"
fi

# Check password strength (minimum 16 chars for critical secrets)
if [[ "$SKIP_SECURITY" != "true" ]]; then
  source "$ENV_FILE"

  check_secret_strength() {
    local name="$1"
    local value="$2"
    local min_len="${3:-16}"
    if [[ -n "$value" ]] && [[ ${#value} -lt $min_len ]]; then
      warn "SECRET FAIBLE: $name fait ${#value} caracteres (minimum $min_len)"
      return 1
    fi
    return 0
  }

  WEAK=0
  check_secret_strength "POSTGRES_PASSWORD" "${POSTGRES_PASSWORD:-}" 16 || WEAK=$((WEAK+1))
  check_secret_strength "MONGO_PASSWORD" "${MONGO_PASSWORD:-}" 16 || WEAK=$((WEAK+1))
  check_secret_strength "JWT_SECRET" "${JWT_SECRET:-}" 64 || WEAK=$((WEAK+1))
  check_secret_strength "ADMIN_PASSWORD" "${ADMIN_PASSWORD:-}" 12 || WEAK=$((WEAK+1))
  check_secret_strength "GRAFANA_ADMIN_PASSWORD" "${GRAFANA_ADMIN_PASSWORD:-}" 12 || WEAK=$((WEAK+1))

  if [[ $WEAK -gt 0 ]]; then
    err "DEPLOIEMENT BLOQUE : $WEAK secret(s) trop faible(s). Renforcez-les."
  fi
  log "Secrets : force validee"

  # Check for security bypass flags
  if grep -qE "SECURITY_BYPASS.*true|DEV_MODE.*true" "$ENV_FILE" 2>/dev/null; then
    err "DEPLOIEMENT BLOQUE : SECURITY_BYPASS ou DEV_MODE est active dans .env.prod !"
  fi
  log "Securite : bypass desactive"
fi

# Vérifier que le réseau Coolify existe
if ! docker network ls --format '{{.Name}}' | grep -q "^coolify$"; then
  err "Reseau 'coolify' introuvable. Coolify doit tourner sur ce serveur."
fi
log "Reseau Coolify trouve"

# Charger le domaine
source "$ENV_FILE"
DOMAIN="${DOMAIN:-gwani.fr}"
info "Domaine: $DOMAIN"

# Vérifier DNS
info "Verification DNS..."
for sub in "cybersensei." "cs-app." "cs-node." "cs-m365." "cs-api." "cs-tabs." "cs-monitoring."; do
  host="${sub}${DOMAIN}"
  if dig +short "$host" A 2>/dev/null | head -1 | grep -q '[0-9]'; then
    log "$host -> $(dig +short "$host" A 2>/dev/null | head -1)"
  else
    warn "$host - DNS non configure (Let's Encrypt echouera)"
  fi
done
echo ""

# Check firewall status
if command -v ufw &>/dev/null; then
  if ufw status 2>/dev/null | grep -q "active"; then
    log "Firewall UFW actif"
  else
    warn "Firewall UFW inactif ! Executez: sudo ufw enable"
  fi
else
  warn "UFW non installe. Executez: sudo apt install ufw"
fi

# Build si demandé
COMPOSE_CMD="docker compose -f $COMPOSE_FILE --env-file $ENV_FILE"

if [[ "$BUILD" == "true" ]]; then
  info "Build des images..."
  if [[ -n "$PROFILE" ]]; then
    $COMPOSE_CMD --profile "$PROFILE" build
  else
    $COMPOSE_CMD build
  fi
  log "Build termine"
  echo ""
fi

# Déploiement
info "Demarrage des services..."
if [[ -n "$PROFILE" ]]; then
  $COMPOSE_CMD --profile "$PROFILE" up -d
else
  $COMPOSE_CMD up -d
fi
log "Services demarres"
echo ""

# Attente healthchecks
info "Attente des healthchecks (90s max)..."
sleep 10

MAX_WAIT=90
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
info "=== Etat des services ==="
docker ps --filter "name=cs-" --format "table {{.Names}}\t{{.Status}}" | sort
echo ""

# Résumé
info "=== URLs ==="
log "Website:           https://cybersensei.${DOMAIN}"
log "Central Dashboard: https://cs-app.${DOMAIN}"
log "Node Dashboard:    https://cs-node.${DOMAIN}"
log "M365 Dashboard:    https://cs-m365.${DOMAIN}"
log "API Central:       https://cs-api.${DOMAIN}"

if docker ps --filter "name=cs-grafana" --format "{{.Names}}" | grep -q "cs-grafana"; then
  log "Grafana:           https://cs-monitoring.${DOMAIN}"
fi

echo ""
log "Deploiement termine avec succes !"
