import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { M365Scan } from './m365-scan.entity';

export enum AlertType {
  SCORE_DEGRADATION = 'SCORE_DEGRADATION',
  NEW_CRITICAL_FINDING = 'NEW_CRITICAL_FINDING',
  NEW_ADMIN = 'NEW_ADMIN',
  MFA_DISABLED = 'MFA_DISABLED',
  NEW_FORWARDING_RULE = 'NEW_FORWARDING_RULE',
  NEW_PUBLIC_SHARE = 'NEW_PUBLIC_SHARE',
  NEW_OAUTH_APP = 'NEW_OAUTH_APP',
  SCAN_FAILED = 'SCAN_FAILED',
}

export enum AlertStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
}

@Entity('m365_alerts')
@Index(['tenantId', 'createdAt'])
@Index(['status'])
export class M365Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid', nullable: true })
  scanId: string;

  @Column({
    type: 'enum',
    enum: AlertType,
  })
  type: AlertType;

  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.PENDING,
  })
  status: AlertStatus;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar' })
  severity: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @Column({ type: 'varchar', nullable: true })
  recipientEmail: string;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ManyToOne(() => M365Scan, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'scanId' })
  scan: M365Scan;
}
