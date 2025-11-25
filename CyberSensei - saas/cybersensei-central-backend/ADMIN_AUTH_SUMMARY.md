# ✅ Admin Authentication - Génération Complète

Système d'authentification JWT complet avec RBAC pour CyberSensei Central Backend.

---

## 📦 Fichiers Générés/Modifiés

### Core Authentication (déjà existant, amélioré)

```
src/modules/admin-auth/
├── ✅ admin-auth.service.ts            (+ getProfile)
├── ✅ admin-auth.controller.ts          (+ GET /auth/me, routes /auth/*)
├── ✅ admin-auth.module.ts              (JWT configuration)
├── dto/
│   ├── login.dto.ts
│   └── create-admin.dto.ts
└── strategies/
    └── jwt.strategy.ts

src/entities/
└── ✅ admin-user.entity.ts

src/common/
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
└── decorators/
    ├── roles.decorator.ts
    └── current-user.decorator.ts
```

### Documentation & Exemples

```
✅ ADMIN_AUTHENTICATION_GUIDE.md         (Guide complet 800+ lignes)
✅ ADMIN_AUTH_SUMMARY.md                 (Ce fichier)
✅ examples/test-auth.sh                 (Script de test bash)
✅ examples/frontend-auth-example.ts     (AuthService frontend)
```

---

## 🎯 Fonctionnalités Implémentées

### 1. **Authentification JWT**

✅ **POST** `/auth/login`

```json
{
  "email": "admin@cybersensei.com",
  "password": "Admin@123456"
}
```

**Retourne** :
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Super Admin",
    "email": "admin@cybersensei.com",
    "role": "SUPERADMIN"
  }
}
```

**Fonctionnalités** :
- Hashing bcrypt (10 rounds)
- Vérification email + mot de passe
- Vérification que l'utilisateur est actif
- Génération JWT (expiration 24h par défaut)
- Mise à jour `lastLoginAt`

---

### 2. **Profil Utilisateur**

✅ **GET** `/auth/me`

**Headers** : `Authorization: Bearer <token>`

**Retourne** :
```json
{
  "id": "uuid",
  "name": "Super Admin",
  "email": "admin@cybersensei.com",
  "role": "SUPERADMIN",
  "active": true,
  "createdAt": "2025-11-24T10:30:00.000Z",
  "lastLoginAt": "2025-11-24T12:45:00.000Z"
}
```

**Cas d'usage** :
- Vérifier la validité du token au chargement de l'app
- Afficher les infos de l'utilisateur connecté
- Rafraîchir le profil

---

### 3. **Créer un Administrateur**

✅ **POST** `/auth/register` (SUPERADMIN uniquement)

```json
{
  "name": "Support Agent",
  "email": "support@cybersensei.com",
  "password": "SecurePass123!",
  "role": "SUPPORT"
}
```

**Validations** :
- Email unique
- Mot de passe minimum 8 caractères
- Role : `SUPERADMIN` ou `SUPPORT`
- Hashing bcrypt automatique

---

### 4. **Lister les Administrateurs**

✅ **GET** `/auth/admins` (SUPERADMIN uniquement)

**Retourne** :
```json
[
  {
    "id": "uuid",
    "name": "Super Admin",
    "email": "admin@cybersensei.com",
    "role": "SUPERADMIN",
    "active": true,
    "createdAt": "2025-11-24T10:30:00.000Z",
    "lastLoginAt": "2025-11-24T12:45:00.000Z"
  }
]
```

---

## 🛡️ RBAC (Role-Based Access Control)

### Rôles Disponibles

| Rôle | Permissions |
|------|-------------|
| **SUPERADMIN** | ✅ Créer/modifier admins<br>✅ Gérer tenants/licences<br>✅ Upload updates<br>✅ Tous les endpoints admin<br>✅ Consultation métriques |
| **SUPPORT** | ✅ Consultation métriques<br>✅ Voir licences<br>✅ Dashboards<br>❌ Créer admins<br>❌ Upload updates<br>❌ Modifier tenants |

---

### Utilisation des Guards

```typescript
// Protéger une route (authentification requise)
@Get('protected')
@UseGuards(JwtAuthGuard)
async protectedRoute(@CurrentUser() user: any) {
  // user = { id, email, role, name }
}

