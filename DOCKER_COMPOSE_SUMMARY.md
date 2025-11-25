# 🐳 Docker Compose CyberSensei - Récapitulatif Complet

## ✅ Fichiers Créés

### 📋 **Configuration Docker (4 fichiers)**

1. **docker-compose.yml** (300+ lignes)
   - Configuration principale
   - 6 services: postgres, ai, backend, dashboard, mailcatcher, pgadmin
   - Health checks configurés
   - Depends_on avec conditions
   - 6 volumes nommés
   - Network dédié
   - Resource limits (dev)
   - Profiles pour services optionnels

2. **docker-compose.prod.yml** (100+ lignes)
   - Override pour production
   - Performance tuning PostgreSQL
   - Resource limits production
   - Restart policies
   - Volumes avec bind mounts
   - Backup labels

3. **docker-compose.dev.yml** (50+ lignes)
   - Override pour développement
   - Debug logging
   - Hot reload volumes
   - MailCatcher et PgAdmin activés
   - Dev tools

4. **.env.template** (100+ lignes)
   - Template de variables d'environnement
   - Sections commentées
   - Valeurs par défaut
   - Examples production

### 📚 **Documentation (2 fichiers)**

5. **DOCKER_DEPLOYMENT.md** (800+ lignes)
   - Guide complet de déploiement
   - Architecture
   - Configuration
   - Environnements (dev/prod)
   - Commandes utiles
   - Volumes & backup
   - Troubleshooting
   - Sécurité
   - Monitoring
   - Best practices

6. **DOCKER_QUICKSTART.md** (300+ lignes)
   - Guide rapide 5 minutes
   - Prérequis
   - Download modèle AI
   - Démarrage
   - Commandes essentielles
   - Troubleshooting rapide

### 🛠️ **Outils (1 fichier)**

7. **Makefile** (200+ lignes)
   - Commandes simplifiées
   - `make dev` - Dev mode
   - `make prod` - Production mode
   - `make logs` - Logs
   - `make db-backup` - Backup DB
   - `make health` - Health check
   - +20 commandes utiles

---

## 🏗️ Architecture Docker

```yaml
services:
  ┌─────────────────────────────────────────────────┐
  │  postgres (Port 5432)                           │
  │  - Image: postgres:15-alpine                    │
  │  - Volumes: db-data                             │
  │  - Health check: pg_isready                     │
  └─────────────────────────────────────────────────┘
                        ↑
                        │
  ┌─────────────────────────────────────────────────┐
  │  ai (Port 8000, 8080)                           │
  │  - Build: cybersensei-node-ai/                  │
  │  - Volumes: ai-models                           │
  │  - Resources: 8GB RAM, 4 CPU                    │
  │  - Health check: curl /health                   │
  └─────────────────────────────────────────────────┘
                        ↑
                        │
  ┌─────────────────────────────────────────────────┐
  │  backend (Port 8080)                            │
  │  - Build: cybersensei-node-backend/             │
  │  - Depends: postgres, ai                        │
  │  - Volumes: backend-data, logs, updates         │
  │  - Health check: /actuator/health               │
  └─────────────────────────────────────────────────┘
                        ↑
                        │
  ┌─────────────────────────────────────────────────┐
  │  dashboard (Port 3000)                          │
  │  - Build: cybersensei-node-dashboard/           │
  │  - Depends: backend                             │
  │  - Nginx serving static files                   │
  │  - Health check: wget /                         │
  └─────────────────────────────────────────────────┘

  Optional (--profile dev):
  ┌─────────────────────────────────────────────────┐
  │  mailcatcher (Port 1025, 1080)                  │
  │  - SMTP debugging                               │
  │  - Web UI at :1080                              │
  └─────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────┐
  │  pgadmin (Port 5050)                            │
  │  - PostgreSQL management UI                     │
  │  - Volumes: pgadmin-data                        │
  └─────────────────────────────────────────────────┘
```

---

## 🔧 Fonctionnalités Implémentées

