/**
 * CyberSensei Extension v2 - API Client
 * Activation code flow: le code d'activation résout automatiquement le tenant + backend URL
 */

class CyberSenseiAPI {
  constructor() {
    this.baseUrl = '';
    this.activationCode = '';
    this.tenantId = '';
    this.userId = '';
  }

  async init() {
    const { config } = await chrome.storage.local.get('config');
    if (config) {
      this.baseUrl = config.backendUrl || '';
      this.activationCode = config.activationCode || '';
      this.tenantId = config.tenantId || '';
      this.userId = config.userId || '';
    }
  }

  get headers() {
    return {
      'Content-Type': 'application/json',
      'X-Activation-Code': this.activationCode,
      'X-Tenant-Id': this.tenantId,
    };
  }

  get isConfigured() {
    return !!this.baseUrl && !!this.activationCode && !!this.tenantId;
  }

  async request(method, path, body) {
    if (!this.isConfigured) throw new Error('Extension non configurée');

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
   * Activation par code - résout le tenant et l'URL backend
   * Le code est au format CS-XXXXXXXX, résolu via un endpoint public
   */
  async activate(code) {
    // Résoudre via le backend central
    // En prod: cs-api.gwani.fr, en dev: localhost:3006
    const resolveUrl = this.baseUrl || 'https://cs-api.gwani.fr';

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
    // data = { backendUrl, tenantId, tenantName, userId, userName }

    this.baseUrl = data.backendUrl;
    this.activationCode = code;
    this.tenantId = data.tenantId;
    this.userId = data.userId || '';

    await chrome.storage.local.set({
      config: {
        backendUrl: data.backendUrl,
        activationCode: code,
        tenantId: data.tenantId,
        tenantName: data.tenantName || '',
        userId: data.userId || '',
        userName: data.userName || '',
      },
    });

    return data;
  }

  // Quiz du jour
  async getTodayQuiz() {
    return this.request('GET', `/api/extension/quiz/today?userId=${encodeURIComponent(this.userId || 'ext-user')}&tenantId=${encodeURIComponent(this.tenantId)}`);
  }

  // Soumettre les réponses
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

  // Déconnexion
  async logout() {
    this.baseUrl = '';
    this.activationCode = '';
    this.tenantId = '';
    this.userId = '';
    await chrome.storage.local.remove(['config', 'gamification', 'lastQuizDate']);
  }
}

const api = new CyberSenseiAPI();
export default api;
