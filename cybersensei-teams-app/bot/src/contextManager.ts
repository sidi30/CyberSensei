/**
 * Gestionnaire de contexte conversationnel avancé
 * Maintient l'historique, génère des réponses personnalisées
 */

import { intentRecognizer, RecognizedIntent, ExtractedEntities } from './intentRecognizer';

export interface ConversationTurn {
  timestamp: Date;
  userMessage: string;
  intent: RecognizedIntent;
  botResponse?: string;
}

export interface UserContext {
  userId: string;
  userName: string;
  conversationId: string;
  // Historique des derniers échanges
  recentTurns: ConversationTurn[];
  // Sujet actuellement discuté
  currentTopic?: string;
  // Dernier terme de glossaire demandé
  lastGlossaryTerm?: string;
  // Niveau de difficulté préféré
  preferredDifficulty?: string;
  // Score moyen de l'utilisateur (pour personnaliser les réponses)
  averageScore?: number;
  // Sujets déjà abordés dans la session
  discussedTopics: Set<string>;
}

/**
 * Définitions du glossaire cybersécurité
 */
export const GLOSSARY: Record<string, { definition: string; example: string; related: string[] }> = {
  phishing: {
    definition: "Le phishing (hameçonnage) est une technique d'escroquerie qui consiste à envoyer des emails ou messages frauduleux imitant des organismes légitimes pour voler des informations personnelles (mots de passe, numéros de carte bancaire, etc.).",
    example: "Un email prétendant venir de votre banque vous demandant de 'vérifier votre compte' en cliquant sur un lien suspect.",
    related: ['spear_phishing', 'vishing', 'smishing', 'social_engineering'],
  },
  ransomware: {
    definition: "Un ransomware (rançongiciel) est un logiciel malveillant qui chiffre les fichiers d'un ordinateur et exige une rançon pour les déchiffrer. C'est l'une des menaces les plus dévastatrices pour les entreprises.",
    example: "WannaCry, NotPetya, Ryuk sont des ransomwares célèbres qui ont paralysé des milliers d'entreprises.",
    related: ['malware', 'encryption', 'backup'],
  },
  malware: {
    definition: "Un malware (logiciel malveillant) est tout programme conçu pour nuire à un système informatique : virus, vers, trojans, spyware, ransomware, etc.",
    example: "Un fichier .exe téléchargé depuis un site non fiable qui installe secrètement un programme espion.",
    related: ['virus', 'trojan', 'spyware', 'ransomware'],
  },
  firewall: {
    definition: "Un pare-feu (firewall) est un système de sécurité qui surveille et contrôle le trafic réseau entrant et sortant selon des règles de sécurité prédéfinies. Il agit comme une barrière entre un réseau de confiance et un réseau non fiable.",
    example: "Windows Defender Firewall bloque les connexions entrantes non autorisées vers votre PC.",
    related: ['network_security', 'ids', 'ips'],
  },
  vpn: {
    definition: "Un VPN (Virtual Private Network) crée un tunnel chiffré entre votre appareil et un serveur distant, masquant votre adresse IP et protégeant vos données sur les réseaux publics.",
    example: "Se connecter au VPN de l'entreprise depuis un café pour accéder aux ressources internes de manière sécurisée.",
    related: ['encryption', 'remote_work', 'network_security'],
  },
  '2fa': {
    definition: "L'authentification à deux facteurs (2FA) ajoute une couche de sécurité supplémentaire en exigeant deux types de vérification : quelque chose que vous savez (mot de passe) ET quelque chose que vous avez (téléphone, clé de sécurité).",
    example: "Après avoir entré votre mot de passe Gmail, vous recevez un code par SMS ou via l'app Google Authenticator.",
    related: ['mfa', 'password', 'authentication'],
  },
  social_engineering: {
    definition: "L'ingénierie sociale est l'art de manipuler les personnes pour qu'elles divulguent des informations confidentielles ou effectuent des actions compromettantes. Elle exploite la psychologie humaine plutôt que les failles techniques.",
    example: "Un 'technicien IT' appelle un employé et lui demande son mot de passe pour 'résoudre un problème urgent'.",
    related: ['phishing', 'pretexting', 'baiting'],
  },
  brute_force: {
    definition: "Une attaque par force brute consiste à tester systématiquement toutes les combinaisons possibles de mots de passe jusqu'à trouver le bon. Plus le mot de passe est court et simple, plus l'attaque est rapide.",
    example: "Un attaquant teste 'password1', 'password2', 'password3'... jusqu'à trouver le bon mot de passe.",
    related: ['password', 'dictionary_attack', 'credential_stuffing'],
  },
  zero_trust: {
    definition: "Le Zero Trust (confiance zéro) est un modèle de sécurité qui part du principe qu'aucun utilisateur ni appareil ne doit être automatiquement considéré comme fiable, même à l'intérieur du réseau de l'entreprise. Chaque accès doit être vérifié.",
    example: "Même depuis le bureau, un employé doit s'authentifier et prouver son identité pour accéder à chaque application.",
    related: ['authentication', 'least_privilege', 'microsegmentation'],
  },
  encryption: {
    definition: "Le chiffrement est le processus de transformation de données lisibles en données illisibles (chiffrées) à l'aide d'un algorithme et d'une clé. Seuls ceux qui possèdent la clé de déchiffrement peuvent lire les données originales.",
    example: "HTTPS chiffre les communications entre votre navigateur et les sites web pour empêcher l'interception des données.",
    related: ['ssl_tls', 'aes', 'rsa', 'vpn'],
  },
  backdoor: {
    definition: "Une porte dérobée (backdoor) est un moyen caché d'accéder à un système informatique en contournant les mécanismes de sécurité normaux. Elle peut être installée intentionnellement ou par un attaquant.",
    example: "Un développeur malveillant laisse un compte admin secret dans une application qu'il a créée.",
    related: ['malware', 'trojan', 'vulnerability'],
  },
  keylogger: {
    definition: "Un keylogger (enregistreur de frappe) est un logiciel ou matériel qui enregistre toutes les touches tapées au clavier, permettant de capturer mots de passe, messages et autres informations sensibles.",
    example: "Un malware qui envoie secrètement tout ce que vous tapez à un pirate, y compris vos identifiants bancaires.",
    related: ['spyware', 'malware', 'credential_theft'],
  },
  spyware: {
    definition: "Un spyware (logiciel espion) est un programme qui s'installe discrètement sur votre appareil pour collecter des informations sur vos activités : sites visités, frappes clavier, fichiers, etc.",
    example: "Une app gratuite qui en arrière-plan enregistre votre localisation et vos conversations.",
    related: ['malware', 'keylogger', 'adware'],
  },
  ddos: {
    definition: "Une attaque DDoS (Distributed Denial of Service) consiste à submerger un serveur ou un réseau avec un trafic massif provenant de multiples sources, le rendant indisponible pour les utilisateurs légitimes.",
    example: "Des milliers d'ordinateurs infectés envoient simultanément des requêtes à un site web, le faisant tomber.",
    related: ['botnet', 'availability', 'network_security'],
  },
  sql_injection: {
    definition: "L'injection SQL est une technique d'attaque qui exploite les failles dans les applications web pour exécuter des commandes SQL malveillantes sur la base de données, permettant de voler ou modifier des données.",
    example: "Entrer ' OR '1'='1 dans un champ de connexion pour contourner l'authentification.",
    related: ['web_security', 'input_validation', 'xss'],
  },
  xss: {
    definition: "Le Cross-Site Scripting (XSS) est une faille de sécurité web qui permet à un attaquant d'injecter du code JavaScript malveillant dans des pages web vues par d'autres utilisateurs.",
    example: "Un commentaire sur un forum qui contient du code JavaScript volant les cookies de session des visiteurs.",
    related: ['web_security', 'input_validation', 'sql_injection'],
  },
  apt: {
    definition: "Une APT (Advanced Persistent Threat) est une attaque sophistiquée et prolongée, généralement menée par des groupes bien financés (états, crime organisé) qui s'infiltrent discrètement dans un réseau et y restent longtemps pour voler des données.",
    example: "Un groupe de hackers étatiques infiltre une entreprise pendant des mois pour voler des secrets industriels.",
    related: ['nation_state', 'espionage', 'lateral_movement'],
  },
  siem: {
    definition: "Un SIEM (Security Information and Event Management) est une solution qui collecte, analyse et corrèle les logs de sécurité de toute l'infrastructure IT pour détecter les menaces et les incidents en temps réel.",
    example: "Le SIEM alerte l'équipe sécurité quand un utilisateur se connecte depuis deux pays différents en 5 minutes.",
    related: ['soc', 'logging', 'incident_response'],
  },
  soc: {
    definition: "Un SOC (Security Operations Center) est une équipe dédiée qui surveille, détecte et répond aux incidents de sécurité 24h/24 en utilisant des outils comme les SIEM, IDS/IPS, et EDR.",
    example: "L'équipe SOC détecte une tentative d'intrusion à 3h du matin et bloque immédiatement l'attaquant.",
    related: ['siem', 'incident_response', 'threat_hunting'],
  },
  iam: {
    definition: "L'IAM (Identity and Access Management) est l'ensemble des processus et technologies pour gérer les identités numériques et contrôler qui a accès à quoi dans une organisation.",
    example: "Le système IAM accorde automatiquement les bons accès à un nouvel employé selon son poste.",
    related: ['authentication', 'authorization', 'least_privilege'],
  },
};

