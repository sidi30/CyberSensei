# 🔧 Variables d'Environnement

Configuration complète des variables d'environnement pour CyberSensei Central Backend.

---

## 📝 Fichier .env

Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
# ==============================================
# CyberSensei Central Backend - Environment Variables
# ==============================================

# ----------------------------------------------
# DATABASE - PostgreSQL
# ----------------------------------------------
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=cybersensei
POSTGRES_PASSWORD=your_postgres_password_here
POSTGRES_DB=cybersensei_central

# ----------------------------------------------
# DATABASE - MongoDB
# ----------------------------------------------
MONGODB_URI=mongodb://cybersensei:your_mongo_password_here@localhost:27017/cybersensei_central

# ----------------------------------------------
# JWT AUTHENTICATION
# ----------------------------------------------
# Secret key for JWT signing (CHANGE IN PRODUCTION!)
# Generate with: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# Token expiration time (examples: 1h, 24h, 7d)
JWT_EXPIRES_IN=24h

# ----------------------------------------------
# DEFAULT ADMIN (Created automatically on first start)
# ----------------------------------------------
# IMPORTANT: Change password immediately after first login in production!
ADMIN_EMAIL=admin@cybersensei.com
ADMIN_PASSWORD=Admin@123456

# ----------------------------------------------
# APPLICATION
# ----------------------------------------------
# Server port
PORT=3000

# Node environment (development, production, test)
NODE_ENV=development

# Application URL (for CORS, webhooks, etc.)
APP_URL=http://localhost:3000

# ----------------------------------------------
# CORS (Optional)
# ----------------------------------------------
# Comma-separated list of allowed origins
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:4200

# ----------------------------------------------
# LOGGING (Optional)
# ----------------------------------------------
# Log level (error, warn, info, debug, verbose)
LOG_LEVEL=info

# ----------------------------------------------
# FILE UPLOADS (Optional)
# ----------------------------------------------
# Maximum file size for updates (in bytes)
# 100MB = 104857600
MAX_FILE_SIZE=104857600
```

---

## 📋 Description des Variables

### PostgreSQL (Requis)

| Variable | Description | Exemple | Défaut |
|----------|-------------|---------|--------|
| `POSTGRES_HOST` | Hôte PostgreSQL | `localhost` | - |
| `POSTGRES_PORT` | Port PostgreSQL | `5432` | - |
| `POSTGRES_USER` | Utilisateur PostgreSQL | `cybersensei` | - |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL | `SecurePass123!` | - |
| `POSTGRES_DB` | Nom de la base de données | `cybersensei_central` | - |

---

### MongoDB (Requis)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `MONGODB_URI` | URI de connexion MongoDB | `mongodb://user:pass@localhost:27017/db` |

**Format** : `mongodb://[username:password@]host[:port]/database`

---

### JWT Authentication (Requis)

| Variable | Description | Exemple | Défaut |
|----------|-------------|---------|--------|
| `JWT_SECRET` | Clé secrète pour signer les JWT | `abc123...` (32+ caractères) | - |
| `JWT_EXPIRES_IN` | Durée de validité du token | `24h`, `7d`, `1h` | `24h` |

**⚠️ Générer une clé forte** :
```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Format d'expiration** :
- `60` : 60 millisecondes
- `2m` : 2 minutes
- `1h` : 1 heure
- `24h` : 24 heures
- `7d` : 7 jours

---

### Admin par Défaut (Requis)

| Variable | Description | Exemple | Défaut |
|----------|-------------|---------|--------|
| `ADMIN_EMAIL` | Email de l'admin par défaut | `admin@company.com` | `admin@cybersensei.com` |
| `ADMIN_PASSWORD` | Mot de passe initial | `SecurePass123!` | `Admin@123456` |

**⚠️ IMPORTANT** :
- L'admin est créé **automatiquement** au premier démarrage
- **Changer le mot de passe immédiatement** après la première connexion
- En production, utiliser un mot de passe fort

---

### Application (Optionnel)

| Variable | Description | Exemple | Défaut |
|----------|-------------|---------|--------|
| `PORT` | Port du serveur | `3000`, `8080` | `3000` |
| `NODE_ENV` | Environnement Node.js | `development`, `production` | `development` |
| `APP_URL` | URL de l'application | `https://api.cybersensei.com` | - |

---

### CORS (Optionnel)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `CORS_ORIGINS` | Origines autorisées (séparées par virgule) | `http://localhost:3000,https://app.com` |

Si non défini, CORS est activé pour toutes les origines en développement.

---

### Logging (Optionnel)

| Variable | Description | Exemple | Défaut |
|----------|-------------|---------|--------|
| `LOG_LEVEL` | Niveau de logging | `error`, `warn`, `info`, `debug` | `info` |

---

### File Uploads (Optionnel)

| Variable | Description | Exemple | Défaut |
|----------|-------------|---------|--------|
| `MAX_FILE_SIZE` | Taille max des fichiers (bytes) | `104857600` (100MB) | - |

---

## 🚀 Configuration par Environnement

### Development

```env
NODE_ENV=development
JWT_SECRET=dev-secret-change-me
JWT_EXPIRES_IN=24h
ADMIN_PASSWORD=Admin@123456

# Bases de données locales
POSTGRES_HOST=localhost
MONGODB_URI=mongodb://localhost:27017/cybersensei_central

# CORS permissif
CORS_ORIGINS=http://localhost:3000,http://localhost:4200
```

---

### Production

