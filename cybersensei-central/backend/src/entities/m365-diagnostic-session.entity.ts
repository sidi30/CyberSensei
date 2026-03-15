import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum DiagnosticStatus {
  PENDING = 'PENDING',
  CONNECTING = 'CONNECTING',
  SCANNING = 'SCANNING',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED',
}

@Entity('m365_diagnostic_sessions')
export class M365DiagnosticSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sessionToken: string;

  @Column({ nullable: true })
  shareToken: string;

  @Column({
    type: 'enum',
    enum: DiagnosticStatus,
    default: DiagnosticStatus.PENDING,
  })
  status: DiagnosticStatus;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  tenantDomain: string;

  @Column({ type: 'text', nullable: true })
  encryptedAccessToken: string;

  @Column({ type: 'text', nullable: true })
  encryptedRefreshToken: string;

  @Column({ type: 'jsonb', nullable: true })
  scanResults: any;

  @Column({ type: 'float', nullable: true })
  globalScore: number;

  @Column({ nullable: true })
  grade: string;

  @Column({ type: 'jsonb', nullable: true })
  categoryScores: any;

  @Column({ type: 'jsonb', nullable: true })
  criticalFindings: any;

  @Column({ type: 'int', nullable: true })
  totalFindings: number;

  @Column({ type: 'int', default: 0 })
  criticalCount: number;

  @Column({ type: 'int', default: 0 })
  highCount: number;

  @Column({ type: 'int', default: 0 })
  mediumCount: number;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: false })
  reportRequested: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
