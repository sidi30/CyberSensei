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
    const welcomeCard = CardFactory.adaptiveCard(createHelpCard());
    await context.sendActivity(MessageFactory.attachment(welcomeCard));
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
          answers.push({
            questionId,
            answer: parseInt(data[key]),
          });
        }
      }

      if (answers.length === 0) {
        await context.sendActivity('❌ Aucune réponse détectée. Veuillez réessayer.');
        return;
      }

      // Soumettre au backend
      const result = await backendService.submitExercise(quizId, { answers });

      // Créer la carte de résultat
      const resultCard = CardFactory.adaptiveCard(
        createResultCard(result, state.lastQuizTitle || 'Quiz')
      );
      await context.sendActivity(MessageFactory.attachment(resultCard));

      // Sauvegarder le contexte pour les explications
      conversationState.set(conversationId, {
        lastQuestionContext: `Quiz: ${state.lastQuizTitle}. Score: ${result.score}/${result.maxScore}. ${result.feedback}`,
      });
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
    const helpCard = CardFactory.adaptiveCard(createHelpCard());
    await context.sendActivity(MessageFactory.attachment(helpCard));
  }

  /**
   * Gère l'intention "status"
   */
  private async handleStatusIntent(
    context: TurnContext,
    userId: string
  ): Promise<void> {
    await context.sendActivity({ type: 'typing' });

    try {
      const user = await backendService.getUser(userId);
      
      let metrics;
      if (user.role === 'MANAGER' || user.role === 'ADMIN') {
        try {
          metrics = await backendService.getManagerMetrics();
        } catch (err) {
          console.warn('[Bot] Could not load manager metrics:', err);
        }
      }

      const statusCard = CardFactory.adaptiveCard(createStatusCard(user, metrics));
      await context.sendActivity(MessageFactory.attachment(statusCard));
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
