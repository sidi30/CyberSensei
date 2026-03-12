/**
 * CyberSensei Extension v2 - Popup Controller
 * Gamified dark theme with XP, streaks, levels, badges
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

// ============================================
// STATE
// ============================================
let gamification = {
  xp: 0,
  level: 1,
  streak: 0,
  bestStreak: 0,
  totalCompleted: 0,
  perfectScores: 0,
  lastPlayDate: null,
};

let currentQuiz = null;
let currentQuestionIndex = 0;
let currentAnswers = [];
let chatContext = null;

// Glossaire local
const GLOSSARY = {
  phishing: {
    term: 'Phishing (Hameçonnage)',
    definition: "Technique de fraude consistant à usurper l'identité d'un organisme de confiance pour inciter la victime à révéler des informations sensibles.",
    example: "Un email imitant votre banque vous demandant de 'vérifier' vos identifiants via un lien.",
    tips: ["Vérifiez toujours l'adresse de l'expéditeur", 'Ne cliquez jamais sur un lien suspect', 'Signalez les emails douteux à votre équipe IT'],
  },
  ransomware: {
    term: 'Ransomware (Rançongiciel)',
    definition: 'Logiciel malveillant qui chiffre vos fichiers et exige une rançon pour les débloquer.',
    example: 'Un fichier joint dans un email déclenche le chiffrement de tous vos documents.',
    tips: ['Faites des sauvegardes régulières', 'Ne payez jamais la rançon', 'Maintenez vos logiciels à jour'],
  },
  vpn: {
    term: 'VPN (Virtual Private Network)',
    definition: 'Réseau privé virtuel qui crée un tunnel chiffré entre votre appareil et Internet.',
    example: "En télétravail depuis un café, le VPN chiffre votre connexion pour empêcher l'interception.",
    tips: ['Activez toujours le VPN en Wi-Fi public', 'Utilisez le VPN de votre entreprise'],
  },
  malware: {
    term: 'Malware (Logiciel malveillant)',
    definition: "Terme générique désignant tout logiciel conçu pour endommager ou accéder de manière non autorisée à un système.",
    example: 'Un programme depuis un site non officiel installe un keylogger enregistrant vos frappes.',
    tips: ['Téléchargez uniquement depuis des sources officielles', 'Gardez votre antivirus actif'],
  },
  '2fa': {
    term: 'Authentification à deux facteurs (2FA)',
    definition: "Méthode de sécurité qui requiert deux formes d'identification pour accéder à un compte.",
    example: 'Après votre mot de passe, une app génère un code temporaire à 6 chiffres.',
    tips: ['Activez le 2FA sur tous vos comptes', "Préférez une app authenticator aux SMS"],
  },
  social_engineering: {
    term: 'Ingénierie sociale',
    definition: 'Technique de manipulation psychologique pour obtenir des informations confidentielles.',
    example: "Quelqu'un se fait passer pour le support IT et demande votre mot de passe.",
    tips: ['Ne communiquez jamais vos mots de passe par téléphone', "Vérifiez l'identité de votre interlocuteur"],
  },
  rgpd: {
    term: 'RGPD',
    definition: 'Réglementation européenne encadrant la collecte et le traitement des données personnelles.',
    example: 'Un site web doit obtenir votre consentement avant de placer des cookies de suivi.',
    tips: ['Collectez uniquement les données nécessaires', "Informez les utilisateurs de l'usage de leurs données"],
  },
  shadow_it: {
    term: 'Shadow IT',
    definition: "Utilisation de logiciels ou services non approuvés par le service informatique de l'entreprise.",
    example: "Un employé utilise Dropbox personnel pour partager des documents d'entreprise.",
    tips: ['Utilisez uniquement les outils approuvés', 'Signalez vos besoins au service IT'],
  },
  firewall: {
    term: 'Firewall (Pare-feu)',
    definition: 'Système de sécurité réseau qui surveille et contrôle le trafic selon des règles prédéfinies.',
    example: "Le pare-feu bloque les connexions provenant d'adresses IP suspectes.",
    tips: ['Ne désactivez jamais votre pare-feu', 'Gardez-le à jour'],
  },
  zero_trust: {
    term: 'Zero Trust',
    definition: "Modèle de sécurité : ne jamais faire confiance, toujours vérifier. Chaque accès est authentifié.",
    example: "Même sur le réseau interne, un employé doit s'authentifier pour chaque application.",
    tips: ['Adoptez le principe du moindre privilège', 'Vérifiez chaque accès'],
  },
  dlp: {
    term: 'DLP (Data Loss Prevention)',
    definition: "Ensemble de technologies empêchant la fuite de données sensibles hors de l'organisation.",
    example: "Un email contenant un numéro de carte bancaire est bloqué automatiquement avant l'envoi.",
    tips: ['Classifiez vos données sensibles', 'Formez vos employés aux bonnes pratiques'],
  },
  siem: {
    term: 'SIEM (Security Information and Event Management)',
    definition: "Solution centralisant les logs de sécurité pour détecter les menaces en temps réel.",
    example: "Le SIEM détecte 50 tentatives de connexion échouées en 2 minutes sur un même compte.",
    tips: ['Centralisez tous vos logs', 'Configurez des alertes intelligentes'],
  },
};

const GLOSSARY_TERMS_LIST = Object.keys(GLOSSARY);

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  await api.init();
  await loadGamification();

  if (!api.isConfigured) {
    showScreen('onboarding');
    setupOnboarding();
  } else {
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
  if (gamification.lastPlayDate === yesterday) {
    // Streak continues (will be incremented on quiz complete)
  } else if (gamification.lastPlayDate && gamification.lastPlayDate !== today) {
    // Streak broken
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

  if (newLevel > oldLevel) {
    setTimeout(() => showLevelUp(newLevel), 800);
  }

  saveGamification();
}

function showXPPopup(amount) {
  const popup = document.getElementById('xp-popup');
  popup.querySelector('.xp-popup-text').textContent = `+${amount} XP`;
  popup.classList.remove('hidden');
  popup.classList.remove('show');
  void popup.offsetWidth; // reflow
  popup.classList.add('show');
  setTimeout(() => popup.classList.add('hidden'), 1600);
}

function showLevelUp(level) {
  const info = LEVELS.find((l) => l.level === level);
  const overlay = document.createElement('div');
  overlay.className = 'level-up-overlay';
  overlay.innerHTML = `
    <div class="level-up-content">
      <div class="level-emoji">🎖️</div>
      <h2>Niveau ${level} !</h2>
      <p>${info?.title || ''}</p>
    </div>`;
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

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btn.click();
  });
}

// ============================================
// MAIN SCREEN INIT
// ============================================
function initMainScreen() {
  updateStatsDisplay();
  setupTabs();
  setupSettings();
  setupChat();
  setupGlossary();
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
  if (info.next) {
    label.textContent = `${info.xpInLevel} / ${info.xpForNext} XP`;
  } else {
    label.textContent = 'MAX';
  }
}

// ============================================
// TABS
// ============================================
function setupTabs() {
  document.querySelectorAll('.nav-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.add('hidden'));

      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.getElementById(`tab-${target}`).classList.remove('hidden');

      if (target === 'progress') loadProgress();
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

  document.getElementById('btn-save-settings').addEventListener('click', async () => {
    const url = document.getElementById('setting-url').value.replace(/\/$/, '');
    const code = document.getElementById('setting-code').value.trim();

    await chrome.storage.local.set({
      config: {
        ...((await chrome.storage.local.get('config')).config || {}),
        backendUrl: url,
        activationCode: code,
      },
    });

    api.baseUrl = url;
    api.activationCode = code;

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
  }
}

// ============================================
// QUIZ
// ============================================
async function loadQuiz() {
  const loading = document.getElementById('quiz-loading');
  const container = document.getElementById('quiz-container');
  const error = document.getElementById('quiz-error');
  const result = document.getElementById('quiz-result');

  loading.classList.remove('hidden');
  container.classList.add('hidden');
  error.classList.add('hidden');
  result.classList.add('hidden');

  try {
    const exercise = await api.getTodayQuiz();
    currentQuiz = exercise;
    renderQuiz(exercise);
    loading.classList.add('hidden');
    container.classList.remove('hidden');
  } catch (err) {
    console.error('Quiz load error:', err);
    loading.classList.add('hidden');
    error.classList.remove('hidden');
  }

  document.getElementById('btn-retry-quiz')?.addEventListener('click', loadQuiz, { once: true });
}

function renderQuiz(exercise) {
  const payload = exercise.payloadJSON || {};
  const questions = extractQuestions(exercise);
  const courseIntro = payload.courseIntro || exercise.description || `Formation : ${exercise.topic}`;

  const topicEmojis = {
    phishing: '🎣', 'mots de passe': '🔐', ransomware: '💀',
    'ingénierie sociale': '🎭', vpn: '🔒', malware: '🦠',
    dlp: '🛡️', rgpd: '📋', 'shadow it': '👻',
  };
  const emoji = topicEmojis[exercise.topic?.toLowerCase()] || '🛡️';

  // Reset state for step-by-step quiz
  currentQuestionIndex = 0;
  currentAnswers = [];

  // Show intro first, then step through questions one by one
  const container = document.getElementById('quiz-container');
  container.innerHTML = `
    <div class="quiz-card">
      <div class="quiz-card-header">
        <div class="quiz-card-emoji">${emoji}</div>
        <div class="quiz-card-info">
          <h3>${exercise.topic || 'Défi du jour'}</h3>
          <div class="quiz-card-meta">
            <span>📚 ${questions.length} question${questions.length > 1 ? 's' : ''}</span>
            <span>⚡ ${translateLevel(exercise.difficulty)}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="quiz-intro-text">${courseIntro}</div>
    <div class="quiz-submit">
      <button id="btn-start-quiz" class="btn-primary">Commencer le défi</button>
    </div>`;

  document.getElementById('btn-start-quiz').addEventListener('click', () => {
    renderQuestion(exercise, questions, 0);
  });
}

function renderQuestion(exercise, questions, index) {
  const q = questions[index];
  const total = questions.length;
  const container = document.getElementById('quiz-container');
  const progressPct = Math.round(((index) / total) * 100);

  container.innerHTML = `
    <div class="quiz-progress-bar">
      <div class="quiz-progress-fill" style="width: ${progressPct}%"></div>
    </div>
    <div class="quiz-progress-text">Question ${index + 1} / ${total}</div>
    <div class="question-block">
      ${q.context ? `<div class="question-context">📋 ${q.context}</div>` : ''}
      <div class="question-text">${q.text}</div>
      <div id="options-container">
        ${q.options.map((opt, optIdx) => `
          <button class="option-btn" data-idx="${optIdx}">
            <span class="option-letter">${String.fromCharCode(65 + optIdx)}</span>
            <span class="option-text">${opt}</span>
          </button>
        `).join('')}
      </div>
    </div>`;

  // Handle option selection
  const optionBtns = container.querySelectorAll('.option-btn');
  optionBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedIdx = parseInt(btn.dataset.idx, 10);
      const correctIdx = q.correctAnswer ?? -1;

      // Disable all buttons
      optionBtns.forEach((b) => {
        b.disabled = true;
        b.classList.add('disabled');
      });

      // Show correct/incorrect
      if (selectedIdx === correctIdx) {
        btn.classList.add('correct');
      } else {
        btn.classList.add('incorrect');
        // Highlight the correct answer
        optionBtns.forEach((b) => {
          if (parseInt(b.dataset.idx, 10) === correctIdx) {
            b.classList.add('correct');
          }
        });
      }

      // Save answer
      currentAnswers.push({ questionId: q.id, answer: selectedIdx });

      // Show feedback if available
      const payload = exercise.payloadJSON || {};
      const originalQ = (payload.questions || [])[index] || {};
      let feedbackHtml = '';
      if (selectedIdx === correctIdx && originalQ.feedbackCorrect) {
        feedbackHtml = `<div class="question-feedback correct-feedback">✅ ${originalQ.feedbackCorrect}</div>`;
      } else if (selectedIdx !== correctIdx && originalQ.feedbackIncorrect) {
        feedbackHtml = `<div class="question-feedback incorrect-feedback">❌ ${originalQ.feedbackIncorrect}</div>`;
      }

      // Show key takeaway
      if (originalQ.keyTakeaway) {
        feedbackHtml += `<div class="question-takeaway">💡 ${originalQ.keyTakeaway}</div>`;
      }

      // Add next button
      const isLast = index === total - 1;
      const nextHtml = `
        ${feedbackHtml}
        <div class="quiz-submit" style="margin-top: 12px;">
          <button id="btn-next-question" class="btn-primary">
            ${isLast ? 'Voir mes résultats' : 'Question suivante →'}
          </button>
        </div>`;

      container.querySelector('.question-block').insertAdjacentHTML('beforeend', nextHtml);

      document.getElementById('btn-next-question').addEventListener('click', () => {
        if (isLast) {
          submitQuiz();
        } else {
          renderQuestion(exercise, questions, index + 1);
        }
      });
    });
  });
}

async function submitQuiz() {
  if (!currentQuiz) return;

  const questions = extractQuestions(currentQuiz);
  const container = document.getElementById('quiz-container');
  container.innerHTML = `
    <div class="center-state">
      <div class="loader"></div>
      <p>Calcul de ton score...</p>
    </div>`;

  try {
    const result = await api.submitExercise(String(currentQuiz.id), currentAnswers);
    renderResult(result, questions.length);

    // Gamification
    const score = result.score ?? 0;
    const maxScore = result.maxScore ?? questions.length;
    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    let xpEarned = XP_PER_QUIZ + (score * XP_PER_CORRECT);

    // Streak
    const today = new Date().toISOString().split('T')[0];
    if (gamification.lastPlayDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (gamification.lastPlayDate === yesterday) {
        gamification.streak += 1;
      } else {
        gamification.streak = 1;
      }
      gamification.lastPlayDate = today;
      xpEarned += XP_STREAK_BONUS;
    }

    if (gamification.streak > gamification.bestStreak) {
      gamification.bestStreak = gamification.streak;
    }

    gamification.totalCompleted += 1;
    if (pct === 100) gamification.perfectScores += 1;

    addXP(xpEarned);

    await chrome.storage.local.set({ lastQuizDate: today });
  } catch (err) {
    console.error('Submit error:', err);
    container.innerHTML = `
      <div class="center-state">
        <div class="state-emoji">😕</div>
        <h3>Erreur</h3>
        <p>${escapeHtml(err.message)}</p>
        <button id="btn-retry-submit" class="btn-primary">Réessayer</button>
      </div>`;
    document.getElementById('btn-retry-submit')?.addEventListener('click', submitQuiz);
  }
}

function renderResult(result, totalQuestions) {
  const score = result.score ?? 0;
  const maxScore = result.maxScore ?? totalQuestions;
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  let scoreClass = 'poor';
  let emoji = '📚';
  let title = 'Courage !';
  if (pct >= 90) { scoreClass = 'excellent'; emoji = '🏆'; title = 'Excellent !'; }
  else if (pct >= 70) { scoreClass = 'good'; emoji = '🎉'; title = 'Bravo !'; }
  else if (pct >= 50) { scoreClass = 'average'; emoji = '💪'; title = 'Bien joué !'; }

  const barColor = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';
  const xpEarned = XP_PER_QUIZ + (score * XP_PER_CORRECT) + (gamification.streak > 0 ? XP_STREAK_BONUS : 0);

  document.getElementById('quiz-container').classList.add('hidden');
  const el = document.getElementById('quiz-result');
  el.classList.remove('hidden');

  el.innerHTML = `
    <div class="result-card">
      <div class="result-emoji">${emoji}</div>
      <div class="result-title">${title}</div>
      <div class="result-score ${scoreClass}">${pct}%</div>
      <div class="result-bar">
        <div class="result-bar-fill" style="width: 0%; background: ${barColor};"></div>
      </div>
      <div class="result-detail">${score}/${maxScore} bonnes réponses</div>
      <div class="result-xp-badge">⚡ +${xpEarned} XP</div>
      ${gamification.streak > 1 ? `<div class="result-detail">🔥 Série de ${gamification.streak} jours !</div>` : ''}
      ${result.feedback ? `<div class="result-feedback">${result.feedback}</div>` : ''}
      <div class="result-actions">
        <button id="btn-new-quiz" class="btn-primary">Nouveau défi</button>
        <button id="btn-see-progress" class="btn-secondary">Progrès</button>
      </div>
    </div>`;

  // Animate the bar
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.querySelector('.result-bar-fill').style.width = `${pct}%`;
    });
  });

  document.getElementById('btn-new-quiz').addEventListener('click', () => {
    el.classList.add('hidden');
    loadQuiz();
  });

  document.getElementById('btn-see-progress').addEventListener('click', () => {
    document.querySelectorAll('.nav-tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.add('hidden'));
    document.querySelector('[data-tab="progress"]').classList.add('active');
    document.getElementById('tab-progress').classList.remove('hidden');
    loadProgress();
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
      return t.includes(q) || entry.term.toLowerCase().includes(q) || entry.definition.toLowerCase().includes(q);
    });

    if (match) {
      showGlossaryTerm(match);
    } else {
      document.getElementById('glossary-result').innerHTML = `
        <div class="center-state">
          <div class="state-emoji">🔍</div>
          <h3>Aucun résultat</h3>
          <p>Essayez un autre terme</p>
        </div>`;
      document.getElementById('glossary-result').classList.remove('hidden');
      document.getElementById('glossary-terms').classList.add('hidden');
    }
  });
}

function showGlossaryTerm(key) {
  const entry = GLOSSARY[key];
  if (!entry) return;

  const el = document.getElementById('glossary-result');
  el.innerHTML = `
    <div class="glossary-card">
      <h4>${entry.term}</h4>
      <p>${entry.definition}</p>
      <div class="glossary-example">💡 ${entry.example}</div>
      ${entry.tips ? `
        <div class="glossary-tips">
          <strong>Conseils pratiques</strong>
          <ul>${entry.tips.map((t) => `<li>${t}</li>`).join('')}</ul>
        </div>` : ''}
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

  const send = () => {
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    sendChatMessage(msg);
  };

  btn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') send();
  });
}

async function sendChatMessage(message) {
  const container = document.getElementById('chat-messages');

  // User message
  container.innerHTML += `
    <div class="msg msg-user">
      <div class="msg-avatar">👤</div>
      <div class="msg-content"><p>${escapeHtml(message)}</p></div>
    </div>`;
  container.scrollTop = container.scrollHeight;

  // Loading
  const loadingId = 'chat-loading-' + Date.now();
  container.innerHTML += `
    <div class="msg msg-bot" id="${loadingId}">
      <div class="msg-avatar">🤖</div>
      <div class="msg-content">
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>`;
  container.scrollTop = container.scrollHeight;

  try {
    const res = await api.chatWithAI(message, chatContext);
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) {
      loadingEl.querySelector('.msg-content').innerHTML = `<p>${formatChatResponse(res.response)}</p>`;
    }
    if (res.context) chatContext = res.context;
  } catch (err) {
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) {
      loadingEl.querySelector('.msg-content').innerHTML = `<p style="color:var(--danger)">Erreur : ${escapeHtml(err.message)}</p>`;
    }
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
    // Fallback: show local gamification data
    renderLocalProgress();
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
      <div class="progress-bar-track" style="margin-top:12px;">
        <div class="progress-bar-fill" style="width:${info.pct}%;"></div>
      </div>
      <div class="progress-card-sub" style="margin-top:6px;">
        ${info.next ? `${info.xpInLevel} / ${info.xpForNext} XP pour niveau ${info.next.level}` : 'Niveau maximum atteint !'}
      </div>
    </div>

    <div class="progress-grid">
      <div class="progress-card">
        <div class="progress-card-label">XP Total</div>
        <div class="progress-card-value">${gamification.xp}</div>
      </div>
      <div class="progress-card">
        <div class="progress-card-label">Série actuelle</div>
        <div class="progress-card-value" style="color:var(--warning)">🔥 ${gamification.streak}</div>
        <div class="progress-card-sub">Record : ${gamification.bestStreak} jours</div>
      </div>
      <div class="progress-card">
        <div class="progress-card-label">Défis terminés</div>
        <div class="progress-card-value">${gamification.totalCompleted}</div>
      </div>
      <div class="progress-card">
        <div class="progress-card-label">Score moyen</div>
        <div class="progress-card-value ${avgScore >= 70 ? 'success' : 'warning'}">${avgScore}%</div>
      </div>
    </div>

    <div class="badges-section">
      <h4>Badges (${earnedBadges.length}/${BADGES.length})</h4>
      <div class="badges-grid">
        ${earnedBadges.map((b) => `
          <div class="badge-item earned">
            <span class="badge-emoji">${b.emoji}</span>
            <span class="badge-name">${b.name}</span>
          </div>`).join('')}
        ${lockedBadges.map((b) => `
          <div class="badge-item locked">
            <span class="badge-emoji">🔒</span>
            <span class="badge-name">${b.name}</span>
          </div>`).join('')}
      </div>
    </div>

    <div style="text-align:center;margin-top:16px;">
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

function renderLocalProgress() {
  renderProgress({ averageScore: 0 });
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
    }));
  }
  if (payload.question) {
    return [{ id: 'q1', text: payload.question, options: payload.options || [] }];
  }
  return [];
}

function translateLevel(level) {
  const map = {
    BEGINNER: 'Débutant', INTERMEDIATE: 'Intermédiaire',
    ADVANCED: 'Avancé', EXPERT: 'Expert',
  };
  return map[level] || level || 'Débutant';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatChatResponse(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}
