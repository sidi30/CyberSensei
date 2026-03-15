import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('extension_analytics')
@Index(['tenantId', 'createdAt'])
@Index(['eventName', 'createdAt'])
@Index(['mode'])
export class ExtensionAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'community' })
  tenantId: string;

  @Column({ default: 'community' })
  mode: string;

  @Column()
  extensionVersion: string;

  @Column()
  eventName: string;

  @Column({ type: 'jsonb', nullable: true })
  eventData: Record<string, any>;

  @Column({ type: 'bigint' })
  eventTimestamp: number;

  @Column({ nullable: true })
  sessionId: string;

  @CreateDateColumn()
  createdAt: Date;
}
