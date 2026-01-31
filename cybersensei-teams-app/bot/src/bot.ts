/**
 * Bot principal CyberSensei avec reconnaissance d'intentions
 */

import {
  ActivityHandler,
  TurnContext,
  CardFactory,
  MessageFactory,
  Activity,
} from 'botbuilder';
import { backendService } from './services/backendService';
import { conversationState } from './conversationState';
import { intentRecognizer } from './intentRecognizer';
import { createQuizCard } from './cards/quizCard';
import { createResultCard } from './cards/resultCard';
import { createHelpCard } from './cards/helpCard';
import { createStatusCard } from './cards/statusCard';

/**
 * Traduit les niveaux de difficulté en français
 */
function translateLevel(level: string): string {
  const translations: Record<string, string> = {
    'BEGINNER': '🌱 Débutant',
    'INTERMEDIATE': '📚 Intermédiaire',
    'ADVANCED': '🚀 Avancé',
    'EXPERT': '🏆 Expert',
  };
  return translations[level] || level;
}

export class CyberSenseiBot extends ActivityHandler {
  constructor() {
    super();

    // Gestion des messages
    this.onMessage(async (context, next) => {
      await this.handleMessage(context);
      await next();
    });

    // Gestion des nouveaux membres
    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded || [];
      for (const member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          await this.sendWelcomeMessage(context);
        }
      }
      await next();
    });
  }

  /**
   * Gère les messages entrants
   */
  private async handleMessage(context: TurnContext): Promise<void> {
    const conversationId = context.activity.conversation.id;
    const userId = context.activity.from.id;
    const userName = context.activity.from.name || 'Utilisateur';

    // Sauvegarder le nom d'utilisateur
    conversationState.set(conversationId, { userName });

    // Vérifier si c'est une action de carte (Submit)
    if (context.activity.value) {
      await this.handleCardAction(context, context.activity.value);
      return;
    }

    const text = context.activity.text?.trim() || '';
    console.log(`[Bot] Message from ${userName}: ${text}`);

    // Reconnaissance d'intention
    const recognized = intentRecognizer.recognize(text);
    console.log(`[Bot] Recognized intent: ${recognized.intent} (confidence: ${recognized.confidence})`);

    try {
      switch (recognized.intent) {
        case 'quiz':
          await this.handleQuizIntent(context, conversationId, userId);
          break;

        case 'explain':
          await this.handleExplainIntent(context, conversationId, text);
          break;

        case 'help':
          await this.handleHelpIntent(context);
          break;

        case 'status':
          await this.handleStatusIntent(context, userId);
          break;

        case 'greeting':
          await this.handleGreetingIntent(context, userName);
          break;

        case 'unknown':
        default:
          // Si aucune intention reconnue, utiliser le chat IA
          await this.handleChatIntent(context, conversationId, text);
          break;
      }
    } catch (error) {
      console.error('[Bot] Error handling message:', error);
      await context.sendActivity(
        '❌ Désolé, une erreur s\'est produite. Veuillez réessayer ou tapez "aide" pour obtenir de l\'aide.'
      );
    }
  }

  /**
   * Gère les actions de cartes adaptives
   */
  private async handleCardAction(context: TurnContext, data: any): Promise<void> {
    const conversationId = context.activity.conversation.id;
    const action = data.action;

    console.log(`[Bot] Card action: ${action}`);

    try {
      switch (action) {
        case 'submitQuiz':
          await this.handleQuizSubmission(context, conversationId, data);
          break;

        case 'explain':
          conversationState.set(conversationId, { lastQuestionContext: data.context });
          await context.sendActivity('🤔 Que souhaitez-vous que je vous explique ?');
          break;

        case 'newQuiz':
        case 'startQuiz':
          await this.handleQuizIntent(context, conversationId, context.activity.from.id);
          break;

        default:
          await context.sendActivity('Action non reconnue. Tapez "aide" pour voir les commandes disponibles.');
          break;
      }
    } catch (error) {
      console.error('[Bot] Error handling card action:', error);
      await context.sendActivity('❌ Erreur lors du traitement de l\'action.');
    }
  }

  /**
   * Message de bienvenue
   */
  private async sendWelcomeMessage(context: TurnContext): Promise<void> {
    const userName = context.activity.from.name || 'Utilisateur';
    const welcomeMessage = `👋 **Bonjour ${userName} !**

Bienvenue sur **CyberSensei**, votre assistant personnel en cybersécurité ! 🛡️

Je suis là pour vous aider à :
✅ Vous entraîner avec des quiz interactifs
✅ Suivre votre progression
✅ Répondre à toutes vos questions sur la cybersécurité

**🚀 Pour commencer :**
• Tapez **"quiz"** pour un exercice
• Tapez **"aide"** pour voir toutes les commandes
• Ou posez-moi directement une question !

Prêt à devenir un expert en cybersécurité ? 💪`;

    await context.sendActivity(welcomeMessage);
  }

  /**
   * Gère l'intention "quiz"
   */
  private async handleQuizIntent(
    context: TurnContext,
    conversationId: string,
    userId: string
  ): Promise<void> {
    await context.sendActivity({ type: 'typing' });

    try {
      const quiz = await backendService.getTodayQuiz(userId);
      
      // Sauvegarder l'ID du quiz dans l'état
      conversationState.set(conversationId, {
        lastExerciseId: quiz.id,
        lastQuizTitle: quiz.title,
      });

      const quizCard = CardFactory.adaptiveCard(createQuizCard(quiz));
      await context.sendActivity(MessageFactory.attachment(quizCard));
    } catch (error) {
      console.error('[Bot] Error loading quiz:', error);
      await context.sendActivity(
        '😕 Désolé, aucun quiz n\'est disponible pour le moment. Revenez plus tard !'
      );
    }
  }

  /**
   * Gère la soumission d'un quiz
   */
  private async handleQuizSubmission(
    context: TurnContext,
    conversationId: string,
    data: any
  ): Promise<void> {
    await context.sendActivity({ type: 'typing' });

    try {
      const quizId = data.quizId;
      const state = conversationState.get(conversationId);

      // Extraire les réponses
      const answers: { questionId: string; answer: number }[] = [];
      for (const key in data) {
        if (key.startsWith('question_')) {
          const questionId = key.replace('question_', '');
          const answerValue = data[key];
          // Gérer le cas où la réponse est une chaîne ou un nombre
          const answer = typeof answerValue === 'string' ? parseInt(answerValue, 10) : answerValue;
          if (!isNaN(answer)) {
            answers.push({ questionId, answer });
          }
        }
      }

      if (answers.length === 0) {
        await context.sendActivity('❌ Aucune réponse détectée. Veuillez sélectionner une réponse pour chaque question.');
        return;
      }

      console.log(`[Bot] Submitting ${answers.length} answers for quiz ${quizId}`);

      // Soumettre au backend (le scoring est fait côté serveur)
      const result = await backendService.submitExercise(quizId, answers);

      // Calculer les stats pour l'affichage
      const score = result.score || 0;
      const maxScore = result.maxScore || answers.length;
      const correct = result.correct || Math.round(score);
      const total = result.total || answers.length;

      // Créer la carte de résultat
      const resultCard = CardFactory.adaptiveCard(
        createResultCard(
          {
            score,
            maxScore,
            correct,
            total,
            feedback: result.feedback || 'Exercice terminé !',
          },
          state.lastQuizTitle || 'Quiz CyberSensei'
        )
      );
      await context.sendActivity(MessageFactory.attachment(resultCard));

      // Sauvegarder le contexte pour les explications
      conversationState.set(conversationId, {
        lastQuestionContext: `Quiz: ${state.lastQuizTitle}. Score: ${score}/${maxScore}. ${result.feedback || ''}`,
        lastExerciseId: quizId,
      });

      // Enregistrer l'exercice dans l'historique de session
      conversationState.addCompletedExercise(conversationId, {
        exerciseId: quizId,
        title: state.lastQuizTitle || 'Quiz',
        score,
        maxScore,
        completedAt: new Date(),
      });

      // Afficher les stats de session
      const sessionStats = conversationState.getSessionStats(conversationId);
      if (sessionStats.count > 1) {
        await context.sendActivity(
          `📊 **Session en cours:** ${sessionStats.count} exercices | Score moyen: ${sessionStats.avgScore}%`
        );
      }

      // Message d'encouragement personnalisé
      const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
      if (percentage === 100) {
        await context.sendActivity('🎯 Score parfait ! Tu peux taper "quiz" pour un nouvel exercice.');
      } else if (percentage >= 70) {
        await context.sendActivity('👏 Bien joué ! Continue avec un autre "quiz" pour t\'améliorer.');
      }
    } catch (error) {
      console.error('[Bot] Error submitting quiz:', error);
      await context.sendActivity(
        '❌ Erreur lors de la soumission du quiz. Veuillez réessayer.'
      );
    }
  }

  /**
   * Gère l'intention "explain"
   */
  private async handleExplainIntent(
    context: TurnContext,
    conversationId: string,
    message: string
  ): Promise<void> {
    await context.sendActivity({ type: 'typing' });

    try {
      const state = conversationState.get(conversationId);
      const contextInfo = state.lastQuestionContext || undefined;

      const response = await backendService.chatWithAI(message, contextInfo);
      await context.sendActivity(response.response);
    } catch (error) {
      console.error('[Bot] Error getting explanation:', error);
      await context.sendActivity(
        '❌ Désolé, je n\'ai pas pu obtenir une explication pour le moment.'
      );
    }
  }

  /**
   * Gère l'intention "help"
   */
  private async handleHelpIntent(context: TurnContext): Promise<void> {
    const helpMessage = `🛡️ **CyberSensei - Votre assistant en cybersécurité**

Je suis là pour vous aider à renforcer vos compétences en cybersécurité de manière simple et interactive.

**💬 Commandes disponibles :**

• **"quiz"** ou **"exercice"** - Commencer un quiz du jour
• **"score"** ou **"progression"** - Voir vos résultats
• **"aide"** ou **"help"** - Afficher ce message

**🤖 Posez-moi n'importe quelle question !**

Exemples :
• "Qu'est-ce que le phishing ?"
• "Comment créer un mot de passe sécurisé ?"
• "Explique-moi le ransomware"

Tapez simplement votre question et je vous répondrai ! 😊`;

    await context.sendActivity(helpMessage);
  }

  /**
   * Gère l'intention "status"
   */
  private async handleStatusIntent(
    context: TurnContext,
    userId: string
  ): Promise<void> {
    await context.sendActivity({ type: 'typing' });

    const conversationId = context.activity.conversation.id;

    try {
      // Récupérer les infos utilisateur
      let user;
      try {
        user = await backendService.getUser(userId);
      } catch {
        user = {
          id: userId,
          displayName: context.activity.from.name || 'Utilisateur',
          role: 'USER' as const,
        };
      }

      // Récupérer la progression depuis le backend
      let progress;
      try {
        progress = await backendService.getUserProgress();
      } catch (err) {
        console.warn('[Bot] Could not load user progress:', err);
      }

      // Stats de session locale
      const sessionStats = conversationState.getSessionStats(conversationId);

      let metrics;
      if (user.role === 'MANAGER' || user.role === 'ADMIN') {
        try {
          metrics = await backendService.getManagerMetrics();
        } catch (err) {
          console.warn('[Bot] Could not load manager metrics:', err);
        }
      }

      // Construire un message de statut enrichi
      let statusMessage = `📊 **Ton statut CyberSensei**\n\n`;

      if (progress) {
        statusMessage += `🎯 **Progression globale:**\n`;
        statusMessage += `• Exercices complétés: ${progress.completedExercises}/${progress.totalExercises}\n`;
        statusMessage += `• Progression: ${Math.round(progress.progressPercentage)}%\n`;
        statusMessage += `• Score moyen: ${Math.round(progress.averageScore)}%\n`;
        statusMessage += `• Niveau actuel: ${translateLevel(progress.currentLevel)}\n\n`;
      }

      if (sessionStats.count > 0) {
        statusMessage += `📈 **Session actuelle:**\n`;
        statusMessage += `• Exercices faits: ${sessionStats.count}\n`;
        statusMessage += `• Score moyen session: ${sessionStats.avgScore}%\n\n`;
      }

      statusMessage += `💡 Tape "**quiz**" pour continuer ta formation !`;

      await context.sendActivity(statusMessage);

      // Afficher la carte de statut si disponible
      if (user && (progress || metrics)) {
        const statusCard = CardFactory.adaptiveCard(createStatusCard(user, metrics));
        await context.sendActivity(MessageFactory.attachment(statusCard));
      }
    } catch (error) {
      console.error('[Bot] Error loading status:', error);
      await context.sendActivity(
        '❌ Impossible de récupérer votre statut pour le moment.'
      );
    }
  }

  /**
   * Gère l'intention "greeting"
   */
  private async handleGreetingIntent(
    context: TurnContext,
    userName: string
  ): Promise<void> {
    const greetings = [
      `Bonjour ${userName} ! 👋 Comment puis-je vous aider aujourd'hui ?`,
      `Salut ${userName} ! 😊 Prêt pour votre formation en cybersécurité ?`,
      `Hello ${userName} ! 🛡️ Que puis-je faire pour vous ?`,
    ];

    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    await context.sendActivity(greeting);
    await context.sendActivity(
      'Tapez "**quiz**" pour commencer un exercice, ou "**aide**" pour voir toutes les commandes.'
    );
  }

  /**
   * Gère le chat IA pour les messages non reconnus
   */
  private async handleChatIntent(
    context: TurnContext,
    conversationId: string,
    message: string
  ): Promise<void> {
    await context.sendActivity({ type: 'typing' });

    try {
      const state = conversationState.get(conversationId);
      const response = await backendService.chatWithAI(
        message,
        state.lastQuestionContext
      );

      await context.sendActivity(response.response);

      // Mettre à jour le contexte
      if (response.context) {
        conversationState.set(conversationId, {
          lastQuestionContext: response.context,
        });
      }
    } catch (error) {
      console.error('[Bot] Error in chat:', error);
      await context.sendActivity(
        '❌ Désolé, je n\'ai pas pu traiter votre message. Tapez "**aide**" pour voir les commandes disponibles.'
      );
    }
  }
}
