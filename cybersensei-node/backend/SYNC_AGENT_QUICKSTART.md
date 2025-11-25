# 🚀 SyncAgent - Guide Rapide (5 minutes)

## ⚡ Configuration Express

### 1. Variables d'Environnement

```bash
# Enable sync agent
export SYNC_ENABLED=true

# Central server URL
export CENTRAL_URL=https://central.cybersensei.io

# Unique tenant identifier
export TENANT_ID=my-company-demo

# Optional: Custom schedules
export SYNC_CRON="0 0 3 * * *"          # 3 AM daily (default)
export TELEMETRY_INTERVAL=900000         # 15 minutes in ms (default)
```

### 2. Configuration DB

```sql
-- API key for authentication avec central server
INSERT INTO configs (config_key, config_value, description) VALUES 
('sync.api_key', 'your-secret-api-key-here', 'API key for central server authentication');

-- Current system version (will be auto-updated)
INSERT INTO configs (config_key, config_value, description) VALUES 
('system.version', '1.0.0', 'Current system version');
```

### 3. Lancer l'Application

```bash
# Build
mvn clean package -DskipTests

# Run
java -jar target/cybersensei-node-backend-1.0.0.jar

# Verify sync is enabled in logs
tail -f logs/cybersensei.log | grep -i sync
```

---

## 🧪 Test Rapide

### Test 1: Trigger Update Check (Manuel)

```bash
# Get admin JWT token first
JWT_TOKEN="your-admin-jwt-token"

# Trigger update check
curl -X POST http://localhost:8080/api/sync/update/check \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"

# Expected response:
{
  "status": "accepted",
  "message": "Update check started. Check logs for progress."
}

# Check logs
tail -f logs/cybersensei.log | grep "update check"
```

### Test 2: Trigger Telemetry Push (Manuel)

```bash
# Trigger telemetry
curl -X POST http://localhost:8080/api/sync/telemetry/push \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"

# Expected response:
{
  "status": "success",
  "message": "Telemetry pushed successfully"
}
```

### Test 3: Check Sync Status

```bash
curl http://localhost:8080/api/sync/status \
  -H "Authorization: Bearer $JWT_TOKEN"

# Expected response:
{
  "enabled": true,
  "lastUpdateCheck": "2024-11-24T03:00:00",
  "lastTelemetryPush": "2024-11-24T09:00:00",
  "currentVersion": "1.0.0"
}
```

---

## 📊 Scheduled Jobs

### Job 1: Nightly Update Check

