/**
 * Reconnaissance d'intentions avancée avec extraction d'entités
 * Gère les questions contextuelles et les demandes de définition
 */

export type Intent =
  | 'quiz'
  | 'explain'
  | 'help'
  | 'status'
  | 'greeting'
  | 'glossary'        // Demande de définition d'un terme
  | 'topic_question'  // Question sur un sujet spécifique
  | 'recommendation'  // Demande de recommandation
  | 'progress_query'  // Question sur la progression
  | 'feedback'        // Feedback utilisateur
  | 'unknown';

export interface RecognizedIntent {
  intent: Intent;
  confidence: number;
  entities: ExtractedEntities;
}

export interface ExtractedEntities {
  topic?: string;
  term?: string;
  difficulty?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

// Mapping des topics avec leurs variantes
const TOPIC_PATTERNS: { topic: string; patterns: RegExp[] }[] = [
  {
    topic: 'phishing',
    patterns: [/phishing/i, /hameçonnage/i, /hameconnage/i, /email.*(piège|piege|frauduleux)/i],
  },
  {
    topic: 'password',
    patterns: [/mot de passe/i, /password/i, /mdp/i, /authentification/i, /2fa/i, /mfa/i],
  },
  {
    topic: 'ransomware',
    patterns: [/ransomware/i, /rançongiciel/i, /rancongiciel/i, /rancon/i, /chiffrement.*malveillant/i],
  },
  {
    topic: 'social_engineering',
    patterns: [/ingénierie sociale/i, /ingenierie sociale/i, /social engineering/i, /manipulation/i, /arnaque/i],
  },
  {
    topic: 'malware',
    patterns: [/malware/i, /virus/i, /trojan/i, /cheval de troie/i, /logiciel malveillant/i],
  },
  {
    topic: 'data_protection',
    patterns: [/rgpd/i, /gdpr/i, /données personnelles/i, /donnees personnelles/i, /protection.*données/i, /vie privée/i],
  },
  {
    topic: 'network_security',
    patterns: [/vpn/i, /firewall/i, /pare-feu/i, /réseau/i, /wifi/i, /wi-fi/i],
  },
  {
    topic: 'shadow_it',
    patterns: [/shadow it/i, /outils? non approuvé/i, /application.*(perso|non autorisé)/i],
  },
  {
    topic: 'remote_work',
    patterns: [/télétravail/i, /teletravail/i, /travail à distance/i, /home office/i, /remote/i],
  },
];

// Termes du glossaire avec variantes
const GLOSSARY_TERMS: { term: string; patterns: RegExp[] }[] = [
  { term: 'phishing', patterns: [/phishing/i, /hameçonnage/i, /hameconnage/i] },
  { term: 'ransomware', patterns: [/ransomware/i, /rançongiciel/i, /rancongiciel/i] },
  { term: 'malware', patterns: [/malware/i, /logiciel malveillant/i] },
  { term: 'firewall', patterns: [/firewall/i, /pare-feu/i, /parefeu/i] },
  { term: 'vpn', patterns: [/vpn/i, /réseau privé virtuel/i] },
  { term: '2fa', patterns: [/2fa/i, /mfa/i, /double authentification/i, /authentification.*deux facteurs/i] },
  { term: 'social_engineering', patterns: [/ingénierie sociale/i, /ingenierie sociale/i, /social engineering/i] },
  { term: 'brute_force', patterns: [/brute force/i, /force brute/i] },
  { term: 'zero_trust', patterns: [/zero trust/i, /confiance zéro/i, /zéro confiance/i] },
  { term: 'encryption', patterns: [/chiffrement/i, /encryption/i, /cryptage/i] },
  { term: 'backdoor', patterns: [/backdoor/i, /porte dérobée/i, /porte derobee/i] },
  { term: 'keylogger', patterns: [/keylogger/i, /enregistreur de frappe/i] },
  { term: 'spyware', patterns: [/spyware/i, /logiciel espion/i] },
  { term: 'ddos', patterns: [/ddos/i, /déni de service/i, /denial of service/i] },
  { term: 'sql_injection', patterns: [/sql injection/i, /injection sql/i] },
  { term: 'xss', patterns: [/xss/i, /cross-site scripting/i] },
  { term: 'apt', patterns: [/apt/i, /advanced persistent threat/i, /menace persistante/i] },
  { term: 'siem', patterns: [/siem/i, /security information/i] },
  { term: 'soc', patterns: [/\bsoc\b/i, /security operations center/i] },
  { term: 'iam', patterns: [/\biam\b/i, /identity.*access.*management/i, /gestion des identités/i] },
];

/**
 * Reconnaissance d'intention avancée avec extraction d'entités
 */
export class IntentRecognizer {
  private intentPatterns: Map<Intent, { patterns: RegExp[]; priority: number }> = new Map([
    // Priorité haute - intentions spécifiques
    [
      'glossary',
      {
        patterns: [
          /^(qu'?est[- ]ce qu[e']|c'?est quoi|définition|definition|définir|signifie?|veut dire)/i,
          /^(explique[- ]?moi ce qu'?est|qu'?est[- ]ce que c'?est)/i,
          /que (signifie|veut dire)/i,
        ],
        priority: 10,
      },
    ],
    [
      'recommendation',
      {
        patterns: [
          /que (dois-je|devrais-je|faut-il|faudrait-il) (apprendre|travailler|réviser|revoir)/i,
          /(recommand|conseil|suggère|suggere)/i,
          /par (où|ou) (commencer|débuter)/i,
          /(quoi|que) (faire|apprendre) (ensuite|maintenant|après)/i,
          /mes (points faibles|faiblesses|lacunes)/i,
        ],
        priority: 9,
      },
    ],
    [
      'progress_query',
      {
        patterns: [
          /(où|ou) (en suis-je|j'?en suis)/i,
          /ma (progression|performance|évolution|evolution)/i,
          /mon (niveau|score|classement|avancement)/i,
          /comment (je|ça) (progresse|avance|va)/i,
          /(combien|quel).*exercices?.*(fait|complété|terminé)/i,
        ],
        priority: 8,
      },
    ],
    [
      'topic_question',
      {
        patterns: [
          /comment (se protéger|éviter|détecter|reconnaître)/i,
          /(quels?|quelles?) (sont|est) (les?|la|le) (risques?|dangers?|menaces?|signes?)/i,
          /que faire (si|quand|en cas)/i,
          /(pourquoi|comment) (les?|le|la) .* (dangereux|important|risqué)/i,
        ],
        priority: 7,
      },
    ],
    // Priorité moyenne - intentions de base
    [
      'quiz',
      {
        patterns: [
          /\b(quiz|training|exercice|test|entraînement|entrainement|formation)\b/i,
          /\b(commence[rz]?|démarre[rz]?|lance[rz]?|start)\b/i,
          /\b(je veux|j'?aimerais|peux-tu).*(quiz|exercice|test)/i,
        ],
        priority: 6,
      },
    ],
    [
      'status',
      {
        patterns: [
          /\b(status|statut|score|résultat|performance)\b/i,
          /\b(mes|mon) (stats?|statistiques?|résultats?)\b/i,
        ],
        priority: 6,
      },
    ],
    [
      'explain',
      {
        patterns: [
          /\b(explique[rz]?|pourquoi|why|comment|how)\b/i,
          /\b(plus d'?info|détails|précisions|en savoir plus)\b/i,
          /\b(aide[- ]?moi à comprendre)\b/i,
        ],
        priority: 5,
      },
    ],
    [
      'help',
      {
        patterns: [
          /\b(help|aide|assist|support|commandes?)\b/i,
          /\b(que (peux|peut)[- ]tu faire|quoi faire|options)\b/i,
          /\b(comment (ça|ca) (marche|fonctionne))\b/i,
        ],
        priority: 5,
      },
    ],
    [
      'feedback',
      {
        patterns: [
          /\b(super|génial|genial|excellent|nul|mauvais|bien|cool)\b/i,
          /\b(j'?ai (adoré|aimé|détesté)|c'?était (bien|nul|super))\b/i,
          /\bmerci\b/i,
        ],
        priority: 4,
      },
    ],
    [
      'greeting',
      {
        patterns: [
          /^(bonjour|salut|hello|hi|hey|bonsoir|coucou)/i,
          /\b(comment (ça|ca) va|ça va|ca va)\b/i,
        ],
        priority: 3,
      },
    ],
  ]);

  /**
   * Reconnaît l'intention d'un message avec extraction d'entités
   */
  recognize(text: string): RecognizedIntent {
    const normalizedText = text.toLowerCase().trim();
    const entities = this.extractEntities(text);

    // Vérifier les patterns par ordre de priorité
    let bestMatch: { intent: Intent; confidence: number } = {
      intent: 'unknown',
      confidence: 0,
    };

    // Trier les intents par priorité décroissante
    const sortedIntents = Array.from(this.intentPatterns.entries()).sort(
      (a, b) => b[1].priority - a[1].priority
    );

    for (const [intent, config] of sortedIntents) {
      for (const pattern of config.patterns) {
        if (pattern.test(normalizedText)) {
          // Ajuster la confiance en fonction de la priorité et de la présence d'entités
          let confidence = 0.7 + config.priority * 0.02;

          // Boost si des entités pertinentes sont présentes
          if (intent === 'glossary' && entities.term) {
            confidence += 0.15;
          } else if (intent === 'topic_question' && entities.topic) {
            confidence += 0.1;
          }

          if (confidence > bestMatch.confidence) {
            bestMatch = { intent, confidence: Math.min(confidence, 0.99) };
          }
          break;
        }
      }
    }

    // Si c'est une question et qu'on a un terme du glossaire, c'est probablement une demande de définition
    if (bestMatch.intent === 'unknown' && entities.term && this.isQuestion(normalizedText)) {
      bestMatch = { intent: 'glossary', confidence: 0.8 };
    }

    // Si c'est une question et qu'on a un topic, c'est une question sur le sujet
    if (bestMatch.intent === 'unknown' && entities.topic && this.isQuestion(normalizedText)) {
      bestMatch = { intent: 'topic_question', confidence: 0.75 };
    }

    return {
      ...bestMatch,
      entities,
    };
  }

  /**
   * Extrait les entités du texte
   */
  extractEntities(text: string): ExtractedEntities {
    const entities: ExtractedEntities = {};
    const normalizedText = text.toLowerCase();

    // Extraire le topic
    for (const { topic, patterns } of TOPIC_PATTERNS) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedText)) {
          entities.topic = topic;
          break;
        }
      }
      if (entities.topic) break;
    }

    // Extraire le terme de glossaire
    for (const { term, patterns } of GLOSSARY_TERMS) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedText)) {
          entities.term = term;
          break;
        }
      }
      if (entities.term) break;
    }

    // Extraire la difficulté mentionnée
    const difficultyMatch = normalizedText.match(
      /\b(débutant|debutant|beginner|intermédiaire|intermediaire|intermediate|avancé|avance|advanced|expert)\b/i
    );
    if (difficultyMatch) {
      const diffMap: Record<string, string> = {
        débutant: 'BEGINNER',
        debutant: 'BEGINNER',
        beginner: 'BEGINNER',
        intermédiaire: 'INTERMEDIATE',
        intermediaire: 'INTERMEDIATE',
        intermediate: 'INTERMEDIATE',
        avancé: 'ADVANCED',
        avance: 'ADVANCED',
        advanced: 'ADVANCED',
        expert: 'EXPERT',
      };
      entities.difficulty = diffMap[difficultyMatch[1].toLowerCase()];
    }

    // Détecter le sentiment
    entities.sentiment = this.detectSentiment(normalizedText);

    return entities;
  }

  /**
   * Vérifie si le texte est une question
   */
  private isQuestion(text: string): boolean {
    return (
      text.includes('?') ||
      /^(qu[e']|comment|pourquoi|où|ou|quand|qui|quel|combien|est-ce)/i.test(text) ||
      /\b(c'est quoi|qu'est-ce|sais-tu|peux-tu|connais-tu)\b/i.test(text)
    );
  }

  /**
   * Détecte le sentiment du message
   */
  private detectSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positivePatterns = [
      /\b(super|génial|genial|excellent|parfait|merci|bravo|cool|top|bien)\b/i,
      /\b(j'?adore|j'?aime|content|satisfait)\b/i,
      /👍|🎉|😊|🙂|💪|✅/,
    ];

    const negativePatterns = [
      /\b(nul|mauvais|horrible|difficile|compliqué|problème|bug|erreur)\b/i,
      /\b(je (déteste|comprends pas)|pas (clair|compris))\b/i,
      /👎|😠|😤|❌|😞/,
    ];

    for (const pattern of positivePatterns) {
      if (pattern.test(text)) return 'positive';
    }

    for (const pattern of negativePatterns) {
      if (pattern.test(text)) return 'negative';
    }

    return 'neutral';
  }

  /**
   * Obtient les topics disponibles
   */
  getAvailableTopics(): string[] {
    return TOPIC_PATTERNS.map((t) => t.topic);
  }

  /**
   * Obtient les termes du glossaire disponibles
   */
  getGlossaryTerms(): string[] {
    return GLOSSARY_TERMS.map((t) => t.term);
  }
}

export const intentRecognizer = new IntentRecognizer();
