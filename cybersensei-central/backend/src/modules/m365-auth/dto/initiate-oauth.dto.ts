import { IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitiateOAuthDto {
  @ApiProperty({ description: 'Tenant ID to connect' })
  @IsUUID()
  tenantId: string;

  @ApiProperty({ description: 'Admin email initiating connection', required: false })
  @IsOptional()
  @IsString()
  adminEmail?: string;
}
