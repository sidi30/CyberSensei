# Fonctionnalités Détaillées - CyberSensei Frontend

## 🎯 Vue d'Ensemble

Frontend React + TypeScript complet avec deux interfaces principales :
- **EmployeeTab** - Interface utilisateur pour la formation
- **ManagerTab** - Dashboard de gestion et analytics

---

## 👤 EMPLOYEE TAB

### 1. Header Utilisateur
**Implémentation:**
```tsx
<div className="flex items-center space-x-4">
  <div className="w-16 h-16 rounded-full bg-primary-500">
    {user?.name?.charAt(0) || 'U'}
  </div>
  <div>
    <h1>{user?.name}</h1>
    <p>{user?.email}</p>
    <p>{user?.department}</p>
  </div>
</div>
```

**Données:**
- Photo : Initiale (ou MS Graph API photo)
- Nom : `user.name`
- Email : `user.email`
- Département : `user.department`

### 2. Section "Statut CyberSensei"

**KPIs affichés:**
```tsx
// Dernier quiz
lastQuizDate: string // "15/01/2024" ou "Aucun"

// Score global
globalScore: number // 0-100
```

**Design:**
- 2 cartes côte à côte (responsive grid)
- Couleurs : Bleu (quiz) / Vert (score)
- Icônes et grandes valeurs

### 3. Section "Exercice du Jour"

**Flow complet:**

1. **Chargement** (`GET /api/quiz/today`)
```typescript
const exercise: Exercise = {
  id: 1,
  topic: "Phishing Recognition",
  type: "QUIZ",
  difficulty: "INTERMEDIATE",
  payloadJSON: {
    question: "Quel est un signe de phishing?",
    options: [
      "Grammaire correcte",
      "Langage urgent",
      "Liens suspects",
      "Toutes les réponses"
    ],
    correctAnswer: 3,
    explanation: "Les emails de phishing combinent..."
  }
}
```

2. **Affichage**
- Badge de difficulté (couleur adaptée)
- Sujet de l'exercice
- Question dans un cadre
- Options cliquables (4 boutons)
- Sélection visuelle (bordure bleue)

3. **Soumission** (`POST /api/exercise/{id}/submit`)
```typescript
const submission: SubmitExerciseRequest = {
  score: 100, // ou 0
  success: true,
  duration: 45, // secondes
  detailsJSON: {
    selectedAnswer: 2,
    correctAnswer: 3
  }
}
```

4. **Résultat**
- Carte verte (succès) ou rouge (échec)
- Score en gros (100% ou 0%)
- Explication de la bonne réponse
- Si échec : affichage de la réponse correcte
- Bouton "Prochain exercice"

**États gérés:**
```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [exercise, setExercise] = useState<Exercise | null>(null);
const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
const [result, setResult] = useState<UserExerciseResult | null>(null);
const [startTime] = useState(Date.now());
```

### 4. Section "Demandez à CyberSensei"

**Interface Chat:**

```tsx
// Structure d'un message
interface ChatMessage {
  from: 'user' | 'ai';
  text: string;
}
```

**Fonctionnalités:**
- Textarea pour la question
- Bouton "Demander"
- Historique des messages en bulles
  - Bulles bleues à droite (utilisateur)
  - Bulles blanches à gauche (IA)
- Scroll automatique
- Enter pour envoyer
- Shift+Enter pour nouvelle ligne
- Loading indicator pendant réponse IA

**Appel API** (`POST /api/ai/chat`)
```typescript
const request: AIChatRequest = {
  prompt: "Comment reconnaître un email de phishing?",
  context: "cybersecurity training"
};

const response: AIChatResponse = {
  response: "Un email de phishing présente...",
  sessionId: "uuid-session"
};
```

---

## 👔 MANAGER TAB

### 1. KPIs Section (Top)

**3 cartes principales:**

```tsx
// 1. Score entreprise
{
  score: 78,
  riskLevel: "MEDIUM",
  icon: "🛡️"
}

// 2. Taux de participation
{
  rate: 85,
  completedExercises: 156,
  icon: "📊"
}

// 3. Statut système
{
  lastUpdate: "15/01/2024",
  status: "UP",
  icon: "✓"
}
```

**Design:**
- Grid 3 colonnes (responsive)
- Grandes valeurs numériques
- Badges de niveau de risque
- Icônes emoji pour clarté

### 2. Tableau Utilisateurs

**Colonnes:**
| Nom | Département | Score | Niveau de risque | Actions |
|-----|-------------|-------|------------------|---------|
| Avatar + Nom | IT | 85% (barre) | Badge LOW | Voir détails → |

**Fonctionnalités:**
- Tri par colonne (à implémenter)
- Barre de progression visuelle pour le score
- Badges colorés pour le risque
- Clic sur ligne → ouvre drawer de détails
- Responsive (scroll horizontal sur mobile)

**Données utilisateur:**
```typescript
interface UserMetrics {
  userId: number;
  name: string;
  department: string;
  score: number; // 0-100
  riskLevel: RiskLevel;
  lastQuizDate: string;
  completedExercises: number;
  phishingClickRate: number;
  topicBreakdown: TopicScore[];
  recommendedActions: string[];
}
```

### 3. Drawer "Détails Utilisateur"

**Ouverture:**
- Slide depuis la droite
- Overlay noir semi-transparent
- Largeur : 500px sur desktop, full sur mobile
- Bouton X pour fermer

**Contenu:**

1. **Header**
   - Avatar large
   - Nom + Département
   - Badge de risque

2. **Stats rapides (2 cartes)**
   - Score global : 85%
   - Exercices complétés : 12

