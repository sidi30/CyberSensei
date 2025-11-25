# 🚀 Guide de Démarrage Rapide - CyberSensei Teams App

Ce guide vous permet de démarrer rapidement avec CyberSensei Teams App en quelques minutes.

## ⚡ Démarrage en 5 minutes

### 1. Prérequis rapides

```bash
# Vérifier Node.js (version 18+)
node --version

# Vérifier npm
npm --version
```

### 2. Installation express

```bash
# Cloner ou décompresser le projet
cd cybersensei-teams-app

# Lancer le setup automatique
npm run setup
```

### 3. Configuration minimale

Éditez le fichier `.env` :

```env
# Configuration minimale pour le développement
BACKEND_BASE_URL=https://cybersensei.local:8080
NODE_ENV=development
```

### 4. Lancer l'application

Ouvrez **3 terminaux** :

```bash
# Terminal 1 - Bot
cd bot && npm run dev

# Terminal 2 - Tab Employee
cd tabs/employee && npm run dev

# Terminal 3 - Tab Manager
cd tabs/manager && npm run dev
```

## 🧪 Mode Test (sans Teams)

Pour tester sans installer dans Teams :

### Bot
```bash
cd bot
npm run dev
# Le bot est accessible sur http://localhost:3978
# Test : curl http://localhost:3978/health
```

### Tabs
```bash
# Employee Tab : https://localhost:3000
cd tabs/employee && npm run dev

# Manager Tab : https://localhost:3001
cd tabs/manager && npm run dev
```

Ouvrez votre navigateur et acceptez le certificat auto-signé.

## 🎯 Tester rapidement dans Teams

### Option 1 : Ngrok (recommandé pour le développement)

```bash
# Installer ngrok
npm install -g ngrok

# Exposer le bot
ngrok http 3978
# Notez l'URL HTTPS générée (ex: https://abc123.ngrok.io)
```

### Option 2 : Manifest de développement

1. Créez des icônes temporaires (192x192 et 32x32 pixels)
2. Placez-les dans `manifest/` comme `color.png` et `outline.png`
3. Modifiez `manifest/manifest.json` :
   ```json
   {
     "id": "dev-mode-123",
     "bots": [{
       "botId": "dev-mode-123"
     }],
     "staticTabs": [{
       "contentUrl": "https://localhost:3000/index.html"
     }]
   }
   ```
4. Créez le package :
   ```bash
   cd manifest
   zip ../cybersensei-dev.zip manifest.json color.png outline.png
   ```

### Installer dans Teams

1. Ouvrez **Microsoft Teams**
2. Cliquez sur **Applications** (barre latérale)
3. **Gérer vos applications** → **Publier une application**
4. **Envoyer une application personnalisée**
5. Sélectionnez `cybersensei-dev.zip`
6. Cliquez sur **Ajouter**

## 📱 Test rapide des fonctionnalités

### Tester le Bot

Dans Teams, ouvrez une conversation avec le bot et tapez :
- `help` → Affiche l'aide
- `quiz` → Lance un quiz (nécessite le backend)
- `Bonjour` → Chat avec le bot

### Tester l'Onglet Employee

1. Ouvrez l'application dans Teams
2. Allez sur l'onglet **Formation**
3. Vérifiez que votre profil s'affiche
4. Testez le quiz du jour

### Tester l'Onglet Manager

1. Ouvrez l'onglet **Manager**
2. Si vous n'êtes pas manager, vous verrez un message d'accès refusé
3. Sinon, vous verrez les métriques

## 🔧 Dépannage rapide

### Le bot ne répond pas
```bash
# Vérifier que le bot est démarré
cd bot && npm run dev

# Vérifier les logs
# Le bot devrait afficher "Bot is ready!"
```

### Les tabs ne chargent pas
```bash
# Vérifier que les tabs sont démarrés
cd tabs/employee && npm run dev
cd tabs/manager && npm run dev

# Accepter les certificats auto-signés dans le navigateur
# Aller sur https://localhost:3000 et https://localhost:3001
```

### Erreurs d'authentification
En mode développement, l'authentification peut être mockée.
Vérifiez les logs de la console du navigateur (F12).

### Backend inaccessible
```bash
# Vérifier que le backend CyberSensei est démarré
curl https://cybersensei.local:8080/health
```

## 📚 Prochaines étapes

Une fois que tout fonctionne :

1. 📖 Lisez le [README.md](README.md) complet
2. 🔐 Configurez l'authentification Azure AD
3. 🚀 Consultez [DEPLOYMENT.md](DEPLOYMENT.md) pour la production
4. 🤝 Lisez [CONTRIBUTING.md](CONTRIBUTING.md) pour contribuer

## 💡 Astuces

### Rechargement automatique

Les tabs utilisent Vite avec Hot Module Replacement (HMR) :
- Les modifications sont visibles instantanément
- Pas besoin de rafraîchir manuellement

Le bot utilise nodemon en mode dev :
- Les modifications redémarrent automatiquement le bot

### Déboguer facilement

```bash
# Activer les logs détaillés
export DEBUG=*

# Pour le bot
cd bot && npm run dev

# Pour voir les logs réseau dans les tabs
# Ouvrez la console du navigateur (F12)
```

### Développement hors ligne

Pour développer sans backend :
- Les tabs peuvent afficher des données mockées
- Le bot peut répondre avec des messages statiques
- Modifiez les hooks pour retourner des données de test

## 🎉 Vous êtes prêt !

Votre environnement de développement est configuré.
Bon développement ! 🚀

---

**Besoin d'aide ?**
- Consultez le [README.md](README.md) complet
- Ouvrez une issue sur GitHub
- Contactez l'équipe CyberSensei

