/**
 * CyberSensei Extension - Popup Controller
 * Reproduit les fonctionnalités du bot Teams dans une extension Chrome/Edge
 */

import api from './api.js';

// ============================================
// STATE
// ============================================
let currentQuiz = null;
let chatContext = null;

// Glossaire local (même données que le bot Teams contextManager)
const GLOSSARY = {
  phishing: {
    term: 'Phishing (Hameçonnage)',
    definition: "Technique de fraude consistant à usurper l'identité d'un organisme de confiance pour inciter la victime à révéler des informations sensibles.",
    example: "Un email imitant votre banque vous demandant de 'vérifier' vos identifiants via un lien.",
    tips: ['Vérifiez toujours l\'adresse de l\'expéditeur', 'Ne cliquez jamais sur un lien suspect', 'Signalez les emails douteux à votre équipe IT'],
  },
  ransomware: {
    term: 'Ransomware (Rançongiciel)',
    definition: 'Logiciel malveillant qui chiffre vos fichiers et exige une rançon pour les débloquer.',
    example: 'Un fichier joint dans un email déclenche le chiffrement de tous vos documents. Un message apparaît demandant un paiement en Bitcoin.',
    tips: ['Faites des sauvegardes régulières', 'Ne payez jamais la rançon', 'Maintenez vos logiciels à jour'],
  },
  vpn: {
    term: 'VPN (Virtual Private Network)',
    definition: 'Réseau privé virtuel qui crée un tunnel chiffré entre votre appareil et Internet, protégeant vos données en transit.',
    example: 'En télétravail depuis un café, le VPN chiffre votre connexion pour empêcher l\'interception de vos échanges professionnels.',
    tips: ['Activez toujours le VPN en Wi-Fi public', 'Utilisez le VPN de votre entreprise'],
  },
  malware: {
    term: 'Malware (Logiciel malveillant)',
    definition: 'Terme générique désignant tout logiciel conçu pour endommager, perturber ou accéder de manière non autorisée à un système.',
    example: 'Un programme téléchargé depuis un site non officiel installe un keylogger qui enregistre vos frappes clavier.',
    tips: ['Téléchargez uniquement depuis des sources officielles', 'Gardez votre antivirus actif et à jour'],
  },
  '2fa': {
    term: 'Authentification à deux facteurs (2FA/MFA)',
    definition: "Méthode de sécurité qui requiert deux formes d'identification différentes pour accéder à un compte.",
    example: 'Après avoir entré votre mot de passe, une application sur votre téléphone génère un code temporaire à 6 chiffres.',
    tips: ['Activez le 2FA sur tous vos comptes importants', 'Préférez une app authenticator aux SMS'],
  },
  social_engineering: {
    term: 'Ingénierie sociale',
    definition: 'Technique de manipulation psychologique visant à tromper une personne pour obtenir des informations confidentielles.',
    example: "Quelqu'un appelle en se faisant passer pour le support IT et demande votre mot de passe pour 'une mise à jour urgente'.",
    tips: ['Ne communiquez jamais vos mots de passe par téléphone', 'Vérifiez l\'identité de votre interlocuteur'],
  },
  rgpd: {
    term: 'RGPD (Règlement Général sur la Protection des Données)',
    definition: 'Réglementation européenne encadrant la collecte, le traitement et la conservation des données personnelles.',
    example: 'Un site web doit obtenir votre consentement explicite avant de placer des cookies de suivi sur votre navigateur.',
    tips: ['Collectez uniquement les données nécessaires', 'Informez les utilisateurs de l\'usage de leurs données'],
  },
  shadow_it: {
    term: 'Shadow IT',
    definition: "Utilisation de logiciels, services cloud ou appareils non approuvés par le service informatique de l'entreprise.",
    example: "Un employé utilise son compte Dropbox personnel pour partager des documents d'entreprise, contournant les politiques de sécurité.",
    tips: ['Utilisez uniquement les outils approuvés par votre entreprise', 'Signalez vos besoins au service IT'],
  },
  firewall: {
    term: 'Firewall (Pare-feu)',
    definition: 'Système de sécurité réseau qui surveille et contrôle le trafic entrant et sortant selon des règles de sécurité prédéfinies.',
    example: "Le pare-feu de votre entreprise bloque les connexions provenant d'adresses IP suspectes connues pour distribuer des malwares.",
    tips: ['Ne désactivez jamais votre pare-feu', 'Gardez-le à jour avec les dernières règles'],
  },
  zero_trust: {
    term: 'Zero Trust',
    definition: "Modèle de sécurité basé sur le principe 'ne jamais faire confiance, toujours vérifier'. Chaque accès est vérifié, même depuis le réseau interne.",
    example: "Même connecté au réseau de l'entreprise, un employé doit s'authentifier pour accéder à chaque application.",
    tips: ['Adoptez le principe du moindre privilège', 'Vérifiez chaque accès, même interne'],
  },
};