/**
 * Conseils par sujet pour les recommandations
 */
export const TOPIC_ADVICE: Record<string, { summary: string; tips: string[]; commonMistakes: string[] }> = {
  phishing: {
    summary: "Le phishing est la menace #1 en entreprise. 90% des cyberattaques commencent par un email de phishing.",
    tips: [
      "Vérifiez toujours l'adresse email de l'expéditeur (pas juste le nom affiché)",
      "Ne cliquez jamais sur les liens suspects - survolez pour voir l'URL réelle",
      "Méfiez-vous de l'urgence ('Votre compte sera supprimé dans 24h')",
      "En cas de doute, contactez directement l'organisation par un autre canal",
    ],
    commonMistakes: [
      "Faire confiance au nom affiché sans vérifier l'adresse",
      "Cliquer par réflexe sur les liens dans les emails",
      "Ignorer les petites fautes d'orthographe ou de mise en page",
    ],
  },
  password: {
    summary: "Les mots de passe faibles sont responsables de 81% des violations de données liées au piratage.",
    tips: [
      "Utilisez un gestionnaire de mots de passe (Bitwarden, 1Password, etc.)",
      "Créez des phrases de passe longues plutôt que des mots de passe complexes",
      "Activez l'authentification à deux facteurs (2FA) partout où possible",
      "N'utilisez jamais le même mot de passe sur plusieurs sites",
    ],
    commonMistakes: [
      "Utiliser des informations personnelles (date de naissance, nom du chien)",
      "Réutiliser le même mot de passe partout",
      "Écrire ses mots de passe sur des post-it",
    ],
  },
  ransomware: {
    summary: "Les ransomwares ont coûté plus de 20 milliards de dollars aux entreprises en 2024.",
    tips: [
      "Faites des sauvegardes régulières (règle 3-2-1)",
      "Gardez vos systèmes et logiciels à jour",
      "Ne téléchargez jamais de fichiers de sources non fiables",
      "Formez les employés à reconnaître les emails suspects",
    ],
    commonMistakes: [
      "Ne pas avoir de sauvegardes ou sauvegardes connectées au réseau",
      "Ignorer les mises à jour de sécurité",
      "Ouvrir des pièces jointes de sources inconnues",
    ],
  },
  social_engineering: {
    summary: "L'ingénierie sociale exploite le facteur humain - la faille de sécurité la plus difficile à corriger.",
    tips: [
      "Vérifiez toujours l'identité de quelqu'un qui demande des informations sensibles",
      "Méfiez-vous des demandes urgentes ou inhabituelles",
      "N'hésitez pas à dire non et à vérifier par un autre canal",
      "Signalez les tentatives suspectes à l'équipe sécurité",
    ],
    commonMistakes: [
      "Faire confiance aux appels 'du service informatique'",
      "Se laisser intimider par l'autorité ou l'urgence",
      "Partager des informations sensibles par politesse",
    ],
  },
  remote_work: {
    summary: "Le télétravail a multiplié par 4 les surfaces d'attaque des entreprises depuis 2020.",
    tips: [
      "Utilisez toujours le VPN de l'entreprise pour accéder aux ressources internes",
      "Évitez les réseaux Wi-Fi publics ou utilisez un VPN personnel",
      "Verrouillez votre session quand vous vous éloignez de votre poste",
      "Séparez les usages pro et perso sur vos appareils",
    ],
    commonMistakes: [
      "Travailler sur des données sensibles depuis un café sans VPN",
      "Laisser des documents confidentiels visibles à l'écran",
      "Utiliser le même mot de passe pour les comptes pro et perso",
    ],
  },
  data_protection: {
    summary: "Le RGPD impose des amendes jusqu'à 4% du CA mondial pour non-conformité.",
    tips: [
      "Collectez uniquement les données strictement nécessaires",
      "Chiffrez les données sensibles au repos et en transit",
      "Documentez tous les traitements de données personnelles",
      "Répondez aux demandes d'accès/suppression dans les délais légaux",
    ],
    commonMistakes: [
      "Collecter plus de données que nécessaire 'au cas où'",
      "Stocker des données sensibles en clair",
      "Ignorer les demandes de suppression des utilisateurs",
    ],
  },
  shadow_it: {
    summary: "40% des employés utilisent des outils non approuvés, exposant l'entreprise à des risques de fuite de données.",
    tips: [
      "Utilisez uniquement les outils approuvés par l'IT",
      "Demandez à l'IT si vous avez besoin d'un nouvel outil",
      "Ne stockez jamais de données sensibles sur des services perso (Gmail, Dropbox perso)",
      "Signalez les besoins non couverts par les outils officiels",
    ],
    commonMistakes: [
      "Utiliser son Gmail personnel pour des échanges professionnels",
      "Stocker des documents d'entreprise sur un Dropbox personnel",
      "Installer des logiciels sans autorisation",
    ],
  },
};

