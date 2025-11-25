# 🏗️ CyberSensei Monorepo - Complete Structure

## 📋 Overview

This document provides a complete reference of the CyberSensei monorepo structure.

---

## 🗂️ Root Structure

```
cybersensei/
├── 📄 README.md                         # Main README
├── 📄 CONTRIBUTING.md                   # Contribution guidelines
├── 📄 CODEOWNERS                        # Code ownership
├── 📄 LICENSE                           # MIT License
├── 📄 SECURITY.md                       # Security policy
├── 📄 .gitignore                        # Git ignore rules
├── 📄 MONOREPO_STRUCTURE.md             # This file
│
├── 📁 .github/                          # GitHub configurations
│   ├── workflows/                       # CI/CD workflows
│   │   ├── ci.yml                       # Build and test
│   │   ├── docker-build.yml             # Docker images
│   │   ├── deploy-central.yml           # Deploy Central
│   │   └── deploy-node.yml              # Deploy Node
│   ├── ISSUE_TEMPLATE/                  # Issue templates
│   ├── PULL_REQUEST_TEMPLATE.md         # PR template
│   └── dependabot.yml                   # Dependabot config
│
├── 📁 docs/                             # Centralized documentation
│   ├── ARCHITECTURE.md                  # System architecture
│   ├── API.md                           # API reference
│   ├── DEPLOYMENT.md                    # Deployment guides
│   ├── DEVELOPMENT.md                   # Dev guidelines
│   ├── INTEGRATIONS.md                  # Integrations guide
│   └── diagrams/                        # Architecture diagrams
│
├── 📁 scripts/                          # Build and dev scripts
│   ├── setup-dev.sh                     # Dev environment setup
│   ├── build-all.sh                     # Build all projects
│   ├── test-all.sh                      # Test all projects
│   ├── deploy-central.sh                # Deploy Central
│   └── deploy-node.sh                   # Deploy Node
│
├── 📁 cybersensei-central/              # SaaS Platform
├── 📁 cybersensei-node/                 # On-Premise Solution
└── 📁 cybersensei-teams-app/            # Teams Extension
```

---

## 🌐 CyberSensei Central (SaaS Platform)

```
cybersensei-central/
├── 📄 README.md                         # Central overview
│
├── 📁 backend/                          # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── io/
│   │   │   │       └── cybersensei/
│   │   │   │           └── central/
│   │   │   │               ├── api/
│   │   │   │               │   ├── controller/
│   │   │   │               │   ├── dto/
│   │   │   │               │   └── mapper/
│   │   │   │               ├── config/
│   │   │   │               ├── domain/
│   │   │   │               │   ├── entity/
│   │   │   │               │   └── repository/
│   │   │   │               ├── security/
│   │   │   │               ├── service/
│   │   │   │               └── CentralApplication.java
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── application-prod.yml
│   │   │       └── db/
│   │   │           └── changelog/
│   │   └── test/
│   ├── pom.xml
│   ├── Dockerfile
│   ├── .dockerignore
│   └── README.md
│
├── 📁 dashboard/                        # React Dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Tenants/
│   │   │   ├── Content/
│   │   │   ├── Updates/
│   │   │   ├── Analytics/
│   │   │   └── Billing/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── README.md
│
├── 📁 infrastructure/                   # Monitoring
│   ├── prometheus/
│   │   └── prometheus.yml
│   ├── grafana/
│   │   └── dashboards/
│   ├── docker-compose.monitoring.yml
│   └── README.md
│
├── docker-compose.yml                   # Main compose
├── docker-compose.dev.yml               # Dev overrides
├── docker-compose.prod.yml              # Prod overrides
└── .env.example                         # Environment template
```

---

## 🏢 CyberSensei Node (On-Premise)

