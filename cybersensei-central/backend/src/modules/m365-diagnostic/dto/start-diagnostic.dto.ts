import { IsEmail, IsString, IsOptional } from 'class-validator';

export class StartDiagnosticDto {
  @IsEmail()
  email: string;

  @IsString()
  companyName: string;
}

export class RequestFullReportDto {
  @IsEmail()
  email: string;

  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
