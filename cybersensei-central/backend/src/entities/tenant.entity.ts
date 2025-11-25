import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { License } from './license.entity';
import { TenantMetric } from './tenant-metric.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  contactEmail: string;

  @Column({ unique: true })
  licenseKey: string;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => License, (license) => license.tenant)
  licenses: License[];

  @OneToMany(() => TenantMetric, (metric) => metric.tenant)
  metrics: TenantMetric[];
}

