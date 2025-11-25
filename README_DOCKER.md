# 🐳 CyberSensei - Docker Full Stack

> **Configuration Docker Compose complète pour déployer CyberSensei en un seul clic**

## 🎯 Vue d'Ensemble

Ce projet fournit une **configuration Docker Compose production-ready** qui bundle tous les composants CyberSensei :

- ✅ **Backend** (Spring Boot 3 + PostgreSQL + JWT)
- ✅ **AI Service** (Mistral 7B Instruct + llama.cpp)
- ✅ **Dashboard** (React + TypeScript + Tailwind)
- ✅ **Database** (PostgreSQL 15)
- ✅ **Dev Tools** (MailCatcher, PgAdmin)

---

## 📦 Fichiers Fournis

```
.
├── docker-compose.yml           # Configuration principale
├── docker-compose.dev.yml       # Override développement
├── docker-compose.prod.yml      # Override production
├── .env.template                # Template variables environnement
├── Makefile                     # Commandes simplifiées
├── DOCKER_QUICKSTART.md         # Guide rapide 5 min
├── DOCKER_DEPLOYMENT.md         # Guide complet
└── DOCKER_COMPOSE_SUMMARY.md    # Récapitulatif technique
```

---

## ⚡ Quick Start

### 1️⃣ Prérequis

```bash
# Docker & Docker Compose
docker --version              # 20.10+
docker-compose --version      # 2.0+

# Ressources minimales
- 16GB RAM
- 50GB disk space
- 4 CPU cores
```

### 2️⃣ Configuration

```bash
# Copier le template
cp .env.template .env

# Éditer (optionnel pour demo)
nano .env
```

### 3️⃣ Télécharger Modèle AI

```bash
# Télécharger Mistral 7B (4.4GB)
mkdir -p ai-models && cd ai-models
wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf
mv mistral-7b-instruct-v0.2.Q4_K_M.gguf mistral-7b-instruct.Q4_K_M.gguf
cd ..
```

### 4️⃣ Démarrer

```bash
# Avec Makefile (recommandé)
make dev              # Mode développement
# Ou
make prod             # Mode production

# Ou directement avec Docker Compose
docker-compose up -d
```

### 5️⃣ Accéder

| Service | URL | Credentials |
|---------|-----|-------------|
| **Dashboard** | http://localhost:3000 | manager@cybersensei.io / demo123 |
| **Backend API** | http://localhost:8080/api | - |
| **Swagger UI** | http://localhost:8080/swagger-ui.html | - |
| **MailCatcher** | http://localhost:1080 | (dev only) |
| **PgAdmin** | http://localhost:5050 | admin@cybersensei.io / admin123 |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                CyberSensei Stack                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐     ┌──────────┐     ┌───────────┐  │
│  │Dashboard │────▶│ Backend  │────▶│PostgreSQL │  │
│  │  :3000   │     │  :8080   │     │   :5432   │  │
│  └──────────┘     └────┬─────┘     └───────────┘  │
│                        │                            │
│                        ▼                            │
│                  ┌──────────┐                       │
│                  │    AI    │                       │
│                  │  :8000   │                       │
│                  └──────────┘                       │
│                                                     │
│  Dev only:                                          │
│  ┌────────────┐  ┌────────────┐                    │
│  │MailCatcher │  │  PgAdmin   │                    │
│  │   :1080    │  │   :5050    │                    │
│  └────────────┘  └────────────┘                    │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Commandes Makefile

```bash
# Aide
make help

# Démarrage
make dev              # Dev avec MailCatcher + PgAdmin
make prod             # Production optimisée
make up               # Démarrage standard

# Monitoring
make ps               # Status services
make logs             # Logs (tous)
make logs-backend     # Logs backend
make stats            # Ressources

# Building
make build            # Build tous
make rebuild          # Rebuild + restart

# Database
make db-backup        # Backup PostgreSQL
make db-restore FILE=backup.sql
make db-psql          # Accès psql

# Maintenance
make clean            # Nettoyage
make update           # Update images
make health           # Health check
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **DOCKER_QUICKSTART.md** | Guide rapide 5 minutes |
| **DOCKER_DEPLOYMENT.md** | Guide complet (800+ lignes) |
| **DOCKER_COMPOSE_SUMMARY.md** | Récapitulatif technique |
| **Makefile** | Commandes simplifiées |

---

## 🌍 Environnements

### Development

```bash
# Avec Makefile
make dev

