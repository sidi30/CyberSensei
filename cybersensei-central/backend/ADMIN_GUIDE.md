# 👨‍💼 Guide Administrateur - CyberSensei Central Backend

Guide complet pour les administrateurs SUPERADMIN et SUPPORT.

## 🔐 Première Connexion

### Credentials par Défaut

```
Email: admin@cybersensei.com
Password: Admin@123456
```

**⚠️ IMPORTANT** : Changez le mot de passe après la première connexion !

### Se Connecter

```bash
curl -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cybersensei.com",
    "password": "Admin@123456"
  }'
```

**Réponse** :
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Super Admin",
    "email": "admin@cybersensei.com",
    "role": "SUPERADMIN"
  }
}
```

Utilisez le `access_token` dans toutes les requêtes suivantes :
```bash
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 👥 Gestion des Administrateurs

### Créer un Nouvel Administrateur (SUPERADMIN only)

```bash
curl -X POST http://localhost:3000/admin/auth/register \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Support",
    "email": "john.support@cybersensei.com",
    "password": "SecurePass123!",
    "role": "SUPPORT"
  }'
```

### Rôles Disponibles

| Rôle | Permissions |
|------|-------------|
| **SUPERADMIN** | Accès complet : création/suppression tenants, upload updates, gestion admins |
| **SUPPORT** | Lecture seule + support : voir tenants, métriques, santé des systèmes |

### Lister les Administrateurs

```bash
curl -X GET http://localhost:3000/admin/auth/admins \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🏢 Gestion des Tenants

### 1. Créer un Nouveau Tenant

```bash
curl -X POST http://localhost:3000/admin/tenants \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "acme-corp",
    "contactEmail": "admin@acme.com",
    "companyName": "Acme Corporation",
    "address": "123 Cyber Street, Tech City",
    "phone": "+1234567890"
  }'
```

**Réponse** :
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "acme-corp",
  "contactEmail": "admin@acme.com",
  "licenseKey": "A1B2C3D4-E5F6G7H8-I9J0K1L2-M3N4O5P6",
  "active": true,
  "companyName": "Acme Corporation",
  "createdAt": "2025-11-24T10:00:00.000Z"
}
```

**📝 Important** : La `licenseKey` est générée automatiquement. Fournissez-la au client.

### 2. Lister Tous les Tenants

```bash
curl -X GET http://localhost:3000/admin/tenants \
  -H "Authorization: Bearer <TOKEN>"
```

### 3. Voir les Détails d'un Tenant

```bash
curl -X GET http://localhost:3000/admin/tenants/{TENANT_ID} \
  -H "Authorization: Bearer <TOKEN>"
```

### 4. Mettre à Jour un Tenant

```bash
curl -X PATCH http://localhost:3000/admin/tenants/{TENANT_ID} \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Acme Corporation Ltd",
    "active": true
  }'
```

### 5. Désactiver/Activer un Tenant

```bash
# Désactiver
curl -X PATCH http://localhost:3000/admin/tenants/{TENANT_ID} \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"active": false}'

# Réactiver
curl -X PATCH http://localhost:3000/admin/tenants/{TENANT_ID} \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"active": true}'
```

### 6. Supprimer un Tenant (SUPERADMIN only)

**⚠️ ATTENTION** : Supprime toutes les données associées (métriques, licences)

```bash
curl -X DELETE http://localhost:3000/admin/tenants/{TENANT_ID} \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🔑 Gestion des Licences

### 1. Générer une Nouvelle Licence

```bash
curl -X POST http://localhost:3000/api/license \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "expiresAt": "2025-12-31T23:59:59Z",
    "maxUsageCount": 1000,
    "notes": "Licence production - contrat annuel"
  }'
```

### 2. Lister Toutes les Licences

```bash
curl -X GET http://localhost:3000/api/license \
  -H "Authorization: Bearer <TOKEN>"
```

### 3. Voir les Licences d'un Tenant

```bash
curl -X GET http://localhost:3000/api/license/tenant/{TENANT_ID} \
  -H "Authorization: Bearer <TOKEN>"
```

### 4. Révoquer une Licence (SUPERADMIN only)

```bash
curl -X PATCH http://localhost:3000/api/license/{LICENSE_ID}/revoke \
  -H "Authorization: Bearer <TOKEN>"
