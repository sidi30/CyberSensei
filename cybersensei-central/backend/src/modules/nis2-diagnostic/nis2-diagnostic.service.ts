import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NIS2DiagnosticResult } from '../../entities/nis2-diagnostic-result.entity';
import {
  NIS2_QUESTIONS,
  NIS2_CATEGORY_LABELS,
  NIS2Category,
} from './nis2-questions';

export interface CategoryResult {
  category: NIS2Category;
  label: string;
  score: number;
  grade: string;
  status: 'CONFORME' | 'PARTIEL' | 'NON_CONFORME';
  priority: 'CRITIQUE' | 'IMPORTANT' | 'RECOMMANDÉ' | 'CONFORME';
}

export interface NIS2EvaluationResult {
  globalScore: number;
  grade: string;
  categoryScores: CategoryResult[];
  conformeCount: number;
  isNIS2Subject: boolean;
  deadline: string;
  recommendations: Array<{
    category: string;
    label: string;
    priority: string;
    score: number;
    action: string;
  }>;
}

@Injectable()
export class NIS2DiagnosticService {
  private readonly logger = new Logger(NIS2DiagnosticService.name);

  constructor(
    @InjectRepository(NIS2DiagnosticResult)
    private resultRepo: Repository<NIS2DiagnosticResult>,
  ) {}

  getQuestions() {
    const grouped: Record<string, any> = {};

    for (const q of NIS2_QUESTIONS) {
      if (!grouped[q.category]) {
        grouped[q.category] = {
          category: q.category,
          label: NIS2_CATEGORY_LABELS[q.category],
          questions: [],
        };
      }
      grouped[q.category].questions.push({
        id: q.id,
        question: q.question,
        description: q.description,
        options: q.options,
      });
    }

    return Object.values(grouped);
  }

  evaluate(
    answers: Record<string, number>,
    employeeCount?: number,
    sector?: string,
  ): NIS2EvaluationResult {
    const categoryScores = this.calculateCategoryScores(answers);
    const globalScore = this.calculateGlobalScore(categoryScores);
    const grade = this.getGrade(globalScore);
    const conformeCount = categoryScores.filter(
      (c) => c.status === 'CONFORME',
    ).length;
    const isNIS2Subject = (employeeCount || 0) >= 50;
    const recommendations = this.generateRecommendations(categoryScores);

    return {
      globalScore,
      grade,
      categoryScores,
      conformeCount,
      isNIS2Subject,
      deadline: '17 octobre 2026',
      recommendations,
    };
  }

  async saveResult(
    answers: Record<string, number>,
    evaluation: NIS2EvaluationResult,
    email?: string,
    companyName?: string,
    sector?: string,
    employeeCount?: number,
    ipAddress?: string,
    phone?: string,
    reportRequested = false,
  ): Promise<NIS2DiagnosticResult> {
    const result = this.resultRepo.create({
      email,
      companyName,
      sector,
      employeeCount,
      answers,
      globalScore: evaluation.globalScore,
      grade: evaluation.grade,
      categoryScores: evaluation.categoryScores,
      recommendations: evaluation.recommendations,
      isNIS2Subject: evaluation.isNIS2Subject,
      ipAddress,
      phone,
      reportRequested,
    });

    const saved = await this.resultRepo.save(result);
    this.logger.log(
      `NIS2 diagnostic saved for ${email || 'anonymous'} - Score: ${evaluation.globalScore} (${evaluation.grade})`,
    );
    return saved;
  }

  private calculateCategoryScores(
    answers: Record<string, number>,
  ): CategoryResult[] {
    const categoryData: Record<
      string,
      { totalScore: number; maxScore: number }
    > = {};

    for (const q of NIS2_QUESTIONS) {
      if (!categoryData[q.category]) {
        categoryData[q.category] = { totalScore: 0, maxScore: 0 };
      }
      const answer = answers[q.id] ?? 0;
      categoryData[q.category].totalScore += answer * q.weight;
      categoryData[q.category].maxScore += 3 * q.weight;
    }

    return Object.values(NIS2Category).map((cat) => {
      const data = categoryData[cat] || { totalScore: 0, maxScore: 1 };
      const score = Math.round((data.totalScore / data.maxScore) * 100);
      const grade = this.getGrade(score);
      const status = this.getStatus(score);
      const priority = this.getPriority(score);

      return {
        category: cat,
        label: NIS2_CATEGORY_LABELS[cat],
        score,
        grade,
        status,
        priority,
      };
    });
  }

  private calculateGlobalScore(categoryScores: CategoryResult[]): number {
    const total = categoryScores.reduce((sum, c) => sum + c.score, 0);
    return Math.round(total / categoryScores.length);
  }

  private getGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 40) return 'D';
    if (score >= 20) return 'E';
    return 'F';
  }

  private getStatus(
    score: number,
  ): 'CONFORME' | 'PARTIEL' | 'NON_CONFORME' {
    if (score >= 75) return 'CONFORME';
    if (score >= 40) return 'PARTIEL';
    return 'NON_CONFORME';
  }

  private getPriority(
    score: number,
  ): 'CRITIQUE' | 'IMPORTANT' | 'RECOMMANDÉ' | 'CONFORME' {
    if (score < 25) return 'CRITIQUE';
    if (score < 50) return 'IMPORTANT';
    if (score < 75) return 'RECOMMANDÉ';
    return 'CONFORME';
  }

  private generateRecommendations(
    categoryScores: CategoryResult[],
  ): Array<{
    category: string;
    label: string;
    priority: string;
    score: number;
    action: string;
  }> {
    const actionMap: Record<NIS2Category, string> = {
      [NIS2Category.RISK_ANALYSIS]:
        'Réalisez une analyse de risques formelle et maintenez un registre des actifs critiques.',
      [NIS2Category.INCIDENT_HANDLING]:
        'Documentez un plan de réponse aux incidents et formez votre équipe à la notification ANSSI sous 24h.',
      [NIS2Category.BUSINESS_CONTINUITY]:
        'Mettez en place un PCA testé régulièrement avec sauvegardes chiffrées hors-ligne.',
      [NIS2Category.SUPPLY_CHAIN]:
        'Évaluez systématiquement la sécurité de vos fournisseurs et intégrez des clauses cybersécurité aux contrats.',
      [NIS2Category.NETWORK_SECURITY]:
        'Segmentez votre réseau et déployez un pare-feu next-gen avec IDS/IPS.',
      [NIS2Category.VULNERABILITY_MANAGEMENT]:
        'Mettez en place un processus de patch management avec scans de vulnérabilités automatisés.',
      [NIS2Category.CYBER_HYGIENE]:
        'Déployez une formation cybersécurité continue avec simulations de phishing (CyberSensei peut vous aider).',
      [NIS2Category.CRYPTOGRAPHY]:
        'Chiffrez vos données au repos et en transit, centralisez la gestion des certificats.',
      [NIS2Category.ACCESS_CONTROL]:
        'Implémentez le RBAC strict avec MFA obligatoire et revues d\'accès trimestrielles.',
      [NIS2Category.ASSET_MANAGEMENT]:
        'Déployez un EDR/XDR avec monitoring et sécurisez vos communications internes.',
    };

    return categoryScores
      .filter((c) => c.status !== 'CONFORME')
      .sort((a, b) => a.score - b.score)
      .map((c) => ({
        category: c.category,
        label: c.label,
        priority: c.priority,
        score: c.score,
        action: actionMap[c.category],
      }));
  }
}
