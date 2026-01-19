# CyberSensei - Phishing & Social Engineering Simulation Module

## 🎯 Overview

This module provides enterprise-grade phishing simulation capabilities for security awareness training. It allows organizations to:

- Create and manage phishing email campaigns
- Track user interactions (opens, clicks, form submissions, reports)
- Generate detailed reports on user behavior
- Identify high-risk departments and individuals
- Measure security awareness improvement over time

## 🏗️ Architecture

```
com.cybersensei.backend.phishing
├── config/           # Spring configuration
├── controller/       # REST API endpoints
├── dto/             # Data transfer objects
├── entity/          # JPA entities
├── repository/      # Spring Data repositories
├── scheduler/       # Scheduled jobs
└── service/         # Business logic
```

## 🔧 Configuration

### Application Properties

```yaml
cybersensei:
  phishing:
    tracking-base-url: https://your-domain.com  # Public URL for tracking
  encryption:
    key: <base64-encoded-256-bit-key>  # For SMTP password encryption
```

### Generate Encryption Key

```java
String key = EncryptionService.generateKey();
System.out.println(key);
```

## 📡 API Endpoints

### Templates (ADMIN/MANAGER)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/phishing/templates` | Create template |
| GET | `/api/phishing/templates` | List templates |
| GET | `/api/phishing/templates/{id}` | Get template |
| PUT | `/api/phishing/templates/{id}` | Update template |
| DELETE | `/api/phishing/templates/{id}` | Delete template |

### Campaigns (ADMIN/MANAGER)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/phishing/campaigns` | Create campaign |
| GET | `/api/phishing/campaigns` | List campaigns |
| GET | `/api/phishing/campaigns/{id}` | Get campaign |
| PUT | `/api/phishing/campaigns/{id}` | Update campaign |
| POST | `/api/phishing/campaigns/{id}/schedule` | Schedule campaign |
| POST | `/api/phishing/campaigns/{id}/pause` | Pause campaign |
| POST | `/api/phishing/campaigns/{id}/resume` | Resume campaign |
| POST | `/api/phishing/campaigns/{id}/stop` | Stop campaign |
| POST | `/api/phishing/campaigns/{id}/run-now` | Execute immediately |

### Reporting (ADMIN/MANAGER)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/phishing/campaigns/{id}/results` | Full results |
| GET | `/api/phishing/campaigns/{id}/results/daily` | Daily breakdown |
| GET | `/api/phishing/campaigns/{id}/results/segments` | Department breakdown |
| GET | `/api/phishing/campaigns/{id}/results/users` | User-level results (privacy-aware) |

### Settings (ADMIN)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/settings/smtp` | Configure SMTP |
| POST | `/api/settings/smtp/{id}/test` | Test SMTP |
| POST | `/api/settings/branding` | Configure branding |
| GET | `/api/settings/phishing` | Get all settings |

### Tracking (Public, token-protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/t/{token}/l/{linkId}` | Track link click |
| GET | `/t/{token}/p` | Track email open (pixel) |
| POST | `/t/{token}/form` | Track form submission |
| POST | `/t/{token}/report` | Track phishing report |

## 🚀 Running a Campaign

### 1. Configure SMTP

```bash
POST /api/settings/smtp
{
  "host": "smtp.example.com",
  "port": 587,
  "username": "phishing@example.com",
  "password": "secret",
  "fromEmail": "security@example.com",
  "fromName": "IT Security",
  "tlsEnabled": true,
  "maxRatePerMinute": 30
}
```

### 2. Configure Branding

```bash
POST /api/settings/branding
{
  "companyName": "Your Company",
  "logoUrl": "https://example.com/logo.png",
  "defaultSenderName": "IT Security Team"
}
```

### 3. Create a Campaign

```bash
POST /api/phishing/campaigns
{
  "name": "Q1 2024 - Password Reset Test",
  "description": "Testing password reset awareness",
  "theme": "PASSWORD_RESET",
  "difficulty": 1,
  "templateId": "550e8400-e29b-41d4-a716-446655440001",
  "scheduleFrequency": "ONCE",
  "scheduleStartDate": "2024-01-15",
  "scheduleWindowStart": "09:00",
  "scheduleWindowEnd": "11:30",
  "timezone": "Europe/Paris",
  "targeting": {
    "departments": ["Finance", "HR"],
    "roles": [],
    "excludeUsers": []
  },
  "samplingPercent": 50,
  "privacyMode": "ANONYMIZED",
  "retentionDays": 90
}
```

### 4. Schedule the Campaign

```bash
POST /api/phishing/campaigns/{id}/schedule
```

### 5. Monitor Results

```bash
GET /api/phishing/campaigns/{id}/results
```

## 🔒 Privacy Modes

### ANONYMIZED (Default)
- User results show only: `User-abc12345`
- No email, name, or PII exposed to managers
- Department-level reporting only

### IDENTIFIED
- Full user details visible
- Requires appropriate authorization
- Use only with HR/Legal approval

## 📊 Risk Scoring

Risk score is calculated based on:
- **Click Rate** (60% weight): Higher = more risk
- **Data Submission Rate** (30% weight, 2x multiplier): Highest risk factor
- **Report Rate** (-10% bonus): Lower = less risk

Risk Levels:
| Score | Level |
|-------|-------|
| 0-10 | EXCELLENT |
| 10-25 | GOOD |
| 25-50 | MODERATE |
| 50-75 | HIGH |
| 75-100 | CRITICAL |

## 📅 Scheduled Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| Campaign Scheduler | Every 5 minutes | Checks and executes scheduled campaigns |
| Aggregation | Daily at 2 AM | Computes daily statistics |
| Retention | Daily at 3 AM | Purges old data based on retention settings |

## 🛡️ Security Considerations

1. **SMTP Passwords**: Stored encrypted using AES-256-GCM
2. **Tracking Tokens**: Cryptographically secure, 512-bit entropy
3. **Rate Limiting**: Tracking endpoints rate-limited (20 req/min per token)
4. **No Credential Storage**: Form submissions NEVER store actual credentials
5. **Audit Logging**: All admin actions are logged
6. **JWT + RBAC**: API endpoints protected by role-based access

## 🧪 Testing

Run unit tests:

```bash
mvn test -Dtest="com.cybersensei.backend.phishing.**"
```

## 📦 Dependencies

Ensure these are in your `pom.xml`:

```xml
<dependency>
    <groupId>com.bucket4j</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.7.0</version>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

## 🔄 Database Schema

See `db/changelog/phishing/README.md` for full schema documentation.

