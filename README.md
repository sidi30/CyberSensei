# CyberSensei

> **Plateforme de Formation en Cybersecurite avec IA Adaptive**
> Concue pour les PME et Organismes Publics

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Demarrage Rapide

### Prerequis

- **Docker Desktop** 24.0+ : [Telecharger](https://www.docker.com/products/docker-desktop/)
- **16 GB RAM** minimum (pour l'IA)
- **20 GB disque** libre

### Lancement

```bash
# Copier la configuration
cp .env.template .env

# Demo (2 minutes, ~500 MB RAM)
docker compose --profile minimal up -d

# Developpement (5 minutes, ~2 GB RAM)
docker compose --profile node up -d

# Stack complet (10 minutes, ~8 GB RAM)
docker compose --profile full up -d

# Arreter
docker compose down
```

---

## Qu'est-ce que CyberSensei ?

**CyberSensei** forme vos equipes a la cybersecurite via :

- **Coach IA conversationnel** (Mistral 7B) dans Microsoft Teams
- **Simulations de phishing** realistes et securisees
- **Tableaux de bord managers** pour le suivi d'equipe
- **Deploiement on-premise** (souverainete des donnees)
- **Gamification** : badges, progression, niveaux
- **160+ exercices** adaptatifs par niveau

---

## Architecture

```
cybersensei/
├── docker-compose.unified.yml   # Configuration Docker unique
├── .env.template               # Configuration centralisee
│
├── cybersensei-node/            # Solution On-Premise
│   ├── backend/     (Spring Boot + Java 21)
│   ├── dashboard/   (React + TypeScript)
│   └── ai/          (Python + Mistral 7B)
│
├── cybersensei-central/         # Platform SaaS Multi-tenant
│   ├── backend/     (NestJS + TypeScript)
│   └── dashboard/   (React Admin Panel)
│
├── cybersensei-teams-app/       # Microsoft Teams Integration
│   ├── bot/         (Teams Bot Framework)
│   └── tabs/        (React Teams Tabs)
│
├── cybersensei-website/         # Site Marketing (Next.js)
└── infra/terraform-local/       # Infrastructure as Code
```

---

## Services & Ports

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| **Node Dashboard** | 3005 | http://localhost:3005 | Interface utilisateur |
| **Node API** | 8080 | http://localhost:8080 | API Spring Boot |
| **Central Dashboard** | 5173 | http://localhost:5173 | Admin SaaS |
| **Central API** | 3006 | http://localhost:3006 | API NestJS |
| **Teams Bot** | 5175 | http://localhost:5175 | Bot conversationnel |
| **Node AI** | 8000 | http://localhost:8000 | Service IA Mistral |
| **Website** | 3002 | http://localhost:3002 | Site marketing |
| **PostgreSQL** | 5432 | localhost:5432 | Base de donnees |
| **PgAdmin** | 5050 | http://localhost:5050 | Interface DB |

---

## Modes de Deploiement

| Profil | Commande | Services | RAM | Temps |
|--------|----------|----------|-----|-------|
| **minimal** | `docker compose --profile minimal up -d` | DB + Dashboard | ~500 MB | ~2 min |
| **node** | `docker compose --profile node up -d` | DB + Node Backend + Dashboard | ~2 GB | ~5 min |
| **central** | `docker compose --profile central up -d` | DB + Central Backend + Dashboard | ~2 GB | ~5 min |
| **full** | `docker compose --profile full up -d` | Tout (Node + Central + Teams + AI + Monitoring) | ~8 GB | ~10 min |

---

## Commandes Essentielles

```bash
# Demarrage
docker compose --profile node up -d

# Etat des services
docker compose ps

# Logs
docker compose logs -f node-backend

# Arret
docker compose down

# Reset complet (supprime les volumes)
docker compose down -v
```

---

## Securite

Le backend Java utilise des **Spring Profiles** pour la securite :

- **dev** (`SECURITY_BYPASS=true`): tous les endpoints sont publics (dev/demo)
- **prod** (`SECURITY_BYPASS=false`): JWT obligatoire, CORS restreint

Variables d'environnement a configurer en production :
- `JWT_SECRET` : cle secrete JWT (obligatoire, pas de defaut)
- `SECURITY_BYPASS=false` : desactive le mode bypass
- `DEV_MODE=false` : desactive le login dev
- `CORS_ORIGINS` : origines autorisees (comma-separated)

---

## Fonctionnalites

### Pour les Employes
- Coach IA dans Teams (5 min/jour)
- 160+ exercices adaptatifs (Debutant -> Avance)
- Simulations phishing realistes
- Gamification (badges, progression)

### Pour les Managers
- Dashboard suivi d'equipe
- Niveau de risque par employe
- Taux de reussite simulations
- Rapports exportables

### Pour les Admins IT
- Deploiement on-premise
- Souverainete des donnees
- Configuration SMTP personnalisee
- Monitoring integre (Prometheus + Grafana)

---

## Contribution

```bash
git checkout -b feature/ma-fonctionnalite
git commit -m "feat: nouvelle fonctionnalite"
git push origin feature/ma-fonctionnalite
```

---

## Licence

MIT License - Voir [LICENSE](LICENSE)

---

**CyberSensei Team** - Formation en cybersecurite
Contact : contact@cybersensei.fr
