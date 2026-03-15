import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('compliance_sessions')
export class ComplianceSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  sector: string;

  @Column({ type: 'int', nullable: true })
  employeeCount: number;

  @Column({ type: 'jsonb' })
  answers: Record<string, string>;

  @Column({ type: 'float' })
  scoreGlobal: number;

  @Column()
  niveauGlobal: string;

  @Column({ type: 'jsonb' })
  scoresParDomaine: any;

  @Column({ type: 'jsonb' })
  planAction: any;

  @Column({ type: 'text', nullable: true })
  reportMarkdown: string;

  @Column({ nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
