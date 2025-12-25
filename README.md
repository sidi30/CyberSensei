# 🛡️ CyberSensei

> **Enterprise Cybersecurity Training Platform with AI-Powered Adaptive Learning**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-contributor%20covenant-purple.svg)](CODE_OF_CONDUCT.md)

---

## 📋 Vue d'Ensemble

**CyberSensei** est une plateforme complète de formation en cybersécurité qui combine :

- 🧠 **IA Adaptive** (Mistral 7B) pour personnaliser l'apprentissage
- 🎣 **Simulations de Phishing** réalistes avec tracking
- 📊 **Tableaux de bord Manager** pour le suivi d'équipe
- 🏢 **Architecture SaaS + On-Premise** pour tous les besoins
- 💬 **Intégration Microsoft Teams** native

---

## 🏗️ Architecture du Monorepo

Ce monorepo contient **3 projets principaux** :

```
cybersensei/
├── 📁 cybersensei-central/       # SaaS Platform (Multi-tenant)
│   ├── backend/                  # Spring Boot 3 + PostgreSQL
│   ├── dashboard/                # React Admin Panel
│   └── infrastructure/           # Monitoring & Analytics
│
├── 📁 cybersensei-node/          # On-Premise Client Node
│   ├── backend/                  # Spring Boot 3 + PostgreSQL
│   ├── dashboard/                # React Dashboard
│   ├── ai/                       # Mistral 7B AI Service
│   └── compose/                  # Docker Compose configs
│
├── 📁 cybersensei-teams-app/     # Microsoft Teams Extension
│   ├── tabs/                     # Teams Tabs (React)
│   ├── bot/                      # Teams Bot (Bot Framework)
│   └── manifest/                 # Teams App Manifest
│
├── 📁 docs/                      # Documentation centralisée
├── 📁 .github/                   # CI/CD & GitHub configs
└── 📁 scripts/                   # Build & deployment scripts
```

---

## 🚀 Quick Start

### Prérequis

- **Docker Desktop** (inclut tout le nécessaire)
- **Windows PowerShell** (déjà installé sur Windows)

> **Note :** Pas besoin d'installer Java, Maven ou Node.js ! Tout est dans Docker.

### Installation Rapide Windows

```powershell
# Clone le repository
git clone https://github.com/your-org/cybersensei.git
cd cybersensei

# Démarrer CyberSensei (un seul script automatique !)
.\start-cybersensei.ps1

# Choisir 'n' pour démarrage rapide sans IA (5-10 min)
# Choisir 'o' pour démarrage complet avec IA (30-45 min)
```

**Accès :** http://localhost:3000  
**Login :** admin@cybersensei.io / Demo123!

📖 **Guide Complet :** [START_HERE_WINDOWS.md](./START_HERE_WINDOWS.md)

### Autres Options

```bash
# Option 1: Manuel depuis compose (Linux/Mac)
cd cybersensei-node/compose
docker-compose up -d

# Option 2: Développement local
./scripts/setup-dev.sh

# Option 3: Démarrer la plateforme SaaS centrale
cd cybersensei-central
docker-compose up -d
```

---

## 📦 Projets

### 1. 🌐 CyberSensei Central (SaaS Platform)

**Plateforme SaaS multi-tenant** pour gérer plusieurs organisations.

- **Backend**: Spring Boot 3, PostgreSQL, JWT, Multi-tenancy
- **Dashboard**: React 18, TypeScript, Tailwind CSS
- **Features**:
  - ✅ Gestion multi-tenant
  - ✅ Marketplace de contenu (exercises, templates)
  - ✅ Analytics centralisé
  - ✅ API pour nodes on-premise
  - ✅ Système de licensing

📖 [Documentation complète](./cybersensei-central/README.md)

---

### 2. 🏢 CyberSensei Node (On-Premise)

**Solution on-premise** pour les entreprises.

- **Backend**: Spring Boot 3, PostgreSQL, JWT
- **Dashboard**: React 18, TypeScript, Tailwind CSS
- **AI Service**: Mistral 7B Instruct (llama.cpp)
- **Features**:
  - ✅ Formation interactive avec AI
  - ✅ Campagnes de phishing
  - ✅ Métriques d'équipe
  - ✅ Sync avec Central (optionnel)
  - ✅ Déploiement Docker complet

