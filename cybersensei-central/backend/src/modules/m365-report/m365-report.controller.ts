import { Controller, Post, Get, Param, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { M365ReportService } from './m365-report.service';

@ApiTags('M365 Report')
@Controller('m365/report')
export class M365ReportController {
  private readonly logger = new Logger(M365ReportController.name);

  constructor(private readonly reportService: M365ReportService) {}

  @Post('generate/:scanId')
  @ApiOperation({ summary: 'Generate a PDF report for a scan' })
  @ApiResponse({ status: 201, description: 'Report generated' })
  async generateReport(@Param('scanId') scanId: string) {
    this.logger.log(`Generating report for scan ${scanId}`);
    return this.reportService.generateReport(scanId);
  }

  @Get('download/:reportId')
  @ApiOperation({ summary: 'Download a generated report' })
  @ApiResponse({ status: 200, description: 'PDF file' })
  async downloadReport(@Param('reportId') reportId: string, @Res() res: Response) {
    const { pdf, filename } = this.reportService.getReport(reportId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdf.length.toString(),
    });
    res.send(pdf);
  }

  @Get('list')
  @ApiOperation({ summary: 'List all generated reports' })
  @ApiResponse({ status: 200, description: 'List of reports' })
  async listReports() {
    return this.reportService.listReports();
  }
}
