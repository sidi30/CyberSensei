# 🗄️ CyberSensei Central - Database Layer

Documentation complète de la couche base de données.

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL                               │
│              (Métadonnées & Relations)                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   tenants    │  │   licenses   │  │ admin_users  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │tenant_metrics│  │updates_meta  │  │ error_logs   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     MongoDB                                 │
│              (Stockage de Fichiers)                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           update_packages (GridFS)                 │    │
│  │  ┌─────────────────┐  ┌──────────────────┐        │    │
│  │  │  .files         │  │  .chunks         │        │    │
│  │  │  (metadata)     │  │  (binary data)   │        │    │
│  │  └─────────────────┘  └──────────────────┘        │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Démarrage Rapide

### Option 1 : Docker Compose (Recommandé)

```bash
# Démarrer toutes les bases de données + UIs admin
docker-compose -f docker-compose.database.yml up -d
```

**Services démarrés** :
- PostgreSQL sur le port `5432`
- pgAdmin sur `http://localhost:5050`
- MongoDB sur le port `27017`
- Mongo Express sur `http://localhost:8081`
- Backend NestJS sur `http://localhost:3000`

### Option 2 : Installation Manuelle

```bash
# Installer PostgreSQL 15
# Installer MongoDB 7

# Créer la base de données PostgreSQL
createdb -U postgres cybersensei_central

# Exécuter les migrations
npm run migration:run
```

---

## 📋 Tables PostgreSQL

### 1. **tenants** - Gestion des Clients

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique (PK) |
| `name` | VARCHAR | Nom unique du tenant |
| `contactEmail` | VARCHAR | Email de contact |
| `licenseKey` | VARCHAR | Clé de licence unique |
| `active` | BOOLEAN | Statut actif/inactif |
| `companyName` | VARCHAR | Nom de la société |
| `address` | VARCHAR | Adresse |
| `phone` | VARCHAR | Téléphone |
| `createdAt` | TIMESTAMP | Date de création |
| `updatedAt` | TIMESTAMP | Date de mise à jour |

**Indexes** :
- PRIMARY KEY sur `id`
- UNIQUE sur `name`
- UNIQUE sur `licenseKey`

**Relations** :
- `licenses` (1:N)
- `tenant_metrics` (1:N)

---

### 2. **licenses** - Gestion des Licences

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique (PK) |
| `key` | VARCHAR | Clé de licence unique |
| `tenantId` | UUID | Référence au tenant (FK) |
| `expiresAt` | TIMESTAMP | Date d'expiration |
| `status` | ENUM | ACTIVE, EXPIRED, REVOKED, PENDING |
| `usageCount` | INTEGER | Compteur d'utilisation |
| `maxUsageCount` | INTEGER | Limite d'utilisation |
| `notes` | TEXT | Notes administratives |
| `createdAt` | TIMESTAMP | Date de création |
| `updatedAt` | TIMESTAMP | Date de mise à jour |

**Indexes** :
- PRIMARY KEY sur `id`
- UNIQUE sur `key`
- INDEX sur `tenantId`
- INDEX sur `status`

**Relations** :
- Appartient à `tenants` (N:1)

---

### 3. **tenant_metrics** - Télémétrie

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique (PK) |
| `tenantId` | UUID | Référence au tenant (FK) |
| `uptime` | INTEGER | Uptime en secondes |
| `activeUsers` | INTEGER | Utilisateurs actifs |
| `exercisesCompletedToday` | INTEGER | Exercices complétés |
| `aiLatency` | DOUBLE | Latence IA (ms) |
| `version` | VARCHAR | Version du node |
| `additionalData` | JSONB | Données supplémentaires |
| `timestamp` | TIMESTAMP | Horodatage |

**Indexes** :
- PRIMARY KEY sur `id`
- INDEX composite sur `(tenantId, timestamp)`
- INDEX sur `timestamp`

**Relations** :
- Appartient à `tenants` (N:1)

---

### 4. **admin_users** - Utilisateurs Administrateurs

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique (PK) |
| `name` | VARCHAR | Nom complet |
| `email` | VARCHAR | Email unique |
| `passwordHash` | VARCHAR | Hash bcrypt du mot de passe |
| `role` | ENUM | SUPERADMIN, SUPPORT |
| `active` | BOOLEAN | Statut actif/inactif |
| `lastLoginAt` | TIMESTAMP | Dernière connexion |
| `createdAt` | TIMESTAMP | Date de création |
| `updatedAt` | TIMESTAMP | Date de mise à jour |

