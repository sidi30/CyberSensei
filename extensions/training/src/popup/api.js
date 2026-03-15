/**
 * CyberSensei Extension v2 - API Client
 *
 * Deux modes :
 * - Community (defaut) : pas de code d'activation, fonctionnalites locales
 * - Enterprise : code d'activation, backend dedie, progression serveur
 */

// ── CONFIG ──
const DEFAULTS = {
  requireActivation: false,       // false = mode communaute (tout est accessible)
  backendUrl: 'https://cs-api.gwani.fr',
  telemetryUrl: 'https://cs-api.gwani.fr',
};

class CyberSenseiAPI {
  constructor() {
    this.baseUrl = '';
    this.activationCode = '';
    this.tenantId = '';
    this.userId = '';
    this.requireActivation = DEFAULTS.requireActivation;
    this._sessionId = crypto.randomUUID?.() || Date.now().toString(36);
  }

  async init() {
    const { config } = await chrome.storage.local.get('config');
    if (config) {
      this.baseUrl = config.backendUrl || '';
      this.activationCode = config.activationCode || '';
      this.tenantId = config.tenantId || '';
      this.userId = config.userId || '';
      this.requireActivation = config.requireActivation ?? DEFAULTS.requireActivation;
    }
  }

  get headers() {
    const h = { 'Content-Type': 'application/json' };
    if (this.activationCode) h['X-Activation-Code'] = this.activationCode;
    if (this.tenantId) h['X-Tenant-Id'] = this.tenantId;
    return h;
  }

  /**
   * En mode community (requireActivation=false), l'extension est toujours "configuree"
   * meme sans code d'activation. Les appels API echoueront silencieusement
   * et le contenu local (glossaire, gamification) fonctionne quand meme.
   */
  get isConfigured() {
    if (!this.requireActivation) return true;
    return !!this.baseUrl && !!this.activationCode && !!this.tenantId;
  }

  /** True si un backend est disponible (URL configuree, avec ou sans tenant) */
  get hasBackend() {
    return !!this.baseUrl;
  }

  async request(method, path, body) {
    if (!this.hasBackend) {
      throw new Error('Backend non configure — fonctionnement local uniquement');
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `Erreur ${res.status}`);
    }

    return res.json();
  }

  /**
   * Activation par code — resout le tenant et l'URL backend.
   * Apres activation, le mode passe en enterprise.
   */
  async activate(code) {
    const resolveUrl = this.baseUrl || DEFAULTS.backendUrl;

    const res = await fetch(`${resolveUrl}/api/extension/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activationCode: code }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Code d'activation invalide");
    }

    const data = await res.json();

    if (!data.backendUrl || !data.tenantId) {
      throw new Error('Reponse du serveur invalide — backendUrl ou tenantId manquant');
    }

    this.baseUrl = data.backendUrl;
    this.activationCode = code;
    this.tenantId = data.tenantId;
    this.userId = data.userId || '';

    await chrome.storage.local.set({
      config: {
        ...((await chrome.storage.local.get('config')).config || {}),
        backendUrl: data.backendUrl,
        activationCode: code,
        tenantId: data.tenantId,
        tenantName: data.tenantName || '',
        userId: data.userId || '',
        userName: data.userName || '',
        requireActivation: true,
      },
    });

    // Tracker l'activation
    this.track('activation', { tenantId: data.tenantId });

    return data;
  }

  // Quiz du jour
  async getTodayQuiz() {
    return this.request('GET', `/api/extension/quiz/today?userId=${encodeURIComponent(this.userId || 'ext-user')}&tenantId=${encodeURIComponent(this.tenantId)}`);
  }

  // Soumettre les reponses
  async submitExercise(exerciseId, answers) {
    return this.request('POST', `/api/extension/exercise/${exerciseId}/submit`, {
      userId: this.userId,
      tenantId: this.tenantId,
      answers,
    });
  }

  // Progression utilisateur
  async getUserProgress() {
    return this.request('GET', `/api/extension/user/progress?userId=${encodeURIComponent(this.userId || 'ext-user')}&tenantId=${encodeURIComponent(this.tenantId)}`);
  }

  // Chat IA
  async chatWithAI(message, context) {
    return this.request('POST', '/api/extension/ai/chat', {
      message,
      context,
      userId: this.userId,
      tenantId: this.tenantId,
    });
  }

  // Glossaire
  async searchGlossary(term) {
    return this.request('GET', `/api/extension/glossary/search?term=${encodeURIComponent(term)}&tenantId=${encodeURIComponent(this.tenantId)}`);
  }

  // Deconnexion
  async logout() {
    this.track('logout');
    this.baseUrl = '';
    this.activationCode = '';
    this.tenantId = '';
    this.userId = '';
    await chrome.storage.local.remove(['config', 'gamification', 'lastQuizDate', 'telemetry']);
  }

  // ══════════════════════════════════════════════
  // TELEMETRIE ANONYME
  // ══════════════════════════════════════════════

  /**
   * Enregistre un evenement de telemetrie.
   * Les events sont stockes localement et envoyes en batch toutes les 5 minutes.
   * Aucune donnee personnelle n'est collectee — tout est anonyme.
   */
  async track(event, data = {}) {
    try {
      const { telemetry } = await chrome.storage.local.get('telemetry');
      const events = telemetry?.events || [];

      events.push({
        e: event,
        d: data,
        t: Date.now(),
        s: this._sessionId,
      });

      // Garder max 200 events en local
      const trimmed = events.slice(-200);
      await chrome.storage.local.set({ telemetry: { events: trimmed } });
    } catch {
      // Telemetrie non-bloquante
    }
  }

  /**
   * Envoie les events accumules vers le backend.
   * Appele par le background script toutes les 5 minutes.
   */
  async flushTelemetry() {
    try {
      const { telemetry, config } = await chrome.storage.local.get(['telemetry', 'config']);
      const events = telemetry?.events || [];
      if (events.length === 0) return;

      const url = config?.backendUrl || config?.telemetryUrl || DEFAULTS.telemetryUrl;
      if (!url) return;

      const payload = {
        extensionVersion: '2.0.0',
        sessionId: this._sessionId,
        tenantId: config?.tenantId || 'community',
        mode: config?.requireActivation ? 'enterprise' : 'community',
        events,
        sentAt: new Date().toISOString(),
      };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      await fetch(`${url}/api/extension/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));

      // Vider les events envoyes
      await chrome.storage.local.set({ telemetry: { events: [] } });
    } catch {
      // Echec silencieux — on reessaie au prochain flush
    }
  }
}

const api = new CyberSenseiAPI();
export default api;
