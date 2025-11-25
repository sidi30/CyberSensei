# 🚀 CyberSensei - Docker Quick Start

## ⚡ Démarrage en 5 Minutes

### 1. Prérequis

```bash
# Vérifier Docker
docker --version
# Docker version 20.10+

# Vérifier Docker Compose
docker-compose --version
# Docker Compose version 2.0+

# Ressources minimales
- 16GB RAM
- 50GB disk space
- 4 CPU cores
```

### 2. Télécharger le Modèle AI

```bash
# Créer le répertoire
mkdir -p ai-models

# Télécharger Mistral 7B Instruct (4.4GB)
cd ai-models
wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf

# Renommer
mv mistral-7b-instruct-v0.2.Q4_K_M.gguf mistral-7b-instruct.Q4_K_M.gguf

cd ..
```

### 3. Configuration

```bash
# Copier le template
cp .env.template .env

# Éditer les variables (optionnel pour demo)
nano .env
```

### 4. Démarrer CyberSensei

```bash
# Build et démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

### 5. Attendre le Démarrage

```bash
# Vérifier le status (attendre que tous soient "healthy")
docker-compose ps

# Services à attendre:
# ✅ postgres - healthy
# ✅ ai - healthy (peut prendre 1-2 min)
# ✅ backend - healthy (attends postgres + ai)
# ✅ dashboard - healthy
```

### 6. Accéder aux Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Dashboard** | http://localhost:3000 | manager@cybersensei.io / demo123 |
| **Backend API** | http://localhost:8080/api | - |
| **Swagger** | http://localhost:8080/swagger-ui.html | - |

---

## 🔧 Mode Développement

### Avec MailCatcher et PgAdmin

```bash
# Démarrer en mode dev
docker-compose --profile dev up -d

# Ou
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

**Services additionnels:**
- **MailCatcher** (SMTP debug): http://localhost:1080
- **PgAdmin** (DB UI): http://localhost:5050

---

## 📊 Commandes Utiles

```bash
# Status des services
docker-compose ps

# Logs (tous)
docker-compose logs -f

# Logs (un service)
docker-compose logs -f backend

# Redémarrer un service
docker-compose restart backend

# Arrêter tout
docker-compose down

# Arrêter et supprimer volumes
docker-compose down -v
```

---

## 🗄️ Base de Données

### Accès Direct

```bash
# psql
docker exec -it cybersensei-postgres psql -U cybersensei cybersensei

# Voir les tables
\dt

# Voir les users
SELECT * FROM users;

# Exit
\q
```

### Backup

```bash
# Backup
docker exec cybersensei-postgres pg_dump -U cybersensei cybersensei > backup.sql

# Restore
docker exec -i cybersensei-postgres psql -U cybersensei cybersensei < backup.sql
```

---

## 🚨 Troubleshooting

### Backend ne démarre pas

```bash
# Vérifier les logs
docker-compose logs backend

# Vérifier PostgreSQL
docker-compose ps postgres

# Restart
docker-compose restart postgres
docker-compose restart backend
```

### AI Service OOM

```bash
# Augmenter la mémoire Docker
# Docker Desktop → Settings → Resources → Memory → 16GB

# Ou réduire les ressources AI
# Éditer docker-compose.yml → ai → deploy → resources → limits → memory: 6G
```

### Port déjà utilisé

```bash
# Changer le port dans .env
BACKEND_PORT=8081
DASHBOARD_PORT=3001

# Redémarrer
docker-compose down
docker-compose up -d
```

---

## 🔄 Update

```bash
# Pull nouvelles images
docker-compose pull

# Rebuild
docker-compose build

# Restart
docker-compose up -d
```

---

## 🧹 Nettoyage

```bash
# Arrêter et supprimer containers
docker-compose down

# Supprimer volumes
docker-compose down -v

# Nettoyer Docker
docker system prune -a
```

---

## 📦 Structure des Services

```
┌─────────────────────────────────────────┐
│           Docker Network                │
│        (cybersensei-network)            │
├─────────────────────────────────────────┤
│                                         │
│  Dashboard (3000) ──▶ Backend (8080)   │
│                           │             │
│                           ├──▶ DB      │
│                           │    (5432)   │
│                           │             │
│                           └──▶ AI      │
│                                (8000)   │
│                                         │
│  [Dev only]:                            │
│  - MailCatcher (1080)                   │
│  - PgAdmin (5050)                       │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎯 Next Steps

1. ✅ Connectez-vous au Dashboard: http://localhost:3000
2. ✅ Explorez l'API: http://localhost:8080/swagger-ui.html
3. ✅ Configurez SMTP pour phishing (Settings)
4. ✅ Créez des utilisateurs
5. ✅ Lancez des campagnes de formation

---

## 📚 Documentation Complète

- `DOCKER_DEPLOYMENT.md` - Guide complet
- `README.md` - Documentation générale
- `docker-compose.yml` - Configuration Docker

---

**Status**: ✅ Ready to Use  
**Version**: 1.0.0  
**Date**: 2024-11-24


