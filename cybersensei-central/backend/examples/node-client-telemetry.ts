/**
 * Exemple d'implémentation d'un client de télémétrie
 * pour les nodes CyberSensei
 */

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

class CyberSenseiTelemetryClient {
  private backendUrl: string;
  private tenantId: string;
  private version: string;
  private intervalId?: NodeJS.Timeout;
  private isRunning: boolean = false;

  // Compteurs internes (à remplacer par votre logique réelle)
  private activeUsersCount: number = 0;
  private exercisesCount: number = 0;
  private aiLatencySum: number = 0;
  private aiLatencyCount: number = 0;

  constructor(backendUrl: string, tenantId: string, version: string) {
    this.backendUrl = backendUrl.replace(/\/$/, '');
    this.tenantId = tenantId;
    this.version = version;
  }

  /**
   * Enregistrer un utilisateur actif
   */
  registerActiveUser() {
    this.activeUsersCount++;
  }

  /**
   * Désenregistrer un utilisateur actif
   */
  unregisterActiveUser() {
    if (this.activeUsersCount > 0) {
      this.activeUsersCount--;
    }
  }

  /**
   * Incrémenter le compteur d'exercices complétés
   */
  incrementExercises(count: number = 1) {
    this.exercisesCount += count;
  }

  /**
   * Enregistrer une latence IA
   */
  recordAiLatency(latencyMs: number) {
    this.aiLatencySum += latencyMs;
    this.aiLatencyCount++;
  }

  /**
   * Collecter les métriques système
   */
  private collectMetrics(): TelemetryData {
    // Calculer la latence IA moyenne
    const avgAiLatency =
      this.aiLatencyCount > 0
        ? Math.round((this.aiLatencySum / this.aiLatencyCount) * 100) / 100
        : undefined;

    // Réinitialiser les compteurs de latence
    this.aiLatencySum = 0;
    this.aiLatencyCount = 0;

    return {
      tenantId: this.tenantId,
      uptime: Math.floor(process.uptime()),
      activeUsers: this.activeUsersCount,
      exercisesCompletedToday: this.exercisesCount,
      aiLatency: avgAiLatency,
      version: this.version,
      additionalData: {
        cpuUsage: this.getCpuUsage(),
        memoryUsage: this.getMemoryUsage(),
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        hostname: os.hostname(),
        loadAverage: os.loadavg(),
      },
    };
  }

  /**
   * Envoyer la télémétrie au backend
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
        console.log(
          `✅ [Telemetry] Envoyée: ${data.activeUsers} users, ${data.exercisesCompletedToday} exercises, ${data.aiLatency || 'N/A'}ms latency`,
        );
        return true;
      }

      console.warn(
        `⚠️  [Telemetry] Statut inattendu: ${response.status}`,
      );
      return false;
    } catch (error: any) {
      if (error.response) {
        console.error(
          `❌ [Telemetry] Erreur: ${error.response.status} - ${error.response.data?.message || 'Unknown'}`,
        );
      } else if (error.request) {
        console.error(
          `❌ [Telemetry] Erreur réseau: Backend inaccessible`,
        );
      } else {
        console.error(`❌ [Telemetry] Erreur: ${error.message}`);
      }
      return false;
    }
  }

  /**
   * Démarrer l'envoi périodique de télémétrie
   */
  start(intervalMinutes: number = 5) {
    if (this.isRunning) {
      console.warn('⚠️  [Telemetry] Déjà en cours d\'exécution');
      return;
    }

    console.log(
      `📊 [Telemetry] Démarrage (intervalle: ${intervalMinutes} min)`,
    );
    console.log(`   Backend: ${this.backendUrl}`);
    console.log(`   Tenant: ${this.tenantId}`);
    console.log(`   Version: ${this.version}`);

    this.isRunning = true;

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
  stop() {
    if (!this.isRunning) {
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    this.isRunning = false;
    console.log('📊 [Telemetry] Arrêtée');
  }

  /**
   * Envoyer un dernier rapport avant de quitter
   */
  async sendFinalReport() {
    console.log('📊 [Telemetry] Envoi du rapport final...');
    await this.sendTelemetry();
  }

  /**
   * Réinitialiser le compteur d'exercices (à appeler chaque jour à minuit)
   */
  resetDailyCounters() {
    console.log(
      `📊 [Telemetry] Réinitialisation: ${this.exercisesCount} exercices complétés aujourd'hui`,
    );
    this.exercisesCount = 0;
  }

  // ======================================
  // Méthodes utilitaires
  // ======================================

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

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - (100 * idle) / total;

    return Math.round(usage * 100) / 100;
  }

  private getMemoryUsage(): number {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usage = (usedMem / totalMem) * 100;

    return Math.round(usage * 100) / 100;
  }

  /**
   * Obtenir le statut actuel
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeUsers: this.activeUsersCount,
      exercisesCompleted: this.exercisesCount,
      uptime: Math.floor(process.uptime()),
    };
  }
}

// ======================================
// EXEMPLE D'UTILISATION
// ======================================

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const TENANT_ID =
  process.env.TENANT_ID || '550e8400-e29b-41d4-a716-446655440000';
const VERSION = process.env.APP_VERSION || '1.2.0';

// Initialiser le client
const telemetry = new CyberSenseiTelemetryClient(
  BACKEND_URL,
  TENANT_ID,
  VERSION,
);

// Démarrer l'envoi toutes les 5 minutes
telemetry.start(5);

// Simuler des événements (remplacer par votre logique réelle)

// Simulation: Utilisateur se connecte
setInterval(() => {
  if (Math.random() > 0.5) {
    telemetry.registerActiveUser();
    console.log('👤 User connecté');
  }
}, 30000);

// Simulation: Utilisateur se déconnecte
setInterval(() => {
  if (Math.random() > 0.7) {
    telemetry.unregisterActiveUser();
    console.log('👋 User déconnecté');
  }
}, 35000);

// Simulation: Exercice complété
setInterval(() => {
  if (Math.random() > 0.6) {
    telemetry.incrementExercises(1);
    console.log('✏️  Exercice complété');
  }
}, 20000);

// Simulation: Requête IA
setInterval(() => {
  const latency = 150 + Math.random() * 200; // 150-350ms
  telemetry.recordAiLatency(latency);
  console.log(`🤖 Requête IA: ${Math.round(latency)}ms`);
}, 15000);

// Réinitialiser les compteurs quotidiens à minuit
const scheduleReset = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const msUntilMidnight = tomorrow.getTime() - now.getTime();

  setTimeout(() => {
    telemetry.resetDailyCounters();
    scheduleReset(); // Planifier le prochain reset
  }, msUntilMidnight);
};

scheduleReset();

// Gestion propre de l'arrêt
process.on('SIGTERM', async () => {
  console.log('\n🛑 Signal SIGTERM reçu');
  await telemetry.sendFinalReport();
  telemetry.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Signal SIGINT reçu');
  await telemetry.sendFinalReport();
  telemetry.stop();
  process.exit(0);
});

// API de statut (optionnel)
setInterval(() => {
  const status = telemetry.getStatus();
  console.log(`📊 [Status] ${status.activeUsers} users, ${status.exercisesCompleted} exercises, uptime: ${status.uptime}s`);
}, 60000);

// Export pour utilisation dans d'autres modules
export default telemetry;