**Indexes** :
- PRIMARY KEY sur `id`
- UNIQUE sur `email`

**Sécurité** :
- Mot de passe hashé avec bcrypt (10 rounds)
- JWT pour l'authentification

---

### 5. **updates_metadata** - Métadonnées des Mises à Jour

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique (PK) |
| `version` | VARCHAR | Version unique (ex: 1.2.0) |
| `changelog` | TEXT | Notes de version |
| `filename` | VARCHAR | Nom du fichier ZIP |
| `fileSize` | BIGINT | Taille en octets |
| `mongoFileId` | VARCHAR | ID du fichier dans GridFS |
| `checksum` | VARCHAR | Somme de contrôle (SHA-256) |
| `active` | BOOLEAN | Disponible au téléchargement |
| `metadata` | JSONB | Métadonnées supplémentaires |
| `createdAt` | TIMESTAMP | Date de création |

**Indexes** :
- PRIMARY KEY sur `id`
- UNIQUE sur `version`

**Relations** :
- Référence le fichier dans MongoDB GridFS via `mongoFileId`

---

### 6. **error_logs** - Journalisation des Erreurs

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique (PK) |
| `tenantId` | UUID | Référence au tenant (optionnel) |
| `level` | ENUM | INFO, WARNING, ERROR, CRITICAL |
| `source` | ENUM | NODE, BACKEND, SYSTEM |
| `message` | TEXT | Message d'erreur |
| `stack` | TEXT | Stack trace |
| `endpoint` | VARCHAR | Endpoint API concerné |
| `method` | VARCHAR | Méthode HTTP |
| `statusCode` | INTEGER | Code HTTP |
| `userId` | VARCHAR | Utilisateur concerné |
| `ipAddress` | VARCHAR | Adresse IP |
| `userAgent` | VARCHAR | User Agent |
| `metadata` | JSONB | Métadonnées supplémentaires |
| `context` | JSONB | Contexte de l'erreur |
| `timestamp` | TIMESTAMP | Horodatage |
| `resolved` | BOOLEAN | Erreur résolue |
| `resolvedAt` | TIMESTAMP | Date de résolution |
| `resolvedBy` | VARCHAR | Résolu par |
| `resolutionNotes` | TEXT | Notes de résolution |

**Indexes** :
- PRIMARY KEY sur `id`
- INDEX composite sur `(tenantId, timestamp)`
- INDEX composite sur `(level, timestamp)`
- INDEX composite sur `(source, timestamp)`

**Usage** :
- Logging centralisé des erreurs
- Debugging et monitoring
- Alertes automatiques sur CRITICAL

---

## 🍃 Collections MongoDB

### **update_packages** (GridFS)

MongoDB GridFS est utilisé pour stocker les fichiers ZIP de mise à jour.

#### Collection `update_packages.files`

| Champ | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | ID unique du fichier |
| `filename` | String | Nom du fichier |
| `length` | Number | Taille en octets |
| `chunkSize` | Number | Taille des chunks (256KB par défaut) |
| `uploadDate` | Date | Date d'upload |
| `metadata` | Object | Métadonnées personnalisées |

**Indexes** :
- `filename` (1)
- `uploadDate` (-1)

#### Collection `update_packages.chunks`

| Champ | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | ID unique du chunk |
| `files_id` | ObjectId | Référence au fichier parent |
| `n` | Number | Numéro du chunk |
| `data` | Binary | Données binaires |

**Indexes** :
- UNIQUE composite sur `(files_id, n)`

---

## 🔧 Migrations TypeORM

### Créer une Nouvelle Migration

```bash
# Générer une migration basée sur les changements d'entités
npm run migration:generate -- src/migrations/MigrationName

# Créer une migration vide
npm run migration:create -- src/migrations/MigrationName
```

### Exécuter les Migrations

```bash
# Exécuter toutes les migrations en attente
npm run migration:run

# Revenir en arrière (rollback)
npm run migration:revert

# Afficher le statut des migrations
npm run migration:show
```

### Migrations Disponibles

1. **AddUuidExtension** - Active l'extension UUID dans PostgreSQL
2. **InitialSchema** - Crée toutes les tables et relations

---

## 🎛️ Interfaces d'Administration

### pgAdmin (PostgreSQL)

**URL** : http://localhost:5050

**Credentials** :
- Email : `admin@cybersensei.com`
- Password : `admin123`

**Serveur pré-configuré** :
- Nom : CyberSensei Central PostgreSQL
- Host : postgres
- Port : 5432
- Database : cybersensei_central
- Username : cybersensei
- Password : cybersensei123

