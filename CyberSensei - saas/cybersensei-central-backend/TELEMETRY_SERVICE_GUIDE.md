# 📊 TelemetryService - Guide Complet

Guide d'utilisation du service de télémétrie pour CyberSensei Central Backend.

---

## 🎯 Vue d'Ensemble

Le `TelemetryService` permet de :
1. **Ingérer des métriques** en temps réel depuis les nodes
2. **Stocker l'historique** dans PostgreSQL
3. **Calculer des agrégations** (24h, 7j, 30j)
4. **Fournir des dashboards** pour administrateurs

### Architecture

```
┌─────────────────┐
│  Node Clients   │
│                 │
│ POST /telemetry │ (Every 5-10 minutes)
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────┐
│     TelemetryService (NestJS)    │
│                                  │
│  1. Validate tenant              │
│  2. Store in PostgreSQL          │
│  3. Calculate aggregations       │
└──────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│      PostgreSQL (tenant_metrics) │
│  ┌────────────────────────────┐  │
│  │ tenantId                   │  │
│  │ uptime                     │  │
│  │ activeUsers                │  │
│  │ exercisesCompletedToday    │  │
│  │ aiLatency                  │  │
│  │ version                    │  │
│  │ additionalData (JSONB)     │  │
│  │ timestamp                  │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│   Admin Dashboard APIs           │
│  - Metrics par tenant            │
│  - Agrégations (24h/7d/30d)      │
│  - Global summary                │
│  - Usage trends                  │
└──────────────────────────────────┘
```

---

## 📝 Structure des Données

### Entrée de Télémétrie

```typescript
interface TelemetryDto {
  tenantId: string;              // UUID du tenant (requis)
  uptime: number;                // Secondes depuis démarrage (requis)
  activeUsers: number;           // Utilisateurs actifs (requis)
  exercisesCompletedToday: number; // Exercices complétés (requis)
  aiLatency?: number;            // Latence IA en ms (optionnel)
  version?: string;              // Version du node (optionnel)
  additionalData?: {             // Données supplémentaires (optionnel)
    cpuUsage?: number;
    memoryUsage?: number;
    diskUsage?: number;
    errorCount?: number;
    [key: string]: any;
  };
}
```

### Exemple

```json
{
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "uptime": 86400,
  "activeUsers": 42,
  "exercisesCompletedToday": 156,
  "aiLatency": 247.5,
  "version": "1.2.0",
  "additionalData": {
    "cpuUsage": 45.2,
    "memoryUsage": 62.8,
    "diskUsage": 38.1,
    "errorCount": 3
  }
}
```

---

## 🔌 Endpoints API

### 1. Ingestion de Télémétrie (Nodes)

**POST** `/telemetry`

**Authorization** : Aucune (validation par tenantId)

**Body** :
```json
{
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "uptime": 86400,
  "activeUsers": 42,
  "exercisesCompletedToday": 156,
  "aiLatency": 247.5,
  "version": "1.2.0"
}
```

**Exemple cURL** :
```bash
curl -X POST http://localhost:3000/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "uptime": 86400,
    "activeUsers": 42,
    "exercisesCompletedToday": 156,
    "aiLatency": 247.5,
    "version": "1.2.0"
  }'
```

**Réponse (201)** :
```json
{
  "success": true,
  "message": "Télémétrie enregistrée avec succès",
  "timestamp": "2025-11-24T10:30:00.000Z",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Validations** :
- ✅ Tenant existe
- ✅ Tenant actif
- ✅ Données valides (types, min values)

**Fréquence recommandée** : Toutes les 5-10 minutes

---

### 2. Récupérer les Métriques d'un Tenant (Admin)

**GET** `/admin/tenant/{id}/metrics?limit=100&offset=0`

**Authorization** : Bearer Token (SUPERADMIN ou SUPPORT)

**Query Parameters** :
- `limit` (optionnel) : Nombre de résultats (défaut: 100, max: 1000)
- `offset` (optionnel) : Offset pour pagination (défaut: 0)

**Exemple** :
```bash
curl -X GET "http://localhost:3000/admin/tenant/550e8400.../metrics?limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Réponse** :
```json
{
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "tenantName": "acme-corp",
  "data": [
    {
      "id": "metric-uuid",
      "uptime": 86400,
      "activeUsers": 42,
      "exercisesCompletedToday": 156,
      "aiLatency": 247.5,
      "version": "1.2.0",
      "additionalData": { "cpuUsage": 45.2 },
      "timestamp": "2025-11-24T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 245,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 3. Dernière Métrique d'un Tenant (Admin)

**GET** `/admin/tenant/{id}/metrics/latest`

**Authorization** : Bearer Token

**Exemple** :
```bash
curl -X GET "http://localhost:3000/admin/tenant/550e8400.../metrics/latest" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Réponse** :
```json
{
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "tenantName": "acme-corp",
  "metric": {
    "id": "metric-uuid",
    "uptime": 86400,
    "activeUsers": 42,
    "exercisesCompletedToday": 156,
    "aiLatency": 247.5,
    "version": "1.2.0",
    "timestamp": "2025-11-24T10:30:00.000Z"
  }
}
```

