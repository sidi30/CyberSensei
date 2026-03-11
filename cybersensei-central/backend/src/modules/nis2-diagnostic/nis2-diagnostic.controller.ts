import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { NIS2DiagnosticService, NIS2EvaluationResult, CategoryResult } from './nis2-diagnostic.service';
import { EvaluateNIS2Dto, RequestNIS2ReportDto } from './dto/evaluate-nis2.dto';

@Controller('api/diagnostic/nis2')
export class NIS2DiagnosticController {
  constructor(private readonly nis2Service: NIS2DiagnosticService) {}

  /**
   * Get all NIS2 questions grouped by category (PUBLIC)
   */
  @Get('questions')
  getQuestions() {
    return this.nis2Service.getQuestions();
  }

  /**
   * Evaluate answers and get score + recommendations (PUBLIC)
   */
  @Post('evaluate')
  @HttpCode(HttpStatus.OK)
  async evaluate(@Body() dto: EvaluateNIS2Dto, @Req() req: Request) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      'unknown';

    const evaluation = this.nis2Service.evaluate(
      dto.answers,
      dto.employeeCount,
      dto.sector,
    );

    // Save result for analytics (non-blocking)
    this.nis2Service
      .saveResult(
        dto.answers,
        evaluation,
        dto.email,
        dto.companyName,
        dto.sector,
        dto.employeeCount,
        ipAddress,
      )
      .catch(() => {
        /* silently fail */
      });

    return evaluation;
  }

  /**
   * Request full PDF report - captures lead info (PUBLIC)
   */
  @Post('report')
  @HttpCode(HttpStatus.OK)
  async requestReport(@Body() dto: RequestNIS2ReportDto, @Req() req: Request) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      'unknown';

    const evaluation = this.nis2Service.evaluate(
      dto.answers,
      dto.employeeCount,
      dto.sector,
    );

    await this.nis2Service.saveResult(
      dto.answers,
      evaluation,
      dto.email,
      dto.companyName,
      dto.sector,
      dto.employeeCount,
      ipAddress,
      dto.phone,
      true,
    );

    return {
      ...evaluation,
      message:
        'Votre rapport complet sera envoyé à ' +
        dto.email +
        ' dans les prochaines minutes.',
    };
  }
}