const GLOSSARY_TERMS_LIST = Object.keys(GLOSSARY);

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  await api.init();

  setupTabs();
  setupSettings();
  setupChat();
  setupGlossary();

  if (!api.isConfigured) {
    document.getElementById('settings-overlay').classList.remove('hidden');
  } else {
    loadQuiz();
  }
});

// ============================================
// TABS
// ============================================
function setupTabs() {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      // Deselect all
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach((c) => c.classList.add('hidden'));

      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.getElementById(`tab-${target}`).classList.remove('hidden');

      // Lazy load
      if (target === 'progress') loadProgress();
    });
  });
}

// ============================================
// SETTINGS
// ============================================
function setupSettings() {
  document.getElementById('btn-settings').addEventListener('click', () => {
    document.getElementById('settings-overlay').classList.remove('hidden');
    loadSettings();
  });

  document.getElementById('btn-close-settings').addEventListener('click', () => {
    document.getElementById('settings-overlay').classList.add('hidden');
  });

  document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = document.getElementById('setting-url').value.replace(/\/$/, '');
    const licenseKey = document.getElementById('setting-license').value.trim();

    await chrome.storage.local.set({
      config: { backendUrl: url, licenseKey },
    });

    api.baseUrl = url;
    api.licenseKey = licenseKey;

    showSettingsStatus('Configuration enregistrée !', 'success');
    setTimeout(() => {
      document.getElementById('settings-overlay').classList.add('hidden');
      loadQuiz();
    }, 1000);
  });
}

async function loadSettings() {
  const { config } = await chrome.storage.local.get('config');
  if (config) {
    document.getElementById('setting-url').value = config.backendUrl || '';
    document.getElementById('setting-license').value = config.licenseKey || '';
  }
}

function showSettingsStatus(msg, type) {
  const el = document.getElementById('settings-status');
  el.textContent = msg;
  el.className = `status-msg ${type}`;
  el.classList.remove('hidden');
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

  document.getElementById('btn-retry-quiz')?.addEventListener('click', loadQuiz);
}

