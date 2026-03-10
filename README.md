# CyberSensei

> **Plateforme de Formation en Cybersecurite avec IA Adaptive & Protection DLP**
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

**CyberSensei** forme vos equipes a la cybersecurite et protege vos donnees sensibles via :

- **Coach IA conversationnel** (Mistral 7B) dans Microsoft Teams
- **Simulations de phishing** realistes et securisees
- **Tableaux de bord managers** pour le suivi d'equipe
- **Protection DLP temps reel** contre les fuites de donnees vers les outils IA (ChatGPT, Copilot, Gemini, Claude, Mistral)
- **Extension navigateur Chrome** avec analyse double couche et module de formation integre
- **Conformite RGPD Article 9** : detection des donnees sensibles (sante, opinions politiques, biometrie...)
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
├── cybersensei-ai-security/        # Module Securite IA & DLP (NOUVEAU)
│   ├── ai/          (Python FastAPI + Presidio + Mistral 7B)
│   ├── backend/     (Spring Boot + Java 21 + PostgreSQL)
│   └── extension/   (Extension Chrome Manifest V3)
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

## Module AI Security & DLP

Le module `cybersensei-ai-security/` fournit une **protection DLP (Data Loss Prevention)** contre les fuites de donnees vers les outils IA generatives.

### Architecture double couche

```
Extension Chrome → Backend Java (8081) → Service Python IA (8000)
                                              │
                                    ┌─────────┴─────────┐
                                    │                     │
                              Couche 1 (rapide)     Couche 2 (semantique)
                              Presidio + LLM Guard  Mistral 7B local
                              ~5-20ms               ~500ms (conditionnel)
                                    │                     │
                                    └─────────┬─────────┘
                                              │
                                    Score de risque (0-100)
                                    LOW / MEDIUM / HIGH
```

### Donnees detectees

| Categorie | Exemples |
|-----------|----------|
| **Donnees personnelles** | Noms, emails, telephones, adresses |
| **Identifiants francais** | NIR (Secu), IBAN, SIREN, SIRET, plaques, num. fiscal |
| **Donnees financieres** | Cartes bancaires, informations salariales |
| **Secrets techniques** | Cles API, tokens, mots de passe, code source |
| **Donnees medicales** | Informations de sante, dossiers patients |
| **RGPD Article 9** | Sante, opinions politiques, syndicales, orientation sexuelle, biometrie, casier judiciaire |

### Extension navigateur

- **Chrome Manifest V3**
- Surveille : ChatGPT, Copilot, Gemini, Claude, Mistral
- Alerte visuelle par code couleur (vert/jaune/rouge)
- Module de formation integre (quiz, glossaire, coach IA)
- Configuration par entreprise/utilisateur

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
| **AI Security Backend** | 8081 | http://localhost:8081 | API DLP Spring Boot |
| **AI Security Python** | 8000 | http://localhost:8000 | Service analyse DLP |
| **Website** | 3002 | http://localhost:3002 | Site marketing |
| **PostgreSQL** | 5432 | localhost:5432 | Base de donnees |
| **PgAdmin** | 5050 | http://localhost:5050 | Interface DB |
| **Prometheus** | 9090 | http://localhost:9090 | Monitoring |
| **Grafana** | 3300 | http://localhost:3300 | Dashboards monitoring |

---

## Modes de Deploiement

| Profil | Commande | Services | RAM | Temps |
|--------|----------|----------|-----|-------|
| **minimal** | `docker compose --profile minimal up -d` | DB + Dashboard | ~500 MB | ~2 min |
| **node** | `docker compose --profile node up -d` | DB + Node Backend + Dashboard + AI | ~2 GB | ~5 min |
| **central** | `docker compose --profile central up -d` | DB + Central Backend + Dashboard | ~2 GB | ~5 min |
| **ai-security** | `docker compose --profile ai-security up -d` | DB + AI Security Backend + Python AI | ~2 GB | ~5 min |
| **full** | `docker compose --profile full up -d` | Tout (Node + Central + Teams + AI Security + Monitoring) | ~8 GB | ~10 min |

---

## Commandes Essentielles

```bash
# Demarrage
docker compose --profile node up -d

# Demarrage module AI Security
docker compose --profile ai-security up -d

# Etat des services
docker compose ps

# Logs
docker compose logs -f node-backend
docker compose logs -f ai-security-backend

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
- Module de formation dans l'extension navigateur

### Pour les Managers
- Dashboard suivi d'equipe
- Niveau de risque par employe
- Taux de reussite simulations
- Rapports exportables
- Alertes DLP et statistiques d'usage des outils IA

### Pour les Admins IT
- Deploiement on-premise
- Souverainete des donnees
- Configuration SMTP personnalisee
- Monitoring integre (Prometheus + Grafana)
- Extension navigateur DLP deployable par GPO
- Conformite RGPD avec journalisation d'audit
- Politiques de retention des donnees configurables

### Pour les RSSI / DPO
- Protection DLP contre les fuites de donnees vers les IA generatives
- Detection RGPD Article 9 (donnees de sante, biometrie, opinions...)
- Journal d'audit complet des evenements DLP
- Score de risque par entreprise et par utilisateur
- Alertes temps reel sur les donnees sensibles detectees
- Validation via API gouvernementales (SIREN, adresses)

---

## Stack Technique

| Composant | Technologies |
|-----------|-------------|
| **Node Backend** | Java 21, Spring Boot 3.4, PostgreSQL, JWT |
| **Central Backend** | NestJS 11, TypeScript, PostgreSQL, MongoDB |
| **AI Security Backend** | Java 21, Spring Boot 3.4, PostgreSQL, Liquibase |
| **AI Service** | Python 3.11+, FastAPI, Presidio, LLM Guard, Mistral 7B |
| **Extension** | Chrome Manifest V3, JavaScript |
| **Dashboard** | React, TypeScript, Tailwind CSS |
| **Website** | Next.js 14, Tailwind CSS, Framer Motion |
| **Teams App** | Teams Bot Framework, React |
| **Infrastructure** | Docker, Terraform, Prometheus, Grafana |

---

## Tests

```bash
# Tests unitaires backend Java (AI Security)
cd cybersensei-ai-security/backend && mvn test

# Tests Python (AI Service)
cd cybersensei-ai-security/ai && pytest

# Tests Central backend
cd cybersensei-central/backend && npm test
```

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

**CyberSensei Team** - Formation en cybersecurite & Protection DLP
Contact : contact@cybersensei.fr
