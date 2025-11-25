import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum ErrorLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export enum ErrorSource {
  NODE = 'NODE',
  BACKEND = 'BACKEND',
  SYSTEM = 'SYSTEM',
}

@Entity('error_logs')
@Index(['tenantId', 'timestamp'])
@Index(['level', 'timestamp'])
@Index(['source', 'timestamp'])
export class ErrorLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  @Column({
    type: 'enum',
    enum: ErrorLevel,
    default: ErrorLevel.ERROR,
  })
  level: ErrorLevel;

  @Column({
    type: 'enum',
    enum: ErrorSource,
    default: ErrorSource.BACKEND,
  })
  source: ErrorSource;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  stack: string;

  @Column({ nullable: true })
  endpoint: string;

  @Column({ nullable: true })
  method: string;

  @Column({ type: 'int', nullable: true })
  statusCode: number;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  context: Record<string, any>;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ default: false })
  resolved: boolean;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ nullable: true })
  resolvedBy: string;

  @Column({ type: 'text', nullable: true })
  resolutionNotes: string;
}

