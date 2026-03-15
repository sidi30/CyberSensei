import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';

import { ComplianceSession } from '../../entities/compliance-session.entity';
import { SubmitAnswersDto, AnswerValue } from './dto/submit-answers.dto';
import { ComplianceResultDto } from './dto/compliance-result.dto';
import { computeScores, NIS2Question } from './scoring_engine';
import { generateActionPlan } from './action_plan_generator';
import { generateComplianceReport } from './compliance_report';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);
  private readonly questions: NIS2Question[];

  constructor(
    @InjectRepository(ComplianceSession)
    private sessionRepo: Repository<ComplianceSession>,
  ) {
    // Charger le questionnaire JSON au démarrage
    const jsonPath = path.join(__dirname, 'nis2_questionnaire.json');
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(raw);
    this.questions = data.questions;
    this.logger.log(
      `Questionnaire NIS2 chargé : ${this.questions.length} questions`,
    );
  }

  /**
   * Retourne la liste complète des questions du questionnaire NIS2
   * groupées par domaine, avec métadonnées.
   */
  getQuestions() {
    const grouped: Record<
      string,
      { domaine: string; label: string; questions: any[] }
    > = {};

    for (const q of this.questions) {
      if (!grouped[q.domaine]) {
        grouped[q.domaine] = {
          domaine: q.domaine,
          label: this.formatLabel(q.domaine),
          questions: [],
        };
      }
      grouped[q.domaine].questions.push({
        id: q.id,
        texte: q.texte,
        type: q.type,
        poids: q.poids,
        article_nis2: q.article_nis2,
      });
    }

    return {
      version: '1.0.0',
      totalQuestions: this.questions.length,
      domaines: Object.values(grouped),
    };
  }

  /**
   * Soumet les réponses, calcule le score, génère le plan d'action
   * et persiste la session en base.
   */
  async submitAnswers(
    dto: SubmitAnswersDto,
    ipAddress?: string,
  ): Promise<ComplianceResultDto> {
    const answers = dto.answers as Record<string, AnswerValue>;

    // Calcul du scoring
    const { scoreGlobal, niveauGlobal, scoresParDomaine } = computeScores(
      this.questions,
      answers,
    );

    // Génération du plan d'action
    const planAction = generateActionPlan(this.questions, answers);

    this.logger.log(
      `Évaluation NIS2 pour ${dto.companyName} — Score: ${scoreGlobal}/100 (${niveauGlobal})`,
    );

    // Persister la session
    const session = this.sessionRepo.create({
      companyName: dto.companyName,
      email: dto.email,
      sector: dto.sector,
      employeeCount: dto.employeeCount,
      answers: dto.answers,
      scoreGlobal,
      niveauGlobal,
      scoresParDomaine,
      planAction,
      ipAddress,
    });

    const saved = await this.sessionRepo.save(session);

    return {
      sessionId: saved.id,
      companyName: dto.companyName,
      scoreGlobal,
      niveauGlobal,
      scoresParDomaine,
      planAction,
      timestamp: saved.createdAt.toISOString(),
    };
  }

  /**
   * Génère le rapport markdown de conformité pour une session donnée.
   * Le rapport est mis en cache dans la session en base.
   */
  async getReport(sessionId: string): Promise<string> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(
        `Session de conformité introuvable : ${sessionId}`,
      );
    }

    // Retourner le rapport en cache s'il existe
    if (session.reportMarkdown) {
      return session.reportMarkdown;
    }

    // Générer le rapport
    const report = generateComplianceReport(
      session.companyName,
      session.scoreGlobal,
      session.niveauGlobal,
      session.scoresParDomaine,
      session.planAction,
      session.id,
    );

    // Mettre en cache
    session.reportMarkdown = report;
    await this.sessionRepo.save(session);

    return report;
  }

  private formatLabel(domaine: string): string {
    const labels: Record<string, string> = {
      gouvernance: 'Gouvernance',
      gestion_risques: 'Gestion des risques',
      continuite: 'Continuité d\'activité',
      chaine_approvisionnement: 'Chaîne d\'approvisionnement',
      gestion_incidents: 'Gestion des incidents',
      cryptographie: 'Cryptographie',
      securite_rh: 'Sécurité des ressources humaines',
      controle_acces: 'Contrôle d\'accès',
      securite_physique: 'Sécurité physique',
      audit: 'Audit et évaluation',
    };
    return labels[domaine] || domaine;
  }
}
