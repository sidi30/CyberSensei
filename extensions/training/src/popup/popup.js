/**
 * CyberSensei Extension v2 - Popup Controller
 * Bot conversationnel gamifié - même UX que /tabs/employee
 */

import api from './api.js';

// ============================================
// GAMIFICATION CONFIG
// ============================================
const XP_PER_CORRECT = 25;
const XP_PER_QUIZ = 10;
const XP_STREAK_BONUS = 15;
const LEVELS = [
  { level: 1, xpRequired: 0, title: 'Recrue' },
  { level: 2, xpRequired: 100, title: 'Sentinelle' },
  { level: 3, xpRequired: 250, title: 'Gardien' },
  { level: 4, xpRequired: 500, title: 'Protecteur' },
  { level: 5, xpRequired: 800, title: 'Défenseur' },
  { level: 6, xpRequired: 1200, title: 'Bouclier' },
  { level: 7, xpRequired: 1800, title: 'Stratège' },
  { level: 8, xpRequired: 2500, title: 'Maître' },
  { level: 9, xpRequired: 3500, title: 'Sensei' },
  { level: 10, xpRequired: 5000, title: 'Légende' },
];

const BADGES = [
  { id: 'first_quiz', emoji: '🎯', name: 'Premier défi', condition: (g) => g.totalCompleted >= 1 },
  { id: 'streak_3', emoji: '🔥', name: '3 jours', condition: (g) => g.bestStreak >= 3 },
  { id: 'streak_7', emoji: '⚡', name: '7 jours', condition: (g) => g.bestStreak >= 7 },
  { id: 'streak_30', emoji: '💎', name: '30 jours', condition: (g) => g.bestStreak >= 30 },
  { id: 'perfect', emoji: '💯', name: 'Score parfait', condition: (g) => g.perfectScores >= 1 },
  { id: 'level_5', emoji: '🛡️', name: 'Niveau 5', condition: (g) => g.level >= 5 },
  { id: 'level_10', emoji: '👑', name: 'Légende', condition: (g) => g.level >= 10 },
  { id: 'xp_1000', emoji: '🏆', name: '1000 XP', condition: (g) => g.xp >= 1000 },
];

const TOPIC_EMOJIS = {
  phishing: '🎣', 'mots de passe': '🔐', ransomware: '💀',
  'ingénierie sociale': '🎭', vpn: '🔒', malware: '🦠',
  dlp: '🛡️', rgpd: '📋', 'shadow it': '👻', 'vpn & wi-fi': '🔒',
};

const ENCOURAGEMENT = {
  correct: [
    "Parfait ! Tu as l'oeil ! 👁️",
    "Exactement ! Tu es sur la bonne voie ! 🎯",
    "Bravo ! C'est le bon réflexe ! 💪",
    "Super ! Tu deviens un pro ! 🏆",
    "Excellent ! Continue comme ça ! 🌟",
  ],
  incorrect: [
    "Pas de panique, c'est comme ça qu'on apprend ! 📚",
    "Oups ! Voyons ensemble pourquoi... 🤔",
    "Presque ! Regardons ça de plus près... 🔍",
    "C'est le piège classique ! Voyons la solution... 💡",
    "Normal de se tromper, l'important c'est de comprendre ! 🧠",
  ],
  completion: [
    "🎉 Bravo ! Tu as terminé ce module !",
    "🏆 Champion ! Un module de plus dans la poche !",
    "⭐ Génial ! Tu progresses à vue d'oeil !",
    "🚀 Super ! Prêt pour le niveau suivant ?",
    "💪 Excellent travail ! Continue sur ta lancée !",
  ],
};

