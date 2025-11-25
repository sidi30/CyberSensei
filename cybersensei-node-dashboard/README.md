# 📊 CyberSensei Manager Dashboard

> **Application React Dashboard pour la gestion et le monitoring de la plateforme CyberSensei**

---

## 🎯 Vue d'Ensemble

Dashboard React moderne pour les managers CyberSensei permettant de:
- 📈 Visualiser les métriques de sécurité de l'entreprise
- 👥 Gérer les utilisateurs et analyser leurs performances
- 📚 Créer et gérer les exercices de formation
- 📧 Piloter les campagnes de phishing simulées
- ⚙️ Configurer les paramètres du système

---

## 🚀 Stack Technique

- ⚛️ **React 18** - Library UI
- 📘 **TypeScript** - Type safety
- ⚡ **Vite** - Build tool ultra-rapide
- 🎨 **TailwindCSS** - Utility-first CSS
- 🛣️ **React Router** - Navigation SPA
- 🌐 **Axios** - HTTP client
- 📊 **Recharts** - Data visualization
- 🎯 **Lucide React** - Modern icons
- 🔐 **JWT** - Authentication

---

## 📋 Prérequis

- Node.js 18+ et npm
- Backend CyberSensei démarré (port 8080)

---

## ⚡ Quick Start

### 1. Installation

```bash
# Clone le repository
cd cybersensei-node-dashboard

# Installer les dépendances
npm install

# Copier le fichier d'environment
cp .env.example .env

# Éditer .env avec l'URL du backend
nano .env
```

### 2. Development

```bash
# Démarrer le serveur de développement
npm run dev

# L'application est accessible sur http://localhost:3000
```

### 3. Build Production

```bash
# Build l'application
npm run build

# Preview du build
npm run preview
```

---

## 🐳 Docker

### Build & Run

```bash
# Build l'image Docker
docker build -t cybersensei-dashboard .

# Run le container
docker run -d \
  -p 80:80 \
  --name cybersensei-dashboard \
  cybersensei-dashboard

# Accès: http://localhost
```

### Docker Compose

```yaml
version: '3.8'

services:
  dashboard:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://backend:8080/api
    depends_on:
      - backend

  backend:
    image: cybersensei-backend:latest
    ports:
      - "8080:8080"
```

```bash
docker-compose up -d
```

---

## 📁 Structure du Projet

```
cybersensei-node-dashboard/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── Layout/         # Layout (Sidebar, Header)
│   │   ├── Common/         # Composants communs (Button, Card, etc.)
│   │   └── Dashboard/      # Composants dashboard
│   │
│   ├── pages/              # Pages principales
│   │   ├── Login.tsx
│   │   ├── Overview.tsx
│   │   ├── Users/
│   │   ├── Exercises/
│   │   ├── Phishing/
│   │   └── Settings/
│   │
│   ├── context/            # React Context (Auth)
│   ├── services/           # API client (Axios)
│   ├── types/              # TypeScript types
│   ├── App.tsx             # App principal + Router
│   └── main.tsx            # Entry point
│
├── public/                 # Assets statiques
├── Dockerfile              # Multi-stage Docker build
├── nginx.conf              # Nginx configuration
└── package.json            # Dependencies
```

---

## 🔑 Fonctionnalités

### ✅ Authentication
- Login avec email/password
- JWT token management
- Protected routes
- Auto-redirect si non authentifié

### ✅ Overview Dashboard
- KPIs cards (score, risk level, participation)
- Trend charts (score evolution, exercises)
- Recent activity feed
- Quick actions

### ✅ Users Management
- Liste des utilisateurs (table)
- Filtres et recherche
- Détails utilisateur (profil, stats, progression)
- Recommandations personnalisées

### ✅ Exercises Panel
- Liste des exercices
- CRUD operations
- Filtres par topic/difficulty
- Statistiques par exercise

### ✅ Phishing Campaigns
- Active campaigns monitoring
- Campaign history
- Templates management
- Send new campaign

### ✅ Settings
- **SMTP Configuration** (host, port, credentials)
- **Frequency Config** (phishing frequency, training intensity)
- **Sync & Updates** (update status, manual triggers)
- **License Info** (type, expiration, features)

---

## 🌐 API Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/auth/login` | POST | Login |
| `/api/user/me` | GET | User actuel |
| `/api/manager/metrics` | GET | Métriques entreprise |
| `/api/manager/users-metrics` | GET | Métriques utilisateurs |
| `/api/user` | GET | Liste users |
| `/api/exercises` | GET | Liste exercises |
| `/api/phishing/results` | GET | Résultats phishing |
| `/api/phishing/send` | POST | Envoyer campagne |
| `/api/settings/save` | POST | Sauvegarder settings |
| `/api/sync/status` | GET | Statut sync |
| `/api/sync/update/check` | POST | Check updates |

Voir `src/services/api.ts` pour la liste complète.

---

## 🎨 Customisation

### Couleurs (Tailwind)

Édit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: { /* ... */ },
      danger: { /* ... */ },
      success: { /* ... */ },
      warning: { /* ... */ },
    }
  }
}
```

### Logo

Remplacer `/public/logo.svg`

### Environnement

```bash
# .env
VITE_API_URL=http://localhost:8080/api
```

---

## 🧪 Tests

```bash
# Linter
npm run lint

# Type check
npx tsc --noEmit
```

---

## 🚨 Troubleshooting

### Erreur: CORS

**Solution:**
- Vérifier que le backend autorise `http://localhost:3000` dans CORS
- Ou utiliser le proxy Vite (déjà configuré)

### Erreur: API non accessible

**Solution:**
1. Vérifier `VITE_API_URL` dans `.env`
2. Vérifier que le backend est démarré (port 8080)
3. Tester: `curl http://localhost:8080/api/health`

### Erreur: Login failed

**Solution:**
- Vérifier les credentials
- Vérifier JWT configuration côté backend
- Check console browser pour détails

---

## 📦 Build & Deploy

### Build Production

```bash
npm run build
# Output: dist/
```

### Deploy sur Nginx

```bash
# Copier les fichiers build
cp -r dist/* /var/www/html/

# Nginx config
location / {
  try_files $uri $uri/ /index.html;
}
```

### Deploy sur Docker

```bash
docker build -t cybersensei-dashboard:1.0.0 .
docker push your-registry/cybersensei-dashboard:1.0.0
```

---

## 🔒 Sécurité

### JWT Storage
- Token stocké dans `localStorage`
- Envoyé via header `Authorization: Bearer {token}`
- Supprimé automatiquement si 401

### HTTPS
En production, toujours utiliser HTTPS:
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    # ...
}
```

---

## 📚 Documentation Complète

Voir `DASHBOARD_SUMMARY.md` pour:
- Architecture détaillée
- Liste complète des composants
- API endpoints
- Charts & visualizations

---

## 🎯 Roadmap (Optional)

- [ ] Dark mode
- [ ] Real-time updates (WebSocket)
- [ ] Export data (CSV, PDF)
- [ ] Notifications system
- [ ] Multi-language (i18n)
- [ ] PWA support
- [ ] E2E tests

---

## 🤝 Support

**Documentation:**
- README.md (ce fichier)
- DASHBOARD_SUMMARY.md (architecture complète)

**Logs:**
```bash
# Browser console
F12 → Console

# Nginx logs (Docker)
docker logs cybersensei-dashboard
```

---

## 📝 License

MIT License - © 2024 CyberSensei

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Tech**: React + TypeScript + Vite + TailwindCSS


