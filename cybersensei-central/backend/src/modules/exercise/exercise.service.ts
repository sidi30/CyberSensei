import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise, ExerciseDifficulty, ExerciseType } from '../../entities/exercise.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

export interface ExerciseExportDto {
  centralId: string;
  topic: string;
  type: string;
  difficulty: string;
  payloadJSON: Record<string, any>;
  version: string;
  active: boolean;
}

export interface ExerciseExportPayload {
  version: string;
  timestamp: string;
  exercises: ExerciseExportDto[];
  deletions: string[];
}

@Injectable()
export class ExerciseService {
  private readonly logger = new Logger(ExerciseService.name);
  private deletedExerciseIds: string[] = [];

  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
  ) {}

  async create(createExerciseDto: CreateExerciseDto): Promise<Exercise> {
    const exercise = this.exerciseRepository.create({
      ...createExerciseDto,
      version: createExerciseDto.version || '1.0.0',
      active: createExerciseDto.active ?? true,
    });
    return await this.exerciseRepository.save(exercise);
  }

  async findAll(): Promise<Exercise[]> {
    return await this.exerciseRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findActive(): Promise<Exercise[]> {
    return await this.exerciseRepository.find({
      where: { active: true },
      order: { topic: 'ASC', difficulty: 'ASC' },
    });
  }

  async findByTopic(topic: string): Promise<Exercise[]> {
    return await this.exerciseRepository.find({
      where: { topic, active: true },
      order: { difficulty: 'ASC' },
    });
  }

  async findByDifficulty(difficulty: ExerciseDifficulty): Promise<Exercise[]> {
    return await this.exerciseRepository.find({
      where: { difficulty, active: true },
      order: { topic: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Exercise> {
    const exercise = await this.exerciseRepository.findOne({ where: { id } });
    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }
    return exercise;
  }

  async update(id: string, updateExerciseDto: UpdateExerciseDto): Promise<Exercise> {
    const exercise = await this.findOne(id);

    // Increment version if content changed
    if (updateExerciseDto.payloadJSON) {
      const [major, minor, patch] = (exercise.version || '1.0.0').split('.').map(Number);
      exercise.version = `${major}.${minor}.${patch + 1}`;
    }

    Object.assign(exercise, updateExerciseDto);
    return await this.exerciseRepository.save(exercise);
  }

  async remove(id: string): Promise<void> {
    const exercise = await this.findOne(id);
    this.deletedExerciseIds.push(id);
    await this.exerciseRepository.remove(exercise);
    this.logger.log(`Exercise ${id} deleted`);
  }

  async softDelete(id: string): Promise<Exercise> {
    const exercise = await this.findOne(id);
    exercise.active = false;
    return await this.exerciseRepository.save(exercise);
  }

  /**
   * Generate exercises.json for sync to Node instances
   */
  async exportForSync(includeInactive = false): Promise<ExerciseExportPayload> {
    const exercises = includeInactive
      ? await this.findAll()
      : await this.findActive();

    const exportedExercises: ExerciseExportDto[] = exercises.map((e) => ({
      centralId: e.id,
      topic: e.topic,
      type: e.type,
      difficulty: e.difficulty,
      payloadJSON: e.payloadJSON,
      version: e.version,
      active: e.active,
    }));

    const payload: ExerciseExportPayload = {
      version: this.calculateExportVersion(),
      timestamp: new Date().toISOString(),
      exercises: exportedExercises,
      deletions: [...this.deletedExerciseIds],
    };

    // Clear deletions after export
    this.deletedExerciseIds = [];

    this.logger.log(
      `Exported ${exportedExercises.length} exercises for sync (version: ${payload.version})`,
    );

    return payload;
  }

  /**
   * Get statistics about exercises
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    byTopic: Record<string, number>;
    byDifficulty: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const exercises = await this.findAll();
    const active = exercises.filter((e) => e.active);

    const byTopic: Record<string, number> = {};
    const byDifficulty: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const e of active) {
      byTopic[e.topic] = (byTopic[e.topic] || 0) + 1;
      byDifficulty[e.difficulty] = (byDifficulty[e.difficulty] || 0) + 1;
      byType[e.type] = (byType[e.type] || 0) + 1;
    }

    return {
      total: exercises.length,
      active: active.length,
      byTopic,
      byDifficulty,
      byType,
    };
  }

  /**
   * Bulk create exercises
   */
  async bulkCreate(exercises: CreateExerciseDto[]): Promise<Exercise[]> {
    const created: Exercise[] = [];
    for (const dto of exercises) {
      const exercise = await this.create(dto);
      created.push(exercise);
    }
    this.logger.log(`Bulk created ${created.length} exercises`);
    return created;
  }

  private calculateExportVersion(): string {
    // Generate version based on date and random suffix
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${dateStr}.${suffix}`;
  }
}
