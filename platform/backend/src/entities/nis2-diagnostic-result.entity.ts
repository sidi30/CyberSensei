import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('nis2_diagnostic_results')
export class NIS2DiagnosticResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  sector: string;

  @Column({ type: 'int', nullable: true })
  employeeCount: number;

  @Column({ type: 'jsonb' })
  answers: Record<string, number>;

  @Column({ type: 'float' })
  globalScore: number;

  @Column()
  grade: string;

  @Column({ type: 'jsonb' })
  categoryScores: any;

  @Column({ type: 'jsonb', nullable: true })
  recommendations: any;

  @Column({ default: false })
  isNIS2Subject: boolean;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: false })
  reportRequested: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
