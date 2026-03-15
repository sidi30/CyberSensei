/**
 * CyberSensei AI Security - Service Worker (Background)
 *
 * Gère la communication entre le content script et l'API backend,
 * ainsi que la configuration persistante.
 */

const DEFAULT_CONFIG = {
  apiUrl: "https://cs-dlp.gwani.fr",
  trainingApiUrl: "https://cs-api.gwani.fr",
  companyId: 1,
  userId: 1,
  enabled: true,
};

// Initialise la config au premier install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("config", (result) => {
    if (!result.config) {
      chrome.storage.sync.set({ config: DEFAULT_CONFIG });
    }
  });
});

// Écoute les messages du content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ANALYZE_PROMPT") {
    analyzePrompt(message.payload)
      .then(sendResponse)
      .catch((err) => {
        console.warn("[CyberSensei] Backend unavailable, fail-closed:", err.message);
        sendResponse({
          riskLevel: "HIGH",
          riskScore: 0,
          blocked: true,
          detections: [],
          recommendation: "Le service d'analyse est indisponible. Par sécurité, l'envoi est bloqué jusqu'à ce que le service soit rétabli.",
        });
      });
    return true; // keep channel open for async response
  }

  if (message.type === "GET_CONFIG") {
    chrome.storage.sync.get("config", (result) => {
      sendResponse(result.config || DEFAULT_CONFIG);
    });
    return true;
  }
});

/**
 * Appelle l'API CyberSensei pour analyser un prompt.
 */
async function analyzePrompt({ prompt, aiTool, sourceUrl }) {
  const { config } = await chrome.storage.sync.get("config");
  const cfg = config || DEFAULT_CONFIG;

  if (!cfg.enabled) {
    return { riskLevel: "SAFE", riskScore: 0, blocked: false };
  }

  const response = await fetch(`${cfg.apiUrl}/api/extension/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      aiTool,
      companyId: cfg.companyId,
      userId: cfg.userId,
      sourceUrl,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
