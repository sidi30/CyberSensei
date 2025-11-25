# 🤖 Améliorations du Bot CyberSensei

## 📋 Vue d'ensemble

Le bot CyberSensei a été **complètement refactorisé** avec :
- ✅ **Reconnaissance d'intentions** avec patterns avancés
- ✅ **Cartes adaptives** pour quiz et résultats
- ✅ **Gestion d'état** de conversation
- ✅ **Service backend** propre et typé
- ✅ **Architecture modulaire** et maintenable

---

## 🎯 Fonctionnalités implémentées

### 1. **Reconnaissance d'intentions (Intent Recognition)**

**Fichier:** `src/intentRecognizer.ts`

Le bot reconnaît automatiquement 6 intentions :

| Intention | Triggers | Exemples |
|-----------|----------|----------|
| **quiz** | quiz, start, training, exercice | "Lance un quiz", "start training" |
| **explain** | explain, pourquoi, why, comment | "Explique-moi", "Pourquoi ?" |
| **help** | help, aide, assist, commandes | "Aide", "Que peux-tu faire ?" |
| **status** | status, statut, score, progression | "Mon score", "Où en suis-je ?" |
| **greeting** | bonjour, salut, hello, hi | "Bonjour", "Hey" |
| **unknown** | (tout le reste) | Messages libres → Chat IA |

**Implémentation :**
```typescript
const recognized = intentRecognizer.recognize(text);
// { intent: 'quiz', confidence: 0.9 }
```

**Avantages :**
- Patterns regex multilingues (FR/EN)
- Facilement extensible
- Confiance calculée
- Extraction d'entités (topics)

### 2. **Cartes Adaptives (Adaptive Cards)**

#### Quiz Card (`cards/quizCard.ts`)

**Contenu :**
- Header avec logo et titre
- Description du quiz
- Métadonnées (sujet, difficulté, nombre de questions)
- Questions avec **radio buttons** (Input.ChoiceSet)
- Bouton "Soumettre" avec validation
- Bouton "Annuler"

**Fonctionnalités :**
- `isRequired: true` sur chaque question
- Messages d'erreur si réponse manquante
- Data payloadavec `quizId` pour la soumission
- Style `expanded` pour meilleure UX

**Exemple d'utilisation :**
```typescript
const card = CardFactory.adaptiveCard(createQuizCard(quiz));
await context.sendActivity(MessageFactory.attachment(card));
```

#### Result Card (`cards/resultCard.ts`)

**Contenu :**
- Header avec emoji (🎉 si succès, 💪 sinon)
- Style de container adapté (good/attention)
- Score grand format avec pourcentage
- FactSet avec statistiques :
  - Bonnes réponses
  - Erreurs
  - Total
- Feedback du backend
- Détails par question (si disponible)
- 2 actions :
  - "Demander une explication" → Trigger explain intent
  - "Nouveau quiz" → Relance un quiz

**Logique adaptative :**
```typescript
const percentage = Math.round((score / maxScore) * 100);
const isSuccess = percentage >= 70;
// Style et emojis adaptés
```

#### Help Card (`cards/helpCard.ts`)

**Contenu :**
- Liste des commandes avec descriptions
- FactSet pour un format propre
- Exemples de questions libres
- Bouton "Commencer un quiz"

#### Status Card (`cards/statusCard.ts`)

**Contenu :**
- Informations utilisateur (nom, email, rôle)
- FactSet avec poste et département
- **Pour managers/admins :**
  - Métriques entreprise
  - Score entreprise
  - Utilisateurs actifs
  - Score moyen
  - Exercices complétés
- Actions rapides

**Logique conditionnelle :**
```typescript
const isManager = user.role === 'MANAGER' || user.role === 'ADMIN';
if (isManager && metrics) {
  // Ajouter section métriques
}
```

### 3. **Gestion d'état de conversation**

**Fichier:** `src/conversationState.ts`

**Interface ConversationData :**
```typescript
interface ConversationData {
  lastExerciseId?: string;        // ID du dernier quiz
  lastQuestionContext?: string;   // Contexte pour explications
  lastQuizTitle?: string;         // Titre pour résultats
  userName?: string;              // Nom utilisateur
  userRole?: string;              // Rôle utilisateur
}
```

**API :**
```typescript
// Récupérer l'état
const state = conversationState.get(conversationId);

// Mettre à jour
conversationState.set(conversationId, {
  lastExerciseId: quiz.id,
  lastQuizTitle: quiz.title,
});

// Effacer
conversationState.clear(conversationId);
```

**Stockage :**
- Actuellement : **Map en mémoire** (simple, rapide)
- Production : Migrer vers **Azure Storage** ou **Cosmos DB**

### 4. **Service Backend**

**Fichier:** `src/services/backendService.ts`

**Client REST typé :**
```typescript
class BackendService {
  private client: AxiosInstance;

  async getTodayQuiz(userId?: string): Promise<Quiz>
  async submitExercise(exerciseId, answers): Promise<SubmitAnswersResponse>
  async chatWithAI(message, context?): Promise<ChatResponse>
  async getUser(userId): Promise<User>
  async getManagerMetrics(): Promise<ManagerMetrics>
}
```

