import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    if (!host) {
      this.logger.warn('SMTP non configuré - les emails seront loggés en console');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<number>('SMTP_PORT', 587) === 465,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async send(options: EmailOptions): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM', 'noreply@cybersensei.io');

    if (!this.transporter) {
      this.logger.log(`[EMAIL-DEV] To: ${options.to} | Subject: ${options.subject}`);
      this.logger.debug(`[EMAIL-DEV] Body: ${options.html.substring(0, 200)}...`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      this.logger.log(`Email envoyé à ${options.to}: ${options.subject}`);
    } catch (error) {
      this.logger.error(`Échec envoi email à ${options.to}: ${error.message}`);
      throw error;
    }
  }

  // ============================================
  // TEMPLATES FREEMIUM
  // ============================================

  async sendTrialWelcome(email: string, tenantName: string): Promise<void> {
    await this.send({
      to: email,
      subject: `Bienvenue sur CyberSensei - Votre essai gratuit est actif`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Bienvenue ${tenantName} !</h2>
          <p>Votre compte CyberSensei est maintenant actif avec le <strong>plan Gratuit</strong>.</p>
          <h3>Ce qui est inclus :</h3>
          <ul>
            <li>1 audit M365 initial (score de sécurité)</li>
            <li>5 exercices de sensibilisation/mois</li>
            <li>Extension DLP Chrome (alertes)</li>
            <li>3 utilisateurs max</li>
          </ul>
          <p style="margin-top: 20px;">
            <a href="\${APP_URL}/dashboard" style="background: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
              Accéder au dashboard
            </a>
          </p>
          <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
            Besoin de plus ? Passez au plan Starter à tout moment.
          </p>
        </div>
      `,
    });
  }

  async sendTrialEnding(email: string, tenantName: string, daysLeft: number): Promise<void> {
    await this.send({
      to: email,
      subject: `CyberSensei - Votre période d'essai se termine dans ${daysLeft} jours`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #F59E0B;">Votre essai se termine bientôt</h2>
          <p>Bonjour ${tenantName},</p>
          <p>Votre période d'essai CyberSensei se termine dans <strong>${daysLeft} jours</strong>.</p>
          <p>Pour continuer à protéger votre organisation :</p>
          <p style="margin-top: 20px;">
            <a href="\${APP_URL}/subscriptions" style="background: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
              Choisir un plan
            </a>
          </p>
          <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
            <tr style="background: #F3F4F6;">
              <td style="padding: 10px; border: 1px solid #E5E7EB;"><strong>Starter</strong></td>
              <td style="padding: 10px; border: 1px solid #E5E7EB;">79 EUR/mois - 25 users, DLP + blocage</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #E5E7EB;"><strong>Business</strong></td>
              <td style="padding: 10px; border: 1px solid #E5E7EB;">199 EUR/mois - 100 users, IA adaptative, RGPD</td>
            </tr>
          </table>
        </div>
      `,
    });
  }

  async sendUsageLimitWarning(
    email: string,
    tenantName: string,
    limitType: string,
    current: number,
    max: number,
  ): Promise<void> {
    const pct = Math.round((current / max) * 100);
    await this.send({
      to: email,
      subject: `CyberSensei - Limite d'utilisation atteinte (${pct}%)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #EF4444;">Limite bientôt atteinte</h2>
          <p>Bonjour ${tenantName},</p>
          <p>Vous avez utilisé <strong>${current}/${max}</strong> ${limitType} ce mois-ci (${pct}%).</p>
          <p>Pour continuer sans interruption, passez au plan supérieur :</p>
          <p style="margin-top: 20px;">
            <a href="\${APP_URL}/subscriptions" style="background: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
              Passer au plan supérieur
            </a>
          </p>
        </div>
      `,
    });
  }

  async sendUpgradeConfirmation(email: string, tenantName: string, newPlan: string): Promise<void> {
    await this.send({
      to: email,
      subject: `CyberSensei - Plan ${newPlan} activé !`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">Plan ${newPlan} activé !</h2>
          <p>Bonjour ${tenantName},</p>
          <p>Votre plan <strong>${newPlan}</strong> est maintenant actif. Toutes les nouvelles fonctionnalités sont disponibles immédiatement.</p>
          <p style="margin-top: 20px;">
            <a href="\${APP_URL}/dashboard" style="background: #10B981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
              Découvrir vos nouvelles fonctionnalités
            </a>
          </p>
        </div>
      `,
    });
  }
}
