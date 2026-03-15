import { Injectable, Logger } from '@nestjs/common';

export interface WebhookPayload {
  tenant_id: string;
  domain: string;
  score: number;
  delta: number;
  new_risks: string[];
  resolved_risks: string[];
  timestamp: string;
}

/**
 * Service de notification par webhook.
 * Envoie un POST JSON vers l'URL configurée par le tenant
 * avec les résultats du scan.
 */
@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  /**
   * Envoie un payload JSON vers l'URL de webhook du tenant.
   * Timeout de 10 secondes, pas de retry (fire-and-forget).
   */
  async send(webhookUrl: string, payload: WebhookPayload): Promise<boolean> {
    try {
      this.logger.log(
        `Envoi webhook vers ${webhookUrl} pour tenant ${payload.tenant_id}`,
      );

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        this.logger.log(
          `Webhook envoyé avec succès (${response.status}) pour tenant ${payload.tenant_id}`,
        );
        return true;
      }

      this.logger.warn(
        `Webhook a retourné ${response.status} pour tenant ${payload.tenant_id}`,
      );
      return false;
    } catch (err) {
      this.logger.error(
        `Échec envoi webhook pour tenant ${payload.tenant_id}: ${err.message}`,
      );
      return false;
    }
  }
}
