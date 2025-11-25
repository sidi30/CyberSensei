# 🛡️ CyberSensei Central Dashboard

Dashboard React d'administration pour la plateforme SaaS CyberSensei Central.

---

## 🎯 Vue d'Ensemble

Dashboard moderne et responsive pour administrer la plateforme CyberSensei Central :
- **Gestion des tenants** (clients multi-tenants)
- **Monitoring en temps réel** (métriques, santé, activité)
- **Gestion des mises à jour** (upload, historique, déploiement)
- **Administration utilisateurs** (RBAC avec SUPERADMIN/SUPPORT)
- **Dashboards et graphiques** (Recharts, métriques agrégées)

---

## 🚀 Tech Stack

| Technologie | Version | Usage |
|-------------|---------|-------|
| **React** | 18.2 | Framework UI |
| **TypeScript** | 5.2 | Typage statique |
| **Vite** | 5.0 | Build tool |
| **TailwindCSS** | 3.3 | Styling |
| **React Router** | 6.20 | Navigation |
| **Axios** | 1.6 | HTTP client |
| **Recharts** | 2.10 | Graphiques |
| **Lucide React** | 0.294 | Icônes |
| **date-fns** | 2.30 | Manipulation dates |

---

## 📦 Installation

### Prérequis

- Node.js 18+ et npm
- Backend CyberSensei Central en cours d'exécution (port 3000)

### Étapes

```bash
# Cloner le projet (si pas déjà fait)
git clone <repo-url>
cd cybersensei-central-dashboard

# Installer les dépendances
npm install

# Configurer les variables d'environnement
echo "VITE_API_URL=http://localhost:3000" > .env

# Lancer en mode développement
npm run dev
```

Le dashboard sera accessible à `http://localhost:3001`

---

## 🗂️ Structure du Projet

```
cybersensei-central-dashboard/
├── public/                     # Assets statiques
├── src/
│   ├── components/             # Composants réutilisables
│   │   ├── Layout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── context/                # Context React
│   │   └── AuthContext.tsx    # Gestion authentification
│   │
│   ├── lib/                    # Utilitaires
│   │   ├── api.ts             # Client API Axios
│   │   └── utils.ts           # Fonctions utilitaires
│   │
│   ├── pages/                  # Pages/vues
│   │   ├── LoginPage.tsx       # Connexion JWT
│   │   ├── DashboardPage.tsx   # Dashboard global
│   │   ├── TenantsListPage.tsx # Liste des tenants
│   │   ├── TenantDetailsPage.tsx # Détails tenant
│   │   ├── UpdatesPage.tsx     # Gestion mises à jour
│   │   └── AdminUsersPage.tsx  # Gestion admins
│   │
│   ├── types/                  # Types TypeScript
│   │   └── index.ts           # Interfaces API
│   │
│   ├── App.tsx                 # App principale + routing
│   ├── main.tsx                # Point d'entrée
│   └── index.css               # Styles Tailwind
│
├── Dockerfile                  # Image Docker production
├── nginx.conf                  # Configuration Nginx
├── docker-compose.yml          # Orchestration
├── package.json                # Dépendances npm
├── tsconfig.json               # Config TypeScript
├── vite.config.ts              # Config Vite
├── tailwind.config.js          # Config Tailwind
└── README.md                   # Ce fichier
```

---

## 🔑 Authentification

### Connexion

Le dashboard utilise JWT pour l'authentification.

**Credentials par défaut** :
- Email : `admin@cybersensei.com`
- Password : `Admin@123456`

### Flux d'authentification

1. L'utilisateur se connecte via `/login`
2. Le backend retourne un JWT token
3. Le token est stocké dans `localStorage`
4. Toutes les requêtes incluent `Authorization: Bearer <token>`
5. Le token est validé à chaque requête
6. Si invalide/expiré → redirection vers `/login`

---

## 📄 Pages & Fonctionnalités

### 1. **Dashboard Global** (`/dashboard`)

**Accessible par** : SUPERADMIN, SUPPORT

**Contenu** :
- ✅ Vue d'ensemble de la plateforme
- ✅ Statistiques temps réel (tenants actifs, users, exercices)
- ✅ Santé des tenants (healthy, warning, critical)
- ✅ Statut des licences (actives, expirées, expirant bientôt)
- ✅ Distribution des versions
- ✅ Alertes critiques

### 2. **Liste des Tenants** (`/tenants`)

**Accessible par** : SUPERADMIN, SUPPORT