**Fonctionnalités :**
- ✅ Intercepteurs pour logging
- ✅ Gestion d'erreurs centralisée
- ✅ Timeout de 30 secondes
- ✅ Types TypeScript complets
- ✅ Singleton pattern

**Endpoints utilisés :**
```
GET  /api/quiz/today
POST /api/exercise/{id}/submit
POST /api/ai/chat
GET  /api/user/me
GET  /api/manager/metrics
```

### 5. **Bot Principal**

**Fichier:** `src/bot.ts`

**Architecture :**
```typescript
class CyberSenseiBot extends ActivityHandler {
  // Handlers principaux
  onMessage()              // Messages texte
  onMembersAdded()         // Nouveaux membres

  // Gestion des messages
  handleMessage()          // Dispatch selon intent
  handleCardAction()       // Actions de cartes

  // Handlers par intention
  handleQuizIntent()       // Lancer un quiz
  handleQuizSubmission()   // Soumettre réponses
  handleExplainIntent()    // Demander explication
  handleHelpIntent()       // Afficher aide
  handleStatusIntent()     // Afficher statut
  handleGreetingIntent()   // Salutation
  handleChatIntent()       // Chat libre avec IA
}
```

**Workflow Quiz complet :**

1. **Utilisateur :** "quiz"
2. **Bot :** Reconnaît intention → `handleQuizIntent()`
3. **Backend :** `GET /api/quiz/today`
4. **Bot :** Sauvegarde `lastExerciseId` et affiche QuizCard
5. **Utilisateur :** Répond et clique "Soumettre"
6. **Bot :** `handleQuizSubmission()` extrait réponses
7. **Backend :** `POST /api/exercise/{id}/submit`
8. **Bot :** Sauvegarde contexte et affiche ResultCard
9. **Utilisateur :** Clique "Demander explication"
10. **Bot :** Utilise `lastQuestionContext` pour expliquer

**Gestion des actions de cartes :**
```typescript
if (context.activity.value) {
  // C'est une action de carte (Action.Submit)
  const data = context.activity.value;
  switch (data.action) {
    case 'submitQuiz':
      // Extraire les réponses du data
      // Soumettre au backend
      break;
    case 'explain':
      // Utiliser data.context
      break;
  }
}
```

---

## 🏗️ Architecture technique

### Flux de données

```
Utilisateur (Teams)
    ↓
Bot Framework Adapter
    ↓
CyberSenseiBot.onMessage()
    ↓
Intent Recognizer
    ↓
Handler spécifique (ex: handleQuizIntent)
    ↓
Backend Service
    ↓
Backend CyberSensei API
    ↓
Réponse (JSON)
    ↓
Carte Adaptive / Message
    ↓
Utilisateur (Teams)
```

### Dépendances

```json
{
  "botbuilder": "^4.21.0",       // SDK Bot Framework
  "restify": "^11.1.0",          // Serveur HTTP
  "axios": "^1.6.2",             // Client HTTP REST
  "dotenv": "^16.3.1",           // Variables d'env
  "adaptivecards": "^3.0.3",    // Cartes adaptives (optionnel)
}
```

### Structure des fichiers

```
bot/
├── src/
│   ├── bot.ts                 # ✅ Logique principale (500+ lignes)
│   ├── index.ts               # ✅ Serveur Restify
│   ├── config.ts              # ✅ Configuration
│   ├── conversationState.ts   # ✅ Gestion d'état (NEW)
│   ├── intentRecognizer.ts    # ✅ Reconnaissance intents (NEW)
│   ├── services/
│   │   └── backendService.ts  # ✅ Client backend typé (NEW)
│   └── cards/
│       ├── quizCard.ts        # ✅ Carte quiz (NEW)
│       ├── resultCard.ts      # ✅ Carte résultats (NEW)
│       ├── helpCard.ts        # ✅ Carte aide (NEW)
│       └── statusCard.ts      # ✅ Carte statut (NEW)
├── package.json
├── tsconfig.json
└── README.md                  # ✅ Documentation complète (NEW)
```

---

## 🎨 Exemples de cartes

### Quiz Card (JSON simplifié)

```json
{
  "type": "AdaptiveCard",
  "version": "1.5",
  "body": [
    {
      "type": "TextBlock",
      "text": "📝 Quiz CyberSensei",
      "weight": "Bolder"
    },
    {
      "type": "TextBlock",
      "text": "Question 1: Qu'est-ce que le phishing ?"
    },
    {
      "type": "Input.ChoiceSet",
      "id": "question_1",
      "choices": [
        { "title": "Technique d'hameçonnage", "value": "0" },
        { "title": "Type de virus", "value": "1" }
      ]
    }
  ],
  "actions": [
    {
      "type": "Action.Submit",
      "title": "Soumettre",
      "data": { "action": "submitQuiz", "quizId": "123" }
    }
  ]
}
```