// Explications par défaut quand le backend n'en fournit pas
const DEFAULT_EXPLANATIONS = {
  phishing: {
    correct: "Tu as bien identifié la bonne pratique ! En matière de phishing, il faut toujours vérifier l'adresse de l'expéditeur, ne jamais cliquer sur un lien suspect et signaler les emails douteux à ton équipe IT.",
    incorrect: "Attention ! Face à un email suspect, il ne faut jamais cliquer directement sur un lien. Vérifie toujours l'adresse de l'expéditeur, regarde si le contexte est cohérent et préviens ton responsable en cas de doute.",
    advice: ["Vérifier l'adresse email de l'expéditeur (domaine exact)", "Ne jamais cliquer sur un lien sans vérifier l'URL", "Signaler immédiatement les emails suspects au service IT", "En cas de doute, contacter directement l'expéditeur par un autre canal"],
  },
  ransomware: {
    correct: "Bien joué ! La prévention du ransomware passe par des sauvegardes régulières, la mise à jour des logiciels et la vigilance face aux pièces jointes suspectes.",
    incorrect: "Le ransomware est un logiciel malveillant qui chiffre vos fichiers. Ne payez jamais la rançon ! La clé est la prévention : sauvegardes régulières, mises à jour et vigilance.",
    advice: ["Faire des sauvegardes régulières et les stocker hors-ligne", "Maintenir tous les logiciels à jour", "Ne jamais ouvrir de pièces jointes d'expéditeurs inconnus", "Ne jamais payer la rançon en cas d'attaque"],
  },
  'mots de passe': {
    correct: "Excellent réflexe ! Un bon mot de passe est long (12+ caractères), unique pour chaque service et idéalement géré par un gestionnaire de mots de passe.",
    incorrect: "Un mot de passe robuste doit être long (12+ caractères), mélanger lettres, chiffres et symboles, et être unique pour chaque compte. Utilise un gestionnaire de mots de passe !",
    advice: ["Utiliser un mot de passe de 12 caractères minimum", "Ne jamais réutiliser le même mot de passe", "Activer l'authentification à deux facteurs (2FA)", "Utiliser un gestionnaire de mots de passe"],
  },
  'ingénierie sociale': {
    correct: "Bien vu ! L'ingénierie sociale repose sur la manipulation psychologique. Il faut toujours vérifier l'identité de son interlocuteur et ne jamais communiquer d'informations sensibles sans vérification.",
    incorrect: "L'ingénierie sociale est une technique de manipulation. Quelqu'un peut se faire passer pour le support IT ou un collègue. Ne communique jamais tes identifiants par téléphone ou email !",
    advice: ["Ne jamais communiquer ses mots de passe par téléphone ou email", "Vérifier l'identité de toute personne demandant des informations", "Se méfier des demandes urgentes ou inhabituelles", "En cas de doute, contacter directement la personne par un canal connu"],
  },
  vpn: {
    correct: "Bien ! Le VPN crée un tunnel chiffré qui protège tes données, surtout en Wi-Fi public. C'est indispensable en télétravail.",
    incorrect: "Le VPN est essentiel pour protéger ta connexion. En Wi-Fi public, sans VPN, tes données peuvent être interceptées. Active toujours le VPN de ton entreprise !",
    advice: ["Toujours activer le VPN en Wi-Fi public", "Utiliser le VPN fourni par l'entreprise", "Vérifier que le VPN est connecté avant d'accéder à des données sensibles"],
  },
  default: {
    correct: "Bien joué ! Tu maîtrises bien ce sujet. Continue à appliquer ces bonnes pratiques au quotidien.",
    incorrect: "Ce n'est pas la bonne réponse, mais c'est en se trompant qu'on apprend. Voici ce qu'il faut retenir pour la prochaine fois.",
    advice: ["Rester vigilant face aux menaces en ligne", "Appliquer les bonnes pratiques de sécurité au quotidien", "En cas de doute, toujours demander conseil à l'équipe IT", "Se former régulièrement aux nouvelles menaces"],
  },
};

// ============================================
// STATE
// ============================================
let gamification = {
  xp: 0, level: 1, streak: 0, bestStreak: 0,
  totalCompleted: 0, perfectScores: 0, lastPlayDate: null,
};

let currentQuiz = null;
let quizQuestions = [];
let stepIndex = -1;
let quizScore = { correct: 0, total: 0 };
let userAnswers = []; // Stocke le choix de l'utilisateur pour chaque question
let sessionComplete = false;
let isLoadingQuiz = false;
let chatContext = null;

