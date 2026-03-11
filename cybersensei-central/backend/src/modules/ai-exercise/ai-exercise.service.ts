import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AiConfig, AiProvider } from '../../entities/ai-config.entity';
import { Tenant } from '../../entities/tenant.entity';
import { Exercise, ExerciseDifficulty, ExerciseType } from '../../entities/exercise.entity';
import { ExerciseService } from '../exercise/exercise.service';
import { CreateAiConfigDto, UpdateAiConfigDto, GenerateExercisesDto } from './dto/ai-config.dto';
import { encrypt, decrypt } from './utils/encryption.util';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const DEFAULT_TOPICS = [
  'Phishing',
  'Securite des mots de passe',
  'Ingenierie sociale',
  'Ransomware',
  'Securite email',
  'Navigation web securisee',
  'Protection des donnees sensibles',
  'Authentification MFA',
  'Securite mobile',
  'Securite reseau',
];

@Injectable()
export class AiExerciseService {
  private readonly logger = new Logger(AiExerciseService.name);

  constructor(
    @InjectRepository(AiConfig)
    private aiConfigRepository: Repository<AiConfig>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    private exerciseService: ExerciseService,
    private configService: ConfigService,
  ) {}

  private getEncryptionSecret(): string {
    return (
      this.configService.get<string>('AI_KEY_ENCRYPTION_SECRET') ||
      this.configService.get<string>('JWT_SECRET') ||
      'default-encryption-secret-change-me'
    );
  }

  // ──── AI Config CRUD ────

