import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import type { Quiz, SubmitAnswersResponse } from '../types';
import { BookOpen, CheckCircle, Loader2, Calendar } from 'lucide-react';

export function TodayExerciseSection() {
  const { token } = useAuth();
  const { apiClient } = useApi(token);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());
  const [result, setResult] = useState<SubmitAnswersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTodayQuiz();
  }, [apiClient]);

  const loadTodayQuiz = async () => {
    if (!apiClient) return;

    try {
      setLoading(true);
      setError(null);
      const quizData = await apiClient.getTodayQuiz();
      setQuiz(quizData);
    } catch (err) {
      console.error('Error loading quiz:', err);
      setError('Aucun quiz disponible pour aujourd\'hui');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, answerIndex);
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!quiz || !apiClient) return;

    try {
      setSubmitting(true);
      const answersArray = Array.from(answers.entries()).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      const response = await apiClient.submitExercise(quiz.id, answersArray);
      setResult(response);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Erreur lors de la soumission du quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
      case 'facile':
        return 'bg-green-100 text-green-800';
      case 'medium':
      case 'moyen':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
      case 'difficile':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">{error || 'Aucun quiz disponible pour aujourd\'hui'}</p>
          <p className="text-sm text-gray-500 mt-2">Revenez demain pour un nouveau challenge !</p>
        </div>
      </div>
    );
  }

  const questions = quiz.questions ?? [];

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Exercice du jour
            </h2>
            <p className="text-sm text-gray-600">{quiz.title}</p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
            {quiz.difficulty}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {quiz.topic}
          </span>
        </div>
      </div>

      {quiz.description && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">{quiz.description}</p>
        </div>
      )}

      {!result ? (
        <>
          <div className="space-y-6 mb-6">
            {questions.map((question, index) => (
              <div key={question.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Question {index + 1}: {question.text}
                </h3>
                <div className="space-y-2">
                  {(question.options ?? []).map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        answers.get(question.id) === optionIndex
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={optionIndex}
                        checked={answers.get(question.id) === optionIndex}
                        onChange={() => handleAnswerChange(question.id, optionIndex)}
                        className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="ml-3 text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting || answers.size !== quiz.questions.length}
              className="btn-primary flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Soumettre les réponses</span>
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className={`p-6 rounded-lg border-2 ${
            result.score >= result.maxScore * 0.8
              ? 'bg-green-50 border-green-200'
              : result.score >= result.maxScore * 0.6
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  result.score >= result.maxScore * 0.8
                    ? 'bg-green-100'
                    : result.score >= result.maxScore * 0.6
                    ? 'bg-yellow-100'
                    : 'bg-red-100'
                }`}>
                  <span className="text-2xl">
                    {result.score >= result.maxScore * 0.8 ? '🎉' : result.score >= result.maxScore * 0.6 ? '👍' : '💪'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Quiz terminé !
                  </h3>
                  <p className="text-sm text-gray-600">
                    Vous avez obtenu {result.correct} bonne{result.correct > 1 ? 's' : ''} réponse{result.correct > 1 ? 's' : ''} sur {result.total}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {result.score}
                </div>
                <div className="text-sm text-gray-600">/ {result.maxScore}</div>
              </div>
            </div>
            
            {result.feedback && (
              <div className="mt-4 p-4 bg-white rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Feedback :</h4>
                <p className="text-gray-700">{result.feedback}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setResult(null);
              setAnswers(new Map());
              loadTodayQuiz();
            }}
            className="btn-secondary w-full"
          >
            Nouveau quiz
          </button>
        </div>
      )}
    </div>
  );
}

