import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { useApi } from '../hooks/useApi';
import { Send, Loader2, Shield, Sparkles, Trophy, TrendingUp } from 'lucide-react';
import type { Quiz, SubmitAnswersResponse } from '../types';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'quiz' | 'result' | 'welcome';
  content?: string;
  quiz?: Quiz;
  result?: SubmitAnswersResponse;
  timestamp: Date;
}

export function ConversationView() {
  const { token } = useAuth();
  const { userData } = useUserData();
  const { apiClient } = useApi(token);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Map<string, number>>(new Map());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Message de bienvenue au chargement
  useEffect(() => {
    if (userData && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        type: 'welcome',
        content: `Bonjour ${userData.displayName || 'Utilisateur'} ! 👋`,
        timestamp: new Date(),
      }]);
    }
  }, [userData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !apiClient) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = input.trim().toLowerCase();
    setInput('');
    setLoading(true);

    try {
      // Détection des intentions
      if (messageText.includes('quiz') || messageText.includes('exercice') || messageText.includes('entraînement')) {
        await handleQuizRequest();
      } else if (messageText.includes('score') || messageText.includes('progression') || messageText.includes('résultats')) {
        await handleScoreRequest();
      } else {
        await handleChatMessage(userMessage.content);
      }
    } catch (err) {
      console.error('Error:', err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizRequest = async () => {
    if (!apiClient) return;

    try {
      const quiz = await apiClient.getTodayQuiz();
      setCurrentQuiz(quiz);
      setQuizAnswers(new Map());

      const quizMessage: Message = {
        id: Date.now().toString(),
        type: 'quiz',
        quiz,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, quizMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Aucun quiz disponible pour le moment. Revenez plus tard !',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleScoreRequest = async () => {
    const scoreMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `📊 **Votre progression**\n\nScore actuel: ${userData?.score || 0} points\nNiveau: ${userData?.level || 'Débutant'}\n\nContinuez à vous entraîner pour progresser !`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, scoreMessage]);
  };

  const handleChatMessage = async (message: string) => {
    if (!apiClient) return;

    try {
      const response = await apiClient.chatWithAI(message);
      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      throw err;
    }
  };

  const handleQuizSubmit = async (quiz: Quiz) => {
    if (!apiClient || quizAnswers.size !== quiz.questions.length) return;

    setLoading(true);
    try {
      const answersArray = Array.from(quizAnswers.entries()).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      const result = await apiClient.submitExercise(quiz.id, answersArray);
      
      const resultMessage: Message = {
        id: Date.now().toString(),
        type: 'result',
        result,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, resultMessage]);
      setCurrentQuiz(null);
      setQuizAnswers(new Map());
    } catch (err) {
      console.error('Error submitting quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CyberSensei</h1>
                <p className="text-sm text-gray-600">Votre assistant en cybersécurité</p>
              </div>
            </div>
            {userData && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{userData.displayName}</p>
                  <p className="text-xs text-gray-500">{userData.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  {userData.displayName?.charAt(0) || 'U'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {message.type === 'welcome' && (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-100">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{message.content}</h2>
                    <p className="text-gray-600">
                      Je suis là pour vous aider à renforcer vos compétences en cybersécurité.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <button
                      onClick={() => handleQuickAction('Commencer un quiz')}
                      className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition-all border border-blue-200"
                    >
                      <Trophy className="w-8 h-8 text-indigo-600 mb-2" />
                      <span className="font-semibold text-gray-900">Quiz du jour</span>
                      <span className="text-xs text-gray-600 mt-1">Testez vos connaissances</span>
                    </button>

                    <button
                      onClick={() => handleQuickAction('Voir ma progression')}
                      className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-all border border-green-200"
                    >
                      <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                      <span className="font-semibold text-gray-900">Ma progression</span>
                      <span className="text-xs text-gray-600 mt-1">Suivez vos résultats</span>
                    </button>

                    <button
                      onClick={() => handleQuickAction('Qu\'est-ce que le phishing ?')}
                      className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all border border-purple-200"
                    >
                      <Sparkles className="w-8 h-8 text-purple-600 mb-2" />
                      <span className="font-semibold text-gray-900">Poser une question</span>
                      <span className="text-xs text-gray-600 mt-1">Apprenez avec l'IA</span>
                    </button>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                    <p className="text-sm text-gray-700 text-center">
                      💡 <strong>Astuce :</strong> Tapez simplement votre question ou demandez un quiz pour commencer !
                    </p>
                  </div>
                </div>
              )}

              {message.type === 'user' && (
                <div className="flex justify-end">
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-sm px-6 py-3 max-w-[80%] shadow-lg">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs text-indigo-200 mt-2">
                      {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )}

              {message.type === 'assistant' && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-tl-sm px-6 py-4 max-w-[80%] shadow-md border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {message.type === 'quiz' && message.quiz && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl px-6 py-6 max-w-[90%] shadow-lg border border-indigo-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{message.quiz.title}</h3>
                        <p className="text-sm text-gray-600">{message.quiz.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-6">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {message.quiz.topic}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                        {message.quiz.difficulty}
                      </span>
                    </div>

                    <div className="space-y-6">
                      {message.quiz.questions.map((question, index) => (
                        <div key={question.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-3">
                            Question {index + 1}: {question.text}
                          </h4>
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <label
                                key={optionIndex}
                                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                  quizAnswers.get(question.id) === optionIndex
                                    ? 'border-indigo-600 bg-indigo-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${question.id}`}
                                  value={optionIndex}
                                  checked={quizAnswers.get(question.id) === optionIndex}
                                  onChange={() => {
                                    const newAnswers = new Map(quizAnswers);
                                    newAnswers.set(question.id, optionIndex);
                                    setQuizAnswers(newAnswers);
                                  }}
                                  className="w-4 h-4 text-indigo-600"
                                />
                                <span className="ml-3 text-gray-900">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleQuizSubmit(message.quiz!)}
                      disabled={loading || quizAnswers.size !== message.quiz.questions.length}
                      className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                      {loading ? 'Envoi en cours...' : 'Valider mes réponses'}
                    </button>
                  </div>
                </div>
              )}

              {message.type === 'result' && message.result && (
                <div className="flex justify-start">
                  <div className={`rounded-2xl px-6 py-6 max-w-[80%] shadow-lg border-2 ${
                    message.result.score >= message.result.maxScore * 0.8
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                      : message.result.score >= message.result.maxScore * 0.6
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
                      : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300'
                  }`}>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="text-5xl">
                        {message.result.score >= message.result.maxScore * 0.8 ? '🎉' : 
                         message.result.score >= message.result.maxScore * 0.6 ? '👍' : '💪'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {message.result.score >= message.result.maxScore * 0.8 ? 'Excellent travail !' :
                           message.result.score >= message.result.maxScore * 0.6 ? 'Bon travail !' : 'Continuez vos efforts !'}
                        </h3>
                        <p className="text-gray-700">
                          Vous avez obtenu <strong>{message.result.correct}</strong> bonne{message.result.correct > 1 ? 's' : ''} réponse{message.result.correct > 1 ? 's' : ''} sur {message.result.total}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900">{message.result.score}</div>
                        <div className="text-sm text-gray-600">/ {message.result.maxScore}</div>
                      </div>
                    </div>

                    {message.result.feedback && (
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="text-sm text-gray-800">{message.result.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-6 py-4 shadow-md border border-gray-200">
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                  <span className="text-sm text-gray-600">CyberSensei réfléchit...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Tapez votre message... (Entrée pour envoyer)"
              className="w-full px-6 py-4 pr-14 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-0 resize-none text-gray-900 placeholder-gray-400"
              rows={1}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

