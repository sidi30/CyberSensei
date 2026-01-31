/**
 * Gestion de l'état de conversation
 * Version améliorée avec historique de session
 */

export interface CompletedExercise {
  exerciseId: string;
  title: string;
  score: number;
  maxScore: number;
  completedAt: Date;
}

export interface ConversationData {
  lastExerciseId?: string;
  lastQuestionContext?: string;
  lastQuizTitle?: string;
  userName?: string;
  userRole?: string;
  userId?: string;
  // Historique de session (exercices faits pendant cette session)
  sessionExercises: CompletedExercise[];
  // Timestamp de création pour le cleanup
  createdAt: Date;
  lastActivityAt: Date;
}

/**
 * Stockage en mémoire de l'état des conversations
 * Note: En production, utiliser Azure Storage ou Cosmos DB
 */
class ConversationStateManager {
  private states: Map<string, ConversationData> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Nettoyer les vieilles conversations toutes les heures
    this.cleanupInterval = setInterval(() => this.cleanup(), 3600000);
  }

  /**
   * Récupère l'état d'une conversation
   */
  get(conversationId: string): ConversationData {
    if (!this.states.has(conversationId)) {
      this.states.set(conversationId, {
        sessionExercises: [],
        createdAt: new Date(),
        lastActivityAt: new Date(),
      });
    }
    const state = this.states.get(conversationId)!;
    state.lastActivityAt = new Date();
    return state;
  }

  /**
   * Met à jour l'état d'une conversation
   */
  set(conversationId: string, data: Partial<ConversationData>): void {
    const current = this.get(conversationId);
    this.states.set(conversationId, {
      ...current,
      ...data,
      lastActivityAt: new Date(),
    });
  }

  /**
   * Ajoute un exercice complété à l'historique de session
   */
  addCompletedExercise(conversationId: string, exercise: CompletedExercise): void {
    const state = this.get(conversationId);
    // Éviter les doublons
    const exists = state.sessionExercises.some(e => e.exerciseId === exercise.exerciseId);
    if (!exists) {
      state.sessionExercises.push(exercise);
      this.states.set(conversationId, state);
    }
  }

  /**
   * Vérifie si un exercice a déjà été fait dans cette session
   */
  hasCompletedInSession(conversationId: string, exerciseId: string): boolean {
    const state = this.get(conversationId);
    return state.sessionExercises.some(e => e.exerciseId === exerciseId);
  }

  /**
   * Récupère les statistiques de la session
   */
  getSessionStats(conversationId: string): { count: number; avgScore: number; totalScore: number } {
    const state = this.get(conversationId);
    const exercises = state.sessionExercises;

    if (exercises.length === 0) {
      return { count: 0, avgScore: 0, totalScore: 0 };
    }

    const totalScore = exercises.reduce((sum, e) => sum + e.score, 0);
    const maxPossible = exercises.reduce((sum, e) => sum + e.maxScore, 0);
    const avgScore = maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0;

    return {
      count: exercises.length,
      avgScore: Math.round(avgScore),
      totalScore,
    };
  }

  /**
   * Efface l'état d'une conversation
   */
  clear(conversationId: string): void {
    this.states.delete(conversationId);
  }

  /**
   * Efface les états anciens (conversations inactives depuis plus de maxAgeMs)
   */
  cleanup(maxAgeMs: number = 3600000): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, state] of this.states.entries()) {
      const age = now - state.lastActivityAt.getTime();
      if (age > maxAgeMs) {
        this.states.delete(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[State] Cleaned up ${cleaned} inactive conversations`);
    }
  }

  /**
   * Retourne le nombre de conversations actives
   */
  getActiveCount(): number {
    return this.states.size;
  }
}

export const conversationState = new ConversationStateManager();