# Ou avec Docker Compose
docker-compose --profile dev up -d
```

**Services actifs:**
- Backend, AI, Dashboard, PostgreSQL
- ✅ **MailCatcher** (SMTP debug)
- ✅ **PgAdmin** (DB UI)

### Production

```bash
# Avec Makefile
make prod

# Ou avec Docker Compose
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

**Optimisations:**
- Resource limits augmentés
- PostgreSQL tuning
- Restart policies
- Volume bind mounts

---

## 📊 Services Détaillés

### PostgreSQL
- **Image:** `postgres:15-alpine`
- **Port:** 5432
- **Volume:** `db-data` (~500MB)
- **Health check:** `pg_isready`

### AI Service
- **Build:** `cybersensei-node-ai/`
- **Ports:** 8000 (API), 8080 (internal)
- **Volume:** `ai-models` (~4.4GB)
- **Resources:** 8GB RAM, 4 CPU
- **Model:** Mistral 7B Instruct Q4_K_M

### Backend
- **Build:** `cybersensei-node-backend/`
- **Port:** 8080
- **Volumes:** `backend-data`, `backend-logs`, `backend-updates`
- **Depends on:** postgres, ai
- **Health check:** `/actuator/health`

### Dashboard
- **Build:** `cybersensei-node-dashboard/`
- **Port:** 3000
- **Server:** Nginx
- **Depends on:** backend

### MailCatcher (dev)
- **Image:** `schickling/mailcatcher`
- **Ports:** 1025 (SMTP), 1080 (Web)
- **Profile:** `dev`

### PgAdmin (dev)
- **Image:** `dpage/pgadmin4`
- **Port:** 5050
- **Volume:** `pgadmin-data`
- **Profile:** `dev`

---

## 🔐 Configuration

### Variables Critiques (.env)

```bash
# À CHANGER en production
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key-256bits

# SMTP Production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=noreply@company.com
SMTP_PASSWORD=your-app-password

# Phishing
PHISHING_ENABLED=true
TRACKING_BASE_URL=https://cybersensei.company.com

# Sync
SYNC_ENABLED=true
TENANT_ID=your-company-id
```

### Ports Configurables

```bash
BACKEND_PORT=8080
DASHBOARD_PORT=3000
AI_PORT=8000
POSTGRES_PORT=5432
MAILCATCHER_WEB_PORT=1080
PGADMIN_PORT=5050
```

---

## 💾 Volumes

```bash
# Volumes créés automatiquement
docker volume ls | grep cybersensei

# Liste:
cybersensei-db-data         # PostgreSQL data (~500MB)
cybersensei-ai-models       # AI model (~4.4GB)
cybersensei-backend-data    # Application data (~100MB)
cybersensei-backend-logs    # Logs (~50MB)
cybersensei-backend-updates # Update packages (~100MB)
cybersensei-pgadmin-data    # PgAdmin config (~10MB)
```

### Backup

```bash
# Automatique
make db-backup

# Manuel
docker exec cybersensei-postgres pg_dump -U cybersensei cybersensei > backup-$(date +%Y%m%d).sql
```

### Restore

```bash
# Avec Makefile
make db-restore FILE=backup-20241124.sql

# Manuel
docker exec -i cybersensei-postgres psql -U cybersensei cybersensei < backup-20241124.sql
```

---

## 🚨 Troubleshooting

### Service ne démarre pas

```bash
# Vérifier logs
make logs-backend

# Vérifier health
make ps

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
        memory: 6G
```