/**
 * Gestionnaire de contexte conversationnel
 */
export class ContextManager {
  private contexts: Map<string, UserContext> = new Map();
  private readonly MAX_TURNS = 10;

  /**
   * Récupère ou crée un contexte utilisateur
   */
  getContext(conversationId: string, userId: string, userName: string): UserContext {
    const key = conversationId;

    if (!this.contexts.has(key)) {
      this.contexts.set(key, {
        userId,
        userName,
        conversationId,
        recentTurns: [],
        discussedTopics: new Set(),
      });
    }

    const ctx = this.contexts.get(key)!;
    ctx.userName = userName; // Update in case it changed
    return ctx;
  }

  /**
   * Enregistre un tour de conversation
   */
  recordTurn(conversationId: string, userMessage: string, intent: RecognizedIntent, botResponse?: string): void {
    const ctx = this.contexts.get(conversationId);
    if (!ctx) return;

    // Ajouter le tour
    ctx.recentTurns.push({
      timestamp: new Date(),
      userMessage,
      intent,
      botResponse,
    });

    // Garder seulement les N derniers tours
    if (ctx.recentTurns.length > this.MAX_TURNS) {
      ctx.recentTurns = ctx.recentTurns.slice(-this.MAX_TURNS);
    }

    // Mettre à jour le topic courant si détecté
    if (intent.entities.topic) {
      ctx.currentTopic = intent.entities.topic;
      ctx.discussedTopics.add(intent.entities.topic);
    }

    // Mettre à jour le dernier terme de glossaire
    if (intent.entities.term) {
      ctx.lastGlossaryTerm = intent.entities.term;
    }
  }

