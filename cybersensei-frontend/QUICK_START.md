# 🚀 Quick Start - CyberSensei Frontend

## Installation en 3 minutes

### 1️⃣ Installation

```bash
cd cybersensei-frontend
npm install
```

### 2️⃣ Configuration

Créer un fichier `.env` :

```bash
echo "REACT_APP_API_URL=http://localhost:8080/api" > .env
```

### 3️⃣ Lancement

```bash
npm start
```

✅ L'application démarre sur **http://localhost:3000**

---

## 🎯 Stack Rapide

| Technologie | Usage |
|-------------|-------|
| React 18 + TypeScript | Framework |
| Tailwind CSS | Styling |
| Axios | API calls |
| Chart.js | Graphiques |
| Context API | État global |

---

## 📋 Composants Principaux

### EmployeeTab
```
📊 Statut utilisateur
├── Dernier quiz
└── Score global

📝 Exercice du jour
├── Question MCQ
├── 4 options
└── Résultat + explication

💬 Chat IA
└── Question/Réponse
```

### ManagerTab
```
📈 KPIs
├── Score entreprise
├── Participation
└── Statut système

👥 Tableau utilisateurs
└── Détails par utilisateur
    ├── Répartition par sujet
    ├── Résultats phishing
    └── Actions recommandées

📊 Graphique tendances
└── Score vs Phishing (Chart.js)

⚙️ Paramètres
├── Fréquence phishing
└── Intensité formation
```

---

## 🔌 Endpoints API Utilisés

| Endpoint | Méthode | Usage |
|----------|---------|-------|
| `/api/user/me` | GET | User actuel |
| `/api/quiz/today` | GET | Quiz du jour |
| `/api/exercise/{id}/submit` | POST | Soumettre réponse |
| `/api/ai/chat` | POST | Chat IA |
| `/api/manager/metrics` | GET | Métriques entreprise |
| `/api/settings` | GET | Paramètres |
| `/api/settings/save` | POST | Sauvegarder |

---

## 🎨 Design System

### Couleurs
```typescript
primary: Bleu (#3b82f6)
success: Vert (#22c55e)
danger: Rouge (#ef4444)
warning: Jaune (#eab308)
```

### Composants Utilitaires
```tsx
<LoadingSpinner size="md" message="Chargement..." />
<ErrorMessage message="Erreur" onRetry={() => {}} />
```

---

## 🔐 Authentification

### Mock Login (Dev)
```typescript
// Dans AuthContext
localStorage.setItem('authToken', 'mock-token');
```

### Production
```typescript
const response = await apiService.login({
  email: 'admin@cybersensei.io',
  password: 'admin123'
});
```

---

## 📱 Responsive

- ✅ Mobile (< 640px)
- ✅ Tablet (< 768px)
- ✅ Desktop (> 1024px)
- ✅ Microsoft Teams compatible

---

## 🐛 Debugging

### Problèmes Courants

**❌ CORS Error**
```bash
# Backend : Autoriser http://localhost:3000
```

**❌ API 404**
```bash
# Vérifier REACT_APP_API_URL dans .env
```

**❌ Module not found**
```bash
npm install
```

---

## 📦 Build Production

```bash
npm run build
```

Résultat dans `build/` :
- HTML/CSS/JS minifiés
- Assets optimisés
- Prêt pour déploiement

---

## 🚀 Scripts Disponibles

```bash
npm start      # Dev server (port 3000)
npm test       # Tests
npm run build  # Build production
npm run eject  # Éjecter CRA (⚠️ irreversible)
```

---

## 🔥 Features Clés

### EmployeeTab
✅ Quiz interactif MCQ  
✅ Timer automatique  
✅ Feedback instantané  
✅ Chat IA conversationnel  
✅ États loading/error  

### ManagerTab
✅ KPIs temps réel  
✅ Tableau utilisateurs  
✅ Drawer de détails  
✅ Graphique Chart.js  
✅ Paramètres éditables  

---

## 📚 Documentation

- **README.md** - Guide complet
- **FEATURES.md** - Détails fonctionnalités
- **QUICK_START.md** - Ce fichier

---

## 🆘 Support

Problème ? Créer une issue ou contacter :
📧 frontend@cybersensei.io

---

**Temps estimé de setup : 3 minutes** ⚡  
**Prêt pour la production** ✅


