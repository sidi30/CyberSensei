# 🚀 CyberSensei - COMMENCEZ ICI

> **Guide de démarrage rapide pour lancer CyberSensei en 5 minutes**

---

## ✅ Étape 1 : Vérifier les Prérequis

```bash
# Vérifier Docker
docker --version
# Requis: 20.10+

# Vérifier Docker Compose
docker-compose --version
# Requis: 2.0+

# Vérifier les ressources
# Requis: 16GB RAM, 50GB disk, 4 CPU cores
```

---

## 📥 Étape 2 : Télécharger le Modèle AI

**⚠️ Important : Le modèle AI (4.4GB) doit être téléchargé manuellement**

```bash
# Créer le répertoire
mkdir -p ai-models

# Se déplacer dans le répertoire
cd ai-models

# Télécharger Mistral 7B Instruct (4.4GB)
wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf

# Renommer le fichier
mv mistral-7b-instruct-v0.2.Q4_K_M.gguf mistral-7b-instruct.Q4_K_M.gguf

# Retourner à la racine du projet
cd ..
```

**Alternative (curl):**

```bash
mkdir -p ai-models
cd ai-models
curl -L -o mistral-7b-instruct.Q4_K_M.gguf \
  https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf
cd ..
```

---

## ⚙️ Étape 3 : Configuration

```bash
# Copier le template d'environnement
cp .env.template .env

# (Optionnel) Éditer les variables
nano .env
```

**Pour une demo rapide, vous pouvez garder les valeurs par défaut !**

---

## 🚀 Étape 4 : Démarrer CyberSensei

### Option A : Avec Makefile (Recommandé)

```bash
# Mode développement (avec MailCatcher et PgAdmin)
make dev

# Ou mode production
make prod
```

### Option B : Avec Docker Compose

```bash
# Mode standard
docker-compose up -d

# Mode développement
docker-compose --profile dev up -d

# Mode production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## ⏳ Étape 5 : Attendre le Démarrage

```bash
# Vérifier le status des services
docker-compose ps

# OU avec Makefile
make ps
```

**Attendez que tous les services soient "healthy" :**

| Service | Status | Temps |
|---------|--------|-------|
| postgres | healthy | ~10s |
| ai | healthy | ~60s ⏰ |
| backend | healthy | ~30s |
| dashboard | healthy | ~5s |

```bash
# Suivre les logs
docker-compose logs -f

# OU avec Makefile
make logs
```

---

## 🌐 Étape 6 : Accéder aux Services

### Services Principaux

| Service | URL | Description |
|---------|-----|-------------|
| **Dashboard** | http://localhost:3000 | Interface utilisateur principale |
| **Backend API** | http://localhost:8080/api | API REST |
| **Swagger UI** | http://localhost:8080/swagger-ui.html | Documentation API |

### Services de Développement (si `--profile dev`)

| Service | URL | Description |
|---------|-----|-------------|
| **MailCatcher** | http://localhost:1080 | Interface de debug SMTP |
| **PgAdmin** | http://localhost:5050 | Interface de gestion PostgreSQL |

---

## 👤 Étape 7 : Se Connecter

### Dashboard (http://localhost:3000)

**Compte Manager (pour tester):**
- Email : `manager@cybersensei.io`
- Mot de passe : `demo123`

**Compte Employé (pour tester):**
- Email : `john.doe@cybersensei.io`
- Mot de passe : `demo123`

**Compte Admin (pour tester):**
- Email : `admin@cybersensei.io`
- Mot de passe : `admin123`

---

## 🎉 C'est Prêt !

Vous pouvez maintenant :

✅ **Explorer le Dashboard** - http://localhost:3000  
✅ **Tester l'API** - http://localhost:8080/swagger-ui.html  
✅ **Voir les emails** - http://localhost:1080 (dev only)  
✅ **Gérer la DB** - http://localhost:5050 (dev only)

---

## 📚 Documentation Complète

| Document | Description |
|----------|-------------|
| `README_DOCKER.md` | README principal |
| `DOCKER_QUICKSTART.md` | Guide rapide détaillé |
| `DOCKER_DEPLOYMENT.md` | Guide complet (800+ lignes) |
| `DOCKER_ARCHITECTURE.md` | Architecture détaillée |
| `DOCKER_COMPOSE_SUMMARY.md` | Récapitulatif technique |

---

## 🔧 Commandes Utiles

### Makefile (Recommandé)

```bash
make help          # Afficher l'aide
make dev           # Démarrer en mode dev
make prod          # Démarrer en mode production
make logs          # Voir les logs
make logs-backend  # Voir les logs backend
make ps            # Status des services
make health        # Vérifier la santé
make db-backup     # Backup de la base de données
make restart       # Redémarrer tout
make down          # Arrêter tout
make clean         # Nettoyage complet (⚠️ destructif)
```

### Docker Compose

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Logs
docker-compose logs -f

# Logs (un service)
docker-compose logs -f backend

# Status
docker-compose ps

# Redémarrer un service
docker-compose restart backend

# Rebuild
docker-compose build

# Rebuild + redémarrer
docker-compose up -d --build
```

