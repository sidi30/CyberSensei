# 🔑 Accès Rapides - Base de Données CyberSensei

## 📊 Identifiants par Défaut (Docker)

```
Base de données : cybersensei
Utilisateur     : cybersensei
Mot de passe    : cybersensei123
Host           : localhost
Port           : 5432
```

---

## 🚀 Démarrer PostgreSQL (Docker)

```bash
cd cybersensei-node/backend/database
docker-compose -f docker-compose-db.yml up -d
```

---

## 🔧 Utiliser les Scripts .bat

Les scripts .bat utilisent maintenant **automatiquement** les identifiants Docker.

**Aucun mot de passe ne vous sera demandé !**

### **1. Appliquer la migration progression**
```bash
cd cybersensei-node/backend/database
.\apply-migration-progression.bat
```

### **2. Appliquer les seeds (15 thèmes)**
```bash
cd seeds
.\apply-all-seeds.bat
```

### **3. Appliquer la migration badges à 80%**
```bash
cd cybersensei-node/backend/database
.\apply-badges-80-percent.bat
```

---

## 🌐 PgAdmin (Interface Web)

**URL :** http://localhost:5050

```
Email        : admin@cybersensei.io
Mot de passe : admin123
```

### **Ajouter le serveur dans PgAdmin :**
1. Clic droit sur "Servers" → "Register" → "Server"
2. **General tab :**
   - Name : `CyberSensei`
3. **Connection tab :**
   - Host : `postgres` (si Docker) ou `localhost` (si local)
   - Port : `5432`
   - Username : `cybersensei`
   - Password : `cybersensei123`
   - ✅ Cocher "Save password"
4. Cliquer sur "Save"

---

## 💻 Connexion via psql

```bash
# Avec mot de passe inline (Docker)
SET PGPASSWORD=cybersensei123
psql -h localhost -U cybersensei -d cybersensei

# Ou directement (le mot de passe sera demandé)
psql -h localhost -U cybersensei -d cybersensei
# Mot de passe : cybersensei123
```

---

## ⚙️ Si Vous Utilisez PostgreSQL Local

**Modifiez les .bat :**

Ouvrez chaque fichier .bat et **décommentez** ces lignes :
```batch
REM SET PGUSER=postgres
REM SET PGDB=cybersensei_db
```

Et **commentez** cette ligne :
```batch
REM SET PGPASSWORD=cybersensei123
```

**Résultat :**
```batch
SET PGUSER=postgres
SET PGDB=cybersensei_db
REM SET PGPASSWORD=cybersensei123
```

Le mot de passe vous sera alors demandé à chaque exécution.

---

## 🔄 Commandes Docker Utiles

```bash
# Voir les logs PostgreSQL
docker logs cybersensei-postgres

# Arrêter PostgreSQL
docker-compose -f docker-compose-db.yml down

# Redémarrer PostgreSQL
docker-compose -f docker-compose-db.yml restart

# Supprimer complètement (ATTENTION : efface toutes les données !)
docker-compose -f docker-compose-db.yml down -v

# Voir si PostgreSQL est actif
docker ps | findstr postgres
```

---

## ✅ Test Rapide

```bash
# 1. Démarrer Docker
docker-compose -f docker-compose-db.yml up -d

# 2. Attendre 10 secondes (le temps que PostgreSQL démarre)

# 3. Tester la connexion
SET PGPASSWORD=cybersensei123
psql -h localhost -U cybersensei -d cybersensei -c "SELECT 1;"

# Si ça affiche "1", c'est bon ! ✅
```

---

## 📝 Fichiers de Configuration

| Fichier | Contient |
|---------|----------|
| `docker-compose-db.yml` | Identifiants Docker |
| `backend/src/main/resources/application.yml` | Config backend Java |
| `*.bat` | Scripts d'application des migrations |

---

## 🆘 Problèmes Fréquents

### **"psql: error: connection to server at "localhost""**
→ PostgreSQL n'est pas démarré. Lancez Docker :
```bash
docker-compose -f docker-compose-db.yml up -d
```

### **"psql: error: FATAL: password authentication failed"**
→ Mauvais mot de passe. Utilisez : `cybersensei123`

### **"command not found: psql"**
→ psql n'est pas installé ou pas dans le PATH.
Solution : Utilisez PgAdmin (http://localhost:5050)

### **"psql.exe introuvable"**
→ Modifiez le chemin dans les .bat :
```batch
SET PGPATH="C:\Program Files\PostgreSQL\15\bin\psql.exe"
```
(Changez `17` par votre version)

---

## 📚 Documentation Complète

Pour plus de détails, consultez :
- **`ACCES_BASE_DE_DONNEES.md`** - Guide complet avec toutes les options

---

**✅ Par défaut, tout fonctionne avec Docker et les identifiants sont déjà configurés !**

