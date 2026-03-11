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

@Injectable()
export class ExtensionService {
  private readonly logger = new Logger(ExtensionService.name);

  constructor(
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
    @InjectRepository(License)
    private licenseRepo: Repository<License>,
    @InjectRepository(Exercise)
    private exerciseRepo: Repository<Exercise>,
    private configService: ConfigService,
  ) {}

  /**
   * Activation par code court (CS-XXXXXXXX) ou licenseKey
   */
  async activate(code: string) {
    const normalizedCode = code.trim().toUpperCase();

    // 1. Chercher par activationCode (format CS-XXXXXXXX)
    let tenant = await this.tenantRepo.findOne({
      where: { activationCode: normalizedCode, active: true },
    });

    // 2. Fallback: chercher par licenseKey
    if (!tenant) {
      tenant = await this.tenantRepo.findOne({
        where: { licenseKey: normalizedCode, active: true },
      });
    }

    // 3. Fallback: chercher dans les licences
    if (!tenant) {
      const license = await this.licenseRepo.findOne({
        where: { key: normalizedCode, status: LicenseStatus.ACTIVE },
        relations: ['tenant'],
      });

      if (license) {
        if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
          throw new BadRequestException("Ce code d'activation a expiré");
        }
        if (license.maxUsageCount && license.usageCount >= license.maxUsageCount) {
          throw new BadRequestException("Ce code a atteint sa limite d'utilisation");
        }
        if (!license.tenant?.active) {
          throw new BadRequestException('Le tenant associé est inactif');
        }
        license.usageCount += 1;
        await this.licenseRepo.save(license);
        tenant = license.tenant;
      }
    }

    if (!tenant) {
      throw new BadRequestException("Code d'activation invalide. Vérifiez le code et réessayez.");
    }

    const backendUrl = this.configService.get<string>('PUBLIC_BACKEND_URL')
      || this.configService.get<string>('BACKEND_URL')
      || 'http://localhost:3006';

    this.logger.log(`Extension activée pour le tenant: ${tenant.name} (code: ${normalizedCode})`);

    return {
      backendUrl,
      tenantId: tenant.id,
      tenantName: tenant.name,
      userId: `ext-${tenant.id.substring(0, 8)}`,
      userName: tenant.companyName || tenant.name,
    };
  }

  /**
   * Récupérer le quiz du jour pour un tenant
   */
  async getTodayQuiz(tenantId: string) {
    // Chercher un exercice actif pour ce tenant (tenantId est uuid en DB)
    let exercises = await this.exerciseRepo
      .createQueryBuilder('e')
      .where('e."tenantId" = :tenantId AND e.active = true', { tenantId })
      .orderBy('e."createdAt"', 'DESC')
      .getMany();

    // Si pas d'exercices spécifiques au tenant, prendre les exercices globaux
    if (exercises.length === 0) {
      exercises = await this.exerciseRepo.find({
        where: { active: true },
        order: { createdAt: 'DESC' },
      });
    }

    if (exercises.length === 0) {
      throw new NotFoundException('Aucun exercice disponible pour le moment');
    }

    // Sélectionner un exercice basé sur le jour (rotation quotidienne)
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
    );
    const index = dayOfYear % exercises.length;

    return exercises[index];
  }

  /**
   * Soumettre les réponses d'un exercice
   */
  async submitExercise(exerciseId: string, answers: any[], userId: string) {
    const exercise = await this.exerciseRepo.findOne({ where: { id: exerciseId } });
    if (!exercise) {
      throw new NotFoundException('Exercice non trouvé');
    }

    const payload = exercise.payloadJSON || {};
    const questions = payload.questions || [];
    let score = 0;
    const maxScore = questions.length;

    for (const ans of answers) {
      const question = questions.find((q: any) => (q.id || `q${questions.indexOf(q) + 1}`) === ans.questionId);
      if (question && question.correctAnswer === ans.answer) {
        score++;
      }
    }

    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    let feedback = '';
    if (pct === 100) feedback = 'Parfait ! Tu maîtrises ce sujet à la perfection ! 🏆';
    else if (pct >= 70) feedback = 'Très bien ! Tu as de solides connaissances. Continue comme ça ! 💪';
    else if (pct >= 50) feedback = 'Pas mal ! Revois les points manqués pour progresser. 📚';
    else feedback = 'Il y a du travail, mais chaque erreur est une occasion d\'apprendre ! 🌱';

    return {
      score,
      maxScore,
      percentage: pct,
      feedback,
      exerciseId,
      userId,
    };
  }

  /**
   * Progression utilisateur (basique - stockée côté extension)
   */
  async getUserProgress(userId: string, tenantId: string) {
    const totalExercises = await this.exerciseRepo.count({
      where: [
        { tenantId, active: true },
        { active: true },
      ],
    });

    return {
      totalExercises,
      completedExercises: 0,
      averageScore: 0,
      currentLevel: 'BEGINNER',
      progressPercentage: 0,
    };
  }

  /**
   * Chat IA - coach cybersécurité
   */
  async chat(message: string, context?: any) {
    // Réponse basique sans API IA (fallback)
    // En production, utiliser le AiService d'Anthropic
    const lowerMsg = message.toLowerCase();

    const responses: Record<string, string> = {
      phishing: "Le **phishing** est une technique de fraude par email ou message qui imite des organismes de confiance pour voler vos informations.\n\n**Comment s'en protéger :**\n- Vérifiez l'adresse de l'expéditeur\n- Ne cliquez jamais sur un lien suspect\n- En cas de doute, contactez directement l'organisme",
      ransomware: "Un **ransomware** chiffre vos fichiers et demande une rançon.\n\n**Protection :**\n- Sauvegardes régulières (3-2-1)\n- Ne jamais payer la rançon\n- Maintenir les logiciels à jour\n- Former les employés aux emails suspects",
      mot_de_passe: "**Bonnes pratiques mots de passe :**\n- Minimum 12 caractères\n- Mélangez majuscules, minuscules, chiffres, symboles\n- Un mot de passe unique par service\n- Utilisez un gestionnaire de mots de passe\n- Activez le 2FA partout",
      vpn: "Un **VPN** crée un tunnel chiffré entre votre appareil et Internet.\n\n**Quand l'utiliser :**\n- En Wi-Fi public (café, hôtel, aéroport)\n- En télétravail\n- Pour accéder aux ressources de l'entreprise à distance",
      rgpd: "Le **RGPD** protège les données personnelles des citoyens européens.\n\n**Principes clés :**\n- Consentement explicite\n- Droit à l'oubli\n- Minimisation des données\n- Notification sous 72h en cas de fuite",
    };

    for (const [key, response] of Object.entries(responses)) {
      if (lowerMsg.includes(key) || lowerMsg.includes(key.replace('_', ' '))) {
        return { response, context: { lastTopic: key } };
      }
    }

    return {
      response: "Je suis ton **coach cybersécurité** ! 🛡️\n\nJe peux t'aider sur :\n- **Phishing** - reconnaître les arnaques\n- **Ransomware** - se protéger\n- **Mots de passe** - bonnes pratiques\n- **VPN** - sécuriser sa connexion\n- **RGPD** - protection des données\n\nPose-moi ta question !",
      context: context || {},
    };
  }
}
