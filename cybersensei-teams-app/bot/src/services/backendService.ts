/**
 * Service pour les appels au backend CyberSensei
 * Version améliorée avec gestion des réponses et progression
 */

import axios, { AxiosInstance } from 'axios';
import { config } from '../config';

export interface Quiz {
  id: string;
  title?: string;
  description?: string;
  questions: Question[];
  topic: string;
  difficulty: string;
  payloadJSON?: {
    courseIntro?: string;
    introMedia?: {
      type: string;
      url: string;
      alt: string;
      caption?: string;
    };
    questions?: EnrichedQuestion[];
  };
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  context?: string;
  contextMedia?: {
    type: string;
    url: string;
    alt: string;
  };
}

export interface EnrichedQuestion extends Question {
  advice?: {
    concept: string;
    example: string;
    advice: string[];
    media?: {
      type: string;
      url: string;
      alt: string;
    };
  };
  keyTakeaway?: string;
}

export interface SubmitAnswersRequest {
  score?: number;
  success?: boolean;
  duration?: number;
  detailsJSON: {
    answers: { questionId: string; answer: number }[];
  };
}

export interface SubmitAnswersResponse {
  id: number;
  score: number;
  maxScore: number;
  success: boolean;
  feedback: string;
  correct?: number;
  total?: number;
}

export interface ChatRequest {
  message: string;
  context?: string;
}

export interface ChatResponse {
  response: string;
  context?: string;
}

export interface User {
  id: string;
  email?: string;
  displayName?: string;
  name?: string;
  role: 'USER' | 'MANAGER' | 'ADMIN';
  department?: string;
  jobTitle?: string;
}

export interface ManagerMetrics {
  companyScore: number;
  averageScore: number;
  totalUsers: number;
  activeUsers: number;
  completedExercises: number;
}

export interface UserProgress {
  userId: number;
  completedExercises: number;
  totalExercises: number;
  progressPercentage: number;
  averageScore: number;
  currentLevel: string;
}

export interface ExerciseHistory {
  id: number;
  exerciseId: number;
  title: string;
  score: number;
  maxScore: number;
  success: boolean;
  date: string;
}

export interface GlossaryEntry {
  term: string;
  definition: string;
  example: string;
  category: string;
  relatedTerms: string[];
  aliases: string[];
}

/**
 * Service pour communiquer avec le backend CyberSensei
 */
export class BackendService {
  private client: AxiosInstance;

  constructor(baseURL: string = config.backendBaseUrl) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour logger les requêtes
    this.client.interceptors.request.use((reqConfig) => {
      console.log(`[Backend] ${reqConfig.method?.toUpperCase()} ${reqConfig.url}`);
      return reqConfig;
    });

