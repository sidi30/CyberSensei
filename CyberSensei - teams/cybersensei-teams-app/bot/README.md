# 🤖 CyberSensei Bot - Guide Complet

Bot conversationnel intelligent pour Microsoft Teams avec reconnaissance d'intentions et cartes adaptives.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Lancement](#lancement)
- [Utilisation](#utilisation)
- [Développement](#développement)

---

## 🎯 Vue d'ensemble

Le bot CyberSensei est un assistant conversationnel intelligent qui :
- Reconnaît les intentions utilisateur
- Présente des quiz interactifs via des cartes adaptives
- Fournit des explications via l'IA
- Affiche le statut et les performances
- Maintient un contexte de conversation

---

## ✨ Fonctionnalités

### 1. **Reconnaissance d'intentions**

Le bot reconnaît automatiquement les intentions suivantes :

| Intention | Mots-clés | Action |
|-----------|-----------|--------|
| **quiz** | quiz, start, training, exercice | Lance le quiz du jour |
| **explain** | explain, pourquoi, why, comment | Demande une explication à l'IA |
| **help** | help, aide, assist, commandes | Affiche la carte d'aide |
| **status** | status, statut, score, progression | Affiche les informations utilisateur |
| **greeting** | bonjour, salut, hello, hi | Message de bienvenue |
| **unknown** | (autre) | Passe au chat IA |

### 2. **Cartes Adaptives**

#### Quiz Card
- Titre et description de l'exercice
- Sujet et difficulté
- Questions avec choix multiples (radio buttons)
- Bouton de soumission
- Validation des réponses requises

#### Result Card
- Score avec pourcentage
- Nombre de bonnes/mauvaises réponses
- Feedback personnalisé du backend
- Détails par question (si disponible)
- Actions : "Demander explication" et "Nouveau quiz"

#### Help Card
- Liste des commandes disponibles
- Exemples d'utilisation
- Bouton pour démarrer un quiz

#### Status Card
- Informations utilisateur (nom, email, rôle)
- Poste et département
- Métriques entreprise (pour managers/admins)
- Actions rapides

### 3. **Gestion d'état**

Le bot maintient un état de conversation incluant :
- `lastExerciseId` : ID du dernier quiz
- `lastQuizTitle` : Titre du dernier quiz
- `lastQuestionContext` : Contexte pour les explications
- `userName` : Nom de l'utilisateur
- `userRole` : Rôle de l'utilisateur

### 4. **Intégration Backend**

Appels REST au backend CyberSensei :

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/quiz/today` | GET | Récupère le quiz du jour |
| `/api/exercise/{id}/submit` | POST | Soumet les réponses |
| `/api/ai/chat` | POST | Chat avec l'IA |
| `/api/user/me` | GET | Infos utilisateur |
| `/api/manager/metrics` | GET | Métriques (managers) |

---

## 🏗️ Architecture

```
bot/
├── src/
│   ├── bot.ts                    # Logique principale du bot
│   ├── index.ts                  # Point d'entrée (serveur)
│   ├── config.ts                 # Configuration
│   ├── conversationState.ts      # Gestion d'état
│   ├── intentRecognizer.ts       # Reconnaissance d'intentions
│   ├── services/
│   │   └── backendService.ts     # Client backend REST
│   └── cards/
│       ├── quizCard.ts           # Carte quiz
│       ├── resultCard.ts         # Carte résultats
│       ├── helpCard.ts           # Carte aide
│       └── statusCard.ts         # Carte statut
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📦 Installation

### Prérequis

- Node.js 18.x ou supérieur
- npm 8.x ou supérieur
- Compte Azure pour enregistrer le bot
- Backend CyberSensei en cours d'exécution

### Installation des dépendances

```bash
cd bot
npm install
```

### Dépendances principales

```json
{
  "botbuilder": "^4.21.0",      // Bot Framework SDK
  "restify": "^11.1.0",         // Serveur HTTP
  "axios": "^1.6.2",            // Client HTTP
  "dotenv": "^16.3.1"           // Variables d'environnement
}
```

---

## ⚙️ Configuration

### 1. Fichier `.env`

Créez un fichier `.env` à la racine du projet :

```env
# Backend Configuration
BACKEND_BASE_URL=https://cybersensei.local:8080

# Bot Configuration
BOT_ID=<votre-bot-id>
BOT_PASSWORD=<votre-bot-password>

# Server Configuration
PORT=3978
NODE_ENV=development
```

### 2. Azure Bot Registration

#### Créer une App Registration

1. Allez sur [Azure Portal](https://portal.azure.com)
2. **Azure Active Directory** > **App registrations** > **New registration**
3. Configurez :
   - Name: `CyberSensei Bot`
   - Supported account types: `Multitenant`
4. Notez l'**Application (client) ID** → `BOT_ID`

#### Créer un Client Secret

1. Dans l'App Registration : **Certificates & secrets**
2. **New client secret**
3. Notez la **Value** → `BOT_PASSWORD`

#### Créer l'Azure Bot

1. Créez une ressource **Azure Bot**
2. Configurez :
   - Bot handle: `cybersensei-bot`
   - App ID: Utilisez l'ID créé précédemment
   - Messaging endpoint: `https://<votre-domaine>/api/messages`
3. Activez le canal **Microsoft Teams**

---

## 🚀 Lancement

### Mode Développement

```bash
cd bot

# Démarrer avec ts-node
npm run dev

# Ou avec nodemon (rechargement auto)
npm run watch
```

Le bot sera accessible sur `http://localhost:3978`

### Mode Production

```bash
# Build
npm run build

# Démarrer
npm start
```

### Test Local avec ngrok

Pour tester le bot dans Teams sans déployer :

```bash
# Installer ngrok
npm install -g ngrok

# Exposer le port 3978
ngrok http 3978
```

Copiez l'URL HTTPS (ex: `https://abc123.ngrok.io`) et mettez à jour :
- L'endpoint dans Azure Bot : `https://abc123.ngrok.io/api/messages`

---

## 💬 Utilisation

### Commandes de base

```
Utilisateur: quiz
Bot: [Affiche une carte avec le quiz du jour]

Utilisateur: Qu'est-ce que le phishing ?
Bot: [Réponse de l'IA avec explication]

Utilisateur: status
Bot: [Affiche vos informations et scores]

Utilisateur: aide
Bot: [Affiche la carte d'aide]
```

### Workflow complet

1. **Démarrer un quiz**
   ```
   User: "quiz"
   Bot: Affiche la carte avec questions
   User: Répond aux questions et clique "Soumettre"
   Bot: Affiche la carte de résultats
   ```

2. **Demander une explication**
   ```
   User: Dans la carte de résultats, clique "Demander explication"
   Bot: "Que souhaitez-vous que je vous explique ?"
   User: "Pourquoi ma réponse était fausse ?"
   Bot: [Explication contextuelle de l'IA]
   ```

3. **Conversation libre**
   ```
   User: "Comment créer un bon mot de passe ?"
   Bot: [Réponse de l'IA]
   User: "Donne-moi des exemples"
   Bot: [Suite de la conversation avec contexte]
   ```

---

## 🛠️ Développement

### Structure du code

#### bot.ts

Le fichier principal contient :
- `CyberSenseiBot` : Classe principale héritant de `ActivityHandler`
- `handleMessage()` : Gestion des messages texte
- `handleCardAction()` : Gestion des actions de cartes
- Méthodes pour chaque intention

#### intentRecognizer.ts

Reconnaissance d'intentions basée sur des patterns regex :
- Liste de patterns par intention
- Méthode `recognize(text)` retourne l'intention et la confiance
- Extraction d'entités (topics, etc.)

#### conversationState.ts

Stockage en mémoire de l'état des conversations :
- `get(conversationId)` : Récupère l'état
- `set(conversationId, data)` : Met à jour l'état
- `clear(conversationId)` : Efface l'état

> ⚠️ **Production** : Utiliser Azure Storage ou Cosmos DB pour la persistance

#### backendService.ts

Client REST pour le backend :
- Méthodes typées pour chaque endpoint
- Gestion d'erreurs
- Logging des requêtes

#### Cards (Adaptive Cards)

Chaque carte est une fonction retournant un objet JSON Adaptive Card :
- `createQuizCard(quiz)` : Carte de quiz
- `createResultCard(result, title)` : Carte de résultats
- `createHelpCard()` : Carte d'aide
- `createStatusCard(user, metrics?)` : Carte de statut

### Ajouter une nouvelle intention

1. **Ajouter les patterns dans `intentRecognizer.ts`**

```typescript
private patterns: Map<Intent, RegExp[]> = new Map([
  // ...
  [
    'newIntent',
    [
      /\b(keyword1|keyword2)\b/i,
      /\b(pattern)\b/i,
    ],
  ],
]);
```

2. **Ajouter le handler dans `bot.ts`**

```typescript
case 'newIntent':
  await this.handleNewIntent(context);
  break;
```

3. **Implémenter la méthode**

```typescript
private async handleNewIntent(context: TurnContext): Promise<void> {
  // Votre logique
  await context.sendActivity('Réponse');
}
```

### Créer une nouvelle carte

1. **Créer le fichier dans `cards/`**

```typescript
// cards/myCard.ts
export function createMyCard(data: any): any {
  return {
    type: 'AdaptiveCard',
    version: '1.5',
    body: [
      {
        type: 'TextBlock',
        text: 'Mon contenu',
      },
    ],
    actions: [
      {
        type: 'Action.Submit',
        title: 'Action',
        data: { action: 'myAction' },
      },
    ],
  };
}
```

2. **Utiliser dans le bot**

```typescript
import { createMyCard } from './cards/myCard';

const card = CardFactory.adaptiveCard(createMyCard(data));
await context.sendActivity(MessageFactory.attachment(card));
```

### Tester les cartes

Utilisez l'[Adaptive Cards Designer](https://adaptivecards.io/designer/) :
1. Copiez le JSON de votre carte
2. Collez dans le designer
3. Testez l'apparence et les interactions

---

## 🐛 Debugging

### Logs

Le bot log toutes les activités :

```typescript
console.log(`[Bot] Message from ${userName}: ${text}`);
console.log(`[Bot] Recognized intent: ${intent}`);
console.log(`[Backend] GET /api/quiz/today`);
```

### Mode Debug VS Code

Créez `.vscode/launch.json` :

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Bot",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/bot/src/index.ts",
      "preLaunchTask": "tsc: build - bot/tsconfig.json",
      "outFiles": ["${workspaceFolder}/bot/dist/**/*.js"]
    }
  ]
}
```

### Tester les endpoints

```bash
# Tester le health check
curl http://localhost:3978/health