  /**
   * Met à jour le score moyen de l'utilisateur
   */
  updateUserScore(conversationId: string, averageScore: number): void {
    const ctx = this.contexts.get(conversationId);
    if (ctx) {
      ctx.averageScore = averageScore;
    }
  }

  /**
   * Génère une réponse pour une demande de définition (glossaire)
   */
  getGlossaryResponse(term: string): string {
    const entry = GLOSSARY[term.toLowerCase()];

    if (!entry) {
      const availableTerms = Object.keys(GLOSSARY).slice(0, 5).join(', ');
      return `🤔 Je ne connais pas ce terme. Essayez de me demander la définition de : ${availableTerms}...`;
    }

    let response = `📚 **${term.toUpperCase()}**\n\n`;
    response += `${entry.definition}\n\n`;
    response += `💡 **Exemple :** ${entry.example}\n\n`;

    if (entry.related.length > 0) {
      const relatedTerms = entry.related
        .filter(r => GLOSSARY[r])
        .slice(0, 3)
        .join(', ');
      if (relatedTerms) {
        response += `🔗 **Termes liés :** ${relatedTerms}`;
      }
    }

    return response;
  }

  /**
   * Génère une réponse pour une question sur un sujet
   */
  getTopicResponse(topic: string, question: string): string {
    const advice = TOPIC_ADVICE[topic];

    if (!advice) {
      return `Je n'ai pas d'informations spécifiques sur "${topic}". Posez-moi une question directe et j'essaierai de vous aider !`;
    }

    // Détecter le type de question
    const questionLower = question.toLowerCase();

    if (questionLower.includes('protéger') || questionLower.includes('éviter') || questionLower.includes('conseil')) {
      let response = `🛡️ **Conseils pour se protéger contre ${topic}**\n\n`;
      response += `${advice.summary}\n\n`;
      response += `✅ **Bonnes pratiques :**\n`;
      advice.tips.forEach((tip, i) => {
        response += `${i + 1}. ${tip}\n`;
      });
      return response;
    }

    if (questionLower.includes('erreur') || questionLower.includes('piège') || questionLower.includes('danger')) {
      let response = `⚠️ **Erreurs à éviter - ${topic}**\n\n`;
      response += `${advice.summary}\n\n`;
      response += `❌ **Erreurs courantes :**\n`;
      advice.commonMistakes.forEach((mistake, i) => {
        response += `${i + 1}. ${mistake}\n`;
      });
      return response;
    }

    // Réponse générale
    let response = `📖 **${topic.toUpperCase()}**\n\n`;
    response += `${advice.summary}\n\n`;
    response += `✅ **À retenir :**\n`;
    advice.tips.slice(0, 3).forEach((tip, i) => {
      response += `• ${tip}\n`;
    });
    response += `\n❌ **À éviter :**\n`;
    advice.commonMistakes.slice(0, 2).forEach((mistake) => {
      response += `• ${mistake}\n`;
    });

    return response;
  }