**Schedule:** Tous les jours à 03:00 AM  
**Durée:** 1-5 minutes (dépend de la taille de l'update)  
**Actions:**
1. Check si mise à jour disponible
2. Download ZIP si update disponible
3. Validate checksum SHA-256
4. Extract package
5. Apply Liquibase migrations
6. Import exercises/templates
7. Update version in DB

**Logs à surveiller:**
```log
2024-11-24 03:00:00 - 🔄 Starting nightly update check
2024-11-24 03:00:01 - Current version: 1.0.0
2024-11-24 03:00:02 - ✅ System is up to date
```

### Job 2: Telemetry Push

**Schedule:** Toutes les 15 minutes  
**Durée:** < 1 seconde  
**Données envoyées:**
- `tenantId`: Identifiant unique
- `version`: Version actuelle
- `userCount`: Nombre d'utilisateurs
- `exercisesCompletedToday`: Exercices complétés aujourd'hui
- `aiResponseLatencyMs`: Latence moyenne AI
- `healthy`: État de santé du système

**Logs à surveiller:**
```log
2024-11-24 09:00:00 - 📊 Pushing telemetry data...
2024-11-24 09:00:01 - Telemetry: users=50, exercises=12, aiLatency=250.0ms, healthy=true
2024-11-24 09:00:02 - ✅ Telemetry pushed successfully
```

---

## 🗂️ Structure d'un Update Package

```
update_1.0.1.zip
├── migrations/
│   └── changelog.xml          ← Liquibase migrations (optionnel)
├── exercises.json             ← Nouveaux exercices (optionnel)
├── phishing_templates.json    ← Nouveaux templates (optionnel)
└── README.txt                 ← Release notes
```

---

## 🔄 Flow Complet - Scénario Typique

### Scénario: Mise à Jour 1.0.0 → 1.0.1

**03:00 AM - Job scheduled démarre**
```
1. GET /api/updates/check?tenantId=demo&version=1.0.0
   → Response: {"updateAvailable": true, "latestVersion": "1.0.1", ...}

2. Download update_1.0.1.zip (5 MB)
   → Saved to: updates/update_1732425600000.zip

3. Validate checksum
   → Expected: abc123...
   → Actual:   abc123...
   → ✅ Valid

4. Extract to: updates/extract_1732425600000/
   → migrations/changelog.xml
   → exercises.json
   → phishing_templates.json

5. Apply Liquibase migrations
   → Running: 001-add-column-last-sync.xml
   → ✅ Migration complete

6. Import 5 new exercises
   → ✅ Imported successfully

7. Import 2 new phishing templates
   → ✅ Imported successfully

8. Update version: 1.0.0 → 1.0.1
   → ✅ Version updated in DB

9. Cleanup temp files
   → Deleted: updates/update_1732425600000.zip
   → Deleted: updates/extract_1732425600000/

✅ Update complete (duration: 2 minutes)
```

---

## 🔒 Sécurité

### 1. Checksum Validation (SHA-256)

```bash
# Génération checksum côté serveur central
sha256sum update_1.0.1.zip
# Output: abc123def456... update_1.0.1.zip

# Validation côté node
- Download ZIP
- Calculate SHA-256
- Compare avec checksum fourni
- ❌ Si différent: rejeter update
- ✅ Si identique: continuer
```

### 2. Retry Logic (Automatic)

```
Tentative 1: Immediate
    ↓ (fail)
Wait 5 seconds
    ↓
Tentative 2: After 5s
    ↓ (fail)
Wait 10 seconds (5s × 2)
    ↓
Tentative 3: After 10s
    ↓ (fail)
❌ Give up & log error
```

### 3. Authentication

```bash
# Toutes les requêtes incluent:
Authorization: Bearer {api_key}
X-Tenant-ID: {tenant_id}
```

---

## 🚨 Troubleshooting Express

| Problème | Solution |
|----------|----------|
| Sync pas actif | Vérifier `SYNC_ENABLED=true` |
| Connection refused | Vérifier `CENTRAL_URL` et firewall |
| Unauthorized | Vérifier `sync.api_key` en DB |
| Checksum failed | Re-download ou contacter support |
| Migration failed | Check logs Liquibase, rollback si besoin |
| Telemetry non envoyée | Vérifier API key et logs |

---

## 📝 Logs Importants

### Success Logs

```log
✅ System is up to date (version: 1.0.0)
✅ Checksum validated successfully
✅ Liquibase migrations applied successfully
✅ Update applied successfully: 1.0.1
✅ Telemetry pushed successfully
```

### Warning Logs

```log
⚠️ No checksum provided, skipping validation
⚠️ No changelog.xml found in migrations directory
⚠️ Failed to push telemetry: Connection timeout
```

### Error Logs

```log
❌ Checksum validation failed for update package
❌ Error during update check: Connection refused
❌ Failed to apply Liquibase migrations: Syntax error
```

---

## 🎯 Commandes Utiles

```bash
# Voir les logs sync uniquement
tail -f logs/cybersensei.log | grep -i sync

# Voir les logs update uniquement
tail -f logs/cybersensei.log | grep -i "update"

# Voir les logs telemetry uniquement
tail -f logs/cybersensei.log | grep -i "telemetry"

# Forcer un update check immédiat (admin)
curl -X POST http://localhost:8080/api/sync/update/check \
  -H "Authorization: Bearer $JWT_TOKEN"

# Forcer un telemetry push immédiat (admin)
curl -X POST http://localhost:8080/api/sync/telemetry/push \
  -H "Authorization: Bearer $JWT_TOKEN"

# Vérifier version actuelle
psql -U cybersensei -d cybersensei -c "SELECT * FROM configs WHERE config_key = 'system.version';"
```

---

## 📦 Mock Central Server (Pour Tests)

### Option 1: JSON Server

```bash
# Install
npm install -g json-server

# Create db.json
cat > db.json <<EOF
{
  "updates": {
    "updateAvailable": false,
    "latestVersion": "1.0.0",
    "downloadUrl": "",
    "checksum": "",
    "releaseNotes": "No updates available"
  }
}
EOF

# Start
json-server --watch db.json --port 3001

# Configure node
export CENTRAL_URL=http://localhost:3001
```

### Option 2: Python HTTP Server

```python
# server.py
from flask import Flask, jsonify
app = Flask(__name__)

@app.route('/api/updates/check')
def check_updates():
    return jsonify({
        "updateAvailable": False,
        "latestVersion": "1.0.0",
        "downloadUrl": "",
        "checksum": "",
        "releaseNotes": "No updates"
    })

@app.route('/api/telemetry', methods=['POST'])
def telemetry():
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(port=3001)
```

```bash
# Run
python server.py

# Configure node
export CENTRAL_URL=http://localhost:3001
```

---

## ✅ Checklist Rapide

### Configuration Initiale
- [ ] `SYNC_ENABLED=true`
- [ ] `CENTRAL_URL` configuré
- [ ] `TENANT_ID` configuré
- [ ] `sync.api_key` en DB
- [ ] Firewall autorise connexions sortantes
- [ ] Application redémarrée

### Vérification
- [ ] Logs montrent "sync enabled"
- [ ] Trigger manuel update check → success
- [ ] Trigger manuel telemetry push → success
- [ ] Logs scheduled jobs apparaissent
- [ ] Monitoring configuré

### Production
- [ ] Backup DB avant updates
- [ ] Alertes configurées
- [ ] Rollback plan documenté
- [ ] Tests update complet effectués
- [ ] Support contacté si problèmes

---

**Status**: ✅ Ready to Use  
**Version**: 1.0.0  
**Date**: 2024-11-24


