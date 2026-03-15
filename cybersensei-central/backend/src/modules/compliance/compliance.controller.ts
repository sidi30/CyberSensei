import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  Header,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { ComplianceService } from './compliance.service';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { ComplianceResultDto } from './dto/compliance-result.dto';

@ApiTags('Compliance NIS2')
@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  /**
   * GET /compliance/questions
   * Retourne la liste complète des questions NIS2 groupées par domaine.
   */
  @Get('questions')
  @ApiOperation({
    summary: 'Liste des questions du questionnaire NIS2',
    description:
      'Retourne les 25 questions NIS2 groupées par domaine, avec métadonnées et références légales.',
  })
  @ApiResponse({ status: 200, description: 'Questionnaire NIS2 complet' })
  getQuestions() {
    return this.complianceService.getQuestions();
  }

  /**
   * POST /compliance/submit
   * Soumet les réponses au questionnaire et retourne le résultat complet :
   * score global, scores par domaine, plan d'action priorisé.
   */
  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soumettre les réponses et obtenir le résultat de conformité',
    description:
      'Calcule le score NIS2, génère le plan d\'action et persiste la session.',
  })
  @ApiResponse({
    status: 200,
    description: 'Résultat de conformité complet',
    type: ComplianceResultDto,
  })
  async submit(
    @Body() dto: SubmitAnswersDto,
    @Req() req: Request,
  ): Promise<ComplianceResultDto> {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      'unknown';

    return this.complianceService.submitAnswers(dto, ipAddress);
  }

  /**
   * GET /compliance/report/:sessionId
   * Génère et retourne le rapport de conformité en markdown pour une session.
   */
  @Get('report/:sessionId')
  @Header('Content-Type', 'text/markdown; charset=utf-8')
  @ApiOperation({
    summary: 'Rapport de conformité NIS2 en markdown',
    description:
      'Génère un rapport structuré avec scores par domaine, plan d\'action et articles NIS2.',
  })
  @ApiResponse({
    status: 200,
    description: 'Rapport markdown',
    schema: { type: 'string' },
  })
  @ApiResponse({ status: 404, description: 'Session introuvable' })
  async getReport(@Param('sessionId') sessionId: string): Promise<string> {
    return this.complianceService.getReport(sessionId);
  }
}
