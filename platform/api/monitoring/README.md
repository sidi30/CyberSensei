# 🔍 CyberSensei Central - Monitoring Stack

Stack de monitoring complet avec Prometheus, Grafana, Alertmanager et exporters.

---

## 🎯 Vue d'Ensemble

Le stack de monitoring inclut :
- **Prometheus** - Collecte et stockage des métriques
- **Grafana** - Visualisation et dashboards
- **Alertmanager** - Gestion des alertes
- **Node Exporter** - Métriques système (CPU, RAM, disk)
- **Postgres Exporter** - Métriques PostgreSQL
- **cAdvisor** - Métriques containers Docker

---

## 📦 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MONITORING STACK                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │             PROMETHEUS (port 9090)              │   │
│  │  - Scrape metrics from all targets             │   │
│  │  - Store time-series data                      │   │
│  │  - Evaluate alert rules                        │   │
│  └──────────────────┬──────────────────────────────┘   │
│                     │                                   │
│  ┌──────────────────▼──────────────────┐                │
│  │    ALERTMANAGER (port 9093)        │                │
│  │  - Receive alerts from Prometheus  │                │
│  │  - Group & route notifications     │                │
│  │  - Send to: Email, Slack, etc.    │                │
│  └────────────────────────────────────┘                │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              GRAFANA (port 3002)                │   │
│  │  - Visualize metrics                           │   │
│  │  - Pre-configured dashboards                   │   │
│  │  - Alerting & notifications                    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │                 EXPORTERS                        │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  Node Exporter (9100)    - System metrics       │  │
│  │  Postgres Exporter (9187) - DB metrics          │  │
│  │  cAdvisor (8080)         - Container metrics    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Scrape
                          ▼
        ┌─────────────────────────────────────┐
        │    NestJS Backend (port 3000)       │
        │    GET /metrics                     │
        │    - Custom app metrics             │
        │    - HTTP requests                  │
        │    - Tenant telemetry               │
        │    - License expiry                 │
        └─────────────────────────────────────┘
```

---

## 🚀 Installation & Démarrage

### Prérequis

- Docker & Docker Compose installés
- Backend NestJS configuré
- PostgreSQL en cours d'exécution

### 1. Ajouter prom-client au backend

```bash
cd ../
npm install prom-client @types/prom-client
```

### 2. Configurer le backend

Modifier `src/app.module.ts` pour importer le MetricsModule :

```typescript
import { MetricsModule } from './modules/metrics/metrics.module';

@Module({
  imports: [
    // ... autres modules
    MetricsModule,
  ],
})
export class AppModule implements NestMiddleware {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MetricsMiddleware)
      .forRoutes('*');
  }
}
```

### 3. Configurer PostgreSQL Exporter

Modifier `docker-compose.monitoring.yml` ligne 85 :

```yaml
DATA_SOURCE_NAME: 'postgresql://USERNAME:PASSWORD@HOST:5432/DATABASE?sslmode=disable'
```

### 4. Démarrer le stack

```bash
cd monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

### 5. Vérifier les services

```bash
docker-compose -f docker-compose.monitoring.yml ps
```

Tous les services doivent être "Up".

---

## 🔗 Accès aux Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Grafana** | http://localhost:3002 | admin / admin123 |
| **Prometheus** | http://localhost:9090 | - |
| **Alertmanager** | http://localhost:9093 | - |
| **Node Exporter** | http://localhost:9100/metrics | - |
| **Postgres Exporter** | http://localhost:9187/metrics | - |
| **cAdvisor** | http://localhost:8080 | - |

---

## 📊 Dashboards Grafana

### 1. Central System Health

Vue d'ensemble de la santé du système :
- ✅ Backend uptime & status
- ✅ API latency (p50, p95, p99)
- ✅ HTTP requests rate
- ✅ Error rate
- ✅ Memory & CPU usage
- ✅ Active alerts

### 2. Node Clients Activity

Activité des tenants (clients) :
- ✅ Tenants by health status
- ✅ Active users per tenant
- ✅ Exercises completed
- ✅ AI latency per tenant
- ✅ Last telemetry received
- ✅ Tenants without telemetry (24h)

### 3. Database Performance

Performance PostgreSQL :
- ✅ Database connections
- ✅ Query rate
- ✅ Transaction rate
- ✅ Cache hit ratio
- ✅ Database size
- ✅ Dead tuples
- ✅ Slow queries

### Import des Dashboards

Les dashboards sont automatiquement provisionnés au démarrage de Grafana. Si besoin de les réimporter :

1. Ouvrir Grafana : http://localhost:3002
2. Login : admin / admin123
3. Dashboards → Browse
4. Les dashboards apparaissent dans la liste