**Fonctionnalités** :
- Exécuter des requêtes SQL
- Visualiser les données
- Gérer les index
- Créer des backups
- Monitoring en temps réel

---

### Mongo Express (MongoDB)

**URL** : http://localhost:8081

**Credentials** :
- Username : `admin`
- Password : `admin123`

**Fonctionnalités** :
- Explorer les collections
- Visualiser les fichiers GridFS
- Exécuter des requêtes
- Import/Export de données

---

## 📊 Schéma de Base de Données (ERD)

```
┌─────────────────┐
│  admin_users    │
│─────────────────│
│ id (PK)         │
│ name            │
│ email (UNIQUE)  │
│ passwordHash    │
│ role            │
│ active          │
└─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│    tenants      │◄───────┤    licenses     │
│─────────────────│   1:N   │─────────────────│
│ id (PK)         │         │ id (PK)         │
│ name (UNIQUE)   │         │ key (UNIQUE)    │
│ licenseKey      │         │ tenantId (FK)   │
│ active          │         │ expiresAt       │
│ ...             │         │ status          │
└─────────────────┘         └─────────────────┘
       ▲
       │ 1:N
       │
┌─────────────────┐
│ tenant_metrics  │
│─────────────────│
│ id (PK)         │
│ tenantId (FK)   │
│ uptime          │
│ activeUsers     │
│ ...             │
│ timestamp       │
└─────────────────┘

┌─────────────────┐         ┌─────────────────────┐
│updates_metadata │────────►│ MongoDB GridFS      │
│─────────────────│         │─────────────────────│
│ id (PK)         │         │ update_packages     │
│ version (UNIQUE)│         │  ├─ .files          │
│ mongoFileId ────┼────────►│  └─ .chunks         │
│ changelog       │         └─────────────────────┘
│ ...             │
└─────────────────┘

┌─────────────────┐
│   error_logs    │
│─────────────────│
│ id (PK)         │
│ tenantId        │
│ level           │
│ source          │
│ message         │
│ ...             │
│ timestamp       │
└─────────────────┘
```

---

## 🔍 Requêtes SQL Utiles

### Statistiques Globales

```sql
-- Nombre total de tenants actifs
SELECT COUNT(*) FROM tenants WHERE active = true;

-- Nombre de licences par statut
SELECT status, COUNT(*) 
FROM licenses 
GROUP BY status;

-- Métriques des dernières 24h
SELECT 
  tenantId,
  COUNT(*) as metrics_count,
  AVG(activeUsers) as avg_users,
  AVG(aiLatency) as avg_latency
FROM tenant_metrics 
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY tenantId;

-- Top 10 tenants par utilisation
SELECT 
  t.name,
  t.companyName,
  COUNT(tm.id) as metrics_count
FROM tenants t
LEFT JOIN tenant_metrics tm ON t.id = tm.tenantId
GROUP BY t.id, t.name, t.companyName
ORDER BY metrics_count DESC
LIMIT 10;
```

### Erreurs Critiques Non Résolues

```sql
SELECT 
  level,
  source,
  message,
  timestamp,
  tenantId
FROM error_logs 
WHERE level = 'CRITICAL' 
  AND resolved = false
ORDER BY timestamp DESC
LIMIT 100;
```

### Licences Expirant Bientôt

```sql
SELECT 
  l.key,
  l.expiresAt,
  t.name as tenant_name,
  t.contactEmail,
  (l.expiresAt - NOW()) as time_remaining
FROM licenses l
JOIN tenants t ON l.tenantId = t.id
WHERE l.status = 'ACTIVE'
  AND l.expiresAt IS NOT NULL
  AND l.expiresAt <= NOW() + INTERVAL '30 days'
ORDER BY l.expiresAt ASC;
```

### Tenants Inactifs (Sans Métriques)

```sql
SELECT 
  t.id,
  t.name,
  t.contactEmail,
  MAX(tm.timestamp) as last_metric
FROM tenants t
LEFT JOIN tenant_metrics tm ON t.id = tm.tenantId
WHERE t.active = true
GROUP BY t.id, t.name, t.contactEmail
HAVING MAX(tm.timestamp) < NOW() - INTERVAL '1 hour'
   OR MAX(tm.timestamp) IS NULL
ORDER BY last_metric ASC NULLS FIRST;
```

---

## 💾 Backup & Restore

### PostgreSQL

#### Backup

