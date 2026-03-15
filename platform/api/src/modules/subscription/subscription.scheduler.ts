import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import {
  Subscription,
  SubscriptionStatus,
} from '../../entities/subscription.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class SubscriptionScheduler {
  private readonly logger = new Logger(SubscriptionScheduler.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Tous les jours à 9h : envoyer des relances pour les trials qui expirent bientôt
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkTrialExpirations(): Promise<void> {
    this.logger.log('Vérification des expirations de trial...');

    const now = new Date();

    for (const daysLeft of [7, 3, 1]) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + daysLeft);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      const expiringSubs = await this.subscriptionRepo.find({
        where: {
          status: SubscriptionStatus.TRIAL,
          trialEndsAt: MoreThan(startOfDay) as any,
        },
        relations: ['tenant'],
      });

      const filtered = expiringSubs.filter((sub) => {
        const trialEnd = new Date(sub.trialEndsAt);
        return trialEnd >= startOfDay && trialEnd <= endOfDay;
      });

      for (const sub of filtered) {
        try {
          await this.emailService.sendTrialEnding(
            sub.tenant.contactEmail,
            sub.tenant.name,
            daysLeft,
          );
          this.logger.log(
            `Relance J-${daysLeft} envoyée à ${sub.tenant.name}`,
          );
        } catch (error) {
          this.logger.error(
            `Erreur relance ${sub.tenant.name}: ${error.message}`,
          );
        }
      }
    }
  }

  /**
   * Tous les jours à minuit : expirer les trials terminés
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireTrials(): Promise<void> {
    this.logger.log('Expiration des trials terminés...');

    const now = new Date();
    const expiredTrials = await this.subscriptionRepo.find({
      where: {
        status: SubscriptionStatus.TRIAL,
        trialEndsAt: LessThan(now),
      },
    });

    for (const sub of expiredTrials) {
      sub.status = SubscriptionStatus.EXPIRED;
      await this.subscriptionRepo.save(sub);
      this.logger.log(`Trial expiré pour tenant ${sub.tenantId}`);
    }

    if (expiredTrials.length > 0) {
      this.logger.log(`${expiredTrials.length} trial(s) expiré(s)`);
    }
  }

  /**
   * Premier de chaque mois à 00:05 : reset des compteurs mensuels
   */
  @Cron('5 0 1 * *')
  async resetMonthlyUsage(): Promise<void> {
    this.logger.log('Reset des compteurs mensuels...');

    await this.subscriptionRepo.update(
      {},
      {
        currentMonthExercises: 0,
        currentMonthPhishing: 0,
        usageResetAt: new Date(),
      },
    );

    this.logger.log('Compteurs mensuels réinitialisés');
  }
}
