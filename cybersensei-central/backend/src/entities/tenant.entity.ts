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

export enum TenantSector {
  BANKING = 'BANKING',
  HEALTHCARE = 'HEALTHCARE',
  INDUSTRY = 'INDUSTRY',
  RETAIL = 'RETAIL',
  TECH = 'TECH',
  EDUCATION = 'EDUCATION',
  GOVERNMENT = 'GOVERNMENT',
  ENERGY = 'ENERGY',
  TELECOM = 'TELECOM',
  LEGAL = 'LEGAL',
}

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

  @Column({ unique: true, nullable: true })
  activationCode: string;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  sector: TenantSector;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => License, (license) => license.tenant)
  licenses: License[];

  @OneToMany(() => TenantMetric, (metric) => metric.tenant)
  metrics: TenantMetric[];
}

