# CyberSensei - Application Microsoft Teams

> **Version 2.0 - Interface Simplifiée** 🎉

Application Microsoft Teams avec interface de conversation moderne pour la formation en cybersécurité.

## 🆕 Nouveautés Version 2.0

✨ **Interface complètement repensée** - Conversation simple et fluide  
🎨 **Design professionnel** - Inspiré des meilleures applications Teams  
🔗 **Connexion clarifiée** - Se connecte au backend **cybersensei-node**  
📱 **Expérience unifiée** - Plus de catégories complexes  

👉 **[Voir le guide complet : README_NOUVEAU.md](./README_NOUVEAU.md)**

## 📋 Table des matières

- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Développement](#développement)
- [Build & Déploiement](#build--déploiement)
- [Package & Sideloading](#package--sideloading)
- [Structure du projet](#structure-du-projet)

## 🏗️ Architecture

```
cybersensei-teams-app/
├── tabs/
│   ├── employee/          # Onglet React pour employés
│   └── manager/           # Onglet React pour managers
├── bot/                   # Bot conversationnel (Bot Framework)
├── common/                # Code partagé (API client, config)
├── manifest/              # Manifest Teams et assets
└── scripts/               # Scripts utilitaires
```

### Composants principaux

1. **Onglet Employee** - Interface pour les utilisateurs finaux
   - Quiz quotidien
   - Historique des résultats
   - Chat avec l'assistant IA

2. **Onglet Manager** - Tableau de bord pour les managers
   - Métriques de l'entreprise
   - Suivi des utilisateurs
   - Performance par département
   - Informations de licence

3. **Bot CyberSensei Assistant** - Assistant conversationnel
   - Commandes : `quiz`, `score`, `help`, `explain`
   - Chat avec IA
   - Cartes adaptives

## 📦 Prérequis

- **Node.js** 18.x ou supérieur
- **npm** 8.x ou supérieur
- **TypeScript** 5.x
- Compte **Microsoft 365** avec permissions pour sideloader des apps
- Compte **Azure** pour enregistrer le bot (optionnel pour dev)
- Backend **CyberSensei** en cours d'exécution

## 🚀 Installation

### 1. Cloner et installer les dépendances

```bash
# Installer les dépendances globales (si nécessaire)
npm install -g typescript ts-node

# Lancer le script de setup
npm run setup
```

Le script `setup` va :
- Créer le fichier `.env` depuis `.env.example`
- Installer les dépendances pour tous les modules
- Vérifier la configuration

### 2. Installation manuelle (alternative)

```bash
# Installer les dépendances du module common
cd common && npm install && cd ..

# Installer les dépendances du bot
cd bot && npm install && cd ..

# Installer les dépendances des onglets
cd tabs/employee && npm install && cd ../..
cd tabs/manager && npm install && cd ../..
```

## ⚙️ Configuration

### 1. Configuration du backend

Éditez le fichier `.env` à la racine du projet :

```env
# URL du backend CyberSensei
BACKEND_BASE_URL=https://cybersensei.local:8080

# Configuration du bot (voir section Bot Configuration)
BOT_ID=<votre-bot-id>
BOT_PASSWORD=<votre-bot-password>

# Configuration Microsoft App
MICROSOFT_APP_ID=<votre-app-id>
MICROSOFT_APP_PASSWORD=<votre-app-password>
MICROSOFT_APP_TENANT_ID=<votre-tenant-id>

# Environnement
NODE_ENV=development
PORT=3978
```

### 2. Configuration du Bot (Azure)

#### Créer une App Registration dans Azure AD

1. Allez sur [Azure Portal](https://portal.azure.com)
2. Naviguez vers **Azure Active Directory** > **App registrations**
3. Cliquez sur **New registration**
4. Configurez :
   - **Name**: CyberSensei Bot
   - **Supported account types**: Accounts in any organizational directory (Multitenant)
   - **Redirect URI**: Laissez vide pour l'instant
5. Notez l'**Application (client) ID** → c'est votre `MICROSOFT_APP_ID` et `BOT_ID`

#### Créer un Client Secret

1. Dans votre App Registration, allez à **Certificates & secrets**
2. Cliquez sur **New client secret**
3. Donnez une description et choisissez une expiration
4. Notez la **Value** → c'est votre `BOT_PASSWORD` et `MICROSOFT_APP_PASSWORD`

#### Créer le Bot dans Azure Bot Service

1. Dans Azure Portal, créez une nouvelle ressource **Azure Bot**
2. Configurez :
   - **Bot handle**: cybersensei-bot
   - **Subscription**: Votre souscription
   - **Resource group**: Créez-en un nouveau ou utilisez un existant
   - **Pricing tier**: F0 (gratuit pour le développement)
   - **Microsoft App ID**: Use existing app registration
   - Entrez l'App ID créé précédemment
3. Une fois créé, allez dans **Configuration**
4. Ajoutez l'endpoint de messaging : `https://<votre-domaine>/api/messages`

#### Configurer le canal Teams

1. Dans votre Azure Bot, allez à **Channels**
2. Cliquez sur **Microsoft Teams**
3. Acceptez les termes et conditions
4. Le canal Teams est maintenant activé

### 3. Permissions API

Dans votre App Registration Azure AD :

1. Allez à **API permissions**
2. Ajoutez les permissions suivantes :
   - Microsoft Graph API :
     - `User.Read` (Delegated)
     - `email` (Delegated)
     - `profile` (Delegated)
3. Cliquez sur **Grant admin consent**

## 💻 Développement

### Lancer le bot en mode développement

```bash
cd bot
npm run dev
```

Le bot sera accessible sur `http://localhost:3978`

Pour tester localement avec Teams, utilisez [ngrok](https://ngrok.com/) :

```bash
ngrok http 3978
```

Mettez à jour l'endpoint dans Azure Bot avec l'URL ngrok : `https://<votre-id>.ngrok.io/api/messages`

### Lancer l'onglet Employee en mode développement

```bash
cd tabs/employee
npm run dev
```

L'onglet sera accessible sur `https://localhost:3000`

### Lancer l'onglet Manager en mode développement

```bash
cd tabs/manager
npm run dev
```

L'onglet sera accessible sur `https://localhost:3001`

### Développement simultané

Ouvrez 3 terminaux et lancez :

```bash
# Terminal 1 - Bot
cd bot && npm run dev

# Terminal 2 - Employee Tab
cd tabs/employee && npm run dev

# Terminal 3 - Manager Tab
cd tabs/manager && npm run dev
```

## 🏗️ Build & Déploiement

### Build de tous les composants

```bash
# Depuis la racine
npm run build
```

Ou individuellement :

```bash
# Build common
cd common && npm run build

# Build bot
cd bot && npm run build

# Build tabs
cd tabs/employee && npm run build
cd tabs/manager && npm run build
```

### Déploiement

#### Déploiement du Bot

Le bot peut être déployé sur :
- **Azure App Service**
- **Azure Container Instances**
- **Tout serveur Node.js**

Exemple pour Azure App Service :

```bash
cd bot
npm run build

# Déployer avec Azure CLI
az webapp up --name cybersensei-bot --resource-group <resource-group>
```

#### Déploiement des Tabs

Les tabs peuvent être déployés sur :
- **Azure Static Web Apps**
- **Azure Storage Static Website**
- **Netlify, Vercel, etc.**
- **Tout hébergement web statique**

Exemple pour Azure Static Web Apps :

```bash
cd tabs/employee
npm run build

# Déployer avec Azure CLI
az staticwebapp create \
  --name cybersensei-employee \
  --resource-group <resource-group> \
  --location "West Europe" \
  --source ./dist
```

Répétez pour l'onglet manager.

## 📦 Package & Sideloading

### 1. Créer les icônes

Créez deux icônes dans le dossier `manifest/` :

- **color.png** : 192x192px, logo couleur avec fond #0078D4
- **outline.png** : 32x32px, logo outline blanc sur fond transparent

### 2. Créer le package Teams

```bash
# Depuis la racine
npm run package
```

Le script vous demandera :
- Microsoft App ID
- Bot ID (appuyez sur Entrée pour utiliser l'App ID)
- Hostname (ex: myapp.azurewebsites.net)

Un fichier `cybersensei-teams-app.zip` sera créé.

### 3. Sideloader dans Teams

1. Ouvrez **Microsoft Teams**
2. Cliquez sur **Applications** dans la barre latérale
3. Cliquez sur **Gérer vos applications** en bas
4. Cliquez sur **Publier une application** → **Envoyer une application personnalisée**
5. Sélectionnez le fichier `cybersensei-teams-app.zip`
6. Cliquez sur **Ajouter** pour installer l'application

### 4. Tester l'application

Une fois installée :
- Les onglets **Formation** et **Manager** apparaîtront dans l'application
- Le bot sera accessible via la conversation
- Tapez `help` pour voir les commandes disponibles

## 📁 Structure du projet

```
cybersensei-teams-app/
│
├── common/                       # Module partagé
│   ├── apiClient.ts             # Client API backend
│   ├── graphClient.ts           # Client Microsoft Graph
│   ├── config.ts                # Configuration commune
│   └── package.json
│
├── tabs/
│   ├── employee/                # Onglet employé
│   │   ├── src/
│   │   │   ├── components/      # Composants React
│   │   │   │   ├── QuizSection.tsx
│   │   │   │   ├── HistorySection.tsx
│   │   │   │   └── ChatSection.tsx
│   │   │   ├── hooks/           # Hooks personnalisés
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useApi.ts
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── manager/                 # Onglet manager
│       ├── src/
│       │   ├── components/      # Composants React
│       │   │   ├── MetricsOverview.tsx
│       │   │   ├── UsersTable.tsx
│       │   │   ├── DepartmentChart.tsx
│       │   │   └── LicenseInfo.tsx
│       │   ├── hooks/
│       │   ├── App.tsx
│       │   └── main.tsx
│       └── package.json
│
├── bot/                         # Bot conversationnel
│   ├── src/
│   │   ├── bot.ts              # Logique principale du bot
│   │   ├── index.ts            # Point d'entrée
│   │   ├── config.ts           # Configuration
│   │   ├── services/
│   │   │   └── backendApiClient.ts
│   │   └── cards/
│   │       └── adaptiveCardBuilder.ts
│   └── package.json
│
├── manifest/                    # Manifest Teams
│   ├── manifest.json           # Fichier manifest
│   ├── color.png               # Icône couleur (à créer)
│   ├── outline.png             # Icône outline (à créer)
│   └── README.md
│
├── scripts/                     # Scripts utilitaires
│   ├── setup.js                # Setup initial
│   └── package-app.js          # Création du package
│
├── .env.example                # Exemple de configuration
├── .gitignore
├── package.json                # Scripts racine
├── tsconfig.json               # Configuration TypeScript
└── README.md                   # Ce fichier
```

## 🔧 Scripts disponibles

### Racine du projet

```bash
npm run setup          # Setup initial du projet
npm run build          # Build tous les composants
npm run package        # Créer le package Teams
npm start:bot          # Démarrer le bot
npm run dev:employee   # Démarrer l'onglet employee
npm run dev:manager    # Démarrer l'onglet manager
```

### Module Bot

```bash
npm run build          # Compiler TypeScript
npm start              # Démarrer le bot
npm run dev            # Mode développement avec ts-node
npm run watch          # Mode watch avec nodemon
```

### Modules Tabs

```bash
npm run dev            # Mode développement avec Vite
npm run build          # Build pour production
npm run preview        # Prévisualiser le build
```

## 🔌 API Backend

L'application communique avec le backend CyberSensei via les endpoints suivants :

### Endpoints Utilisateur
- `GET /api/user/me` - Informations utilisateur
- `GET /api/quiz/today` - Quiz du jour
- `POST /api/exercise/{id}/submit` - Soumettre un exercice
- `GET /api/exercises/history` - Historique des exercices
- `POST /api/ai/chat` - Chat avec l'IA

### Endpoints Manager
- `GET /api/manager/metrics` - Métriques de l'entreprise
- `GET /api/manager/users` - Liste des utilisateurs

## 🐛 Dépannage

### Le bot ne répond pas

1. Vérifiez que le bot est bien démarré
2. Vérifiez l'endpoint dans Azure Bot
3. Vérifiez les logs du bot
4. Si vous utilisez ngrok, vérifiez que l'URL est à jour

### Les onglets ne chargent pas

1. Vérifiez que les onglets sont bien déployés
2. Vérifiez que l'URL dans le manifest est correcte
3. Vérifiez les certificats SSL (HTTPS requis)
4. Vérifiez la console du navigateur pour les erreurs

### Erreur d'authentification

1. Vérifiez les permissions dans Azure AD
2. Vérifiez que le consentement admin est accordé
3. Vérifiez les scopes dans la configuration

### Backend inaccessible

1. Vérifiez que `BACKEND_BASE_URL` est correct
2. Vérifiez que le backend est démarré
3. Vérifiez les CORS si nécessaire
4. Vérifiez les certificats SSL

## 📚 Ressources

- [Documentation Microsoft Teams](https://docs.microsoft.com/en-us/microsoftteams/platform/)
- [Bot Framework SDK](https://docs.microsoft.com/en-us/azure/bot-service/)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/)
- [Fluent UI React](https://react.fluentui.dev/)
- [Adaptive Cards](https://adaptivecards.io/)

## 📝 Licence

MIT License - CyberSensei Team

## 🤝 Support

Pour toute question ou problème, contactez l'équipe CyberSensei.

