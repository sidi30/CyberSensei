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

@Entity('tenant_metrics')
@Index(['tenantId', 'timestamp'])
export class TenantMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'int', default: 0 })
  uptime: number;

  @Column({ type: 'int', default: 0 })
  activeUsers: number;

  @Column({ type: 'int', default: 0 })
  exercisesCompletedToday: number;

  @Column({ type: 'float', nullable: true })
  aiLatency: number;

  @Column({ nullable: true })
  version: string;

  @Column({ type: 'jsonb', nullable: true })
  additionalData: Record<string, any>;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.metrics, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}

