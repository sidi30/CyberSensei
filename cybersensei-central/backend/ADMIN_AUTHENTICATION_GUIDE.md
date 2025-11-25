# 🔐 Admin Authentication - Guide Complet

Guide d'utilisation du système d'authentification administrateur pour CyberSensei Central.

---

## 🎯 Vue d'Ensemble

Le système d'authentification admin fournit :
1. **Authentification JWT** (JSON Web Token)
2. **Hashing des mots de passe** avec bcrypt
3. **RBAC** (Role-Based Access Control)
4. **2 niveaux de permissions** : SUPERADMIN et SUPPORT

### Architecture

```
┌─────────────────────────────────────┐
│     Admin Authentication Flow        │
└─────────────────────────────────────┘
         │
         ▼
    POST /auth/login
    { email, password }
         │
         ▼
    ┌─────────────────────┐
    │ AdminAuthService    │
    │                     │
    │ 1. Find user        │
    │ 2. Verify password  │
    │ 3. Generate JWT     │
    └─────────────────────┘
         │
         ▼
    { access_token, user }
         │
         ▼
    ┌─────────────────────┐
    │  Client stores JWT  │
    │  in localStorage    │
    └─────────────────────┘
         │
         ▼
    Subsequent requests:
    Authorization: Bearer <JWT>
         │
         ▼
    ┌─────────────────────┐
    │  JwtAuthGuard       │
    │  ↓                  │
    │  JwtStrategy        │
    │  ↓                  │
    │  Validate & Attach  │
    │  User to Request    │
    └─────────────────────┘
         │
         ▼
    ┌─────────────────────┐
    │  RolesGuard         │
    │  (if @Roles used)   │
    │                     │
    │  Check user.role    │
    └─────────────────────┘
```

---

## 👥 Rôles Admin

### SUPERADMIN
**Permissions complètes** :
- ✅ Créer/modifier/désactiver des administrateurs
- ✅ Gérer les tenants et licences
- ✅ Upload des mises à jour
- ✅ Accès à tous les endpoints admin
- ✅ Configuration système
- ✅ Consultation de toutes les métriques

**Cas d'usage** :
- Équipe technique principale
- Administrateurs système
- Gestionnaires de la plateforme

---

### SUPPORT
**Permissions lecture seule** :
- ✅ Consulter les métriques des tenants
- ✅ Voir les informations des licences
- ✅ Accéder aux dashboards
- ❌ Créer/modifier des admins
- ❌ Upload des mises à jour
- ❌ Modifier les tenants/licences

**Cas d'usage** :
- Équipe support client
- Analystes
- Personnel de monitoring

---

## 🔌 Endpoints API

### 1. Connexion (Login)

**POST** `/auth/login`

**Authorization** : Aucune (public)

**Body** :
```json
{
  "email": "admin@cybersensei.com",
  "password": "Admin@123456"
}
```

**Réponse (200)** :
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6ImFkbWluQGN5YmVyc2Vuc2VpLmNvbSIsInJvbGUiOiJTVVBFUkFETUlOIiwiaWF0IjoxNzAwODI4NDAwLCJleHAiOjE3MDA5MTQ4MDB9.abc123...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Super Admin",
    "email": "admin@cybersensei.com",
    "role": "SUPERADMIN"
  }
}
```

**Erreurs** :
- `401` : Email ou mot de passe incorrect
- `401` : Utilisateur inactif

**Exemple cURL** :
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cybersensei.com",
    "password": "Admin@123456"
  }'
```

**Informations supplémentaires** :
- Le mot de passe est vérifié avec `bcrypt.compare()`
- La date de dernière connexion est mise à jour
- Le token expire après 24h (configurable via `JWT_EXPIRES_IN`)
- Le token contient : `sub` (user ID), `email`, `role`

---

### 2. Profil Utilisateur (Me)

**GET** `/auth/me`

**Authorization** : Bearer Token (requis)

**Headers** :
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse (200)** :
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Super Admin",
  "email": "admin@cybersensei.com",
  "role": "SUPERADMIN",
  "active": true,
  "createdAt": "2025-11-24T10:30:00.000Z",
  "lastLoginAt": "2025-11-24T12:45:00.000Z"
}
```

**Erreurs** :
- `401` : Token manquant ou invalide
- `401` : Utilisateur non trouvé ou inactif

**Exemple cURL** :
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Cas d'usage** :
- Vérifier la validité du token au chargement de l'application
- Afficher les informations de l'utilisateur connecté
- Rafraîchir le profil après modification

---

### 3. Créer un Administrateur (Register)

**POST** `/auth/register`

**Authorization** : Bearer Token (SUPERADMIN uniquement)

**Headers** :
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body** :
```json
{
  "name": "Support Agent",
  "email": "support@cybersensei.com",
  "password": "SecurePass123!",
  "role": "SUPPORT"
}
```

**Réponse (201)** :
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Support Agent",
  "email": "support@cybersensei.com",
  "role": "SUPPORT",
  "active": true,
  "createdAt": "2025-11-24T10:30:00.000Z"
}
```

