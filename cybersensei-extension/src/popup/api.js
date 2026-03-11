/**
 * CyberSensei Extension - API Client
 * Communique avec le backend CyberSensei (même API que le bot Teams)
 */

class CyberSenseiAPI {
  constructor() {
    this.baseUrl = '';
    this.licenseKey = '';
  }

  async init() {
    const { config } = await chrome.storage.local.get('config');
    if (config) {
      this.baseUrl = config.backendUrl || '';
      this.licenseKey = config.licenseKey || '';
    }
  }

  get headers() {
    return {
      'Content-Type': 'application/json',
      'X-License-Key': this.licenseKey,
    };
  }

  get isConfigured() {
    return !!this.baseUrl && !!this.licenseKey;
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

  // Quiz du jour
  async getTodayQuiz(userId) {
    return this.request('GET', `/api/quiz/today?userId=${encodeURIComponent(userId || 'extension-user')}`);
  }

  // Soumettre les réponses
  async submitExercise(exerciseId, answers) {
    return this.request('POST', `/api/exercise/${exerciseId}/submit`, {
      detailsJSON: { answers },
    });
  }

  // Progression utilisateur
  async getUserProgress() {
    return this.request('GET', '/api/user/progress');
  }

  // Chat IA
  async chatWithAI(message, context) {
    return this.request('POST', '/api/ai/chat', { message, context });
  }

  // Glossaire
  async searchGlossary(term) {
    return this.request('GET', `/api/glossary/search?term=${encodeURIComponent(term)}`);
  }
}

const api = new CyberSenseiAPI();
export default api;