### Result Card (JSON simplifié)

```json
{
  "type": "AdaptiveCard",
  "body": [
    {
      "type": "Container",
      "style": "good",
      "items": [
        { "type": "TextBlock", "text": "🎉 Bravo !" }
      ]
    },
    {
      "type": "TextBlock",
      "text": "8 / 10",
      "size": "ExtraLarge",
      "color": "Good"
    },
    {
      "type": "TextBlock",
      "text": "Excellent travail ! Vous maîtrisez bien le sujet."
    }
  ],
  "actions": [
    {
      "type": "Action.Submit",
      "title": "Demander explication",
      "data": { "action": "explain" }
    }
  ]
}
```

---

## 🔧 Configuration

### Variables d'environnement

```env
# Backend
BACKEND_BASE_URL=https://cybersensei.local:8080

# Bot Azure
BOT_ID=<azure-app-id>
BOT_PASSWORD=<azure-app-secret>

# Server
PORT=3978
NODE_ENV=development
```

### Endpoints backend requis

Le bot s'attend à ces endpoints :

```
GET  /api/quiz/today
     Response: { id, title, description, questions[], topic, difficulty }

POST /api/exercise/{id}/submit
     Body: { answers: [{ questionId, answer }] }
     Response: { score, maxScore, correct, total, feedback, details? }

POST /api/ai/chat
     Body: { message, context? }
     Response: { response, context? }

GET  /api/user/me?userId={id}
     Response: { id, email, displayName, role, department?, jobTitle? }

GET  /api/manager/metrics
     Response: { companyScore, averageScore, totalUsers, activeUsers, completedExercises }
```

---

## 🚀 Déploiement

### Local (développement)

```bash
cd bot
npm install
npm run dev
```

### Avec ngrok (test Teams)

```bash
ngrok http 3978
# Copier l'URL HTTPS
# Mettre à jour Azure Bot messaging endpoint
```

### Production (Azure App Service)

```bash
# Build
npm run build

# Déployer
az webapp up --name cybersensei-bot \
  --resource-group cybersensei-rg \
  --runtime "NODE:18-lts"

# Configurer les variables
az webapp config appsettings set \
  --name cybersensei-bot \
  --settings BOT_ID="xxx" BOT_PASSWORD="yyy" BACKEND_BASE_URL="zzz"
```

---

## 📊 Métriques & Monitoring

### Logs

Tous les événements importants sont loggés :

```typescript
console.log(`[Bot] Message from ${userName}: ${text}`);
console.log(`[Bot] Recognized intent: ${intent}`);
console.log(`[Backend] GET /api/quiz/today`);
console.error('[Bot] Error:', error);
```

### Application Insights (recommandé)

Ajouter dans `index.ts` :

```typescript
import { TelemetryClient } from 'applicationinsights';

const telemetry = new TelemetryClient(process.env.APPINSIGHTS_KEY);
telemetry.trackEvent({ name: 'QuizStarted' });
telemetry.trackMetric({ name: 'QuizScore', value: score });
```

---

## 🧪 Tests

### Tests unitaires (à implémenter)

```typescript
// bot.test.ts
describe('CyberSenseiBot', () => {
  it('should recognize quiz intent', async () => {
    const recognized = intentRecognizer.recognize('start quiz');
    expect(recognized.intent).toBe('quiz');
  });

  it('should create quiz card', async () => {
    const card = createQuizCard(mockQuiz);
    expect(card.type).toBe('AdaptiveCard');
    expect(card.body).toHaveLength(mockQuiz.questions.length);
  });
});
```

### Tests d'intégration

Utiliser [Bot Framework Emulator](https://github.com/Microsoft/BotFramework-Emulator) :
1. Télécharger l'émulateur
2. Se connecter à `http://localhost:3978/api/messages`
3. Tester toutes les commandes

---

## 🔮 Améliorations futures

### Court terme
- [x] Reconnaissance d'intentions ✅
- [x] Cartes adaptives complètes ✅
- [x] Gestion d'état ✅
- [ ] Tests unitaires
- [ ] Persistance d'état (Azure Storage)

### Moyen terme
- [ ] LUIS pour NLU avancé
- [ ] Notifications proactives
- [ ] Multi-langue (i18n)
- [ ] Rich media (images, vidéos)

### Long terme
- [ ] Voice interactions
- [ ] Meeting extensions
- [ ] Message extensions
- [ ] Adaptive Card actions avancées

---

## 📚 Ressources

- [Bot Framework SDK](https://github.com/microsoft/botbuilder-js)
- [Adaptive Cards](https://adaptivecards.io/)
- [Adaptive Cards Designer](https://adaptivecards.io/designer/)
- [Teams Bot Samples](https://github.com/OfficeDev/Microsoft-Teams-Samples)
- [Bot Emulator](https://github.com/Microsoft/BotFramework-Emulator)

---

**Version:** 2.0.0  
**Date:** 2024-11-24  
**Auteur:** CyberSensei Team  
**Stack:** Node.js + TypeScript + Bot Framework v4

