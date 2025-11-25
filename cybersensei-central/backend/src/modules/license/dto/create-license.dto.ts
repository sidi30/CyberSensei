import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt, IsDateString } from 'class-validator';

export class CreateLicenseDto {
  @ApiProperty({ example: 'tenant-uuid-here' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({ example: '2025-12-31T23:59:59Z', required: false })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @ApiProperty({ example: 1000, required: false, description: 'Limite d\'utilisation maximale' })
  @IsInt()
  @IsOptional()
  maxUsageCount?: number;

  @ApiProperty({ example: 'License pour environnement de production', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

