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

export enum FindingCategory {
  MFA = 'MFA',
  ADMIN_ROLES = 'ADMIN_ROLES',
  EMAIL_FORWARDING = 'EMAIL_FORWARDING',
  SHARING = 'SHARING',
  EMAIL_SECURITY = 'EMAIL_SECURITY',
  OAUTH_APPS = 'OAUTH_APPS',
  PASSWORD_POLICY = 'PASSWORD_POLICY',
  CONDITIONAL_ACCESS = 'CONDITIONAL_ACCESS',
  MAILBOX = 'MAILBOX',
  SIGN_IN = 'SIGN_IN',
}

export enum FindingSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

@Entity('m365_findings')
@Index(['scanId', 'category'])
@Index(['tenantId', 'severity'])
@Index(['checkId'])
export class M365Finding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  scanId: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar' })
  checkId: string;

  @Column({
    type: 'enum',
    enum: FindingCategory,
  })
  category: FindingCategory;

  @Column({
    type: 'enum',
    enum: FindingSeverity,
  })
  severity: FindingSeverity;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  resource: string;

  @Column({ type: 'varchar', nullable: true })
  resourceType: string;

  @Column({ type: 'jsonb', nullable: true })
  currentValue: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  expectedValue: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  remediation: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => M365Scan, (scan) => scan.findings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scanId' })
  scan: M365Scan;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}
