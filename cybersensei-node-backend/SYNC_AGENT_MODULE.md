# 🔄 Module SyncAgent - Documentation Complète

## 🎯 Vue d'Ensemble

Le **SyncAgent** est un service de synchronisation automatique qui:
1. **Vérifie et applique les mises à jour** depuis un serveur central (nuit à 03:00)
2. **Envoie la télémétrie** au serveur central (toutes les 15 minutes)

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────┐
│                  SYNCAGENT SERVICE                         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────┐  ┌──────────────────────────┐  │
│  │  NIGHTLY UPDATE      │  │  TELEMETRY PUSH          │  │
│  │  @Scheduled(03:00)   │  │  @Scheduled(every 15min) │  │
│  └──────────┬───────────┘  └────────┬─────────────────┘  │
│             │                       │                     │
│             ▼                       ▼                     │
│  ┌──────────────────────────────────────────────────┐    │
│  │  RestTemplate + @Retryable                       │    │
│  │  (HTTP Client with automatic retry logic)        │    │
│  └──────────────────────┬───────────────────────────┘    │
└─────────────────────────┼────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │  central.cybersensei.io             │
        │  - GET /api/updates/check           │
        │  - GET /download/{package}          │
        │  - POST /api/telemetry              │
        └─────────────────────────────────────┘
```

---

## 🔄 Flow 1: Nightly Update Check (03:00 AM)

```
03:00 AM - Scheduled Job Triggers
         ↓
