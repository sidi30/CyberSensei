import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  IsUUID,
} from 'class-validator';

export class TelemetryDto {
  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID du tenant (UUID)' 
  })
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({ 
    example: 86400, 
    description: 'Uptime en secondes depuis le dernier redémarrage' 
  })
  @IsInt()
  @Min(0)
  uptime: number;

  @ApiProperty({ 
    example: 42, 
    description: 'Nombre d\'utilisateurs actuellement actifs' 
  })
  @IsInt()
  @Min(0)
  activeUsers: number;

  @ApiProperty({ 
    example: 156, 
    description: 'Nombre d\'exercices complétés aujourd\'hui' 
  })
  @IsInt()
  @Min(0)
  exercisesCompletedToday: number;

  @ApiProperty({ 
    example: 247.5, 
    description: 'Latence moyenne de l\'IA en millisecondes',
    required: false 
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  aiLatency?: number;

  @ApiProperty({ 
    example: '1.2.0', 
    description: 'Version du node CyberSensei',
    required: false 
  })
  @IsString()
  @IsOptional()
  version?: string;

  @ApiProperty({ 
    example: { 
      cpuUsage: 45.2, 
      memoryUsage: 62.8, 
      diskUsage: 38.1,
      errorCount: 3
    },
    description: 'Données additionnelles (JSONB)',
    required: false 
  })
  @IsOptional()
  additionalData?: Record<string, any>;
}