// Glossaire local
const GLOSSARY = {
  phishing: { term: 'Phishing (Hameçonnage)', definition: "Technique de fraude consistant à usurper l'identité d'un organisme de confiance pour inciter la victime à révéler des informations sensibles.", example: "Un email imitant votre banque vous demandant de 'vérifier' vos identifiants via un lien.", tips: ["Vérifiez toujours l'adresse de l'expéditeur", 'Ne cliquez jamais sur un lien suspect', 'Signalez les emails douteux à votre équipe IT'] },
  ransomware: { term: 'Ransomware (Rançongiciel)', definition: 'Logiciel malveillant qui chiffre vos fichiers et exige une rançon pour les débloquer.', example: 'Un fichier joint dans un email déclenche le chiffrement de tous vos documents.', tips: ['Faites des sauvegardes régulières', 'Ne payez jamais la rançon', 'Maintenez vos logiciels à jour'] },
  vpn: { term: 'VPN (Virtual Private Network)', definition: 'Réseau privé virtuel qui crée un tunnel chiffré entre votre appareil et Internet.', example: "En télétravail depuis un café, le VPN chiffre votre connexion pour empêcher l'interception.", tips: ['Activez toujours le VPN en Wi-Fi public', 'Utilisez le VPN de votre entreprise'] },
  malware: { term: 'Malware (Logiciel malveillant)', definition: "Terme générique désignant tout logiciel conçu pour endommager ou accéder de manière non autorisée à un système.", example: 'Un programme depuis un site non officiel installe un keylogger enregistrant vos frappes.', tips: ['Téléchargez uniquement depuis des sources officielles', 'Gardez votre antivirus actif'] },
  '2fa': { term: 'Authentification à deux facteurs (2FA)', definition: "Méthode de sécurité qui requiert deux formes d'identification pour accéder à un compte.", example: 'Après votre mot de passe, une app génère un code temporaire à 6 chiffres.', tips: ['Activez le 2FA sur tous vos comptes', "Préférez une app authenticator aux SMS"] },
  social_engineering: { term: 'Ingénierie sociale', definition: 'Technique de manipulation psychologique pour obtenir des informations confidentielles.', example: "Quelqu'un se fait passer pour le support IT et demande votre mot de passe.", tips: ['Ne communiquez jamais vos mots de passe par téléphone', "Vérifiez l'identité de votre interlocuteur"] },
  rgpd: { term: 'RGPD', definition: 'Réglementation européenne encadrant la collecte et le traitement des données personnelles.', example: 'Un site web doit obtenir votre consentement avant de placer des cookies de suivi.', tips: ['Collectez uniquement les données nécessaires', "Informez les utilisateurs de l'usage de leurs données"] },
  shadow_it: { term: 'Shadow IT', definition: "Utilisation de logiciels ou services non approuvés par le service informatique de l'entreprise.", example: "Un employé utilise Dropbox personnel pour partager des documents d'entreprise.", tips: ['Utilisez uniquement les outils approuvés', 'Signalez vos besoins au service IT'] },
  firewall: { term: 'Firewall (Pare-feu)', definition: 'Système de sécurité réseau qui surveille et contrôle le trafic selon des règles prédéfinies.', example: "Le pare-feu bloque les connexions provenant d'adresses IP suspectes.", tips: ['Ne désactivez jamais votre pare-feu', 'Gardez-le à jour'] },
  zero_trust: { term: 'Zero Trust', definition: "Modèle de sécurité : ne jamais faire confiance, toujours vérifier. Chaque accès est authentifié.", example: "Même sur le réseau interne, un employé doit s'authentifier pour chaque application.", tips: ['Adoptez le principe du moindre privilège', 'Vérifiez chaque accès'] },
  dlp: { term: 'DLP (Data Loss Prevention)', definition: "Ensemble de technologies empêchant la fuite de données sensibles hors de l'organisation.", example: "Un email contenant un numéro de carte bancaire est bloqué automatiquement avant l'envoi.", tips: ['Classifiez vos données sensibles', 'Formez vos employés aux bonnes pratiques'] },
  siem: { term: 'SIEM (Security Information and Event Management)', definition: "Solution centralisant les logs de sécurité pour détecter les menaces en temps réel.", example: "Le SIEM détecte 50 tentatives de connexion échouées en 2 minutes sur un même compte.", tips: ['Centralisez tous vos logs', 'Configurez des alertes intelligentes'] },
};
const GLOSSARY_TERMS_LIST = Object.keys(GLOSSARY);

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await api.init();
    await loadGamification();

    if (!api.isConfigured) {
      // Mode enterprise : code requis mais pas encore saisi
      showScreen('onboarding');
      setupOnboarding();
    } else {
      // Mode community (defaut) ou enterprise active
      showScreen('main');
      initMainScreen();
      api.track('session_start', { mode: api.hasBackend ? 'enterprise' : 'community' });
    }
  } catch (err) {
    console.error('Erreur initialisation CyberSensei:', err);
    // Fallback : mode community sans backend
    showScreen('main');
    initMainScreen();
  }
});

function showScreen(name) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.add('hidden'));
  document.getElementById(`screen-${name}`).classList.remove('hidden');
}

// ============================================
// GAMIFICATION PERSISTENCE
// ============================================
async function loadGamification() {
  const { gamification: saved } = await chrome.storage.local.get('gamification');
  if (saved) {
    gamification = { ...gamification, ...saved };
    updateStreak();
  }
}

async function saveGamification() {
  await chrome.storage.local.set({ gamification });
}

function updateStreak() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (gamification.lastPlayDate === today) return;
  if (gamification.lastPlayDate && gamification.lastPlayDate !== today && gamification.lastPlayDate !== yesterday) {
    gamification.streak = 0;
  }
}

function getLevelInfo(xp) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpRequired) current = lvl;
    else break;
  }
  const nextIdx = LEVELS.findIndex((l) => l.level === current.level) + 1;
  const next = LEVELS[nextIdx] || null;
  const xpInLevel = xp - current.xpRequired;
  const xpForNext = next ? next.xpRequired - current.xpRequired : 0;
  const pct = next ? Math.min(100, Math.round((xpInLevel / xpForNext) * 100)) : 100;
  return { ...current, next, xpInLevel, xpForNext, pct };
}

function addXP(amount) {
  const oldLevel = getLevelInfo(gamification.xp).level;
  gamification.xp += amount;
  gamification.level = getLevelInfo(gamification.xp).level;
  const newLevel = gamification.level;
  updateStatsDisplay();
  showXPPopup(amount);
  if (newLevel > oldLevel) setTimeout(() => showLevelUp(newLevel), 800);
  saveGamification();
}

function showXPPopup(amount) {
  const popup = document.getElementById('xp-popup');
  popup.querySelector('.xp-popup-text').textContent = `+${amount} XP`;
  popup.classList.remove('hidden');
  popup.classList.remove('show');
  void popup.offsetWidth;
  popup.classList.add('show');
  setTimeout(() => popup.classList.add('hidden'), 1600);
}