// Protéger par rôle (SUPERADMIN uniquement)
@Post('admin-only')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPERADMIN)
async superAdminRoute() {
  // Accessible uniquement par SUPERADMIN
}

// Protéger par rôles multiples
@Get('metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
async metricsRoute() {
  // Accessible par SUPERADMIN et SUPPORT
}
```

---

## 🔐 Sécurité

### Hashing des Mots de Passe

```typescript
// Création
const passwordHash = await bcrypt.hash(password, 10);

// Vérification
const isValid = await bcrypt.compare(password, passwordHash);
```

**Algorithme** : bcrypt avec 10 rounds de salting

---

### JWT Configuration

**Variables d'environnement** :
```env
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

**Structure du token** :
```json
{
  "sub": "user-uuid",
  "email": "admin@cybersensei.com",
  "role": "SUPERADMIN",
  "iat": 1700828400,
  "exp": 1700914800
}
```

**Extraction** : `Authorization: Bearer <token>`

---

### Admin par Défaut

**Création automatique au démarrage** :
- Email : `admin@cybersensei.com` (ou `ADMIN_EMAIL`)
- Password : `Admin@123456` (ou `ADMIN_PASSWORD`)
- Role : `SUPERADMIN`

**⚠️ IMPORTANT** : Changer le mot de passe en production !

---

## 🔌 Routes Sécurisées

### Actuellement protégées

| Route | Guards | Rôles |
|-------|--------|-------|
| `POST /admin/update/upload` | JwtAuthGuard + RolesGuard | SUPERADMIN |
| `POST /auth/register` | JwtAuthGuard + RolesGuard | SUPERADMIN |
| `GET /auth/admins` | JwtAuthGuard + RolesGuard | SUPERADMIN |
| `GET /auth/me` | JwtAuthGuard | Tous |
| `GET /admin/tenant/:id/metrics` | JwtAuthGuard + RolesGuard | SUPERADMIN + SUPPORT |
| `GET /admin/global/summary` | JwtAuthGuard + RolesGuard | SUPERADMIN + SUPPORT |
| `GET /admin/global/usage-trends` | JwtAuthGuard + RolesGuard | SUPERADMIN + SUPPORT |

---

## 💻 Frontend Implementation

### AuthService (TypeScript)

```typescript
import { AuthService } from './examples/frontend-auth-example';

const authService = new AuthService('http://localhost:3000');

// Login
const { access_token, user } = await authService.login({
  email: 'admin@cybersensei.com',
  password: 'Admin@123456',
});

// Get Profile
const profile = await authService.getProfile();

// Check authentication
if (authService.isAuthenticated()) {
  console.log('User is logged in');
}

// Check role
if (authService.isSuperAdmin()) {
  console.log('User is SUPERADMIN');
}

// Logout
authService.logout();
```

---

### React Example

```typescript
// Login Component
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authService.login({ email, password });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}

// Protected Route
function ProtectedRoute({ children, requiredRole }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && !authService.hasRole(requiredRole)) {
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

### Script de Test

```bash
cd cybersensei-central-backend/examples
./test-auth.sh
```

**Tests effectués** :
1. ✅ Login admin
2. ✅ GET /auth/me
3. ✅ Créer support admin
4. ✅ Liste des admins
5. ✅ Login support
6. ✅ Support essaie de créer admin (403 attendu)
7. ✅ Support accède aux métriques (200 attendu)
8. ✅ Token invalide (401 attendu)

---

### Tests Manuels avec cURL

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cybersensei.com","password":"Admin@123456"}' \
  | jq -r .access_token)

echo "Token: $TOKEN"

# 2. Get Profile
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq .

# 3. Create Support
curl -X POST http://localhost:3000/auth/register \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Support Agent",
    "email": "support@cybersensei.com",
    "password": "Support@123456",
    "role": "SUPPORT"
  }' | jq .

# 4. List Admins
curl -X GET http://localhost:3000/auth/admins \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## 📊 Base de Données

### Table admin_users

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

-- Indexes
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
```

---

## ✅ Checklist de Déploiement

### Configuration
- [ ] Définir `JWT_SECRET` fort (32+ caractères)
- [ ] Configurer `JWT_EXPIRES_IN` (recommandé: 24h)
- [ ] Changer `ADMIN_EMAIL` et `ADMIN_PASSWORD`
- [ ] Activer HTTPS en production

### Base de Données
- [ ] Table `admin_users` créée (via migrations)
- [ ] Indexes créés
- [ ] Admin par défaut créé (automatique)

### Backend
- [ ] Module `AdminAuthModule` importé dans `AppModule`
- [ ] Variables d'environnement configurées
- [ ] Guards appliqués aux routes sensibles
- [ ] Backend démarré : `npm run start:dev`

### Tests
- [ ] Tester login
- [ ] Tester GET /auth/me
- [ ] Tester création admin
- [ ] Tester RBAC (SUPPORT vs SUPERADMIN)
- [ ] Tester token invalide
- [ ] Tester token expiré

### Frontend
- [ ] Implémenter AuthService
- [ ] Page de login
- [ ] Stocker token dans localStorage
- [ ] Protection des routes
- [ ] Gestion expiration token
- [ ] Affichage erreurs

---

## 📈 Statistiques

| Fichier | Lignes | Description |
|---------|--------|-------------|
| `admin-auth.service.ts` | ~110 | Service avec login, register, getProfile |
| `admin-auth.controller.ts` | ~140 | Contrôleur avec 4 endpoints |
| `admin-auth.module.ts` | ~37 | Module NestJS + JWT config |
| `jwt.strategy.ts` | ~40 | Passport JWT strategy |
| `admin-user.entity.ts` | ~47 | Entity TypeORM |
| `jwt-auth.guard.ts` | ~15 | Guard d'authentification |
| `roles.guard.ts` | ~24 | Guard RBAC |
| **Total Code** | **~413 lignes** | TypeScript |
| **Documentation** | **~800 lignes** | Markdown |
| **Frontend Example** | **~600 lignes** | TypeScript (React) |
| **Test Script** | **~250 lignes** | Bash |

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

### 3. Utiliser le Token

```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 Documentation Complète

- **Guide Complet** : [ADMIN_AUTHENTICATION_GUIDE.md](ADMIN_AUTHENTICATION_GUIDE.md)
- **Frontend Example** : [examples/frontend-auth-example.ts](examples/frontend-auth-example.ts)
- **Test Script** : [examples/test-auth.sh](examples/test-auth.sh)
- **Swagger UI** : http://localhost:3000/api

---

## 🎉 Résumé

**✅ Système d'authentification production-ready** :
- **4 endpoints API** (login, me, register, admins)
- **JWT avec bcrypt** (sécurité maximale)
- **RBAC** (SUPERADMIN + SUPPORT)
- **Guards réutilisables** (JwtAuthGuard, RolesGuard)
- **Admin par défaut** (création automatique)
- **Frontend ready** (AuthService complet)

**Fonctionnalités clés** :
- ✅ Authentification JWT
- ✅ Hashing bcrypt (10 rounds)
- ✅ RBAC (2 niveaux)
- ✅ Protection des routes
- ✅ Guards et decorators
- ✅ Admin par défaut
- ✅ Frontend AuthService
- ✅ Script de test complet

**🚀 Le système d'authentification est prêt pour la production !**

**Credentials par défaut** :
- Email : `admin@cybersensei.com`
- Password : `Admin@123456`

**⚠️ Changer le mot de passe en production !**

