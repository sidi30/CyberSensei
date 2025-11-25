# CyberSensei Database - PostgreSQL 15

Schéma de base de données complet pour la plateforme CyberSensei.

## 🏗️ Architecture

### Tables (9 + 1 logs)

| Table | Description | Lignes estimées |
|-------|-------------|-----------------|
| `users` | Utilisateurs avec MS Teams ID | 100-1000 |
| `exercises` | Exercices et quiz | 50-500 |
| `user_exercise_results` | Résultats utilisateurs | 10k-100k |
| `ai_profiles` | Profils d'apprentissage IA | 100-1000 |
| `company_metrics` | Métriques agrégées | 365+ (daily) |
| `phishing_templates` | Templates emails phishing | 10-50 |
| `phishing_campaigns` | Campagnes envoyées | 100-1000 |
| `phishing_trackers` | Tracking individuel | 10k-100k |
| `configs` | Configuration dynamique | 20-100 |
| `logs` | Logs applicatifs | 100k-1M |

### Extensions PostgreSQL

- ✅ `uuid-ossp` - Génération UUID
- ✅ `pgcrypto` - Fonctions cryptographiques
- ✅ `pg_trgm` - Recherche floue
- ✅ `unaccent` - Full-text search
- ✅ `btree_gin` - Indexation avancée

## 🚀 Quick Start

### Option 1: Docker Compose (Recommandé)

```bash
cd database
docker-compose -f docker-compose-db.yml up -d
```

Services lancés :
- **PostgreSQL 15** sur port `5432`
- **PgAdmin 4** sur port `5050`

### Option 2: Docker Build Manuel

```bash
cd database
docker build -t cybersensei-postgres:latest .
docker run -d \
  --name cybersensei-postgres \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=cybersensei123 \
  -v postgres-data:/var/lib/postgresql/data \
  cybersensei-postgres:latest
```

### Connexion

```bash
# psql
psql -h localhost -U cybersensei -d cybersensei

# PgAdmin
open http://localhost:5050
# Email: admin@cybersensei.io
# Password: admin123
```

## 📊 Schéma Détaillé

### Users
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    ms_teams_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,  -- EMPLOYEE, MANAGER, ADMIN
    department VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    password_hash VARCHAR(1000)
);
```

### Exercises
```sql
CREATE TABLE exercises (
    id BIGSERIAL PRIMARY KEY,
    topic VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,  -- QUIZ, SIMULATION, SCENARIO, CHALLENGE
    difficulty VARCHAR(50) NOT NULL,  -- BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    payload_json JSONB NOT NULL,  -- Question, options, correctAnswer, explanation
    active BOOLEAN NOT NULL DEFAULT true
);
```

### User Exercise Results
```sql
CREATE TABLE user_exercise_results (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    exercise_id BIGINT NOT NULL REFERENCES exercises(id),
    score DOUBLE PRECISION NOT NULL,  -- 0.0 to 100.0
    success BOOLEAN NOT NULL,
    duration INTEGER NOT NULL,  -- seconds
    details_json JSONB,
    date TIMESTAMP NOT NULL
);
```

### AI Profiles
```sql
CREATE TABLE ai_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id),
    style VARCHAR(255) NOT NULL,  -- visual, practical, theoretical
    weaknesses_json JSONB,  -- {"phishing": 30, "passwords": 15}
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);
```

### Company Metrics
```sql
CREATE TABLE company_metrics (
    id BIGSERIAL PRIMARY KEY,
    score DOUBLE PRECISION NOT NULL,  -- 0-100
    risk_level VARCHAR(50) NOT NULL,  -- LOW, MEDIUM, HIGH, CRITICAL
    updated_at TIMESTAMP NOT NULL,
    average_quiz_score DOUBLE PRECISION,
    phishing_click_rate DOUBLE PRECISION,
    active_users INTEGER,
    completed_exercises INTEGER
);
```

### Phishing Templates
```sql
CREATE TABLE phishing_templates (
    id BIGSERIAL PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT NOT NULL,
    subject VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL,  -- SPEAR_PHISHING, WHALING, etc.
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL
);
```

### Phishing Campaigns
```sql
CREATE TABLE phishing_campaigns (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES phishing_templates(id),
    sent_at TIMESTAMP NOT NULL,
    total_sent INTEGER NOT NULL,
    total_clicked INTEGER NOT NULL DEFAULT 0,
    total_opened INTEGER NOT NULL DEFAULT 0,
    total_reported INTEGER NOT NULL DEFAULT 0
);
```

### Phishing Trackers
```sql
CREATE TABLE phishing_trackers (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id),
    campaign_id BIGINT NOT NULL REFERENCES phishing_campaigns(id),
    clicked BOOLEAN NOT NULL DEFAULT false,
    clicked_at TIMESTAMP,
    opened BOOLEAN NOT NULL DEFAULT false,
    opened_at TIMESTAMP,
    reported BOOLEAN NOT NULL DEFAULT false,
    reported_at TIMESTAMP,
    sent_at TIMESTAMP NOT NULL
);
```

### Configs
```sql
CREATE TABLE configs (
    id BIGSERIAL PRIMARY KEY,
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description VARCHAR(500),
    updated_at TIMESTAMP
);
```

### Logs (NEW)
```sql
CREATE TABLE logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    level VARCHAR(20) NOT NULL,  -- INFO, WARN, ERROR, DEBUG
    logger VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    thread VARCHAR(100),
    user_id BIGINT REFERENCES users(id),
    request_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    endpoint VARCHAR(255),
    method VARCHAR(10),  -- GET, POST, etc.
    status_code INTEGER,
    duration_ms INTEGER,
    exception TEXT,
    stack_trace TEXT
);
```

## 🌱 Données de Seed

### 1. Admin Config (`01-seed-admin-config.sql`)
- ✅ 3 utilisateurs par défaut (admin, manager, employee)
- ✅ 20+ configurations système
- ✅ Mots de passe : `Admin@123` (BCrypt)

### 2. Exercises (`02-seed-exercises.sql`)
- ✅ 15 exercices couvrant :
  - Phishing (3 exercices)
  - Passwords (3 exercices)
  - Social Engineering (3 exercices)
  - Data Protection (2 exercices)
  - Network Security (2 exercices)
  - Ransomware (1 exercice)
  - Cloud Security (1 exercice)

### 3. Phishing Templates (`03-seed-phishing-templates.sql`)
- ✅ 6 templates HTML professionnels :
  1. Réinitialisation urgente
  2. Facture impayée
  3. Support technique
  4. Livraison colis
  5. CEO Fraud
  6. Microsoft 365 Alert

### 4. Demo Data (`04-seed-demo-data.sql`)
- ✅ 5 utilisateurs supplémentaires
- ✅ 240+ résultats d'exercices (30 jours)
- ✅ 1 campagne phishing avec tracking
- ✅ Métriques initiales
- ✅ Logs d'exemple

## 🔐 Sécurité

### Rôles PostgreSQL

```sql
-- Read-only (rapports)
cybersensei_readonly

