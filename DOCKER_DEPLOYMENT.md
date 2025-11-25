# 🐳 CyberSensei - Docker Deployment Guide

## 📋 Table des Matières

- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Environnements](#environnements)
- [Commandes Utiles](#commandes-utiles)
- [Volumes & Persistance](#volumes--persistance)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CyberSensei Stack                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Dashboard  │───▶│   Backend    │───▶│  PostgreSQL  │  │
│  │ (React/Nginx)│    │ (Spring Boot)│    │   (DB)       │  │
│  │   Port 3000 │    │   Port 8080  │    │  Port 5432   │  │
│  └─────────────┘    └──────┬───────┘    └──────────────┘  │
│                            │                                │
│                            ▼                                │
│                     ┌──────────────┐                        │
│                     │  AI Service  │                        │
│                     │ (Mistral 7B) │                        │
│                     │  Port 8000   │                        │
│                     └──────────────┘                        │
│                                                             │
│  Optional (Dev):                                            │
│  ┌──────────────┐    ┌──────────────┐                      │
│  │ MailCatcher  │    │   PgAdmin    │                      │
│  │   Port 1080  │    │  Port 5050   │                      │
│  └──────────────┘    └──────────────┘                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Prérequis

- Docker 20.10+
- Docker Compose 2.0+
- 16GB RAM minimum (AI service)
- 50GB disk space

### 2. Installation

```bash
# Clone le repository
git clone https://github.com/your-org/cybersensei.git
cd cybersensei

# Copier le fichier d'environment
cp .env.example .env

# Éditer les variables d'environnement
nano .env
```

### 3. Démarrage (Production)

```bash
# Build et démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Vérifier le status
docker-compose ps
```

### 4. Accès aux Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Dashboard** | http://localhost:3000 | manager@cybersensei.io / demo123 |
| **Backend API** | http://localhost:8080/api | - |
| **Swagger UI** | http://localhost:8080/swagger-ui.html | - |
| **AI Service** | http://localhost:8000 | - |
| **MailCatcher** | http://localhost:1080 | (dev only) |
| **PgAdmin** | http://localhost:5050 | admin@cybersensei.io / admin123 |

---

## ⚙️ Configuration

### Fichier `.env`

```bash
# Database
POSTGRES_PASSWORD=your-secure-password-here

# JWT
JWT_SECRET=your-super-secret-jwt-key-at-least-256-bits

# SMTP (Production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=noreply@company.com
SMTP_PASSWORD=your-app-password

# AI Model
AI_MODEL_PATH=/app/models/mistral-7b-instruct.Q4_K_M.gguf

# Phishing
PHISHING_ENABLED=true
TRACKING_BASE_URL=https://cybersensei.company.com

# Sync
SYNC_ENABLED=true
CENTRAL_URL=https://central.cybersensei.io
TENANT_ID=your-company-id
```

### Télécharger le Modèle AI

```bash
# Créer le répertoire
mkdir -p ai-models

# Télécharger Mistral 7B Instruct (Q4_K_M - 4.4GB)
cd ai-models
wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf

# Renommer
mv mistral-7b-instruct-v0.2.Q4_K_M.gguf mistral-7b-instruct.Q4_K_M.gguf

cd ..
```

---

## 🌍 Environnements

### Development

```bash
# Démarrer avec MailCatcher et PgAdmin
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Ou avec profiles
docker-compose --profile dev up -d
```

**Services actifs:**
- Backend (avec debug logs)
- PostgreSQL
- AI Service
- Dashboard (avec hot reload)
- **MailCatcher** (SMTP debug)
- **PgAdmin** (DB UI)

### Production

```bash
# Démarrer en production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

**Optimisations:**
- Resource limits configurés
- Performance tuning PostgreSQL
- SMTP production
- Sync enabled
- Restart policies

---

## 🔧 Commandes Utiles

### Gestion des Services

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Redémarrer un service
docker-compose restart backend

# Voir les logs
docker-compose logs -f backend

# Voir les logs de tous les services
docker-compose logs -f

# Status des services
docker-compose ps

# Ressources utilisées
docker stats
```

### Build & Update

```bash
# Rebuild un service
docker-compose build backend

# Rebuild sans cache
docker-compose build --no-cache backend

# Pull les nouvelles images
docker-compose pull

# Rebuild et redémarrer
docker-compose up -d --build
```

### Database

```bash
# Backup
docker exec cybersensei-postgres pg_dump -U cybersensei cybersensei > backup.sql

# Restore
docker exec -i cybersensei-postgres psql -U cybersensei cybersensei < backup.sql

# Accès psql
docker exec -it cybersensei-postgres psql -U cybersensei cybersensei

# Voir les tables
docker exec -it cybersensei-postgres psql -U cybersensei cybersensei -c "\dt"
```

### Maintenance

```bash
# Voir les volumes
docker volume ls

# Nettoyer les volumes non utilisés
docker volume prune

# Nettoyer tout (⚠️ Attention !)
docker system prune -a --volumes

# Voir l'espace disque
docker system df
```

---

## 💾 Volumes & Persistance

### Volumes Créés

```bash
# Voir les volumes
docker volume ls | grep cybersensei

# Volumes:
- cybersensei-db-data         # PostgreSQL data
- cybersensei-ai-models       # AI models
- cybersensei-backend-data    # Backend data
- cybersensei-backend-logs    # Backend logs
- cybersensei-backend-updates # Update packages
- cybersensei-pgadmin-data    # PgAdmin config
```

### Backup des Volumes

```bash
# Backup db-data
docker run --rm \
  -v cybersensei-db-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/db-backup-$(date +%Y%m%d).tar.gz /data

# Backup backend-data
docker run --rm \
  -v cybersensei-backend-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/backend-backup-$(date +%Y%m%d).tar.gz /data
```

### Restore des Volumes

```bash
# Restore db-data
docker run --rm \
  -v cybersensei-db-data:/data \
  -v $(pwd):/backup \
  alpine sh -c "cd /data && tar xzf /backup/db-backup-20241124.tar.gz --strip 1"
```

---

## 🚨 Troubleshooting

### Service ne démarre pas

```bash
# Vérifier les logs
docker-compose logs backend

# Vérifier la santé
docker-compose ps

# Restart avec logs
docker-compose up backend

# Inspecter le container
docker inspect cybersensei-backend
```

### Backend ne peut pas se connecter à PostgreSQL

**Symptômes:**
```
Connection refused: postgres:5432
```

**Solutions:**
```bash
# Vérifier que PostgreSQL est healthy
docker-compose ps postgres

# Vérifier les logs PostgreSQL
docker-compose logs postgres

# Attendre que PostgreSQL soit prêt
docker-compose up -d postgres
# Attendre 10-20 secondes
docker-compose up -d backend
```

### AI Service OOM (Out of Memory)

**Symptômes:**
```
Killed
```

**Solutions:**
```bash
# Augmenter la mémoire Docker Desktop
# Settings → Resources → Memory → 16GB minimum

# Ou réduire les ressources AI dans docker-compose.yml
deploy:
  resources:
    limits:
      memory: 6G  # Au lieu de 8G
```

### MailCatcher ne démarre pas

**Solution:**
```bash
# Utiliser le profile dev
docker-compose --profile dev up -d

# Ou dev compose file
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Dashboard CORS Errors

**Solution:**
Vérifier `VITE_API_URL` dans `.env`:
```bash
# Development
VITE_API_URL=http://localhost:8080/api

# Production
VITE_API_URL=https://api.cybersensei.company.com/api
```

### Volumes pleins

```bash
# Voir l'espace
docker system df

# Nettoyer logs
docker-compose exec backend sh -c "rm -rf /app/logs/*"

# Nettoyer images non utilisées
docker image prune -a

# Nettoyer volumes non utilisés
docker volume prune
```

---

## 🔐 Sécurité Production

### Checklist

- [ ] Changer `POSTGRES_PASSWORD`
- [ ] Changer `JWT_SECRET` (256+ bits)
- [ ] Configurer SMTP production
- [ ] HTTPS activé (reverse proxy)
- [ ] Firewall configuré
- [ ] Backups automatiques
- [ ] Monitoring actif
- [ ] Logs centralisés
- [ ] Resource limits définis
- [ ] Health checks configurés

### Reverse Proxy (Nginx/Traefik)

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name cybersensei.company.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Dashboard
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📊 Monitoring

### Health Checks

```bash
# Backend
curl http://localhost:8080/actuator/health

# AI
curl http://localhost:8000/health

# Dashboard
curl http://localhost:3000

# PostgreSQL
docker exec cybersensei-postgres pg_isready -U cybersensei
```

### Logs Centralisés

```bash
# Tous les logs
docker-compose logs -f

# Logs depuis 1h
docker-compose logs --since 1h

# Logs avec timestamps
docker-compose logs -f -t

# Export logs
docker-compose logs --no-color > logs-$(date +%Y%m%d).log
```

---

## 🔄 Updates & Maintenance

### Update des Images

```bash
# Pull nouvelles images
docker-compose pull

# Rebuild avec nouvelles images
docker-compose up -d --build

# Vérifier versions
docker-compose images
```

### Rolling Update (Zero Downtime)

```bash
# 1. Scale up
docker-compose up -d --scale backend=2

# 2. Wait for health check
sleep 30

# 3. Scale down old
docker-compose up -d --scale backend=1
```

---

## 📦 Services Optionnels

### Activer MailCatcher (Dev)

```bash
docker-compose --profile dev up -d mailcatcher

# Accès: http://localhost:1080
```

### Activer PgAdmin (Dev)

```bash
docker-compose --profile dev up -d pgadmin

# Accès: http://localhost:5050
# Login: admin@cybersensei.io / admin123
```

---

## 🎯 Best Practices

1. **Toujours utiliser `.env`** pour les secrets
2. **Backups réguliers** des volumes `db-data` et `backend-data`
3. **Monitoring** des ressources (CPU, RAM, Disk)
4. **Health checks** activés sur tous les services
5. **Resource limits** en production
6. **Logs rotation** configurée
7. **HTTPS** en production (reverse proxy)
8. **Network isolation** (utiliser networks Docker)

---

## 📚 Ressources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Boot Docker](https://spring.io/guides/gs/spring-boot-docker/)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)
- [Nginx Docker](https://hub.docker.com/_/nginx)

---

**Version**: 1.0.0  
**Date**: 2024-11-24  
**Status**: ✅ Production Ready


