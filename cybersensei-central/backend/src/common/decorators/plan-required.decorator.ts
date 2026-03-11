import { SetMetadata } from '@nestjs/common';
import { PlanType } from '../../entities/subscription.entity';

export const PLAN_KEY = 'requiredPlan';

/**
 * Décorateur pour restreindre l'accès à un endpoint selon le plan minimum requis.
 * Usage: @PlanRequired(PlanType.STARTER) ou @PlanRequired(PlanType.BUSINESS)
 *
 * Le tenantId doit être présent dans les params de la requête (route param ou body).
 */
export const PlanRequired = (...plans: PlanType[]) =>
  SetMetadata(PLAN_KEY, plans);
