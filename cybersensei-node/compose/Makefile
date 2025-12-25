# ============================================================================
# CyberSensei Docker Compose Makefile
# ============================================================================

.PHONY: help up down restart logs ps build clean dev prod backup restore

# Default target
.DEFAULT_GOAL := help

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

## help: Show this help message
help:
	@echo ""
	@echo "$(BLUE)CyberSensei Docker Compose$(NC)"
	@echo ""
	@echo "$(GREEN)Available targets:$(NC)"
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(BLUE)%-15s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(YELLOW)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo ""

##@ Development

## dev: Start in development mode (with MailCatcher and PgAdmin)
dev:
	@echo "$(GREEN)Starting CyberSensei in development mode...$(NC)"
	docker-compose --profile dev up -d
	@echo "$(GREEN)✅ Services started!$(NC)"
	@echo "Dashboard: http://localhost:3000"
	@echo "Backend: http://localhost:8080"
	@echo "MailCatcher: http://localhost:1080"
	@echo "PgAdmin: http://localhost:5050"

## dev-logs: Show logs in development mode
dev-logs:
	docker-compose logs -f

##@ Production

## prod: Start in production mode
prod:
	@echo "$(GREEN)Starting CyberSensei in production mode...$(NC)"
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✅ Services started!$(NC)"

## up: Start all services
up:
	@echo "$(GREEN)Starting CyberSensei...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✅ Services started!$(NC)"

## down: Stop all services
down:
	@echo "$(YELLOW)Stopping CyberSensei...$(NC)"
	docker-compose down
	@echo "$(GREEN)✅ Services stopped!$(NC)"

## restart: Restart all services
restart: down up

##@ Monitoring

## ps: Show service status
ps:
	docker-compose ps

## logs: Show logs (all services)
logs:
	docker-compose logs -f

## logs-backend: Show backend logs
logs-backend:
	docker-compose logs -f backend

## logs-ai: Show AI service logs
logs-ai:
	docker-compose logs -f ai

## logs-dashboard: Show dashboard logs
logs-dashboard:
	docker-compose logs -f dashboard

## stats: Show resource usage
stats:
	docker stats

##@ Building

## build: Build all services
build:
	@echo "$(GREEN)Building services...$(NC)"
	docker-compose build

## build-backend: Build backend only
build-backend:
	@echo "$(GREEN)Building backend...$(NC)"
	docker-compose build backend

## build-ai: Build AI service only
build-ai:
	@echo "$(GREEN)Building AI service...$(NC)"
	docker-compose build ai

## build-dashboard: Build dashboard only
build-dashboard:
	@echo "$(GREEN)Building dashboard...$(NC)"
	docker-compose build dashboard

## rebuild: Rebuild and restart
rebuild:
	@echo "$(GREEN)Rebuilding services...$(NC)"
	docker-compose up -d --build

##@ Database

## db-backup: Backup database
db-backup:
	@echo "$(GREEN)Backing up database...$(NC)"
	docker exec cybersensei-postgres pg_dump -U cybersensei cybersensei > backup-$(shell date +%Y%m%d-%H%M%S).sql
	@echo "$(GREEN)✅ Backup created!$(NC)"

## db-restore: Restore database (usage: make db-restore FILE=backup.sql)
db-restore:
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: Please specify FILE=backup.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Restoring database from $(FILE)...$(NC)"
	docker exec -i cybersensei-postgres psql -U cybersensei cybersensei < $(FILE)
	@echo "$(GREEN)✅ Database restored!$(NC)"

## db-psql: Access PostgreSQL CLI
db-psql:
	docker exec -it cybersensei-postgres psql -U cybersensei cybersensei

## db-reset: Reset database (⚠️ Destructive!)
db-reset:
	@echo "$(RED)⚠️  This will delete all data! Press Ctrl+C to cancel...$(NC)"
	@sleep 5
	docker-compose down -v
	docker-compose up -d postgres
	@echo "$(GREEN)✅ Database reset!$(NC)"

##@ Maintenance

## clean: Clean up containers and volumes (⚠️ Destructive!)
clean:
	@echo "$(RED)⚠️  This will delete all data! Press Ctrl+C to cancel...$(NC)"
	@sleep 5
	docker-compose down -v
	@echo "$(GREEN)✅ Cleaned up!$(NC)"

## prune: Prune Docker system
prune:
	@echo "$(YELLOW)Pruning Docker system...$(NC)"
	docker system prune -a
	@echo "$(GREEN)✅ Pruned!$(NC)"

## update: Pull latest images and restart
update:
	@echo "$(GREEN)Updating services...$(NC)"
	docker-compose pull
	docker-compose up -d --build
	@echo "$(GREEN)✅ Updated!$(NC)"

##@ Setup

## init: Initialize project (copy .env, download AI model)
init:
	@echo "$(GREEN)Initializing CyberSensei...$(NC)"
	@if [ ! -f .env ]; then \
		cp ENV_TEMPLATE .env; \
		echo "$(GREEN)✅ .env file created$(NC)"; \
		echo "$(YELLOW)⚠️  Please edit .env and change passwords!$(NC)"; \
	else \
		echo "$(YELLOW).env file already exists$(NC)"; \
	fi
	@echo ""
	@echo "$(YELLOW)AI model will be downloaded automatically on first startup$(NC)"
	@echo "This may take 5-15 minutes depending on your connection."

##@ Health

## health: Check service health
health:
	@echo "$(GREEN)Checking service health...$(NC)"
	@echo ""
	@echo "$(BLUE)Backend:$(NC)"
	@curl -sf http://localhost:8080/actuator/health || echo "$(RED)❌ Backend unhealthy$(NC)"
	@echo ""
	@echo "$(BLUE)AI Service:$(NC)"
	@curl -sf http://localhost:8000/health || echo "$(RED)❌ AI unhealthy$(NC)"
	@echo ""
	@echo "$(BLUE)Dashboard:$(NC)"
	@curl -sf http://localhost:3000 > /dev/null && echo "$(GREEN)✅ Dashboard healthy$(NC)" || echo "$(RED)❌ Dashboard unhealthy$(NC)"
	@echo ""


