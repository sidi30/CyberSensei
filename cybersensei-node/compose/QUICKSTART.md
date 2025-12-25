# CyberSensei Node - Quick Start Guide

## 🚀 Installation rapide

### Prérequis

- **Docker Desktop** installé et lancé
  - Windows: https://docs.docker.com/desktop/install/windows-install/
  - macOS: https://docs.docker.com/desktop/install/mac-install/
  - Linux: https://docs.docker.com/engine/install/

### Option 1: Installation automatique (Recommandé)

#### Sur Windows (PowerShell)

```powershell
cd cybersensei-node\scripts
.\install.ps1
```

#### Sur Linux/macOS

```bash
cd cybersensei-node/scripts
./install.sh
```

Le script va :
- ✅ Vérifier Docker
- ✅ Créer le fichier .env
- ✅ Télécharger les images
- ✅ Construire les services
- ✅ Démarrer l'application

### Option 2: Installation manuelle

```bash
# 1. Aller dans le dossier compose
cd cybersensei-node/compose

# 2. Créer le fichier .env
cp ENV_TEMPLATE .env

# 3. Éditer .env et changer les mots de passe
# IMPORTANT: Changez au minimum POSTGRES_PASSWORD et JWT_SECRET

# 4. Démarrer les services
docker compose up -d

# 5. Vérifier le statut
docker compose ps
```

---

## 🌐 Accès aux services

Une fois les services démarrés :

| Service | URL | Description |
|---------|-----|-------------|
| **Dashboard** | http://localhost:3000 | Interface manager/admin |
| **Backend API** | http://localhost:8080 | API REST |
| **API Docs** | http://localhost:8080/swagger-ui.html | Documentation OpenAPI |
| **Health Check** | http://localhost:8080/actuator/health | Status des services |

### Credentials par défaut

```
Username: admin@cybersensei.local
Password: admin123
```

⚠️ **IMPORTANT**: Changez ces credentials en production !

---

## 📊 Outils de debug (optionnel)

Pour activer les outils de debug (MailCatcher + PgAdmin) :

```bash
docker compose --profile dev up -d
```

| Service | URL | Credentials |
|---------|-----|-------------|
| **MailCatcher** | http://localhost:1080 | Aucun |
| **PgAdmin** | http://localhost:5050 | admin@cybersensei.io / admin123 |

---

## 📝 Commandes utiles

### Voir les logs

```bash
# Tous les services
docker compose logs -f

# Un service spécifique
docker compose logs -f backend
docker compose logs -f ai
docker compose logs -f dashboard
```

### Redémarrer

```bash
# Redémarrer tous les services
docker compose restart

# Redémarrer un service spécifique
docker compose restart backend
```

### Arrêter

```bash
# Arrêter sans supprimer les volumes
docker compose down

# Arrêter et supprimer les volumes (ATTENTION: perte de données)
docker compose down -v
```

### Mettre à jour

```bash
# Récupérer les dernières images
docker compose pull

# Reconstruire et redémarrer
docker compose build
docker compose up -d
```

### Vérifier le statut

```bash
# Voir tous les conteneurs
docker compose ps

# Voir l'utilisation des ressources
docker stats

# Vérifier la santé du backend
curl http://localhost:8080/actuator/health
```

---

## 🔧 Configuration

### Fichier .env principal

Éditez `cybersensei-node/compose/.env` :

```bash
# Base de données
POSTGRES_PASSWORD=votre_mot_de_passe_secure

# Backend
JWT_SECRET=votre_secret_jwt_tres_long_256_bits_minimum

# SMTP (pour les emails de phishing)
SMTP_HOST=smtp.votreentreprise.com
SMTP_PORT=587
SMTP_USERNAME=cybersensei@votreentreprise.com
SMTP_PASSWORD=votre_mot_de_passe_smtp

# URL de tracking (remplacer par votre domaine)
TRACKING_BASE_URL=https://cybersensei.votreentreprise.local
```

### Services internes uniquement

Par défaut, seuls les ports **8080** (backend) et **3000** (dashboard) sont exposés.

Les services internes (PostgreSQL, AI) ne sont **pas** accessibles depuis l'extérieur.

Pour les exposer (développement uniquement) :

```bash
# Éditez docker-compose.yml et décommentez les lignes "ports:"
# pour postgres et ai
```

---

## 🐛 Troubleshooting

### Backend ne démarre pas

```bash
# Vérifier les logs
docker compose logs backend

# Vérifier que Postgres est healthy
docker compose ps postgres

# Redémarrer
docker compose restart backend
```

### AI service lent au démarrage

Le service AI télécharge le modèle Mistral 7B (~4 GB) au premier démarrage.

```bash
# Suivre le téléchargement
docker compose logs -f ai

# Cela peut prendre 5-15 minutes selon votre connexion
```

### Dashboard affiche "Cannot connect to API"

```bash
# Vérifier que le backend est healthy
curl http://localhost:8080/actuator/health

# Si le backend est down, le redémarrer
docker compose restart backend

# Vider le cache du navigateur et recharger
```

### Erreur "port already in use"

Un autre processus utilise déjà le port 8080 ou 3000.

```bash
# Changer les ports dans .env
BACKEND_PORT=8081
DASHBOARD_PORT=3001

# Redémarrer
docker compose down
docker compose up -d
```

### Espace disque insuffisant

```bash
# Nettoyer les conteneurs et images non utilisés
docker system prune -a

# Vérifier l'espace utilisé par les volumes
docker system df
```

---

## 📦 Volumes de données

Les données sont stockées dans des volumes Docker persistants :

| Volume | Contenu |
|--------|---------|
| `cybersensei-db-data` | Base de données PostgreSQL |
| `cybersensei-ai-models` | Modèles IA (Mistral 7B) |
| `cybersensei-backend-data` | Données backend (uploads, cache) |
| `cybersensei-backend-logs` | Logs backend |
| `cybersensei-backend-updates` | Packs de mise à jour |

### Backup des données

```bash
# Backup de la base de données
docker compose exec postgres pg_dump -U cybersensei cybersensei > backup.sql

# Restore
docker compose exec -T postgres psql -U cybersensei cybersensei < backup.sql
```

---

## 🔒 Sécurité - Production Checklist

Avant de déployer en production :

- [ ] Changer tous les mots de passe dans `.env`
- [ ] Générer un JWT_SECRET aléatoire de 256+ bits
- [ ] Configurer un vrai serveur SMTP
- [ ] Utiliser HTTPS (reverse proxy nginx/traefik)
- [ ] Ne pas exposer les ports internes (postgres, ai)
- [ ] Activer les backups automatiques
- [ ] Configurer les logs centralisés
- [ ] Limiter les ressources CPU/RAM si nécessaire
- [ ] Mettre à jour régulièrement (`docker compose pull`)

---

## 📚 Documentation complète

Pour plus de détails :

- `DOCKER_QUICKSTART.md` - Ce fichier
- `DOCKER_DEPLOYMENT.md` - Déploiement production avancé
- `DOCKER_ARCHITECTURE.md` - Architecture technique
- `../backend/README.md` - Documentation backend
- `../dashboard/README.md` - Documentation dashboard
- `../ai/README.md` - Documentation AI

---

## 🆘 Support

En cas de problème :

1. Vérifier les logs : `docker compose logs -f`
2. Vérifier le statut : `docker compose ps`
3. Redémarrer les services : `docker compose restart`
4. Consulter la documentation complète
5. Ouvrir une issue sur GitHub

---

**Version**: 1.0.0  
**Date**: 21 décembre 2024  
**Status**: Production Ready ✅