```
cybersensei-node/
├── 📄 README.md                         # Node overview
│
├── 📁 backend/                          # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── io/
│   │   │   │       └── cybersensei/
│   │   │   │           ├── api/
│   │   │   │           │   ├── controller/
│   │   │   │           │   ├── dto/
│   │   │   │           │   └── mapper/
│   │   │   │           ├── config/
│   │   │   │           ├── domain/
│   │   │   │           │   ├── entity/
│   │   │   │           │   └── repository/
│   │   │   │           ├── security/
│   │   │   │           ├── service/
│   │   │   │           └── CyberSenseiApplication.java
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── db/
│   │   │       │   └── changelog/
│   │   │       └── templates/          # Email templates
│   │   └── test/
│   ├── database/                        # Database configs
│   │   ├── init-scripts/
│   │   ├── seeds/
│   │   └── scripts/
│   ├── pom.xml
│   ├── Dockerfile
│   └── README.md
│
├── 📁 dashboard/                        # React Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   ├── EmployeeTab.tsx
│   │   │   └── ManagerTab.tsx
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── README.md
│
├── 📁 ai/                               # AI Service (Python)
│   ├── server.py                        # FastAPI server
│   ├── requirements.txt                 # Python dependencies
│   ├── run.sh                           # Startup script
│   ├── Dockerfile                       # Multi-stage build
│   ├── models/                          # AI models directory
│   │   └── .gitkeep
│   └── README.md
│
├── 📁 compose/                          # Docker Compose
│   ├── docker-compose.yml               # Main compose
│   ├── docker-compose.dev.yml           # Dev overrides
│   ├── docker-compose.prod.yml          # Prod overrides
│   ├── .env.example                     # Environment template
│   ├── Makefile                         # Helper commands
│   ├── README.md                        # Docker guide
│   ├── DEPLOYMENT.md                    # Deployment docs
│   └── TROUBLESHOOTING.md               # Troubleshooting
│
└── .env.example                         # Environment template
```

---

## 💬 CyberSensei Teams App

```
cybersensei-teams-app/
├── 📄 README.md                         # Teams app overview
│
├── 📁 tabs/                             # React Tabs
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── EmployeeTab.tsx
│   │   │   └── ManagerTab.tsx
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── README.md
│
├── 📁 bot/                              # Bot Framework Bot
│   ├── src/
│   │   ├── bot.ts                       # Main bot class
│   │   ├── dialogs/                     # Bot dialogs
│   │   ├── cards/                       # Adaptive cards
│   │   ├── services/                    # API services
│   │   └── index.ts                     # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── 📁 manifest/                         # Teams App Package
│   ├── manifest.json                    # App manifest
│   ├── color.png                        # Color icon (192x192)
│   ├── outline.png                      # Outline icon (32x32)
│   └── README.md
│
└── .env.example                         # Environment template
```

---

## 📁 Documentation (`/docs`)

```
docs/
├── ARCHITECTURE.md                      # System architecture
├── API.md                               # Complete API reference
├── DEPLOYMENT.md                        # Deployment guides
├── DEVELOPMENT.md                       # Development guidelines
├── SECURITY.md                          # Security best practices
├── INTEGRATIONS.md                      # Third-party integrations
├── MULTI_TENANCY.md                     # Multi-tenancy guide
│
├── diagrams/                            # Architecture diagrams
│   ├── system-overview.png
│   ├── data-flow.png
│   ├── deployment.png
│   └── security.png
│
└── api/                                 # API specs
    ├── central-api.yaml                 # OpenAPI Central
    └── node-api.yaml                    # OpenAPI Node
```

---

## 🔧 Scripts (`/scripts`)

```
scripts/
├── setup-dev.sh                         # Dev environment setup
├── build-all.sh                         # Build all projects
├── test-all.sh                          # Test all projects
├── lint-all.sh                          # Lint all projects
├── deploy-central.sh                    # Deploy Central
├── deploy-node.sh                       # Deploy Node
├── db-backup.sh                         # Database backup
└── db-restore.sh                        # Database restore
```

---

## 🔄 GitHub Workflows (`.github/workflows`)

