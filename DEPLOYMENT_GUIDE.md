# CyberSensei - Guide de Deploiement Unifie

> **Version 2.1** - Architecture standardisee avec Teams integre

## Demarrage Rapide (5 profils)

### **PowerShell (Windows)**
```powershell
# Demo rapide (2 min)
.\cybersensei.ps1 start minimal

# Developpement Node complet
.\cybersensei.ps1 start node

# Node + Microsoft Teams (Bot + Tabs)
.\cybersensei.ps1 start teams

# Central SaaS (Administration)
.\cybersensei.ps1 start central

# Stack Complet (tout)
.\cybersensei.ps1 start full
```

### **Make (Linux/Mac)**
```bash
make start-minimal
make start-node
make start-teams
make start-central
make start-full
```

### **Docker Compose Direct**
```bash
# Node
docker compose -f docker-compose.unified.yml --profile node up -d

# Teams (Node + Teams)
docker compose -f docker-compose.unified.yml --profile node --profile teams up -d

# Central
docker compose -f docker-compose.unified.yml --profile central up -d

# Full
docker compose -f docker-compose.unified.yml --profile full up -d
```

---

## Architecture et Ports

### **Ports Standardises**

| Service | Port | Description |
|---------|------|-------------|
| **PostgreSQL** | 5432 | Base de donnees principale |
| **PgAdmin** | 5050 | Interface admin PostgreSQL |
| **Node Backend** | 8080 | API Spring Boot |
| **Node Dashboard** | 3000 | Interface utilisateur Node |
| **Central Backend** | 3001 | API NestJS |
| **Central Dashboard** | 5173 | Interface admin Central |
| **Node AI** | 8000 | Service IA Mistral |
| **Teams Bot** | 5175 | Bot conversationnel Teams |
| **Teams Tabs** | 5176 | Onglets Teams (Employee/Manager) |
| **Website** | 3002 | Site marketing |
| **Grafana** | 3300 | Monitoring |
| **Prometheus** | 9090 | Metriques |

---

## Profils de Deploiement

### **minimal** - Demo Rapide
- PostgreSQL + Node Dashboard
- **Temps** : ~2 minutes
- **RAM** : ~500 MB
- **Usage** : Demonstration, tests UI

```powershell
.\cybersensei.ps1 start minimal
```
**URLs** :
- Node Dashboard : http://localhost:3000

---

### **node** - Developpement
- PostgreSQL + Node Backend + Node Dashboard + PgAdmin
- **Temps** : ~5 minutes
- **RAM** : ~2 GB
- **Usage** : Developpement, tests API

```powershell
.\cybersensei.ps1 start node
```
**URLs** :
- Node Dashboard : http://localhost:3000
- Node API : http://localhost:8080
- Swagger : http://localhost:8080/swagger-ui.html
- PgAdmin : http://localhost:5050

---

### **teams** - Integration Microsoft Teams
- PostgreSQL + Node Backend + Node Dashboard + Teams Bot + Teams Tabs + PgAdmin
- **Temps** : ~5 minutes
- **RAM** : ~2.5 GB
- **Usage** : Developpement Teams, tests d'integration

```powershell
.\cybersensei.ps1 start teams
```
**URLs** :
- Node Dashboard : http://localhost:3000
- Node API : http://localhost:8080
- Teams Bot : http://localhost:5175
- Teams Tabs : http://localhost:5176
- PgAdmin : http://localhost:5050

**Configuration Teams requise** (dans `.env`) :
```env
TEAMS_BOT_ID=<votre-bot-id>
TEAMS_BOT_PASSWORD=<votre-bot-password>
TEAMS_APP_ID=<votre-app-id>
TEAMS_APP_PASSWORD=<votre-app-password>
TEAMS_APP_TENANT_ID=<votre-tenant-id>
```

---

### **central** - SaaS Administration
- PostgreSQL + MongoDB + Central Backend + Central Dashboard + PgAdmin
- **Temps** : ~5 minutes
- **RAM** : ~2 GB
- **Usage** : Administration multi-tenant

```powershell
.\cybersensei.ps1 start central
```
**URLs** :
- Central Dashboard : http://localhost:5173
- Central API : http://localhost:3001
- PgAdmin : http://localhost:5050

---

### **full** - Stack Complet
- Tous les services (Node + Central + Teams + AI + Monitoring)
- **Temps** : ~10 minutes
- **RAM** : ~8 GB
- **Usage** : Tests d'integration, production-like

```powershell
.\cybersensei.ps1 start full
```
**URLs** :
- Node Dashboard : http://localhost:3000
- Node API : http://localhost:8080
- Central Dashboard : http://localhost:5173
- Central API : http://localhost:3001
- Teams Bot : http://localhost:5175
- Teams Tabs : http://localhost:5176
- Website : http://localhost:3002
- Node AI : http://localhost:8000
- Grafana : http://localhost:3300
- Prometheus : http://localhost:9090
- PgAdmin : http://localhost:5050

---

## Identifiants par Defaut

| Service | Utilisateur | Mot de passe |
|---------|-------------|--------------|
| PostgreSQL | cybersensei | cybersensei123 |
| MongoDB | cybersensei | cybersensei123 |
| PgAdmin | admin@cybersensei.io | admin123 |
| Grafana | admin | admin123 |

---

## Commandes de Reference

### **PowerShell**
```powershell
.\cybersensei.ps1 help                    # Aide complete
.\cybersensei.ps1 start [profile]         # Demarrer un profil
.\cybersensei.ps1 status                  # Etat des services
.\cybersensei.ps1 logs [-Follow]          # Voir les logs
.\cybersensei.ps1 stop                    # Arreter tout
.\cybersensei.ps1 clean [-Force]          # Nettoyer (ATTENTION: perte de donnees)
```

### **Options**
```powershell
-Build    # Force la reconstruction des images
-Force    # Force l'action sans confirmation
-Follow   # Suit les logs en continu
```

---

## Configuration Initiale

### 1. Prerequis
```powershell
docker --version   # Docker Desktop requis
```

### 2. Configuration (optionnel)
```powershell
# Copier le template
cp .env.template .env

# Modifier si necessaire
notepad .env
```

### 3. Premier demarrage
```powershell
.\cybersensei.ps1 start node
```

---

## Resolution de Problemes

### Port deja utilise
```powershell
# Verifier qui utilise le port
netstat -ano | findstr :8080

# Forcer le demarrage
.\cybersensei.ps1 start node -Force
```

### Docker non demarre
```powershell
# Le script verifie automatiquement et affiche l'erreur
.\cybersensei.ps1 start minimal
```

### Reinitialisation complete
```powershell
# Arreter et nettoyer tout
.\cybersensei.ps1 clean -Force

# Redemarrer proprement
.\cybersensei.ps1 start node
```

### Probleme de build
```powershell
# Forcer la reconstruction des images
.\cybersensei.ps1 start node -Build
```

---

## Terraform (Infrastructure Avancee)

Pour un deploiement infrastructure-as-code :

```bash
cd infra/terraform-local
terraform init
terraform plan
terraform apply
```

---

## Changelog v2.1

- Ajout du profil `teams` (Node + Microsoft Teams)
- Documentation clarifiee pour chaque profil
- Ports standardises sans conflits
- Script PowerShell ameliore
- Combinaison automatique des profils Docker Compose

---

**CyberSensei est pret pour le deploiement !**
