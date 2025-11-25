# 📁 Structure Complète du Projet

```
cybersensei-central-backend/
│
├── 📄 README.md                          # Documentation principale
├── 📄 ADMIN_GUIDE.md                     # Guide pour administrateurs
├── 📄 GUIDE_NODE_CLIENT.md               # Guide d'intégration pour nodes
├── 📄 PROJECT_STRUCTURE.md               # Ce fichier
│
├── 📄 package.json                       # Dépendances Node.js
├── 📄 tsconfig.json                      # Configuration TypeScript
├── 📄 nest-cli.json                      # Configuration NestJS
├── 📄 .eslintrc.js                       # Configuration ESLint
├── 📄 .prettierrc                        # Configuration Prettier
│
├── 📄 .env.example                       # Variables d'environnement (exemple)
├── 📄 .gitignore                         # Fichiers à ignorer par Git
├── 📄 .dockerignore                      # Fichiers à ignorer par Docker
│
├── 📄 Dockerfile                         # Image Docker production
├── 📄 docker-compose.yml                 # Orchestration complète (PostgreSQL, MongoDB, Backend)
│
└── src/                                  # Code source
    │
    ├── 📄 main.ts                        # Point d'entrée de l'application
    ├── 📄 app.module.ts                  # Module racine
    │
    ├── common/                           # Utilitaires partagés
    │   ├── decorators/                   # Décorateurs personnalisés
    │   │   ├── roles.decorator.ts        # @Roles(AdminRole.SUPERADMIN)
    │   │   └── current-user.decorator.ts # @CurrentUser()
    │   │
    │   └── guards/                       # Guards d'authentification
    │       ├── jwt-auth.guard.ts         # Guard JWT
    │       └── roles.guard.ts            # Guard RBAC
    │
    ├── entities/                         # Entités TypeORM (PostgreSQL)
    │   ├── tenant.entity.ts              # Tenants
    │   ├── license.entity.ts             # Licences
    │   ├── tenant-metric.entity.ts       # Métriques de télémétrie
    │   ├── admin-user.entity.ts          # Utilisateurs admin
    │   └── update-metadata.entity.ts     # Métadonnées des mises à jour
    │
    └── modules/                          # Modules fonctionnels
        │
        ├── admin-auth/                   # 🔐 Authentification Admin + RBAC
        │   ├── dto/
        │   │   ├── login.dto.ts          # DTO connexion
        │   │   └── create-admin.dto.ts   # DTO création admin
        │   ├── strategies/
        │   │   └── jwt.strategy.ts       # Stratégie JWT Passport
        │   ├── admin-auth.controller.ts  # POST /admin/auth/login
        │   ├── admin-auth.service.ts     # Logique métier auth
        │   └── admin-auth.module.ts      # Configuration module
        │
        ├── tenant/                       # 🏢 Gestion des Tenants
        │   ├── dto/
        │   │   ├── create-tenant.dto.ts  # DTO création tenant
        │   │   └── update-tenant.dto.ts  # DTO mise à jour tenant
        │   ├── tenant.controller.ts      # CRUD tenants
        │   │                             # GET /admin/tenants
        │   │                             # POST /admin/tenants
        │   │                             # GET /admin/tenants/:id
        │   │                             # PATCH /admin/tenants/:id
        │   │                             # DELETE /admin/tenants/:id
        │   │                             # GET /admin/tenants/:id/metrics
        │   │                             # GET /admin/tenants/:id/health
        │   ├── tenant.service.ts         # Logique métier tenants
        │   └── tenant.module.ts          # Configuration module
        │
        ├── license/                      # 🔑 Gestion des Licences
        │   ├── dto/
        │   │   ├── create-license.dto.ts # DTO création licence
        │   │   └── validate-license.dto.ts # DTO validation
        │   ├── license.controller.ts     # Gestion licences
        │   │                             # GET /api/license/validate (PUBLIC)
        │   │                             # POST /api/license
        │   │                             # GET /api/license
        │   │                             # GET /api/license/tenant/:tenantId
        │   │                             # PATCH /api/license/:id/revoke
        │   │                             # PATCH /api/license/:id/renew
        │   ├── license.service.ts        # Logique métier licences
        │   └── license.module.ts         # Configuration module
        │
        ├── update/                       # 📦 Gestion des Mises à Jour
        │   ├── dto/
        │   │   └── upload-update.dto.ts  # DTO upload update
        │   ├── schemas/
        │   │   └── update-file.schema.ts # Schéma MongoDB
        │   ├── update.controller.ts      # Gestion updates
        │   │                             # POST /admin/update/upload (SUPERADMIN)
        │   │                             # GET /admin/updates
        │   │                             # GET /admin/update/:id
        │   │                             # DELETE /admin/update/:id
        │   │                             # GET /update/check (PUBLIC)
        │   │                             # GET /update/download/:id (PUBLIC)
        │   ├── update.service.ts         # Logique métier + GridFS
        │   └── update.module.ts          # Configuration module
        │
        ├── telemetry/                    # 📊 Ingestion de Télémétrie
        │   ├── dto/
        │   │   └── telemetry.dto.ts      # DTO télémétrie
        │   ├── telemetry.controller.ts   # Endpoints télémétrie
        │   │                             # POST /telemetry (PUBLIC)
        │   │                             # GET /admin/telemetry/tenant/:id
        │   │                             # GET /admin/telemetry/tenant/:id/latest
        │   │                             # GET /admin/telemetry/tenant/:id/aggregated
        │   ├── telemetry.service.ts      # Logique métier télémétrie
        │   └── telemetry.module.ts       # Configuration module
        │
        └── global-metrics/               # 📈 Métriques Globales
            ├── global-metrics.controller.ts # Endpoints métriques globales
            │                             # GET /admin/global/summary
            │                             # GET /admin/global/top-risk
            │                             # GET /admin/global/usage-trends
            ├── global-metrics.service.ts # Logique métier métriques
            └── global-metrics.module.ts  # Configuration module
```

