import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('m365_connections')
@Index(['tenantId'], { unique: true })
export class M365Connection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'text' })
  accessTokenEncrypted: string;

  @Column({ type: 'text', nullable: true })
  tokenIv: string;

  @Column({ type: 'text', nullable: true })
  tokenAuthTag: string;

  @Column({ type: 'timestamp', nullable: true })
  tokenExpiresAt: Date;

  @Column({ type: 'varchar' })
  microsoftTenantId: string;

  @Column({ type: 'varchar', nullable: true })
  microsoftTenantDomain: string;

  @Column({ type: 'text', nullable: true })
  grantedScopes: string;

  @Column({ type: 'varchar', nullable: true })
  connectedByEmail: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastScanAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastTokenRefreshAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}
