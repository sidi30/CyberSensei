# 🏢 CyberSensei Node - On-Premise Solution

> **Complete on-premise cybersecurity training platform with AI**

---

## 📋 Overview

**CyberSensei Node** is the on-premise deployment solution that provides:

- 🧠 **AI-powered training** with Mistral 7B
- 🎣 **Phishing simulations** with tracking
- 📊 **Team metrics** and dashboards
- 💬 **Interactive quizzes** adaptive to user level
- 🔄 **Optional sync** with Central platform
- 🐳 **Docker-based** deployment

---

## 🏗️ Architecture

```
cybersensei-node/
├── backend/              # Spring Boot 3 Backend
│   ├── src/
│   ├── pom.xml
│   └── README.md
│
├── dashboard/            # React Dashboard
│   ├── src/
│   ├── package.json
│   └── README.md
│
├── ai/                   # AI Service (Mistral 7B)
│   ├── server.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
└── compose/              # Docker Compose configs
    ├── docker-compose.yml
    ├── docker-compose.dev.yml
    ├── docker-compose.prod.yml
    └── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **16GB RAM** (for AI service)
- **50GB disk** space

### Installation (Docker - Recommended)

```bash
# 1. Download AI model (4.4GB)
mkdir -p ai/models
cd ai/models
wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf
mv mistral-7b-instruct-v0.2.Q4_K_M.gguf mistral-7b-instruct.Q4_K_M.gguf
cd ../..

# 2. Setup environment
cp .env.example .env

# 3. Start all services
cd compose
docker-compose up -d

# 4. Check status
docker-compose ps

# 5. Access
# Dashboard: http://localhost:3005
# Backend: http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui.html
```

### Manual Installation (Development)

```bash
# Backend
cd backend
mvn spring-boot:run

# Dashboard
cd dashboard
npm install
npm run dev

# AI Service
cd ai
pip install -r requirements.txt
./run.sh
```

---

## 📦 Components

### 1. Backend (Spring Boot)

**Features:**
- ✅ User management with JWT auth
- ✅ Exercise & quiz service
- ✅ AI integration (chat with Mistral)
- ✅ Phishing campaign management
- ✅ Metrics & analytics
- ✅ Sync agent (optional)

**Tech Stack:**
- Spring Boot 3.2
- PostgreSQL 15
- Spring Security + JWT
- Liquibase
- OpenAPI 3

📖 [Backend Documentation](./backend/README.md)

---

### 2. Dashboard (React)

**Features:**
- ✅ Employee Tab (quizzes, AI chat, progress)
- ✅ Manager Tab (team metrics, user management)
- ✅ Real-time updates
- ✅ Responsive design
- ✅ Microsoft Teams compatible

**Tech Stack:**
- React 18 + TypeScript
- Tailwind CSS
- Chart.js
- Axios

📖 [Dashboard Documentation](./dashboard/README.md)

---

### 3. AI Service (Mistral 7B)

**Features:**
- ✅ Mistral 7B Instruct model
- ✅ llama.cpp runtime
- ✅ FastAPI wrapper
- ✅ Streaming responses
- ✅ Context-aware answers

**Tech Stack:**
- Python 3.10+
- FastAPI
- llama.cpp
- GGUF model format

📖 [AI Service Documentation](./ai/README.md)

---

### 4. Docker Compose

**Configurations:**
- `docker-compose.yml` - Production
- `docker-compose.dev.yml` - Development
- `docker-compose.prod.yml` - Production overrides

**Services:**
- postgres (PostgreSQL 15)
- backend (Spring Boot)
- dashboard (React + Nginx)
- ai (Mistral 7B)
- mailcatcher (dev only)
- pgadmin (dev only)

📖 [Docker Documentation](./compose/README.md)

---

## 🔧 Features

### Training & Assessment

- ✅ Interactive quizzes (MCQ, True/False)
- ✅ AI-powered explanations
- ✅ Adaptive difficulty
- ✅ Progress tracking
- ✅ Topic-based exercises

### Phishing Simulations

- ✅ Campaign scheduling
- ✅ Template library
- ✅ Email tracking (opens, clicks)
- ✅ User reporting
- ✅ Results dashboard

### AI Chat

- ✅ Cybersecurity expert persona
- ✅ Context-aware responses
- ✅ Personalized recommendations
- ✅ Multi-turn conversations

### Metrics & Analytics

- ✅ Individual user scores
- ✅ Team performance
- ✅ Risk assessment
- ✅ Trend analysis
- ✅ Export reports

### Sync Agent (Optional)

- ✅ Update check (nightly)
- ✅ Content download
- ✅ Telemetry push
- ✅ License validation

---

## 🗄️ Database

### PostgreSQL Schema

**Tables:**
- `users` - User accounts
- `exercises` - Training exercises
- `user_exercise_results` - Quiz results
- `ai_profiles` - User AI preferences
- `company_metrics` - Company-wide metrics
- `phishing_templates` - Email templates
- `phishing_campaigns` - Campaign tracking
- `phishing_trackers` - Event tracking
- `config` - System configuration
- `logs` - Audit logs

**Migrations:** Liquibase changelogs in `backend/src/main/resources/db/changelog/`

---

## 🔐 Security

### Authentication

- JWT tokens (access + refresh)
- BCrypt password hashing
- Role-based access control (EMPLOYEE, MANAGER, ADMIN)
- Microsoft Teams SSO compatible

### Network

- Docker network isolation
- HTTPS ready (reverse proxy)
- CORS configuration
- Rate limiting

---

## 📊 API Endpoints

### Authentication

```
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

### User Management

```
GET  /api/user/me
GET  /api/user/{id}
PUT  /api/user/{id}
```

### Quizzes

```
GET  /api/quiz/today
POST /api/exercise/{id}/submit
```

### AI Chat

```
POST /api/ai/chat
```

### Phishing

```
POST /api/phishing/send
GET  /api/phishing/results
GET  /api/phishing/click/{token}
GET  /api/phishing/pixel/{token}
```

### Manager

```
GET  /api/manager/metrics
GET  /api/manager/users
```

📖 [Full API Documentation](./backend/docs/API.md)

---

## 🐳 Docker Deployment

### Development

```bash
cd compose
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

**Includes:**
- MailCatcher (SMTP debug)
- PgAdmin (DB management)
- Debug logging

### Production

```bash
cd compose
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

**Features:**
- Resource limits
- PostgreSQL tuning
- Restart policies
- Production SMTP

---

## 🧪 Testing

```bash
# Backend
cd backend
mvn test

# Integration tests
mvn verify

# Frontend
cd dashboard
npm test

# E2E (if configured)
npm run test:e2e
```

---

## 📈 Monitoring

### Health Checks

```bash
# Backend
curl http://localhost:8080/actuator/health

# AI
curl http://localhost:8000/health

# Dashboard
curl http://localhost:3005
```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

---

## 🔄 Updates

### Manual Update

```bash
# Pull latest images
docker-compose pull

# Restart services
docker-compose up -d
```

### Sync with Central (Optional)

Enable in `.env`:

```bash
SYNC_ENABLED=true
CENTRAL_URL=https://central.cybersensei.io
TENANT_ID=your-company-id
```

---

## 📚 Documentation

- [Quick Start](./compose/README.md)
- [Backend Guide](./backend/README.md)
- [Dashboard Guide](./dashboard/README.md)
- [AI Service Guide](./ai/README.md)
- [Deployment](./compose/DEPLOYMENT.md)
- [Troubleshooting](./compose/TROUBLESHOOTING.md)

---

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) at repository root.

---

## 📝 License

MIT License - See [LICENSE](../LICENSE)

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready

