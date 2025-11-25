import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('updates_metadata')
export class UpdateMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  version: string;

  @Column({ type: 'text' })
  changelog: string;

  @Column()
  filename: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column()
  mongoFileId: string; // GridFS file ID in MongoDB

  @Column({ nullable: true })
  checksum: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}

