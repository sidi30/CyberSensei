# CyberSensei Node Backend

Production-grade Spring Boot backend for the CyberSensei cybersecurity training platform.

## 🏗️ Architecture

### Tech Stack
- **Java 21** - Modern LTS version
- **Spring Boot 3.2** - Latest Spring Boot framework
- **Spring Security** - JWT-based authentication
- **Spring Data JPA** - Database access
- **PostgreSQL 16** - Primary database
- **Liquibase** - Database migrations
- **MapStruct** - DTO mapping
- **OpenAPI 3** - API documentation
- **Docker** - Containerization
- **Testcontainers** - Integration testing

### Project Modules

1. **user-management** - User authentication and profile management
2. **exercise-management** - Training exercises and quizzes
3. **quiz-service** - Adaptive quiz selection based on user performance
4. **ai-service** - Integration with AI model for chat assistance
5. **phishing-service** - Phishing email campaigns and tracking
6. **metrics-service** - Company-wide security metrics calculation
7. **sync-agent** - Synchronization with central server
8. **config-service** - Dynamic configuration management
9. **healthcheck-service** - System health monitoring
10. **authentication** - MS Teams SSO compatibility

## 📊 Database Schema

### Core Entities
- **User** - User accounts with MS Teams integration
- **Exercise** - Training exercises with JSON payloads
- **UserExerciseResult** - Exercise completion tracking
- **AIProfile** - Personalized learning profiles
- **CompanyMetrics** - Aggregated security metrics
- **PhishingTemplate** - Email templates for campaigns
- **PhishingCampaign** - Campaign tracking
- **PhishingTracker** - Individual email tracking
- **Config** - Dynamic configuration storage

## 🚀 Getting Started

### Prerequisites
- Java 21 or higher
- Docker and Docker Compose
- Maven 3.9+
- PostgreSQL 16 (if running locally)

### Quick Start with Docker Compose

1. **Clone the repository**
```bash
git clone <repository-url>
cd cybersensei-node-backend
```

2. **Start all services**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- CyberSensei backend on port 8080
- AI service (placeholder) on port 8000

3. **Access the application**
- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health endpoint: http://localhost:8080/api/health

### Manual Setup (Development)

1. **Start PostgreSQL**
```bash
docker run -d \
  --name postgres \
  -e POSTGRES_DB=cybersensei \
  -e POSTGRES_USER=cybersensei \
  -e POSTGRES_PASSWORD=cybersensei123 \
  -p 5432:5432 \
  postgres:16-alpine
```

2. **Configure environment variables** (optional)
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=cybersensei
export DB_USERNAME=cybersensei
export DB_PASSWORD=cybersensei123
export JWT_SECRET=YourSecretKey
```

3. **Build and run the application**
```bash
mvn clean package
java -jar target/cybersensei-node-backend-1.0.0.jar
```

Or run directly with Maven:
```bash
mvn spring-boot:run
```

## 🔐 Authentication

### Default Admin Credentials
- **Email**: admin@cybersensei.io
- **Password**: Demo123!

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cybersensei.io",
    "password": "Demo123!"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@cybersensei.io",
    "role": "ADMIN"
  }
}
```

### Using the JWT Token
```bash
curl -X GET http://localhost:8080/api/user/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/teams` - MS Teams SSO login

### User Management
- `GET /api/user/me` - Get current user
- `GET /api/user/{id}` - Get user by ID

### Quiz & Exercises
- `GET /api/quiz/today` - Get personalized daily quiz
- `POST /api/exercise/{id}/submit` - Submit exercise results

### AI Service
- `POST /api/ai/chat` - Chat with AI assistant

### Phishing Campaigns
- `POST /api/phishing/send` - Send phishing campaign (Admin)
- `GET /api/phishing/results` - Get campaign results
- `GET /api/phishing/track/pixel/{token}` - Track email open
- `GET /api/phishing/track/click/{token}` - Track link click

### Metrics (Manager/Admin)
- `GET /api/manager/metrics` - Get company security metrics

### Sync Agent (Admin)
- `GET /api/update/check` - Check for updates
- `POST /api/update/apply` - Apply updates
- `POST /api/telemetry` - Send telemetry

### Health
- `GET /api/health` - System health status

## 🧪 Testing

### Run all tests
```bash
mvn test
```

### Run integration tests with Testcontainers
```bash
mvn verify
```

