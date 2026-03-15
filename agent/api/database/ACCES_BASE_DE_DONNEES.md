# 🔐 Accès à la Base de Données PostgreSQL - CyberSensei

## 📊 Identifiants de Connexion

### **Option 1 : Via Docker (Recommandé)**

Si vous utilisez Docker :

```yaml
Base de données : cybersensei
Utilisateur      : cybersensei
Mot de passe     : cybersensei123
Host            : localhost
Port            : 5432
```

### **Option 2 : PostgreSQL Local (Installation manuelle)**

Si vous avez installé PostgreSQL directement sur Windows :

```yaml
Base de données : cybersensei_db
Utilisateur      : postgres
Mot de passe     : [Le mot de passe que vous avez défini lors de l'installation]
Host            : localhost
Port            : 5432
```

**⚠️ IMPORTANT :** Le mot de passe de l'utilisateur `postgres` est celui que **vous avez défini lors de l'installation de PostgreSQL**.

---

## 🔍 Où Trouver les Identifiants ?

### **1. Docker Compose**
📁 `docker-compose-db.yml` (lignes 12-14)
```yaml
POSTGRES_DB: cybersensei
POSTGRES_USER: cybersensei
POSTGRES_PASSWORD: cybersensei123
```

### **2. Application Backend**
📁 `backend/src/main/resources/application.yml` (lignes 6-8)
```yaml
url: jdbc:postgresql://localhost:5432/cybersensei
username: cybersensei
password: cybersensei123
```

### **3. PgAdmin (Interface Web)**
Si vous utilisez Docker, PgAdmin est accessible sur `http://localhost:5050` :
```yaml
Email        : admin@cybersensei.io
Mot de passe : admin123
```

---

## 🐛 Problème : Les .bat Demandent un Mot de Passe

**Les fichiers .bat actuels sont configurés pour :**
- Utilisateur : `postgres`
- Base de données : `cybersensei_db`

**Mais Docker utilise :**
- Utilisateur : `cybersensei`
- Base de données : `cybersensei`

### **Solution 1 : Utiliser Docker (Plus Simple)**

1. **Démarrer PostgreSQL avec Docker :**
```bash
cd cybersensei-node/backend/database
docker-compose -f docker-compose-db.yml up -d
```

2. **Utiliser les .bat modifiés :**
Les nouveaux .bat (voir ci-dessous) utilisent les bons identifiants.

---

### **Solution 2 : Utiliser PostgreSQL Local**

Si vous préférez PostgreSQL installé localement :

**Étape 1 : Créer la base de données**
```bash
# Ouvrir psql (demande le mot de passe postgres)
psql -U postgres

# Dans psql, créer la base :
CREATE DATABASE cybersensei_db;

# Quitter psql
\q
```

**Étape 2 : Utiliser les .bat**
Les .bat vont vous demander le mot de passe à chaque fois.

---

## 🔧 Fichiers .bat Corrigés

### **Version Docker (cybersensei/cybersensei123)**

Utilise les identifiants Docker :

```batch
SET PGUSER=cybersensei
SET PGPASSWORD=cybersensei123
SET PGDB=cybersensei
```

### **Version PostgreSQL Local (postgres/votre_mot_de_passe)**

Utilise l'utilisateur postgres (demande mot de passe) :

```batch
SET PGUSER=postgres
SET PGDB=cybersensei_db
REM Le mot de passe sera demandé à chaque exécution
```

---

## 📝 Variables d'Environnement (Optionnel)

Pour éviter de taper le mot de passe à chaque fois, créez un fichier `.pgpass` :

**Windows :** `%APPDATA%\postgresql\pgpass.conf`
```
localhost:5432:cybersensei_db:postgres:VOTRE_MOT_DE_PASSE
localhost:5432:cybersensei:cybersensei:cybersensei123
```