function renderQuiz(exercise) {
  const payload = exercise.payloadJSON || {};
  const questions = extractQuestions(exercise);
  const courseIntro = payload.courseIntro || exercise.description || `Formation : ${exercise.topic}`;

  const topicEmojis = {
    phishing: '🎣', 'mots de passe': '🔐', ransomware: '💀',
    'ingénierie sociale': '🎭', vpn: '🔒', malware: '🦠',
  };
  const emoji = topicEmojis[exercise.topic?.toLowerCase()] || '🛡️';

  let html = `
    <div class="quiz-header">
      <h3>${emoji} ${exercise.topic || 'Quiz du jour'}</h3>
      <div class="quiz-meta">
        <span>📚 ${questions.length} question${questions.length > 1 ? 's' : ''}</span>
        <span>⚡ ${translateLevel(exercise.difficulty)}</span>
      </div>
    </div>
    <div class="quiz-intro">${courseIntro}</div>
  `;

  questions.forEach((q, idx) => {
    html += `<div class="question-block">`;
    if (q.context) {
      html += `<div class="question-context">📋 ${q.context}</div>`;
    }
    html += `<div class="question-text">Question ${idx + 1} : ${q.text}</div>`;
    q.options.forEach((opt, optIdx) => {
      html += `
        <label class="option-label" id="opt-${q.id}-${optIdx}">
          <input type="radio" name="q_${q.id}" value="${optIdx}" />
          <span>${opt}</span>
        </label>`;
    });
    html += `</div>`;
  });

  html += `
    <div class="quiz-submit">
      <button id="btn-submit-quiz" class="btn btn-primary">✅ Valider mes réponses</button>
    </div>`;

  document.getElementById('quiz-container').innerHTML = html;
  document.getElementById('btn-submit-quiz').addEventListener('click', submitQuiz);
}

async function submitQuiz() {
  if (!currentQuiz) return;

  const questions = extractQuestions(currentQuiz);
  const answers = [];

  for (const q of questions) {
    const selected = document.querySelector(`input[name="q_${q.id}"]:checked`);
    if (!selected) {
      alert(`Veuillez répondre à toutes les questions.`);
      return;
    }
    answers.push({ questionId: q.id, answer: parseInt(selected.value, 10) });
  }

  const btn = document.getElementById('btn-submit-quiz');
  btn.disabled = true;
  btn.textContent = 'Envoi...';

  try {
    const result = await api.submitExercise(String(currentQuiz.id), answers);
    renderResult(result, questions.length);

    // Marquer le quiz du jour comme fait
    const today = new Date().toISOString().split('T')[0];
    await chrome.storage.local.set({ lastQuizDate: today });
  } catch (err) {
    console.error('Submit error:', err);
    btn.disabled = false;
    btn.textContent = '✅ Valider mes réponses';
    alert('Erreur lors de la soumission : ' + err.message);
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

  document.getElementById('quiz-container').classList.add('hidden');
  const el = document.getElementById('quiz-result');
  el.classList.remove('hidden');

  el.innerHTML = `
    <div class="result-card">
      <div style="font-size: 40px;">${emoji}</div>
      <h3>${title}</h3>
      <div class="result-score ${scoreClass}">${pct}%</div>
      <div class="result-bar">
        <div class="result-bar-fill" style="width: ${pct}%; background: ${barColor};"></div>
      </div>
      <p style="color: var(--gray-500); font-size: 13px;">${score}/${maxScore} bonnes réponses</p>
      ${result.feedback ? `<div class="result-feedback">${result.feedback}</div>` : ''}
      <div class="result-actions">
        <button id="btn-new-quiz" class="btn btn-primary">🔄 Nouveau quiz</button>
        <button id="btn-see-progress" class="btn btn-outline">📊 Progression</button>
      </div>
    </div>`;

  document.getElementById('btn-new-quiz').addEventListener('click', () => {
    document.getElementById('quiz-result').classList.add('hidden');
    loadQuiz();
  });

  document.getElementById('btn-see-progress').addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach((c) => c.classList.add('hidden'));
    document.querySelector('[data-tab="progress"]').classList.add('active');
    document.getElementById('tab-progress').classList.remove('hidden');
    loadProgress();
  });
}