# Simuler un message (nécessite un token valide)
curl -X POST http://localhost:3978/api/messages \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## 📚 Ressources

- [Bot Framework Documentation](https://docs.microsoft.com/en-us/azure/bot-service/)
- [Adaptive Cards](https://adaptivecards.io/)
- [Adaptive Cards Designer](https://adaptivecards.io/designer/)
- [Teams Bot Samples](https://github.com/microsoft/BotBuilder-Samples)

---

## 🚀 Améliorations futures

### Court terme
- [ ] Tests unitaires avec Jest
- [ ] Persistance d'état (Azure Storage)
- [ ] Métriques et télémétrie (Application Insights)
- [ ] Gestion multi-langue (i18n)

### Moyen terme
- [ ] LUIS pour reconnaissance avancée
- [ ] Proactive messaging (notifications)
- [ ] Rich media (images, vidéos)
- [ ] Commandes slash (/)

### Long terme
- [ ] Voice support
- [ ] Video support
- [ ] Meeting extensions
- [ ] Message extensions

---

## 🤝 Support

Pour toute question ou problème :
- Consultez les logs : `console.log` dans le code
- Vérifiez la configuration Azure Bot
- Testez les endpoints backend
- Ouvrez une issue GitHub

---

**Version:** 2.0.0  
**Date:** 2024-11-24  
**Auteur:** CyberSensei Team