---

## 📊 Résumé des Statistiques

### Fichiers Générés
- **Total** : ~50 fichiers
- **TypeScript** : ~40 fichiers
- **Configuration** : 10 fichiers
- **Documentation** : 4 fichiers (README, guides)

### Lignes de Code
- **Entities** : ~300 lignes
- **Services** : ~1500 lignes
- **Controllers** : ~800 lignes
- **DTOs** : ~400 lignes
- **Total** : ~3000+ lignes de code TypeScript

### Modules Fonctionnels
1. ✅ Admin Authentication (JWT + RBAC)
2. ✅ Tenant Management
3. ✅ License Management
4. ✅ Update Management (MongoDB GridFS)
5. ✅ Telemetry Ingestion
6. ✅ Global Metrics

---

## 🗄️ Schéma de Base de Données

### PostgreSQL Tables

```sql
-- Tenants
tenants (
  id UUID PRIMARY KEY,
  name VARCHAR UNIQUE,
  contactEmail VARCHAR,
  licenseKey VARCHAR UNIQUE,
  active BOOLEAN,
  companyName VARCHAR,
  address VARCHAR,
  phone VARCHAR,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)

-- Licenses
licenses (
  id UUID PRIMARY KEY,
  key VARCHAR UNIQUE,
  tenantId UUID REFERENCES tenants(id),
  expiresAt TIMESTAMP,
  status ENUM('ACTIVE', 'EXPIRED', 'REVOKED', 'PENDING'),
  usageCount INTEGER,
  maxUsageCount INTEGER,
  notes TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)

-- Tenant Metrics
tenant_metrics (
  id UUID PRIMARY KEY,
  tenantId UUID REFERENCES tenants(id),
  uptime INTEGER,
  activeUsers INTEGER,
  exercisesCompletedToday INTEGER,
  aiLatency FLOAT,
  version VARCHAR,
  additionalData JSONB,
  timestamp TIMESTAMP
)

-- Admin Users
admin_users (
  id UUID PRIMARY KEY,
  name VARCHAR,
  email VARCHAR UNIQUE,
  passwordHash VARCHAR,
  role ENUM('SUPERADMIN', 'SUPPORT'),
  active BOOLEAN,
  lastLoginAt TIMESTAMP,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)

-- Update Metadata
updates_metadata (
  id UUID PRIMARY KEY,
  version VARCHAR UNIQUE,
  changelog TEXT,
  filename VARCHAR,
  fileSize BIGINT,
  mongoFileId VARCHAR,
  checksum VARCHAR,
  active BOOLEAN,
  metadata JSONB,
  createdAt TIMESTAMP
)
```

### MongoDB Collections

```
update_packages.files (GridFS)
update_packages.chunks (GridFS)
```

---

## 🔌 API Endpoints Résumé

### Publics (pour nodes)
```
GET  /api/license/validate?key=XXX
GET  /update/check?tenantId=XXX&version=X.X.X
GET  /update/download/:updateId
POST /telemetry
```

### Admin (JWT requis)
```
POST   /admin/auth/login
POST   /admin/auth/register (SUPERADMIN)
GET    /admin/auth/admins (SUPERADMIN)

GET    /admin/tenants
POST   /admin/tenants
GET    /admin/tenants/:id
PATCH  /admin/tenants/:id
DELETE /admin/tenants/:id (SUPERADMIN)
GET    /admin/tenants/:id/metrics
GET    /admin/tenants/:id/health

POST   /api/license
GET    /api/license
GET    /api/license/tenant/:tenantId
PATCH  /api/license/:id/revoke (SUPERADMIN)
PATCH  /api/license/:id/renew

POST   /admin/update/upload (SUPERADMIN)
GET    /admin/updates
GET    /admin/update/:id
DELETE /admin/update/:id (SUPERADMIN)

GET    /admin/telemetry/tenant/:tenantId
GET    /admin/telemetry/tenant/:tenantId/latest
GET    /admin/telemetry/tenant/:tenantId/aggregated

GET    /admin/global/summary
GET    /admin/global/top-risk
GET    /admin/global/usage-trends
```

---

## 🚀 Commandes Rapides

### Installation
```bash
npm install
```

### Développement
```bash
npm run start:dev
```

### Production (Docker)
```bash
docker-compose up -d
```

### Tests
```bash
npm run test
```

### Build
```bash
npm run build
```

---

## 📚 Documentation Disponible

1. **README.md** - Documentation principale du projet
2. **ADMIN_GUIDE.md** - Guide complet pour administrateurs
3. **GUIDE_NODE_CLIENT.md** - Guide d'intégration pour les nodes clients
4. **PROJECT_STRUCTURE.md** - Structure du projet (ce fichier)

---

## ✅ Fonctionnalités Implémentées

- [x] Architecture NestJS modulaire
- [x] TypeScript strict
- [x] PostgreSQL + TypeORM
- [x] MongoDB + GridFS
- [x] JWT Authentication
- [x] RBAC (SUPERADMIN, SUPPORT)
- [x] Swagger/OpenAPI documentation
- [x] Multi-tenant pattern
- [x] License management avec validation
- [x] Update management avec MongoDB GridFS
- [x] Telemetry ingestion
- [x] Global metrics et analytics
- [x] Health checks
- [x] Docker + Docker Compose
- [x] Documentation complète

---

**🎉 Projet Complet et Prêt à l'Emploi !**