```

### 5. Renouveler une Licence

```bash
curl -X PATCH "http://localhost:3000/api/license/{LICENSE_ID}/renew?expiresAt=2026-12-31T23:59:59Z" \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 📦 Gestion des Mises à Jour

### 1. Uploader un Package de Mise à Jour (SUPERADMIN only)

```bash
curl -X POST http://localhost:3000/admin/update/upload \
  -H "Authorization: Bearer <TOKEN>" \
  -F "version=1.2.0" \
  -F "changelog=- Correctifs de sécurité critiques\n- Amélioration des performances\n- Nouveaux exercices" \
  -F "checksum=sha256hashhere" \
  -F "file=@/path/to/update-1.2.0.zip"
```

**📝 Bonnes Pratiques** :
- Utilisez un versioning sémantique (1.2.0, 1.2.1, etc.)
- Fournissez toujours un changelog détaillé
- Générez un checksum SHA-256 du fichier
- Testez le package avant de l'uploader

### 2. Lister Toutes les Mises à Jour

```bash
curl -X GET http://localhost:3000/admin/updates \
  -H "Authorization: Bearer <TOKEN>"
```

### 3. Voir les Détails d'une Mise à Jour

```bash
curl -X GET http://localhost:3000/admin/update/{UPDATE_ID} \
  -H "Authorization: Bearer <TOKEN>"
```

### 4. Supprimer une Mise à Jour (SUPERADMIN only)

```bash
curl -X DELETE http://localhost:3000/admin/update/{UPDATE_ID} \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 📊 Surveillance et Monitoring

### 1. Vue d'Ensemble du Tenant

```bash
curl -X GET http://localhost:3000/admin/tenants/{TENANT_ID} \
  -H "Authorization: Bearer <TOKEN>"
```

### 2. Métriques d'un Tenant

```bash
# Dernières 100 métriques
curl -X GET "http://localhost:3000/admin/tenants/{TENANT_ID}/metrics?limit=100" \
  -H "Authorization: Bearer <TOKEN>"
```

### 3. État de Santé d'un Tenant

```bash
curl -X GET http://localhost:3000/admin/tenants/{TENANT_ID}/health \
  -H "Authorization: Bearer <TOKEN>"
```

**Réponse** :
```json
{
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "tenantName": "acme-corp",
  "status": "HEALTHY",
  "message": "Le système fonctionne normalement",
  "lastUpdate": "2025-11-24T10:30:00.000Z",
  "version": "1.2.0",
  "uptime": 86400,
  "activeUsers": 42,
  "aiLatency": 247.5
}
```

**États possibles** :
- `HEALTHY` : Tout va bien
- `WARNING` : Aucune donnée depuis 30+ minutes
- `CRITICAL` : Aucune donnée depuis 60+ minutes
- `NO_DATA` : Aucune métrique reçue

### 4. Métriques Télémétrie Détaillées

```bash
# Dernière métrique
curl -X GET http://localhost:3000/admin/telemetry/tenant/{TENANT_ID}/latest \
  -H "Authorization: Bearer <TOKEN>"

# Métriques agrégées (7 derniers jours)
curl -X GET "http://localhost:3000/admin/telemetry/tenant/{TENANT_ID}/aggregated?days=7" \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🌍 Métriques Globales

### 1. Résumé Global

```bash
curl -X GET http://localhost:3000/admin/global/summary \
  -H "Authorization: Bearer <TOKEN>"
```

**Réponse** :
```json
{
  "tenants": {
    "total": 42,
    "active": 38,
    "inactive": 4
  },
  "licenses": {
    "total": 56,
    "active": 45,
    "expired": 8,
    "revoked": 3
  },
  "usage": {
    "totalActiveUsers": 1847,
    "totalExercisesCompletedToday": 4532,
    "averageAiLatency": 245.67
  },
  "timestamp": "2025-11-24T10:30:00.000Z"
}
```

### 2. Tenants à Risque

```bash
curl -X GET http://localhost:3000/admin/global/top-risk \
  -H "Authorization: Bearer <TOKEN>"
```

**Réponse** :
```json
{
  "totalRiskyTenants": 5,
  "critical": 2,
  "warning": 3,
  "tenants": [
    {
      "tenantId": "...",
      "tenantName": "client-xyz",
      "riskLevel": "CRITICAL",
      "reason": "Aucune donnée depuis 120 minutes",
      "lastUpdate": "2025-11-24T08:30:00.000Z"
    }
  ]
}
```