function showLevelUp(level) {
  const info = LEVELS.find((l) => l.level === level);
  const overlay = document.createElement('div');
  overlay.className = 'level-up-overlay';
  overlay.innerHTML = `<div class="level-up-content"><div class="level-emoji">🎖️</div><h2>Niveau ${level} !</h2><p>${info?.title || ''}</p></div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', () => overlay.remove());
  setTimeout(() => overlay.remove(), 3000);
}

// ============================================
// ONBOARDING
// ============================================
function setupOnboarding() {
  const input = document.getElementById('activation-code');
  const btn = document.getElementById('btn-activate');
  const error = document.getElementById('activation-error');

  btn.addEventListener('click', async () => {
    const code = input.value.trim();
    if (!code) return;
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Activation...';
    error.classList.add('hidden');
    try {
      await api.activate(code);
      showScreen('main');
      initMainScreen();
    } catch (err) {
      error.textContent = err.message || "Code d'activation invalide";
      error.classList.remove('hidden');
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Activer mon compte';
    }
  });

  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') btn.click(); });
}

// ============================================
// MAIN SCREEN
// ============================================
function initMainScreen() {
  updateStatsDisplay();
  setupTabs();
  setupSettings();
  setupChat();
  setupGlossary();
  setupDLPTab();
  loadTheme();
  loadQuiz();
}

function updateStatsDisplay() {
  const info = getLevelInfo(gamification.xp);
  document.getElementById('stat-xp').textContent = gamification.xp;
  document.getElementById('stat-streak').textContent = gamification.streak;
  document.getElementById('stat-level').textContent = info.level;
  document.getElementById('stat-completed').textContent = gamification.totalCompleted;
  const fill = document.getElementById('xp-bar-fill');
  fill.style.width = `${info.pct}%`;
  const label = document.getElementById('xp-bar-label');
  label.textContent = info.next ? `${info.xpInLevel} / ${info.xpForNext} XP` : 'MAX';
}

// ============================================
// TABS NAVIGATION
// ============================================
function setupTabs() {
  document.querySelectorAll('.nav-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.add('hidden'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.remove('hidden');
      api.track('tab_switch', { tab: tab.dataset.tab });
      if (tab.dataset.tab === 'progress') loadProgress();
    });
  });
}

// ============================================
// SETTINGS
// ============================================
function setupSettings() {
  document.getElementById('btn-settings').addEventListener('click', () => {
    document.getElementById('modal-settings').classList.remove('hidden');
    loadSettingsValues();
  });
  document.getElementById('btn-close-settings').addEventListener('click', () => {
    document.getElementById('modal-settings').classList.add('hidden');
  });
  document.querySelector('.modal-backdrop')?.addEventListener('click', () => {
    document.getElementById('modal-settings').classList.add('hidden');
  });

  // Theme mode toggle (dark/light)
  document.querySelectorAll('.theme-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.theme-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Accent color picker
  document.querySelectorAll('.color-swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach((s) => s.classList.remove('active'));
      swatch.classList.add('active');
    });
  });

  document.getElementById('btn-save-settings').addEventListener('click', async () => {
    const url = document.getElementById('setting-url').value.trim().replace(/\/+$/, '');
    const code = document.getElementById('setting-code').value.trim();
    const dlpUrl = document.getElementById('setting-dlp-url').value.trim().replace(/\/+$/, '');
    const activeColor = document.querySelector('.color-swatch.active')?.dataset.color || 'default';
    const activeMode = document.querySelector('.theme-btn.active')?.dataset.mode || 'dark';

    const existing = (await chrome.storage.local.get('config')).config || {};
    const newConfig = {
      ...existing,
      backendUrl: url || existing.backendUrl || '',
      activationCode: code || existing.activationCode || '',
      dlpUrl: dlpUrl || existing.dlpUrl || 'https://cs-dlp.gwani.fr',
      dlpEnabled: existing.dlpEnabled !== false,
      accentColor: activeColor,
      themeMode: activeMode,
    };

    await chrome.storage.local.set({ config: newConfig });
    api.baseUrl = newConfig.backendUrl;
    api.activationCode = newConfig.activationCode;
    api.tenantId = existing.tenantId || '';
    applyTheme(activeMode, activeColor);
    document.getElementById('modal-settings').classList.add('hidden');
  });

  document.getElementById('btn-logout').addEventListener('click', async () => {
    await api.logout();
    gamification = { xp: 0, level: 1, streak: 0, bestStreak: 0, totalCompleted: 0, perfectScores: 0, lastPlayDate: null };
    showScreen('onboarding');
    setupOnboarding();
  });
}

async function loadSettingsValues() {
  const { config } = await chrome.storage.local.get('config');
  if (config) {
    document.getElementById('setting-url').value = config.backendUrl || '';
    document.getElementById('setting-code').value = config.activationCode || '';
    document.getElementById('setting-dlp-url').value = config.dlpUrl || '';

    // Mode d'affichage (dark/light)
    const mode = config.themeMode || 'dark';
    document.querySelectorAll('.theme-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });

    // Couleur d'accentuation
    const color = config.accentColor || 'default';
    document.querySelectorAll('.color-swatch').forEach((s) => {
      s.classList.toggle('active', s.dataset.color === color);
    });
  }
}

// ============================================
// THEME (mode dark/light + accent color)
// ============================================
async function loadTheme() {
  const { config } = await chrome.storage.local.get('config');
  const mode = config?.themeMode || 'dark';
  const color = config?.accentColor || 'default';
  applyTheme(mode, color);
}

function applyTheme(mode, accentColor) {
  const root = document.documentElement;

  // Mode dark/light
  if (mode === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    root.removeAttribute('data-theme');
  }

  // Accent color
  if (accentColor && accentColor !== 'default') {
    root.setAttribute('data-accent', accentColor);
  } else {
    root.removeAttribute('data-accent');
  }
}

// ============================================
// DLP PROTECTION TAB
// ============================================
function setupDLPTab() {
  const toggle = document.getElementById('dlp-toggle');
  const statusCard = document.getElementById('dlp-status-card');
  const statusText = document.getElementById('dlp-status-text');
  const headerDot = document.getElementById('dlp-status-dot');

  // Charger l'etat actuel
  chrome.storage.local.get('config', (result) => {
    const enabled = result.config?.dlpEnabled !== false;
    toggle.checked = enabled;
    updateDLPDisplay(enabled);
  });

  toggle.addEventListener('change', async () => {
    const enabled = toggle.checked;
    const { config } = await chrome.storage.local.get('config');
    await chrome.storage.local.set({
      config: { ...(config || {}), dlpEnabled: enabled },
    });
    updateDLPDisplay(enabled);
  });

  function updateDLPDisplay(enabled) {
    if (enabled) {
      statusCard.className = 'dlp-card dlp-card-active';
      statusText.textContent = 'Protection DLP active';
      headerDot.className = 'dlp-dot dlp-dot-active';
      headerDot.title = 'Protection DLP active';
    } else {
      statusCard.className = 'dlp-card dlp-card-inactive';
      statusText.textContent = 'Protection DLP desactivee';
      headerDot.className = 'dlp-dot dlp-dot-inactive';
      headerDot.title = 'Protection DLP desactivee';
    }
  }
}

// ============================================
// QUIZ - BOT CONVERSATIONNEL
// ============================================
const chatContainer = () => document.getElementById('quiz-container');
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Get topic-specific explanations */
function getTopicExplanations(topic) {
  const key = (topic || '').toLowerCase();
  return DEFAULT_EXPLANATIONS[key] || DEFAULT_EXPLANATIONS.default;
}

/** Scroll to the last message smoothly */
function scrollChat() {
  const container = chatContainer();
  if (!container) return;
  // Use double rAF to ensure DOM has rendered
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const lastMsg = container.lastElementChild;
      if (lastMsg) {
        lastMsg.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    });
  });
}

function addBotMsg(text, style = '', options = null, delay = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const container = chatContainer();
      const msgEl = document.createElement('div');
      msgEl.className = 'chat-msg bot-msg animate-in';

      let html = `<div class="chat-avatar bot-avatar">🛡️</div><div class="chat-bubble-wrap">`;

      if (text) {
        const styleClass = style === 'success' ? 'bubble-success'
          : style === 'danger' ? 'bubble-danger'
          : style === 'warning' ? 'bubble-warning'
          : style === 'info' ? 'bubble-info'
          : style === 'advice' ? 'bubble-advice'
          : '';
        html += `<div class="chat-bubble bot-bubble ${styleClass}">${formatText(text)}</div>`;
      }

      if (options) {
        html += `<div class="chat-options">`;
        options.forEach((opt, i) => {
          html += `<button class="chat-option-btn" data-idx="${i}">${escapeHtml(opt)}</button>`;
        });
        html += `</div>`;
      }

      html += `</div>`;
      msgEl.innerHTML = html;
      container.appendChild(msgEl);
      scrollChat();
      resolve(msgEl);
    }, delay);
  });
}

function addUserMsg(text) {
  const container = chatContainer();
  const msgEl = document.createElement('div');
  msgEl.className = 'chat-msg user-msg animate-in';
  msgEl.innerHTML = `<div class="chat-bubble-wrap"><div class="chat-bubble user-bubble">${escapeHtml(text)}</div></div><div class="chat-avatar user-avatar">👤</div>`;
  container.appendChild(msgEl);

  // Désactiver les boutons précédents
  container.querySelectorAll('.chat-options').forEach((opts) => {
    opts.querySelectorAll('.chat-option-btn').forEach((btn) => {
      btn.disabled = true;
      btn.classList.add('disabled');
    });
  });

  scrollChat();
}

async function loadQuiz() {
  if (isLoadingQuiz) return;
  isLoadingQuiz = true;

  const loading = document.getElementById('quiz-loading');
  const container = document.getElementById('quiz-container');
  const error = document.getElementById('quiz-error');
  const result = document.getElementById('quiz-result');

  loading.classList.remove('hidden');
  container.classList.add('hidden');
  container.innerHTML = '';
  error.classList.add('hidden');
  result.classList.add('hidden');

  stepIndex = -1;
  quizScore = { correct: 0, total: 0 };
  userAnswers = [];
  sessionComplete = false;

  try {
    const exercise = await api.getTodayQuiz();
    currentQuiz = exercise;
    quizQuestions = extractQuestions(exercise);

    if (quizQuestions.length === 0) {
      throw new Error('Aucune question dans cet exercice');
    }

    loading.classList.add('hidden');
    container.classList.remove('hidden');

    const topicEmoji = TOPIC_EMOJIS[exercise.topic?.toLowerCase()] || '🛡️';
    const courseIntro = exercise.payloadJSON?.courseIntro || exercise.description || `Aujourd'hui on va parler de : ${exercise.topic}`;

    // Intro du bot
    await addBotMsg(`${topicEmoji} **${exercise.topic}**\n\n${courseIntro}`, '', null, 300);

    // Bouton pour commencer
    const startMsg = await addBotMsg(
      `Tu es prêt ? ${quizQuestions.length} questions t'attendent !`,
      '',
      ["C'est compris, on y va ! 🚀"],
      600
    );

    startMsg.querySelector('.chat-option-btn').addEventListener('click', () => {
      handleUserAction(undefined, "C'est compris, on y va ! 🚀");
    });

  } catch (err) {
    console.error('Quiz load error:', err);
    loading.classList.add('hidden');
    error.classList.remove('hidden');
  } finally {
    isLoadingQuiz = false;
  }

  document.getElementById('btn-retry-quiz')?.addEventListener('click', loadQuiz, { once: true });
}

