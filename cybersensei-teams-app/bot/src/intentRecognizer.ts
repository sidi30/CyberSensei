/**
 * Reconnaissance d'intentions simples basée sur des mots-clés
 * En production, utiliser LUIS ou Azure Cognitive Services
 */

export type Intent =
  | 'quiz'
  | 'explain'
  | 'help'
  | 'status'
  | 'greeting'
  | 'unknown';

export interface RecognizedIntent {
  intent: Intent;
  confidence: number;
  entities?: Record<string, string>;
}

/**
 * Reconnaissance d'intention basée sur des patterns simples
 */
export class IntentRecognizer {
  private patterns: Map<Intent, RegExp[]> = new Map([
    [
      'quiz',
      [
        /\b(quiz|training|start|commence|exercice|test)\b/i,
        /\b(entraînement|formation)\b/i,
      ],
    ],
    [
      'explain',
      [
        /\b(explain|expliquer|pourquoi|why|comment|how)\b/i,
        /\b(qu'est[- ]ce que|c'est quoi|aide[- ]moi)\b/i,
        /\b(plus d'info|détails|précisions)\b/i,
      ],
    ],
    [
      'help',
      [
        /\b(help|aide|assist|support|commandes?)\b/i,
        /\b(que peux[- ]tu faire|quoi faire|options)\b/i,
      ],
    ],
    [
      'status',
      [
        /\b(status|statut|score|résultat|performance)\b/i,
        /\b(où en suis[- ]je|mon niveau|ma progression)\b/i,
      ],
    ],
    [
      'greeting',
      [
        /\b(bonjour|salut|hello|hi|hey|bonsoir)\b/i,
        /\b(comment (ça|ca) va|ça va)\b/i,
      ],
    ],
  ]);

  /**
   * Reconnaît l'intention d'un message
   */
  recognize(text: string): RecognizedIntent {
    const normalizedText = text.toLowerCase().trim();

    // Vérifier chaque pattern
    for (const [intent, patterns] of this.patterns.entries()) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedText)) {
          return {
            intent,
            confidence: 0.9,
          };
        }
      }
    }

    // Aucune intention reconnue
    return {
      intent: 'unknown',
      confidence: 0.0,
    };
  }

  /**
   * Extrait des entités du texte (version simple)
   */
  extractEntities(text: string): Record<string, string> {
    const entities: Record<string, string> = {};

    // Exemples d'extraction d'entités
    const topicMatch = text.match(/\b(phishing|malware|password|mot de passe)\b/i);
    if (topicMatch) {
      entities.topic = topicMatch[1].toLowerCase();
    }

    return entities;
  }
}

export const intentRecognizer = new IntentRecognizer();

