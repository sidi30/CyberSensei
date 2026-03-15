import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

export enum PlanType {
  FREE = 'FREE',
  STARTER = 'STARTER',
  BUSINESS = 'BUSINESS',
  ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  TRIAL = 'TRIAL',
  PAST_DUE = 'PAST_DUE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

/**
 * Limites par plan - source de vérité pour le PlanGuard
 */
export const PLAN_LIMITS: Record<
  PlanType,
  {
    maxUsers: number;
    maxExercisesPerMonth: number;
    exerciseTypes: string[];
    maxPhishingCampaignsPerMonth: number;
    dlpLayer1: boolean;
    dlpLayer2: boolean;
    dlpBlocking: boolean;
    m365ScanFrequency: 'one_shot' | 'weekly' | 'daily' | 'realtime';
    aiAdaptive: boolean;
    customReports: boolean;
    sso: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    onPremise: boolean;
    gamification: boolean;
  }
> = {
  [PlanType.FREE]: {
    maxUsers: 5,
    maxExercisesPerMonth: 10,
    exerciseTypes: ['QUIZ'],
    maxPhishingCampaignsPerMonth: 0,
    dlpLayer1: false,
    dlpLayer2: false,
    dlpBlocking: false,
    m365ScanFrequency: 'one_shot',
    aiAdaptive: false,
    customReports: false,
    sso: false,
    apiAccess: false,
    prioritySupport: false,
    onPremise: false,
    gamification: false,
  },
  [PlanType.STARTER]: {
    maxUsers: 25,
    maxExercisesPerMonth: -1, // illimité
    exerciseTypes: ['QUIZ', 'SIMULATION', 'SCENARIO'],
    maxPhishingCampaignsPerMonth: 1,
    dlpLayer1: true,
    dlpLayer2: false,
    dlpBlocking: true,
    m365ScanFrequency: 'weekly',
    aiAdaptive: false,
    customReports: false,
    sso: false,
    apiAccess: false,
    prioritySupport: false,
    onPremise: false,
    gamification: true,
  },
  [PlanType.BUSINESS]: {
    maxUsers: 200,
    maxExercisesPerMonth: -1, // illimité
    exerciseTypes: ['QUIZ', 'SIMULATION', 'SCENARIO', 'CHALLENGE'],
    maxPhishingCampaignsPerMonth: -1, // illimité
    dlpLayer1: true,
    dlpLayer2: true,
    dlpBlocking: true,
    m365ScanFrequency: 'daily',
    aiAdaptive: true,
    customReports: true,
    sso: true,
    apiAccess: false,
    prioritySupport: true,
    onPremise: false,
    gamification: true,
  },
  [PlanType.ENTERPRISE]: {
    maxUsers: -1, // illimité
    maxExercisesPerMonth: -1,
    exerciseTypes: ['QUIZ', 'SIMULATION', 'SCENARIO', 'CHALLENGE'],
    maxPhishingCampaignsPerMonth: -1,
    dlpLayer1: true,
    dlpLayer2: true,
    dlpBlocking: true,
    m365ScanFrequency: 'realtime',
    aiAdaptive: true,
    customReports: true,
    sso: true,
    apiAccess: true,
    prioritySupport: true,
    onPremise: true,
    gamification: true,
  },
};

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  tenantId: string;

  @Column({
    type: 'enum',
    enum: PlanType,
    default: PlanType.FREE,
  })
  plan: PlanType;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.TRIAL,
  })
  status: SubscriptionStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthlyPrice: number;

  @Column({ type: 'timestamp', nullable: true })
  trialEndsAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  currentPeriodStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  currentPeriodEnd: Date;

  @Column({ type: 'int', default: 0 })
  currentMonthExercises: number;

  @Column({ type: 'int', default: 0 })
  currentMonthPhishing: number;

  @Column({ type: 'int', default: 0 })
  activeUsers: number;

  @Column({ type: 'timestamp', nullable: true })
  usageResetAt: Date;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}