async function handleUserAction(optionIndex, optionText) {
  if (!currentQuiz) return;

  addUserMsg(optionText || 'Option sélectionnée');

  // Session terminée → recommencer ou quitter
  if (sessionComplete) {
    if (optionText?.includes('demain')) {
      await addBotMsg("Parfait ! A demain pour la suite de ta formation. Tu fais du super boulot ! 💪", '', null, 400);
      sessionComplete = false;
    } else {
      await addBotMsg("Super motivation ! 🔥 Je te prépare un nouveau module...", '', null, 400);
      setTimeout(() => {
        sessionComplete = false;
        stepIndex = -1;
        chatContainer().innerHTML = '';
        loadQuiz();
      }, 1200);
    }
    return;
  }

  const questions = quizQuestions;

  if (stepIndex === -1) {
    // Démarrer les questions
    stepIndex = 0;
    await addBotMsg("C'est parti ! 🎯", '', null, 300);
    if (questions[0]) {
      setTimeout(() => showBotQuestion(questions[0]), 500);
    } else {
      await addBotMsg("Oups, aucune question disponible. Reessaie plus tard !", 'warning');
    }

  } else if (stepIndex < questions.length) {
    // Traiter la réponse
    const q = questions[stepIndex];
    const originalQ = (currentQuiz.payloadJSON?.questions || [])[stepIndex] || {};
    const isCorrect = optionIndex === (originalQ.correctAnswer ?? q.correctAnswer);
    const topic = (currentQuiz.topic || '').toLowerCase();
    const topicExpl = getTopicExplanations(topic);

    quizScore.correct += isCorrect ? 1 : 0;
    quizScore.total += 1;
    userAnswers[stepIndex] = optionIndex;

    // Réaction du bot
    const reaction = pick(isCorrect ? ENCOURAGEMENT.correct : ENCOURAGEMENT.incorrect);
    await addBotMsg(reaction, isCorrect ? 'success' : 'danger', null, 300);

    // Explication détaillée — always show why
    if (isCorrect) {
      const feedback = originalQ.feedbackCorrect || topicExpl.correct;
      await addBotMsg(`✅ ${feedback}`, 'success', null, 500);
    } else {
      // Show the correct answer
      const correctIdx = originalQ.correctAnswer ?? q.correctAnswer;
      const correctText = q.options[correctIdx];
      const feedback = originalQ.feedbackIncorrect || topicExpl.incorrect;
      let explanationHtml = `❌ ${feedback}`;
      if (correctText) {
        explanationHtml += `\n\n**La bonne réponse était :** ${correctText}`;
      }
      await addBotMsg(explanationHtml, 'danger', null, 500);
    }

    // Conseil pratique — always show advice
    if (originalQ.advice) {
      let adviceHtml = `💡 **Conseil :** ${originalQ.advice.concept || ''}`;
      if (originalQ.advice.example) adviceHtml += `\n\n📌 *"${originalQ.advice.example}"*`;
      if (originalQ.advice.advice?.length) {
        adviceHtml += `\n\n✅ **Les bons réflexes :**\n${originalQ.advice.advice.map((a) => `• ${a}`).join('\n')}`;
      }
      await addBotMsg(adviceHtml, 'advice', null, 400);
    } else if (originalQ.keyTakeaway) {
      await addBotMsg(`💡 **A retenir :** ${originalQ.keyTakeaway}`, 'advice', null, 400);
    } else {
      // Fallback: always show topic-based advice
      const adviceList = topicExpl.advice;
      let adviceHtml = `💡 **Les bons réflexes :**\n${adviceList.map((a) => `• ${a}`).join('\n')}`;
      await addBotMsg(adviceHtml, 'advice', null, 400);
    }

    // Question suivante ou fin
    const nextIndex = stepIndex + 1;
    if (nextIndex < questions.length) {
      stepIndex = nextIndex;
      await addBotMsg("Question suivante ➡️", '', null, 600);
      setTimeout(() => showBotQuestion(questions[nextIndex]), 400);
    } else {
      await finishQuizModule();
    }
  }
}