### Backend ne peut pas se connecter à DB

```bash
# Attendre que PostgreSQL soit healthy
docker-compose ps postgres

# Restart
docker-compose restart postgres
sleep 10
docker-compose restart backend
```

### Port déjà utilisé

```bash
# Changer dans .env
BACKEND_PORT=8081

# Restart
docker-compose down && docker-compose up -d
```

---

## 📈 Monitoring

### Health Checks

```bash
# Automatique
make health

# Manuel
curl http://localhost:8080/actuator/health  # Backend
curl http://localhost:8000/health           # AI
curl http://localhost:3000                  # Dashboard
```

### Logs

```bash
# Tous les services
make logs

# Un service spécifique
make logs-backend
make logs-ai
make logs-dashboard
```

### Resources

```bash
# Stats en temps réel
make stats

# Ou
docker stats
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

### Reverse Proxy (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name cybersensei.company.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
    }

    location /api/ {
        proxy_pass http://localhost:8080/api/;
    }
}
```

---

## 🔄 Maintenance

### Update

```bash
# Avec Makefile
make update

# Manuel
docker-compose pull
docker-compose up -d --build
```

### Nettoyage

```bash
# Arrêter
docker-compose down

# Avec volumes (⚠️ Attention)
docker-compose down -v

# Nettoyage complet
make clean
```

---

## 🏆 Features

- ✅ **6 Services** intégrés (postgres, ai, backend, dashboard, mailcatcher, pgadmin)
- ✅ **Health checks** sur tous les services critiques
- ✅ **Depends_on** avec conditions (attente services healthy)
- ✅ **Resource limits** configurés (dev + prod)
- ✅ **6 Volumes** persistants nommés
- ✅ **Network isolé** pour sécurité
- ✅ **50+ Variables** d'environnement configurables
- ✅ **3 Environnements** (base, dev, prod)
- ✅ **Profiles** pour services optionnels
- ✅ **Makefile** avec 20+ commandes
- ✅ **Documentation** complète (1100+ lignes)

---

## 📦 Structure Complète

```
CyberSensei/
├── docker-compose.yml              # Configuration principale
├── docker-compose.dev.yml          # Override développement
├── docker-compose.prod.yml         # Override production
├── .env.template                   # Template environnement
├── Makefile                        # Commandes simplifiées
│
├── DOCKER_QUICKSTART.md            # Guide rapide
├── DOCKER_DEPLOYMENT.md            # Guide complet
├── DOCKER_COMPOSE_SUMMARY.md       # Récapitulatif
├── README_DOCKER.md                # Ce fichier
│
├── cybersensei-node-backend/       # Backend Spring Boot
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│
├── cybersensei-node-ai/            # AI Service
│   ├── Dockerfile
│   ├── server.py
│   └── requirements.txt
│
├── cybersensei-node-dashboard/     # Dashboard React
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│
└── ai-models/                      # AI models
    └── mistral-7b-instruct.Q4_K_M.gguf
```

---

## 🎯 Next Steps

1. ✅ Lire `DOCKER_QUICKSTART.md`
2. ✅ Configurer `.env`
3. ✅ Télécharger modèle AI
4. ✅ `make dev` pour démarrer
5. ✅ Accéder http://localhost:3000

---

## 📞 Support

- **Documentation:** Lire `DOCKER_DEPLOYMENT.md`
- **Troubleshooting:** Section dédiée dans docs
- **Health checks:** `make health`
- **Logs:** `make logs`

---

**Version**: 1.0.0  
**Date**: 2024-11-24  
**Status**: ✅ Production Ready  
**Total**: 1850+ lignes de configuration et documentation

---

## 📝 Changelog

### v1.0.0 (2024-11-24)
- ✅ Configuration Docker Compose complète
- ✅ Support dev/prod
- ✅ Health checks
- ✅ Resource limits
- ✅ Documentation complète
- ✅ Makefile avec 20+ commandes