  /**
   * Génère des recommandations personnalisées
   */
  getRecommendations(conversationId: string): string {
    const ctx = this.contexts.get(conversationId);

    let response = `🎯 **Recommandations pour toi**\n\n`;

    // Sujets non encore abordés
    const allTopics = Object.keys(TOPIC_ADVICE);
    const discussedTopics = ctx ? Array.from(ctx.discussedTopics) : [];
    const newTopics = allTopics.filter(t => !discussedTopics.includes(t));

    if (ctx?.averageScore !== undefined) {
      if (ctx.averageScore < 50) {
        response += `📚 Ton score moyen est de ${Math.round(ctx.averageScore)}%. Je te recommande de revoir les bases :\n`;
        response += `• Commence par les exercices sur le **phishing** (niveau débutant)\n`;
        response += `• Travaille ensuite les **mots de passe**\n\n`;
      } else if (ctx.averageScore < 75) {
        response += `👍 Bien joué ! Ton score moyen est de ${Math.round(ctx.averageScore)}%. Pour progresser :\n`;
        response += `• Passe aux exercices **intermédiaires**\n`;
        response += `• Explore de nouveaux sujets comme **l'ingénierie sociale**\n\n`;
      } else {
        response += `🏆 Excellent ! Ton score moyen est de ${Math.round(ctx.averageScore)}%. Tu peux :\n`;
        response += `• T'attaquer aux exercices **avancés** et **expert**\n`;
        response += `• Explorer des sujets techniques comme **Zero Trust** ou **APT**\n\n`;
      }
    } else {
      response += `📝 **Pour commencer:**\n`;
      response += `• Tape "**quiz**" pour faire ton premier exercice\n`;
      response += `• Je pourrai ensuite te donner des recommandations personnalisées !\n\n`;
    }

    if (newTopics.length > 0) {
      response += `🆕 **Sujets à explorer:**\n`;
      newTopics.slice(0, 3).forEach(topic => {
        const advice = TOPIC_ADVICE[topic];
        if (advice) {
          response += `• **${topic}** - ${advice.summary.substring(0, 60)}...\n`;
        }
      });
    }

    response += `\n💬 Demande-moi "**c'est quoi [terme]**" pour apprendre un concept !`;

    return response;
  }

