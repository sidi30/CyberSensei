/**
 * Types enrichis pour le système pédagogique CyberSensei
 * Système commercial-ready avec support multimédia
 */

// ============================================
// TYPES DE MÉDIAS PÉDAGOGIQUES
// ============================================

export interface PedagogicalMedia {
  type: 'image' | 'gif' | 'video' | 'lottie';
  url: string;
  alt: string;
  caption?: string;
  thumbnail?: string;
}

// ============================================
// STRUCTURE DE CONSEIL (POST-RÉPONSE)
// ============================================

export interface AdviceBlock {
  concept: string;       // Explication courte du concept (1-2 phrases)
  example: string;       // Exemple du quotidien
  advice: string[];      // 2-3 conseils actionnables
  media?: PedagogicalMedia; // Image/vidéo d'illustration
}

// ============================================
// QUESTION ENRICHIE
// ============================================

export interface EnrichedQuestion {
  id: string;
  // Contexte et mise en situation
  context?: string;           // Mise en situation réaliste
  contextMedia?: PedagogicalMedia; // Illustration du contexte (screenshot, image)
  
  // Question
  text: string;               // La question elle-même
  options: string[];          // Les choix possibles
  correctAnswer: number;      // Index de la bonne réponse
  
  // Feedback selon réponse
  feedbackCorrect: string;    // Message si bonne réponse
  feedbackIncorrect: string;  // Message si mauvaise réponse
  
  // Conseil pédagogique structuré (toujours affiché)
  advice: AdviceBlock;
  
  // Éléments complémentaires
  keyTakeaway: string;        // Le point essentiel à retenir
  commonMistake?: string;     // Erreur fréquente à éviter
  proTip?: string;            // Conseil bonus pour les plus curieux
}

// ============================================
// EXERCICE/QUIZ ENRICHI
// ============================================

export interface EnrichedQuiz {
  id: string;
  topic: string;
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  
  // Introduction du module
  courseIntro: string;
  introMedia?: PedagogicalMedia;
  
  // Questions du quiz
  questions: EnrichedQuestion[];
  
  // Récapitulatif de fin
  summary?: {
    keyPoints: string[];
    resources?: { title: string; url: string }[];
    nextTopicSuggestion?: string;
  };
  
  // Métadonnées
  estimatedMinutes?: number;
  tags?: string[];
}

// ============================================
// BIBLIOTHÈQUE DE MÉDIAS PAR THÈME
// ============================================

export const MEDIA_LIBRARY: Record<string, PedagogicalMedia[]> = {
  phishing: [
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400',
      alt: 'Illustration hameçon email',
      caption: 'Le phishing, c\'est comme un hameçon caché dans un email'
    },
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400',
      alt: 'Écran avec email suspect',
      caption: 'Toujours vérifier l\'adresse de l\'expéditeur'
    },
    {
      type: 'gif',
      url: 'https://media.giphy.com/media/3o7TKTDn976rzVgky4/giphy.gif',
      alt: 'Animation prudence email'
    }
  ],
  'mots-de-passe': [
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400',
      alt: 'Cadenas sécurisé',
      caption: 'Un bon mot de passe = un cadenas solide'
    },
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=400',
      alt: 'Clavier avec serrure',
      caption: '12 caractères minimum pour être tranquille'
    }
  ],
  ransomware: [
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
      alt: 'Code informatique menaçant',
      caption: 'Le ransomware chiffre vos fichiers et demande une rançon'
    }
  ],
  'ingenierie-sociale': [
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=400',
      alt: 'Manipulation téléphonique',
      caption: 'Les arnaqueurs manipulent par téléphone'
    }
  ],
  'liens-suspects': [
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400',
      alt: 'Lien piégé',
      caption: 'Un lien peut cacher un piège'
    }
  ]
};

// ============================================
// ÉMOJIS CONTEXTUELS
// ============================================

export const TOPIC_EMOJIS: Record<string, string> = {
  phishing: '🎣',
  'mots-de-passe': '🔐',
  ransomware: '💀',
  'ingenierie-sociale': '🎭',
  'liens-suspects': '⛓️',
  'pieces-jointes': '📎',
  'usurpation-identite': '👤',
  'fausse-facture': '💸',
  'shadow-it': '🌑',
  teletravail: '🏠',
  'culture-securite': '🛡️'
};

// ============================================
// MESSAGES ENCOURAGEANTS
// ============================================

export const ENCOURAGEMENT_MESSAGES = {
  correct: [
    "Parfait ! Tu as l'œil ! 👁️✨",
    "Exactement ! Tu es sur la bonne voie ! 🎯",
    "Bravo ! C'est le bon réflexe ! 💪",
    "Super ! Tu deviens un pro ! 🏆",
    "Excellent ! Continue comme ça ! 🌟"
  ],
  incorrect: [
    "Pas de panique, c'est comme ça qu'on apprend ! 📚",
    "Oups ! Voyons ensemble pourquoi... 🤔",
    "Presque ! Regardons ça de plus près... 🔍",
    "C'est le piège classique ! Voyons la solution... 💡",
    "Normal de se tromper, l'important c'est de comprendre ! 🧠"
  ],
  completion: [
    "🎉 Bravo ! Tu as terminé ce module !",
    "🏆 Champion ! Un module de plus dans la poche !",
    "⭐ Génial ! Tu progresses à vue d'œil !",
    "🚀 Super ! Prêt pour le niveau suivant ?",
    "💪 Excellent travail ! Continue sur ta lancée !"
  ]
};

