import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Subscription,
  PlanType,
  SubscriptionStatus,
  PLAN_LIMITS,
} from '../../entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepo.find({
      relations: ['tenant'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByTenantId(tenantId: string): Promise<Subscription> {
    const sub = await this.subscriptionRepo.findOne({
      where: { tenantId },
      relations: ['tenant'],
    });
    if (!sub) {
      throw new NotFoundException(
        `Aucun abonnement trouvé pour le tenant ${tenantId}`,
      );
    }
    return sub;
  }

  async findById(id: string): Promise<Subscription> {
    const sub = await this.subscriptionRepo.findOne({
      where: { id },
      relations: ['tenant'],
    });
    if (!sub) {
      throw new NotFoundException(`Abonnement ${id} introuvable`);
    }
    return sub;
  }

  async create(dto: CreateSubscriptionDto): Promise<Subscription> {
    const existing = await this.subscriptionRepo.findOne({
      where: { tenantId: dto.tenantId },
    });
    if (existing) {
      throw new ConflictException(
        `Ce tenant a déjà un abonnement (plan: ${existing.plan})`,
      );
    }

    const plan = dto.plan || PlanType.FREE;
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);

    const priceMap: Record<PlanType, number> = {
      [PlanType.FREE]: 0,
      [PlanType.STARTER]: 49,
      [PlanType.BUSINESS]: 149,
      [PlanType.ENTERPRISE]: 500,
    };

    const sub = this.subscriptionRepo.create({
      tenantId: dto.tenantId,
      plan,
      status:
        plan === PlanType.FREE
          ? SubscriptionStatus.ACTIVE
          : SubscriptionStatus.TRIAL,
      monthlyPrice: dto.monthlyPrice ?? priceMap[plan],
      trialEndsAt,
      currentPeriodStart: new Date(),
      currentPeriodEnd: trialEndsAt,
      usageResetAt: new Date(),
    });

    return this.subscriptionRepo.save(sub);
  }

  async upgrade(tenantId: string, dto: UpdateSubscriptionDto): Promise<Subscription> {
    const sub = await this.findByTenantId(tenantId);

    if (dto.plan) {
      const planOrder = [PlanType.FREE, PlanType.STARTER, PlanType.BUSINESS, PlanType.ENTERPRISE];
      const currentIdx = planOrder.indexOf(sub.plan);
      const newIdx = planOrder.indexOf(dto.plan);

      // Allow both upgrade and downgrade from admin
      if (newIdx === currentIdx) {
        throw new ConflictException(`Le tenant est déjà sur le plan ${dto.plan}`);
      }

      sub.plan = dto.plan;
    }

    if (dto.status) sub.status = dto.status;
    if (dto.monthlyPrice !== undefined) sub.monthlyPrice = dto.monthlyPrice;
    if (dto.currentPeriodEnd) sub.currentPeriodEnd = new Date(dto.currentPeriodEnd);

    return this.subscriptionRepo.save(sub);
  }

  async checkFeatureAccess(
    tenantId: string,
    feature: keyof (typeof PLAN_LIMITS)[PlanType.FREE],
  ): Promise<{ allowed: boolean; currentPlan: PlanType; limit: any }> {
    const sub = await this.findByTenantId(tenantId);

    if (
      sub.status === SubscriptionStatus.CANCELLED ||
      sub.status === SubscriptionStatus.EXPIRED
    ) {
      return { allowed: false, currentPlan: sub.plan, limit: null };
    }

    const limits = PLAN_LIMITS[sub.plan];
    const limit = limits[feature];

    return { allowed: !!limit, currentPlan: sub.plan, limit };
  }

  async checkUsageLimit(
    tenantId: string,
    type: 'exercise' | 'phishing' | 'user',
  ): Promise<{ allowed: boolean; current: number; max: number; plan: PlanType }> {
    const sub = await this.findByTenantId(tenantId);
    const limits = PLAN_LIMITS[sub.plan];

    // Reset monthly counters if needed
    await this.resetMonthlyUsageIfNeeded(sub);

    let current: number;
    let max: number;

    switch (type) {
      case 'exercise':
        current = sub.currentMonthExercises;
        max = limits.maxExercisesPerMonth;
        break;
      case 'phishing':
        current = sub.currentMonthPhishing;
        max = limits.maxPhishingCampaignsPerMonth;
        break;
      case 'user':
        current = sub.activeUsers;
        max = limits.maxUsers;
        break;
    }

    // -1 means unlimited
    const allowed = max === -1 || current < max;

    return { allowed, current, max, plan: sub.plan };
  }

  async incrementUsage(
    tenantId: string,
    type: 'exercise' | 'phishing',
  ): Promise<void> {
    const sub = await this.findByTenantId(tenantId);
    await this.resetMonthlyUsageIfNeeded(sub);

    if (type === 'exercise') {
      sub.currentMonthExercises += 1;
    } else {
      sub.currentMonthPhishing += 1;
    }

    await this.subscriptionRepo.save(sub);
  }

  async getStats(): Promise<{
    total: number;
    byPlan: Record<PlanType, number>;
    byStatus: Record<SubscriptionStatus, number>;
    mrr: number;
  }> {
    const subs = await this.subscriptionRepo.find();

    const byPlan = {} as Record<PlanType, number>;
    const byStatus = {} as Record<SubscriptionStatus, number>;
    let mrr = 0;

    for (const plan of Object.values(PlanType)) byPlan[plan] = 0;
    for (const status of Object.values(SubscriptionStatus)) byStatus[status] = 0;

    for (const sub of subs) {
      byPlan[sub.plan]++;
      byStatus[sub.status]++;
      if (
        sub.status === SubscriptionStatus.ACTIVE ||
        sub.status === SubscriptionStatus.TRIAL
      ) {
        mrr += Number(sub.monthlyPrice);
      }
    }

    return { total: subs.length, byPlan, byStatus, mrr };
  }

  private async resetMonthlyUsageIfNeeded(sub: Subscription): Promise<void> {
    if (!sub.usageResetAt) {
      sub.usageResetAt = new Date();
      await this.subscriptionRepo.save(sub);
      return;
    }

    const now = new Date();
    const resetDate = new Date(sub.usageResetAt);
    const diffDays = (now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays >= 30) {
      sub.currentMonthExercises = 0;
      sub.currentMonthPhishing = 0;
      sub.usageResetAt = now;
      await this.subscriptionRepo.save(sub);
    }
  }
}
