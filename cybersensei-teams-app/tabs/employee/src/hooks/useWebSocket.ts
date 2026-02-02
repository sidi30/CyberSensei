import { useEffect, useRef, useState, useCallback } from 'react';
import { config } from '../config';

export interface ProgressEvent {
  type: 'USER_PROGRESS' | 'COMPANY_METRICS' | 'EXERCISE_COMPLETE' | 'LEADERBOARD_UPDATE' | 'PONG';
  timestamp?: number;
  [key: string]: unknown;
}

export interface UserProgressEvent extends ProgressEvent {
  type: 'USER_PROGRESS';
  userId: number;
  userName: string;
  score: number;
  maxScore: number;
  topic: string;
}

export interface ExerciseCompleteEvent extends ProgressEvent {
  type: 'EXERCISE_COMPLETE';
  score: number;
  maxScore: number;
  feedback: string;
}

export interface CompanyMetricsEvent extends ProgressEvent {
  type: 'COMPANY_METRICS';
  data: {
    companyScore: number;
    averageScore: number;
    totalUsers: number;
    activeUsers: number;
    completedExercises: number;
  };
}

interface UseWebSocketOptions {
  userId?: number;
  role?: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  onProgress?: (event: UserProgressEvent) => void;
  onExerciseComplete?: (event: ExerciseCompleteEvent) => void;
  onMetrics?: (event: CompanyMetricsEvent) => void;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const { userId, role, onProgress, onExerciseComplete, onMetrics } = options;
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const wsUrl = config.backendBaseUrl.replace('http', 'ws') + '/ws/progress';
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setConnected(true);
        setError(null);
        console.log('WebSocket connected');

        // Register user
        if (userId && role) {
          ws.send(JSON.stringify({
            type: 'REGISTER',
            userId,
            role,
          }));
        }

        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as ProgressEvent;

          switch (data.type) {
            case 'USER_PROGRESS':
              onProgress?.(data as UserProgressEvent);
              break;
            case 'EXERCISE_COMPLETE':
              onExerciseComplete?.(data as ExerciseCompleteEvent);
              break;
            case 'COMPANY_METRICS':
              onMetrics?.(data as CompanyMetricsEvent);
              break;
            case 'PONG':
              // Heartbeat response, ignore
              break;
            default:
              console.log('Unknown WebSocket event:', data.type);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket error:', e);
        setError('Connexion WebSocket interrompue');
      };

      ws.onclose = () => {
        setConnected(false);
        console.log('WebSocket disconnected');

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }

        // Attempt reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting WebSocket reconnect...');
          connect();
        }, 5000);
      };

      wsRef.current = ws;
    } catch (e) {
      console.error('Failed to create WebSocket:', e);
      setError('Impossible de se connecter au serveur temps reel');
    }
  }, [userId, role, onProgress, onExerciseComplete, onMetrics]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    connected,
    error,
    reconnect: connect,
    disconnect,
  };
}
