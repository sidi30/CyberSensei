import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ExerciseType {
  QUIZ = 'QUIZ',
  SIMULATION = 'SIMULATION',
  SCENARIO = 'SCENARIO',
  CHALLENGE = 'CHALLENGE',
}

export enum ExerciseDifficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  topic: string;

  @Column({
    type: 'enum',
    enum: ExerciseType,
    default: ExerciseType.QUIZ,
  })
  type: ExerciseType;

  @Column({
    type: 'enum',
    enum: ExerciseDifficulty,
    default: ExerciseDifficulty.BEGINNER,
  })
  difficulty: ExerciseDifficulty;

  @Column({ type: 'jsonb', nullable: true })
  payloadJSON: Record<string, any>;

  @Column({ default: '1.0.0' })
  version: string;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  tags: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
