# 🎯 Guide Rapide : Application du Seed SQL Complet

## 📍 Fichier à appliquer
**Chemin complet :**
```
C:\Users\ramzi\Desktop\devs\CyberSensei\cybersensei-node\backend\database\seed-complete-enterprise.sql
```

---

## ✅ Méthode Recommandée : pgAdmin

### Étape 1 : Ouvrir pgAdmin
- Lancez pgAdmin (généralement installé avec PostgreSQL)
- Connectez-vous à votre serveur PostgreSQL

### Étape 2 : Sélectionner la base de données
- Dans le panneau de gauche, déroulez `Servers` → `PostgreSQL`
- Cliquez sur `Databases` → `cybersensei_db`

### Étape 3 : Ouvrir l'outil de requête
- Clic droit sur `cybersensei_db`
- Sélectionnez `Query Tool` (Outil de requête)

### Étape 4 : Charger le fichier SQL
- Dans l'éditeur de requête, cliquez sur l'icône **Ouvrir un fichier** 📂
- Naviguez vers :
  ```
  C:\Users\ramzi\Desktop\devs\CyberSensei\cybersensei-node\backend\database\seed-complete-enterprise.sql
  ```
- Cliquez sur **Ouvrir**

### Étape 5 : Exécuter le script
- Cliquez sur le bouton **Exécuter** ▶️ (ou F5)
- Attendez quelques secondes (le script insère 20+ exercices)
- Vous devriez voir un message de succès en bas de l'écran

### Étape 6 : Vérifier
Exécutez cette requête pour vérifier :
```sql
SELECT topic, difficulty, COUNT(*) as nb_exercices 
FROM exercises 
GROUP BY topic, difficulty 
ORDER BY topic, difficulty;
```

Vous devriez voir une liste de secteurs avec leurs exercices !

---

## 🎨 Alternative : DBeaver (si installé)

1. Ouvrez DBeaver
2. Connectez-vous à votre base `cybersensei_db`
3. Cliquez sur `SQL Editor` → `Open SQL Script`
4. Sélectionnez le fichier `seed-complete-enterprise.sql`
5. Cliquez sur `Execute SQL Script` (Ctrl+X)
6. Vérifiez le résultat avec la requête ci-dessus

---

## 🚀 Après l'application

1. **Redémarrez le backend** (si nécessaire) :
   ```powershell
   cd cybersensei-node\backend
   java -jar target\cybersensei-node-backend-1.0.0.jar
   ```

2. **Rechargez l'interface Teams** (`http://localhost:5175`)

3. **Profitez du programme complet** ! Le bot va proposer des exercices sur les 15 secteurs 🎉

---

## ⚠️ Note Importante
Le script commence par `DELETE FROM exercises;` donc il va **remplacer** tous les exercices existants. Si vous avez des exercices personnalisés, faites une sauvegarde avant !

---

**Besoin d'aide ?** N'hésitez pas à demander ! 😊