```bash
# Backup complet
docker exec cybersensei-postgres pg_dump -U cybersensei cybersensei_central > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup avec compression
docker exec cybersensei-postgres pg_dump -U cybersensei cybersensei_central | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

#### Restore

```bash
# Restore depuis un fichier SQL
docker exec -i cybersensei-postgres psql -U cybersensei cybersensei_central < backup.sql

# Restore depuis un fichier compressé
gunzip < backup.sql.gz | docker exec -i cybersensei-postgres psql -U cybersensei cybersensei_central
```

### MongoDB

#### Backup

```bash
# Backup de toute la base de données
docker exec cybersensei-mongodb mongodump --db cybersensei_updates --out /backup

# Copier le backup hors du container
docker cp cybersensei-mongodb:/backup ./mongodb_backup_$(date +%Y%m%d)
```

#### Restore

```bash
# Restore de la base de données
docker exec cybersensei-mongodb mongorestore --db cybersensei_updates /backup/cybersensei_updates

# Ou depuis l'hôte
docker exec -i cybersensei-mongodb mongorestore --db cybersensei_updates --archive < backup.archive
```

---

## 📈 Performance & Optimisation

### Indexes PostgreSQL

Tous les indexes sont créés automatiquement par les migrations :

- **tenant_metrics** : Index composite sur `(tenantId, timestamp)`
- **error_logs** : Index composites sur `(tenantId, timestamp)`, `(level, timestamp)`, `(source, timestamp)`
- **licenses** : Index sur `tenantId` et `status`

### Maintenance PostgreSQL

```sql
-- Analyser les statistiques
ANALYZE;

-- Vacuum complet
VACUUM FULL;

-- Vérifier les index manquants
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY abs(correlation) ASC;
```

### Performance MongoDB

```javascript
// Vérifier les statistiques GridFS
db.getCollection('update_packages.files').stats();

// Compacter la collection
db.runCommand({ compact: 'update_packages.files' });

// Analyser les requêtes lentes
db.setProfilingLevel(2);
db.system.profile.find().sort({ ts: -1 }).limit(10);
```

---

## 🔐 Sécurité

### Bonnes Pratiques

1. **Credentials** :
   - Changez TOUS les mots de passe par défaut en production
   - Utilisez des secrets forts (32+ caractères)
   - Stockez les credentials dans des variables d'environnement

2. **Accès Réseau** :
   - N'exposez PAS les ports des bases de données publiquement
   - Utilisez des firewalls
   - Accédez via VPN en production

3. **Backups** :
   - Automatisez les backups quotidiens
   - Testez régulièrement les restores
   - Stockez les backups chiffrés

4. **Monitoring** :
   - Surveillez les tentatives de connexion échouées
   - Alertes sur les requêtes lentes
   - Logs d'audit activés

### Variables d'Environnement à Sécuriser

```env
# À CHANGER EN PRODUCTION !
POSTGRES_PASSWORD=
MONGO_INITDB_ROOT_PASSWORD=
PGADMIN_DEFAULT_PASSWORD=
ME_CONFIG_BASICAUTH_PASSWORD=
JWT_SECRET=
```

---

## 🧪 Tests de Base de Données

### Vérifier la Connexion PostgreSQL

```bash
docker exec cybersensei-postgres psql -U cybersensei -d cybersensei_central -c "SELECT version();"
```

### Vérifier la Connexion MongoDB

```bash
docker exec cybersensei-mongodb mongosh --eval "db.adminCommand('ping')"
```

### Tester GridFS

```javascript
// Dans mongo-express ou mongosh
use cybersensei_updates;

// Lister les fichiers GridFS
db.getCollection('update_packages.files').find();

// Vérifier l'intégrité des chunks
db.getCollection('update_packages.chunks').count();
```

---

## 📞 Support

### Problèmes Courants

**PostgreSQL ne démarre pas** :
```bash
# Vérifier les logs
docker logs cybersensei-postgres

# Réinitialiser le volume
docker-compose down -v
docker-compose up -d
```

**MongoDB refuse les connexions** :
```bash
# Vérifier l'authentification
docker exec cybersensei-mongodb mongosh -u root -p mongoroot123 --authenticationDatabase admin
```

**Migrations échouent** :
```bash
# Vérifier l'état des migrations
npm run migration:show

# Rollback et réessayer
npm run migration:revert
npm run migration:run
```

---

## 📚 Ressources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MongoDB GridFS Documentation](https://www.mongodb.com/docs/manual/core/gridfs/)
- [TypeORM Migrations](https://typeorm.io/migrations)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)

---

**✅ Votre couche base de données est prête pour la production !**