1. GET /api/updates/check?tenantId=demo&version=1.0.0
         ↓
   ┌─────────────────────────┐
   │ No update available?    │
   └─────┬─────────────┬─────┘
         │ YES         │ NO
         ▼             ▼
    ✅ Stop      2. Download ZIP from URL
                      ↓
                3. Validate SHA-256 checksum
                      ↓
                4. Extract ZIP to /updates/extract_xxx/
                      ↓
                5. Apply update components:
                   ├─ Liquibase migrations (if migrations/*.xml)
                   ├─ Exercises (if exercises.json)
                   └─ Phishing templates (if phishing_templates.json)
                      ↓
                6. Update version in DB (configs.system.version)
                      ↓
                7. Cleanup temp files
                      ↓
                ✅ Update complete
```

---

## 📊 Flow 2: Telemetry Push (Every 15 Minutes)

```
Every 15 minutes
       ↓
1. Collect telemetry data:
   ├─ tenantId
   ├─ version
   ├─ timestamp
   ├─ userCount
   ├─ exercisesCompletedToday
   ├─ aiResponseLatencyMs
   └─ healthy (boolean)
       ↓
2. POST /api/telemetry (with Bearer token)
   {
     "tenantId": "demo",
     "version": "1.0.0",
     "timestamp": "2024-11-24T09:00:00",
     "userCount": 50,
     "exercisesCompletedToday": 12,
     "aiResponseLatencyMs": 250.0,
     "healthy": true
   }
       ↓
3. Central server processes telemetry
       ↓
   ✅ Telemetry sent
```

---

## 📋 Composants Créés

### 1. **SyncAgentService.java** (600+ lignes)

**Méthodes principales:**

```java
// Scheduled jobs
@Scheduled(cron = "0 0 3 * * *")
public void checkAndApplyUpdates()

@Scheduled(fixedRate = 900000) // 15 minutes
public void pushTelemetry()

// Update operations
@Retryable(retryFor = RestClientException.class, maxAttempts = 3)
public UpdateCheckResponse checkForUpdates(String currentVersion)

private Path downloadUpdatePackage(String downloadUrl)
private boolean validateChecksum(Path filePath, String expectedChecksum)
private Path extractUpdatePackage(Path zipFile)
private void applyUpdate(Path updateDir, UpdateCheckResponse updateCheck)

// Liquibase
private void applyLiquibaseMigrations(Path migrationsDir)

// Import data
private void importExercises(Path exercisesFile)
private void importPhishingTemplates(Path templatesFile)

// Telemetry
private TelemetryData collectTelemetryData()
@Retryable(retryFor = RestClientException.class, maxAttempts = 2)
private void sendTelemetry(TelemetryData telemetry)

// Health & Metrics
private Double calculateAverageAILatency()
private boolean checkSystemHealth()

// Version management
private String getCurrentVersion()
private void updateCurrentVersion(String newVersion)

// Manual triggers (for testing)
public void triggerManualUpdateCheck()
public void triggerManualTelemetryPush()
```

**DTOs inclus:**

```java
// Response from central server
public static class UpdateCheckResponse {
    private boolean updateAvailable;
    private String latestVersion;
    private String downloadUrl;
    private String checksum; // SHA-256
    private String releaseNotes;
}

// Telemetry data sent to central
public static class TelemetryData {
    private String tenantId;
    private String version;
    private LocalDateTime timestamp;
    private long userCount;
    private long exercisesCompletedToday;
    private Double aiResponseLatencyMs;
    private boolean healthy;
}
```

### 2. **SyncController.java** (80+ lignes)

**Endpoints:**

```java
// Trigger manual update check (Admin only)
POST /api/sync/update/check
→ Response: {"status": "accepted", "message": "Update check started"}

// Trigger manual telemetry push (Admin only)
POST /api/sync/telemetry/push
→ Response: {"status": "success", "message": "Telemetry pushed"}

// Get sync status (Admin only)
GET /api/sync/status
→ Response: {
    "enabled": true,
    "lastUpdateCheck": "2024-11-24T03:00:00",
    "lastTelemetryPush": "2024-11-24T09:00:00",
    "currentVersion": "1.0.0"
  }
```

### 3. **SyncConfig.java**

```java
@Configuration
@EnableScheduling  // Enable @Scheduled support
@EnableRetry       // Enable @Retryable support

@Bean
public RestTemplate restTemplate(RestTemplateBuilder builder) {
    return builder
        .setConnectTimeout(Duration.ofSeconds(30))
        .setReadTimeout(Duration.ofSeconds(60))
        .build();
}
```

### 4. **Configuration (application.yml)**

```yaml
cybersensei:
  sync:
    enabled: ${SYNC_ENABLED:false}
    central-url: ${CENTRAL_URL:https://central.cybersensei.io}
    tenant-id: ${TENANT_ID:demo}
    nightly-cron: ${SYNC_CRON:0 0 3 * * *}  # 3:00 AM daily
    telemetry-interval: ${TELEMETRY_INTERVAL:900000}  # 15 minutes (in ms)
```

---

## ⚙️ Configuration

### Variables d'Environnement

```bash
# Enable sync
export SYNC_ENABLED=true

# Central server URL
export CENTRAL_URL=https://central.cybersensei.io

# Tenant identifier
export TENANT_ID=my-company-123

# Optional: Custom cron schedule (default: 3 AM)
export SYNC_CRON="0 0 3 * * *"

# Optional: Telemetry interval in ms (default: 15 min)
export TELEMETRY_INTERVAL=900000
```

### Configuration DB (configs table)

```sql
-- API key for authentication
INSERT INTO configs (config_key, config_value) VALUES 
('sync.api_key', 'your-api-key-here');

-- Current system version
INSERT INTO configs (config_key, config_value) VALUES 
('system.version', '1.0.0');

-- Last update check result (automatically updated)
INSERT INTO configs (config_key, config_value) VALUES 
('system.last_update_check', '{"timestamp":"2024-11-24T03:00:00","version":"1.0.0","success":true}');
```

---

## 🔒 Sécurité & Retry Logic

### 1. **Checksum Validation (SHA-256)**

```java
// Calculate checksum of downloaded file
MessageDigest md = MessageDigest.getInstance("SHA-256");
// ... hash file bytes ...
String actualChecksum = bytesToHex(md.digest());

// Compare with expected checksum
if (!actualChecksum.equalsIgnoreCase(expectedChecksum)) {
    throw new SecurityException("Checksum validation failed");
}
```

### 2. **Automatic Retry with @Retryable**

```java
@Retryable(
    retryFor = {RestClientException.class},
    maxAttempts = 3,
    backoff = @Backoff(delay = 5000, multiplier = 2)
)
public UpdateCheckResponse checkForUpdates(String currentVersion) {
    // HTTP call to central server
    // If fails, Spring Retry will:
    //   Attempt 1: immediate
    //   Attempt 2: wait 5s
    //   Attempt 3: wait 10s (5s * 2)
}
```

### 3. **Bearer Token Authentication**

```java
HttpHeaders headers = new HttpHeaders();
headers.set("Authorization", "Bearer " + getTenantApiKey());
headers.set("X-Tenant-ID", tenantId);
```

---

## 📦 Update Package Structure

### Expected ZIP Structure

```
update_1.0.1.zip
├── migrations/
│   └── changelog.xml           ← Liquibase migrations
├── exercises.json              ← New exercises to import
├── phishing_templates.json     ← New phishing templates
└── README.txt                  ← Release notes
```

### Example: migrations/changelog.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
         http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd">

    <changeSet id="1.0.1-add-column" author="cybersensei">
        <addColumn tableName="users">
            <column name="last_sync" type="TIMESTAMP"/>
        </addColumn>
    </changeSet>
</databaseChangeLog>
```

### Example: exercises.json

```json
[
  {
    "topic": "SQL Injection",
    "type": "MCQ",
    "difficulty": "HARD",
    "payloadJSON": {
      "question": "Which of the following is a valid SQL injection attack?",
      "options": [
        "' OR '1'='1",
        "DROP TABLE users;",
        "SELECT * FROM users",
        "UPDATE users SET role='admin'"
      ],
      "correctAnswer": 0,
      "explanation": "Classic SQL injection using OR condition."
    }
  }
]
```

---

## 🧪 Tests

### Test Manuel

```bash
# 1. Enable sync
export SYNC_ENABLED=true
export CENTRAL_URL=https://central.cybersensei.io
export TENANT_ID=demo

# 2. Trigger update check manually
curl -X POST http://localhost:8080/api/sync/update/check \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN"

# 3. Trigger telemetry push manually
curl -X POST http://localhost:8080/api/sync/telemetry/push \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN"

# 4. Check sync status
curl http://localhost:8080/api/sync/status \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN"
```

### Mock Central Server (for testing)

```bash
# Create mock server with json-server or similar
npm install -g json-server

# db.json
cat > db.json <<EOF
{
  "updates": {
    "updateAvailable": true,
    "latestVersion": "1.0.1",
    "downloadUrl": "http://localhost:3001/download/update.zip",
    "checksum": "abc123...",
    "releaseNotes": "Bug fixes and improvements"
  }
}
EOF

# Start mock server
json-server --watch db.json --port 3001

# Test
curl "http://localhost:3001/updates?tenantId=demo&version=1.0.0"
```

---

## 📊 Monitoring & Logs

### Logs Clés

```log
# Nightly update check
2024-11-24 03:00:00 - 🔄 Starting nightly update check
2024-11-24 03:00:01 - Current version: 1.0.0
2024-11-24 03:00:02 - ✅ System is up to date

# Update available
2024-11-24 03:00:00 - 🔄 Starting nightly update check
2024-11-24 03:00:01 - Current version: 1.0.0
2024-11-24 03:00:02 - 🆕 Update available: 1.0.0 -> 1.0.1
2024-11-24 03:00:03 - 📥 Downloading update package from: https://...
2024-11-24 03:00:10 - ✅ Downloaded 1024000 bytes
2024-11-24 03:00:11 - ✅ Checksum validated successfully
2024-11-24 03:00:12 - 📦 Extracting update package
2024-11-24 03:00:15 - 🔧 Applying update...
2024-11-24 03:00:16 - 🔄 Applying Liquibase migrations
2024-11-24 03:00:20 - ✅ Liquibase migrations applied successfully
2024-11-24 03:00:21 - ✅ Update applied successfully: 1.0.1

# Telemetry push
2024-11-24 09:00:00 - 📊 Pushing telemetry data...
2024-11-24 09:00:01 - Telemetry: users=50, exercises=12, aiLatency=250.0ms, healthy=true
2024-11-24 09:00:02 - ✅ Telemetry pushed successfully

# Errors (with retry)
2024-11-24 03:00:00 - Failed to check for updates (attempt will retry): Connection timeout
2024-11-24 03:00:05 - Failed to check for updates (attempt will retry): Connection timeout
2024-11-24 03:00:15 - ❌ Error during update check: Connection timeout
```

---

## 🔧 Customization

### Modifier la Fréquence des Jobs

```yaml
# Check every hour instead of daily
cybersensei:
  sync:
    nightly-cron: "0 0 * * * *"  # Every hour

# Push telemetry every 5 minutes
cybersensei:
  sync:
    telemetry-interval: 300000  # 5 minutes (in ms)
```

### Ajouter de Nouveaux Types de Données à Synchroniser

```java
// Dans applyUpdate()
Path customDataFile = updateDir.resolve("custom_data.json");
if (Files.exists(customDataFile)) {
    importCustomData(customDataFile);
}

private void importCustomData(Path dataFile) throws IOException {
    log.info("📦 Importing custom data from: {}", dataFile);
    String content = Files.readString(dataFile);
    // Parse and import
    log.info("✅ Custom data imported successfully");
}
```

---

## 🚨 Troubleshooting

### Erreur: "Failed to connect to central server"

**Solution:**
1. Vérifier `CENTRAL_URL` est correct
2. Vérifier la connectivité réseau
3. Vérifier les firewall rules
4. Tester manuellement:
```bash
curl https://central.cybersensei.io/api/updates/check
```

### Erreur: "Checksum validation failed"

**Solution:**
1. Le fichier téléchargé est corrompu
2. Vérifier l'intégrité côté serveur central
3. Re-télécharger le package
4. Vérifier le checksum manuellement:
```bash
sha256sum update.zip
```

### Erreur: "Liquibase migrations failed"

**Solution:**
1. Vérifier le format du changelog.xml
2. Vérifier les permissions DB
3. Vérifier les logs Liquibase détaillés
4. Rollback si nécessaire

### Telemetry n'est pas envoyée

**Solution:**
1. Vérifier `SYNC_ENABLED=true`
2. Vérifier `sync.api_key` dans configs
3. Vérifier les logs pour erreurs
4. Trigger manuellement pour tester

---

## 📚 Dépendances Ajoutées

### pom.xml

```xml
<!-- Retry -->
<dependency>
    <groupId>org.springframework.retry</groupId>
    <artifactId>spring-retry</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-aspects</artifactId>
</dependency>

<!-- Already present -->
<!-- Liquibase -->
<dependency>
    <groupId>org.liquibase</groupId>
    <artifactId>liquibase-core</artifactId>
</dependency>

<!-- HTTP Client -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

---

## ✅ Checklist Production

- [ ] `SYNC_ENABLED=true` configuré
- [ ] `CENTRAL_URL` pointe vers serveur de production
- [ ] `TENANT_ID` unique et enregistré côté central
- [ ] `sync.api_key` configuré en DB
- [ ] Firewall autorise connexion vers central server
- [ ] Tests manuels update/telemetry réussis
- [ ] Monitoring logs activé
- [ ] Alertes configurées pour échecs de sync
- [ ] Backup DB avant appliquer mises à jour
- [ ] Rollback plan documenté

---

## 📊 API Centrale (Central Server)

### Endpoints Requis

**1. Check for Updates**
```http
GET /api/updates/check?tenantId={id}&version={version}
Authorization: Bearer {api_key}

Response 200:
{
  "updateAvailable": true,
  "latestVersion": "1.0.1",
  "downloadUrl": "https://cdn.cybersensei.io/updates/1.0.1.zip",
  "checksum": "sha256:abc123...",
  "releaseNotes": "Bug fixes and new features"
}
```

**2. Download Update Package**
```http
GET /download/{package_id}
Authorization: Bearer {api_key}

Response 200:
Content-Type: application/zip
[Binary ZIP data]
```

**3. Push Telemetry**
```http
POST /api/telemetry
Authorization: Bearer {api_key}
Content-Type: application/json

Request:
{
  "tenantId": "demo",
  "version": "1.0.0",
  "timestamp": "2024-11-24T09:00:00",
  "userCount": 50,
  "exercisesCompletedToday": 12,
  "aiResponseLatencyMs": 250.0,
  "healthy": true
}

Response 200:
{
  "status": "success",
  "message": "Telemetry received"
}
```

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Date**: 2024-11-24


