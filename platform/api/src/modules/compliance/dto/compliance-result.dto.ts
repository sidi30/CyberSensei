import { ApiProperty } from '@nestjs/swagger';

/** Score détaillé pour un domaine NIS2 */
export class DomainScoreDto {
  @ApiProperty({ example: 'gouvernance' })
  domaine: string;

  @ApiProperty({ example: 'Gouvernance' })
  label: string;

  @ApiProperty({ example: 73 })
  score: number;

  @ApiProperty({ example: 'Conforme', enum: ['Non conforme', 'En cours', 'Conforme'] })
  niveau: string;

  @ApiProperty({ example: 2 })
  questionsTotal: number;

  @ApiProperty({ example: 1 })
  questionsConformes: number;
}

/** Action du plan de remédiation */
export class ActionPlanItemDto {
  @ApiProperty({ example: 'P1' })
  priorite: string;

  @ApiProperty({ example: 'GOV-01' })
  questionId: string;

  @ApiProperty({ example: 'gouvernance' })
  domaine: string;

  @ApiProperty({ example: 'Article 20, paragraphe 1' })
  articleNis2: string;

  @ApiProperty({ example: 'non' })
  reponse: string;

  @ApiProperty({ example: 5 })
  poids: number;

  @ApiProperty()
  texteQuestion: string;

  @ApiProperty()
  recommandation: string;
}

/** Résultat complet de la conformité NIS2 */
export class ComplianceResultDto {
  @ApiProperty({ example: 'uuid-session-id' })
  sessionId: string;

  @ApiProperty({ example: 'Acme Corp' })
  companyName: string;

  @ApiProperty({ example: 62 })
  scoreGlobal: number;

  @ApiProperty({ example: 'En cours', enum: ['Non conforme', 'En cours', 'Conforme'] })
  niveauGlobal: string;

  @ApiProperty({ type: [DomainScoreDto] })
  scoresParDomaine: DomainScoreDto[];

  @ApiProperty({ type: [ActionPlanItemDto] })
  planAction: ActionPlanItemDto[];

  @ApiProperty({ example: '2026-03-14T10:30:00.000Z' })
  timestamp: string;
}