### ✅ Health Checks
```yaml
# Tous les services ont des health checks
postgres:
  healthcheck:
    test: pg_isready -U cybersensei
    interval: 10s

ai:
  healthcheck:
    test: curl -f http://localhost:8000/health
    interval: 30s
    start_period: 60s  # AI prend du temps

backend:
  healthcheck:
    test: curl -f http://localhost:8080/actuator/health
    interval: 30s
    start_period: 60s  # Attends DB + AI

dashboard:
  healthcheck:
    test: wget --spider http://localhost/
    interval: 30s
```

### ✅ Dependencies avec Conditions
```yaml
backend:
  depends_on:
    postgres:
      condition: service_healthy  # ✅ Attends PostgreSQL
    ai:
      condition: service_healthy  # ✅ Attends AI

dashboard:
  depends_on:
    backend:
      condition: service_healthy  # ✅ Attends Backend
```

### ✅ Resource Limits
```yaml
# Development
ai:
  deploy:
    resources:
      limits:
        cpus: '4'
        memory: 8G

# Production (override)
ai:
  deploy:
    resources:
      limits:
        cpus: '8'
        memory: 16G
```

### ✅ Volumes
```yaml
volumes:
  db-data:              # PostgreSQL data
  ai-models:            # AI models (4.4GB)
  backend-data:         # Backend application data
  backend-logs:         # Backend logs
  backend-updates:      # Update packages
  pgadmin-data:         # PgAdmin config
```

### ✅ Networks
```yaml
networks:
  cybersensei-network:  # Isolated network
    driver: bridge
```

### ✅ Environment Variables
```yaml
# Toutes configurables via .env
- POSTGRES_PASSWORD
- JWT_SECRET
- SMTP_HOST/PORT/USERNAME/PASSWORD
- AI_MODEL_PATH
- PHISHING_ENABLED
- SYNC_ENABLED
- TENANT_ID
- etc. (50+ variables)
```

---

## 🚀 Utilisation

### Quick Start

```bash
# 1. Copier .env
cp .env.template .env

# 2. Télécharger modèle AI (4.4GB)
mkdir -p ai-models && cd ai-models
wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf
mv mistral-7b-instruct-v0.2.Q4_K_M.gguf mistral-7b-instruct.Q4_K_M.gguf
cd ..

# 3. Démarrer
docker-compose up -d

# 4. Accéder
# Dashboard: http://localhost:3000
# Backend: http://localhost:8080
```

### Avec Makefile

```bash
# Initialiser
make init

# Dev mode
make dev

# Production
make prod

# Logs
make logs

# Backup DB
make db-backup

# Health check
make health
```

---

## 📊 Ports Exposés

| Service | Port(s) | Description |
|---------|---------|-------------|
| **postgres** | 5432 | PostgreSQL database |
| **ai** | 8000, 8080 | AI service (API + internal) |
| **backend** | 8080 | Spring Boot backend |
| **dashboard** | 3000 | React dashboard (Nginx) |
| **mailcatcher** | 1025, 1080 | SMTP + Web UI (dev) |
| **pgadmin** | 5050 | Database UI (dev) |

---

## 🔐 Variables d'Environnement Clés

### Production (à changer)
```bash
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key-256bits
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=noreply@company.com
SMTP_PASSWORD=your-app-password
```

### Configuration
```bash
PHISHING_ENABLED=true
TRACKING_BASE_URL=https://cybersensei.company.com
SYNC_ENABLED=true
TENANT_ID=your-company-id
```

---

## 📦 Volumes et Données

### Volumes Créés
```bash
docker volume ls | grep cybersensei

# Output:
cybersensei-db-data         # ~500MB (DB data)
cybersensei-ai-models       # ~4.4GB (AI model)
cybersensei-backend-data    # ~100MB (app data)
cybersensei-backend-logs    # ~50MB (logs)
cybersensei-backend-updates # ~100MB (updates)
cybersensei-pgadmin-data    # ~10MB (PgAdmin)
```

### Backup
```bash
# Automatique avec Makefile
make db-backup

# Manuel
docker exec cybersensei-postgres pg_dump -U cybersensei cybersensei > backup.sql
```

---

## 🌍 Environnements

### Development
```bash
# Avec MailCatcher + PgAdmin
docker-compose --profile dev up -d

# Ou
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Ou avec Makefile
make dev
```