-- Application (full access)
cybersensei
```

### Mots de Passe

**⚠️ PRODUCTION : Changer tous les mots de passe !**

```bash
# Défaut (DEV ONLY)
POSTGRES_PASSWORD=cybersensei123

# Production
POSTGRES_PASSWORD=$(openssl rand -base64 32)
```

### Connexions

```sql
-- postgresql.conf
max_connections = 100
password_encryption = scram-sha-256
```

## 📈 Performance

### Indexes Créés

```sql
-- Users
idx_user_email
idx_user_ms_teams_id

-- Exercises
idx_exercise_type
idx_exercise_difficulty

-- Results
idx_result_user
idx_result_exercise
idx_result_date

-- Phishing
idx_tracker_token (unique)
idx_tracker_user
idx_tracker_campaign

-- Logs
idx_logs_timestamp
idx_logs_level
idx_logs_user_id
idx_logs_request_id
```

### Configuration Optimisée

```conf
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB
maintenance_work_mem = 64MB
```

## 🔄 Migrations Liquibase

### Fichiers

```
db/changelog/
├── db.changelog-master.xml
└── changes/
    ├── 001-create-users-table.xml
    ├── 002-create-exercises-table.xml
    ├── 003-create-user-exercise-results-table.xml
    ├── 004-create-ai-profiles-table.xml
    ├── 005-create-company-metrics-table.xml
    ├── 006-create-phishing-templates-table.xml
    ├── 007-create-phishing-campaigns-table.xml
    ├── 008-create-phishing-trackers-table.xml
    ├── 009-create-configs-table.xml
    ├── 010-insert-sample-data.xml
    └── 011-create-logs-table.xml
```

### Exécution

```bash
# Automatique au démarrage Spring Boot
mvn spring-boot:run

# Manuel
mvn liquibase:update
mvn liquibase:rollback -Dliquibase.rollbackCount=1
```

## 🛠️ Maintenance

### Backup

```bash
# Backup complet
docker exec cybersensei-postgres pg_dump -U cybersensei cybersensei > backup_$(date +%Y%m%d).sql

# Backup avec compression
docker exec cybersensei-postgres pg_dump -U cybersensei cybersensei | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restore

```bash
# Restore from backup
docker exec -i cybersensei-postgres psql -U cybersensei cybersensei < backup.sql
```

### Vacuum

```bash
# Maintenance automatique via autovacuum (configuré)
# Manuel si besoin
docker exec cybersensei-postgres psql -U cybersensei -d cybersensei -c "VACUUM ANALYZE;"
```

## 📊 Monitoring

### Queries Lentes

```sql
-- Enable log_min_duration_statement in postgresql.conf
-- ou
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```

### Taille des Tables

```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Connexions Actives

```sql
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query
FROM pg_stat_activity
WHERE datname = 'cybersensei';
```

## 🐛 Troubleshooting

### Connection Refused

```bash
# Vérifier que le conteneur tourne
docker ps | grep postgres

# Vérifier les logs
docker logs cybersensei-postgres
```

### Permission Denied

```bash
# Vérifier les permissions du volume
docker exec cybersensei-postgres ls -la /var/lib/postgresql/data
```

### Slow Queries

```sql
-- Analyser une requête
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

## 📚 Documentation

- [PostgreSQL 15 Documentation](https://www.postgresql.org/docs/15/)
- [Liquibase Documentation](https://docs.liquibase.com/)
- [PgAdmin Documentation](https://www.pgadmin.org/docs/)

---

**Version**: 1.0.0  
**PostgreSQL**: 15 Alpine  
**Auteur**: CyberSensei Team  
**Support**: database@cybersensei.io


