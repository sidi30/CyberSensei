/**
 * Google Analytics 4 — Measurement Protocol pour Chrome Extension MV3
 *
 * Configuration dans les parametres de l'extension :
 *   GA4 Measurement ID = "G-XXXXXXXXXX"
 *   GA4 API Secret = "xxxxxxxx"
 *
 * Ces valeurs sont NON-secretes (cote client).
 */

const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';

let _clientId = null;

async function getClientId() {
  if (_clientId) return _clientId;
  const { ga4ClientId } = await chrome.storage.local.get('ga4ClientId');
  if (ga4ClientId) { _clientId = ga4ClientId; return _clientId; }
  _clientId = crypto.randomUUID?.() || `${Date.now()}.${Math.random().toString(36).slice(2)}`;
  await chrome.storage.local.set({ ga4ClientId: _clientId });
  return _clientId;
}

async function getGAConfig() {
  const { config } = await chrome.storage.local.get('config');
  return {
    measurementId: config?.gaMeasurementId || '',
    apiSecret: config?.gaApiSecret || '',
  };
}

export async function sendGA4Event(eventName, params = {}) {
  try {
    const { measurementId, apiSecret } = await getGAConfig();
    if (!measurementId || !apiSecret) return;
    const clientId = await getClientId();
    fetch(`${GA_ENDPOINT}?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        events: [{ name: eventName, params: { engagement_time_msec: '100', ...params } }],
      }),
    }).catch(() => {});
  } catch { /* non-bloquant */ }
}

export const ga4 = {
  sessionStart: (mode) => sendGA4Event('session_start', { mode }),
  tabSwitch: (tab) => sendGA4Event('tab_switch', { tab_name: tab }),
  quizComplete: (topic, score, level) => sendGA4Event('quiz_complete', { topic, score: String(score), level: String(level) }),
  glossaryView: (term) => sendGA4Event('glossary_view', { term }),
  chatMessage: () => sendGA4Event('chat_message'),
  dlpAnalyze: (aiTool, riskLevel, blocked) => sendGA4Event('dlp_analyze', { ai_tool: aiTool, risk_level: riskLevel, blocked: String(blocked) }),
  activation: (tenantId) => sendGA4Event('activation', { tenant_id: tenantId }),
  themeChange: (mode, accent) => sendGA4Event('theme_change', { mode, accent }),
};
