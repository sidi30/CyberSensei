# CyberSensei - Lancement Rapide

> **Comment tester le projet en 5 minutes**

## 1. **Prerequis (2 minutes)**

**Docker Desktop** doit etre installe et demarre  
Telecharger : https://www.docker.com/products/docker-desktop/

**C'est tout !**

---

## 2. **Lancement (1 commande)**

Ouvre PowerShell dans le dossier `CyberSensei` et tape :

### Demo rapide (Node Dashboard seul)
```powershell
.\cybersensei.ps1 start minimal
```

### Developpement Node complet
```powershell
.\cybersensei.ps1 start node
```

### Node + Microsoft Teams (Bot + Tabs)
```powershell
.\cybersensei.ps1 start teams
```

### Central SaaS (Administration multi-tenant)
```powershell
.\cybersensei.ps1 start central
```

### Stack Complet (tout)
```powershell
.\cybersensei.ps1 start full
```

---

## 3. **Attendre et Acceder**

Attente : ~5 minutes (telechargement + demarrage)

Quand c'est pret : Le script affiche les URLs

### Profil `minimal`
```
URLs disponibles :
  - Node Dashboard        http://localhost:3005
```

### Profil `node`
```
URLs disponibles :
  - Node Dashboard        http://localhost:3005
  - Node API              http://localhost:8080
  - Node Swagger          http://localhost:8080/swagger-ui.html
  - PgAdmin               http://localhost:5050
```

### Profil `teams` (Node + Microsoft Teams)
```
URLs disponibles :
  - Node Dashboard        http://localhost:3005
  - Node API              http://localhost:8080
  - Teams Bot             http://localhost:5175
  - Teams Tabs            http://localhost:5176
  - PgAdmin               http://localhost:5050
```

### Profil `central`
```
URLs disponibles :
  - Central Dashboard     http://localhost:5173
  - Central API           http://localhost:3006
  - PgAdmin               http://localhost:5050
```

### Profil `full` (tout)
```
URLs disponibles :
  - Node Dashboard        http://localhost:3005
  - Node API              http://localhost:8080
  - Central Dashboard     http://localhost:5173
  - Central API           http://localhost:3006
  - Teams Bot             http://localhost:5175
  - Teams Tabs            http://localhost:5176
  - Website               http://localhost:3002
  - Node AI               http://localhost:8000
  - Grafana               http://localhost:3300
  - Prometheus            http://localhost:9090
  - PgAdmin               http://localhost:5050
```

---

## 4. **Identifiants par defaut**

| Service | Utilisateur | Mot de passe |
|---------|-------------|--------------|
| PostgreSQL | cybersensei | cybersensei123 |
| PgAdmin | admin@cybersensei.io | admin123 |
| Grafana | admin | admin123 |

---

## 5. **Arreter le Projet**

```powershell
.\cybersensei.ps1 stop
```

---

## 6. **Aide et Depannage**

### Voir l'aide complete
```powershell
.\cybersensei.ps1 help
```

### Voir l'etat des services
```powershell
.\cybersensei.ps1 status
```

### Voir les logs
```powershell
.\cybersensei.ps1 logs -Follow
```

### Docker pas demarre ?
```
[x] Docker n'est pas installe ou demarre !
```
Solution : Demarrez Docker Desktop et relancez

### Port occupe ?
```
[!] Ports deja utilises: node-backend (8080)
```
Solution : Forcez le demarrage
```powershell
.\cybersensei.ps1 start node -Force
```

### Reset complet (perte de donnees)
```powershell
.\cybersensei.ps1 clean -Force
.\cybersensei.ps1 start node
```

---

## Resume Ultra-Simple

| Etape | Commande |
|-------|----------|
| 1. Installer Docker Desktop | https://docker.com |
| 2. Lancer | `.\cybersensei.ps1 start node` |
| 3. Attendre | ~5 minutes |
| 4. Tester | http://localhost:3005 |
| 5. Arreter | `.\cybersensei.ps1 stop` |

---

**C'est tout !**
