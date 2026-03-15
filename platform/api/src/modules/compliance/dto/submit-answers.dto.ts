import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsNumber,
  IsEnum,
  IsObject,
  ValidateNested,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Réponses possibles pour chaque question NIS2 */
export enum AnswerValue {
  OUI = 'oui',
  NON = 'non',
  PARTIEL = 'partiel',
  NA = 'na',
}

export class SubmitAnswersDto {
  @ApiProperty({
    description: 'Réponses au questionnaire NIS2 — clé = ID de la question, valeur = réponse',
    example: { 'GOV-01': 'oui', 'GOV-02': 'partiel', 'RSK-01': 'non' },
  })
  @IsObject()
  @IsNotEmpty()
  answers: Record<string, AnswerValue>;

  @ApiProperty({ example: 'Acme Corp', description: 'Nom de l\'entreprise' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiPropertyOptional({ example: 'rssi@acme.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Énergie' })
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiPropertyOptional({ example: 250 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  employeeCount?: number;
}
