import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PLAN_KEY } from '../decorators/plan-required.decorator';
import { PlanType } from '../../entities/subscription.entity';
import { SubscriptionService } from '../../modules/subscription/subscription.service';

const PLAN_HIERARCHY: PlanType[] = [
  PlanType.FREE,
  PlanType.STARTER,
  PlanType.BUSINESS,
  PlanType.ENTERPRISE,
];

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlans = this.reflector.getAllAndOverride<PlanType[]>(
      PLAN_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No plan restriction on this endpoint
    if (!requiredPlans || requiredPlans.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenantId =
      request.params?.tenantId || request.body?.tenantId || request.query?.tenantId;

    if (!tenantId) {
      throw new ForbiddenException(
        'tenantId requis pour vérifier le plan',
      );
    }

    try {
      const subscription =
        await this.subscriptionService.findByTenantId(tenantId);

      const currentLevel = PLAN_HIERARCHY.indexOf(subscription.plan);
      const minRequiredLevel = Math.min(
        ...requiredPlans.map((p) => PLAN_HIERARCHY.indexOf(p)),
      );

      if (currentLevel < minRequiredLevel) {
        const planLabels: Record<PlanType, string> = {
          [PlanType.FREE]: 'Gratuit',
          [PlanType.STARTER]: 'Starter (79€/mois)',
          [PlanType.BUSINESS]: 'Business (199€/mois)',
          [PlanType.ENTERPRISE]: 'Enterprise',
        };
        throw new ForbiddenException({
          message: `Cette fonctionnalité nécessite le plan ${planLabels[requiredPlans[0]]} minimum.`,
          currentPlan: subscription.plan,
          requiredPlan: requiredPlans[0],
          upgradeRequired: true,
        });
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      // No subscription found - treat as FREE
      throw new ForbiddenException({
        message:
          'Aucun abonnement actif trouvé. Veuillez activer un plan.',
        upgradeRequired: true,
      });
    }
  }
}