**Erreurs** :
- `401` : Non authentifié
- `403` : Accès interdit (pas SUPERADMIN)
- `409` : Un utilisateur avec cet email existe déjà
- `400` : Validation échouée (email invalide, mot de passe trop court, etc.)

**Validation** :
- Email : doit être valide
- Password : minimum 8 caractères
- Role : `SUPERADMIN` ou `SUPPORT`

**Exemple cURL** :
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Support Agent",
    "email": "support@cybersensei.com",
    "password": "SecurePass123!",
    "role": "SUPPORT"
  }'
```

---

### 4. Liste des Administrateurs

**GET** `/auth/admins`

**Authorization** : Bearer Token (SUPERADMIN uniquement)

**Réponse (200)** :
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Super Admin",
    "email": "admin@cybersensei.com",
    "role": "SUPERADMIN",
    "active": true,
    "createdAt": "2025-11-24T10:30:00.000Z",
    "lastLoginAt": "2025-11-24T12:45:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Support Agent",
    "email": "support@cybersensei.com",
    "role": "SUPPORT",
    "active": true,
    "createdAt": "2025-11-24T11:00:00.000Z",
    "lastLoginAt": null
  }
]
```

**Exemple cURL** :
```bash
curl -X GET http://localhost:3000/auth/admins \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔒 Routes Sécurisées

### Configuration Actuelle

Les routes suivantes sont protégées par `JwtAuthGuard` et/ou `RolesGuard` :

#### 1. Routes Admin (`/admin/*`)

```typescript
// Exemple : TelemetryController
@Get('admin/tenant/:id/metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
async getMetrics() { }
```

**Accessible par** : SUPERADMIN + SUPPORT

#### 2. Routes Updates (`/admin/update/*`)

```typescript
// Exemple : UpdateController
@Post('admin/update/upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPERADMIN)
async uploadUpdate() { }
```

**Accessible par** : SUPERADMIN uniquement

#### 3. Routes Licenses (`/admin/licenses/*`)

```typescript
// Exemple : LicenseController
@Post('admin/license')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPERADMIN)
async createLicense() { }
```

**Accessible par** : SUPERADMIN uniquement

---

## 🛡️ Guards et Decorators

### JwtAuthGuard

Vérifie la présence et la validité du JWT token.

**Utilisation** :
```typescript
@Get('protected')
@UseGuards(JwtAuthGuard)
async protectedRoute(@CurrentUser() user: any) {
  // user contient: { id, email, role, name }
}
```

**Workflow** :
1. Extrait le token du header `Authorization: Bearer <token>`
2. Vérifie la signature JWT avec `JWT_SECRET`
3. Appelle `JwtStrategy.validate(payload)`
4. Vérifie que l'utilisateur existe et est actif
5. Attache `user` à la requête

---

### RolesGuard

Vérifie que l'utilisateur a le rôle requis.

**Utilisation** :
```typescript
@Get('superadmin-only')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPERADMIN)
async superAdminRoute() {
  // Accessible uniquement par SUPERADMIN
}

@Get('admin-or-support')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
async adminRoute() {
  // Accessible par SUPERADMIN et SUPPORT
}
```

**⚠️ Important** : `RolesGuard` doit être utilisé **après** `JwtAuthGuard`

---

### @CurrentUser Decorator

Extrait l'utilisateur de la requête.

**Utilisation** :
```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
async getProfile(@CurrentUser() user: any) {
  // user = { id, email, role, name }
  console.log(`User ${user.name} (${user.role}) accessed profile`);
}

@Get('user-id')
@UseGuards(JwtAuthGuard)
async getUserId(@CurrentUser('id') userId: string) {
  // Extrait uniquement l'ID
  return { userId };
}
```

---

## 🔐 Sécurité

### Hashing des Mots de Passe

```typescript
// Lors de la création d'un admin
const passwordHash = await bcrypt.hash(password, 10);

// Lors de la connexion
const isPasswordValid = await bcrypt.compare(password, passwordHash);
```

**Algorithme** : bcrypt avec 10 rounds de salting

---

### JWT Token Structure

**Payload** :
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "admin@cybersensei.com",
  "role": "SUPERADMIN",
  "iat": 1700828400,
  "exp": 1700914800
}
```

**Configuration** :
- Secret : `JWT_SECRET` (variable d'environnement)
- Expiration : `JWT_EXPIRES_IN` (défaut: 24h)
- Algorithme : HS256

---

### Variables d'Environnement

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Default Admin (créé automatiquement au démarrage)
ADMIN_EMAIL=admin@cybersensei.com
ADMIN_PASSWORD=Admin@123456
```

**⚠️ En Production** :
- Utiliser un `JWT_SECRET` fort et aléatoire (minimum 32 caractères)
- Changer `ADMIN_PASSWORD` immédiatement après le premier déploiement
- Utiliser HTTPS pour toutes les requêtes
- Implémenter un refresh token system pour les tokens longue durée

---

## 💻 Implémentation Frontend

### 1. Login et Stockage du Token

```typescript
// login.ts
async function login(email: string, password: string) {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  
  // Stocker le token
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  return data;
}
```

---

### 2. Requêtes Authentifiées

```typescript
// api.ts
function getAuthToken(): string | null {
  return localStorage.getItem('access_token');
}

async function fetchProtectedResource(url: string) {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    // Token expiré ou invalide
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  return response.json();
}
```

---

### 3. Vérification du Token au Chargement

```typescript
// App.tsx (React example)
useEffect(() => {
  async function verifyToken() {
    try {
      const user = await fetchProtectedResource('http://localhost:3000/auth/me');
      setCurrentUser(user);
    } catch (error) {
      // Token invalide, rediriger vers login
      navigate('/login');
    }
  }

  const token = getAuthToken();
  if (token) {
    verifyToken();
  }
}, []);
```

---

### 4. Protection des Routes (React Router)

```typescript
// ProtectedRoute.tsx
function ProtectedRoute({ children, requiredRole }: Props) {
  const token = getAuthToken();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <div>Access Denied</div>;
  }

  return <>{children}</>;
}

// Usage
<Route
  path="/admin/upload"
  element={
    <ProtectedRoute requiredRole="SUPERADMIN">
      <UploadPage />
    </ProtectedRoute>
  }
/>
```

---

## 🧪 Tests

### Script de Test Complet

```bash
#!/bin/bash

BACKEND_URL="http://localhost:3000"

echo "==================================="
echo "Test 1: Login"
echo "==================================="

LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cybersensei.com",
    "password": "Admin@123456"
  }')

echo "$LOGIN_RESPONSE" | jq .

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r .access_token)

echo ""
echo "Token: $TOKEN"
echo ""

echo "==================================="
echo "Test 2: Get Profile (/auth/me)"
echo "==================================="

curl -s -X GET "$BACKEND_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "==================================="
echo "Test 3: Create Support Admin"
echo "==================================="

curl -s -X POST "$BACKEND_URL/auth/register" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Support Agent",
    "email": "support@cybersensei.com",
    "password": "Support@123456",
    "role": "SUPPORT"
  }' | jq .

echo ""
echo "==================================="
echo "Test 4: List All Admins"
echo "==================================="

curl -s -X GET "$BACKEND_URL/auth/admins" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "==================================="
echo "Test 5: Login as Support"
echo "==================================="

SUPPORT_LOGIN=$(curl -s -X POST "$BACKEND_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "support@cybersensei.com",
    "password": "Support@123456"
  }')

echo "$SUPPORT_LOGIN" | jq .

SUPPORT_TOKEN=$(echo "$SUPPORT_LOGIN" | jq -r .access_token)

echo ""
echo "==================================="
echo "Test 6: Support tries to create admin (should fail)"
echo "==================================="

curl -s -X POST "$BACKEND_URL/auth/register" \
  -H "Authorization: Bearer $SUPPORT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another Admin",
    "email": "another@cybersensei.com",
    "password": "Password123!",
    "role": "SUPPORT"
  }' | jq .

echo ""
echo "==================================="
echo "✅ Tests terminés"
echo "==================================="
```

---

## 📊 Table admin_users

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('SUPERADMIN', 'SUPPORT')),
  active BOOLEAN DEFAULT true,
  lastLoginAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Index pour la recherche par email
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- Index pour le rôle
CREATE INDEX idx_admin_users_role ON admin_users(role);
```

---

## ✅ Checklist de Déploiement

### Configuration
- [ ] Définir `JWT_SECRET` fort (32+ caractères aléatoires)
- [ ] Configurer `JWT_EXPIRES_IN` (recommandé: 24h)
- [ ] Changer `ADMIN_EMAIL` et `ADMIN_PASSWORD` par défaut
- [ ] Activer HTTPS en production

### Base de Données
- [ ] Table `admin_users` créée
- [ ] Indexes créés
- [ ] Admin par défaut créé (automatique au démarrage)

### Backend
- [ ] Module `AdminAuthModule` importé dans `AppModule`
- [ ] `JwtAuthGuard` et `RolesGuard` appliqués aux routes sensibles
- [ ] Variables d'environnement configurées
- [ ] Backend démarré : `npm run start:dev`

### Tests
- [ ] Tester login avec admin par défaut
- [ ] Tester création d'un support user
- [ ] Tester RBAC (SUPPORT ne peut pas créer d'admin)
- [ ] Tester `/auth/me`
- [ ] Tester token expiration

### Frontend
- [ ] Implémenter page de login
- [ ] Stocker token dans localStorage
- [ ] Interceptor pour ajouter Authorization header
- [ ] Protection des routes par rôle
- [ ] Gestion de l'expiration du token

---

## 🚀 Utilisation Rapide

### 1. Démarrer le Backend

```bash
cd cybersensei-central-backend
npm run start:dev
```

### 2. Se Connecter

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cybersensei.com","password":"Admin@123456"}'
```

### 3. Récupérer le Token

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Utiliser le Token

```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

**✅ Le système d'authentification est production-ready !**

Documentation complète : Voir Swagger UI à `http://localhost:3000/api`

