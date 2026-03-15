import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Res,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GenerateReportDto, GenerateReportFromScanDto, EmailReportDto } from './dto/reports.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('levels')
  @ApiOperation({ summary: 'Get available report levels' })
  getLevels() {
    return { levels: this.reportsService.getAvailableLevels() };
  }

  @Post('generate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generate a report from scan results' })
  async generateReport(@Body() dto: GenerateReportDto) {
    const reportMd = await this.reportsService.generateReport(dto.scanResults, dto.level as any);
    return { report: reportMd, level: dto.level };
  }

  @Post('generate/:scanId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generate a report from a saved scan' })
  async generateFromScan(@Param('scanId') scanId: string, @Body() dto: GenerateReportFromScanDto) {
    const reportMd = await this.reportsService.generateReportFromScan(scanId, dto.level as any);
    return { report: reportMd, scanId, level: dto.level };
  }

  @Post('pdf')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generate a PDF report' })
  async generatePdf(
    @Body() dto: GenerateReportDto,
    @Res() res: Response,
  ) {
    const reportMd = await this.reportsService.generateReport(dto.scanResults, dto.level as any);
    const companyName = dto.scanResults.company_name || dto.scanResults.domain || 'Unknown';
    const score = dto.scanResults.score ?? 0;
    const pdfBuffer = await this.reportsService.generatePdf(reportMd, companyName, score);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="cybersensei-report-${companyName}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Post('email')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generate and email a report' })
  async emailReport(@Body() dto: EmailReportDto) {
    await this.reportsService.generateAndEmailReport(
      dto.scanId,
      dto.level as any,
      dto.recipientEmail,
      dto.companyName,
    );
    return { message: 'Report sent successfully', recipientEmail: dto.recipientEmail };
  }
}
