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

export enum ScoreGrade {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
}

@Entity('m365_scores')
@Index(['scanId'], { unique: true })
@Index(['tenantId', 'calculatedAt'])
export class M365Score {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  scanId: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'int' })
  globalScore: number;

  @Column({
    type: 'enum',
    enum: ScoreGrade,
  })
  globalGrade: ScoreGrade;

  @Column({ type: 'jsonb' })
  categoryScores: Record<string, { score: number; grade: string; findings: number; weight: number }>;

  @Column({ type: 'int', default: 0 })
  totalFindings: number;

  @Column({ type: 'int', default: 0 })
  criticalFindings: number;

  @Column({ type: 'int', default: 0 })
  highFindings: number;

  @Column({ type: 'int', nullable: true })
  previousScore: number;

  @Column({ type: 'varchar', nullable: true })
  previousGrade: string;

  @Column({ type: 'int', nullable: true })
  scoreDelta: number;

  @Column({ type: 'timestamp' })
  calculatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => M365Scan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scanId' })
  scan: M365Scan;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}