// ============================================
// GLOSSARY
// ============================================
function setupGlossary() {
  // Render term chips
  const grid = document.getElementById('glossary-terms');
  grid.innerHTML = GLOSSARY_TERMS_LIST.map(
    (t) => `<button class="term-chip" data-term="${t}">${GLOSSARY[t]?.term?.split('(')[0]?.trim() || t}</button>`
  ).join('');

  grid.addEventListener('click', (e) => {
    const chip = e.target.closest('.term-chip');
    if (chip) showGlossaryTerm(chip.dataset.term);
  });

  // Search
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
      return (
        t.includes(q) ||
        entry.term.toLowerCase().includes(q) ||
        entry.definition.toLowerCase().includes(q)
      );
    });

    if (match) {
      showGlossaryTerm(match);
    } else {
      document.getElementById('glossary-result').innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🔍</span>
          <p>Aucun résultat pour "${input.value}"</p>
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
      <div class="example">💡 ${entry.example}</div>
      ${entry.tips ? `
        <div style="margin-top: 10px;">
          <strong style="font-size: 12px; color: var(--gray-500);">Conseils :</strong>
          <ul style="font-size: 12px; margin-top: 4px; padding-left: 16px; color: var(--gray-700);">
            ${entry.tips.map((t) => `<li>${t}</li>`).join('')}
          </ul>
        </div>` : ''}
    </div>
    <button class="btn btn-outline btn-sm" id="btn-glossary-back">← Tous les termes</button>`;

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
  const btn = document.getElementById('btn-send-chat');

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

  // User bubble
  container.innerHTML += `
    <div class="chat-bubble user">
      <strong>Vous</strong>
      <p>${escapeHtml(message)}</p>
    </div>`;
  container.scrollTop = container.scrollHeight;

  // Loading
  const loadingId = 'chat-loading-' + Date.now();
  container.innerHTML += `
    <div class="chat-bubble bot" id="${loadingId}">
      <strong>CyberSensei</strong>
      <p><span class="spinner" style="width:16px;height:16px;display:inline-block;"></span> Réflexion...</p>
    </div>`;
  container.scrollTop = container.scrollHeight;

  try {
    const res = await api.chatWithAI(message, chatContext);
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) {
      loadingEl.querySelector('p').innerHTML = formatChatResponse(res.response);
    }
    if (res.context) chatContext = res.context;
  } catch (err) {
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) {
      loadingEl.querySelector('p').textContent = '❌ Erreur : ' + err.message;
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
  } catch (err) {
    console.error('Progress error:', err);
    loading.classList.add('hidden');
    error.classList.remove('hidden');
  }
}

function renderProgress(p) {
  const pct = Math.round(p.progressPercentage || 0);
  const avgScore = Math.round(p.averageScore || 0);

  document.getElementById('progress-content').innerHTML = `
    <div class="progress-card" style="text-align: center;">
      <span class="level-badge">${translateLevel(p.currentLevel)}</span>
      <div class="progress-bar" style="margin-top: 12px;">
        <div class="progress-bar-fill" style="width: ${pct}%;"></div>
      </div>
      <p style="font-size: 12px; color: var(--gray-500); margin-top: 6px;">Progression globale : ${pct}%</p>
    </div>
    <div class="progress-grid">
      <div class="progress-card">
        <h4>Exercices</h4>
        <div class="value primary">${p.completedExercises || 0}</div>
        <p style="font-size: 11px; color: var(--gray-500);">sur ${p.totalExercises || 0}</p>
      </div>
      <div class="progress-card">
        <h4>Score moyen</h4>
        <div class="value ${avgScore >= 70 ? 'success' : 'primary'}">${avgScore}%</div>
      </div>
    </div>
    <div style="text-align: center; margin-top: 12px;">
      <button id="btn-progress-quiz" class="btn btn-primary">🎯 Continuer ma formation</button>
    </div>`;

  document.getElementById('btn-progress-quiz').addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach((c) => c.classList.add('hidden'));
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
    }));
  }
  if (payload.question) {
    return [{ id: 'q1', text: payload.question, options: payload.options || [] }];
  }
  return [];
}

function translateLevel(level) {
  const map = {
    BEGINNER: '🌱 Débutant',
    INTERMEDIATE: '📚 Intermédiaire',
    ADVANCED: '🚀 Avancé',
    EXPERT: '🏆 Expert',
  };
  return map[level] || level || '🌱 Débutant';
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
