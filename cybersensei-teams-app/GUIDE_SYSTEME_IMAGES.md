# 📸 Guide du Système de Gestion d'Images CyberSensei

## 🎯 Vue d'ensemble

Le bot CyberSensei peut maintenant afficher des **captures d'écran et images d'exemples** pendant les exercices pour rendre la sensibilisation plus visuelle et réaliste.

---

## 🗂️ Architecture

### 1. **Stockage des Images**

Les images sont stockées dans :
```
cybersensei-teams-app/tabs/employee/public/assets/images/
```

### 2. **Base de Données Images**

Table `exercise_images` (optionnelle) pour centraliser les métadonnées :

```sql
CREATE TABLE exercise_images (
    id BIGSERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Catégories disponibles :**
- `phishing` - Emails de phishing
- `fake_login` - Fausses pages de connexion
- `suspicious_link` - Liens suspects
- `social_engineering` - Ingénierie sociale
- `fake_invoice` - Fausses factures
- `malicious_attachment` - Pièces jointes dangereuses
- `ransomware` - Écrans de ransomware
- `remote_work` - Risques du télétravail

---

## 🖼️ Utilisation dans les Exercices

### Dans le `payload_json` des exercices :

```json
{
  "questions": [
    {
      "id": "ph_b_j1_q1",
      "text": "Tu reçois cet email. Est-il suspect ?",
      "imageUrl": "/assets/images/phishing_email_microsoft.png",
      "imageDescription": "Email Microsoft avec urgence et fautes d'orthographe",
      "options": ["Je clique", "Je supprime", "Je réponds"],
      "correctAnswer": 1,
      "feedbackCorrect": "...",
      "feedbackIncorrect": "...",
      "keyTakeaway": "..."
    }
  ]
}
```

### Propriétés disponibles :

- **`imageUrl`** (requis) : Chemin vers l'image (ex: `/assets/images/phishing_email_microsoft.png`)
- **`imageDescription`** (optionnel) : Description alternative pour l'accessibilité et le contexte

---

## 🎨 Création d'Images d'Exemples

### **Recommandations :**

1. **Format** : PNG ou JPG
2. **Résolution** : 800-1200px de largeur
3. **Poids** : < 500 KB par image (optimiser avec TinyPNG)
4. **Contenu** : 
   - Faux emails réalistes (mais clairement fictifs)
   - Fausses pages de connexion
   - Exemples de liens suspects
   - Illustrations d'ingénierie sociale

### **⚠️ IMPORTANT - Sécurité :**

- ❌ **NE JAMAIS** utiliser de vraies captures avec des données réelles
- ❌ **NE JAMAIS** inclure de vraies adresses email d'employés
- ❌ **NE JAMAIS** montrer de vraies pages de l'entreprise
- ✅ **TOUJOURS** créer des exemples fictifs mais réalistes

---

## 🛠️ Ajout d'une Nouvelle Image

### **Étape 1 : Créer/Obtenir l'image**

- Créez un faux email avec Figma, Canva, ou Photoshop
- Ou utilisez une capture d'un environnement de test sécurisé

### **Étape 2 : Optimiser l'image**

```bash
# Utilisez TinyPNG ou un outil de compression
# Objectif : < 500 KB
```

### **Étape 3 : Ajouter au projet**

```bash
# Copiez l'image dans le dossier
cp mon_image.png cybersensei-teams-app/tabs/employee/public/assets/images/
```

### **Étape 4 : (Optionnel) Enregistrer dans la BDD**

```sql
INSERT INTO exercise_images (filename, display_name, description, category, image_url) 
VALUES (
    'phishing_email_nouveau.png',
    'Faux email nouveau style',
    'Email de phishing avec nouveau format',
    'phishing',
    '/assets/images/phishing_email_nouveau.png'
);
```

### **Étape 5 : Référencer dans un exercice**

Modifiez le `payload_json` d'un exercice existant ou créez-en un nouveau :

```json
{
  "text": "Regarde cet email. Est-il légitime ?",
  "imageUrl": "/assets/images/phishing_email_nouveau.png",
  "imageDescription": "Email professionnel suspect"
}
```

---

## 🌐 Sources d'Images

### **1. Création manuelle (Recommandé)**

- **Figma** : Créez des mockups d'emails
- **Canva** : Templates d'emails professionnels
- **Photoshop** : Montages personnalisés

### **2. Outils de simulation**

- **Gophish** (outil open-source pour simuler du phishing)
- **PhishMe** (plateforme de simulation)

### **3. Banques d'images libres (pour illustrations)**

- **Unsplash** (pour images génériques)
- **Pexels** (pour contexte)

---

## 📊 Gestion des Images

### **Convention de nommage :**

```
{categorie}_{description}_{numero}.{extension}

Exemples :
- phishing_email_microsoft.png
- fake_login_office365.png
- suspicious_link_amazon.png
- social_eng_badge_fake.png
```

### **Organisation par catégorie :**

```
public/assets/images/
├── phishing/
│   ├── email_microsoft.png
│   ├── email_paypal.png
│   └── email_dhl.png
├── fake_login/
│   ├── microsoft.png
│   └── office365.png
└── suspicious_link/
    └── amazon.png
```

---

## 🚀 Affichage dans le Frontend

Le composant `DailyExercise.tsx` gère automatiquement l'affichage :

```typescript
{message.imageUrl && (
  <div className="mt-3 p-2 bg-slate-100 rounded-lg border border-slate-200 shadow-inner">
    <img 
      src={message.imageUrl} 
      alt={message.imageDescription || "Exemple"} 
      className="max-w-full h-auto rounded" 
    />
    <p className="text-xs text-slate-500 mt-1">
      📸 {message.imageDescription || "Capture d'écran d'exemple"}
    </p>
  </div>
)}
```

---

## 🎓 Exemples de Cas d'Usage

### **1. Email de Phishing**

```json
{
  "text": "Tu reçois cet email un lundi matin :",
  "imageUrl": "/assets/images/phishing_email_microsoft.png",
  "imageDescription": "Email urgent de Microsoft avec faute d'orthographe"
}
```

### **2. Fausse Page de Connexion**

```json
{
  "text": "Cette page de connexion te semble-t-elle légitime ?",
  "imageUrl": "/assets/images/fake_login_office365.png",
  "imageDescription": "Page Office 365 avec URL suspecte"
}
```

### **3. Lien Suspect**

```json
{
  "text": "Voici l'URL que tu vois en survolant le bouton :",
  "imageUrl": "/assets/images/suspicious_url_amazon.png",
  "imageDescription": "URL avec amaz0n au lieu d'amazon"
}
```

---

## ✅ Checklist de Déploiement

- [ ] Images créées et optimisées (< 500 KB)
- [ ] Images copiées dans `public/assets/images/`
- [ ] (Optionnel) Métadonnées ajoutées dans `exercise_images`
- [ ] Références ajoutées dans les exercices (`payload_json`)
- [ ] Test d'affichage dans l'interface
- [ ] Images commitées sur Git

---

## 🆘 Dépannage

### **Image ne s'affiche pas**

1. Vérifiez le chemin : `/assets/images/nom_fichier.png`
2. Vérifiez que le fichier existe bien dans `public/assets/images/`
3. Vérifiez les permissions du fichier
4. Rechargez la page (Ctrl+F5)

### **Image trop lente à charger**

1. Vérifiez la taille du fichier (< 500 KB recommandé)
2. Optimisez avec TinyPNG
3. Convertissez en WebP pour de meilleures performances

---

**🎉 Avec ce système, le bot CyberSensei devient beaucoup plus visuel et pédagogique !**

