/**
 * Gestion de l'état de conversation
 */

export interface ConversationData {
  lastExerciseId?: string;
  lastQuestionContext?: string;
  lastQuizTitle?: string;
  userName?: string;
  userRole?: string;
}

/**
 * Stockage en mémoire de l'état des conversations
 * En production, utiliser Azure Storage ou Cosmos DB
 */
class ConversationStateManager {
  private states: Map<string, ConversationData> = new Map();

  /**
   * Récupère l'état d'une conversation
   */
  get(conversationId: string): ConversationData {
    if (!this.states.has(conversationId)) {
      this.states.set(conversationId, {});
    }
    return this.states.get(conversationId)!;
  }

  /**
   * Met à jour l'état d'une conversation
   */
  set(conversationId: string, data: Partial<ConversationData>): void {
    const current = this.get(conversationId);
    this.states.set(conversationId, { ...current, ...data });
  }

  /**
   * Efface l'état d'une conversation
   */
  clear(conversationId: string): void {
    this.states.delete(conversationId);
  }

  /**
   * Efface les états anciens (cleanup)
   */
  cleanup(maxAgeMs: number = 3600000): void {
    // En production, ajouter un timestamp et nettoyer les vieux états
    console.log(`[State] Cleanup triggered (not implemented in memory store)`);
  }
}

export const conversationState = new ConversationStateManager();

