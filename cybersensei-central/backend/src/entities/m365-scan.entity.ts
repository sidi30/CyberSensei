import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { M365Finding } from './m365-finding.entity';

export enum ScanStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PARTIAL = 'PARTIAL',
}

export enum ScanTrigger {
  MANUAL = 'MANUAL',
  SCHEDULED = 'SCHEDULED',
  ON_CONNECT = 'ON_CONNECT',
}

@Entity('m365_scans')
@Index(['tenantId', 'createdAt'])
@Index(['status'])
export class M365Scan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({
    type: 'enum',
    enum: ScanStatus,
    default: ScanStatus.PENDING,
  })
  status: ScanStatus;

  @Column({
    type: 'enum',
    enum: ScanTrigger,
    default: ScanTrigger.MANUAL,
  })
  trigger: ScanTrigger;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'int', nullable: true })
  durationMs: number;

  @Column({ type: 'int', default: 0 })
  totalFindings: number;

  @Column({ type: 'int', default: 0 })
  criticalFindings: number;

  @Column({ type: 'int', default: 0 })
  highFindings: number;

  @Column({ type: 'int', default: 0 })
  mediumFindings: number;

  @Column({ type: 'int', default: 0 })
  lowFindings: number;

  @Column({ type: 'int', default: 0 })
  infoFindings: number;

  @Column({ type: 'int', default: 0 })
  apiCallsCount: number;

  @Column({ type: 'simple-array', nullable: true })
  categories: string[];

  @Column({ type: 'simple-array', nullable: true })
  failedCategories: string[];

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @OneToMany(() => M365Finding, (finding) => finding.scan)
  findings: M365Finding[];
}
