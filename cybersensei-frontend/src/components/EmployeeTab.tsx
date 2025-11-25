import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import {
  Exercise,
  UserExerciseResult,
  SubmitExerciseRequest,
  AIChatResponse,
} from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const EmployeeTab: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Exercise state
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<UserExerciseResult | null>(null);
  const [startTime] = useState(Date.now());

  // AI Chat state
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ from: 'user' | 'ai'; text: string }>>([]);

  // User stats
  const [lastQuizDate, setLastQuizDate] = useState<string>('Aucun');
  const [globalScore, setGlobalScore] = useState<number>(0);

  useEffect(() => {
    loadTodayQuiz();
    // In production, fetch user stats from backend
    setGlobalScore(75); // Mock data
  }, []);

  const loadTodayQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const quiz = await apiService.getTodayQuiz();
      setExercise(quiz);
    } catch (err: any) {
      console.error('Failed to load quiz:', err);
      setError(err.response?.data?.message || 'Impossible de charger le quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExercise = async () => {
    if (!exercise || selectedAnswer === null) {
      return;
    }

    try {
      setSubmitting(true);
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const isCorrect = selectedAnswer === exercise.payloadJSON.correctAnswer;
      const score = isCorrect ? 100 : 0;

      const submission: SubmitExerciseRequest = {
        score,
        success: isCorrect,
        duration,
        detailsJSON: {
          selectedAnswer,
          correctAnswer: exercise.payloadJSON.correctAnswer,
        },
      };

      const submissionResult = await apiService.submitExercise(exercise.id, submission);
      setResult(submissionResult);
      setLastQuizDate(new Date().toLocaleDateString('fr-FR'));
    } catch (err: any) {
      console.error('Failed to submit exercise:', err);
      setError(err.response?.data?.message || 'Échec de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;

    const userMessage = aiQuestion;
    setAiMessages((prev) => [...prev, { from: 'user', text: userMessage }]);
    setAiQuestion('');
    setAiLoading(true);

    try {
      const response: AIChatResponse = await apiService.chatWithAI({
        prompt: userMessage,
        context: 'cybersecurity training',
      });

      setAiMessages((prev) => [...prev, { from: 'ai', text: response.response }]);
    } catch (err: any) {
      console.error('AI chat failed:', err);
      setAiMessages((prev) => [
        ...prev,
        { from: 'ai', text: "Désolé, je n'ai pas pu traiter votre question." },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-success-100 text-success-800';
      case 'INTERMEDIATE':
        return 'bg-primary-100 text-primary-800';
      case 'ADVANCED':
        return 'bg-yellow-100 text-yellow-800';
      case 'EXPERT':
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'Débutant';
      case 'INTERMEDIATE':
        return 'Intermédiaire';
      case 'ADVANCED':
        return 'Avancé';
      case 'EXPERT':
        return 'Expert';
      default:
        return difficulty;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header with user info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'Utilisateur'}</h1>
            <p className="text-gray-600">{user?.email}</p>
            {user?.department && (
              <p className="text-sm text-gray-500">{user.department}</p>
            )}
          </div>
        </div>
      </div>

      {/* CyberSensei Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Votre statut CyberSensei
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-primary-50 rounded-lg p-4">
            <p className="text-sm text-primary-600 font-medium">Dernier quiz</p>
            <p className="text-2xl font-bold text-primary-900 mt-1">{lastQuizDate}</p>
          </div>
          <div className="bg-success-50 rounded-lg p-4">
            <p className="text-sm text-success-600 font-medium">Score global</p>
            <p className="text-2xl font-bold text-success-900 mt-1">{globalScore}%</p>
          </div>
        </div>
      </div>

      {/* Today's Exercise */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Exercice du jour
        </h2>

        {loading && <LoadingSpinner message="Chargement de l'exercice..." />}
        {error && <ErrorMessage message={error} onRetry={loadTodayQuiz} />}

        {!loading && !error && exercise && !result && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                  exercise.difficulty
                )}`}
              >
                {getDifficultyLabel(exercise.difficulty)}
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-700 font-medium">{exercise.topic}</span>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {exercise.payloadJSON.question}
              </h3>

              <div className="space-y-3">
                {exercise.payloadJSON.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(index)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedAnswer === index
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300 bg-white'
                    }`}
                  >
                    <span className="font-medium text-gray-900">{option}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleSubmitExercise}
                disabled={selectedAnswer === null || submitting}
                className="mt-6 w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {submitting ? 'Envoi en cours...' : 'Soumettre ma réponse'}
              </button>
            </div>
          </div>
        )}

        {result && exercise && (
          <div className="space-y-4">
            <div
              className={`rounded-lg p-6 ${
                result.success
                  ? 'bg-success-50 border-2 border-success-200'
                  : 'bg-danger-50 border-2 border-danger-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`text-xl font-bold ${
                    result.success ? 'text-success-800' : 'text-danger-800'
                  }`}
                >
                  {result.success ? '✅ Bonne réponse !' : '❌ Réponse incorrecte'}
                </h3>
                <span
                  className={`text-3xl font-bold ${
                    result.success ? 'text-success-600' : 'text-danger-600'
                  }`}
                >
                  {result.score}%
                </span>
              </div>

              {exercise.payloadJSON.explanation && (
                <div className="bg-white rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Explication :</p>
                  <p className="text-gray-900">{exercise.payloadJSON.explanation}</p>
                </div>
              )}

              {!result.success && (
                <div className="mt-4 bg-white rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Bonne réponse :</p>
                  <p className="text-gray-900">
                    {exercise.payloadJSON.options[exercise.payloadJSON.correctAnswer]}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setResult(null);
                setSelectedAnswer(null);
                loadTodayQuiz();
              }}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Prochain exercice
            </button>
          </div>
        )}
      </div>

      {/* Ask CyberSensei */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          💬 Posez une question à CyberSensei
        </h2>

        <div className="space-y-4">
          {/* Chat messages */}
          {aiMessages.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto space-y-3">
              {aiMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      msg.from === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                    <LoadingSpinner size="sm" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <div className="flex space-x-3">
            <textarea
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAskAI();
                }
              }}
              placeholder="Posez votre question sur la cybersécurité..."
              rows={3}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            <button
              onClick={handleAskAI}
              disabled={!aiQuestion.trim() || aiLoading}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-6 rounded-lg transition-colors"
            >
              Demander
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTab;