```
.github/
├── workflows/
│   ├── ci.yml                           # Build and test all
│   ├── docker-build.yml                 # Build Docker images
│   ├── deploy-central.yml               # Deploy Central to Azure
│   ├── deploy-node.yml                  # Release Node package
│   ├── security-scan.yml                # Security scanning
│   └── codeql-analysis.yml              # CodeQL analysis
│
├── ISSUE_TEMPLATE/
│   ├── bug_report.md                    # Bug report template
│   ├── feature_request.md               # Feature request template
│   └── question.md                      # Question template
│
├── PULL_REQUEST_TEMPLATE.md             # PR template
└── dependabot.yml                       # Dependabot config
```

---

## 📦 Key Technologies

### Backend
- **Language**: Java 17
- **Framework**: Spring Boot 3.2
- **Database**: PostgreSQL 15
- **ORM**: Spring Data JPA
- **Migrations**: Liquibase
- **Security**: Spring Security + JWT
- **API Docs**: OpenAPI 3 (Swagger)
- **Testing**: JUnit 5, Testcontainers
- **Build**: Maven 3.8+

### Frontend
- **Language**: TypeScript 5
- **Framework**: React 18
- **Build**: Vite
- **Styling**: Tailwind CSS 3
- **State**: Context API, React Query
- **HTTP**: Axios
- **Charts**: Chart.js / Recharts
- **Testing**: Vitest, React Testing Library

### AI Service
- **Language**: Python 3.10+
- **Framework**: FastAPI
- **Model**: Mistral 7B Instruct (GGUF)
- **Runtime**: llama.cpp
- **Testing**: pytest

### Teams App
- **Tabs**: React 18 + TypeScript
- **Bot**: Bot Framework SDK v4
- **UI**: Fluent UI (@fluentui/react)
- **Cards**: Adaptive Cards

### Infrastructure
- **Containers**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana (optional)
- **Logging**: ELK Stack (optional)

---

## 📊 Repository Stats

### Lines of Code (Estimated)

| Project | Backend | Frontend | AI | Total |
|---------|---------|----------|----|-|
| **CyberSensei Central** | ~15,000 | ~8,000 | - | ~23,000 |
| **CyberSensei Node** | ~20,000 | ~10,000 | ~2,000 | ~32,000 |
| **Teams App** | ~3,000 | ~5,000 | - | ~8,000 |
| **Documentation** | - | - | - | ~5,000 |
| **Scripts & CI/CD** | - | - | - | ~2,000 |
| **TOTAL** | ~38,000 | ~23,000 | ~2,000 | **~70,000** |

### File Count (Estimated)

| Type | Count |
|------|-------|
| Java files | ~200 |
| TypeScript/JavaScript files | ~150 |
| Python files | ~10 |
| Configuration files | ~50 |
| Documentation files | ~30 |
| Test files | ~100 |
| **TOTAL** | **~540** |

---

## 🎯 Project Status

| Project | Status | Version |
|---------|--------|---------|
| **CyberSensei Central** | 🚧 In Development | 0.9.0 |
| **CyberSensei Node** | ✅ Production Ready | 1.0.0 |
| **Teams App** | 🚧 In Development | 0.8.0 |

---

## 📝 Naming Conventions

### Packages (Java)
```
io.cybersensei.{project}.{layer}
```
Examples:
- `io.cybersensei.central.api.controller`
- `io.cybersensei.node.service`

### Components (React)
```
PascalCase for components
camelCase for files
```
Examples:
- `EmployeeTab.tsx`
- `userService.ts`

### Docker Images
```
cybersensei/{project}-{component}:{tag}
```
Examples:
- `cybersensei/node-backend:1.0.0`
- `cybersensei/central-dashboard:latest`

---

## 🔒 Security

### Sensitive Files (Never Commit)
- `.env` files
- `*.pem`, `*.key`, `*.p12` (certificates/keys)
- `*.gguf` (AI models)
- Database dumps
- Credentials/secrets

### Protected Branches
- `main` - Production
- `develop` - Development

### Required Reviews
- All PRs require at least 1 approval
- Security-sensitive changes require security team review

---

## 📚 Additional Resources

- [Architecture Documentation](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)

---

**Version**: 1.0.0  
**Last Updated**: 2024-11-24  
**Maintained By**: CyberSensei Team

