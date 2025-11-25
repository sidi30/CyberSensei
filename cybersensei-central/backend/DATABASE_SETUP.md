# 🚀 Database Setup Guide - Quick Start

Guide de démarrage rapide pour la configuration de la base de données.

## ⚡ Installation Rapide (Docker)

### Étape 1 : Démarrer les Services

```bash
cd cybersensei-central-backend

# Démarrer toutes les bases de données + UIs
docker-compose -f docker-compose.database.yml up -d
```

**Services lancés** :
- ✅ PostgreSQL (port 5432)
- ✅ pgAdmin (port 5050) - http://localhost:5050
- ✅ MongoDB (port 27017)
- ✅ Mongo Express (port 8081) - http://localhost:8081
- ✅ Backend NestJS (port 3000) - http://localhost:3000

### Étape 2 : Vérifier les Services

```bash
# Vérifier que tous les containers sont démarrés
docker-compose -f docker-compose.database.yml ps

# Voir les logs
docker-compose -f docker-compose.database.yml logs -f
```

### Étape 3 : Exécuter les Migrations

```bash
# Installer les dépendances (si pas déjà fait)
npm install

# Exécuter les migrations TypeORM
npm run migration:run
```

### Étape 4 : (Optionnel) Charger les Données de Test

```bash
# Charger des données de démonstration
npm run db:seed
```

**Données créées** :
- 3 utilisateurs admin
- 5 tenants (dont 4 actifs)
- 5 licences (dont 1 expirée)
- 7 jours de métriques
- 3 versions de mises à jour
- Exemples d'error logs

---

## 🎨 Accéder aux Interfaces d'Administration

### pgAdmin (PostgreSQL)

**URL** : http://localhost:5050

**Login** :
- Email : `admin@cybersensei.com`
- Password : `admin123`

**Serveur pré-configuré** :
1. Dans pgAdmin, le serveur "CyberSensei Central PostgreSQL" devrait être visible
2. Cliquer dessus et entrer le mot de passe : `cybersensei123`
3. Naviguer : Servers → CyberSensei Central → Databases → cybersensei_central

### Mongo Express (MongoDB)

**URL** : http://localhost:8081

**Login** :
- Username : `admin`
- Password : `admin123`

**Database** : `cybersensei_updates`

---

## 🗄️ Structure de la Base de Données

### PostgreSQL - 6 Tables

| Table | Description | Records (avec seed) |
|-------|-------------|---------------------|
| `admin_users` | Utilisateurs administrateurs | 3 |
| `tenants` | Clients/Tenants | 5 |
| `licenses` | Licences d'utilisation | 5 |
| `tenant_metrics` | Métriques de télémétrie | ~112 (7 jours × 4 tenants × 4/jour) |
| `updates_metadata` | Métadonnées des mises à jour | 3 |
| `error_logs` | Journalisation des erreurs | 5 |

### MongoDB - GridFS

| Collection | Description |
|------------|-------------|
| `update_packages.files` | Métadonnées des fichiers ZIP |
| `update_packages.chunks` | Chunks binaires des fichiers |

---

## 🔧 Commandes Utiles

### Migrations TypeORM

```bash
# Voir l'état des migrations
npm run migration:show

# Exécuter les migrations
npm run migration:run

# Rollback de la dernière migration
npm run migration:revert

# Générer une nouvelle migration (après modification d'entités)
npm run migration:generate -- src/migrations/NomDeLaMigration

# Créer une migration vide
npm run migration:create -- src/migrations/NomDeLaMigration
```

### Docker

```bash
# Démarrer les services
docker-compose -f docker-compose.database.yml up -d

# Arrêter les services
docker-compose -f docker-compose.database.yml down

# Supprimer les volumes (⚠️ supprime les données)
docker-compose -f docker-compose.database.yml down -v

# Voir les logs d'un service spécifique
docker-compose -f docker-compose.database.yml logs -f postgres
docker-compose -f docker-compose.database.yml logs -f mongodb
docker-compose -f docker-compose.database.yml logs -f backend

# Redémarrer un service
docker-compose -f docker-compose.database.yml restart postgres
```

### Base de Données

```bash
# Se connecter à PostgreSQL
docker exec -it cybersensei-postgres psql -U cybersensei -d cybersensei_central

# Se connecter à MongoDB
docker exec -it cybersensei-mongodb mongosh -u root -p mongoroot123 --authenticationDatabase admin

# Exécuter un script SQL
docker exec -i cybersensei-postgres psql -U cybersensei -d cybersensei_central < database/seed-data.sql

# Maintenance de la base de données
npm run db:maintenance
```

---

## 📊 Requêtes de Vérification

### PostgreSQL