**Fonctionnalités** :
- ✅ Tableau de tous les tenants
- ✅ Recherche par nom/email
- ✅ Statut de santé (dernière activité)
- ✅ Version installée
- ✅ Nombre d'utilisateurs actifs
- ✅ Lien vers détails

### 3. **Détails Tenant** (`/tenants/:id`)

**Accessible par** : SUPERADMIN, SUPPORT

**Contenu** :
- ✅ Informations tenant (nom, email, licence)
- ✅ Métriques agrégées (24h, 7j, 30j)
- ✅ Graphiques d'activité (Recharts)
- ✅ Tendances (croissante/décroissante/stable)
- ✅ Uptime, latence IA, exercices

### 4. **Gestion Mises à Jour** (`/updates`)

**Accessible par** : SUPERADMIN uniquement

**Fonctionnalités** :
- ✅ Upload de fichiers ZIP
- ✅ Extraction automatique de `version.json`
- ✅ Historique des versions
- ✅ Téléchargement des packages
- ✅ Métadonnées (version, changelog, requis)

**Format version.json** :
```json
{
  "version": "1.0.1",
  "changelog": "Fixed critical bugs...",
  "requiredNodeVersion": "1.0.0"
}
```

### 5. **Gestion Administrateurs** (`/admins`)

**Accessible par** : SUPERADMIN uniquement

**Fonctionnalités** :
- ✅ Liste des admins
- ✅ Création de nouveaux admins
- ✅ Rôles : SUPERADMIN / SUPPORT
- ✅ Statut actif/inactif
- ✅ Dernière connexion

---

## 🎨 Composants Réutilisables

### Layout

```tsx
// Layout principal avec sidebar et header
<DashboardLayout>
  <Outlet /> {/* Pages enfants */}
</DashboardLayout>
```

### ProtectedRoute

```tsx
// Protection par authentification
<ProtectedRoute>
  <YourPage />
</ProtectedRoute>

// Protection par rôle
<ProtectedRoute requiredRole={AdminRole.SUPERADMIN}>
  <AdminOnlyPage />
</ProtectedRoute>
```

### AuthContext

```tsx
// Utiliser l'authentification dans un composant
const { user, isAuthenticated, isSuperAdmin, login, logout } = useAuth();

if (isSuperAdmin) {
  // Afficher fonctionnalités SUPERADMIN
}
```

---

## 🔌 API Client

Le client API (`src/lib/api.ts`) encapsule toutes les requêtes vers le backend.

### Utilisation

```typescript
import { api } from '@/lib/api';

// Login
const response = await api.login({ email, password });

// Get tenants
const tenants = await api.getTenants();

// Get metrics
const metrics = await api.getAggregatedMetrics(tenantId, '7d');

// Upload update
await api.uploadUpdate(file);

// Create admin
await api.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'SUPPORT',
});
```

### Intercepteurs

**Request Interceptor** : Ajoute automatiquement le JWT token

```typescript
config.headers.Authorization = `Bearer ${token}`;
```

**Response Interceptor** : Gère les erreurs 401 (token expiré)

```typescript
if (error.response?.status === 401) {
  // Logout et redirection vers /login
}
```

---

## 🎨 Tailwind CSS

### Classes Utilitaires Personnalisées

```css
.btn                 /* Bouton de base */
.btn-primary         /* Bouton primaire (bleu) */
.btn-secondary       /* Bouton secondaire (gris) */
.btn-danger          /* Bouton danger (rouge) */
.btn-sm              /* Bouton petit */

.input               /* Input de formulaire */

.card                /* Carte blanche avec bordure */

.badge               /* Badge de statut */
.badge-success       /* Badge succès (vert) */
.badge-warning       /* Badge attention (orange) */
.badge-danger        /* Badge danger (rouge) */
.badge-gray          /* Badge neutre (gris) */
```

### Couleurs

```javascript
primary: bleu (#3b82f6)
danger: rouge (#ef4444)
success: vert (#22c55e)
warning: orange (#f59e0b)
```

---

## 🐳 Docker

### Build de l'image

```bash
docker build -t cybersensei-dashboard .
```

### Run avec Docker

```bash
docker run -p 3001:80 \
  -e VITE_API_URL=http://localhost:3000 \
  cybersensei-dashboard
```

### Docker Compose

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Rebuild
docker-compose up -d --build
```

Le dashboard sera accessible à `http://localhost:3001`

---

## 🔧 Scripts NPM