---

### 4. Métriques Agrégées d'un Tenant (Admin)

**GET** `/admin/tenant/{id}/metrics/aggregated?period=7d`

**Authorization** : Bearer Token

**Query Parameters** :
- `period` (optionnel) : `24h`, `7d`, ou `30d` (défaut: `7d`)

**Exemple** :
```bash
curl -X GET "http://localhost:3000/admin/tenant/550e8400.../metrics/aggregated?period=24h" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Réponse** :
```json
{
  "period": "24h",
  "startDate": "2025-11-23T10:30:00.000Z",
  "endDate": "2025-11-24T10:30:00.000Z",
  "dataPoints": 144,
  "metrics": {
    "avgUptime": 82345,
    "avgActiveUsers": 38.5,
    "avgExercisesPerDay": 142.3,
    "avgAiLatency": 245.7,
    "maxActiveUsers": 67,
    "maxExercises": 234,
    "maxAiLatency": 456.2,
    "minActiveUsers": 12,
    "minExercises": 45,
    "minAiLatency": 156.3,
    "totalExercises": 20491
  },
  "trend": {
    "activeUsers": "increasing",
    "exercises": "stable",
    "aiLatency": "decreasing"
  }
}
```

**Métriques calculées** :
- **Moyennes** : uptime, users, exercises, AI latency
- **Min/Max** : users, exercises, AI latency
- **Total** : exercices
- **Tendances** : croissante, décroissante, stable

---

### 5. Résumé Global de la Plateforme (Admin)

**GET** `/admin/global/summary`

**Authorization** : Bearer Token

**Exemple** :
```bash
curl -X GET "http://localhost:3000/admin/global/summary" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Réponse** :
```json
{
  "timestamp": "2025-11-24T10:30:00.000Z",
  "tenants": {
    "total": 42,
    "active": 38,
    "inactive": 4,
    "withRecentData": 35
  },
  "licenses": {
    "total": 56,
    "active": 45,
    "expired": 8,
    "expiringSoon": 5
  },
  "usage": {
    "totalActiveUsers": 1847,
    "totalExercisesCompletedToday": 4532,
    "averageAiLatency": 245.67,
    "totalUptime": 3245678
  },
  "health": {
    "healthy": 32,
    "warning": 3,
    "critical": 2,
    "noData": 1
  },
  "versions": [
    { "version": "1.2.0", "count": 25 },
    { "version": "1.1.0", "count": 10 },
    { "version": "1.0.0", "count": 3 }
  ]
}
```

**Contenu** :
- **Tenants** : statistiques complètes
- **Licences** : actives, expirées, expirant < 30j
- **Usage** : totaux actuels
- **Santé** : distribution par statut
- **Versions** : distribution des versions des nodes

---

### 6. Tendances d'Utilisation Globales (Admin)

**GET** `/admin/global/usage-trends?days=30`

**Authorization** : Bearer Token

**Query Parameters** :
- `days` (optionnel) : Nombre de jours (défaut: 30, max: 90)

**Exemple** :
```bash
curl -X GET "http://localhost:3000/admin/global/usage-trends?days=7" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Réponse** :
```json
{
  "period": "7 days",
  "startDate": "2025-11-17T10:30:00.000Z",
  "endDate": "2025-11-24T10:30:00.000Z",
  "dataPoints": 7,
  "trends": [
    {
      "date": "2025-11-24",
      "avgActiveUsers": 42.5,
      "totalExercises": 1456,
      "avgAiLatency": 245.7,
      "tenantsReporting": 35,
      "uptimePercentage": 99.9
    },
    {
      "date": "2025-11-23",
      "avgActiveUsers": 38.2,
      "totalExercises": 1342,
      "avgAiLatency": 247.3,
      "tenantsReporting": 34,
      "uptimePercentage": 99.8
    }
  ],
  "summary": {
    "avgDailyUsers": 38.7,
    "avgDailyExercises": 1342,
    "avgAiLatency": 247.3,
    "peakUsers": 67,
    "peakDate": "2025-11-20"
  }
}
```

**Données par jour** :
- Moyenne utilisateurs actifs
- Total exercices
- Latence IA moyenne
- Tenants rapportant
- Uptime %

**Résumé** :
- Moyennes quotidiennes
- Pic d'utilisation (date + valeur)

---

## 💻 Implémentation Node Client

### Client TypeScript Complet

```typescript
import axios from 'axios';
import * as os from 'os';

