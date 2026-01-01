# 🚀 Instructions : Application du Seed Complet Entreprise

## 📋 Vue d'ensemble

Le fichier `seed-complete-enterprise.sql` contient un **programme complet de sensibilisation** couvrant **15 secteurs de cybersécurité** avec **3 niveaux de difficulté** (Débutant, Intermédiaire, Avancé).

---

## 🎯 Contenu du Seed

### Secteurs couverts :

**🟢 Niveau Débutant - Réflexes Essentiels :**
1. Phishing Emails
2. Liens Suspects & URLs
3. Mots de Passe & Protection
4. Faux Messages Internes
5. Réflexes de Sécurité de Base

**🟠 Niveau Intermédiaire - Mécanismes d'Attaque :**
6. Ingénierie Sociale
7. Pièces Jointes Malveillantes
8. Fausses Factures & Fraude
9. Usurpation d'Identité
10. Télétravail & Mobilité

**🔴 Niveau Avancé - Maturité & Autonomie :**
11. Attaques Ciblées (Spear Phishing)
12. Ransomware
13. Protection des Données
14. Shadow IT & Outils non Autorisés
15. Culture de Sécurité

### Caractéristiques :
- **20+ exercices** progressifs
- Format **conversationnel** avec intro pédagogique
- **Emojis** et **balises de couleur** pour l'engagement
- **Feedbacks personnalisés** (correct/incorrect)
- **Key takeaways** (règles à retenir)
- Contenu adapté aux **employés non techniques**

---

## 🛠️ Méthodes d'Application

### ✅ Option 1 : Ligne de Commande (psql) - **Recommandée si psql est installé**

1. Ouvrez un terminal (PowerShell ou CMD)
2. Naviguez vers le dossier racine du projet :
   ```powershell
   cd C:\Users\ramzi\Desktop\devs\CyberSensei
   ```
3. Exécutez le script SQL :
   ```powershell
   psql -U postgres -d cybersensei_db -f cybersensei-node\backend\database\seed-complete-enterprise.sql
   ```
4. Entrez le mot de passe de votre base de données quand demandé.

---

### ✅ Option 2 : Client SQL (pgAdmin, DBeaver, DataGrip)

1. **Ouvrez votre client SQL** (pgAdmin, DBeaver, DataGrip, etc.)
2. **Connectez-vous à votre base de données** :
   - Hôte : `localhost`
   - Port : `5432`
   - Base de données : `cybersensei_db`
   - Utilisateur : `postgres` (ou votre utilisateur)
   - Mot de passe : (celui configuré)
3. **Ouvrez le fichier SQL** :
   - Menu : `Fichier > Ouvrir un fichier SQL` (ou équivalent)
   - Chemin : `cybersensei-node\backend\database\seed-complete-enterprise.sql`
4. **Exécutez le script** :
   - Cliquez sur le bouton "Exécuter" ou "Run"
   - Confirmez l'exécution

---

## ⚠️ Important

- Le script commence par `DELETE FROM exercises;` pour nettoyer les anciennes données.
- **Assurez-vous d'avoir une sauvegarde** si vous avez des exercices personnalisés que vous souhaitez conserver.
- Le script peut prendre quelques secondes à s'exécuter (20+ insertions).

---

## ✅ Vérification

Après l'exécution, vérifiez que les données ont bien été insérées :

```sql
SELECT topic, difficulty, COUNT(*) as nb_exercices 
FROM exercises 
GROUP BY topic, difficulty 
ORDER BY topic, difficulty;
```

Vous devriez voir une liste de secteurs avec leurs niveaux de difficulté.

---

## 🎉 Étapes suivantes

1. **Redémarrez le backend** CyberSensei Node (si nécessaire)
2. **Rechargez l'interface Teams Employee** (`http://localhost:5175`)
3. **Profitez du programme complet** de sensibilisation conversationnelle !

Le bot CyberSensei va maintenant proposer des exercices variés et progressifs sur tous les secteurs de cybersécurité. 🚀

---

**Besoin d'aide ?** Contactez le service IT ou consultez les logs du backend en cas d'erreur.