The tests use Testcontainers to spin up a real PostgreSQL database for integration testing.

## 🐳 Docker

### Build Docker image
```bash
docker build -t cybersensei-backend:latest .
```

### Run container
```bash
docker run -d \
  --name cybersensei-backend \
  -p 8080:8080 \
  -e DB_HOST=postgres \
  -e DB_PASSWORD=cybersensei123 \
  cybersensei-backend:latest
```

### Multi-stage build optimization
The Dockerfile uses a multi-stage build:
1. **Builder stage**: Compiles the application with Maven
2. **Runtime stage**: Runs on lightweight JRE image

This reduces the final image size significantly.

## ⚙️ Configuration

### Key Configuration Properties

**Database**
```yaml
spring.datasource.url: jdbc:postgresql://localhost:5432/cybersensei
spring.datasource.username: cybersensei
spring.datasource.password: cybersensei123
```

**JWT Security**
```yaml
cybersensei.security.jwt.secret: YourSecretKey
cybersensei.security.jwt.expiration: 86400000 # 24 hours
```

**AI Service**
```yaml
cybersensei.ai.service-url: http://ai:8000
cybersensei.ai.timeout: 30000
```

**Sync Agent**
```yaml
cybersensei.sync.central-url: https://central.cybersensei.io
cybersensei.sync.tenant-id: your-tenant-id
cybersensei.sync.cron: "0 0 3 * * ?" # 3 AM daily
```

**Phishing**
```yaml
cybersensei.phishing.tracking-url: http://localhost:8080
cybersensei.phishing.daily-send-cron: "0 0 9 * * MON-FRI" # 9 AM weekdays
cybersensei.phishing.enabled: true
```

**SMTP (for phishing emails)**
```yaml
spring.mail.host: smtp.gmail.com
spring.mail.port: 587
spring.mail.username: your-email@gmail.com
spring.mail.password: your-app-password
```

### Environment Variables
All configuration can be overridden with environment variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`
- `JWT_SECRET`
- `AI_SERVICE_URL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`
- `TEAMS_TENANT_ID`, `TEAMS_CLIENT_ID`, `TEAMS_CLIENT_SECRET`

## 📈 Monitoring

### Actuator Endpoints
- `/actuator/health` - Health check
- `/actuator/metrics` - Application metrics
- `/actuator/prometheus` - Prometheus metrics

### Logs
Logs are written to:
- Console (stdout)
- File: `logs/cybersensei.log` (max 10MB, 30 days retention)

## 🔄 Scheduled Jobs

### Nightly Sync (03:00)
- Checks for updates from central server
- Downloads new content
- Sends telemetry data

### Daily Phishing Campaign (09:00 weekdays)
- Selects random phishing template
- Sends to all active users
- Tracks opens, clicks, and reports

### Hourly Metrics Calculation
- Calculates average quiz scores
- Computes phishing click rates
- Determines company risk level

## 🛡️ Security

### Authentication & Authorization
- JWT-based stateless authentication
- Role-based access control (EMPLOYEE, MANAGER, ADMIN)
- MS Teams SSO support (optional)
- Password hashing with BCrypt

### Security Headers
- CORS enabled with configurable origins
- CSRF disabled (stateless JWT)
- Secure session management

## 📦 Database Migrations

### Liquibase
Migrations are managed by Liquibase and run automatically on startup.

**Location**: `src/main/resources/db/changelog/`

**Manual execution**:
```bash
mvn liquibase:update
```

**Rollback**:
```bash
mvn liquibase:rollback -Dliquibase.rollbackCount=1
```

## 🚦 CI/CD

### Build
```bash
mvn clean package
```

### Quality checks
```bash
mvn verify
```

### Docker image
```bash
docker build -t cybersensei-backend:${VERSION} .
docker push your-registry/cybersensei-backend:${VERSION}
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Run `mvn verify`
5. Submit a pull request

## 📄 License

Proprietary - CyberSensei Platform

## 📞 Support

For support, email support@cybersensei.io or open an issue.

## 🗺️ Roadmap

- [ ] MS Teams SSO implementation
- [ ] Real-time notifications with WebSocket
- [ ] Advanced AI integration
- [ ] Mobile app backend support
- [ ] Multi-tenancy support
- [ ] Advanced reporting dashboard

---

**Built with ❤️ by the CyberSensei Team**


