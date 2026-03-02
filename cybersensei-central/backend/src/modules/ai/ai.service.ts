import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `Tu es un expert en cybersecurite Microsoft 365 specialise dans l'accompagnement des PME.
Tu rediges des rapports de securite clairs, accessibles et actionnables.
Tu t'exprimes en francais, avec un langage professionnel mais comprehensible par des dirigeants non-techniques.
Tu donnes des recommandations concretes et priorisees.
Tu connais parfaitement les bonnes pratiques Microsoft 365 et les exigences NIS2.`;

interface FindingSummary {
  category: string;
  severity: string;
  title: string;
  description: string;
  remediation?: string;
}

interface ScoreSummary {
  globalScore: number;
  globalGrade: string;
  categoryScores: Record<string, { score: number; grade: string; findings: number }>;
  totalFindings: number;
  criticalFindings: number;
  highFindings: number;
}

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  private client: Anthropic;
  private readonly model = 'claude-sonnet-4-20250514';

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
      this.logger.log('Anthropic SDK initialized');
    } else {
      this.logger.warn('ANTHROPIC_API_KEY not configured - AI features disabled');
    }
  }

  private ensureClient(): void {
    if (!this.client) {
      throw new Error('Anthropic API key not configured');
    }
  }

  async generateExecutiveSummary(
    score: ScoreSummary,
    findings: FindingSummary[],
    tenantDomain: string,
  ): Promise<string> {
    this.ensureClient();

    const prompt = `Genere un resume executif (3-4 paragraphes) pour le rapport de securite Microsoft 365 du tenant "${tenantDomain}".

Score global: ${score.globalScore}/100 (Grade ${score.globalGrade})
Nombre total de problemes: ${score.totalFindings}
Problemes critiques: ${score.criticalFindings}
Problemes eleves: ${score.highFindings}

Scores par categorie:
${Object.entries(score.categoryScores)
  .map(([cat, s]) => `- ${cat}: ${s.score}/100 (${s.grade}) - ${s.findings} probleme(s)`)
  .join('\n')}

Top problemes:
${findings
  .filter((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH')
  .slice(0, 10)
  .map((f) => `- [${f.severity}] ${f.title}: ${f.description}`)
  .join('\n')}

Le resume doit:
1. Donner une vue d'ensemble de la posture de securite
2. Identifier les risques principaux
3. Etre comprehensible par un dirigeant non-technique
4. Mentionner la conformite NIS2 si pertinent`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as Anthropic.TextBlock).text)
      .join('');
  }

  async generateCategoryAnalysis(
    category: string,
    categoryScore: number,
    categoryGrade: string,
    findings: FindingSummary[],
  ): Promise<string> {
    this.ensureClient();

    const prompt = `Analyse la categorie "${category}" du scan de securite Microsoft 365.

Score: ${categoryScore}/100 (Grade ${categoryGrade})
Nombre de problemes: ${findings.length}

Problemes detectes:
${findings.map((f) => `- [${f.severity}] ${f.title}: ${f.description}`).join('\n')}

Genere une analyse concise (2-3 paragraphes) qui:
1. Explique l'etat de cette categorie
2. Identifie les risques concrets pour l'entreprise
3. Priorise les actions a mener`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as Anthropic.TextBlock).text)
      .join('');
  }

  async generateRecommendations(
    score: ScoreSummary,
    findings: FindingSummary[],
  ): Promise<string> {
    this.ensureClient();

    const criticalFindings = findings.filter((f) => f.severity === 'CRITICAL');
    const highFindings = findings.filter((f) => f.severity === 'HIGH');

    const prompt = `Genere un plan d'action priorise pour ameliorer la securite Microsoft 365.

Score actuel: ${score.globalScore}/100 (Grade ${score.globalGrade})

Problemes critiques (${criticalFindings.length}):
${criticalFindings.map((f) => `- ${f.title}: ${f.description}\n  Remediation suggeree: ${f.remediation || 'N/A'}`).join('\n')}

Problemes eleves (${highFindings.length}):
${highFindings.map((f) => `- ${f.title}: ${f.description}\n  Remediation suggeree: ${f.remediation || 'N/A'}`).join('\n')}

Genere:
1. Les 5 actions prioritaires (avec impact estime sur le score)
2. Un plan a 30 jours (actions immediates vs court terme)
3. Des quick wins (actions simples a fort impact)

Format: liste structuree avec priorite, action, impact, difficulte`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as Anthropic.TextBlock).text)
      .join('');
  }
}
