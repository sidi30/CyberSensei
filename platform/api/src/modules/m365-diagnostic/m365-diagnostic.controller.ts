import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { M365DiagnosticService } from './m365-diagnostic.service';
import { StartDiagnosticDto, RequestFullReportDto } from './dto/start-diagnostic.dto';

@Controller('api/diagnostic/m365')
export class M365DiagnosticController {
  constructor(private readonly diagnosticService: M365DiagnosticService) {}

  /**
   * Start a new diagnostic session (PUBLIC - no JWT)
   * Rate limited: 3 per IP per day
   */
  @Post('start')
  @HttpCode(HttpStatus.OK)
  async startDiagnostic(
    @Body() dto: StartDiagnosticDto,
    @Req() req: Request,
  ) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      'unknown';

    return this.diagnosticService.startDiagnostic(
      dto.email,
      dto.companyName,
      ipAddress,
    );
  }

  /**
   * OAuth callback from Microsoft (PUBLIC)
   * Redirects to frontend with session token
   */
  @Get('callback')
  async handleCallback(
    @Query('admin_consent') adminConsent: string,
    @Query('tenant') tenant: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const stateData = JSON.parse(
      Buffer.from(state, 'base64url').toString('utf-8'),
    );
    const { sessionToken } = stateData;

    const frontendUrl =
      process.env.DIAGNOSTIC_FRONTEND_URL || 'http://localhost:3002';

    try {
      await this.diagnosticService.handleCallback(
        sessionToken,
        adminConsent,
        tenant,
      );
      res.redirect(
        `${frontendUrl}/outils-gratuits/diagnostic-m365?session=${sessionToken}&status=success`,
      );
    } catch (error) {
      res.redirect(
        `${frontendUrl}/outils-gratuits/diagnostic-m365?session=${sessionToken}&status=error&message=${encodeURIComponent(error.message)}`,
      );
    }
  }

  /**
   * Check scan status (PUBLIC)
   */
  @Get(':sessionToken/status')
  async getStatus(@Param('sessionToken') sessionToken: string) {
    return this.diagnosticService.getStatus(sessionToken);
  }

  /**
   * Get diagnostic results - LIMITED for free (PUBLIC)
   * Shows: score, grade, top 3 critical findings only
   */
  @Get(':sessionToken/results')
  async getResults(@Param('sessionToken') sessionToken: string) {
    return this.diagnosticService.getResults(sessionToken);
  }

  /**
   * Request full report - captures lead info (PUBLIC)
   * This is the UPSELL moment
   */
  @Post(':sessionToken/full-report')
  @HttpCode(HttpStatus.OK)
  async requestFullReport(
    @Param('sessionToken') sessionToken: string,
    @Body() dto: RequestFullReportDto,
  ) {
    return this.diagnosticService.requestFullReport(
      sessionToken,
      dto.email,
      dto.companyName,
      dto.phone,
    );
  }
}