```env
NODE_ENV=production

# JWT avec clé forte
JWT_SECRET=<généré avec openssl rand -base64 32>
JWT_EXPIRES_IN=24h

# Admin avec mot de passe fort
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=<mot de passe fort généré>

# Bases de données cloud
POSTGRES_HOST=prod-db.example.com
POSTGRES_PORT=5432
POSTGRES_USER=app_user
POSTGRES_PASSWORD=<mot de passe fort>
POSTGRES_DB=cybersensei_prod

MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cybersensei_prod

# URL publique
APP_URL=https://api.cybersensei.com

# CORS restrictif
CORS_ORIGINS=https://app.cybersensei.com

# Logging
LOG_LEVEL=warn
```

---

### Docker Compose

Utilisez `docker-compose.yml` avec les variables d'environnement :

```yaml
services:
  backend:
    environment:
      - POSTGRES_HOST=postgres
      - MONGODB_URI=mongodb://mongo:27017/cybersensei_central
      - JWT_SECRET=${JWT_SECRET}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
```

Et créez un fichier `.env` :
```env
JWT_SECRET=your-secret-here
ADMIN_PASSWORD=Admin@123456
```

---

## 🔒 Sécurité

### ⚠️ Recommandations de Sécurité

1. **JWT_SECRET** :
   - Minimum 32 caractères
   - Aléatoire et imprévisible
   - Différent pour chaque environnement
   - **JAMAIS** committé dans Git

2. **ADMIN_PASSWORD** :
   - Mot de passe fort (8+ caractères, majuscules, minuscules, chiffres, symboles)
   - Changer immédiatement après le premier login
   - Utiliser un gestionnaire de mots de passe

3. **Mots de passe DB** :
   - Forts et uniques
   - Stockés dans un gestionnaire de secrets en production

4. **HTTPS** :
   - Obligatoire en production
   - Utiliser un reverse proxy (Nginx, Traefik)
   - Certificat SSL/TLS valide

---

### 🔐 Gestionnaires de Secrets (Production)

Au lieu de fichiers `.env`, utilisez :

**AWS Secrets Manager** :
```typescript
import { SecretsManager } from 'aws-sdk';

const secretsManager = new SecretsManager();
const secret = await secretsManager.getSecretValue({ SecretId: 'prod/jwt-secret' }).promise();
```

**Azure Key Vault** :
```typescript
import { SecretClient } from '@azure/keyvault-secrets';

const client = new SecretClient(vaultUrl, credential);
const secret = await client.getSecret('jwt-secret');
```

**HashiCorp Vault** :
```bash
vault kv get secret/cybersensei/jwt-secret
```

---

## ✅ Checklist de Configuration

### Development
- [ ] Créer fichier `.env` à la racine
- [ ] Configurer PostgreSQL local
- [ ] Configurer MongoDB local
- [ ] Définir `JWT_SECRET` (peut être simple en dev)
- [ ] Tester connexion aux DB
- [ ] Lancer `npm run start:dev`

### Production
- [ ] Générer `JWT_SECRET` fort (openssl)
- [ ] Configurer DB cloud (AWS RDS, Azure Database, etc.)
- [ ] Changer `ADMIN_PASSWORD`
- [ ] Configurer `APP_URL` avec domaine réel
- [ ] Configurer `CORS_ORIGINS` restrictif
- [ ] Activer HTTPS (reverse proxy)
- [ ] Utiliser gestionnaire de secrets
- [ ] Tester toutes les connexions
- [ ] Configurer monitoring/logging

---

## 🧪 Tester la Configuration

### Vérifier les variables

```bash
# Lancer le backend
npm run start:dev

# Vérifier la connexion PostgreSQL
# (le backend devrait afficher "Database connected")

# Vérifier la connexion MongoDB
# (le backend devrait afficher "MongoDB connected")

# Vérifier l'admin par défaut
# (le backend devrait afficher "✅ Admin par défaut créé: admin@cybersensei.com")
```

### Tester JWT

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cybersensei.com","password":"Admin@123456"}'

# Si succès, JWT_SECRET est correct
```

---

## 📚 Ressources

- **NestJS Config** : https://docs.nestjs.com/techniques/configuration
- **TypeORM Connection** : https://typeorm.io/data-source-options
- **Mongoose Connection** : https://mongoosejs.com/docs/connections.html
- **JWT** : https://jwt.io/

---

## 🆘 Troubleshooting

### Erreur : "JWT_SECRET is not defined"

**Solution** : Créer le fichier `.env` avec `JWT_SECRET=votre-secret`

---

### Erreur : "Database connection failed"

**Solutions** :
1. Vérifier que PostgreSQL/MongoDB sont démarrés
2. Vérifier les credentials dans `.env`
3. Vérifier le port (5432 pour PostgreSQL, 27017 pour MongoDB)
4. Tester la connexion manuellement :
   ```bash
   psql -h localhost -U cybersensei -d cybersensei_central
   mongo mongodb://localhost:27017/cybersensei_central
   ```

---

### Erreur : "Admin default user not created"

**Solutions** :
1. Vérifier `ADMIN_EMAIL` et `ADMIN_PASSWORD` dans `.env`
2. Vérifier que la table `admin_users` existe
3. Supprimer l'admin existant et relancer :
   ```sql
   DELETE FROM admin_users WHERE email = 'admin@cybersensei.com';
   ```

---

**✅ Configuration terminée ! Le backend est prêt à démarrer.**

```bash
npm run start:dev
```

