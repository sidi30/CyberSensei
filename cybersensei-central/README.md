# 🌐 CyberSensei Central - SaaS Platform

> **Multi-tenant SaaS platform for managing CyberSensei deployments**

---

## 📋 Overview

**CyberSensei Central** is the SaaS control plane that provides:

- 🏢 **Multi-tenant management** for organizations
- 📦 **Content marketplace** (exercises, phishing templates)
- 📊 **Centralized analytics** across all nodes
- 🔄 **Update distribution** to on-premise nodes
- 📈 **Telemetry collection** and insights
- 🔐 **License management** and billing

---

## 🏗️ Architecture

```
cybersensei-central/
├── backend/              # Spring Boot 3 Backend
│   ├── src/
│   ├── pom.xml
│   └── README.md
│
├── dashboard/            # React Admin Dashboard
│   ├── src/
│   ├── package.json
│   └── README.md
│
└── infrastructure/       # Monitoring & Observability
    ├── prometheus/
    ├── grafana/
    └── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Java** 17+
- **Node.js** 18+
- **PostgreSQL** 15+
- **Docker** 20.10+ (optional)

### Installation

```bash
# Clone repository
cd cybersensei-central

# Setup environment
cp .env.example .env

# Start with Docker Compose (recommended)
docker-compose up -d

# Or run manually:

# 1. Start PostgreSQL
docker-compose up -d postgres

# 2. Backend
cd backend
mvn spring-boot:run

# 3. Dashboard
cd ../dashboard
npm install
npm run dev
```

### Access

- **Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:8081/api
- **Swagger**: http://localhost:8081/swagger-ui.html

---

## 📦 Components

### Backend

- **Framework**: Spring Boot 3.2
- **Database**: PostgreSQL 15
- **Security**: Spring Security + JWT
- **Multi-tenancy**: Schema per tenant
- **API**: REST + OpenAPI 3

📖 [Backend Documentation](./backend/README.md)

### Dashboard

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State**: Context API + React Query

📖 [Dashboard Documentation](./dashboard/README.md)

### Infrastructure

- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (optional)
- **Tracing**: Jaeger (optional)

📖 [Infrastructure Documentation](./infrastructure/README.md)

---

## 🔧 Features

### Multi-Tenant Management

- ✅ Organization (tenant) CRUD
- ✅ User management per tenant
- ✅ Role-based access control
- ✅ Data isolation (schema per tenant)
- ✅ Custom branding per tenant

### Content Marketplace

- ✅ Exercise library
- ✅ Phishing template library
- ✅ Content versioning
- ✅ Content publishing workflow
- ✅ Content ratings and reviews

### Analytics & Telemetry

- ✅ Aggregate metrics across tenants
- ✅ Telemetry ingestion from nodes
- ✅ Custom dashboards
- ✅ Alerting rules
- ✅ Reporting engine

### Update Distribution

- ✅ Update package creation
- ✅ Version management
- ✅ Rollout strategies (canary, blue/green)
- ✅ Rollback capabilities
- ✅ Update health monitoring

### License Management

- ✅ License key generation
- ✅ Feature gating
- ✅ Usage tracking
- ✅ Billing integration (Stripe)
- ✅ Trial management

---

## 🗄️ Database Schema

### Key Tables

- `tenants` - Organizations/Companies
- `tenant_users` - Users per tenant
- `content_library` - Exercise/template library
- `content_versions` - Content versioning
- `updates` - Update packages
- `licenses` - License management
- `telemetry` - Aggregated telemetry
- `billing` - Subscription info

---

## 🔐 Security

### Multi-Tenancy Isolation

- Schema-per-tenant architecture
- Row-level security (RLS)
- Tenant context propagation
- API key per tenant

### Authentication

- JWT tokens
- OAuth 2.0 / OpenID Connect
- SSO support (SAML, Azure AD)

---

## 📊 API Endpoints

### Tenant Management

```
GET    /api/tenants
POST   /api/tenants
GET    /api/tenants/{id}
PUT    /api/tenants/{id}
DELETE /api/tenants/{id}
```

### Content Library

```
GET    /api/content/exercises
GET    /api/content/templates
POST   /api/content/exercises
POST   /api/content/templates
```

### Update Distribution

```
GET    /api/updates
POST   /api/updates
GET    /api/updates/{id}/status
POST   /api/updates/{id}/rollout
```

### Telemetry

```
POST   /api/telemetry/ingest
GET    /api/telemetry/metrics
GET    /api/telemetry/dashboards
```

📖 [Full API Documentation](./backend/API.md)

---

## 🐳 Docker Deployment

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# With infrastructure monitoring
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
mvn test

# Integration tests
mvn verify

# Frontend tests
cd dashboard
npm test

# E2E tests
npm run test:e2e
```

---

## 📈 Monitoring

### Prometheus Metrics

- HTTP request rates
- Response times
- Database connection pool
- Tenant-specific metrics
- Update rollout status

### Grafana Dashboards

- System health
- Tenant overview
- Content usage
- Update distribution
- Billing metrics

Access: http://localhost:3002 (Grafana)

---

## 🔄 CI/CD

GitHub Actions workflows:

- `.github/workflows/central-backend.yml`
- `.github/workflows/central-dashboard.yml`
- `.github/workflows/central-deploy.yml`

---

## 📚 Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Multi-Tenancy](./docs/MULTI_TENANCY.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Monitoring](./infrastructure/README.md)

---

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) at repository root.

---

## 📝 License

MIT License - See [LICENSE](../LICENSE)

---

**Version**: 1.0.0  
**Status**: 🚧 In Development

