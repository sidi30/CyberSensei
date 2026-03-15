import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { Tenant } from './tenant.entity';

export enum ScanTriggerType {
  SCHEDULED_DAILY = 'SCHEDULED_DAILY',
  SCHEDULED_WEEKLY = 'SCHEDULED_WEEKLY',
  MANUAL = 'MANUAL',
}

export enum ScanHistoryStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('scan_history')
@Index(['tenantId', 'createdAt'])
@Index(['status'])
export class ScanHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column()
  domain: string;

  @Column({ type: 'int', nullable: true })
  score: number;

  @Column({ type: 'int', nullable: true })
  previousScore: number;

  @Column({ type: 'int', nullable: true })
  deltaScore: number;

  @Column({
    type: 'enum',
    enum: ScanHistoryStatus,
    default: ScanHistoryStatus.PENDING,
  })
  status: ScanHistoryStatus;

  @Column({
    type: 'enum',
    enum: ScanTriggerType,
    default: ScanTriggerType.SCHEDULED_DAILY,
  })
  trigger: ScanTriggerType;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newRisks: string[];

  @Column({ type: 'jsonb', nullable: true })
  resolvedRisks: string[];

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'int', nullable: true })
  durationMs: number;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  tenant: Tenant;

  @CreateDateColumn()
  createdAt: Date;
}
