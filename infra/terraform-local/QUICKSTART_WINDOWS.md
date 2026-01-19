# 🚀 Guide de Démarrage Rapide - Windows

## Prérequis

1. **Docker Desktop** installé et démarré
2. **Terraform** >= 1.5.0

```powershell
# Vérifier Docker
docker --version
docker info

# Installer Terraform (si pas installé)
winget install Hashicorp.Terraform
```

## Étapes de Déploiement

### 1️⃣ Configurer le fichier hosts (en tant qu'Administrateur)

```powershell
# Ouvrir PowerShell en tant qu'Administrateur
cd infra\terraform-local
.\scripts\setup-hosts.ps1
```

### 2️⃣ Construire les images Docker

```powershell
.\scripts\bootstrap.ps1
```

> ⚠️ Cette étape peut prendre 10-20 minutes la première fois.

### 3️⃣ Vérifier les prérequis

```powershell
.\scripts\verify-prerequisites.ps1
```

### 4️⃣ Déployer avec Terraform

```powershell
terraform init
terraform apply
```

Tapez `yes` quand demandé.

### 5️⃣ Accéder aux services

| Service | URL |
|---------|-----|
| Central Dashboard | http://central.local:8088 |
| Central API | http://api.central.local:8088 |
| Node Dashboard | http://node.local:8088 |
| Node API | http://api.node.local:8088 |
| Grafana | http://grafana.local:8088 |
| Prometheus | http://prometheus.local:8088 |
| Mailhog | http://mailhog.local:8088 |

## 🛑 Arrêter l'environnement

```powershell
terraform destroy
```

## 🔧 Dépannage

### Docker n'est pas démarré

```powershell
# Démarrer Docker Desktop depuis le menu Démarrer
# Ou via PowerShell :
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### Port 8088 déjà utilisé

```powershell
# Trouver ce qui utilise le port
netstat -ano | findstr :8088

# Utiliser un autre port
terraform apply -var="http_port=9000"
```

### Les hosts ne résolvent pas

1. Fermer et rouvrir le navigateur
2. Vider le cache DNS :
```powershell
ipconfig /flushdns
```

### Container en échec

```powershell
# Voir les logs
docker logs cybersensei-central-backend

# Voir tous les containers
docker ps -a

# Redémarrer un container
docker restart cybersensei-central-backend
```

## 📊 Commandes Utiles

```powershell
# Voir tous les containers CyberSensei
docker ps --filter "label=com.cybersensei.managed=terraform"

# Voir les logs en temps réel
docker logs -f cybersensei-node-backend

# Accéder à PostgreSQL Node
docker exec -it cybersensei-node-postgres psql -U cybersensei -d cybersensei

# Reconstruire une seule image
.\scripts\bootstrap.ps1 --node-backend

# Redéployer un seul container
terraform apply -replace="module.node[0].docker_container.backend"
```

