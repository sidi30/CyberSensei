import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { DlpPromptEvent } from './dlp-prompt-event.entity';

export enum SensitiveDataCategory {
  PERSONAL_DATA = 'PERSONAL_DATA',
  COMPANY_CONFIDENTIAL = 'COMPANY_CONFIDENTIAL',
  CLIENT_INFORMATION = 'CLIENT_INFORMATION',
  SOURCE_CODE = 'SOURCE_CODE',
  CREDENTIALS_SECRETS = 'CREDENTIALS_SECRETS',
  FINANCIAL_DATA = 'FINANCIAL_DATA',
  LEGAL_DOCUMENTS = 'LEGAL_DOCUMENTS',
  MEDICAL_DATA = 'MEDICAL_DATA',
  INTELLECTUAL_PROPERTY = 'INTELLECTUAL_PROPERTY',
  HEALTH_DATA = 'HEALTH_DATA',
  POLITICAL_OPINION = 'POLITICAL_OPINION',
  UNION_MEMBERSHIP = 'UNION_MEMBERSHIP',
  RELIGIOUS_BELIEF = 'RELIGIOUS_BELIEF',
  SEXUAL_ORIENTATION = 'SEXUAL_ORIENTATION',
  ETHNIC_ORIGIN = 'ETHNIC_ORIGIN',
  BIOMETRIC_DATA = 'BIOMETRIC_DATA',
  CRIMINAL_DATA = 'CRIMINAL_DATA',
}

@Entity('dlp_risk_detections')
export class DlpRiskDetection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  promptEventId: string;

  @Column({ type: 'enum', enum: SensitiveDataCategory })
  category: SensitiveDataCategory;

  @Column({ type: 'float', default: 0 })
  confidence: number;

  @Column({ type: 'varchar', nullable: true })
  method: string;

  @Column({ type: 'text', nullable: true })
  snippetRedacted: string;

  @ManyToOne(() => DlpPromptEvent, { onDelete: 'CASCADE' })
  promptEvent: DlpPromptEvent;

  @CreateDateColumn()
  createdAt: Date;
}
