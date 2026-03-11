import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import {
  Subscription,
  PlanType,
  SubscriptionStatus,
} from '../../entities/subscription.entity';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey);
    } else {
      this.logger.warn('STRIPE_SECRET_KEY not configured - Stripe disabled');
    }
  }

  private getPriceId(planType: PlanType): string {
    const priceMap: Record<string, string> = {
      [PlanType.STARTER]:
        this.configService.get('STRIPE_STARTER_PRICE_ID') || '',
      [PlanType.BUSINESS]:
        this.configService.get('STRIPE_BUSINESS_PRICE_ID') || '',
      [PlanType.ENTERPRISE]:
        this.configService.get('STRIPE_ENTERPRISE_PRICE_ID') || '',
    };

    const priceId = priceMap[planType];
    if (!priceId) {
      throw new BadRequestException(
        `Prix Stripe non configuré pour le plan ${planType}`,
      );
    }
    return priceId;
  }

  async createCustomer(
    email: string,
    name: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Customer> {
    this.ensureStripeConfigured();
    return this.stripe.customers.create({
      email,
      name,
      metadata: metadata || {},
    });
  }

  async createCheckoutSession(
    tenantId: string,
    planType: PlanType,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ checkoutUrl: string }> {
    this.ensureStripeConfigured();

    if (planType === PlanType.FREE) {
      throw new BadRequestException('Le plan gratuit ne nécessite pas de paiement');
    }

    const sub = await this.subscriptionRepo.findOne({
      where: { tenantId },
      relations: ['tenant'],
    });

    if (!sub) {
      throw new BadRequestException('Aucun abonnement trouvé pour ce tenant');
    }

    // Create or reuse Stripe customer
    let customerId = sub.stripeCustomerId;
    if (!customerId) {
      const customer = await this.createCustomer(
        sub.tenant?.contactEmail || `tenant-${tenantId}@cybersensei.fr`,
        sub.tenant?.companyName || sub.tenant?.name || tenantId,
        { tenantId },
      );
      customerId = customer.id;
      sub.stripeCustomerId = customerId;
      await this.subscriptionRepo.save(sub);
    }

    const priceId = this.getPriceId(planType);

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl,
      metadata: { tenantId, planType },
      locale: 'fr',
      tax_id_collection: { enabled: true },
      allow_promotion_codes: true,
    });

    this.logger.log(
      `Checkout session created for tenant ${tenantId} (plan: ${planType})`,
    );

    return { checkoutUrl: session.url };
  }

  async createBillingPortalSession(
    stripeCustomerId: string,
    returnUrl: string,
  ): Promise<{ portalUrl: string }> {
    this.ensureStripeConfigured();

    const session = await this.stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    return { portalUrl: session.url };
  }

  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    this.ensureStripeConfigured();

    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret not configured');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`Stripe webhook received: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(
          event.data.object as Stripe.Invoice,
        );
        break;

      case 'invoice.payment_succeeded':
        this.logger.log(
          `Payment succeeded for invoice ${(event.data.object as Stripe.Invoice).id}`,
        );
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  async getInvoices(
    stripeCustomerId: string,
  ): Promise<Stripe.Invoice[]> {
    this.ensureStripeConfigured();

    const invoices = await this.stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 20,
    });

    return invoices.data;
  }

  private async handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const tenantId = session.metadata?.tenantId;
    const planType = session.metadata?.planType as PlanType;

    if (!tenantId || !planType) {
      this.logger.warn('Missing metadata in checkout session');
      return;
    }

    const sub = await this.subscriptionRepo.findOne({
      where: { tenantId },
    });

    if (!sub) {
      this.logger.warn(`No subscription found for tenant ${tenantId}`);
      return;
    }

    const priceMap: Record<PlanType, number> = {
      [PlanType.FREE]: 0,
      [PlanType.STARTER]: 49,
      [PlanType.BUSINESS]: 149,
      [PlanType.ENTERPRISE]: 500,
    };

    sub.plan = planType;
    sub.status = SubscriptionStatus.ACTIVE;
    sub.stripeCustomerId = session.customer as string;
    sub.stripeSubscriptionId = session.subscription as string;
    sub.monthlyPrice = priceMap[planType];
    sub.currentPeriodStart = new Date();
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);
    sub.currentPeriodEnd = periodEnd;

    await this.subscriptionRepo.save(sub);
    this.logger.log(
      `Subscription activated for tenant ${tenantId} (plan: ${planType})`,
    );
  }

  private async handleSubscriptionUpdated(
    stripeSub: Stripe.Subscription,
  ): Promise<void> {
    const sub = await this.subscriptionRepo.findOne({
      where: { stripeSubscriptionId: stripeSub.id },
    });

    if (!sub) return;

    if (stripeSub.status === 'active') {
      sub.status = SubscriptionStatus.ACTIVE;
    } else if (stripeSub.status === 'past_due') {
      sub.status = SubscriptionStatus.PAST_DUE;
    }

    const item = stripeSub.items?.data?.[0];
    if (item) {
      sub.currentPeriodStart = new Date(item.current_period_start * 1000);
      sub.currentPeriodEnd = new Date(item.current_period_end * 1000);
    }

    await this.subscriptionRepo.save(sub);
  }

  private async handleSubscriptionDeleted(
    stripeSub: Stripe.Subscription,
  ): Promise<void> {
    const sub = await this.subscriptionRepo.findOne({
      where: { stripeSubscriptionId: stripeSub.id },
    });

    if (!sub) return;

    sub.plan = PlanType.FREE;
    sub.status = SubscriptionStatus.CANCELLED;
    sub.monthlyPrice = 0;
    sub.stripeSubscriptionId = null;

    await this.subscriptionRepo.save(sub);
    this.logger.log(
      `Subscription cancelled for tenant ${sub.tenantId} - downgraded to FREE`,
    );
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    const sub = await this.subscriptionRepo.findOne({
      where: { stripeCustomerId: customerId },
    });

    if (!sub) return;

    sub.status = SubscriptionStatus.PAST_DUE;
    await this.subscriptionRepo.save(sub);
    this.logger.warn(
      `Payment failed for tenant ${sub.tenantId} - marked as PAST_DUE`,
    );
  }

  private ensureStripeConfigured(): void {
    if (!this.stripe) {
      throw new BadRequestException(
        'Stripe n\'est pas configuré. Ajoutez STRIPE_SECRET_KEY dans les variables d\'environnement.',
      );
    }
  }
}
