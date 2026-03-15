import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { TenantSector } from '../../../entities/tenant.entity';

export class UpdateTenantDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({ enum: TenantSector, required: false, example: 'TECH' })
  @IsEnum(TenantSector)
  @IsOptional()
  sector?: TenantSector;
}