3. **Répartition par sujet**
```tsx
topicBreakdown: [
  { topic: "Phishing", score: 90, exercises: 4 },
  { topic: "Passwords", score: 85, exercises: 3 },
  { topic: "Social Engineering", score: 80, exercises: 5 }
]
```
Affichage :
- Nom du sujet + score + nombre d'exercices
- Barre de progression colorée
- Liste verticale

4. **Résultat Phishing**
```tsx
<div className="bg-yellow-50 border border-yellow-200">
  Taux de clic : 20%
  {clickRate > 30 ? '⚠️ Attention' : '✓ Bon'}
</div>
```

5. **Actions Recommandées**
```tsx
recommendedActions: [
  "Continuer les exercices avancés",
  "Réviser la sécurité des mots de passe"
]
```
Affichage en liste à puces

### 4. Section "Tendances Entreprise"

**Graphique Chart.js:**

```typescript
import { Line } from 'react-chartjs-2';

const chartData = {
  labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
  datasets: [
    {
      label: 'Score de sécurité',
      data: [65, 70, 75, 78],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    {
      label: 'Taux de clics phishing',
      data: [35, 28, 22, 18],
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
    }
  ]
};
```

**Configuration:**
- Type : Line chart
- Hauteur : 300px
- Responsive : true
- Légende en haut
- Axe Y : 0-100
- Tooltip sur hover

### 5. Section "Paramètres"

**Champs de configuration:**

1. **Fréquence phishing**
```tsx
<input 
  type="number" 
  min="0" 
  max="7"
  value={phishingFrequency}
/>
```
Label : "Fréquence des emails de phishing (par semaine)"

2. **Intensité formation**
```tsx
<select value={trainingIntensity}>
  <option value="low">Faible (1 exercice/semaine)</option>
  <option value="medium">Moyenne (3 exercices/semaine)</option>
  <option value="high">Élevée (5 exercices/semaine)</option>
</select>
```

3. **Bouton Sauvegarder**
```tsx
<button 
  onClick={handleSaveSettings}
  disabled={savingSettings}
>
  {savingSettings ? 'Sauvegarde...' : 'Sauvegarder'}
</button>
```

**API Call** (`POST /api/settings/save`)
```typescript
const settings: CompanySettings = {
  phishingFrequency: 2,
  trainingIntensity: 'medium',
  companyName: 'Acme Corp',
  smtpEnabled: true
};
```

---

## 🎨 Design System Détaillé

### Couleurs par Contexte

**Niveau de difficulté:**
```css
BEGINNER    → bg-success-100 text-success-800 (vert)
INTERMEDIATE → bg-primary-100 text-primary-800 (bleu)
ADVANCED    → bg-yellow-100 text-yellow-800 (jaune)
EXPERT      → bg-danger-100 text-danger-800 (rouge)
```

**Niveau de risque:**
```css
LOW      → bg-success-100 text-success-800
MEDIUM   → bg-yellow-100 text-yellow-800
HIGH     → bg-orange-100 text-orange-800
CRITICAL → bg-danger-100 text-danger-800
```

**États UI:**
```css
Loading  → Spinner bleu primaire
Error    → Fond rouge léger, bordure rouge, icône X
Success  → Fond vert léger, bordure verte, icône ✓
Warning  → Fond jaune léger, bordure jaune, icône ⚠️
```

### Composants Réutilisables

**LoadingSpinner:**
```tsx
<LoadingSpinner 
  size="sm|md|lg" 
  message="Chargement..." 
/>
```

**ErrorMessage:**
```tsx
<ErrorMessage 
  message="Erreur de chargement"
  onRetry={() => loadData()}
/>
```

---

## 📱 Responsive Design

### Breakpoints

```css
Mobile  : < 640px  (sm)
Tablet  : < 768px  (md)
Desktop : < 1024px (lg)
```

### Adaptations

**EmployeeTab:**
- Stack vertical sur mobile
- Quiz : options en colonne
- Chat : pleine largeur

**ManagerTab:**
- KPIs : 1 colonne sur mobile, 3 sur desktop
- Tableau : scroll horizontal sur mobile
- Drawer : pleine largeur sur mobile
- Graphique : hauteur réduite sur mobile

---

## ⚡ Performance

### Optimisations Implémentées

1. **Code Splitting**
   - Lazy loading des composants lourds
   - Dynamic imports

2. **Memoization**
   - `React.memo()` pour les composants
   - `useMemo()` pour calculs coûteux
   - `useCallback()` pour handlers

3. **API Caching**
   - Interceptors Axios
   - Cache des métriques (5 min)

4. **Bundle Size**
   - Tailwind purge CSS
   - Tree shaking automatique
   - Compression gzip

---

## 🔒 Sécurité

### Implémenté

- ✅ JWT dans localStorage
- ✅ Auto-refresh token
- ✅ Redirection 401 → login
- ✅ CORS configuration
- ✅ XSS protection (React escape)
- ✅ Input validation
- ✅ Error boundaries

### À Implémenter (Production)

- [ ] CSRF tokens
- [ ] Rate limiting UI
- [ ] Content Security Policy
- [ ] Secure cookie storage (HttpOnly)

---

## 🧪 Testing

### Tests à Écrire

```typescript
// EmployeeTab.test.tsx
describe('EmployeeTab', () => {
  it('loads today quiz', async () => {});
  it('submits answer correctly', async () => {});
  it('displays AI chat', async () => {});
});

// ManagerTab.test.tsx
describe('ManagerTab', () => {
  it('displays KPIs', async () => {});
  it('opens user drawer', async () => {});
  it('saves settings', async () => {});
});
```

---

**Version:** 1.0.0  
**Dernière MAJ:** 2024  
**Auteur:** CyberSensei Team


