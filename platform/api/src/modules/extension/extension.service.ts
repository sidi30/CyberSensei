import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Tenant } from '../../entities/tenant.entity';
import { License, LicenseStatus } from '../../entities/license.entity';
import { Exercise } from '../../entities/exercise.entity';

// Topics de cybersecurite pour la generation IA
const CYBER_TOPICS = [
  'phishing', 'ransomware', 'mots de passe', 'ingenierie sociale',
  'vpn', 'shadow it', 'rgpd', 'malware', 'dlp', 'sauvegarde',
];

@Injectable()
export class ExtensionService {
  private readonly logger = new Logger(ExtensionService.name);
  private readonly openaiKey: string;

  constructor(
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
    @InjectRepository(License)
    private licenseRepo: Repository<License>,
    @InjectRepository(Exercise)
    private exerciseRepo: Repository<Exercise>,
    private configService: ConfigService,
  ) {
    this.openaiKey = this.configService.get<string>('OPENAI_API_KEY', '');
  }

  /**
   * Activation par code court (CS-XXXXXXXX) ou licenseKey
   */
  async activate(code: string) {
    const normalizedCode = code.trim().toUpperCase();

    let tenant = await this.tenantRepo.findOne({
      where: { activationCode: normalizedCode, active: true },
    });

    if (!tenant) {
      tenant = await this.tenantRepo.findOne({
        where: { licenseKey: normalizedCode, active: true },
      });
    }

    if (!tenant) {
      const license = await this.licenseRepo.findOne({
        where: { key: normalizedCode, status: LicenseStatus.ACTIVE },
        relations: ['tenant'],
      });

      if (license) {
        if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
          throw new BadRequestException("Ce code d'activation a expire");
        }
        if (license.maxUsageCount && license.usageCount >= license.maxUsageCount) {
          throw new BadRequestException("Ce code a atteint sa limite d'utilisation");
        }
        if (!license.tenant?.active) {
          throw new BadRequestException('Le tenant associe est inactif');
        }
        license.usageCount += 1;
        await this.licenseRepo.save(license);
        tenant = license.tenant;
      }
    }

    if (!tenant) {
      throw new BadRequestException("Code d'activation invalide.");
    }

    const backendUrl = this.configService.get<string>('PUBLIC_BACKEND_URL')
      || this.configService.get<string>('BACKEND_URL')
      || 'http://localhost:3006';

    this.logger.log(`Extension activee pour: ${tenant.name} (code: ${normalizedCode})`);

