import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Tenant } from './tenant.entity';

export enum RiskLevel {
  SAFE = 'SAFE',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AiTool {
  CHATGPT = 'CHATGPT',
  GEMINI = 'GEMINI',
  CLAUDE = 'CLAUDE',
  COPILOT = 'COPILOT',
  MISTRAL = 'MISTRAL',
}

@Entity('dlp_prompt_events')
@Index(['tenantId', 'createdAt'])
@Index(['userId', 'createdAt'])
@Index(['riskLevel'])
export class DlpPromptEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column()
  userId: string;

  @Column({ type: 'varchar', length: 64 })
  promptHash: string;

  @Column({ type: 'int', default: 0 })
  riskScore: number;

  @Column({ type: 'enum', enum: RiskLevel, default: RiskLevel.SAFE })
  riskLevel: RiskLevel;

  @Column({ type: 'enum', enum: AiTool, nullable: true })
  aiTool: AiTool;

  @Column({ type: 'boolean', default: false })
  blocked: boolean;

  @Column({ type: 'text', nullable: true })
  sourceUrl: string;

  @Column({ type: 'boolean', default: false })
  containsArticle9: boolean;

  @Column({ type: 'timestamp', nullable: true })
  retentionExpiresAt: Date;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  tenant: Tenant;

  @CreateDateColumn()
  createdAt: Date;
}