  async createConfig(dto: CreateAiConfigDto): Promise<AiConfig> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: dto.tenantId },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${dto.tenantId} not found`);
    }

    const existing = await this.aiConfigRepository.findOne({
      where: { tenantId: dto.tenantId },
    });
    if (existing) {
      throw new BadRequestException(
        `AI config already exists for tenant ${dto.tenantId}. Use update instead.`,
      );
    }

    const encryptedApiKey = encrypt(dto.apiKey, this.getEncryptionSecret());

    const config = this.aiConfigRepository.create({
      tenantId: dto.tenantId,
      provider: dto.provider || AiProvider.OPENAI,
      encryptedApiKey,
      enabled: dto.enabled ?? false,
      generationFrequency: dto.generationFrequency,
    });

    const saved = await this.aiConfigRepository.save(config);
    this.logger.log(`AI config created for tenant ${dto.tenantId}`);

    return this.maskApiKey(saved);
  }

  async getConfig(tenantId: string): Promise<AiConfig> {
    const config = await this.aiConfigRepository.findOne({
      where: { tenantId },
    });
    if (!config) {
      throw new NotFoundException(
        `AI config not found for tenant ${tenantId}`,
      );
    }

    return this.maskApiKey(config);
  }

  async updateConfig(tenantId: string, dto: UpdateAiConfigDto): Promise<AiConfig> {
    const config = await this.aiConfigRepository.findOne({
      where: { tenantId },
    });
    if (!config) {
      throw new NotFoundException(
        `AI config not found for tenant ${tenantId}`,
      );
    }

    if (dto.provider !== undefined) {
      config.provider = dto.provider;
    }
    if (dto.apiKey) {
      config.encryptedApiKey = encrypt(dto.apiKey, this.getEncryptionSecret());
    }
    if (dto.enabled !== undefined) {
      config.enabled = dto.enabled;
    }
    if (dto.generationFrequency !== undefined) {
      config.generationFrequency = dto.generationFrequency;
    }

    const saved = await this.aiConfigRepository.save(config);
    this.logger.log(`AI config updated for tenant ${tenantId}`);

    return this.maskApiKey(saved);
  }

  async deleteConfig(tenantId: string): Promise<void> {
    const config = await this.aiConfigRepository.findOne({
      where: { tenantId },
    });
    if (!config) {
      throw new NotFoundException(
        `AI config not found for tenant ${tenantId}`,
      );
    }

    await this.aiConfigRepository.remove(config);
    this.logger.log(`AI config deleted for tenant ${tenantId}`);
  }

  async testConfig(tenantId: string): Promise<{ success: boolean; message: string }> {
    const config = await this.aiConfigRepository.findOne({
      where: { tenantId },
    });
    if (!config) {
      throw new NotFoundException(
        `AI config not found for tenant ${tenantId}`,
      );
    }

    const apiKey = decrypt(config.encryptedApiKey, this.getEncryptionSecret());

    try {
      if (config.provider === AiProvider.OPENAI) {
        const openai = new OpenAI({ apiKey });
        await openai.models.list();
      } else if (config.provider === AiProvider.ANTHROPIC) {
        const anthropic = new Anthropic({ apiKey });
        await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hello' }],
        });
      }

      return { success: true, message: 'API key is valid and working' };
    } catch (error) {
      this.logger.warn(`API key test failed for tenant ${tenantId}: ${error.message}`);
      return { success: false, message: `API key test failed: ${error.message}` };
    }
  }

  // ──── Exercise Generation ────

  async generateExercises(dto: GenerateExercisesDto): Promise<Exercise[]> {
    const config = await this.aiConfigRepository.findOne({
      where: { tenantId: dto.tenantId },
    });
    if (!config) {
      throw new NotFoundException(
        `AI config not found for tenant ${dto.tenantId}`,
      );
    }
    if (!config.enabled) {
      throw new BadRequestException(
        `AI generation is not enabled for tenant ${dto.tenantId}`,
      );
    }

    const tenant = await this.tenantRepository.findOne({
      where: { id: dto.tenantId },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${dto.tenantId} not found`);
    }

    const apiKey = decrypt(config.encryptedApiKey, this.getEncryptionSecret());
    const topics = dto.topics && dto.topics.length > 0 ? dto.topics : DEFAULT_TOPICS;
    const difficulty = dto.difficulty || ExerciseDifficulty.INTERMEDIATE;
    const count = dto.count || 10;

    const allExercises: Exercise[] = [];

    for (const topic of topics) {
      try {
        const prompt = this.buildPrompt(topic, difficulty, count, tenant.sector || null);
        const jsonResponse = await this.callAi(config.provider, apiKey, prompt);
        const parsed = this.parseResponse(jsonResponse);

        const exerciseDto = {
          topic,
          type: ExerciseType.QUIZ,
          difficulty,
          payloadJSON: parsed,
          version: '1.0.0',
          active: true,
          description: `AI-generated exercise: ${topic}`,
          tags: `ai-generated,${topic.toLowerCase().replace(/\s+/g, '-')}`,
          generatedByAi: true,
          tenantId: dto.tenantId,
        };

        const exercise = this.exerciseRepository.create(exerciseDto);
        const saved = await this.exerciseRepository.save(exercise);
        allExercises.push(saved);

        this.logger.log(`Generated exercise for topic "${topic}" (tenant: ${dto.tenantId})`);
      } catch (error) {
        this.logger.error(
          `Failed to generate exercise for topic "${topic}": ${error.message}`,
        );
      }
    }

    // Update lastGeneratedAt
    config.lastGeneratedAt = new Date();
    await this.aiConfigRepository.save(config);

    this.logger.log(
      `Generated ${allExercises.length}/${topics.length} exercises for tenant ${dto.tenantId}`,
    );

    return allExercises;
  }

  async findGeneratedExercises(): Promise<Exercise[]> {
    return this.exerciseRepository.find({
      where: { generatedByAi: true },
      order: { createdAt: 'DESC' },
    });
  }

  // ──── Private helpers ────

  private buildPrompt(
    topic: string,
    difficulty: ExerciseDifficulty,
    questionCount: number,
    sector: string | null,
  ): string {
    const sectorContext = sector
      ? `Les scenarios doivent etre adaptes au secteur "${sector}". Utilise des exemples concrets et realistes pour ce secteur d'activite.`
      : 'Utilise des scenarios professionnels generiques.';

    const difficultyMap: Record<string, string> = {
      BEGINNER: 'debutant (concepts de base, sensibilisation)',
      INTERMEDIATE: 'intermediaire (mise en pratique, cas concrets)',
      ADVANCED: 'avance (scenarios complexes, attaques sophistiquees)',
      EXPERT: 'expert (menaces APT, analyses forensiques, reponse incidents)',
    };

    return `Tu es un expert en cybersecurite et en formation. Genere un exercice de formation en cybersecurite au format JSON.

Sujet: ${topic}
Niveau de difficulte: ${difficultyMap[difficulty] || difficulty}
Nombre de questions: ${questionCount}
Langue: Francais

${sectorContext}

Le JSON doit suivre EXACTEMENT cette structure:
{
  "courseIntro": "Introduction du cours sur le sujet (2-3 phrases explicatives)",
  "questions": [
    {
      "id": "q1",
      "context": "Contexte situationnel realiste decrivant un scenario",
      "text": "Question a choix multiples?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "feedbackCorrect": "Explication detaillee pourquoi c'est la bonne reponse",
      "feedbackIncorrect": "Explication detaillee de la correction avec la bonne reponse",
      "advice": {
        "concept": "Concept cle a retenir",
        "example": "Exemple concret illustrant le concept",
        "advice": ["Conseil pratique 1", "Conseil pratique 2"]
      },
      "keyTakeaway": "Point essentiel a retenir de cette question"
    }
  ]
}

Regles importantes:
- Chaque question doit avoir exactement 4 options
- "correctAnswer" est l'index (0-3) de la bonne reponse
- Les scenarios doivent etre realistes et varies
- Les feedbacks doivent etre pedagogiques et detailles
- Chaque question doit avoir un id unique (q1, q2, q3, etc.)
- Genere exactement ${questionCount} questions
- Reponds UNIQUEMENT avec le JSON, sans texte supplementaire`;
  }

  private async callAi(
    provider: AiProvider,
    apiKey: string,
    prompt: string,
    retries = 2,
  ): Promise<string> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (provider === AiProvider.OPENAI) {
          return await this.callOpenAi(apiKey, prompt);
        } else {
          return await this.callAnthropic(apiKey, prompt);
        }
      } catch (error) {
        if (attempt === retries) {
          throw new InternalServerErrorException(
            `AI generation failed after ${retries + 1} attempts: ${error.message}`,
          );
        }
        this.logger.warn(
          `AI call attempt ${attempt + 1} failed, retrying: ${error.message}`,
        );
      }
    }

    throw new InternalServerErrorException('AI generation failed unexpectedly');
  }

  private async callOpenAi(apiKey: string, prompt: string): Promise<string> {
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en cybersecurite. Reponds uniquement en JSON valide.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    return content;
  }

  private async callAnthropic(apiKey: string, prompt: string): Promise<string> {
    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
      system: 'Tu es un expert en cybersecurite. Reponds uniquement en JSON valide, sans texte avant ou apres le JSON.',
    });

    const block = response.content[0];
    if (block.type !== 'text' || !block.text) {
      throw new Error('Empty response from Anthropic');
    }

    return block.text;
  }

  private parseResponse(jsonString: string): Record<string, any> {
    // Clean up potential markdown code fences
    let cleaned = jsonString.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);

    // Validate expected structure
    if (!parsed.courseIntro || !Array.isArray(parsed.questions)) {
      throw new Error(
        'Invalid exercise format: missing "courseIntro" or "questions" array',
      );
    }

    for (const q of parsed.questions) {
      if (
        !q.id ||
        !q.text ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        typeof q.correctAnswer !== 'number'
      ) {
        throw new Error(
          `Invalid question format for question "${q.id || 'unknown'}"`,
        );
      }
    }

    return parsed;
  }

  private maskApiKey(config: AiConfig): any {
    let maskedApiKey = '****';
    if (config.encryptedApiKey) {
      try {
        const decrypted = decrypt(
          config.encryptedApiKey,
          this.getEncryptionSecret(),
        );
        maskedApiKey = `****${decrypted.slice(-4)}`;
      } catch {
        // keep default mask
      }
    }

    const { encryptedApiKey, ...rest } = config;
    return { ...rest, maskedApiKey };
  }
}
