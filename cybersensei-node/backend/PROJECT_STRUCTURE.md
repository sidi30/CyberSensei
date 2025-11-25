# Structure du Projet CyberSensei Backend

## 📁 Arborescence Complète

```
cybersensei-node-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── io/
│   │   │       └── cybersensei/
│   │   │           ├── CyberSenseiApplication.java       # Point d'entrée
│   │   │           │
│   │   │           ├── api/                               # Couche API
│   │   │           │   ├── controller/                    # Controllers REST
│   │   │           │   │   ├── AIController.java
│   │   │           │   │   ├── AuthController.java
│   │   │           │   │   ├── HealthController.java
│   │   │           │   │   ├── ManagerController.java
│   │   │           │   │   ├── PhishingController.java
│   │   │           │   │   ├── QuizController.java
│   │   │           │   │   ├── SyncController.java
│   │   │           │   │   └── UserController.java
│   │   │           │   │
│   │   │           │   ├── dto/                           # Data Transfer Objects
│   │   │           │   │   ├── AIChatRequest.java
│   │   │           │   │   ├── AIChatResponse.java
│   │   │           │   │   ├── AuthRequest.java
│   │   │           │   │   ├── AuthResponse.java
│   │   │           │   │   ├── CompanyMetricsDto.java
│   │   │           │   │   ├── ExerciseDto.java
│   │   │           │   │   ├── PhishingCampaignDto.java
│   │   │           │   │   ├── SubmitExerciseRequest.java
│   │   │           │   │   ├── TelemetryRequest.java
│   │   │           │   │   ├── UpdateCheckResponse.java
│   │   │           │   │   ├── UserDto.java
│   │   │           │   │   └── UserExerciseResultDto.java
│   │   │           │   │
│   │   │           │   └── mapper/                        # MapStruct mappers
│   │   │           │       ├── CompanyMetricsMapper.java
│   │   │           │       ├── ExerciseMapper.java
│   │   │           │       ├── PhishingCampaignMapper.java
│   │   │           │       ├── UserExerciseResultMapper.java
│   │   │           │       └── UserMapper.java
│   │   │           │
│   │   │           ├── config/                            # Configuration
│   │   │           │   ├── OpenApiConfig.java            # Swagger/OpenAPI
│   │   │           │   └── WebConfig.java                # WebClient, ObjectMapper
│   │   │           │
│   │   │           ├── domain/                            # Couche domaine
│   │   │           │   ├── entity/                        # Entités JPA
│   │   │           │   │   ├── AIProfile.java
│   │   │           │   │   ├── CompanyMetrics.java
│   │   │           │   │   ├── Config.java
│   │   │           │   │   ├── Exercise.java
│   │   │           │   │   ├── PhishingCampaign.java
│   │   │           │   │   ├── PhishingTemplate.java
│   │   │           │   │   ├── PhishingTracker.java
│   │   │           │   │   ├── User.java
│   │   │           │   │   └── UserExerciseResult.java
│   │   │           │   │
│   │   │           │   └── repository/                    # Repositories JPA
│   │   │           │       ├── AIProfileRepository.java
│   │   │           │       ├── CompanyMetricsRepository.java
│   │   │           │       ├── ConfigRepository.java
│   │   │           │       ├── ExerciseRepository.java
│   │   │           │       ├── PhishingCampaignRepository.java
│   │   │           │       ├── PhishingTemplateRepository.java
│   │   │           │       ├── PhishingTrackerRepository.java
│   │   │           │       ├── UserExerciseResultRepository.java
│   │   │           │       └── UserRepository.java
│   │   │           │
│   │   │           ├── security/                          # Sécurité Spring
│   │   │           │   ├── CustomUserDetailsService.java
│   │   │           │   ├── JwtAuthenticationEntryPoint.java
│   │   │           │   ├── JwtAuthenticationFilter.java
│   │   │           │   ├── JwtTokenProvider.java
│   │   │           │   ├── SecurityConfig.java
│   │   │           │   └── UserPrincipal.java
│   │   │           │
│   │   │           └── service/                           # Services métier
│   │   │               ├── AIService.java                # IA - appel modèle local
│   │   │               ├── ConfigService.java            # Configuration dynamique
│   │   │               ├── HealthCheckService.java       # Health checks
│   │   │               ├── MetricsService.java           # Métriques entreprise
│   │   │               ├── PhishingService.java          # Campagnes phishing
│   │   │               ├── QuizService.java              # Quiz adaptatifs
│   │   │               ├── SyncAgentService.java         # Sync avec central
│   │   │               └── UserService.java              # Gestion utilisateurs
│   │   │
│   │   └── resources/
│   │       ├── application.yml                            # Configuration Spring Boot
│   │       └── db/
│   │           └── changelog/                             # Migrations Liquibase
│   │               ├── db.changelog-master.xml
│   │               └── changes/
│   │                   ├── 001-create-users-table.xml
│   │                   ├── 002-create-exercises-table.xml
│   │                   ├── 003-create-user-exercise-results-table.xml
│   │                   ├── 004-create-ai-profiles-table.xml
│   │                   ├── 005-create-company-metrics-table.xml
│   │                   ├── 006-create-phishing-templates-table.xml
│   │                   ├── 007-create-phishing-campaigns-table.xml
│   │                   ├── 008-create-phishing-trackers-table.xml
│   │                   ├── 009-create-configs-table.xml
│   │                   └── 010-insert-sample-data.xml
│   │
│   └── test/
│       ├── java/
│       │   └── io/
│       │       └── cybersensei/
│       │           ├── CyberSenseiApplicationTests.java  # Tests d'intégration
│       │           ├── controller/
│       │           │   └── UserControllerTest.java       # Tests controllers
│       │           └── repository/
│       │               └── UserRepositoryTest.java       # Tests repositories
│       │
│       └── resources/
│           └── application-test.yml                       # Config tests
│
├── .dockerignore                                          # Docker ignore
├── .gitignore                                             # Git ignore
├── Dockerfile                                             # Multi-stage build
├── docker-compose.yml                                     # Orchestration complète
├── pom.xml                                                # Configuration Maven
├── PROJECT_STRUCTURE.md                                   # Ce fichier
└── README.md                                              # Documentation principale
```

