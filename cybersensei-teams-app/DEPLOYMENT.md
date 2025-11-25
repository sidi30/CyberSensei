# Guide de Déploiement - CyberSensei Teams App

Ce guide détaille les étapes pour déployer l'application CyberSensei Teams en production.

## 📋 Prérequis

- Compte Azure avec une souscription active
- Azure CLI installé et configuré
- Node.js 18.x ou supérieur
- Application Microsoft Teams configurée (voir README.md)

## 🚀 Déploiement du Bot

### Option 1 : Azure App Service

#### 1. Créer l'App Service

```bash
# Créer un groupe de ressources
az group create --name cybersensei-rg --location westeurope

# Créer un plan App Service
az appservice plan create \
  --name cybersensei-plan \
  --resource-group cybersensei-rg \
  --sku B1 \
  --is-linux

# Créer l'application web
az webapp create \
  --name cybersensei-bot \
  --resource-group cybersensei-rg \
  --plan cybersensei-plan \
  --runtime "NODE:18-lts"
```

#### 2. Configurer les variables d'environnement

```bash
az webapp config appsettings set \
  --name cybersensei-bot \
  --resource-group cybersensei-rg \
  --settings \
    BOT_ID="<votre-bot-id>" \
    BOT_PASSWORD="<votre-bot-password>" \
    BACKEND_BASE_URL="https://cybersensei.local:8080" \
    NODE_ENV="production"
```

#### 3. Déployer le code

```bash
cd bot
npm run build

# Créer un fichier zip
zip -r bot.zip dist/ node_modules/ package.json

# Déployer
az webapp deploy \
  --name cybersensei-bot \
  --resource-group cybersensei-rg \
  --src-path bot.zip \
  --type zip
```

#### 4. Mettre à jour Azure Bot

Allez dans Azure Bot Service et mettez à jour l'endpoint :
```
https://cybersensei-bot.azurewebsites.net/api/messages
```

### Option 2 : Docker Container

#### 1. Créer le Dockerfile

Créez `bot/Dockerfile` :

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

EXPOSE 3978

CMD ["node", "dist/index.js"]
```

#### 2. Build et push l'image

```bash
cd bot

# Build l'image
docker build -t cybersensei-bot:latest .

# Tag pour Azure Container Registry
docker tag cybersensei-bot:latest <your-registry>.azurecr.io/cybersensei-bot:latest

# Push
docker push <your-registry>.azurecr.io/cybersensei-bot:latest
```

#### 3. Déployer sur Azure Container Instances

```bash
az container create \
  --name cybersensei-bot \
  --resource-group cybersensei-rg \
  --image <your-registry>.azurecr.io/cybersensei-bot:latest \
  --dns-name-label cybersensei-bot \
  --ports 3978 \
  --environment-variables \
    BOT_ID="<votre-bot-id>" \
    BOT_PASSWORD="<votre-bot-password>" \
    BACKEND_BASE_URL="https://cybersensei.local:8080" \
    NODE_ENV="production"
```

## 🌐 Déploiement des Tabs

### Option 1 : Azure Static Web Apps

#### Tab Employee

```bash
cd tabs/employee

# Build
npm run build

# Créer Static Web App
az staticwebapp create \
  --name cybersensei-employee \
  --resource-group cybersensei-rg \
  --source ./dist \
  --location westeurope \
  --branch main \
  --app-location "/" \
  --output-location "dist"
```

#### Tab Manager

```bash
cd tabs/manager

# Build
npm run build

# Créer Static Web App
az staticwebapp create \
  --name cybersensei-manager \
  --resource-group cybersensei-rg \
  --source ./dist \
  --location westeurope \
  --branch main \
  --app-location "/" \
  --output-location "dist"
```

### Option 2 : Azure Storage Static Website

#### 1. Créer un compte de stockage

```bash
# Créer le compte de stockage
az storage account create \
  --name cybersenseitabs \
  --resource-group cybersensei-rg \
  --location westeurope \
  --sku Standard_LRS \
  --kind StorageV2

# Activer le site web statique
az storage blob service-properties update \
  --account-name cybersenseitabs \
  --static-website \
  --index-document index.html \
  --404-document index.html
```

#### 2. Déployer les tabs

```bash
# Tab Employee
cd tabs/employee
npm run build

az storage blob upload-batch \
  --account-name cybersenseitabs \
  --destination '$web/employee' \
  --source ./dist

# Tab Manager
cd tabs/manager
npm run build

az storage blob upload-batch \
  --account-name cybersenseitabs \
  --destination '$web/manager' \
  --source ./dist
```

#### 3. Configurer le CDN (optionnel mais recommandé)

```bash
# Créer un profil CDN
az cdn profile create \
  --name cybersensei-cdn \
  --resource-group cybersensei-rg \
  --sku Standard_Microsoft

