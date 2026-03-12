import { IsNotEmpty, IsString, IsOptional, IsObject, Allow } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivateExtensionDto {
  @ApiProperty({ example: 'CS-A1B2C3D4', description: "Code d'activation (= licenseKey du tenant)" })
  @IsNotEmpty()
  @IsString()
  activationCode: string;
}

export class SubmitExerciseDto {
  @ApiProperty({ example: 'ext-user-123' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'tenant-uuid' })
  @IsString()
  tenantId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  detailsJSON?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  answers?: any[];
}

export class ChatDto {
  @ApiProperty({ example: "C'est quoi le phishing ?" })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Allow()
  context?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tenantId?: string;
}
