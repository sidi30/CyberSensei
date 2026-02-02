import { IsString, IsEnum, IsObject, IsOptional, IsBoolean } from 'class-validator';
import { ExerciseType, ExerciseDifficulty } from '../../../entities/exercise.entity';

export class CreateExerciseDto {
  @IsString()
  topic: string;

  @IsEnum(ExerciseType)
  type: ExerciseType;

  @IsEnum(ExerciseDifficulty)
  difficulty: ExerciseDifficulty;

  @IsObject()
  payloadJSON: Record<string, any>;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  tags?: string;
}