**Services actifs:**
- ✅ postgres, ai, backend, dashboard
- ✅ mailcatcher (SMTP debug)
- ✅ pgadmin (DB UI)

### Production
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Ou avec Makefile
make prod
```

**Optimisations:**
- ✅ Resource limits augmentés
- ✅ PostgreSQL tuning
- ✅ Restart policies
- ✅ Volume bind mounts
- ✅ Backup labels

---

## 🔧 Commandes Essentielles

### Makefile (recommandé)
```bash
make help          # Aide
make dev           # Dev mode
make prod          # Production
make up            # Démarrer
make down          # Arrêter
make logs          # Logs
make ps            # Status
make build         # Build
make rebuild       # Rebuild + restart
make db-backup     # Backup DB
make health        # Health check
make clean         # Nettoyage
```

### Docker Compose
```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Logs
docker-compose logs -f

# Status
docker-compose ps

# Restart
docker-compose restart backend

# Build
docker-compose build

# Update
docker-compose pull && docker-compose up -d --build
```

---

## 🚨 Troubleshooting

### Service ne démarre pas
```bash
# Vérifier logs
docker-compose logs backend

# Vérifier health
docker-compose ps

# Restart
docker-compose restart backend
```

### AI OOM (Out of Memory)
```bash
# Augmenter RAM Docker Desktop
# Settings → Resources → Memory → 16GB

# Ou réduire dans docker-compose.yml
ai:
  deploy:
    resources:
      limits:
        memory: 6G  # Au lieu de 8G
```

### PostgreSQL connection refused
```bash
# Attendre que PG soit healthy
docker-compose ps postgres

# Restart services
docker-compose restart postgres
sleep 10
docker-compose restart backend
```

---

## 📈 Monitoring

### Health Checks
```bash
# Via Makefile
make health

# Manuel
curl http://localhost:8080/actuator/health  # Backend
curl http://localhost:8000/health           # AI
curl http://localhost:3000                  # Dashboard
```

### Resources
```bash
# Docker stats
docker stats

# Makefile
make stats
```

### Logs
```bash
# Tous les services
make logs

# Un service spécifique
make logs-backend
make logs-ai
make logs-dashboard

# Ou
docker-compose logs -f backend
```

---

## 🔒 Sécurité Production

### Checklist
- [ ] Changer `POSTGRES_PASSWORD`
- [ ] Changer `JWT_SECRET` (256+ bits)
- [ ] Configurer SMTP production
- [ ] HTTPS activé (reverse proxy)
- [ ] Firewall configuré
- [ ] Resource limits définis
- [ ] Backups automatiques
- [ ] Monitoring actif
- [ ] Logs centralisés
- [ ] Health checks OK

---

## 🏆 Résultat Final

### ✅ Docker Compose Complet

| Composant | Fichiers | Lignes | Status |
|-----------|----------|--------|--------|
| Docker Compose | 3 | 450+ | ✅ |
| Environment | 1 | 100+ | ✅ |
| Documentation | 2 | 1100+ | ✅ |
| Makefile | 1 | 200+ | ✅ |
| **TOTAL** | **7** | **1850+** | ✅ |

### ✅ Services Configurés

- ✅ **PostgreSQL 15** avec health check
- ✅ **AI Service** (Mistral 7B) avec resource limits
- ✅ **Backend** (Spring Boot) avec depends_on conditions
- ✅ **Dashboard** (React/Nginx)
- ✅ **MailCatcher** (dev only, profile)
- ✅ **PgAdmin** (dev only, profile)

### ✅ Features

- ✅ Health checks sur tous les services
- ✅ Depends_on avec conditions
- ✅ Resource limits (dev + prod)
- ✅ 6 volumes persistants
- ✅ Network isolé
- ✅ 50+ variables d'environnement
- ✅ 3 environnements (base, dev, prod)
- ✅ Profiles pour services optionnels
- ✅ Makefile avec 20+ commandes
- ✅ Documentation complète (1100+ lignes)

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Date**: 2024-11-24  
**Total**: 1850+ lignes de configuration et documentation


