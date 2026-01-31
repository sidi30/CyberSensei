export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'USER' | 'MANAGER' | 'ADMIN';
  department?: string;
  jobTitle?: string;
}

export interface GraphUser {
  id: string;
  displayName: string;
  mail: string;
  jobTitle?: string;
  department?: string;
  userPrincipalName: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  topic: string;
  difficulty: string;
  dueDate?: string;
  payloadJSON?: {
    questions?: Question[];
    courseIntro?: string;
    introMedia?: {
      type: 'image' | 'gif' | 'video' | 'lottie';
      url: string;
      alt: string;
      caption?: string;
      thumbnail?: string;
    };
  };
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer?: number;
}

export interface ExerciseHistory {
  id: string;
  exerciseId: string;
  title: string;
  score: number;
  maxScore: number;
  completedAt: string;
  topic: string;
}

export interface SubmitAnswersResponse {
  score: number;
  maxScore: number;
  correct: number;
  total: number;
  feedback: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