interface TelemetryData {
  tenantId: string;
  uptime: number;
  activeUsers: number;
  exercisesCompletedToday: number;
  aiLatency?: number;
  version?: string;
  additionalData?: Record<string, any>;
}

class TelemetryClient {
  private backendUrl: string;
  private tenantId: string;
  private version: string;
  private intervalId?: NodeJS.Timeout;

  constructor(backendUrl: string, tenantId: string, version: string) {
    this.backendUrl = backendUrl.replace(/\/$/, '');
    this.tenantId = tenantId;
    this.version = version;
  }

  /**
   * Collecter les métriques système
   */
  private collectMetrics(): TelemetryData {
    // Exemple de collecte - à adapter selon votre application
    return {
      tenantId: this.tenantId,
      uptime: process.uptime(), // Uptime du processus Node.js
      activeUsers: this.getActiveUsersCount(), // À implémenter
      exercisesCompletedToday: this.getExercisesCount(), // À implémenter
      aiLatency: this.getAverageAiLatency(), // À implémenter
      version: this.version,
      additionalData: {
        cpuUsage: this.getCpuUsage(),
        memoryUsage: this.getMemoryUsage(),
        diskUsage: this.getDiskUsage(),
        platform: os.platform(),
        nodeVersion: process.version,
      },
    };
  }