---

## 🚨 Alertes Configurées

### Backend Alerts

| Alert | Condition | Severity | Duration |
|-------|-----------|----------|----------|
| **BackendDown** | Backend unreachable | Critical | 1 min |
| **HighAPILatency** | P95 latency > 1s | Warning | 5 min |
| **HighErrorRate** | Error rate > 5% | Warning | 5 min |
| **HighMemoryUsage** | Memory > 2GB | Warning | 10 min |
| **HighCPUUsage** | CPU > 80% | Warning | 10 min |

### Telemetry Alerts

| Alert | Condition | Severity | Duration |
|-------|-----------|----------|----------|
| **NoTelemetryReceived** | No data for 24h | Critical | 5 min |
| **TenantCriticalHealth** | Tenant in critical state | Critical | 10 min |
| **HighAILatency** | AI latency > 1000ms | Warning | 15 min |
| **LowActiveUsers** | < 1 active user for 2h | Warning | 2 hours |

### Database Alerts

| Alert | Condition | Severity | Duration |
|-------|-----------|----------|----------|
| **PostgreSQLDown** | DB unreachable | Critical | 1 min |
| **HighDatabaseConnections** | Connections > 80% | Warning | 5 min |
| **SlowQueries** | Query efficiency < 10% | Warning | 10 min |
| **HighDeadTuples** | Dead tuples > 10k | Warning | 30 min |

### System Alerts

| Alert | Condition | Severity | Duration |
|-------|-----------|----------|----------|
| **HostHighCPU** | CPU > 80% | Warning | 10 min |
| **HostHighMemory** | Memory > 85% | Warning | 10 min |
| **HostLowDiskSpace** | Disk < 10% | Critical | 5 min |
| **HostHighDiskIO** | High disk I/O | Warning | 10 min |

### License Alerts

| Alert | Condition | Severity | Duration |
|-------|-----------|----------|----------|
| **LicenseExpiringSoon** | Expires in < 7 days | Warning | 1 hour |
| **LicenseExpired** | License expired | Critical | 1 hour |

---

## 📧 Configuration des Notifications

### Email (SMTP)

Modifier `alertmanager/alertmanager.yml` :

```yaml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@cybersensei.com'
  smtp_auth_username: 'your-email@gmail.com'
  smtp_auth_password: 'your-app-password'
  smtp_require_tls: true
```

**Avec Gmail** :
1. Activer l'authentification à 2 facteurs
2. Générer un "mot de passe d'application"
3. Utiliser ce mot de passe dans `smtp_auth_password`

### Slack (Optionnel)

Décommenter et configurer dans `alertmanager/alertmanager.yml` :

```yaml
slack_configs:
  - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
    channel: '#critical-alerts'
    title: '🚨 Critical Alert'
```

### PagerDuty (Optionnel)

```yaml
pagerduty_configs:
  - service_key: 'YOUR_PAGERDUTY_KEY'
```

---

## 📈 Métriques Personnalisées

### Métriques Backend Exposées

Le backend NestJS expose les métriques suivantes sur `http://localhost:3000/metrics` :

**Métriques HTTP** :
- `http_request_duration_seconds` - Durée des requêtes HTTP
- `http_requests_total` - Nombre total de requêtes HTTP

**Métriques Tenants** :
- `cybersensei_last_telemetry_timestamp_seconds` - Dernière télémétrie reçue
- `cybersensei_tenant_health_status` - Santé du tenant (1=healthy, 0=unhealthy)
- `cybersensei_tenant_active_users` - Utilisateurs actifs
- `cybersensei_tenant_ai_latency_ms` - Latence IA moyenne
- `cybersensei_tenant_exercises_total` - Exercices complétés

**Métriques Licences** :
- `cybersensei_license_expiry_timestamp_seconds` - Date d'expiration

**Métriques Node.js** :
- `process_cpu_seconds_total` - CPU utilisé
- `process_resident_memory_bytes` - Mémoire utilisée
- `nodejs_eventloop_lag_seconds` - Event loop lag
- `nodejs_heap_size_total_bytes` - Heap size

---

## 🔧 Prometheus Queries Utiles

### Backend Health

```promql
# Backend is up
up{job="nestjs-backend"}

# API latency P95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# Request rate
rate(http_requests_total[5m])
```

### Tenants

```promql
# Tenants sans télémétrie depuis 24h
(time() - cybersensei_last_telemetry_timestamp_seconds) > 86400

# Tenants en état critique
cybersensei_tenant_health_status{status="critical"} == 1

# Utilisateurs actifs totaux
sum(cybersensei_tenant_active_users)

# Top 5 tenants par latence IA
topk(5, cybersensei_tenant_ai_latency_ms)
```