📖 [Documentation complète](./cybersensei-node/README.md)

🐳 [Guide Docker](./cybersensei-node/compose/README.md)

---

### 3. 💬 CyberSensei Teams App

**Extension Microsoft Teams** pour formation intégrée.

- **Tabs**: React 18, Teams UI Kit
- **Bot**: Bot Framework, Node.js
- **Features**:
  - ✅ Tabs personnelles (Employee / Manager)
  - ✅ Bot conversationnel avec AI
  - ✅ Notifications de formation
  - ✅ SSO Microsoft 365
  - ✅ Quiz dans Teams

📖 [Documentation complète](./cybersensei-teams-app/README.md)

---

## 🛠️ Stack Technique

### Backend
- **Framework**: Spring Boot 3.2
- **Database**: PostgreSQL 15
- **Security**: Spring Security + JWT
- **ORM**: Spring Data JPA + Liquibase
- **API Doc**: OpenAPI 3 (Swagger)
- **Testing**: JUnit 5, Testcontainers

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State**: Context API
- **HTTP**: Axios
- **Charts**: Chart.js / Recharts
- **Build**: Vite

### AI
- **Model**: Mistral 7B Instruct (GGUF)
- **Runtime**: llama.cpp
- **API**: FastAPI (Python)

### Infrastructure
- **Containers**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana (optional)
- **Reverse Proxy**: Nginx

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Architecture](./docs/ARCHITECTURE.md) | Vue d'ensemble architecture |
| [API Reference](./docs/API.md) | Documentation API complète |
| [Deployment](./docs/DEPLOYMENT.md) | Guide de déploiement |
| [Development](./docs/DEVELOPMENT.md) | Guide développeur |
| [Security](./SECURITY.md) | Politique de sécurité |
| [Contributing](./CONTRIBUTING.md) | Guide de contribution |

---

## 🔐 Sécurité

Nous prenons la sécurité très au sérieux. Si vous découvrez une vulnérabilité, veuillez consulter notre [Politique de Sécurité](./SECURITY.md).

---

## 🤝 Contribution

Nous accueillons les contributions ! Veuillez lire notre [Guide de Contribution](./CONTRIBUTING.md) avant de soumettre une PR.

### Development Setup

```bash
# Setup environnement de développement
./scripts/setup-dev.sh

# Lancer les tests
./scripts/test-all.sh

# Build tous les projets
./scripts/build-all.sh
```

---

## 📝 License

Ce projet est sous licence **MIT**. Voir [LICENSE](./LICENSE) pour plus de détails.

---

## 🙏 Remerciements

- **Mistral AI** pour le modèle Mistral 7B
- **llama.cpp** pour le runtime efficace
- **Spring Boot** pour le framework backend
- **React** pour l'UI moderne
- **Microsoft Teams** pour l'intégration

---

## 📞 Support

- 📧 **Email**: support@cybersensei.io
- 💬 **Discord**: [CyberSensei Community](https://discord.gg/cybersensei)
- 📚 **Docs**: [docs.cybersensei.io](https://docs.cybersensei.io)
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-org/cybersensei/issues)

---

## 🗺️ Roadmap

### Q1 2025
- [ ] Support multilingue (FR, EN, ES, DE)
- [ ] Mobile app (React Native)
- [ ] Integration Slack
- [ ] Advanced analytics with ML

### Q2 2025
- [ ] Gamification complète
- [ ] Certification tracking
- [ ] Integration SCORM
- [ ] White-labeling

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=your-org/cybersensei&type=Date)](https://star-history.com/#your-org/cybersensei&Date)

---

<p align="center">
  Made with ❤️ by the CyberSensei Team
</p>

<p align="center">
  <a href="https://cybersensei.io">Website</a> •
  <a href="https://docs.cybersensei.io">Documentation</a> •
  <a href="https://twitter.com/cybersensei">Twitter</a> •
  <a href="https://linkedin.com/company/cybersensei">LinkedIn</a>
</p>

