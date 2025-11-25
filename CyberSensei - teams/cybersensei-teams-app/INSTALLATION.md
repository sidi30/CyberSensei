# 📦 Guide d'Installation - CyberSensei Teams App

Guide complet pour installer et déployer l'application Microsoft Teams CyberSensei.

---

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Configuration de l'environnement](#configuration-de-lenvironnement)
- [Configuration Azure](#configuration-azure)
- [Build de l'application](#build-de-lapplication)
- [Création du package Teams](#création-du-package-teams)
- [Sideloading (Développement)](#sideloading-développement)
- [Déploiement Production](#déploiement-production)
- [Vérification et Tests](#vérification-et-tests)
- [Dépannage](#dépannage)

---

## 🎯 Prérequis

### 1. Microsoft 365 & Teams

#### Pour le développement :
- ✅ **Tenant Microsoft 365 Developer** (ou tenant d'entreprise)
  - [Obtenir un tenant gratuit](https://developer.microsoft.com/microsoft-365/dev-program)
- ✅ **Permissions Teams Admin**
  - Accès au [Teams Admin Center](https://admin.teams.microsoft.com)
  - Rôle : **Teams Administrator** ou **Global Administrator**
- ✅ **License Microsoft 365**
  - E3, E5, ou Business Premium minimum
  - Teams activé pour les utilisateurs

#### Vérification :
```bash
# Vérifier l'accès à Teams Admin Center
1. Aller sur https://admin.teams.microsoft.com
2. Vérifier que vous pouvez accéder à "Manage apps"
```

### 2. Environnement de développement

#### Node.js LTS
- ✅ **Version requise :** Node.js 18.x ou 20.x (LTS)
- ✅ **npm** : Version 8.x ou supérieure

```bash
# Vérifier les versions installées
node --version   # Doit afficher v18.x.x ou v20.x.x
npm --version    # Doit afficher 8.x.x ou supérieur

# Si besoin d'installer Node.js
# Windows : https://nodejs.org/
# macOS : brew install node@20
# Linux : curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```

#### Git (optionnel mais recommandé)
```bash
git --version
```

### 3. Backend CyberSensei

#### Requis :
- ✅ **Backend Node.js déployé et accessible**
- ✅ **URL HTTPS valide** (certificat SSL)
- ✅ **Endpoints API disponibles** :
  ```
  GET  /api/user/me
  GET  /api/quiz/today
  POST /api/exercise/{id}/submit
  GET  /api/exercises/history
  POST /api/ai/chat
  GET  /api/manager/metrics
  GET  /api/manager/users
  GET  /api/settings
  POST /api/settings/save
  ```

#### Vérification :
```bash
# Tester la connectivité au backend
curl -k https://cybersensei.local:8080/health

# Ou avec un navigateur
# Aller sur https://cybersensei.local:8080/health
```

⚠️ **Important :** Le backend DOIT être accessible en HTTPS. Teams refuse les connexions HTTP non sécurisées.

### 4. Outils additionnels

#### Recommandés :
- ✅ **VS Code** - Éditeur de code
- ✅ **Teams Toolkit** (Extension VS Code) - Facilite le développement
- ✅ **Ngrok** - Pour tester localement avec Teams
- ✅ **Bot Framework Emulator** - Pour tester le bot

```bash
# Installer ngrok (optionnel)
npm install -g ngrok

# Installer Teams Toolkit pour VS Code
# Dans VS Code : Extensions → Rechercher "Teams Toolkit"
```

---

## ⚙️ Configuration de l'environnement

### 1. Cloner/Télécharger le projet

```bash
# Si utilisant Git
git clone <repository-url>
cd cybersensei-teams-app

# Ou décompresser le ZIP
unzip cybersensei-teams-app.zip
cd cybersensei-teams-app
```

### 2. Configuration du Backend

#### Créer le fichier `.env`

```bash
# À la racine du projet
cp .env.example .env
```

#### Éditer `.env` avec vos valeurs :

```env
# ============================================
# BACKEND CONFIGURATION
# ============================================
# URL du backend CyberSensei (HTTPS obligatoire)
BACKEND_BASE_URL=https://cybersensei.local:8080

# ============================================
# MICROSOFT TEAMS BOT CONFIGURATION
# ============================================
# À remplir après la configuration Azure (voir section suivante)
BOT_ID=
BOT_PASSWORD=

# ============================================
# MICROSOFT GRAPH CONFIGURATION
# ============================================
# À remplir après la configuration Azure
MICROSOFT_APP_ID=
MICROSOFT_APP_PASSWORD=
MICROSOFT_APP_TENANT_ID=

# ============================================
# SERVER CONFIGURATION
# ============================================
NODE_ENV=production
PORT=3978
```

⚠️ **Ne committez JAMAIS le fichier `.env` dans Git !**

### 3. Variables d'environnement par composant

#### Pour les Tabs (Employee & Manager)

Les tabs utilisent Vite et les variables doivent être dans le code au moment du build :

```bash
# Ces variables sont définies dans vite.config.ts
# Elles sont injectées au build-time
BACKEND_BASE_URL=https://cybersensei.local:8080
```

#### Pour le Bot

Le bot utilise `dotenv` et lit le fichier `.env` au runtime.

---

## 🔐 Configuration Azure

### Étape 1 : Créer une App Registration (Azure AD)

#### 1.1 Accéder au portail Azure

1. Aller sur [Azure Portal](https://portal.azure.com)
2. Se connecter avec un compte admin

#### 1.2 Créer l'App Registration

1. **Azure Active Directory** → **App registrations** → **New registration**
2. Configurer :
   ```
   Name: CyberSensei Teams App
   Supported account types: Accounts in any organizational directory (Multitenant)
   Redirect URI: (laisser vide pour l'instant)
   ```
3. Cliquer sur **Register**

#### 1.3 Récupérer les IDs

Une fois créée, notez :
- ✅ **Application (client) ID** → C'est votre `MICROSOFT_APP_ID` et `BOT_ID`
- ✅ **Directory (tenant) ID** → C'est votre `MICROSOFT_APP_TENANT_ID`

#### 1.4 Créer un Client Secret

1. Dans l'App Registration : **Certificates & secrets** → **Client secrets**
2. Cliquer sur **New client secret**
3. Configurer :
   ```
   Description: CyberSensei Bot Secret
   Expires: 24 months (recommandé)
   ```
4. Cliquer sur **Add**
5. **IMPORTANT :** Copier immédiatement la **Value** → C'est votre `BOT_PASSWORD` et `MICROSOFT_APP_PASSWORD`

⚠️ **La valeur du secret n'est affichée qu'une seule fois !**

#### 1.5 Configurer les permissions API

1. Dans l'App Registration : **API permissions** → **Add a permission**
2. Sélectionner **Microsoft Graph** → **Delegated permissions**
3. Ajouter les permissions :
   - ✅ `User.Read`
   - ✅ `email`
   - ✅ `profile`
   - ✅ `openid`
4. Cliquer sur **Add permissions**
5. **IMPORTANT :** Cliquer sur **Grant admin consent for [Your Tenant]**

### Étape 2 : Créer l'Azure Bot

#### 2.1 Créer la ressource Bot

1. Dans Azure Portal : **Create a resource** → Rechercher **"Azure Bot"**
2. Cliquer sur **Create**
3. Configurer :
   ```
   Bot handle: cybersensei-bot (doit être unique globalement)
   Subscription: Votre souscription
   Resource group: cybersensei-rg (ou créer un nouveau)
   Pricing tier: F0 (Free) pour dev, S1 pour production
   ```

#### 2.2 Configurer l'App ID

1. Dans **Type of App** : Sélectionner **Multi Tenant**
2. Dans **Microsoft App ID** : Coller l'App ID créé précédemment
3. Cliquer sur **Review + create** → **Create**

#### 2.3 Configurer le Messaging Endpoint

1. Une fois le bot créé, aller dans **Configuration**
2. Dans **Messaging endpoint**, entrer :
   ```
   # Pour développement local avec ngrok
   https://abc123.ngrok.io/api/messages
   
   # Pour production
   https://cybersensei-bot.azurewebsites.net/api/messages
   ```
3. Cliquer sur **Apply**

#### 2.4 Activer le canal Teams

1. Dans le Bot : **Channels**
2. Cliquer sur l'icône **Microsoft Teams**
3. Accepter les termes
4. Le statut doit afficher **Running**

### Étape 3 : Mettre à jour le fichier `.env`

Maintenant que vous avez toutes les informations, mettez à jour `.env` :

```env
BACKEND_BASE_URL=https://cybersensei.local:8080

BOT_ID=12345678-1234-1234-1234-123456789abc
BOT_PASSWORD=VotreSecretIciNePasCommitter123~

MICROSOFT_APP_ID=12345678-1234-1234-1234-123456789abc
MICROSOFT_APP_PASSWORD=VotreSecretIciNePasCommitter123~
MICROSOFT_APP_TENANT_ID=87654321-4321-4321-4321-cba987654321

NODE_ENV=production
PORT=3978
```

---

## 🔨 Build de l'application

### 1. Installation des dépendances

#### Option A : Installation automatique (recommandé)

```bash
# À la racine du projet
npm run setup
```

Ce script va :
- ✅ Créer le fichier `.env` depuis `.env.example`
- ✅ Installer les dépendances de tous les modules
- ✅ Vérifier la configuration

#### Option B : Installation manuelle

```bash
# Module common
cd common
npm install
cd ..

# Bot
cd bot
npm install
cd ..

# Tab Employee
cd tabs/employee
npm install
cd ../..

# Tab Manager
cd tabs/manager
npm install
cd ../..
```

### 2. Build de tous les composants

```bash
# À la racine du projet
npm run build
```

Ce script va :
- ✅ Build le module `common`
- ✅ Build le `bot` (TypeScript → JavaScript)
- ✅ Build le tab `employee` (React → HTML/CSS/JS optimisé)
- ✅ Build le tab `manager` (React → HTML/CSS/JS optimisé)

#### Vérification du build :

```bash
# Les dossiers suivants doivent exister
ls common/dist/          # Fichiers .js et .d.ts
ls bot/dist/             # Fichiers .js
ls tabs/employee/dist/   # index.html, assets/, etc.
ls tabs/manager/dist/    # index.html, assets/, etc.
```

### 3. Build individuel (si besoin)

```bash
# Si vous devez rebuild un seul composant
cd tabs/employee
npm run build

# Ou
cd bot
npm run build
```

---

## 📦 Création du package Teams

### Étape 1 : Créer les icônes

Teams requiert deux icônes :

#### color.png (192x192 pixels)
- **Format :** PNG avec ou sans transparence
- **Taille :** 192 x 192 pixels
- **Contenu :** Logo CyberSensei en couleur
- **Fond :** Couleur unie (ex: #0078D4 bleu Microsoft)

#### outline.png (32x32 pixels)
- **Format :** PNG avec transparence
- **Taille :** 32 x 32 pixels
- **Contenu :** Logo CyberSensei simplifié
- **Couleur :** Blanc uniquement (#FFFFFF)
- **Fond :** Transparent

#### Où les placer :
```bash
# Copier vos icônes dans le dossier manifest
cp /path/to/your/color.png manifest/color.png
cp /path/to/your/outline.png manifest/outline.png
```

📚 **Ressources pour créer les icônes :**
- [Canva](https://canva.com) - Templates gratuits
- [Figma](https://figma.com) - Design vectoriel
- [Microsoft Icon Guidelines](https://learn.microsoft.com/microsoftteams/platform/concepts/build-and-test/apps-package#app-icons)

### Étape 2 : Configurer le manifest

#### 2.1 Mettre à jour les URLs des tabs

Éditez `manifest/manifest.json` :

```json
{
  "staticTabs": [
    {
      "entityId": "employee",
      "name": "Formation",
      "contentUrl": "https://VOTRE-DOMAINE.com/employee/index.html",
      "websiteUrl": "https://VOTRE-DOMAINE.com/employee/index.html",
      "scopes": ["personal"]
    },
    {
      "entityId": "manager",
      "name": "Manager",
      "contentUrl": "https://VOTRE-DOMAINE.com/manager/index.html",
      "websiteUrl": "https://VOTRE-DOMAINE.com/manager/index.html",
      "scopes": ["personal"]
    }
  ]
}
```

Remplacez `VOTRE-DOMAINE.com` par :
- **Développement :** URL ngrok ou localhost avec tunnel
- **Production :** Votre domaine Azure Static Web Apps ou CDN

#### 2.2 Mettre à jour les IDs

```json
{
  "id": "12345678-1234-1234-1234-123456789abc",
  "bots": [
    {
      "botId": "12345678-1234-1234-1234-123456789abc"
    }
  ],
  "webApplicationInfo": {
    "id": "12345678-1234-1234-1234-123456789abc"
  }
}
```

Utilisez votre `MICROSOFT_APP_ID` partout.

### Étape 3 : Créer le package automatiquement

```bash
# À la racine du projet
npm run package
```

Le script va vous demander :
```
Microsoft App ID: [Entrez votre MICROSOFT_APP_ID]
Bot ID: [Appuyez sur Entrée pour utiliser l'App ID]
Hostname: [Entrez votre domaine, ex: myapp.azurestaticapps.net]
```

Le package `cybersensei-teams-app.zip` sera créé à la racine.

### Étape 4 : Créer le package manuellement (alternative)

```bash
cd manifest

# Vérifier que les icônes existent
ls color.png outline.png

# Créer le ZIP
# Windows (PowerShell)
Compress-Archive -Path manifest.json,color.png,outline.png -DestinationPath ../cybersensei-teams-app.zip

# macOS/Linux
zip ../cybersensei-teams-app.zip manifest.json color.png outline.png
```

### Étape 5 : Valider le package

Utilisez l'outil de validation Microsoft :

1. Aller sur [App Studio](https://dev.teams.microsoft.com/appvalidation.html)
2. Uploader le fichier `cybersensei-teams-app.zip`
3. Vérifier qu'il n'y a pas d'erreurs

---

## 🚀 Sideloading (Développement)

### Méthode 1 : Via Teams Admin Center (recommandé)

#### 1.1 Activer le sideloading

1. Aller sur [Teams Admin Center](https://admin.teams.microsoft.com)
2. **Teams apps** → **Setup policies**
3. Sélectionner **Global (Org-wide default)**
4. Activer **Upload custom apps** : **ON**
5. Cliquer sur **Save**

⏱️ *Peut prendre jusqu'à 24h pour se propager*

#### 1.2 Uploader l'application

1. Dans Teams Admin Center : **Teams apps** → **Manage apps**
2. Cliquer sur **Upload** (ou **Upload new app**)
3. Sélectionner `cybersensei-teams-app.zip`
4. Cliquer sur **Upload**
5. L'app apparaît dans la liste avec le statut **Allowed**

#### 1.3 Installer pour les utilisateurs

**Option A : Installation manuelle par l'utilisateur**
1. Ouvrir Microsoft Teams (client ou web)
2. Cliquer sur **Apps** dans la barre latérale
3. Rechercher "CyberSensei"
4. Cliquer sur **Add**

**Option B : Déploiement forcé (Admin)**
1. Dans Teams Admin Center : **Teams apps** → **Setup policies**
2. Créer une nouvelle policy ou éditer **Global**
3. Dans **Installed apps**, cliquer sur **Add apps**
4. Rechercher "CyberSensei" et ajouter
5. Assigner la policy aux utilisateurs

### Méthode 2 : Via le client Teams

#### 2.1 Vérifier les permissions

1. Ouvrir Microsoft Teams
2. Cliquer sur **Apps**
3. En bas : **Manage your apps**
4. Vérifier que "Upload custom apps" est disponible

Si non disponible, demander à un admin de l'activer.

#### 2.2 Sideloader l'app

1. Dans Teams : **Apps** → **Manage your apps**
2. Cliquer sur **Publish an app** (ou **Upload a custom app**)
3. Sélectionner **Upload for [Your Org Name]**
4. Choisir le fichier `cybersensei-teams-app.zip`
5. Cliquer sur **Add**

L'application est maintenant disponible !

### Méthode 3 : Via Teams Toolkit (VS Code)

Si vous utilisez l'extension Teams Toolkit :

1. Ouvrir le projet dans VS Code
2. Panneau latéral : **Teams Toolkit**
3. **Provision** → Suivre les étapes
4. **Deploy** → Suivre les étapes
5. **Publish** → Suivre les étapes

---

## 🏢 Déploiement Production

### Pour l'administrateur IT

#### Phase 1 : Préparation de l'infrastructure

##### 1.1 Configurer le DNS pour le backend local

Si le backend est hébergé en interne (`cybersensei.local`) :

**Option A : DNS Split-Horizon (recommandé)**

```bash
# Dans votre serveur DNS interne (ex: Windows DNS, Bind)
# Créer un enregistrement A
cybersensei.local.    IN    A    192.168.1.100

# Vérifier
nslookup cybersensei.local
```

**Option B : Hosts file (temporaire/dev)**

```bash
# Windows: C:\Windows\System32\drivers\etc\hosts
# macOS/Linux: /etc/hosts
192.168.1.100    cybersensei.local
```

⚠️ **La méthode hosts doit être appliquée sur CHAQUE poste client !**

##### 1.2 Configurer le certificat SSL

**Option A : Certificat d'entreprise (Active Directory CS)**

```powershell
# Sur le serveur backend
# 1. Demander un certificat via MMC
certlm.msc
# → Certificates (Local Computer)
# → Personal → Certificates
# → All Tasks → Request New Certificate
# → Suivre l'assistant pour cybersensei.local

# 2. Exporter le certificat
# → Clic droit → All Tasks → Export
# → Exporter avec clé privée (.pfx)

# 3. Installer sur le serveur backend Node.js
```

**Option B : Certificat Let's Encrypt (si domaine public)**

```bash
# Installer certbot
sudo apt-get install certbot

# Obtenir le certificat
sudo certbot certonly --standalone -d cybersensei.votredomaine.com

# Les certificats seront dans
/etc/letsencrypt/live/cybersensei.votredomaine.com/
```

**Option C : Certificat auto-signé (DEV uniquement)**

```bash
# Générer le certificat
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# ATTENTION : Les clients devront accepter le risque de sécurité
```

##### 1.3 Configurer le backend Node.js pour HTTPS

```javascript
// Dans le backend CyberSensei
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/path/to/key.pem'),
  cert: fs.readFileSync('/path/to/cert.pem')
};

https.createServer(options, app).listen(8080);
```

##### 1.4 Tester la connectivité

```bash
# Depuis un poste client
curl https://cybersensei.local:8080/health

# Vérifier le certificat
openssl s_client -connect cybersensei.local:8080 -showcerts
```

#### Phase 2 : Déploiement des composants

##### 2.1 Déployer le Bot

**Option A : Azure App Service**

```bash
# Se connecter à Azure
az login

# Créer le groupe de ressources
az group create --name cybersensei-rg --location westeurope

# Créer l'App Service Plan
az appservice plan create \
  --name cybersensei-plan \
  --resource-group cybersensei-rg \
  --sku B1 \
  --is-linux

# Créer l'App Service
az webapp create \
  --name cybersensei-bot \
  --resource-group cybersensei-rg \
  --plan cybersensei-plan \
  --runtime "NODE:18-lts"

# Configurer les variables d'environnement
az webapp config appsettings set \
  --name cybersensei-bot \
  --resource-group cybersensei-rg \
  --settings \
    BOT_ID="votre-bot-id" \
    BOT_PASSWORD="votre-bot-password" \
    BACKEND_BASE_URL="https://cybersensei.local:8080" \
    NODE_ENV="production"

# Déployer le code
cd bot
npm run build
zip -r bot.zip dist/ node_modules/ package.json

az webapp deploy \
  --name cybersensei-bot \
  --resource-group cybersensei-rg \
  --src-path bot.zip \
  --type zip
```

**Option B : Serveur interne (Docker)**

```bash
# Créer le Dockerfile dans bot/
cd bot
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3978
CMD ["node", "dist/index.js"]
EOF

# Build l'image
docker build -t cybersensei-bot:latest .

# Lancer le container
docker run -d \
  --name cybersensei-bot \
  --restart unless-stopped \
  -p 3978:3978 \
  -e BOT_ID="votre-bot-id" \
  -e BOT_PASSWORD="votre-bot-password" \
  -e BACKEND_BASE_URL="https://cybersensei.local:8080" \
  cybersensei-bot:latest
```

##### 2.2 Déployer les Tabs

**Option A : Azure Static Web Apps**

```bash
# Employee Tab
cd tabs/employee
npm run build

az staticwebapp create \
  --name cybersensei-employee \
  --resource-group cybersensei-rg \
  --source ./dist \
  --location "West Europe" \
  --branch main \
  --app-location "/" \
  --output-location "dist"

# Manager Tab
cd ../manager
npm run build

az staticwebapp create \
  --name cybersensei-manager \
  --resource-group cybersensei-rg \
  --source ./dist \
  --location "West Europe" \
  --branch main \
  --app-location "/" \
  --output-location "dist"
```

**Option B : Azure Storage Static Website**

```bash
# Créer le compte de stockage
az storage account create \
  --name cybersenseitabs \
  --resource-group cybersensei-rg \
  --location westeurope \
  --sku Standard_LRS

# Activer Static Website
az storage blob service-properties update \
  --account-name cybersenseitabs \
  --static-website \
  --index-document index.html

# Uploader Employee Tab
cd tabs/employee
npm run build
az storage blob upload-batch \
  --account-name cybersenseitabs \
  --destination '$web/employee' \
  --source ./dist

# Uploader Manager Tab
cd ../manager
npm run build
az storage blob upload-batch \
  --account-name cybersenseitabs \
  --destination '$web/manager' \
  --source ./dist
```

**Option C : Serveur web interne (IIS/Nginx)**

```nginx
# Configuration Nginx
server {
    listen 443 ssl;
    server_name tabs.cybersensei.local;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /employee {
        root /var/www/cybersensei;
        try_files $uri $uri/ /employee/index.html;
    }

    location /manager {
        root /var/www/cybersensei;
        try_files $uri $uri/ /manager/index.html;
    }
}
```

##### 2.3 Mettre à jour le manifest

```json
{
  "staticTabs": [
    {
      "contentUrl": "https://cybersensei-employee.azurestaticapps.net/index.html"
    },
    {
      "contentUrl": "https://cybersensei-manager.azurestaticapps.net/index.html"
    }
  ],
  "validDomains": [
    "cybersensei-employee.azurestaticapps.net",
    "cybersensei-manager.azurestaticapps.net",
    "cybersensei.local"
  ]
}
```

##### 2.4 Mettre à jour l'endpoint du bot

Dans Azure Bot Configuration :
```
https://cybersensei-bot.azurewebsites.net/api/messages
```

#### Phase 3 : Installation dans Teams

##### 3.1 Recréer le package

```bash
npm run package
# Entrer les URLs de production
```

##### 3.2 Uploader dans Teams Admin Center

1. [Teams Admin Center](https://admin.teams.microsoft.com)
2. **Teams apps** → **Manage apps** → **Upload**
3. Uploader `cybersensei-teams-app.zip`
4. **Allow** ou **Block** l'app

##### 3.3 Créer une App Setup Policy

1. **Teams apps** → **Setup policies** → **Add**
2. Nom : `CyberSensei Policy`
3. **Installed apps** → **Add apps** → Sélectionner CyberSensei
4. **Pinned apps** → Ajouter CyberSensei (optionnel)
5. **Save**

##### 3.4 Assigner aux utilisateurs

1. **Users** → **Manage users**
2. Sélectionner les utilisateurs
3. **Policies** → **App setup policy** → **CyberSensei Policy**
4. **Apply**

#### Phase 4 : Tests de connectivité

##### 4.1 Tests réseau

```bash
# Test DNS
nslookup cybersensei.local

# Test HTTPS backend
curl -v https://cybersensei.local:8080/health

# Test tabs
curl -v https://cybersensei-employee.azurestaticapps.net

# Test bot
curl -v https://cybersensei-bot.azurewebsites.net/health
```

##### 4.2 Tests fonctionnels

**Checklist utilisateur final :**
- [ ] Ouvrir Teams
- [ ] Rechercher "CyberSensei" dans Apps
- [ ] Installer l'app
- [ ] Ouvrir l'onglet "Formation"
  - [ ] Vérifier que le profil s'affiche
  - [ ] Voir les KPIs
  - [ ] Lancer un quiz
  - [ ] Soumettre des réponses
  - [ ] Poser une question au chat
- [ ] Ouvrir l'onglet "Manager" (si manager)
  - [ ] Voir les métriques
  - [ ] Voir la liste des utilisateurs
  - [ ] Ouvrir les détails d'un utilisateur
  - [ ] Voir les graphiques
- [ ] Tester le bot
  - [ ] Envoyer "bonjour"
  - [ ] Envoyer "quiz"
  - [ ] Répondre aux questions
  - [ ] Envoyer "aide"

##### 4.3 Monitoring

**Application Insights (recommandé)**

```bash
# Activer dans Azure
az monitor app-insights component create \
  --app cybersensei-insights \
  --location westeurope \
  --resource-group cybersensei-rg

# Récupérer la clé
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app cybersensei-insights \
  --resource-group cybersensei-rg \
  --query instrumentationKey -o tsv)

# Configurer dans le bot
az webapp config appsettings set \
  --name cybersensei-bot \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="$INSTRUMENTATION_KEY"
```

---

## ✅ Vérification et Tests

### Checklist de vérification

#### Backend
- [ ] Backend accessible en HTTPS
- [ ] Certificat SSL valide
- [ ] Tous les endpoints répondent
- [ ] CORS configuré pour Teams

#### Azure
- [ ] App Registration créée
- [ ] Client Secret créé et sauvegardé
- [ ] Permissions Graph accordées (admin consent)
- [ ] Azure Bot créé
- [ ] Canal Teams activé
- [ ] Messaging endpoint configuré

#### Build
- [ ] Toutes les dépendances installées
- [ ] Build sans erreurs
- [ ] Dossiers dist/ créés

#### Package Teams
- [ ] Icônes créées (color.png + outline.png)
- [ ] Manifest.json configuré
- [ ] Package .zip créé
- [ ] Package validé (pas d'erreurs)

#### Déploiement
- [ ] Bot déployé et accessible
- [ ] Tabs déployés et accessibles
- [ ] URLs en HTTPS
- [ ] Variables d'environnement configurées

#### Teams
- [ ] App uploadée dans Teams Admin Center
- [ ] App autorisée (Allowed)
- [ ] Policy créée et assignée
- [ ] Utilisateurs peuvent installer l'app

### Tests de bout en bout

```bash
# Script de test automatisé
./scripts/test-deployment.sh
```

Ou manuellement :
1. Tester chaque endpoint backend
2. Tester l'authentification Teams
3. Tester chaque fonctionnalité de l'app
4. Vérifier les logs (bot, tabs, backend)

---

## 🐛 Dépannage

### Problème : "App not found"

**Symptôme :** L'app n'apparaît pas dans Teams après upload

**Solutions :**
1. Vérifier que le sideloading est activé
2. Attendre 24h pour la propagation
3. Vider le cache Teams : `Ctrl+Shift+R` (Windows) ou `Cmd+Shift+R` (Mac)
4. Réinstaller l'app

### Problème : "Failed to load tab"

**Symptôme :** Erreur lors de l'ouverture d'un onglet

**Solutions :**
1. Vérifier que l'URL du tab est en HTTPS
2. Vérifier que le certificat SSL est valide
3. Vérifier les CORS sur le serveur
4. Ouvrir DevTools (F12) pour voir les erreurs

### Problème : "Bot not responding"

**Symptôme :** Le bot ne répond pas aux messages

**Solutions :**
1. Vérifier que le bot est démarré
   ```bash
   curl https://cybersensei-bot.azurewebsites.net/health
   ```
2. Vérifier l'endpoint dans Azure Bot
3. Vérifier les logs du bot
4. Vérifier les variables d'environnement

### Problème : "Cannot connect to backend"

**Symptôme :** Les tabs ne peuvent pas charger les données

**Solutions :**
1. Vérifier que `BACKEND_BASE_URL` est correct
2. Tester la connectivité :
   ```bash
   curl https://cybersensei.local:8080/api/user/me
   ```
3. Vérifier les CORS sur le backend
4. Vérifier le certificat SSL

### Problème : "Certificate error"

**Symptôme :** Erreur de certificat SSL

**Solutions :**
1. Vérifier que le certificat est valide
2. Vérifier que le certificat n'est pas expiré
3. Vérifier que le domaine correspond
4. Ajouter le certificat root CA aux certificats de confiance

### Logs utiles

```bash
# Logs bot (Azure)
az webapp log tail --name cybersensei-bot --resource-group cybersensei-rg

# Logs bot (local)
cd bot && npm run dev
# Regarder la console

# Logs tabs (navigateur)
# F12 → Console
```

---

## 📚 Ressources supplémentaires

### Documentation Microsoft
- [Teams App Manifest](https://learn.microsoft.com/microsoftteams/platform/resources/schema/manifest-schema)
- [Sideloading Apps](https://learn.microsoft.com/microsoftteams/platform/concepts/deploy-and-publish/apps-upload)
- [Azure Bot Service](https://learn.microsoft.com/azure/bot-service/)
- [Microsoft Graph](https://learn.microsoft.com/graph/)

### Outils
- [Teams App Studio](https://aka.ms/InstallTeamsAppStudio)
- [Bot Framework Emulator](https://github.com/Microsoft/BotFramework-Emulator)
- [Ngrok](https://ngrok.com/)
- [Postman Collection pour Graph](https://www.postman.com/microsoftgraph/workspace/microsoft-graph/)

### Support
- **Documentation projet :** `README.md`, `QUICKSTART.md`, `DEPLOYMENT.md`
- **Issues GitHub :** [Lien vers repo]
- **Support interne :** support@cybersensei.local

---

**Version :** 1.0.0  
**Dernière mise à jour :** 2024-11-24  
**Auteur :** CyberSensei Team

✅ **Installation terminée ! Votre application Teams CyberSensei est maintenant opérationnelle.**

