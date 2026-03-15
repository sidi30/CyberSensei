import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { M365Scan } from '../../entities/m365-scan.entity';
import { M365Finding, FindingCategory } from '../../entities/m365-finding.entity';
import { M365Score } from '../../entities/m365-score.entity';
import { M365Connection } from '../../entities/m365-connection.entity';
import { AiService } from '../ai/ai.service';
import { M365ScoreService } from '../m365-score/m365-score.service';
import { generateReportHtml } from './templates/report-template';

@Injectable()
export class M365ReportService {
  private readonly logger = new Logger(M365ReportService.name);
  // Store generated reports in memory for MVP (production: use MongoDB GridFS)
  private reports = new Map<string, { pdf: Buffer; filename: string; createdAt: Date }>();

  constructor(
    @InjectRepository(M365Scan)
    private scanRepo: Repository<M365Scan>,
    @InjectRepository(M365Finding)
    private findingRepo: Repository<M365Finding>,
    @InjectRepository(M365Score)
    private scoreRepo: Repository<M365Score>,
    @InjectRepository(M365Connection)
    private connectionRepo: Repository<M365Connection>,
    private aiService: AiService,
    private scoreService: M365ScoreService,
  ) {}

  async generateReport(scanId: string): Promise<{ reportId: string; filename: string }> {
    // Get scan data
    const scan = await this.scanRepo.findOne({ where: { id: scanId } });
    if (!scan) {
      throw new NotFoundException(`Scan ${scanId} not found`);
    }

    const findings = await this.findingRepo.find({ where: { scanId } });

    // Get or calculate score
    let score: M365Score;
    try {
      score = await this.scoreService.getScoreByScanId(scanId);
    } catch {
      score = await this.scoreService.calculateScore(scanId, scan.tenantId);
    }

    // Get tenant domain
    const connection = await this.connectionRepo.findOne({
      where: { tenantId: scan.tenantId },
    });
    const tenantDomain = connection?.microsoftTenantDomain || scan.tenantId;

    // Prepare findings summary for AI
    const findingSummaries = findings.map((f) => ({
      category: f.category,
      severity: f.severity,
      title: f.title,
      description: f.description,
      remediation: f.remediation,
    }));

    const scoreSummary = {
      globalScore: score.globalScore,
      globalGrade: score.globalGrade,
      categoryScores: score.categoryScores,
      totalFindings: score.totalFindings,
      criticalFindings: score.criticalFindings,
      highFindings: score.highFindings,
    };

    // Generate AI content
    let executiveSummary = '';
    let recommendations = '';
    const categoryAnalyses: Record<string, string> = {};

    try {
      [executiveSummary, recommendations] = await Promise.all([
        this.aiService.generateExecutiveSummary(scoreSummary, findingSummaries, tenantDomain),
        this.aiService.generateRecommendations(scoreSummary, findingSummaries),
      ]);

      // Generate category analyses for categories with findings
      const categoriesWithFindings = [...new Set(findings.map((f) => f.category))];
      const categoryPromises = categoriesWithFindings.map(async (cat) => {
        const catFindings = findingSummaries.filter((f) => f.category === cat);
        const catScore = score.categoryScores[cat];
        if (catScore) {
          const analysis = await this.aiService.generateCategoryAnalysis(
            cat,
            catScore.score,
            catScore.grade,
            catFindings,
          );
          categoryAnalyses[cat] = analysis;
        }
      });
      await Promise.all(categoryPromises);
    } catch (err) {
      this.logger.warn(`AI generation failed, using fallback: ${err.message}`);
      executiveSummary = `Rapport de securite Microsoft 365 pour ${tenantDomain}. Score global: ${score.globalScore}/100 (${score.globalGrade}). ${score.totalFindings} probleme(s) detecte(s) dont ${score.criticalFindings} critique(s).`;
      recommendations = 'Recommandations non disponibles (service IA indisponible). Veuillez traiter en priorite les problemes de severite CRITICAL et HIGH.';
    }

    // Generate HTML
    const html = generateReportHtml({
      tenantDomain,
      scanDate: new Date(scan.startedAt || scan.createdAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      globalScore: score.globalScore,
      globalGrade: score.globalGrade,
      categoryScores: score.categoryScores,
      totalFindings: score.totalFindings,
      criticalFindings: score.criticalFindings,
      highFindings: score.highFindings,
      mediumFindings: findings.filter((f) => f.severity === 'MEDIUM').length,
      lowFindings: findings.filter((f) => f.severity === 'LOW').length,
      executiveSummary,
      recommendations,
      categoryAnalyses,
      findings: findingSummaries,
    });

    // Convert to PDF using Puppeteer
    let pdfBuffer: Buffer;
    try {
      const puppeteer = await import('puppeteer');
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      pdfBuffer = Buffer.from(await page.pdf({
        format: 'A4',
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
        printBackground: true,
      }));
      await browser.close();
    } catch (err) {
      this.logger.warn(`Puppeteer PDF generation failed: ${err.message}. Returning HTML as fallback.`);
      pdfBuffer = Buffer.from(html, 'utf-8');
    }

    const reportId = `report-${scanId}-${Date.now()}`;
    const filename = `CyberSensei_M365_${tenantDomain}_${new Date().toISOString().split('T')[0]}.pdf`;

    this.reports.set(reportId, {
      pdf: pdfBuffer,
      filename,
      createdAt: new Date(),
    });

    this.logger.log(`Report ${reportId} generated for scan ${scanId}`);
    return { reportId, filename };
  }

  getReport(reportId: string): { pdf: Buffer; filename: string } {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new NotFoundException(`Report ${reportId} not found`);
    }
    return { pdf: report.pdf, filename: report.filename };
  }

  listReports(tenantId?: string): Array<{ reportId: string; filename: string; createdAt: Date }> {
    const list: Array<{ reportId: string; filename: string; createdAt: Date }> = [];
    for (const [id, report] of this.reports) {
      if (!tenantId || report.filename.includes(tenantId)) {
        list.push({ reportId: id, filename: report.filename, createdAt: report.createdAt });
      }
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
