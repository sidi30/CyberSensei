/**
 * Google Analytics 4 — Measurement Protocol pour Chrome Extension MV3
 *
 * En Manifest V3, on ne peut PAS charger gtag.js (bloque par CSP).
 * On utilise le Measurement Protocol : un simple POST HTTP vers GA4.
 *
 * Configuration :
 *   GA_MEASUREMENT_ID = "G-XXXXXXXXXX" (depuis GA4 > Admin > Data Streams)
 *   GA_API_SECRET = "xxxxxxxx" (depuis GA4 > Admin > Data Streams > Measurement Protocol API secrets)
 *
 * Ces valeurs sont NON-secretes (cote client), elles peuvent etre dans le code.
 * Pour les changer sans rebuild : les lire depuis chrome.storage.
 */

const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';

// ── A CONFIGURER : remplace par tes vraies valeurs GA4 ──
const DEFAULT_MEASUREMENT_ID = ''; // Ex: 'G-ABC123XYZ'
const DEFAULT_API_SECRET = '';     // Ex: 'aBcDeFgHiJ'

let _clientId = null;

/**
 * Recupere ou genere un client_id persistant (equivalent au cookie GA).
 */
async function getClientId() {
  if (_clientId) return _clientId;

  const { ga4ClientId } = await chrome.storage.local.get('ga4ClientId');
  if (ga4ClientId) {
    _clientId = ga4ClientId;
    return _clientId;
  }

  _clientId = crypto.randomUUID?.() || `${Date.now()}.${Math.random().toString(36).slice(2)}`;
  await chrome.storage.local.set({ ga4ClientId: _clientId });
  return _clientId;
}

/**
 * Recupere la config GA4 (depuis storage ou defaut).
 * Permet de changer le Measurement ID sans rebuild.
 */
async function getGAConfig() {
  const { config } = await chrome.storage.local.get('config');
  return {
    measurementId: config?.gaMeasurementId || DEFAULT_MEASUREMENT_ID,
    apiSecret: config?.gaApiSecret || DEFAULT_API_SECRET,
  };
}

/**
 * Envoie un event GA4 via le Measurement Protocol.
 *
 * @param {string} eventName - Nom de l'event (ex: 'quiz_complete', 'dlp_block')
 * @param {Object} params - Parametres de l'event (max 25 params, valeurs string/number)
 */
export async function sendGA4Event(eventName, params = {}) {
  try {
    const { measurementId, apiSecret } = await getGAConfig();

    // Si pas configure, on skip silencieusement
    if (!measurementId || !apiSecret) return;

    const clientId = await getClientId();

    const body = {
      client_id: clientId,
      events: [
        {
          name: eventName,
          params: {
            engagement_time_msec: '100',
            ...params,
          },
        },
      ],
    };

    // Fire-and-forget, pas de await sur le resultat
    fetch(
      `${GA_ENDPOINT}?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    ).catch(() => {
      // Silencieux — GA4 est non-critique
    });
  } catch {
    // Jamais bloquer l'extension pour de l'analytics
  }
}

/**
 * Raccourci pour les events courants.
 */
export const ga4 = {
  /** Extension ouverte */
  sessionStart: (mode) => sendGA4Event('session_start', { mode }),

  /** Onglet change */
  tabSwitch: (tab) => sendGA4Event('tab_switch', { tab_name: tab }),

  /** Quiz termine */
  quizComplete: (topic, score, level) =>
    sendGA4Event('quiz_complete', { topic, score: String(score), level: String(level) }),

  /** Terme de glossaire consulte */
  glossaryView: (term) => sendGA4Event('glossary_view', { term }),

  /** Message envoye au coach IA */
  chatMessage: () => sendGA4Event('chat_message'),

  /** Analyse DLP effectuee */
  dlpAnalyze: (aiTool, riskLevel, blocked) =>
    sendGA4Event('dlp_analyze', {
      ai_tool: aiTool,
      risk_level: riskLevel,
      blocked: String(blocked),
    }),

  /** Activation par code */
  activation: (tenantId) => sendGA4Event('activation', { tenant_id: tenantId }),

  /** Theme change */
  themeChange: (mode, accent) => sendGA4Event('theme_change', { mode, accent }),
};
