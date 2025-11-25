import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CheckUpdateDto {
  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID du tenant (UUID)' 
  })
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({ 
    example: '1.0.0',
    description: 'Version actuelle du node client' 
  })
  @IsString()
  @IsNotEmpty()
  version: string;
}