    return {
      backendUrl,
      tenantId: tenant.id,
      tenantName: tenant.name,
      userId: `ext-${tenant.id.substring(0, 8)}`,
      userName: tenant.companyName || tenant.name,
    };
  }

  /**
   * Recuperer le quiz du jour.
   * Si aucun exercice en base, genere automatiquement via OpenAI.
   */
  async getTodayQuiz(tenantId: string) {
    let exercises: Exercise[] = [];

    // 1. Chercher les exercices du tenant (si tenantId valide)
    if (tenantId && tenantId !== 'undefined' && tenantId.length > 10) {
      try {
        exercises = await this.exerciseRepo
          .createQueryBuilder('e')
          .where('e."tenantId" = :tenantId AND e.active = true', { tenantId })
          .orderBy('e."createdAt"', 'DESC')
          .getMany();
      } catch {
        // tenantId invalide (pas un UUID) — on ignore
      }
    }

    // 2. Fallback : exercices globaux (tenantId null)
    if (exercises.length === 0) {
      exercises = await this.exerciseRepo.find({
        where: { active: true, tenantId: null as any },
        order: { createdAt: 'DESC' },
      });
    }

    // 3. Fallback : tous les exercices actifs
    if (exercises.length === 0) {
      exercises = await this.exerciseRepo.find({
        where: { active: true },
        order: { createdAt: 'DESC' },
      });
    }

    // 4. Aucun exercice en base → generer via OpenAI
    if (exercises.length === 0) {
      this.logger.warn('Aucun exercice en base — generation IA...');
      const generated = await this.generateExerciseWithAI();
      if (generated) {
        return generated;
      }
      throw new NotFoundException('Aucun exercice disponible');
    }

    // Rotation quotidienne
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
    );
    const index = dayOfYear % exercises.length;

    return exercises[index];
  }

  /**
   * Genere un exercice via OpenAI et le sauvegarde en base.
   */
  private async generateExerciseWithAI(): Promise<Exercise | null> {
    if (!this.openaiKey) {
      this.logger.warn('OPENAI_API_KEY non configuree — generation impossible');
      return null;
    }

    const topic = CYBER_TOPICS[Math.floor(Math.random() * CYBER_TOPICS.length)];

    const prompt = `Tu es un formateur en cybersecurite pour PME francaises. Genere un exercice QCM en JSON.

Le sujet est : "${topic}"

Retourne UNIQUEMENT du JSON valide, sans markdown, sans explication, avec cette structure exacte :
{
  "topic": "${topic}",
  "description": "description courte du module en 1 phrase",
  "courseIntro": "introduction de 2-3 phrases expliquant le sujet simplement",
  "questions": [
    {
      "id": "q1",
      "context": "mise en situation concrete (1-2 phrases)",
      "text": "la question",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": 0,
      "feedbackCorrect": "explication si bonne reponse",
      "feedbackIncorrect": "explication si mauvaise reponse",
      "keyTakeaway": "le point cle a retenir"
    }
  ]
}

Genere exactement 4 questions. Les questions doivent etre pratiques avec des mises en situation reelles. Difficulte : debutant a intermediaire. Langue : francais.`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 2000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        this.logger.error(`OpenAI API error: ${res.status}`);
        return null;
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';

      // Extraire le JSON de la reponse (gerer les blocs ```json```)
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```json?\s*/, '').replace(/```\s*$/, '');
      }

      const payload = JSON.parse(jsonStr);

      // Sauvegarder en base pour ne pas regenerer
      const exercise = this.exerciseRepo.create({
        topic: payload.topic || topic,
        type: 'QUIZ' as any,
        difficulty: 'BEGINNER' as any,
        payloadJSON: payload,
        description: payload.description || `Exercice ${topic}`,
        active: true,
        generatedByAi: true,
        tenantId: null,
        version: '1.0.0',
      });

      const saved = await this.exerciseRepo.save(exercise);
      this.logger.log(`Exercice IA genere et sauvegarde: ${saved.id} (${topic})`);

      return saved;
    } catch (err) {
      this.logger.error(`Generation IA echouee: ${err.message}`);
      return null;
    }
  }

  /**
   * Soumettre les reponses d'un exercice
   */
  async submitExercise(exerciseId: string, answers: any[], userId: string) {
    const exercise = await this.exerciseRepo.findOne({ where: { id: exerciseId } });
    if (!exercise) {
      throw new NotFoundException('Exercice non trouve');
    }

    const payload = exercise.payloadJSON || {};
    const questions = payload.questions || [];
    let score = 0;

    for (const ans of answers) {
      const question = questions.find(
        (q: any) => (q.id || `q${questions.indexOf(q) + 1}`) === ans.questionId,
      );
      if (question && question.correctAnswer === ans.answer) {
        score++;
      }
    }

    const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

    // Si l'utilisateur a epuise tous les exercices, generer un nouveau en arriere-plan
    const totalExercises = await this.exerciseRepo.count({ where: { active: true } });
    if (totalExercises < 20 && this.openaiKey) {
      this.generateExerciseWithAI().catch(() => {});
    }

    return {
      score,
      maxScore: questions.length,
      percentage: pct,
      feedback: pct === 100
        ? 'Parfait ! Tu maitrises ce sujet ! 🏆'
        : pct >= 70
          ? 'Tres bien ! Continue comme ca ! 💪'
          : pct >= 50
            ? 'Pas mal ! Revois les points manques. 📚'
            : 'Chaque erreur est une occasion d\'apprendre ! 🌱',
      exerciseId,
      userId,
    };
  }

  /**
   * Progression utilisateur
   */
  async getUserProgress(userId: string, tenantId: string) {
    const totalExercises = await this.exerciseRepo.count({ where: { active: true } });

    return {
      totalExercises,
      completedExercises: 0,
      averageScore: 0,
      currentLevel: 'BEGINNER',
      progressPercentage: 0,
    };
  }

  /**
   * Chat IA - coach cybersecurite
   * Utilise OpenAI si disponible, sinon fallback local
   */
  async chat(message: string, context?: any) {
    // Essayer OpenAI d'abord
    if (this.openaiKey) {
      try {
        return await this.chatWithOpenAI(message, context);
      } catch (err) {
        this.logger.warn(`OpenAI chat fallback: ${err.message}`);
      }
    }

    // Fallback local
    return this.chatLocal(message, context);
  }

  private async chatWithOpenAI(message: string, context?: any) {
    const systemPrompt = `Tu es un coach cybersecurite bienveillant pour des employes de PME francaises.
Tu reponds en francais, de maniere simple et pratique. Utilise des emojis avec moderation.
Tu donnes des conseils concrets et actionnables. Tu es encourage et positif.
Si la question n'est pas liee a la cybersecurite, redirige poliment vers le sujet.
Formate tes reponses en markdown (gras, listes a puces).`;

    const messages: any[] = [{ role: 'system', content: systemPrompt }];

    if (context?.history) {
      messages.push(...context.history.slice(-6));
    }
    messages.push({ role: 'user', content: message });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) throw new Error(`OpenAI ${res.status}`);

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || 'Desole, je n\'ai pas pu repondre.';

    const history = [...(context?.history || []), { role: 'user', content: message }, { role: 'assistant', content: reply }].slice(-10);

    return { response: reply, context: { history, lastTopic: context?.lastTopic } };
  }

  private chatLocal(message: string, context?: any) {
    const lowerMsg = message.toLowerCase();

    const responses: Record<string, string> = {
      phishing: "Le **phishing** est une technique de fraude par email ou message qui imite des organismes de confiance pour voler vos informations.\n\n**Comment s'en proteger :**\n- Verifiez l'adresse de l'expediteur\n- Ne cliquez jamais sur un lien suspect\n- En cas de doute, contactez directement l'organisme",
      ransomware: "Un **ransomware** chiffre vos fichiers et demande une rancon.\n\n**Protection :**\n- Sauvegardes regulieres (3-2-1)\n- Ne jamais payer la rancon\n- Maintenir les logiciels a jour",
      mot_de_passe: "**Bonnes pratiques mots de passe :**\n- Minimum 12 caracteres\n- Un mot de passe unique par service\n- Utilisez un gestionnaire de mots de passe\n- Activez le 2FA partout",
      vpn: "Un **VPN** cree un tunnel chiffre entre votre appareil et Internet.\n\n**Quand l'utiliser :**\n- En Wi-Fi public\n- En teletravail\n- Pour acceder aux ressources de l'entreprise",
      rgpd: "Le **RGPD** protege les donnees personnelles des citoyens europeens.\n\n**Principes cles :**\n- Consentement explicite\n- Droit a l'oubli\n- Notification sous 72h en cas de fuite",
    };

    for (const [key, response] of Object.entries(responses)) {
      if (lowerMsg.includes(key) || lowerMsg.includes(key.replace('_', ' '))) {
        return { response, context: { lastTopic: key } };
      }
    }

    return {
      response: "Je suis ton **coach cybersecurite** ! 🛡️\n\nJe peux t'aider sur :\n- **Phishing** - reconnaitre les arnaques\n- **Ransomware** - se proteger\n- **Mots de passe** - bonnes pratiques\n- **VPN** - securiser sa connexion\n- **RGPD** - protection des donnees\n\nPose-moi ta question !",
      context: context || {},
    };
  }
}
