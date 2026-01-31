# =============================================================================
# CyberSensei - Makefile pour Déploiement Simplifié
# =============================================================================
# Utilise le fichier docker-compose.unified.yml avec des profils cohérents
#
# USAGE PRINCIPAL :
#   make start-minimal    # Database + Node Dashboard (démo rapide)
#   make start-node       # Database + Node complet (dev/test)
#   make start-central    # Database + Central (SaaS)
#   make start-full       # TOUT (production-like)
#
# COMMANDES UTILES :
#   make status          # Voir l'état des services
#   make logs            # Voir les logs
#   make stop            # Arrêter tout
#   make clean           # Nettoyer (volumes inclus)
#   make help            # Aide
# =============================================================================

# Couleurs pour l'affichage
CYAN = \033[36m
GREEN = \033[32m
YELLOW = \033[33m
RED = \033[31m
NC = \033[0m # No Color

# Variables
DOCKER_COMPOSE = docker-compose -f docker-compose.unified.yml
ENV_FILE = .env

.DEFAULT_GOAL := help

# ─────────────────────────────────────────────────────────────────────────────
# Aide
# ─────────────────────────────────────────────────────────────────────────────

.PHONY: help
help: ## 📖 Affiche cette aide
	@echo ""
	@echo "$(CYAN)🛡️  CyberSensei - Commandes de Déploiement$(NC)"
	@echo "================================================"
	@echo ""
	@echo "$(YELLOW)📦 DÉMARRAGE RAPIDE :$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep "🚀\|📦\|⚡" | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)make %-15s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)🔧 GESTION :$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep "🔧\|📊\|🧹\|🔍" | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)make %-15s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)💡 EXEMPLES :$(NC)"
	@echo "  $(GREEN)make start-minimal$(NC)    # Démo rapide (database + dashboard)"
	@echo "  $(GREEN)make start-node$(NC)       # Développement Node (backend + dashboard)"
	@echo "  $(GREEN)make start-full$(NC)       # Tout le stack (production-like)"
	@echo "  $(GREEN)make status$(NC)           # Voir ce qui tourne"
	@echo "  $(GREEN)make stop$(NC)             # Arrêter tout"
	@echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Vérifications préalables
# ─────────────────────────────────────────────────────────────────────────────

.PHONY: check-env
check-env:
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "$(YELLOW)⚠️  Fichier .env manquant. Création depuis le template...$(NC)"; \
		cp .env.template .env; \
		echo "$(GREEN)✅ Fichier .env créé. Modifiez les variables si nécessaire.$(NC)"; \
	fi

.PHONY: check-docker
check-docker:
	@if ! command -v docker &> /dev/null; then \
		echo "$(RED)❌ Docker n'est pas installé !$(NC)"; \
		echo "$(YELLOW)📥 Téléchargez Docker Desktop : https://www.docker.com/products/docker-desktop/$(NC)"; \
		exit 1; \
	fi
	@if ! docker info &> /dev/null; then \
		echo "$(RED)❌ Docker n'est pas démarré !$(NC)"; \
		echo "$(YELLOW)🚀 Démarrez Docker Desktop et relancez la commande.$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✅ Docker OK$(NC)"

# ─────────────────────────────────────────────────────────────────────────────
# Commandes de démarrage
# ─────────────────────────────────────────────────────────────────────────────

.PHONY: start-minimal
start-minimal: check-docker check-env ## ⚡ Database + Node Dashboard (démo rapide)
	@echo "$(CYAN)🚀 Démarrage minimal : Database + Node Dashboard$(NC)"
	@$(DOCKER_COMPOSE) --profile minimal up -d
	@echo ""
	@echo "$(GREEN)✅ Services démarrés !$(NC)"
	@echo ""
	@echo "$(YELLOW)🌐 URLs disponibles :$(NC)"
	@echo "  • Node Dashboard: $(GREEN)http://localhost:3000$(NC)"
	@echo "  • PostgreSQL:     $(GREEN)localhost:5432$(NC) (user: cybersensei, password: cybersensei123)"
	@echo ""

.PHONY: start-node
start-node: check-docker check-env ## 📦 Database + Node complet (backend + dashboard)
	@echo "$(CYAN)🚀 Démarrage Node : Database + Backend + Dashboard$(NC)"
	@$(DOCKER_COMPOSE) --profile node up -d
	@echo ""
	@echo "$(GREEN)✅ Services Node démarrés !$(NC)"
	@echo ""
	@echo "$(YELLOW)🌐 URLs disponibles :$(NC)"
	@echo "  • Node Dashboard: $(GREEN)http://localhost:3000$(NC)"
	@echo "  • Node API:       $(GREEN)http://localhost:8080$(NC)"
	@echo "  • Node Swagger:   $(GREEN)http://localhost:8080/swagger-ui.html$(NC)"
	@echo "  • PgAdmin:        $(GREEN)http://localhost:5050$(NC) (admin@cybersensei.io / admin123)"
	@echo ""

.PHONY: start-central
start-central: check-docker check-env ## 📦 Database + Central SaaS (backend + dashboard)
	@echo "$(CYAN)🚀 Démarrage Central : Database + Central Backend + Dashboard$(NC)"
	@$(DOCKER_COMPOSE) --profile central up -d
	@echo ""
	@echo "$(GREEN)✅ Services Central démarrés !$(NC)"
	@echo ""
	@echo "$(YELLOW)🌐 URLs disponibles :$(NC)"
	@echo "  • Central Dashboard: $(GREEN)http://localhost:5173$(NC)"
	@echo "  • Central API:       $(GREEN)http://localhost:3001$(NC)"
	@echo "  • PgAdmin:           $(GREEN)http://localhost:5050$(NC)"
	@echo "  • MongoDB:           $(GREEN)localhost:27017$(NC)"
	@echo ""

.PHONY: start-full
start-full: check-docker check-env ## 🚀 TOUT le stack (Node + Central + Teams + AI + Monitoring)
	@echo "$(CYAN)🚀 Démarrage COMPLET : Tous les services$(NC)"
	@$(DOCKER_COMPOSE) --profile full up -d
	@echo ""
	@echo "$(GREEN)✅ Stack complet démarré !$(NC)"
	@echo ""
	@echo "$(YELLOW)🌐 URLs disponibles :$(NC)"
	@echo "  • Node Dashboard:    $(GREEN)http://localhost:3000$(NC)"
	@echo "  • Node API:          $(GREEN)http://localhost:8080$(NC)"
	@echo "  • Central Dashboard: $(GREEN)http://localhost:5173$(NC)"
	@echo "  • Central API:       $(GREEN)http://localhost:3001$(NC)"
	@echo "  • Teams Bot:         $(GREEN)http://localhost:5175$(NC)"
	@echo "  • Teams Tabs:        $(GREEN)http://localhost:5176$(NC)"
	@echo "  • Website:           $(GREEN)http://localhost:3002$(NC)"
	@echo "  • Node AI:           $(GREEN)http://localhost:8000$(NC)"
	@echo "  • Grafana:           $(GREEN)http://localhost:3300$(NC) (admin / admin123)"
	@echo "  • Prometheus:        $(GREEN)http://localhost:9090$(NC)"
	@echo "  • PgAdmin:           $(GREEN)http://localhost:5050$(NC)"
	@echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Commandes de gestion
# ─────────────────────────────────────────────────────────────────────────────

.PHONY: status
status: ## 📊 Affiche l'état des services
	@echo "$(CYAN)📊 État des services CyberSensei :$(NC)"
	@echo ""
	@$(DOCKER_COMPOSE) ps

.PHONY: logs
logs: ## 🔍 Affiche les logs (Ctrl+C pour quitter)
	@echo "$(CYAN)📋 Logs en temps réel (Ctrl+C pour quitter) :$(NC)"
	@$(DOCKER_COMPOSE) logs -f

.PHONY: stop
stop: ## 🔧 Arrête tous les services
	@echo "$(CYAN)🛑 Arrêt de tous les services...$(NC)"
	@$(DOCKER_COMPOSE) down
	@echo "$(GREEN)✅ Services arrêtés$(NC)"

.PHONY: restart
restart: stop start-node ## 🔧 Redémarre les services Node

.PHONY: clean
clean: ## 🧹 Arrête tout + supprime volumes (ATTENTION : perte de données)
	@echo "$(RED)⚠️  ATTENTION : Cette commande va supprimer TOUTES les données !$(NC)"
	@read -p "Continuer ? (y/N): " confirm && [ "$$confirm" = "y" ]
	@echo "$(CYAN)🧹 Nettoyage complet...$(NC)"
	@$(DOCKER_COMPOSE) down -v --remove-orphans
	@docker system prune -f
	@echo "$(GREEN)✅ Nettoyage terminé$(NC)"

.PHONY: rebuild
rebuild: ## 🔧 Reconstruit toutes les images
	@echo "$(CYAN)🏗️  Reconstruction des images...$(NC)"
	@$(DOCKER_COMPOSE) build --no-cache
	@echo "$(GREEN)✅ Images reconstruites$(NC)"

# ─────────────────────────────────────────────────────────────────────────────
# Commandes de développement
# ─────────────────────────────────────────────────────────────────────────────

.PHONY: dev-setup
dev-setup: check-env ## 🔧 Prépare l'environnement de développement
	@echo "$(CYAN)🛠️  Configuration environnement de développement...$(NC)"
	@if [ ! -d "cybersensei-node/backend/target" ]; then \
		echo "$(YELLOW)📦 Compilation du backend Node...$(NC)"; \
		cd cybersensei-node/backend && mvn clean package -DskipTests; \
	fi
	@echo "$(GREEN)✅ Environnement prêt$(NC)"

.PHONY: db-only
db-only: check-docker check-env ## 📦 Database seulement (pour développement local)
	@echo "$(CYAN)🗄️  Démarrage database seulement...$(NC)"
	@$(DOCKER_COMPOSE) up -d postgres pgadmin
	@echo "$(GREEN)✅ Database démarrée$(NC)"
	@echo "$(YELLOW)🌐 URLs :$(NC)"
	@echo "  • PostgreSQL: $(GREEN)localhost:5432$(NC)"
	@echo "  • PgAdmin:    $(GREEN)http://localhost:5050$(NC)"

# ─────────────────────────────────────────────────────────────────────────────
# Commandes de maintenance
# ─────────────────────────────────────────────────────────────────────────────

.PHONY: health
health: ## 🔍 Vérifie la santé des services
	@echo "$(CYAN)🩺 Vérification de la santé des services :$(NC)"
	@echo ""
	@$(DOCKER_COMPOSE) ps --format table

.PHONY: update
update: ## 🔧 Met à jour les images Docker
	@echo "$(CYAN)📥 Mise à jour des images Docker...$(NC)"
	@$(DOCKER_COMPOSE) pull
	@echo "$(GREEN)✅ Images mises à jour$(NC)"