  /**
   * Envoyer la télémétrie
   */
  async sendTelemetry(): Promise<boolean> {
    try {
      const data = this.collectMetrics();

      const response = await axios.post(
        `${this.backendUrl}/telemetry`,
        data,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        },
      );

      if (response.status === 201) {
        console.log(`✅ Télémétrie envoyée: ${data.activeUsers} users, ${data.exercisesCompletedToday} exercises`);
        return true;
      }

      return false;
    } catch (error) {
      if (error.response) {
        console.error(
          `❌ Erreur télémétrie: ${error.response.status} - ${error.response.data.message}`,
        );
      } else {
        console.error(`❌ Erreur réseau: ${error.message}`);
      }
      return false;
    }
  }

  /**
   * Démarrer l'envoi périodique
   */
  startPeriodicSend(intervalMinutes: number = 5) {
    if (this.intervalId) {
      console.warn('Télémétrie déjà démarrée');
      return;
    }

    console.log(`📊 Démarrage télémétrie (intervalle: ${intervalMinutes} min)`);

    // Envoi immédiat
    this.sendTelemetry();

    // Puis périodique
    this.intervalId = setInterval(() => {
      this.sendTelemetry();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Arrêter l'envoi périodique
   */
  stopPeriodicSend() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      console.log('📊 Télémétrie arrêtée');
    }
  }

  // Méthodes à implémenter selon votre application

  private getActiveUsersCount(): number {
    // TODO: Implémenter la logique de comptage des users actifs
    // Exemple: retourner le nombre de sessions WebSocket actives
    return 0;
  }

  private getExercisesCount(): number {
    // TODO: Implémenter la logique de comptage des exercices
    // Exemple: requête DB pour compter les exercices complétés aujourd'hui
    return 0;
  }

  private getAverageAiLatency(): number | undefined {
    // TODO: Implémenter la logique de calcul de latence
    // Exemple: moyenne des dernières requêtes IA
    return undefined;
  }

  private getCpuUsage(): number {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach((cpu) => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    return 100 - (totalIdle / totalTick) * 100;
  }

  private getMemoryUsage(): number {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    return ((totalMem - freeMem) / totalMem) * 100;
  }

  private getDiskUsage(): number {
    // Note: os ne fournit pas d'info disque directement
    // Utiliser une lib comme 'diskusage' en production
    return 0;
  }
}

// Utilisation
const telemetry = new TelemetryClient(
  'http://central-backend.cybersensei.com',
  '550e8400-e29b-41d4-a716-446655440000',
  '1.2.0',
);

// Démarrer l'envoi toutes les 5 minutes
telemetry.startPeriodicSend(5);

// Arrêter proprement à l'arrêt de l'application
process.on('SIGTERM', () => {
  telemetry.stopPeriodicSend();
  process.exit(0);
});
```

---

## 📊 Calcul des Agrégations

### Période 24h

```typescript
const aggregated = await telemetryService.getAggregatedMetrics(tenantId, '24h');
```

**Calculs effectués** :
- Moyenne de toutes les métriques sur 24h
- Min/Max pour users, exercises, AI latency
- Total exercices
- Tendance (comparaison première moitié vs deuxième moitié)

### Période 7d

```typescript
const aggregated = await telemetryService.getAggregatedMetrics(tenantId, '7d');
```

**Calculs effectués** :
- Agrégation sur 7 jours
- ~28 points de données par jour (si envoi toutes les 30 min)
- Total ~196 points de données

### Période 30d

```typescript
const aggregated = await telemetryService.getAggregatedMetrics(tenantId, '30d');
```

**Calculs effectués** :
- Agrégation sur 30 jours
- ~840 points de données

---

## 🎨 Exemples d'Utilisation Dashboard

### Dashboard Tenant

```typescript
// Résumé rapide
const latest = await GET('/admin/tenant/{id}/metrics/latest');
console.log(`Users actifs: ${latest.metric.activeUsers}`);
console.log(`Latence IA: ${latest.metric.aiLatency}ms`);

// Métriques 24h
const day = await GET('/admin/tenant/{id}/metrics/aggregated?period=24h');
console.log(`Moyenne users: ${day.metrics.avgActiveUsers}`);
console.log(`Tendance: ${day.trend.activeUsers}`);

// Historique
const history = await GET('/admin/tenant/{id}/metrics?limit=100');
// Afficher graphique avec history.data
```

### Dashboard Global

```typescript
// Vue d'ensemble
const summary = await GET('/admin/global/summary');
console.log(`Tenants actifs: ${summary.tenants.active}/${summary.tenants.total}`);
console.log(`Users totaux: ${summary.usage.totalActiveUsers}`);
console.log(`Santé: ${summary.health.healthy} healthy, ${summary.health.critical} critical`);

// Tendances 30 jours
const trends = await GET('/admin/global/usage-trends?days=30');
// Afficher graphique avec trends.trends (array)
console.log(`Pic: ${trends.summary.peakUsers} users le ${trends.summary.peakDate}`);
```

---

## 🔐 Sécurité & Performance

### Sécurité

**Endpoint Public** (`POST /telemetry`) :
- ✅ Validation du tenant (existe + actif)
- ✅ Validation des données (class-validator)
- ✅ Rate limiting recommandé (éviter spam)

**Endpoints Admin** :
- ✅ JWT Authentication
- ✅ RBAC (SUPERADMIN + SUPPORT)
- ✅ Validation des paramètres

### Performance

**Indexes PostgreSQL** :
```sql
CREATE INDEX idx_tenant_metrics_tenant_timestamp 
ON tenant_metrics (tenantId, timestamp);

CREATE INDEX idx_tenant_metrics_timestamp 
ON tenant_metrics (timestamp);
```

**Optimisations** :
- Pagination pour historique (max 1000)
- Limite 90 jours pour usage trends
- Calculs agrégés en mémoire (pas de GROUP BY lourd)

**Maintenance** :
- Archiver métriques > 90 jours
- Vacuum régulier de la table
- Monitoring de la taille de la table

---

## 📚 Fichiers Générés

| Fichier | Description |
|---------|-------------|
| `telemetry.service.ts` | Service principal avec toute la logique |
| `telemetry.controller.ts` | Contrôleur REST avec 6 endpoints |
| `telemetry.module.ts` | Module NestJS |
| `telemetry.dto.ts` | DTO avec validation |
| `aggregated-metrics.interface.ts` | Interfaces TypeScript |

---

## ✅ Checklist de Déploiement

### Backend
- [ ] Vérifier table `tenant_metrics` existe
- [ ] Vérifier indexes créés
- [ ] Démarrer le backend
- [ ] Tester `/telemetry` avec curl

### Node Client
- [ ] Implémenter la collecte de métriques
- [ ] Configurer l'intervalle d'envoi (5-10 min)
- [ ] Tester l'envoi manuel
- [ ] Démarrer l'envoi périodique

### Monitoring
- [ ] Surveiller les logs d'ingestion
- [ ] Vérifier les données dans PostgreSQL
- [ ] Tester les dashboards admin
- [ ] Configurer les alertes

---

**✅ Le TelemetryService est prêt à l'emploi !**

