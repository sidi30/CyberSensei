import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OAuthCallbackDto {
  @ApiProperty({ description: 'Authorization code from Microsoft' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: 'State parameter for CSRF protection' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ description: 'Admin consent result' })
  @IsOptional()
  @IsString()
  admin_consent?: string;

  @ApiProperty({ description: 'Microsoft tenant ID' })
  @IsOptional()
  @IsString()
  tenant?: string;

  @ApiProperty({ description: 'Error from Microsoft' })
  @IsOptional()
  @IsString()
  error?: string;

  @ApiProperty({ description: 'Error description from Microsoft' })
  @IsOptional()
  @IsString()
  error_description?: string;
}
