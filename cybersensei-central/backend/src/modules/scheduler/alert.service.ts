import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { WebhookService, WebhookPayload } from './webhook.service';

export interface ScanAlertData {
  tenantId: string;
  tenantName: string;
  contactEmail: string;
  domain: string;
  currentScore: number;
  previousScore: number;
  deltaScore: number;
  newRisks: string[];
  resolvedRisks: string[];
  webhookUrl?: string;
}

/**
 * Service d'alertes multi-canal.
 * Envoie les notifications par email et optionnellement par webhook
 * en fonction de la sévérité des changements détectés.
 */
@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);

  constructor(
    private emailService: EmailService,
    private webhookService: WebhookService,
  ) {}

  /**
   * Traite les résultats d'un scan et envoie les alertes appropriées.
   */
  async processAlerts(data: ScanAlertData): Promise<void> {
    try {
      // Alerte CRITIQUE : dégradation > 10 points
      if (data.deltaScore < -10) {
        await this.sendCriticalAlert(data);
      }

      // Alerte IMPORTANTE : nouveaux risques
      if (data.newRisks.length > 0 && data.deltaScore >= -10) {
        await this.sendNewRisksAlert(data);
      }

      // Notification POSITIVE : risques résolus
      if (data.resolvedRisks.length > 0) {
        await this.sendResolvedNotification(data);
      }

      // Webhook si configuré
      if (data.webhookUrl) {
        await this.sendWebhook(data);
      }
    } catch (err) {
      this.logger.error(
        `Erreur pipeline alertes pour tenant ${data.tenantId}: ${err.message}`,
      );
    }
  }

  private async sendCriticalAlert(data: ScanAlertData): Promise<void> {
    const html = this.buildAlertHtml({
      accentColor: '#e74c3c',
      title: 'ALERTE CRITIQUE — Dégradation du score',
      ...data,
      message:
        'Le score de sécurité a chuté de plus de 10 points. ' +
        'Une investigation immédiate est recommandée.',
    });

    await this.emailService.send({
      to: data.contactEmail,
      subject: `🔴 CRITIQUE — Score en chute pour ${data.domain} (${data.previousScore} → ${data.currentScore})`,
      html,
    });

    this.logger.warn(
      `Alerte CRITIQUE envoyée pour tenant ${data.tenantId} (delta: ${data.deltaScore})`,
    );
  }

  private async sendNewRisksAlert(data: ScanAlertData): Promise<void> {
    const html = this.buildAlertHtml({
      accentColor: '#f39c12',
      title: `${data.newRisks.length} NOUVEAU(X) RISQUE(S) DÉTECTÉ(S)`,
      ...data,
      message:
        'De nouveaux risques ont été identifiés lors du scan automatique.',
    });

    await this.emailService.send({
      to: data.contactEmail,
      subject: `🟠 ${data.newRisks.length} nouveau(x) risque(s) sur ${data.domain}`,
      html,
    });
  }

  private async sendResolvedNotification(data: ScanAlertData): Promise<void> {
    const html = this.buildAlertHtml({
      accentColor: '#27ae60',
      title: `${data.resolvedRisks.length} RISQUE(S) RÉSOLU(S)`,
      ...data,
      message:
        'Félicitations ! Des risques précédemment identifiés ont été corrigés.',
    });

    await this.emailService.send({
      to: data.contactEmail,
      subject: `🟢 ${data.resolvedRisks.length} risque(s) résolu(s) sur ${data.domain}`,
      html,
    });
  }

  private async sendWebhook(data: ScanAlertData): Promise<void> {
    const payload: WebhookPayload = {
      tenant_id: data.tenantId,
      domain: data.domain,
      score: data.currentScore,
      delta: data.deltaScore,
      new_risks: data.newRisks,
      resolved_risks: data.resolvedRisks,
      timestamp: new Date().toISOString(),
    };

    await this.webhookService.send(data.webhookUrl, payload);
  }

  private buildAlertHtml(params: {
    accentColor: string;
    title: string;
    tenantName: string;
    domain: string;
    currentScore: number;
    previousScore: number;
    deltaScore: number;
    newRisks: string[];
    resolvedRisks: string[];
    message: string;
  }): string {
    const scoreColor =
      params.currentScore >= 75
        ? '#27ae60'
        : params.currentScore >= 50
          ? '#f39c12'
          : '#e74c3c';
    const deltaDisplay =
      params.deltaScore >= 0
        ? `+${params.deltaScore}`
        : `${params.deltaScore}`;

    let html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1a1a2e;padding:20px;text-align:center">
          <h1 style="color:#16c79a;margin:0">CYBER SENSEI</h1>
        </div>
        <div style="background:${params.accentColor};padding:12px;text-align:center">
          <h2 style="color:white;margin:0">${params.title}</h2>
        </div>
        <div style="padding:30px;background:white">
          <p>Bonjour <strong>${params.tenantName}</strong>,</p>
          <p>${params.message}</p>
          <div style="text-align:center;margin:20px 0">
            <span style="font-size:42px;font-weight:bold;color:${scoreColor}">${params.currentScore}</span>
            <span style="font-size:18px;color:#999">/100</span>
            <p style="color:${params.deltaScore >= 0 ? '#27ae60' : '#e74c3c'};font-size:16px">${deltaDisplay} points</p>
          </div>`;

    if (params.newRisks.length > 0) {
      html += `<h3 style="color:#e74c3c">Nouveaux risques (${params.newRisks.length})</h3><ul>`;
      for (const risk of params.newRisks) {
        html += `<li>${this.formatRisk(risk)}</li>`;
      }
      html += `</ul>`;
    }

    if (params.resolvedRisks.length > 0) {
      html += `<h3 style="color:#27ae60">Risques résolus (${params.resolvedRisks.length})</h3><ul>`;
      for (const risk of params.resolvedRisks) {
        html += `<li>${this.formatRisk(risk)}</li>`;
      }
      html += `</ul>`;
    }

    html += `
        </div>
        <div style="text-align:center;padding:15px;color:#999;font-size:12px">
          <p>CyberSensei — Alerte automatique</p>
        </div>
      </div>`;

    return html;
  }

  private formatRisk(risk: string): string {
    if (risk.startsWith('port:')) return `Port critique exposé : ${risk.slice(5)}`;
    if (risk.startsWith('cve:')) return `Vulnérabilité ${risk.slice(4)}`;
    if (risk.startsWith('tls:')) return `Problème TLS : ${risk.slice(4).replace('_', ' ')}`;
    if (risk.startsWith('typosquat:')) return `Domaine typosquat : ${risk.slice(10)}`;
    if (risk.startsWith('breach:')) return `Email compromis : ${risk.slice(7)}`;
    if (risk.startsWith('abuseipdb:')) return `IP signalée sur AbuseIPDB`;
    return risk;
  }
}
