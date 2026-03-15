/**
 * CyberSensei Extension v2 - Background Service Worker
 * Gere : Side Panel, notifications quiz, analyse DLP
 */

const ALARM_NAME = 'cybersensei-daily-quiz';
const TELEMETRY_ALARM = 'cybersensei-telemetry';

// ── Side Panel : ouvrir au clic sur l'icone ──
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// ── Installation / Startup ──
chrome.runtime.onInstalled.addListener(() => {
  setupDailyAlarm();
  setupTelemetryAlarm();
  // Initialiser la config DLP par defaut si absente
  chrome.storage.local.get('config', (result) => {
    const cfg = result.config || {};
    if (!cfg.dlpUrl) {
      chrome.storage.local.set({
        config: { ...cfg, dlpUrl: 'https://cs-dlp.gwani.fr', dlpEnabled: true },
      });
    }
  });
  trackEvent('extension_installed', { version: '2.0.0' });
});

chrome.runtime.onStartup.addListener(() => {
  setupDailyAlarm();
  setupTelemetryAlarm();
  trackEvent('extension_started');
});

// ── Alarmes ──
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) checkAndNotify();
  if (alarm.name === TELEMETRY_ALARM) flushTelemetry();
});

function setupTelemetryAlarm() {
  chrome.alarms.get(TELEMETRY_ALARM, (existing) => {
    if (!existing) {
      chrome.alarms.create(TELEMETRY_ALARM, { periodInMinutes: 5 });
    }
  });
}

chrome.notifications.onClicked.addListener(() => {
  chrome.sidePanel.open({ windowId: undefined });
});

function setupDailyAlarm() {
  chrome.alarms.get(ALARM_NAME, (existing) => {
    if (!existing) {
      const now = new Date();
      const next = new Date();
      next.setHours(9, 0, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      chrome.alarms.create(ALARM_NAME, {
        when: next.getTime(),
        periodInMinutes: 24 * 60,
      });
    }
  });
}

async function checkAndNotify() {
  const { config } = await chrome.storage.local.get('config');
  if (!config?.backendUrl) return;

  const today = new Date().toISOString().split('T')[0];
  const { lastQuizDate } = await chrome.storage.local.get('lastQuizDate');
  if (lastQuizDate === today) return;

  chrome.notifications.create('daily-quiz', {
    type: 'basic',
    iconUrl: 'src/assets/icon-128.png',
    title: '🛡️ CyberSensei - Défi du jour',
    message: 'Ton exercice quotidien t\'attend ! Gagne des XP et maintiens ta série.',
    priority: 2,
  });
}

// ── Analyse DLP : intercepte les messages du content script ──
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANALYZE_PROMPT') {
    analyzePrompt(message.payload)
      .then(sendResponse)
      .catch((err) => {
        console.warn('[CyberSensei] DLP backend indisponible, blocage par securite:', err.message);
        sendResponse({
          riskLevel: 'HIGH',
          riskScore: 0,
          blocked: true,
          detections: [],
          recommendation: "Le service d'analyse est indisponible. Par sécurité, l'envoi est bloqué jusqu'à ce que le service soit rétabli.",
        });
      });
    return true; // garder le canal ouvert pour la reponse async
  }

  if (message.type === 'GET_DLP_STATUS') {
    chrome.storage.local.get('config', (result) => {
      const cfg = result.config || {};
      sendResponse({ enabled: cfg.dlpEnabled !== false, dlpUrl: cfg.dlpUrl || '' });
    });
    return true;
  }
});

async function analyzePrompt({ prompt, aiTool, sourceUrl }) {
  const { config } = await chrome.storage.local.get('config');
  const cfg = config || {};

  if (cfg.dlpEnabled === false) {
    return { riskLevel: 'SAFE', riskScore: 0, blocked: false };
  }

  const dlpUrl = cfg.dlpUrl || 'https://cs-dlp.gwani.fr';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${dlpUrl}/api/extension/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        aiTool,
        companyId: cfg.companyId || 1,
        userId: cfg.userId || cfg.activationCode || 'unknown',
        sourceUrl,
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const result = await response.json();

    // Tracker l'analyse DLP (anonymise — pas le contenu du prompt)
    trackEvent('dlp_analyze', {
      aiTool,
      riskLevel: result.riskLevel,
      riskScore: result.riskScore,
      blocked: result.blocked || false,
      detectionsCount: result.detections?.length || 0,
    });

    return result;
  } finally {
    clearTimeout(timeout);
  }
}

// ── Telemetrie anonyme ──────────────────────────────────────────

/** Enregistre un event en local (sera flush toutes les 5 min) */
async function trackEvent(event, data = {}) {
  try {
    const { telemetry } = await chrome.storage.local.get('telemetry');
    const events = (telemetry?.events || []).slice(-200);
    events.push({ e: event, d: data, t: Date.now() });
    await chrome.storage.local.set({ telemetry: { events } });
  } catch {
    // Non-bloquant
  }
}

/** Envoie les events accumules vers le backend central */
async function flushTelemetry() {
  try {
    const { telemetry, config } = await chrome.storage.local.get(['telemetry', 'config']);
    const events = telemetry?.events || [];
    if (events.length === 0) return;

    const url = config?.backendUrl || config?.telemetryUrl || 'https://cs-api.gwani.fr';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    await fetch(`${url}/api/extension/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        extensionVersion: '2.0.0',
        tenantId: config?.tenantId || 'community',
        mode: config?.requireActivation ? 'enterprise' : 'community',
        events,
        sentAt: new Date().toISOString(),
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    await chrome.storage.local.set({ telemetry: { events: [] } });
  } catch {
    // Echec silencieux — on reessaie dans 5 min
  }
}
