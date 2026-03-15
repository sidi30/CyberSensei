import { IsString, IsIn, IsEmail, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const VALID_LEVELS = ['soc1', 'soc2', 'soc3_alert', 'soc3_report', 'nis2', 'monthly'];

export class GenerateReportDto {
  @ApiProperty({ description: 'Scan results JSON' })
  @IsObject()
  scanResults: Record<string, any>;

  @ApiProperty({ enum: VALID_LEVELS, description: 'Report level' })
  @IsString()
  @IsIn(VALID_LEVELS)
  level: string;
}

export class GenerateReportFromScanDto {
  @ApiProperty({ enum: VALID_LEVELS, description: 'Report level' })
  @IsString()
  @IsIn(VALID_LEVELS)
  level: string;
}

export class EmailReportDto {
  @ApiProperty({ description: 'Scan ID' })
  @IsString()
  scanId: string;

  @ApiProperty({ enum: VALID_LEVELS, description: 'Report level' })
  @IsString()
  @IsIn(VALID_LEVELS)
  level: string;

  @ApiProperty({ description: 'Recipient email' })
  @IsEmail()
  recipientEmail: string;

  @ApiProperty({ description: 'Company name' })
  @IsString()
  companyName: string;
}