# Créer un endpoint CDN
az cdn endpoint create \
  --name cybersensei \
  --profile-name cybersensei-cdn \
  --resource-group cybersensei-rg \
  --origin cybersenseitabs.z6.web.core.windows.net \
  --origin-host-header cybersenseitabs.z6.web.core.windows.net
```

### Option 3 : Netlify

#### 1. Installer Netlify CLI

```bash
npm install -g netlify-cli
```

#### 2. Déployer

```bash
# Tab Employee
cd tabs/employee
npm run build
netlify deploy --prod --dir=dist

# Tab Manager
cd tabs/manager
npm run build
netlify deploy --prod --dir=dist
```

## 🔐 Configuration SSL/TLS

Microsoft Teams requiert HTTPS pour tous les endpoints.

### Azure App Service

SSL est automatiquement géré par Azure avec un certificat gratuit.

### Custom Domain

1. Ajoutez un domaine personnalisé dans Azure
2. Configurez le certificat SSL
3. Mettez à jour le manifest Teams avec le nouveau domaine

```bash
# Ajouter un domaine personnalisé
az webapp config hostname add \
  --webapp-name cybersensei-bot \
  --resource-group cybersensei-rg \
  --hostname bot.cybersensei.com

# Lier le certificat SSL
az webapp config ssl bind \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI \
  --name cybersensei-bot \
  --resource-group cybersensei-rg
```

## 📦 Mise à jour du Manifest

Après le déploiement, mettez à jour le manifest avec les URLs de production :

```json
{
  "staticTabs": [
    {
      "contentUrl": "https://cybersensei-employee.azurestaticapps.net/index.html",
      "websiteUrl": "https://cybersensei-employee.azurestaticapps.net/index.html"
    },
    {
      "contentUrl": "https://cybersensei-manager.azurestaticapps.net/index.html",
      "websiteUrl": "https://cybersensei-manager.azurestaticapps.net/index.html"
    }
  ],
  "validDomains": [
    "cybersensei-employee.azurestaticapps.net",
    "cybersensei-manager.azurestaticapps.net",
    "cybersensei.local"
  ]
}
```

Recréez le package :

```bash
npm run package
```

## 🔄 CI/CD avec GitHub Actions

### Exemple de workflow pour le Bot

Créez `.github/workflows/deploy-bot.yml` :

```yaml
name: Deploy Bot to Azure

on:
  push:
    branches: [main]
    paths:
      - 'bot/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd bot
          npm ci
      
      - name: Build
        run: |
          cd bot
          npm run build
      
      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: cybersensei-bot
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: bot
```

### Exemple de workflow pour les Tabs

Créez `.github/workflows/deploy-tabs.yml` :

```yaml
name: Deploy Tabs to Azure Static Web Apps

on:
  push:
    branches: [main]
    paths:
      - 'tabs/**'

jobs:
  deploy-employee:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Employee Tab
        run: |
          cd tabs/employee
          npm ci
          npm run build
      
      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_EMPLOYEE }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "tabs/employee"
          output_location: "dist"
```

## 📊 Monitoring

### Application Insights

```bash
# Créer une instance Application Insights
az monitor app-insights component create \
  --app cybersensei-insights \
  --location westeurope \
  --resource-group cybersensei-rg

# Obtenir la clé d'instrumentation
az monitor app-insights component show \
  --app cybersensei-insights \
  --resource-group cybersensei-rg \
  --query instrumentationKey -o tsv

# Configurer dans l'App Service
az webapp config appsettings set \
  --name cybersensei-bot \
  --resource-group cybersensei-rg \
  --settings \
    APPINSIGHTS_INSTRUMENTATIONKEY="<instrumentation-key>"
```

## 🧪 Validation

Après le déploiement, vérifiez :

1. ✅ Bot accessible : `https://cybersensei-bot.azurewebsites.net/health`
2. ✅ Tabs accessibles et chargent correctement
3. ✅ SSL/TLS configuré (cadenas vert)
4. ✅ Manifest mis à jour avec les bonnes URLs
5. ✅ Application fonctionne dans Teams

## 🆘 Rollback

En cas de problème :

```bash
# Lister les déploiements
az webapp deployment list \
  --name cybersensei-bot \
  --resource-group cybersensei-rg

# Revenir à un déploiement précédent
az webapp deployment source show \
  --name cybersensei-bot \
  --resource-group cybersensei-rg \
  --deployment-id <deployment-id>
```

## 📝 Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Bot déployé et accessible
- [ ] Tabs déployés et accessibles
- [ ] SSL/TLS configuré
- [ ] Manifest mis à jour
- [ ] Package Teams recréé
- [ ] Application testée dans Teams
- [ ] Monitoring configuré
- [ ] Logs vérifiés
- [ ] Documentation mise à jour