### Database

```promql
# Connexions actives
pg_stat_database_numbackends

# Cache hit ratio
rate(pg_stat_database_blks_hit[5m]) / (rate(pg_stat_database_blks_hit[5m]) + rate(pg_stat_database_blks_read[5m]))

# Database size
pg_database_size_bytes / 1024 / 1024 / 1024
```

### System

```promql
# CPU usage
100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100

# Disk usage
(node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes * 100
```

---

## 🛠️ Maintenance

### Voir les logs

```bash
# Tous les services
docker-compose -f docker-compose.monitoring.yml logs -f

# Service spécifique
docker-compose -f docker-compose.monitoring.yml logs -f prometheus
docker-compose -f docker-compose.monitoring.yml logs -f grafana
```

### Redémarrer un service

```bash
docker-compose -f docker-compose.monitoring.yml restart prometheus
docker-compose -f docker-compose.monitoring.yml restart grafana
```

### Recharger la config Prometheus

```bash
curl -X POST http://localhost:9090/-/reload
```

### Backup Grafana

```bash
# Exporter les dashboards
docker exec cybersensei-grafana grafana-cli admin export-dashboards > dashboards-backup.json

# Backup du volume
docker run --rm -v monitoring_grafana_data:/data -v $(pwd):/backup alpine tar czf /backup/grafana-backup.tar.gz /data
```

### Nettoyer les anciennes données

```bash
# Arrêter les services
docker-compose -f docker-compose.monitoring.yml down

# Supprimer les volumes (ATTENTION: perte de données!)
docker volume rm monitoring_prometheus_data
docker volume rm monitoring_grafana_data

# Redémarrer
docker-compose -f docker-compose.monitoring.yml up -d
```

---

## 📊 Rétention des Données

### Prometheus

Par défaut : **15 jours**

Pour modifier, éditer `docker-compose.monitoring.yml` :

```yaml
command:
  - '--storage.tsdb.retention.time=30d'  # 30 jours
  - '--storage.tsdb.retention.size=50GB' # ou par taille
```

### Grafana

Les dashboards et configurations sont persistés dans `grafana_data`.

---

## 🔒 Sécurité

### Changer les mots de passe

**Grafana** :
```yaml
environment:
  - GF_SECURITY_ADMIN_PASSWORD=VotreMotDePasse
```

**Alertmanager SMTP** :
Utiliser des variables d'environnement ou secrets Docker.

### Activer HTTPS

Utiliser un reverse proxy (Nginx/Traefik) :

```nginx
server {
    listen 443 ssl;
    server_name grafana.cybersensei.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3002;
    }
}
```

### Limiter l'accès

Utiliser un firewall ou un VPN pour limiter l'accès aux ports de monitoring.

---

## 🧪 Tests

### Tester Prometheus

```bash
# Vérifier les targets
curl http://localhost:9090/api/v1/targets | jq .

# Tester une query
curl 'http://localhost:9090/api/v1/query?query=up' | jq .
```

### Tester Alertmanager

```bash
# Envoyer une alerte test
curl -H 'Content-Type: application/json' -d '[{"labels":{"alertname":"TestAlert"}}]' http://localhost:9093/api/v1/alerts
```

### Tester les métriques backend

```bash
curl http://localhost:3000/metrics
```

---

## 📚 Ressources

- **Prometheus Docs** : https://prometheus.io/docs/
- **Grafana Docs** : https://grafana.com/docs/
- **Alertmanager Docs** : https://prometheus.io/docs/alerting/latest/alertmanager/
- **PromQL Guide** : https://prometheus.io/docs/prometheus/latest/querying/basics/

---

## ✅ Checklist de Déploiement

### Configuration
- [ ] Modifier DATA_SOURCE_NAME dans postgres-exporter
- [ ] Configurer SMTP dans alertmanager.yml
- [ ] Changer le mot de passe Grafana
- [ ] Ajouter prom-client au backend
- [ ] Importer MetricsModule dans app.module.ts

### Démarrage
- [ ] Démarrer le stack : `docker-compose up -d`
- [ ] Vérifier tous les services sont UP
- [ ] Tester l'accès à Grafana
- [ ] Vérifier les targets Prometheus (all green)
- [ ] Tester les métriques backend

### Tests
- [ ] Vérifier les dashboards Grafana
- [ ] Tester une alerte (arrêter le backend)
- [ ] Vérifier réception email d'alerte
- [ ] Tester les queries Prometheus

---

**✅ Stack de monitoring production-ready !**

Pour démarrer :
```bash
cd monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

Accéder à Grafana : http://localhost:3002 (admin / admin123)