async function showBotQuestion(q) {
  if (!q || !q.options) {
    await addBotMsg("Erreur : question invalide. Reessaie plus tard !", 'danger');
    return;
  }

  const originalQ = (currentQuiz.payloadJSON?.questions || [])[stepIndex] || q;

  // Contexte si disponible
  if (originalQ.context || q.context) {
    await addBotMsg(`📋 **Situation :**\n${originalQ.context || q.context}`, 'info', null, 200);
  }

  // La question avec options
  const questionMsg = await addBotMsg(q.text, '', q.options, 400);

  // Attacher les handlers
  questionMsg.querySelectorAll('.chat-option-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      handleUserAction(idx, q.options[idx]);
    });
  });
}

async function finishQuizModule() {
  const pct = quizScore.total > 0 ? Math.round((quizScore.correct / quizScore.total) * 100) : 0;
  const isGood = pct >= 70;

  await addBotMsg(pick(ENCOURAGEMENT.completion), 'success', null, 500);

  const scoreEmoji = pct === 100 ? '💯' : pct >= 70 ? '🏆' : pct >= 40 ? '📈' : '💪';
  await addBotMsg(
    `${scoreEmoji} **Ton score : ${quizScore.correct}/${quizScore.total} (${pct}%)**\n\n${
      isGood ? "Tu maîtrises bien ce sujet !" : "Continue de t'entraîner, tu progresses !"
    }`,
    isGood ? 'success' : 'info',
    null,
    600
  );

  // Gamification
  let xpEarned = XP_PER_QUIZ + (quizScore.correct * XP_PER_CORRECT);
  const today = new Date().toISOString().split('T')[0];
  if (gamification.lastPlayDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    gamification.streak = gamification.lastPlayDate === yesterday ? gamification.streak + 1 : 1;
    gamification.lastPlayDate = today;
    xpEarned += XP_STREAK_BONUS;
  }
  if (gamification.streak > gamification.bestStreak) gamification.bestStreak = gamification.streak;
  gamification.totalCompleted += 1;
  if (pct === 100) gamification.perfectScores += 1;
  addXP(xpEarned);
  await chrome.storage.local.set({ lastQuizDate: today });

  // Telemetrie quiz
  api.track('quiz_complete', {
    score: pct,
    correct: quizScore.correct,
    total: quizScore.total,
    topic: currentQuiz.topic || 'unknown',
    xpEarned,
    streak: gamification.streak,
    level: gamification.level,
  });

  // Soumettre au backend avec les vraies reponses de l'utilisateur
  try {
    const answers = quizQuestions.map((q, i) => ({
      questionId: q.id,
      answer: userAnswers[i] ?? 0,
    }));
    await api.submitExercise(String(currentQuiz.id), answers);
  } catch (e) {
    console.error('Submit error:', e);
  }

  // Proposer de continuer
  sessionComplete = true;
  const endMsg = await addBotMsg(
    "Tu veux continuer avec un autre module ou on reprend demain ? 🤔",
    '',
    ["Encore un module ! 🚀", "On reprend demain 📅"],
    800
  );

  endMsg.querySelectorAll('.chat-option-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      handleUserAction(undefined, btn.textContent);
    });
  });
}

