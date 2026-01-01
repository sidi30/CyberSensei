# 🎯 CyberSensei Teams - Architecture Simple

> **Le bot décide, l'utilisateur obéit !**

---

## 📋 L'Âme du Projet

### Les 3 Composants

```
┌─────────────────────────────────────────┐
│  CYBERSENSEI NODE (Port 8080)           │
│  ├─ Backend Spring Boot                 │
│  │  ✅ /api/quiz/today                  │
│  │  ✅ /api/exercise/{id}/submit        │
│  │  ✅ /api/exercises/history           │
│  └─ Dashboard Entreprise (Port 3000)    │
│     Voir qui fait / ne fait pas         │
└─────────────────────────────────────────┘
               ↕️
┌─────────────────────────────────────────┐
│  CYBERSENSEI TEAMS                      │
│  ├─ Bot (Port 3978)                     │
│  │  Notifie chaque jour                 │
│  └─ Interface (Port 5175/5176)          │
│     Exercice du jour OBLIGATOIRE        │
│     Pas de choix = Pas de mauvaise foi  │
└─────────────────────────────────────────┘
               ↕️
┌─────────────────────────────────────────┐
│  CYBERSENSEI CENTRAL                    │
│  Dashboard global pour VOUS             │
│  Métriques et analytics                 │
└─────────────────────────────────────────┘
```

---

## 🚀 Comment Ça Marche

### 1. Matin (9h)
```
BOT → Notification Teams
    "Hey ! Ton exercice du jour t'attend"
    [Ouvrir l'exercice]
```

### 2. Utilisateur Clique
```
Interface Teams → Affiche message
    "Ton exercice est prêt. 5 minutes. C'est maintenant !"
    [Commencer] (pas d'esquive)
```

### 3. Exercice
```
GET /api/quiz/today
→ Backend retourne un quiz

Interface affiche question 1/4
→ Utilisateur DOIT répondre (pas de skip)
→ Feedback immédiat
→ Question suivante automatique
```

### 4. Soumission
```
POST /api/exercise/{id}/submit
→ Backend enregistre les résultats

Interface affiche score
→ "Bravo ! À demain !"
```

---

## ✅ Philosophie

**LE BOT DÉCIDE** :
- ✅ Quel exercice aujourd'hui
- ✅ Quelle difficulté
- ✅ Pas de skip
- ✅ Pas de choix de module

**L'UTILISATEUR** :
- ❌ Ne choisit PAS
- ✅ Fait l'exercice
- ✅ 5 minutes obligatoires
- ✅ Compliance garantie

---

## 📊 Métriques

**Dashboard Entreprise** voit :
- Qui a fait l'exercice du jour ✅
- Qui n'a pas fait ❌
- Scores moyens
- Compliance rate

**Vous** (Central) voyez :
- Métriques globales
- Tendances
- Analytics avancées

---

## 🔧 APIs Utilisées

### Backend CyberSensei Node (déjà existant)

1. **GET `/api/quiz/today`**
   - Retourne l'exercice du jour
   - Personnalisé par utilisateur

2. **POST `/api/exercise/{id}/submit`**
   - Soumet les réponses
   - Calcule le score
   - Enregistre les résultats

3. **GET `/api/exercises/history`**
   - Historique de l'utilisateur
   - Pour dashboard entreprise

**Pas besoin de créer de nouvelles APIs !**

---

## 🎯 Interface Simple

### Avant (Erreur)
```
❌ Dashboard avec 5 modules
❌ Utilisateur choisit
❌ Navigation complexe
❌ Mauvaise foi possible
```

### Maintenant (Correct)
```
✅ Message : "Ton exercice t'attend"
✅ Bouton : "Commencer"
✅ Question 1/4
✅ Pas de skip
✅ Question 2/4...
✅ Résultat : "À demain !"
```

---

## 🚀 Lancer le Projet

```bash
# Terminal 1: Backend Node
cd cybersensei-node/backend
java -jar target/cybersensei-node-backend-1.0.0.jar

# Terminal 2: Interface Teams
cd cybersensei-teams-app/tabs/employee
npm run dev
```

Ouvrir: **http://localhost:5175** (ou 5176)

---

## ✅ Résultat

- Interface simple : un bouton "Commencer"
- Exercice affiché un par un
- Pas de navigation complexe
- L'utilisateur DOIT terminer
- Métriques fiables pour l'entreprise

**Simple. Efficace. Obligatoire.**

---

**Date:** Janvier 2026  
**Version:** Simplifiée et Corrigée