**Linux/Mac :** `~/.pgpass`
```
localhost:5432:cybersensei_db:postgres:VOTRE_MOT_DE_PASSE
localhost:5432:cybersensei:cybersensei:cybersensei123
```

**Permissions (Linux/Mac uniquement) :**
```bash
chmod 600 ~/.pgpass
```

---

## 🧪 Tester la Connexion

### **Via psql**

**Docker :**
```bash
psql -h localhost -U cybersensei -d cybersensei
# Mot de passe : cybersensei123
```

**PostgreSQL Local :**
```bash
psql -U postgres -d cybersensei_db
# Mot de passe : votre_mot_de_passe
```

### **Via PgAdmin**

1. Ouvrir `http://localhost:5050`
2. Email : `admin@cybersensei.io`
3. Mot de passe : `admin123`
4. Ajouter un serveur :
   - Name : CyberSensei
   - Host : postgres (si Docker) ou localhost (si local)
   - Port : 5432
   - Username : cybersensei (Docker) ou postgres (Local)
   - Password : cybersensei123 (Docker) ou votre_mot_de_passe (Local)

---

## 📊 Résumé Visuel

| Configuration | Base de Données | Utilisateur | Mot de Passe | Où ? |
|---------------|-----------------|-------------|--------------|------|
| **Docker** | `cybersensei` | `cybersensei` | `cybersensei123` | docker-compose-db.yml |
| **PostgreSQL Local** | `cybersensei_db` | `postgres` | *Votre mot de passe* | Installation PostgreSQL |
| **Backend Java** | `cybersensei` | `cybersensei` | `cybersensei123` | application.yml |
| **PgAdmin Web** | - | `admin@cybersensei.io` | `admin123` | Interface web :5050 |

---

## 🚀 Méthode Recommandée : Docker

**Avantages :**
- ✅ Pas besoin d'installer PostgreSQL
- ✅ Mot de passe déjà configuré
- ✅ Base de données isolée
- ✅ PgAdmin inclus
- ✅ Facile à réinitialiser

**Commandes :**
```bash
# Démarrer
docker-compose -f docker-compose-db.yml up -d

# Arrêter
docker-compose -f docker-compose-db.yml down

# Réinitialiser complètement
docker-compose -f docker-compose-db.yml down -v
docker-compose -f docker-compose-db.yml up -d
```

---

## ❓ FAQ

### **Q : Je ne me souviens plus de mon mot de passe PostgreSQL local**

**R :** Vous devez le réinitialiser :

1. Trouver le fichier `pg_hba.conf` (généralement dans `C:\Program Files\PostgreSQL\17\data\`)
2. Changer `md5` en `trust` pour l'utilisateur postgres
3. Redémarrer PostgreSQL
4. Se connecter sans mot de passe et le changer :
```sql
ALTER USER postgres PASSWORD 'nouveau_mot_de_passe';
```
5. Remettre `trust` en `md5` dans `pg_hba.conf`
6. Redémarrer PostgreSQL

### **Q : Les .bat ne trouvent pas psql.exe**

**R :** Modifiez le chemin dans les .bat :
```batch
SET PGPATH="C:\Program Files\PostgreSQL\17\bin\psql.exe"
```

Changez `17` par votre version (15, 16, etc.)

### **Q : Quelle méthode utiliser ?**

**R :** 
- **Pour le développement** : Docker (plus simple)
- **Pour la production** : PostgreSQL dédié

---

## 🔑 Mot de Passe par Défaut

**Si vous ne savez pas quel mot de passe utiliser :**

1. **Avec Docker** : `cybersensei123`
2. **PostgreSQL Local** : Le mot de passe que vous avez défini lors de l'installation de PostgreSQL
3. **Si vous ne l'avez jamais défini** : Suivez la procédure de réinitialisation ci-dessus

---

**📧 Besoin d'aide ?**

Consultez les logs Docker :
```bash
docker logs cybersensei-postgres
```

Ou vérifiez que PostgreSQL est démarré :
```bash
docker ps
```

