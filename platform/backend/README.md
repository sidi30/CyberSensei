# 🛡️ CyberSensei Central Backend

Backend SaaS multi-tenant pour la gestion centralisée des nodes CyberSensei. Cette plateforme permet de gérer les tenants, les licences, les mises à jour et la télémétrie de tous les nodes déployés.

## 📋 Table des matières

- [Architecture](#architecture)
- [Stack Technique](#stack-technique)
- [Fonctionnalités](#fonctionnalités)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [API Documentation](#api-documentation)
- [Authentification des Nodes](#authentification-des-nodes)
- [Workflow de Mise à Jour](#workflow-de-mise-à-jour)
- [Structure du Projet](#structure-du-projet)
- [Modules](#modules)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CyberSensei Nodes                        │
│              (Déployés chez les clients)                    │
└────────────────┬───────────────────────┬────────────────────┘
                 │                       │
                 │ License Check         │ Update Check
                 │ Telemetry Push        │ Update Download
                 │                       │
┌────────────────▼───────────────────────▼────────────────────┐
│              CyberSensei Central Backend                    │
│                   (Cette application)                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   NestJS     │  │  PostgreSQL  │  │    MongoDB      │  │
│  │   Backend    │  │  (Metadata)  │  │ (Update Files)  │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                 │
                 │ JWT Auth
                 │ Admin Dashboard
                 │
┌────────────────▼────────────────────────────────────────────┐
│              Admin Web Interface                            │
│         (SUPERADMIN / SUPPORT Users)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Stack Technique

- **Framework**: NestJS 10
- **Language**: TypeScript 5
- **Database (Metadata)**: PostgreSQL 15 avec TypeORM
- **Database (Files)**: MongoDB 7 avec GridFS
- **Authentication**: JWT (JsonWebToken)
- **Authorization**: RBAC (Role-Based Access Control)
- **Documentation**: Swagger/OpenAPI
- **Container**: Docker & Docker Compose

---

## ⚡ Fonctionnalités

### 🏢 Gestion des Tenants
- CRUD complet des tenants
- Génération automatique de clés de licence
- Activation/désactivation des tenants
- Dashboard de santé par tenant

### 🔑 Gestion des Licences
- Génération de clés de licence uniques
- Validation de licences (endpoint public pour les nodes)
- Expiration automatique
- Révocation de licences
- Compteur d'utilisation

### 📦 Gestion des Mises à Jour
- Upload de packages ZIP via admin
- Stockage dans MongoDB GridFS
- Vérification de mises à jour disponibles
- Téléchargement sécurisé des packages
- Versioning et changelog

### 📊 Télémétrie
- Ingestion de métriques en temps réel
- Stockage des données : uptime, utilisateurs actifs, exercices complétés, latence AI
- Historique complet par tenant
- Métriques agrégées

### 📈 Métriques Globales
- Vue d'ensemble de la plateforme
- Identification des tenants à risque
- Tendances d'utilisation
- Statistiques globales

### 👥 Authentification Admin
- Connexion JWT sécurisée
- RBAC avec deux rôles :
  - **SUPERADMIN** : accès complet
  - **SUPPORT** : accès lecture/support

---

## 📥 Installation

### Prérequis

- Node.js 18+
- PostgreSQL 15+
- MongoDB 7+
- npm ou yarn

### Installation manuelle

```bash
# Cloner le repository
git clone <repository-url>
cd cybersensei-central-backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos configurations
```

### Installation avec Docker (Recommandé)

```bash
# Construire et démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f backend
```

---

## ⚙️ Configuration

Créez un fichier `.env` à la racine du projet :

```env
# Application
NODE_ENV=development
PORT=3000

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=cybersensei
POSTGRES_PASSWORD=cybersensei123
POSTGRES_DB=cybersensei_central

# MongoDB
MONGODB_URI=mongodb://localhost:27017/cybersensei_updates

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Admin Default User (créé automatiquement au démarrage)
ADMIN_EMAIL=admin@cybersensei.com
ADMIN_PASSWORD=Admin@123456
```

**⚠️ IMPORTANT** : Changez `JWT_SECRET` et `ADMIN_PASSWORD` en production !

---

## 🚀 Démarrage

### Mode Développement

```bash
# Démarrer en mode watch
npm run start:dev
```

### Mode Production

```bash
# Build
npm run build

# Démarrer
npm run start:prod
```

### Avec Docker Compose

```bash
# Démarrer tous les services (PostgreSQL, MongoDB, Backend)
docker-compose up -d

# Arrêter
docker-compose down

# Supprimer les volumes (⚠️ supprime les données)
docker-compose down -v
```

L'application sera disponible sur :
- **API** : http://localhost:3000
- **Swagger** : http://localhost:3000/api

---

## 📚 API Documentation

La documentation complète de l'API est disponible via Swagger :

**URL** : http://localhost:3000/api

### Endpoints Principaux

#### 🔐 Authentification Admin

```
POST /admin/auth/login
POST /admin/auth/register (SUPERADMIN only)
GET  /admin/auth/admins (SUPERADMIN only)
```

#### 🏢 Tenants

```
GET    /admin/tenants
POST   /admin/tenants
GET    /admin/tenants/:id
PATCH  /admin/tenants/:id
DELETE /admin/tenants/:id (SUPERADMIN only)
GET    /admin/tenants/:id/metrics
GET    /admin/tenants/:id/health
```

#### 🔑 Licences

```
GET   /api/license/validate?key=XXX (Public - pour nodes)
POST  /api/license
GET   /api/license
GET   /api/license/tenant/:tenantId
PATCH /api/license/:id/revoke
PATCH /api/license/:id/renew
```

#### 📦 Mises à Jour

```
POST /admin/update/upload (SUPERADMIN only)
GET  /admin/updates
GET  /admin/update/:id
DELETE /admin/update/:id (SUPERADMIN only)

GET  /update/check?tenantId=XXX&version=1.0.0 (Public - pour nodes)
GET  /update/download/:updateId (Public - pour nodes)
```

#### 📊 Télémétrie

```
POST /telemetry (Public - pour nodes)
GET  /admin/telemetry/tenant/:tenantId
GET  /admin/telemetry/tenant/:tenantId/latest
GET  /admin/telemetry/tenant/:tenantId/aggregated?days=7
```

#### 📈 Métriques Globales

```
GET /admin/global/summary
GET /admin/global/top-risk
GET /admin/global/usage-trends?days=30
```

---

## 🔒 Authentification des Nodes

Les nodes CyberSensei doivent s'authentifier auprès du backend central pour :
1. Valider leur licence
2. Vérifier les mises à jour
3. Envoyer de la télémétrie

### Méthode 1 : Validation de Licence (Recommandé)

#### Étape 1 : Obtenir une clé de licence

1. Un admin crée un tenant via l'interface admin
2. Une clé de licence est automatiquement générée (format : `XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX`)
3. Cette clé est fournie au client lors du déploiement

#### Étape 2 : Valider la licence au démarrage du node

```bash
# Exemple avec curl
curl -X GET "http://central-backend.cybersensei.com/api/license/validate?key=XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
```

**Réponse en cas de succès** :
```json
{
  "valid": true,
  "tenantId": "uuid-du-tenant",
  "tenantName": "Mon Entreprise",
  "expiresAt": "2025-12-31T23:59:59Z",
  "usageCount": 42,
  "maxUsageCount": 1000
}
```

**Réponse en cas d'erreur** :
```json
{
  "statusCode": 400,
  "message": "Licence expirée"
}
```

#### Étape 3 : Stocker le tenantId

Le node doit stocker le `tenantId` retourné pour l'utiliser dans les requêtes suivantes (télémétrie, mises à jour).

---

### Exemple d'implémentation dans un Node (Node.js)

```javascript
// node-client.js
const axios = require('axios');
const fs = require('fs');

const CENTRAL_BACKEND_URL = 'http://central-backend.cybersensei.com';
const LICENSE_KEY = 'XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX';
const CONFIG_FILE = './node-config.json';

class CyberSenseiNodeClient {
  constructor() {
    this.tenantId = null;
    this.currentVersion = '1.0.0';
    this.loadConfig();
  }

  loadConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      this.tenantId = config.tenantId;
    }
  }

  saveConfig() {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ tenantId: this.tenantId }));
  }

  async validateLicense() {
    try {
      const response = await axios.get(
        `${CENTRAL_BACKEND_URL}/api/license/validate`,
        { params: { key: LICENSE_KEY } }
      );

      if (response.data.valid) {
        this.tenantId = response.data.tenantId;
        this.saveConfig();
        console.log(`✅ Licence valide pour : ${response.data.tenantName}`);
        return true;
      }
    } catch (error) {
      console.error('❌ Erreur de validation de licence:', error.response?.data || error.message);
      return false;
    }
  }

  async sendTelemetry(metrics) {
    if (!this.tenantId) {
      console.error('❌ Pas de tenantId - licence non validée');
      return false;
    }

    try {
      const response = await axios.post(
        `${CENTRAL_BACKEND_URL}/telemetry`,
        {
          tenantId: this.tenantId,
          uptime: metrics.uptime,
          activeUsers: metrics.activeUsers,
          exercisesCompletedToday: metrics.exercisesCompletedToday,
          aiLatency: metrics.aiLatency,
          version: this.currentVersion,
        }
      );

      console.log('✅ Télémétrie envoyée');
      return true;
    } catch (error) {
      console.error('❌ Erreur d\'envoi de télémétrie:', error.message);
      return false;
    }
  }

  async checkForUpdates() {
    if (!this.tenantId) {
      console.error('❌ Pas de tenantId - licence non validée');
      return null;
    }

    try {
      const response = await axios.get(
        `${CENTRAL_BACKEND_URL}/update/check`,
        {
          params: {
            tenantId: this.tenantId,
            version: this.currentVersion,
          }
        }
      );

      if (response.data.updateAvailable) {
        console.log(`🔔 Mise à jour disponible : ${response.data.latestVersion}`);
        console.log(`📝 Changelog : ${response.data.changelog}`);
        return response.data;
      } else {
        console.log('✅ Version à jour');
        return null;
      }
    } catch (error) {
      console.error('❌ Erreur de vérification de mise à jour:', error.message);
      return null;
    }
  }

  async downloadUpdate(updateId, outputPath) {
    try {
      const response = await axios.get(
        `${CENTRAL_BACKEND_URL}/update/download/${updateId}`,
        { responseType: 'stream' }
      );

      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(`✅ Mise à jour téléchargée : ${outputPath}`);
          resolve(true);
        });
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('❌ Erreur de téléchargement:', error.message);
      return false;
    }
  }

  async initialize() {
    // 1. Valider la licence au démarrage
    const licenseValid = await this.validateLicense();
    if (!licenseValid) {
      throw new Error('Impossible de démarrer sans licence valide');
    }

    // 2. Vérifier les mises à jour
    const update = await this.checkForUpdates();
    if (update) {
      await this.downloadUpdate(update.updateId, './update.zip');
      // TODO: Appliquer la mise à jour
    }

    // 3. Démarrer l'envoi périodique de télémétrie
    setInterval(() => {
      const metrics = this.collectMetrics();
      this.sendTelemetry(metrics);
    }, 5 * 60 * 1000); // Toutes les 5 minutes
  }

  collectMetrics() {
    // Collecter les métriques du node
    return {
      uptime: process.uptime(),
      activeUsers: 42, // Remplacer par la vraie valeur
      exercisesCompletedToday: 15, // Remplacer par la vraie valeur
      aiLatency: 250.5, // Remplacer par la vraie valeur
    };
  }
}

// Utilisation
const client = new CyberSenseiNodeClient();
client.initialize().catch(console.error);
```

---

## 🔄 Workflow de Mise à Jour

### Côté Admin

1. **Upload du package de mise à jour**
   ```bash
   curl -X POST http://localhost:3000/admin/update/upload \
     -H "Authorization: Bearer <JWT_TOKEN>" \
     -F "version=1.2.0" \
     -F "changelog=Correctifs de sécurité et nouvelles fonctionnalités" \
     -F "file=@update-1.2.0.zip"
   ```

2. Le fichier est stocké dans MongoDB GridFS
3. Les métadonnées sont stockées dans PostgreSQL

### Côté Node

1. **Vérifier si une mise à jour est disponible**
   ```bash
   curl "http://localhost:3000/update/check?tenantId=<TENANT_ID>&version=1.0.0"
   ```

2. **Télécharger la mise à jour**
   ```bash
   curl "http://localhost:3000/update/download/<UPDATE_ID>" -o update.zip
   ```

3. **Appliquer la mise à jour**
   - Décompresser le ZIP
   - Arrêter le service
   - Remplacer les fichiers
   - Redémarrer le service

---

## 📁 Structure du Projet

```
cybersensei-central-backend/
├── src/
│   ├── common/                    # Utilitaires partagés
│   │   ├── decorators/           # Décorateurs personnalisés
│   │   │   ├── roles.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   └── guards/               # Guards d'authentification
│   │       ├── jwt-auth.guard.ts
│   │       └── roles.guard.ts
│   │
│   ├── entities/                 # Entités TypeORM (PostgreSQL)
│   │   ├── tenant.entity.ts
│   │   ├── license.entity.ts
│   │   ├── tenant-metric.entity.ts
│   │   ├── admin-user.entity.ts
│   │   └── update-metadata.entity.ts
│   │
│   ├── modules/                  # Modules fonctionnels
│   │   ├── admin-auth/          # Authentification admin + RBAC
│   │   │   ├── dto/
│   │   │   ├── strategies/
│   │   │   ├── admin-auth.controller.ts
│   │   │   ├── admin-auth.service.ts
│   │   │   └── admin-auth.module.ts
│   │   │
│   │   ├── tenant/              # Gestion des tenants
│   │   │   ├── dto/
│   │   │   ├── tenant.controller.ts
│   │   │   ├── tenant.service.ts
│   │   │   └── tenant.module.ts
│   │   │
│   │   ├── license/             # Gestion des licences
│   │   │   ├── dto/
│   │   │   ├── license.controller.ts
│   │   │   ├── license.service.ts
│   │   │   └── license.module.ts
│   │   │
│   │   ├── update/              # Gestion des mises à jour
│   │   │   ├── dto/
│   │   │   ├── schemas/
│   │   │   ├── update.controller.ts
│   │   │   ├── update.service.ts
│   │   │   └── update.module.ts
│   │   │
│   │   ├── telemetry/           # Ingestion de télémétrie
│   │   │   ├── dto/
│   │   │   ├── telemetry.controller.ts
│   │   │   ├── telemetry.service.ts
│   │   │   └── telemetry.module.ts
│   │   │
│   │   └── global-metrics/      # Métriques globales
│   │       ├── global-metrics.controller.ts
│   │       ├── global-metrics.service.ts
│   │       └── global-metrics.module.ts
│   │
│   ├── app.module.ts            # Module racine
│   └── main.ts                  # Point d'entrée
│
├── .env.example                 # Variables d'environnement (exemple)
├── .gitignore
├── .dockerignore
├── Dockerfile                   # Image Docker production
├── docker-compose.yml           # Orchestration complète
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md                    # Ce fichier
```

---

## 🔐 Sécurité

### Bonnes Pratiques

1. **JWT Secret** : Utilisez un secret fort et unique en production
2. **HTTPS** : Déployez toujours derrière un reverse proxy avec SSL (nginx, Caddy)
3. **Rate Limiting** : Ajoutez du rate limiting sur les endpoints publics
4. **Validation** : Toutes les entrées sont validées avec `class-validator`
5. **RBAC** : Permissions strictes basées sur les rôles
6. **Logs** : Surveillez les logs pour détecter les anomalies

### Variables d'Environnement Sensibles

Ne commitez JAMAIS ces variables :
- `JWT_SECRET`
- `POSTGRES_PASSWORD`
- `ADMIN_PASSWORD`

---

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Couverture
npm run test:cov
```

---

## 📊 Monitoring

### Health Check

L'application expose un health check Docker :

```bash
# Vérifier la santé du container
docker inspect --format='{{.State.Health.Status}}' cybersensei-backend
```

### Logs

```bash
# Voir les logs en temps réel
docker-compose logs -f backend

# Logs PostgreSQL
docker-compose logs -f postgres

# Logs MongoDB
docker-compose logs -f mongodb
```

---

## 🚢 Déploiement en Production

### Recommandations

1. **Reverse Proxy** : Nginx ou Caddy avec SSL
2. **Base de données** : PostgreSQL et MongoDB managés (AWS RDS, MongoDB Atlas)
3. **Backups** : Automatisez les sauvegardes PostgreSQL et MongoDB
4. **Monitoring** : Prometheus + Grafana
5. **CI/CD** : GitHub Actions, GitLab CI, ou Jenkins

### Exemple avec Nginx

```nginx
server {
    listen 80;
    server_name api.cybersensei.com;
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name api.cybersensei.com;
    
    ssl_certificate /etc/ssl/certs/cybersensei.crt;
    ssl_certificate_key /etc/ssl/private/cybersensei.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🤝 Contribution

Ce projet est propriétaire. Pour toute question, contactez l'équipe CyberSensei.

---

## 📝 Licence

Propriétaire - © 2025 CyberSensei

---

## 📞 Support

- **Email** : support@cybersensei.com
- **Documentation** : http://localhost:3000/api (Swagger)

---

## 🎯 Résumé des Endpoints Clés pour les Nodes

| Endpoint | Méthode | Usage | Authentification |
|----------|---------|-------|------------------|
| `/api/license/validate?key=XXX` | GET | Valider une licence | Clé de licence |
| `/update/check?tenantId=XXX&version=1.0.0` | GET | Vérifier mises à jour | tenantId |
| `/update/download/:updateId` | GET | Télécharger une mise à jour | Aucune* |
| `/telemetry` | POST | Envoyer de la télémétrie | tenantId dans body |

*L'updateId est obtenu via `/update/check`

---

## ✅ Checklist de Démarrage Rapide

- [ ] Cloner le repository
- [ ] Copier `.env.example` vers `.env` et configurer
- [ ] Démarrer avec `docker-compose up -d`
- [ ] Accéder à Swagger : http://localhost:3000/api
- [ ] Se connecter avec les credentials admin par défaut
- [ ] Créer un tenant
- [ ] Tester la validation de licence
- [ ] Uploader une mise à jour test
- [ ] Envoyer de la télémétrie test

---

**🎉 Vous êtes prêt ! Le backend CyberSensei Central est opérationnel.**