// ============================================
// GLOSSARY
// ============================================
function setupGlossary() {
  const grid = document.getElementById('glossary-terms');
  grid.innerHTML = GLOSSARY_TERMS_LIST.map(
    (t) => `<button class="term-chip" data-term="${t}">${GLOSSARY[t]?.term?.split('(')[0]?.trim() || t}</button>`
  ).join('');

  grid.addEventListener('click', (e) => {
    const chip = e.target.closest('.term-chip');
    if (chip) showGlossaryTerm(chip.dataset.term);
  });

  const input = document.getElementById('glossary-search');
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    if (!q) {
      document.getElementById('glossary-result').classList.add('hidden');
      document.getElementById('glossary-terms').classList.remove('hidden');
      return;
    }
    const match = GLOSSARY_TERMS_LIST.find((t) => {
      const entry = GLOSSARY[t];
      return t.toLowerCase().includes(q) || entry.term.toLowerCase().includes(q) || entry.definition.toLowerCase().includes(q);
    });
    if (match) {
      showGlossaryTerm(match);
    } else {
      document.getElementById('glossary-result').innerHTML = `<div class="center-state"><div class="state-emoji">🔍</div><h3>Aucun résultat</h3><p>Essayez un autre terme</p></div>`;
      document.getElementById('glossary-result').classList.remove('hidden');
      document.getElementById('glossary-terms').classList.add('hidden');
    }
  });
}

function showGlossaryTerm(key) {
  const entry = GLOSSARY[key];
  if (!entry) return;
  api.track('glossary_view', { term: key });
  const el = document.getElementById('glossary-result');
  el.innerHTML = `
    <div class="glossary-card">
      <h4>${entry.term}</h4><p>${entry.definition}</p>
      <div class="glossary-example">💡 ${entry.example}</div>
      ${entry.tips ? `<div class="glossary-tips"><strong>Conseils pratiques</strong><ul>${entry.tips.map((t) => `<li>${t}</li>`).join('')}</ul></div>` : ''}
    </div>
    <button class="btn-back" id="btn-glossary-back">← Tous les termes</button>`;
  el.classList.remove('hidden');
  document.getElementById('glossary-terms').classList.add('hidden');
  document.getElementById('btn-glossary-back').addEventListener('click', () => {
    el.classList.add('hidden');
    document.getElementById('glossary-terms').classList.remove('hidden');
    document.getElementById('glossary-search').value = '';
  });
}

