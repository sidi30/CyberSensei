import { IsObject, IsOptional, IsString, IsNumber, IsEmail } from 'class-validator';

export class EvaluateNIS2Dto {
  @IsObject()
  answers: Record<string, number>;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  sector?: string;

  @IsOptional()
  @IsNumber()
  employeeCount?: number;
}

export class RequestNIS2ReportDto {
  @IsObject()
  answers: Record<string, number>;

  @IsEmail()
  email: string;

  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  sector?: string;

  @IsOptional()
  @IsNumber()
  employeeCount?: number;
}
