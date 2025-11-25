# ⚡ Démarrage Rapide - 5 Minutes

Guide ultra-rapide pour démarrer CyberSensei Central Backend.

## 🎯 Prérequis

- Docker & Docker Compose installés
- OU Node.js 18+ et bases de données PostgreSQL + MongoDB

---

## 🚀 Option 1 : Docker (Recommandé)

### Étape 1 : Lancer l'application

```bash
cd cybersensei-central-backend
docker-compose up -d
```

### Étape 2 : Vérifier que tout fonctionne

```bash
# Vérifier les containers
docker-compose ps

# Voir les logs
docker-compose logs -f backend
```

### Étape 3 : Accéder à l'application

- **API** : http://localhost:3000
- **Swagger** : http://localhost:3000/api

### Étape 4 : Se connecter

**Credentials par défaut** :
```
Email: admin@cybersensei.com
Password: Admin@123456
```

**Connexion** :
```bash
curl -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cybersensei.com",
    "password": "Admin@123456"
  }'
```

Copiez le `access_token` de la réponse.

### Étape 5 : Créer votre premier tenant

```bash
curl -X POST http://localhost:3000/admin/tenants \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "demo-tenant",
    "contactEmail": "demo@example.com",
    "companyName": "Demo Company"
  }'
```

✅ **C'est tout ! Vous avez votre première clé de licence.**

---

## 🖥️ Option 2 : Installation Manuelle

### Étape 1 : Installer les dépendances

```bash
cd cybersensei-central-backend
npm install
```

### Étape 2 : Configurer les variables d'environnement

```bash
# Créer le fichier .env (déjà existant normalement)
# Vérifier que PostgreSQL et MongoDB sont démarrés
```

### Étape 3 : Démarrer l'application

```bash
npm run start:dev
```

### Étape 4 : Accéder à Swagger

http://localhost:3000/api

---

## 🧪 Tester l'API

### 1. Se connecter
```bash
curl -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cybersensei.com","password":"Admin@123456"}'
```

### 2. Créer un tenant
```bash
TOKEN="votre_token_ici"

curl -X POST http://localhost:3000/admin/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"test-tenant","contactEmail":"test@test.com","companyName":"Test Corp"}'
```

### 3. Valider une licence (simuler un node)
```bash
LICENSE_KEY="la_cle_generee"

curl -X GET "http://localhost:3000/api/license/validate?key=$LICENSE_KEY"
```

### 4. Envoyer de la télémétrie (simuler un node)
```bash
TENANT_ID="uuid_du_tenant"

curl -X POST http://localhost:3000/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId":"'$TENANT_ID'",
    "uptime":3600,
    "activeUsers":10,
    "exercisesCompletedToday":25,
    "aiLatency":250,
    "version":"1.0.0"
  }'
```

### 5. Voir le résumé global
```bash
curl -X GET http://localhost:3000/admin/global/summary \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Utiliser Swagger (Plus Simple)

1. Ouvrir http://localhost:3000/api
2. Cliquer sur **"Authorize"** (🔒 en haut à droite)
3. Se connecter via `/admin/auth/login`
4. Copier le `access_token`
5. Coller dans la popup d'autorisation : `Bearer VOTRE_TOKEN`
6. Tester tous les endpoints directement dans Swagger !

---

## 🎬 Workflow Complet : Créer un Tenant et le Tester

```bash
# 1. Se connecter
TOKEN=$(curl -s -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cybersensei.com","password":"Admin@123456"}' \
  | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"

# 2. Créer un tenant
TENANT_RESPONSE=$(curl -s -X POST http://localhost:3000/admin/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"acme-corp","contactEmail":"admin@acme.com","companyName":"Acme Corp"}')

echo "Tenant créé: $TENANT_RESPONSE"

# 3. Extraire tenantId et licenseKey
TENANT_ID=$(echo $TENANT_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
LICENSE_KEY=$(echo $TENANT_RESPONSE | grep -o '"licenseKey":"[^"]*' | cut -d'"' -f4)

echo "Tenant ID: $TENANT_ID"
echo "License Key: $LICENSE_KEY"

# 4. Valider la licence (simuler un node)
curl -X GET "http://localhost:3000/api/license/validate?key=$LICENSE_KEY"

# 5. Envoyer de la télémétrie
curl -X POST http://localhost:3000/telemetry \
  -H "Content-Type: application/json" \
  -d "{
    \"tenantId\":\"$TENANT_ID\",
    \"uptime\":3600,
    \"activeUsers\":15,
    \"exercisesCompletedToday\":42,
    \"aiLatency\":235.5,
    \"version\":\"1.0.0\"
  }"

# 6. Voir la santé du tenant
curl -X GET "http://localhost:3000/admin/tenants/$TENANT_ID/health" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🛑 Arrêter l'Application

### Docker
```bash
docker-compose down
```

### Manuel
```bash
# Ctrl+C dans le terminal où npm run start:dev tourne
```

---

## 🔧 Résolution de Problèmes

### Port 3000 déjà utilisé
```bash
# Modifier dans docker-compose.yml ou .env
PORT=3001
```

### PostgreSQL n'est pas accessible
```bash
# Vérifier que le container est démarré
docker-compose ps

# Redémarrer
docker-compose restart postgres
```

### MongoDB n'est pas accessible
```bash
docker-compose restart mongodb
```

### Voir les logs détaillés
```bash
docker-compose logs -f
```

---

## 📚 Prochaines Étapes

1. ✅ Lire **README.md** pour la documentation complète
2. ✅ Lire **ADMIN_GUIDE.md** pour les opérations d'administration
3. ✅ Lire **GUIDE_NODE_CLIENT.md** pour intégrer des nodes
4. ✅ Changer le mot de passe admin par défaut
5. ✅ Configurer les variables d'environnement pour la production
6. ✅ Uploader une mise à jour test

---

## 🎉 Félicitations !

Votre backend CyberSensei Central est opérationnel. Vous pouvez maintenant :
- Gérer vos tenants
- Générer des licences
- Uploader des mises à jour
- Recevoir de la télémétrie
- Surveiller la santé de vos nodes

**Besoin d'aide ?** Consultez la [documentation complète](README.md)