**📝 Actions recommandées** :
- `CRITICAL` : Contacter immédiatement le client
- `WARNING` : Surveiller et vérifier dans l'heure

### 3. Tendances d'Utilisation

```bash
# 30 derniers jours
curl -X GET "http://localhost:3000/admin/global/usage-trends?days=30" \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🔔 Scénarios Courants

### Nouveau Client

1. Créer le tenant
2. Noter la `licenseKey` générée
3. Générer une licence avec date d'expiration
4. Envoyer les informations au client :
   - URL du backend
   - License key
   - Guide d'intégration

### Client qui ne Répond Plus

1. Vérifier l'état de santé : `GET /admin/tenants/{id}/health`
2. Consulter les dernières métriques : `GET /admin/tenants/{id}/metrics`
3. Vérifier la licence : `GET /api/license/tenant/{id}`
4. Contacter le client si problème persistant

### Déploiement d'une Mise à Jour

1. Tester la mise à jour en environnement de staging
2. Générer le changelog détaillé
3. Créer le package ZIP
4. Générer le checksum : `sha256sum update.zip`
5. Uploader : `POST /admin/update/upload`
6. Notifier les clients (email, tableau de bord)
7. Surveiller l'adoption via les métriques de version

### Expiration de Licence Imminente

1. Lister les licences : `GET /api/license`
2. Filtrer celles expirant dans < 30 jours
3. Contacter les clients concernés
4. Renouveler : `PATCH /api/license/{id}/renew`

---

## 🚨 Alertes et Notifications

### À Surveiller Quotidiennement

- [ ] Tenants à risque (CRITICAL)
- [ ] Licences expirées ou expirant dans < 7 jours
- [ ] Latence AI anormalement élevée (> 1000ms)
- [ ] Tenants inactifs depuis > 24h

### Tableau de Bord Recommandé

Créez des requêtes périodiques (cron) pour :
- `/admin/global/summary` → Dashboard principal
- `/admin/global/top-risk` → Alertes
- `/admin/global/usage-trends?days=7` → Graphiques

---

## 🔒 Sécurité

### Bonnes Pratiques

1. **Rotation des Tokens** : Reconnectez-vous régulièrement
2. **Logs d'Audit** : Surveillez les actions des admins
3. **Principe du Moindre Privilège** : Utilisez SUPPORT pour les tâches quotidiennes
4. **Backup** : Sauvegardez régulièrement PostgreSQL et MongoDB
5. **HTTPS** : Utilisez toujours HTTPS en production

### Changer le Mot de Passe JWT Secret

**En production, changez immédiatement `JWT_SECRET` dans `.env` !**

```env
JWT_SECRET=VotreSecretTresTresLongEtComplexe123456789!@#
```

---

## 📞 Support et Assistance

### Logs

```bash
# Logs backend
docker-compose logs -f backend

# Logs PostgreSQL
docker-compose logs -f postgres

# Logs MongoDB
docker-compose logs -f mongodb
```

### Debug

Activez le mode debug dans `.env` :
```env
NODE_ENV=development
```

### Contact

- **Email** : support-admin@cybersensei.com
- **Documentation API** : http://localhost:3000/api

---

## 🎯 Checklist Administrateur

### Setup Initial
- [ ] Changer le mot de passe admin par défaut
- [ ] Créer un utilisateur SUPPORT pour les opérations quotidiennes
- [ ] Configurer le backup automatique
- [ ] Tester la création d'un tenant
- [ ] Tester l'upload d'une mise à jour

### Maintenance Quotidienne
- [ ] Vérifier `/admin/global/top-risk`
- [ ] Consulter `/admin/global/summary`
- [ ] Vérifier les licences expirant dans 7 jours

### Maintenance Hebdomadaire
- [ ] Analyser `/admin/global/usage-trends?days=7`
- [ ] Vérifier les versions des tenants
- [ ] Nettoyer les anciennes métriques (si nécessaire)

### Maintenance Mensuelle
- [ ] Backup complet des bases de données
- [ ] Audit des licences actives
- [ ] Revue des métriques globales
- [ ] Planification des mises à jour

---

**✅ Vous êtes maintenant prêt à administrer CyberSensei Central Backend !**