// ============================================
// CHAT IA
// ============================================
function setupChat() {
  const input = document.getElementById('chat-input');
  const btn = document.getElementById('btn-send');
  const send = () => { const msg = input.value.trim(); if (!msg) return; input.value = ''; sendChatMessage(msg); };
  btn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
}

async function sendChatMessage(message) {
  api.track('chat_message', { length: message.length });
  const container = document.getElementById('chat-messages');
  container.innerHTML += `<div class="msg msg-user"><div class="msg-avatar">👤</div><div class="msg-content"><p>${escapeHtml(message)}</p></div></div>`;
  container.scrollTop = container.scrollHeight;
  const loadingId = 'chat-loading-' + Date.now();
  container.innerHTML += `<div class="msg msg-bot" id="${loadingId}"><div class="msg-avatar">🤖</div><div class="msg-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div></div>`;
  container.scrollTop = container.scrollHeight;
  try {
    const res = await api.chatWithAI(message, chatContext);
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) loadingEl.querySelector('.msg-content').innerHTML = `<p>${formatChatResponse(res?.response || 'Reponse vide du serveur.')}</p>`;
    if (res?.context) chatContext = res.context;
  } catch (err) {
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) loadingEl.querySelector('.msg-content').innerHTML = `<p style="color:var(--danger)">Erreur : ${escapeHtml(err.message)}</p>`;
  }
  container.scrollTop = container.scrollHeight;
}

// ============================================
// PROGRESS
// ============================================
async function loadProgress() {
  const loading = document.getElementById('progress-loading');
  const content = document.getElementById('progress-content');
  const error = document.getElementById('progress-error');
  loading.classList.remove('hidden');
  content.classList.add('hidden');
  error.classList.add('hidden');
  try {
    const progress = await api.getUserProgress();
    renderProgress(progress);
    loading.classList.add('hidden');
    content.classList.remove('hidden');
  } catch {
    renderProgress({ averageScore: 0 });
    loading.classList.add('hidden');
    content.classList.remove('hidden');
  }
}

function renderProgress(serverData) {
  const info = getLevelInfo(gamification.xp);
  const avgScore = Math.round(serverData?.averageScore || 0);
  const earnedBadges = BADGES.filter((b) => b.condition(gamification));
  const lockedBadges = BADGES.filter((b) => !b.condition(gamification));

  document.getElementById('progress-content').innerHTML = `
    <div class="progress-card full-width" style="text-align:center;">
      <div class="level-badge">🎖️ Niveau ${info.level} - ${info.title}</div>
      <div class="progress-bar-track" style="margin-top:10px;"><div class="progress-bar-fill" style="width:${info.pct}%;"></div></div>
      <div class="progress-card-sub" style="margin-top:4px;">
        ${info.next ? `${info.xpInLevel} / ${info.xpForNext} XP pour niveau ${info.next.level}` : 'Niveau maximum atteint !'}
      </div>
    </div>
    <div class="progress-grid">
      <div class="progress-card"><div class="progress-card-label">XP Total</div><div class="progress-card-value">${gamification.xp}</div></div>
      <div class="progress-card"><div class="progress-card-label">Série actuelle</div><div class="progress-card-value" style="color:var(--warning)">🔥 ${gamification.streak}</div><div class="progress-card-sub">Record : ${gamification.bestStreak} jours</div></div>
      <div class="progress-card"><div class="progress-card-label">Défis terminés</div><div class="progress-card-value">${gamification.totalCompleted}</div></div>
      <div class="progress-card"><div class="progress-card-label">Score moyen</div><div class="progress-card-value ${avgScore >= 70 ? 'success' : 'warning'}">${avgScore}%</div></div>
    </div>
    <div class="badges-section">
      <h4>Badges (${earnedBadges.length}/${BADGES.length})</h4>
      <div class="badges-grid">
        ${earnedBadges.map((b) => `<div class="badge-item earned"><span class="badge-emoji">${b.emoji}</span><span class="badge-name">${b.name}</span></div>`).join('')}
        ${lockedBadges.map((b) => `<div class="badge-item locked"><span class="badge-emoji">🔒</span><span class="badge-name">${b.name}</span></div>`).join('')}
      </div>
    </div>
    <div style="text-align:center;margin-top:12px;">
      <button id="btn-progress-quiz" class="btn-primary">Continuer ma formation</button>
    </div>`;

  document.getElementById('btn-progress-quiz').addEventListener('click', () => {
    document.querySelectorAll('.nav-tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.add('hidden'));
    document.querySelector('[data-tab="quiz"]').classList.add('active');
    document.getElementById('tab-quiz').classList.remove('hidden');
    loadQuiz();
  });
}

// ============================================
// HELPERS
// ============================================
function extractQuestions(exercise) {
  const payload = exercise.payloadJSON || {};
  if (payload.questions && Array.isArray(payload.questions)) {
    return payload.questions.map((q, i) => ({
      id: q.id || `q${i + 1}`,
      text: q.text || q.question || '',
      options: q.options || [],
      context: q.context,
      correctAnswer: q.correctAnswer,
    }));
  }
  if (payload.question) return [{ id: 'q1', text: payload.question, options: payload.options || [] }];
  return [];
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function formatChatResponse(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}