---

## 🗄️ Base de Données

### Accès Direct (psql)

```bash
# Avec Makefile
make db-psql

# Ou directement
docker exec -it cybersensei-postgres psql -U cybersensei cybersensei
```

### Commandes SQL Utiles

```sql
-- Voir les tables
\dt

-- Voir les users
SELECT id, name, email, role FROM users;

-- Voir les exercises
SELECT id, topic, type, difficulty FROM exercises;

-- Voir les résultats
SELECT * FROM user_exercise_results;

-- Quitter
\q
```

### Backup / Restore

```bash
# Backup
make db-backup

# Restore
make db-restore FILE=backup-20241124.sql
```

---

## 🚨 Troubleshooting

### Service ne démarre pas

```bash
# Vérifier les logs
make logs-backend

# Ou
docker-compose logs backend

# Restart
docker-compose restart backend
```

### AI Service prend trop de temps

**C'est normal ! Le chargement du modèle (4.4GB) prend 1-2 minutes.**

```bash
# Suivre les logs AI
make logs-ai

# Attendre le message "Model loaded successfully"
```

### Port déjà utilisé

```bash
# Changer le port dans .env
nano .env

# Exemple:
BACKEND_PORT=8081
DASHBOARD_PORT=3001

# Redémarrer
docker-compose down
docker-compose up -d
```

### Mémoire insuffisante (AI OOM)

```bash
# Docker Desktop → Settings → Resources → Memory → 16GB
```

### Backend ne peut pas se connecter à PostgreSQL

```bash
# Vérifier que PostgreSQL est healthy
docker-compose ps postgres

# Attendre et redémarrer
docker-compose restart postgres
sleep 10
docker-compose restart backend
```

---

## 🧹 Nettoyage

### Arrêter les services

```bash
make down
# Ou
docker-compose down
```

### Supprimer les volumes (⚠️ Perte de données)

```bash
docker-compose down -v
```

### Nettoyage complet (⚠️ Destructif)

```bash
make clean
# Ou
docker system prune -a
```

---

## 🎯 Prochaines Étapes

1. ✅ Explorer le **Dashboard** (EmployeeTab, ManagerTab)
2. ✅ Tester l'**API** via Swagger
3. ✅ Lancer un **Quiz** de formation
4. ✅ Interroger le **CyberSensei AI**
5. ✅ Configurer les **Campagnes de Phishing**
6. ✅ Consulter les **Métriques Entreprise**
7. ✅ Gérer les **Utilisateurs**

---

## 📞 Besoin d'Aide ?

- **Logs complets** : `make logs` ou `docker-compose logs -f`
- **Health check** : `make health`
- **Status** : `make ps`
- **Documentation** : Lire `DOCKER_DEPLOYMENT.md`

---

## ✅ Checklist de Démarrage

- [ ] Docker & Docker Compose installés
- [ ] 16GB RAM disponibles
- [ ] Modèle AI téléchargé (4.4GB)
- [ ] `.env` configuré
- [ ] Services démarrés (`make dev` ou `docker-compose up -d`)
- [ ] Tous les services "healthy"
- [ ] Dashboard accessible (http://localhost:3000)
- [ ] Connexion réussie (manager@cybersensei.io / demo123)

---

**🎉 Félicitations ! CyberSensei est opérationnel !**

---

**Version**: 1.0.0  
**Date**: 2024-11-24  
**Status**: ✅ Ready to Use