  /**
   * Génère une réponse sur la progression
   */
  getProgressResponse(conversationId: string, progress?: { completedExercises: number; totalExercises: number; averageScore: number; currentLevel: string }): string {
    const ctx = this.contexts.get(conversationId);

    if (!progress) {
      return `📊 Je n'ai pas encore de données sur ta progression. Fais un "**quiz**" pour commencer !`;
    }

    const percentage = progress.totalExercises > 0
      ? Math.round((progress.completedExercises / progress.totalExercises) * 100)
      : 0;

    let response = `📊 **Ta progression CyberSensei**\n\n`;
    response += `🎯 **Exercices:** ${progress.completedExercises}/${progress.totalExercises} (${percentage}%)\n`;
    response += `📈 **Score moyen:** ${Math.round(progress.averageScore)}%\n`;
    response += `🏅 **Niveau:** ${this.translateLevel(progress.currentLevel)}\n\n`;

    // Message personnalisé selon le niveau
    if (progress.averageScore >= 80) {
      response += `🌟 **Tu es sur la bonne voie !** Continue comme ça, tu maîtrises vraiment bien les concepts.\n`;
    } else if (progress.averageScore >= 60) {
      response += `💪 **Bonne progression !** Quelques révisions et tu seras au top.\n`;
    } else {
      response += `📚 **Continue à t'entraîner !** Chaque exercice te rend plus fort en cybersécurité.\n`;
    }

    // Suggestions basées sur les sujets discutés
    if (ctx && ctx.discussedTopics.size > 0) {
      response += `\n📝 **Sujets abordés:** ${Array.from(ctx.discussedTopics).join(', ')}`;
    }

    return response;
  }

  /**
   * Génère une réponse pour le feedback utilisateur
   */
  getFeedbackResponse(sentiment: 'positive' | 'negative' | 'neutral', originalMessage: string): string {
    if (sentiment === 'positive') {
      const responses = [
        `Merci beaucoup ! 😊 Ça me fait plaisir que tu apprécies. Continue avec un "**quiz**" ?`,
        `Content que ça te plaise ! 🎉 On continue la formation ?`,
        `Super ! 👍 Je suis là pour t'aider à devenir un pro de la cybersécurité !`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (sentiment === 'negative') {
      return `Je suis désolé que quelque chose ne te convienne pas. 😕 Dis-moi ce qui ne va pas et j'essaierai de m'améliorer. Tu peux aussi taper "**aide**" pour voir ce que je peux faire.`;
    }

    return `Merci pour ton retour ! N'hésite pas à me poser des questions ou à taper "**quiz**" pour un exercice.`;
  }

  /**
   * Traduit les niveaux de difficulté
   */
  private translateLevel(level: string): string {
    const translations: Record<string, string> = {
      'BEGINNER': '🌱 Débutant',
      'INTERMEDIATE': '📚 Intermédiaire',
      'ADVANCED': '🚀 Avancé',
      'EXPERT': '🏆 Expert',
    };
    return translations[level] || level;
  }

  /**
   * Nettoie les contextes anciens
   */
  cleanup(maxAgeMs: number = 7200000): void {
    const now = Date.now();

    for (const [key, ctx] of this.contexts.entries()) {
      if (ctx.recentTurns.length > 0) {
        const lastTurn = ctx.recentTurns[ctx.recentTurns.length - 1];
        if (now - lastTurn.timestamp.getTime() > maxAgeMs) {
          this.contexts.delete(key);
        }
      }
    }
  }
}

export const contextManager = new ContextManager();
