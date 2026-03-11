import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsArray,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AiProvider, GenerationFrequency } from '../../../entities/ai-config.entity';
import { ExerciseDifficulty } from '../../../entities/exercise.entity';

export class CreateAiConfigDto {
  @ApiProperty({ example: 'uuid-of-tenant' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({ enum: AiProvider, default: AiProvider.OPENAI })
  @IsEnum(AiProvider)
  @IsOptional()
  provider?: AiProvider;

  @ApiProperty({ example: 'sk-...' })
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @ApiProperty({ default: false, required: false })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiProperty({ enum: GenerationFrequency, default: GenerationFrequency.ON_DEMAND, required: false })
  @IsEnum(GenerationFrequency)
  @IsOptional()
  generationFrequency?: GenerationFrequency;
}

export class UpdateAiConfigDto {
  @ApiProperty({ enum: AiProvider, required: false })
  @IsEnum(AiProvider)
  @IsOptional()
  provider?: AiProvider;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  apiKey?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiProperty({ enum: GenerationFrequency, required: false })
  @IsEnum(GenerationFrequency)
  @IsOptional()
  generationFrequency?: GenerationFrequency;
}

export class GenerateExercisesDto {
  @ApiProperty({ example: 'uuid-of-tenant' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({
    example: ['Phishing', 'Ransomware'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  topics?: string[];

  @ApiProperty({ enum: ExerciseDifficulty, required: false })
  @IsEnum(ExerciseDifficulty)
  @IsOptional()
  difficulty?: ExerciseDifficulty;

  @ApiProperty({ default: 10, required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(20)
  count?: number;
}