    // Intercepteur pour logger les erreurs
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[Backend] Error:', error.message);
        if (error.response) {
          console.error('[Backend] Status:', error.response.status);
          console.error('[Backend] Data:', JSON.stringify(error.response.data));
        }
        throw error;
      }
    );
  }

  /**
   * Récupère le quiz du jour (exclut automatiquement les exercices déjà faits)
   */
  async getTodayQuiz(userId?: string): Promise<Quiz> {
    const response = await this.client.get('/api/quiz/today', {
      params: { userId },
    });

    // Le backend retourne un ExerciseDto, on le transforme en Quiz
    const exercise = response.data;
    const payload = exercise.payloadJSON || {};
    
    // Support pour l'ancien format (question unique) et nouveau format (questions array)
    let questions: Question[] = [];
    
    if (payload.questions && Array.isArray(payload.questions)) {
      // Nouveau format avec tableau de questions
      questions = payload.questions.map((q: any, index: number) => ({
        id: q.id || `q${index + 1}`,
        text: q.text || q.question || '',
        options: q.options || [],
        context: q.context,
        contextMedia: q.contextMedia,
      }));
    } else if (payload.question) {
      // Ancien format avec une seule question
      questions = [{
        id: 'q1',
        text: payload.question,
        options: payload.options || [],
      }];
    }

    // Traduire le topic si nécessaire
    const topicTranslations: Record<string, string> = {
      'Phishing Recognition': 'Reconnaissance du phishing',
      'Password Security': 'Sécurité des mots de passe',
    };

    const translatedTopic = topicTranslations[exercise.topic] || exercise.topic;

    return {
      id: String(exercise.id),
      title: payload.courseIntro?.substring(0, 50) || translatedTopic,
      description: payload.courseIntro || this.getDefaultCourseIntro(translatedTopic),
      topic: translatedTopic,
      difficulty: exercise.difficulty,
      questions,
      payloadJSON: payload,
    };
  }

  /**
   * Génère une introduction par défaut basée sur le sujet
   */
  private getDefaultCourseIntro(topic: string): string {
    const intros: Record<string, string> = {
      'Reconnaissance du phishing': 'Apprenez à identifier les emails frauduleux et protégez-vous contre les tentatives de phishing.',
      'Sécurité des mots de passe': 'Découvrez les bonnes pratiques pour créer et gérer des mots de passe robustes.',
    };
    return intros[topic] || `Formation sur le thème : ${topic}`;
  }

  /**
   * Soumet les réponses à un exercice
   * Le backend calcule le score côté serveur
   */
  async submitExercise(
    exerciseId: string,
    answers: { questionId: string; answer: number }[]
  ): Promise<SubmitAnswersResponse> {
    const request: SubmitAnswersRequest = {
      detailsJSON: { answers },
    };

    const response = await this.client.post<SubmitAnswersResponse>(
      `/api/exercise/${exerciseId}/submit`,
      request
    );

    return response.data;
  }

  /**
   * Récupère la progression de l'utilisateur
   */
  async getUserProgress(): Promise<UserProgress> {
    const response = await this.client.get<UserProgress>('/api/user/progress');
    return response.data;
  }

  /**
   * Récupère l'historique des exercices
   */
  async getExerciseHistory(): Promise<ExerciseHistory[]> {
    const response = await this.client.get<ExerciseHistory[]>('/api/exercises/history');
    return response.data;
  }

  /**
   * Communique avec le chatbot IA
   */
  async chatWithAI(message: string, context?: string): Promise<ChatResponse> {
    const response = await this.client.post<ChatResponse>('/api/ai/chat', {
      message,
      context,
    });
    return response.data;
  }

  /**
   * Récupère les informations utilisateur
   */
  async getUser(userId: string): Promise<User> {
    const response = await this.client.get<User>('/api/user/me', {
      params: { userId },
    });
    return response.data;
  }

  /**
   * Récupère les métriques pour les managers
   */
  async getManagerMetrics(): Promise<ManagerMetrics> {
    const response = await this.client.get<ManagerMetrics>('/api/manager/metrics');
    return response.data;
  }

  /**
   * Recherche un terme dans le glossaire
   */
  async searchGlossary(term: string): Promise<GlossaryEntry | null> {
    try {
      const response = await this.client.get<GlossaryEntry>('/api/glossary/search', {
        params: { term },
      });
      return response.data;
    } catch (error) {
      // Terme non trouvé
      return null;
    }
  }

  /**
   * Récupère tous les termes du glossaire
   */
  async getAllGlossaryTerms(): Promise<Record<string, GlossaryEntry>> {
    const response = await this.client.get<Record<string, GlossaryEntry>>('/api/glossary/all');
    return response.data;
  }

  /**
   * Récupère les termes liés à un terme donné
   */
  async getRelatedTerms(term: string): Promise<GlossaryEntry[]> {
    const response = await this.client.get<GlossaryEntry[]>(`/api/glossary/related/${term}`);
    return response.data;
  }
}

// Instance singleton
export const backendService = new BackendService();