| Script | Description |
|--------|-------------|
| `npm run dev` | Démarrer en mode développement (port 3001) |
| `npm run build` | Build de production dans `/dist` |
| `npm run preview` | Prévisualiser le build de production |
| `npm run lint` | Linter le code TypeScript/React |
| `npm run type-check` | Vérifier les types TypeScript |

---

## 🌐 Configuration

### Variables d'Environnement

Créez un fichier `.env` à la racine :

```env
# URL du backend
VITE_API_URL=http://localhost:3000

# Environnement
VITE_ENV=development
```

**Production** :
```env
VITE_API_URL=https://api.cybersensei.com
VITE_ENV=production
```

### Vite Proxy

Le fichier `vite.config.ts` inclut un proxy pour le développement :

```typescript
server: {
  port: 3001,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

---

## 🚀 Déploiement

### Build Production

```bash
npm run build
```

Les fichiers sont générés dans `/dist`

### Nginx (Production)

```nginx
server {
    listen 80;
    server_name dashboard.cybersensei.com;
    root /var/www/cybersensei-dashboard;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Variables d'Environnement Runtime

Pour changer l'URL du backend sans rebuild :

```bash
# Créer un fichier config.js dynamique
echo "window.ENV = { API_URL: 'https://api.cybersensei.com' }" > dist/config.js

# Inclure dans index.html
<script src="/config.js"></script>
```

---

## 📊 Graphiques (Recharts)

### Exemple d'utilisation

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="exercises" stroke="#3b82f6" strokeWidth={2} />
  </LineChart>
</ResponsiveContainer>
```

---

## 🔒 Sécurité

### Headers HTTP (Nginx)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### HTTPS

En production, **toujours utiliser HTTPS** :

```bash
# Avec Let's Encrypt
certbot --nginx -d dashboard.cybersensei.com
```

### CORS

Le backend doit autoriser l'origine du dashboard :

```typescript
// Backend NestJS
app.enableCors({
  origin: 'https://dashboard.cybersensei.com',
  credentials: true,
});
```

---

## 🧪 Tests

### Tests Manuels

1. **Login** : `http://localhost:3001/login`
2. **Dashboard** : Vérifier les statistiques
3. **Tenants** : Créer/éditer un tenant
4. **Détails** : Afficher les graphiques
5. **Updates** : Upload un ZIP
6. **Admins** : Créer un user SUPPORT

### Tests API

Utilisez le backend pour tester :

```bash
# Démarrer le backend
cd cybersensei-central-backend
npm run start:dev

# Démarrer le dashboard
cd cybersensei-central-dashboard
npm run dev
```

---

## 📚 Documentation Backend

- **Backend** : `../cybersensei-central-backend/README.md`
- **API Auth** : `../cybersensei-central-backend/ADMIN_AUTHENTICATION_GUIDE.md`
- **Telemetry** : `../cybersensei-central-backend/TELEMETRY_SERVICE_GUIDE.md`
- **Updates** : `../cybersensei-central-backend/UPDATE_SERVICE_GUIDE.md`

---

## 🆘 Troubleshooting

### Erreur CORS

**Problème** : `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution** : Vérifier que le backend autorise l'origine du dashboard

```typescript
// Backend app.module.ts
app.enableCors({
  origin: 'http://localhost:3001',
});
```

---

### Token expiré

**Problème** : Redirection automatique vers `/login`

**Solution** : Normal après 24h. Se reconnecter. Pour changer l'expiration :

```env
# Backend .env
JWT_EXPIRES_IN=7d
```

---

### Build failed

**Problème** : Erreurs TypeScript lors du build

**Solution** :
```bash
# Vérifier les types
npm run type-check

# Nettoyer et réinstaller
rm -rf node_modules dist
npm install
npm run build
```

---

## 📈 Roadmap

- [ ] Tests unitaires (Jest + React Testing Library)
- [ ] Tests E2E (Playwright)
- [ ] Mode sombre
- [ ] Notifications temps réel (WebSockets)
- [ ] Export des rapports (PDF/CSV)
- [ ] Internationalisation (i18n)
- [ ] PWA (Progressive Web App)

---

## 📝 License

© 2025 CyberSensei. Tous droits réservés.

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

---

**✅ Dashboard complet et production-ready !**

Pour démarrer :
```bash
npm install
npm run dev
```

Ouvrir `http://localhost:3001` et se connecter avec :
- Email : `admin@cybersensei.com`
- Password : `Admin@123456`

