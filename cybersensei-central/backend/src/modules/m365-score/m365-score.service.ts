import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { M365Score, ScoreGrade } from '../../entities/m365-score.entity';
import { M365Finding, FindingCategory, FindingSeverity } from '../../entities/m365-finding.entity';

interface CategoryWeight {
  weight: number;
  label: string;
}

@Injectable()
export class M365ScoreService {
  private readonly logger = new Logger(M365ScoreService.name);

  private readonly categoryWeights: Record<FindingCategory, CategoryWeight> = {
    [FindingCategory.MFA]: { weight: 20, label: 'Authentification Multi-Facteur' },
    [FindingCategory.ADMIN_ROLES]: { weight: 15, label: 'Roles Administrateurs' },
    [FindingCategory.EMAIL_SECURITY]: { weight: 15, label: 'Securite Email (SPF/DKIM/DMARC)' },
    [FindingCategory.PASSWORD_POLICY]: { weight: 10, label: 'Politique de Mots de Passe' },
    [FindingCategory.EMAIL_FORWARDING]: { weight: 10, label: 'Transfert d\'Emails' },
    [FindingCategory.SHARING]: { weight: 10, label: 'Partage SharePoint/OneDrive' },
    [FindingCategory.OAUTH_APPS]: { weight: 8, label: 'Applications OAuth' },
    [FindingCategory.SIGN_IN]: { weight: 5, label: 'Connexions' },
    [FindingCategory.CONDITIONAL_ACCESS]: { weight: 5, label: 'Acces Conditionnel' },
    [FindingCategory.MAILBOX]: { weight: 2, label: 'Boites Mail' },
  };

  private readonly severityPenalties: Record<FindingSeverity, number> = {
    [FindingSeverity.CRITICAL]: 25,
    [FindingSeverity.HIGH]: 15,
    [FindingSeverity.MEDIUM]: 8,
    [FindingSeverity.LOW]: 3,
    [FindingSeverity.INFO]: 0,
  };

  constructor(
    @InjectRepository(M365Score)
    private scoreRepo: Repository<M365Score>,
    @InjectRepository(M365Finding)
    private findingRepo: Repository<M365Finding>,
  ) {}

  async calculateScore(scanId: string, tenantId: string): Promise<M365Score> {
    const findings = await this.findingRepo.find({ where: { scanId } });

    // Group findings by category
    const findingsByCategory = new Map<FindingCategory, M365Finding[]>();
    for (const category of Object.values(FindingCategory)) {
      findingsByCategory.set(category, []);
    }
    for (const finding of findings) {
      const list = findingsByCategory.get(finding.category) || [];
      list.push(finding);
      findingsByCategory.set(finding.category, list);
    }

    // Calculate score per category
    const categoryScores: Record<string, { score: number; grade: string; findings: number; weight: number }> = {};
    let weightedTotal = 0;
    let totalWeight = 0;

    for (const [category, config] of Object.entries(this.categoryWeights)) {
      const catFindings = findingsByCategory.get(category as FindingCategory) || [];

      // Calculate penalty for this category
      let penalty = 0;
      for (const finding of catFindings) {
        penalty += this.severityPenalties[finding.severity] || 0;
      }

      // Cap penalty at 100
      const categoryScore = Math.max(0, Math.min(100, 100 - penalty));
      const grade = this.scoreToGrade(categoryScore);

      categoryScores[category] = {
        score: categoryScore,
        grade,
        findings: catFindings.length,
        weight: config.weight,
      };

      weightedTotal += categoryScore * config.weight;
      totalWeight += config.weight;
    }

    const globalScore = totalWeight > 0 ? Math.round(weightedTotal / totalWeight) : 100;
    const globalGrade = this.scoreToGrade(globalScore);

    // Get previous score for comparison
    const previousScoreEntity = await this.scoreRepo.findOne({
      where: { tenantId },
      order: { calculatedAt: 'DESC' },
    });

    const criticalFindings = findings.filter((f) => f.severity === FindingSeverity.CRITICAL).length;
    const highFindings = findings.filter((f) => f.severity === FindingSeverity.HIGH).length;

    // Create or update score
    const score = this.scoreRepo.create({
      scanId,
      tenantId,
      globalScore,
      globalGrade: globalGrade as ScoreGrade,
      categoryScores,
      totalFindings: findings.length,
      criticalFindings,
      highFindings,
      previousScore: previousScoreEntity?.globalScore || null,
      previousGrade: previousScoreEntity?.globalGrade || null,
      scoreDelta: previousScoreEntity ? globalScore - previousScoreEntity.globalScore : null,
      calculatedAt: new Date(),
    });

    const saved = await this.scoreRepo.save(score);
    this.logger.log(`Score calculated for scan ${scanId}: ${globalScore}/100 (${globalGrade})`);
    return saved;
  }

  private scoreToGrade(score: number): string {
    if (score >= 90) return ScoreGrade.A;
    if (score >= 75) return ScoreGrade.B;
    if (score >= 60) return ScoreGrade.C;
    if (score >= 40) return ScoreGrade.D;
    if (score >= 20) return ScoreGrade.E;
    return ScoreGrade.F;
  }

  async getLatestScore(tenantId: string): Promise<M365Score> {
    const score = await this.scoreRepo.findOne({
      where: { tenantId },
      order: { calculatedAt: 'DESC' },
    });
    if (!score) {
      throw new NotFoundException(`No score found for tenant ${tenantId}`);
    }
    return score;
  }

  async getScoreHistory(
    tenantId: string,
    limit = 30,
  ): Promise<M365Score[]> {
    return this.scoreRepo.find({
      where: { tenantId },
      order: { calculatedAt: 'DESC' },
      take: limit,
    });
  }

  async getScoreByScanId(scanId: string): Promise<M365Score> {
    const score = await this.scoreRepo.findOne({ where: { scanId } });
    if (!score) {
      throw new NotFoundException(`No score found for scan ${scanId}`);
    }
    return score;
  }
}