## 🎯 Modules Fonctionnels

### 1. User Management
**Fichiers**: `User.java`, `UserRepository.java`, `UserService.java`, `UserController.java`
- Authentification JWT
- Intégration MS Teams SSO
- Gestion des profils

### 2. Exercise Management
**Fichiers**: `Exercise.java`, `ExerciseRepository.java`
- Stockage exercices avec payload JSON
- Support multiple types (QUIZ, SIMULATION, SCENARIO, CHALLENGE)
- Niveaux de difficulté (BEGINNER → EXPERT)

### 3. Quiz Service
**Fichiers**: `QuizService.java`, `QuizController.java`
- Sélection adaptative basée sur performance
- Algorithme de difficulté dynamique
- Tracking résultats

### 4. AI Service
**Fichiers**: `AIService.java`, `AIController.java`
- Appel vers conteneur IA local (http://ai:8000)
- Chat assistant cybersécurité
- Timeout configurable

### 5. Phishing Service
**Fichiers**: `PhishingService.java`, `PhishingController.java`, `PhishingTemplate.java`, etc.
- Générateur emails phishing
- Tracking pixels (ouverture)
- Tracking liens (clic)
- Reporting utilisateurs
- Campagnes automatiques quotidiennes

### 6. Metrics Service
**Fichiers**: `MetricsService.java`, `CompanyMetrics.java`
- Score sécurité entreprise (0-100)
- Niveau de risque (LOW → CRITICAL)
- Calcul automatique horaire
- Statistiques agrégées

### 7. Sync Agent
**Fichiers**: `SyncAgentService.java`, `SyncController.java`
- Vérification updates (03:00 nightly)
- Téléchargement contenu central
- Envoi télémétrie
- Migrations Liquibase auto

### 8. Config Service
**Fichiers**: `ConfigService.java`, `Config.java`
- Configuration dynamique (key-value)
- SMTP settings
- Nom entreprise
- Paramètres runtime

### 9. Health Check Service
**Fichiers**: `HealthCheckService.java`, `HealthController.java`
- Status système
- Vérification DB
- Actuator metrics

### 10. Authentication
**Fichiers**: `SecurityConfig.java`, `JwtTokenProvider.java`, etc.
- JWT stateless
- BCrypt hashing
- Role-based access (EMPLOYEE, MANAGER, ADMIN)
- MS Teams SSO ready

## 🗄️ Base de Données

### Tables PostgreSQL
| Table | Description | Relations |
|-------|-------------|-----------|
| `users` | Utilisateurs avec MS Teams ID | - |
| `exercises` | Exercices avec payload JSON | - |
| `user_exercise_results` | Résultats utilisateurs | → users, exercises |
| `ai_profiles` | Profils IA personnalisés | → users |
| `company_metrics` | Métriques entreprise | - |
| `phishing_templates` | Templates emails phishing | - |
| `phishing_campaigns` | Campagnes envoyées | → templates |
| `phishing_trackers` | Tracking individuel | → users, campaigns |
| `configs` | Configuration dynamique | - |

## 🔒 Sécurité

### Endpoints Publics
- `/api/auth/**` - Authentification
- `/api/health` - Health check
- `/api/phishing/track/**` - Tracking pixels/liens
- `/swagger-ui/**` - Documentation API

### Endpoints Protégés
- `/api/user/**` - Authentifié
- `/api/quiz/**` - Authentifié
- `/api/ai/**` - Authentifié
- `/api/manager/**` - MANAGER ou ADMIN
- `/api/admin/**` - ADMIN uniquement

## 📦 Dépendances Principales

```xml
Spring Boot 3.2.0
Spring Security (JWT)
Spring Data JPA
PostgreSQL Driver
Liquibase 4.25.0
MapStruct 1.5.5
JJWT 0.12.3
SpringDoc OpenAPI 2.3.0
Testcontainers 1.19.3
Lombok 1.18.30
```

## 🚀 Déploiement

### Docker Compose
```bash
docker-compose up -d
```

### Kubernetes (à venir)
```bash
kubectl apply -f k8s/
```

## 📊 Métriques & Monitoring

- **Actuator**: `/actuator/health`, `/actuator/metrics`
- **Prometheus**: `/actuator/prometheus`
- **Logs**: Console + fichier (`logs/cybersensei.log`)

## 🧪 Tests

- **Unit tests**: Controllers avec `@WebMvcTest`
- **Integration tests**: Repositories avec Testcontainers
- **E2E tests**: Application complète avec PostgreSQL

---

**Version**: 1.0.0  
**Dernière mise à jour**: 2024  
**Auteur**: CyberSensei Team


