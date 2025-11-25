import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../entities/tenant.entity';
import { License } from '../../entities/license.entity';
import { TenantMetric } from '../../entities/tenant-metric.entity';
import * as client from 'prom-client';

@Injectable()
export class MetricsService {
  private register: client.Registry;

  // Métriques personnalisées
  private lastTelemetryGauge: client.Gauge;
  private tenantHealthGauge: client.Gauge;
  private tenantActiveUsersGauge: client.Gauge;
  private tenantAiLatencyGauge: client.Gauge;
  private tenantExercisesCounter: client.Counter;
  private licenseExpiryGauge: client.Gauge;
  private httpRequestDuration: client.Histogram;
  private httpRequestsTotal: client.Counter;

  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(License)
    private licenseRepository: Repository<License>,
    @InjectRepository(TenantMetric)
    private metricRepository: Repository<TenantMetric>,
  ) {
    this.register = new client.Registry();

    // Collecter les métriques par défaut (CPU, mémoire, etc.)
    client.collectDefaultMetrics({ register: this.register });

    // Métrique : Dernière télémétrie reçue
    this.lastTelemetryGauge = new client.Gauge({
      name: 'cybersensei_last_telemetry_timestamp_seconds',
      help: 'Timestamp de la dernière télémétrie reçue par tenant',
      labelNames: ['tenant_id', 'tenant_name'],
      registers: [this.register],
    });

    // Métrique : Santé du tenant
    this.tenantHealthGauge = new client.Gauge({
      name: 'cybersensei_tenant_health_status',
      help: 'Statut de santé du tenant (1=healthy, 0=unhealthy)',
      labelNames: ['tenant_id', 'tenant_name', 'status'],
      registers: [this.register],
    });

    // Métrique : Utilisateurs actifs par tenant
    this.tenantActiveUsersGauge = new client.Gauge({
      name: 'cybersensei_tenant_active_users',
      help: 'Nombre d\'utilisateurs actifs par tenant',
      labelNames: ['tenant_id', 'tenant_name', 'tenant_active'],
      registers: [this.register],
    });

    // Métrique : Latence IA par tenant
    this.tenantAiLatencyGauge = new client.Gauge({
      name: 'cybersensei_tenant_ai_latency_ms',
      help: 'Latence IA moyenne par tenant (ms)',
      labelNames: ['tenant_id', 'tenant_name'],
      registers: [this.register],
    });

    // Métrique : Exercices complétés
    this.tenantExercisesCounter = new client.Counter({
      name: 'cybersensei_tenant_exercises_total',
      help: 'Nombre total d\'exercices complétés par tenant',
      labelNames: ['tenant_id', 'tenant_name'],
      registers: [this.register],
    });

    // Métrique : Expiration de licence
    this.licenseExpiryGauge = new client.Gauge({
      name: 'cybersensei_license_expiry_timestamp_seconds',
      help: 'Timestamp d\'expiration de la licence',
      labelNames: ['tenant_id', 'tenant_name', 'license_key'],
      registers: [this.register],
    });

    // Métrique HTTP : Durée des requêtes
    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Durée des requêtes HTTP',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.3, 0.5, 1, 2, 5],
      registers: [this.register],
    });

    // Métrique HTTP : Total des requêtes
    this.httpRequestsTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Nombre total de requêtes HTTP',
      labelNames: ['method', 'route', 'status'],
      registers: [this.register],
    });

    // Démarrer la collecte périodique
    this.startPeriodicCollection();
  }

  /**
   * Retourner les métriques Prometheus
   */
  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  /**
   * Enregistrer une requête HTTP
   */
  recordHttpRequest(method: string, route: string, status: number, duration: number) {
    this.httpRequestsTotal.inc({ method, route, status: status.toString() });
    this.httpRequestDuration.observe({ method, route, status: status.toString() }, duration);
  }

  /**
   * Collecter les métriques des tenants
   */
  private async startPeriodicCollection() {
    // Collecter toutes les 30 secondes
    setInterval(async () => {
      await this.collectTenantMetrics();
      await this.collectLicenseMetrics();
    }, 30000);

    // Première collecte immédiate
    await this.collectTenantMetrics();
    await this.collectLicenseMetrics();
  }

  /**
   * Collecter les métriques des tenants
   */
  private async collectTenantMetrics() {
    try {
      const tenants = await this.tenantRepository.find();

      for (const tenant of tenants) {
        // Dernière métrique
        const lastMetric = await this.metricRepository.findOne({
          where: { tenantId: tenant.id },
          order: { timestamp: 'DESC' },
        });

        if (lastMetric) {
          const labels = {
            tenant_id: tenant.id,
            tenant_name: tenant.name,
          };

          // Timestamp dernière télémétrie
          this.lastTelemetryGauge.set(
            labels,
            Math.floor(new Date(lastMetric.timestamp).getTime() / 1000),
          );

          // Utilisateurs actifs
          this.tenantActiveUsersGauge.set(
            { ...labels, tenant_active: tenant.active ? 'true' : 'false' },
            lastMetric.activeUsers,
          );

          // Latence IA
          if (lastMetric.aiLatency) {
            this.tenantAiLatencyGauge.set(labels, lastMetric.aiLatency);
          }

          // Santé du tenant
          const now = new Date();
          const lastUpdate = new Date(lastMetric.timestamp);
          const diffMinutes = (now.getTime() - lastUpdate.getTime()) / 1000 / 60;

          if (diffMinutes <= 30) {
            this.tenantHealthGauge.set({ ...labels, status: 'healthy' }, 1);
            this.tenantHealthGauge.set({ ...labels, status: 'warning' }, 0);
            this.tenantHealthGauge.set({ ...labels, status: 'critical' }, 0);
          } else if (diffMinutes <= 60) {
            this.tenantHealthGauge.set({ ...labels, status: 'healthy' }, 0);
            this.tenantHealthGauge.set({ ...labels, status: 'warning' }, 1);
            this.tenantHealthGauge.set({ ...labels, status: 'critical' }, 0);
          } else {
            this.tenantHealthGauge.set({ ...labels, status: 'healthy' }, 0);
            this.tenantHealthGauge.set({ ...labels, status: 'warning' }, 0);
            this.tenantHealthGauge.set({ ...labels, status: 'critical' }, 1);
          }
        }
      }
    } catch (error) {
      console.error('Error collecting tenant metrics:', error);
    }
  }

  /**
   * Collecter les métriques des licences
   */
  private async collectLicenseMetrics() {
    try {
      const licenses = await this.licenseRepository.find({
        relations: ['tenant'],
      });

      for (const license of licenses) {
        if (license.tenant && license.expiresAt) {
          this.licenseExpiryGauge.set(
            {
              tenant_id: license.tenant.id,
              tenant_name: license.tenant.name,
              license_key: license.key,
            },
            Math.floor(new Date(license.expiresAt).getTime() / 1000),
          );
        }
      }
    } catch (error) {
      console.error('Error collecting license metrics:', error);
    }
  }
}

