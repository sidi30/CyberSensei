# 🚀 Guide Rapide : Application des Seeds (Méthode Simple)

## 📍 Problème
Les commandes `psql` en ligne de commande demandent le mot de passe de manière interactive, ce qui bloque l'exécution automatique.

## ✅ Solution Recommandée : pgAdmin (5 minutes)

### **Étape 1 : Ouvrir pgAdmin**
- Lancez **pgAdmin** (installé avec PostgreSQL)
- Connectez-vous à votre serveur PostgreSQL (entrez le mot de passe si demandé)

### **Étape 2 : Sélectionner la base**
- Dans le panneau de gauche : `Servers` → `PostgreSQL 17` → `Databases` → `cybersensei_db`
- Clic droit sur `cybersensei_db` → `Query Tool`

### **Étape 3 : Appliquer les seeds (un par un)**

Vous avez **15 fichiers à exécuter** dans l'ordre (c'est rapide, chacun prend 1-2 secondes) :

#### **Pour chaque fichier :**
1. Cliquez sur l'icône **📂 Ouvrir**
2. Naviguez vers : 
   ```
   C:\Users\ramzi\Desktop\devs\CyberSensei\cybersensei-node\backend\database\seeds\themes\
   ```
3. Sélectionnez le fichier (voir liste ci-dessous)
4. Cliquez sur **▶️ Exécuter** (ou F5)
5. Attendez le message de succès en bas
6. Passez au fichier suivant

#### **Liste des 15 fichiers à exécuter :**

**🟢 Niveau Débutant :**
1. ✅ `seed-phishing-emails.sql` (10 exercices)
2. ✅ `seed-liens-suspects.sql` (10 exercices)
3. ✅ `seed-mots-de-passe.sql` (12 exercices)
4. ✅ `seed-faux-messages-internes.sql` (10 exercices)
5. ✅ `seed-reflexes-securite-base.sql` (10 exercices)

**🟠 Niveau Intermédiaire :**
6. ✅ `seed-ingenierie-sociale.sql` (12 exercices)
7. ✅ `seed-pieces-jointes-malveillantes.sql` (10 exercices)
8. ✅ `seed-fausse-facture-fraude.sql` (10 exercices)
9. ✅ `seed-usurpation-identite.sql` (10 exercices)
10. ✅ `seed-teletravail-mobilite.sql` (10 exercices)

**🔴 Niveau Avancé :**
11. ✅ `seed-attaques-ciblees.sql` (12 exercices)
12. ✅ `seed-ransomware.sql` (10 exercices)
13. ✅ `seed-protection-donnees.sql` (10 exercices)
14. ✅ `seed-shadow-it.sql` (10 exercices)
15. ✅ `seed-culture-securite.sql` (12 exercices)

**Total : ~160 exercices ! 🎉**

---

### **Étape 4 : Vérification**

Après avoir exécuté tous les fichiers, vérifiez le résultat :

```sql
SELECT topic, COUNT(*) as nb_exercices 
FROM exercises 
GROUP BY topic 
ORDER BY topic;
```

Vous devriez voir 15 lignes avec ≈10 exercices par thème.

---

## 🚀 Étape 5 : Lancer l'application

### **Backend (si pas déjà lancé) :**

Terminal 1 :
```bash
cd C:\Users\ramzi\Desktop\devs\CyberSensei\cybersensei-node\backend
java -jar target\cybersensei-node-backend-1.0.0.jar
```

### **Frontend Teams :**

Terminal 2 :
```bash
cd C:\Users\ramzi\Desktop\devs\CyberSensei\cybersensei-teams-app\tabs\employee
npm run dev
```

Puis ouvrez : **http://localhost:5175**

---

## 🎊 Résultat attendu

L'interface conversationnelle va afficher :
- ✅ Un des 160 exercices au hasard
- ✅ Tooltips sur les termes techniques (survol du terme)
- ✅ Progression facile → difficile dans chaque thème
- ✅ Choix "Continuer" ou "Reprendre demain" en fin de session
- ✅ Personnalité "ami coach" du bot

---

## ⚡ Alternative : Script Batch (Windows)

Si vous voulez quand même essayer en ligne de commande :

1. Ouvrez un terminal dans : 
   ```
   C:\Users\ramzi\Desktop\devs\CyberSensei\cybersensei-node\backend\database\seeds\
   ```

2. Lancez :
   ```bash
   apply-all-seeds.bat
   ```

3. Entrez le mot de passe PostgreSQL à chaque fois (vous devrez le taper 15 fois)

**⚠️ Mais pgAdmin est beaucoup plus simple !**

---

## 🆘 Problèmes ?

### Les exercices ne s'affichent pas ?
- Vérifiez que le backend est bien lancé
- Rechargez la page (Ctrl+F5)
- Vérifiez dans pgAdmin que la table `exercises` contient bien des données

### Message "Aucun exercice disponible" ?
- Les seeds n'ont pas été appliqués
- Refaites l'étape 3

---

**C'est parti ! 🚀 Tu vas avoir plus de 160 exercices de cybersécurité conversationnels !**



