import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Anthropic from '@anthropic-ai/sdk';
import * as puppeteer from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs';
import { ScanHistory } from '../../entities/scan-history.entity';
import { EmailService } from '../email/email.service';

const REPORT_LEVELS = {
  soc1: 'soc1_scan_analysis',
  soc2: 'soc2_audit_infra',
  soc3_alert: 'soc3_alert',
  soc3_report: 'soc3_alert',
  nis2: 'nis2_eval',
  monthly: 'monthly_report',
} as const;

type ReportLevel = keyof typeof REPORT_LEVELS;

const MODEL = 'claude-sonnet-4-6';
const MAX_RETRIES = 3;
const BASE_DELAY = 2000;

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  private client: Anthropic | null = null;
  private readonly templatesDir: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(ScanHistory)
    private scanHistoryRepo: Repository<ScanHistory>,
    private emailService: EmailService,
  ) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
      this.logger.log('Reports service initialized with Anthropic SDK');
    } else {
      this.logger.warn('ANTHROPIC_API_KEY not configured - report generation disabled');
    }
    this.templatesDir = path.join(__dirname, 'templates');
  }

  private loadPromptTemplate(level: ReportLevel): string {
    const templateName = REPORT_LEVELS[level];
    if (!templateName) {
      throw new Error(`Unknown report level: ${level}. Valid levels: ${Object.keys(REPORT_LEVELS).join(', ')}`);
    }
    const templatePath = path.join(this.templatesDir, `${templateName}.txt`);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }
    return fs.readFileSync(templatePath, 'utf-8');
  }

  private buildUserMessage(scanResults: Record<string, any>, level: string): string {
    const domain = scanResults.domain || 'N/A';
    const score = scanResults.score ?? 'N/A';
    const company = scanResults.company_name || domain;
    const timestamp = scanResults.timestamp || 'N/A';
    const resultsJson = JSON.stringify(scanResults, null, 2);

    return `Voici les résultats complets du scan de sécurité à analyser.

**Cible** : ${domain}
**Entreprise** : ${company}
**Score global** : ${score}/100
**Date du scan** : ${timestamp}
**Niveau de rapport demandé** : ${level}

\`\`\`json
${resultsJson}
\`\`\`

Génère le rapport complet en markdown structuré selon tes instructions système.`;
  }

  async generateReport(scanResults: Record<string, any>, level: ReportLevel): Promise<string> {
    if (!this.client) {
      throw new Error('Anthropic API key not configured');
    }

    const systemPrompt = this.loadPromptTemplate(level);
    const userMessage = this.buildUserMessage(scanResults, level);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        this.logger.log(`Calling Claude API (model=${MODEL}, attempt ${attempt}/${MAX_RETRIES})`);

        const response = await this.client.messages.create({
          model: MODEL,
          max_tokens: 8192,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        });

        const reportMd = response.content
          .filter((block) => block.type === 'text')
          .map((block) => (block as Anthropic.TextBlock).text)
          .join('');

        this.logger.log(`Report generated (${reportMd.length} chars, ${response.usage.input_tokens + response.usage.output_tokens} tokens)`);
        return reportMd;
      } catch (error: any) {
        lastError = error;
        if (error.status === 429 || error.status >= 500) {
          const delay = BASE_DELAY * Math.pow(2, attempt - 1);
          this.logger.warn(`API error (status ${error.status}), retrying in ${delay}ms (attempt ${attempt}/${MAX_RETRIES})`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }

    throw lastError;
  }

  async generateReportFromScan(scanId: string, level: ReportLevel): Promise<string> {
    const scan = await this.scanHistoryRepo.findOne({ where: { id: scanId } });
    if (!scan) {
      throw new NotFoundException(`Scan ${scanId} not found`);
    }

    const scanResults = {
      domain: scan.domain,
      score: scan.score,
      details: scan.details,
      timestamp: scan.createdAt.toISOString(),
    };

    return this.generateReport(scanResults, level);
  }

  async generatePdf(markdownContent: string, companyName: string, score: number): Promise<Buffer> {
    const scoreColor = score >= 75 ? '#27ae60' : score >= 50 ? '#f39c12' : '#e74c3c';
    const scoreLabel = score >= 75 ? 'BON' : score >= 50 ? 'MOYEN' : score >= 25 ? 'FAIBLE' : 'CRITIQUE';
    const now = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

    const htmlContent = this.markdownToHtml(markdownContent);

    const fullHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 20mm 15mm; }
    body { font-family: 'Helvetica', 'Arial', sans-serif; color: #1a1a2e; font-size: 11px; line-height: 1.6; }
    .header { background: #1a1a2e; color: white; padding: 15px 20px; margin: -20mm -15mm 20px -15mm; display: flex; justify-content: space-between; align-items: center; }
    .header .logo { font-size: 18px; font-weight: bold; }
    .header .subtitle { color: #16c79a; font-size: 9px; }
    .header .score { color: ${scoreColor}; font-size: 14px; font-weight: bold; }
    .title-page { text-align: center; padding: 60px 0; }
    .title-page h1 { font-size: 28px; color: #1a1a2e; margin-bottom: 10px; }
    .title-page .score-big { font-size: 64px; font-weight: bold; color: ${scoreColor}; }
    .title-page .score-label { font-size: 18px; font-weight: bold; color: ${scoreColor}; }
    .info-table { width: 60%; margin: 20px auto; border-collapse: collapse; }
    .info-table td { padding: 8px 12px; border-bottom: 1px solid #eee; }
    .info-table td:first-child { font-weight: bold; width: 40%; }
    h1 { color: #0f3460; font-size: 18px; border-bottom: 2px solid #16c79a; padding-bottom: 5px; margin-top: 25px; }
    h2 { color: #1a1a2e; font-size: 15px; margin-top: 20px; }
    h3 { color: #1a1a2e; font-size: 13px; margin-top: 15px; }
    code { background: #f8f9fa; padding: 2px 5px; font-family: 'Courier New', monospace; font-size: 9px; }
    pre { background: #f8f9fa; padding: 10px; border-radius: 4px; font-size: 9px; overflow-x: auto; }
    ul { padding-left: 20px; }
    li { margin-bottom: 4px; }
    .disclaimer { font-style: italic; color: #7f8c8d; font-size: 8px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }
    .page-break { page-break-after: always; }
  </style>
</head>
<body>
  <div class="title-page">
    <h1>RAPPORT DE SECURITE</h1>
    <p>Analyse complete pour ${companyName}</p>
    <div class="score-big">${score}/100</div>
    <div class="score-label">${scoreLabel}</div>
    <table class="info-table">
      <tr><td>Entreprise</td><td>${companyName}</td></tr>
      <tr><td>Date du rapport</td><td>${now}</td></tr>
      <tr><td>Score de securite</td><td>${score}/100 — ${scoreLabel}</td></tr>
    </table>
    <p class="disclaimer">Ce document est strictement confidentiel. Ce rapport est genere par intelligence artificielle et ne constitue pas un audit de securite certifie.</p>
  </div>
  <div class="page-break"></div>
  ${htmlContent}
  <div class="disclaimer">
    <h2>AVERTISSEMENT LEGAL</h2>
    <p>Ce rapport a ete genere automatiquement par la plateforme CyberSensei a l'aide de modeles d'intelligence artificielle. Les informations contenues dans ce document sont fournies a titre indicatif et ne constituent en aucun cas un audit de securite certifie, un conseil juridique ou une garantie de conformite reglementaire.</p>
  </div>
</body>
</html>`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private markdownToHtml(md: string): string {
    let html = md;
    // Code blocks
    html = html.replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Inline code
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');
    // Bullet lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr>');
    // Paragraphs
    html = html.replace(/^(?!<[huplo]|<\/|<li|<hr)(.+)$/gm, '<p>$1</p>');

    return html;
  }

  async generateAndEmailReport(
    scanId: string,
    level: ReportLevel,
    recipientEmail: string,
    companyName: string,
  ): Promise<void> {
    const reportMd = await this.generateReportFromScan(scanId, level);

    const scan = await this.scanHistoryRepo.findOne({ where: { id: scanId } });
    const score = scan?.score ?? 0;

    const pdfBuffer = await this.generatePdf(reportMd, companyName, score);

    // Send via email using existing email service
    await this.emailService.send({
      to: recipientEmail,
      subject: `CyberSensei — Rapport de securite pour ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0f3460;">Rapport de securite CyberSensei</h2>
          <p>Bonjour,</p>
          <p>Veuillez trouver ci-joint le rapport de securite CyberSensei pour <strong>${companyName}</strong>.</p>
          <p>Ce rapport a ete genere automatiquement par la plateforme CyberSensei.</p>
          <p>Cordialement,<br>L'equipe CyberSensei</p>
        </div>
      `,
    });

    this.logger.log(`Report sent to ${recipientEmail} for ${companyName}`);
  }

  getAvailableLevels(): string[] {
    return Object.keys(REPORT_LEVELS);
  }
}
