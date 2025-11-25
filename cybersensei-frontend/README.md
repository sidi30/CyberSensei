# CyberSensei Frontend

Interface React moderne pour la plateforme CyberSensei de formation en cybersécurité.

## 🎨 Stack Technique

- **React 18** + **TypeScript**
- **Tailwind CSS** - Design moderne et responsive
- **Axios** - Requêtes HTTP
- **Chart.js** + **react-chartjs-2** - Graphiques et visualisations
- **Context API** - Gestion de l'état (auth, user data)
- **Microsoft Teams SDK** - Intégration Teams

## 📋 Fonctionnalités

### Onglet Employé
- ✅ Header avec photo et nom de l'utilisateur
- ✅ Section "Statut CyberSensei" (dernier quiz, score global)
- ✅ Section "Exercice du jour" avec quiz MCQ interactifs
- ✅ Soumission des réponses avec feedback instantané
- ✅ Section "Demandez à CyberSensei" - Chat IA
- ✅ Gestion complète des états de chargement et d'erreur

### Onglet Manager
- ✅ KPIs en temps réel (score entreprise, participation, statut)
- ✅ Tableau des utilisateurs avec filtres
- ✅ Panneau de détails utilisateur (drawer)
- ✅ Répartition par sujet pour chaque utilisateur
- ✅ Résultats de phishing
- ✅ Actions recommandées
- ✅ Graphique des tendances (Chart.js)
- ✅ Paramètres (fréquence phishing, intensité formation)

## 🚀 Installation

### Prérequis
- Node.js 18+ et npm/yarn
- Backend CyberSensei en cours d'exécution

### Setup

1. **Installation des dépendances**
```bash
cd cybersensei-frontend
npm install
```

2. **Configuration**
```bash
cp .env.example .env
```

Éditer `.env` :
```env
REACT_APP_API_URL=http://localhost:8080/api
```

3. **Lancer en développement**
```bash
npm start
```

L'application sera disponible sur `http://localhost:3000`

## 📦 Build Production

```bash
npm run build
```

Le build optimisé sera dans le dossier `build/`.

## 🏗️ Structure du Projet

```
cybersensei-frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── EmployeeTab.tsx      # Onglet employé complet
│   │   ├── ManagerTab.tsx       # Onglet manager avec KPIs
│   │   ├── LoadingSpinner.tsx   # Composant de chargement
│   │   └── ErrorMessage.tsx     # Gestion des erreurs
│   ├── context/
│   │   └── AuthContext.tsx      # Context API pour auth
│   ├── services/
│   │   └── api.ts               # Service API Axios
│   ├── types/
│   │   └── index.ts             # Types TypeScript
│   ├── App.tsx                  # Composant principal
│   ├── index.tsx                # Point d'entrée
│   └── index.css                # Styles Tailwind
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 🎯 Composants Principaux

### EmployeeTab

**Fonctionnalités:**
- Affichage du profil utilisateur avec photo/initiale
- Statut : dernier quiz + score global
- Quiz interactif avec :
  - Questions MCQ depuis `payloadJSON`
  - Validation en temps réel
  - Feedback avec score et explication
  - Timer automatique
- Chat IA :
  - Interface conversationnelle
  - Historique des messages
  - Support Entrée/Shift+Entrée

**Endpoints utilisés:**
- `GET /api/user/me` - Données utilisateur
- `GET /api/quiz/today` - Quiz du jour
- `POST /api/exercise/{id}/submit` - Soumission réponse
- `POST /api/ai/chat` - Questions IA

### ManagerTab

**Fonctionnalités:**
- 3 KPIs clés :
  - Score entreprise avec niveau de risque
  - Taux de participation
  - Statut de mise à jour
- Tableau utilisateurs avec :
  - Nom, département, score, risque
  - Barre de progression visuelle
  - Tri et filtrage
- Drawer de détails utilisateur :
  - Statistiques individuelles
  - Répartition par sujet (barres de progression)
  - Résultats de phishing
  - Actions recommandées personnalisées
- Graphique des tendances :
  - Chart.js Line chart
  - Score de sécurité vs taux de clics phishing
  - Données historiques sur 4 semaines
- Section Paramètres :
  - Fréquence phishing (0-7 par semaine)
  - Intensité formation (low/medium/high)
  - Sauvegarde vers backend

**Endpoints utilisés:**
- `GET /api/manager/metrics` - Métriques entreprise
- `GET /api/settings` - Paramètres actuels
- `POST /api/settings/save` - Sauvegarde paramètres

## 🎨 Design System

### Couleurs Tailwind

```js
primary: Blue (#3b82f6)    // Actions principales
success: Green (#22c55e)   // Succès, scores élevés
danger: Red (#ef4444)      // Erreurs, risques
warning: Yellow (#eab308)  // Avertissements
```

### Responsive

- **Mobile-first** : Design optimisé pour mobile
- **Breakpoints** : sm (640px), md (768px), lg (1024px)
- **Teams-compatible** : Testé dans l'interface Teams

## 🔐 Authentification

Le frontend utilise **JWT** stocké dans `localStorage`:

```typescript
// Login
const response = await apiService.login({ email, password });
localStorage.setItem('authToken', response.token);

// Requêtes authentifiées
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Gestion 401

Redirection automatique vers login si token invalide.

## 📊 Gestion des États

### Loading States

Tous les composants gèrent 3 états :
- `loading` - Affichage du spinner
- `error` - Message d'erreur avec retry
- `data` - Données chargées

```tsx
{loading && <LoadingSpinner />}
{error && <ErrorMessage message={error} onRetry={loadData} />}
{data && <Content data={data} />}
```

### Context API

```typescript
const { user, loading, error, login, logout } = useAuth();
```

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Coverage
npm test -- --coverage
```

## 🐛 Debugging

### React DevTools
Installer l'extension React DevTools pour Chrome/Firefox

### Network Monitoring
Vérifier les requêtes API dans l'onglet Network

### Common Issues

**CORS Errors:**
```
Configurer le backend pour accepter http://localhost:3000
```

**401 Unauthorized:**
```
Vérifier que le token JWT est valide et non expiré
```

**API not reachable:**
```
Vérifier que REACT_APP_API_URL pointe vers le bon backend
```

## 📱 Intégration Microsoft Teams

Pour intégrer dans Teams :

1. **Configuration Teams manifest**
2. **Initialiser SDK**
```typescript
import * as microsoftTeams from '@microsoft/teams-js';

microsoftTeams.initialize();
```

3. **Récupérer contexte**
```typescript
microsoftTeams.getContext((context) => {
  // context.userPrincipalName
  // context.upn
});
```

## 🚢 Déploiement

### Nginx

```nginx
server {
    listen 80;
    server_name cybersensei.company.com;
    root /var/www/cybersensei/build;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:8080;
    }
}
```

### Docker

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📈 Performance

- **Code splitting** : Automatique avec React lazy loading
- **Image optimization** : Utiliser WebP pour les avatars
- **Bundle size** : ~200KB gzipped avec Tailwind purge

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Proprietary - CyberSensei Platform

## 📞 Support

Pour toute question : frontend@cybersensei.io

---

**Développé avec ❤️ par l'équipe CyberSensei**