```sql
-- Compter les records de chaque table
SELECT 'admin_users' as table, COUNT(*) FROM admin_users
UNION ALL
SELECT 'tenants', COUNT(*) FROM tenants
UNION ALL
SELECT 'licenses', COUNT(*) FROM licenses
UNION ALL
SELECT 'tenant_metrics', COUNT(*) FROM tenant_metrics
UNION ALL
SELECT 'updates_metadata', COUNT(*) FROM updates_metadata
UNION ALL
SELECT 'error_logs', COUNT(*) FROM error_logs;

-- Voir les tenants actifs
SELECT name, "companyName", "licenseKey", active FROM tenants WHERE active = true;

-- Voir les dernières métriques
SELECT 
  t.name,
  tm."activeUsers",
  tm."aiLatency",
  tm.timestamp
FROM tenant_metrics tm
JOIN tenants t ON tm."tenantId" = t.id
ORDER BY tm.timestamp DESC
LIMIT 10;

-- Voir les erreurs non résolues
SELECT level, source, message, timestamp
FROM error_logs
WHERE resolved = false
ORDER BY timestamp DESC;
```

### MongoDB (dans Mongo Express ou mongosh)

```javascript
// Utiliser la base de données
use cybersensei_updates;

// Lister les fichiers GridFS
db.getCollection('update_packages.files').find();

// Compter les chunks
db.getCollection('update_packages.chunks').count();

// Statistiques
db.getCollection('update_packages.files').stats();
```

---

## 🔐 Credentials par Défaut

**⚠️ À CHANGER EN PRODUCTION !**

### PostgreSQL
- Host : `localhost:5432`
- User : `cybersensei`
- Password : `cybersensei123`
- Database : `cybersensei_central`

### pgAdmin
- Email : `admin@cybersensei.com`
- Password : `admin123`

### MongoDB
- Host : `localhost:27017`
- Root User : `root`
- Root Password : `mongoroot123`
- App User : `cybersensei`
- App Password : `cybersensei123`
- Database : `cybersensei_updates`

### Mongo Express
- Username : `admin`
- Password : `admin123`

### Admin Application
- Email : `admin@cybersensei.com`
- Password : `Admin@123456`

---

## 🛠️ Résolution de Problèmes

### Problème : PostgreSQL ne démarre pas

```bash
# Vérifier les logs
docker logs cybersensei-postgres

# Vérifier les permissions sur le volume
docker volume inspect cybersensei-central-backend_postgres_data

# Réinitialiser complètement (⚠️ supprime les données)
docker-compose -f docker-compose.database.yml down -v
docker-compose -f docker-compose.database.yml up -d postgres
```

### Problème : MongoDB refuse les connexions

```bash
# Vérifier que l'authentification fonctionne
docker exec -it cybersensei-mongodb mongosh -u root -p mongoroot123 --authenticationDatabase admin

# Réinitialiser MongoDB
docker-compose -f docker-compose.database.yml down
docker volume rm cybersensei-central-backend_mongodb_data
docker-compose -f docker-compose.database.yml up -d mongodb
```

### Problème : Les migrations échouent

```bash
# Vérifier l'état
npm run migration:show

# Vérifier la connexion à la base
docker exec cybersensei-postgres psql -U cybersensei -d cybersensei_central -c "SELECT version();"

# Rollback et réessayer
npm run migration:revert
npm run migration:run
```

### Problème : pgAdmin ne se connecte pas

1. Vérifier que PostgreSQL est démarré : `docker ps | grep postgres`
2. Dans pgAdmin, utiliser `postgres` comme hostname (pas `localhost`)
3. Le mot de passe est : `cybersensei123`

### Problème : Les ports sont déjà utilisés

```bash
# Trouver ce qui utilise le port
lsof -i :5432  # PostgreSQL
lsof -i :27017 # MongoDB
lsof -i :5050  # pgAdmin
lsof -i :8081  # Mongo Express

# Modifier les ports dans docker-compose.database.yml
# Par exemple : "5433:5432" au lieu de "5432:5432"
```

---

## 📚 Prochaines Étapes

1. ✅ Vérifier que tous les services sont démarrés
2. ✅ Exécuter les migrations : `npm run migration:run`
3. ✅ (Optionnel) Charger les données de test : `npm run db:seed`
4. ✅ Tester l'API : http://localhost:3000/api
5. ✅ Explorer les données dans pgAdmin et Mongo Express
6. ✅ Lire [DATABASE_README.md](DATABASE_README.md) pour plus de détails

---

## 📞 Support

Pour plus d'informations :
- **Documentation complète** : [DATABASE_README.md](DATABASE_README.md)
- **Guide principal** : [README.md](README.md)
- **Guide admin** : [ADMIN_GUIDE.md](ADMIN_GUIDE.md)

---

**✅ Votre base de données est prête !**

