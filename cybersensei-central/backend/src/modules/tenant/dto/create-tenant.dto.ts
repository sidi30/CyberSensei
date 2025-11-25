import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'cybersensei-corp' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'contact@company.com' })
  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @ApiProperty({ example: 'CyberSensei Corp', required: false })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({ example: '123 Cyber Street, Tech City', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  phone?: string;
}

