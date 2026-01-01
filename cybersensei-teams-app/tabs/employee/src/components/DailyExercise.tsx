import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import { Loader2, User, ShieldCheck, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  type: 'text' | 'course' | 'question' | 'feedback' | 'warning' | 'important' | 'joke' | 'screenshot' | 'example';
  options?: string[];
  correctAnswer?: number;
  style?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'joke';
}

export function DailyExercise() {
  const { token } = useAuth();
  const { apiClient } = useApi(token);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(-1); // -1: Intro, >=0: Questions
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadTodayQuiz();
  }, [apiClient]);

  useEffect(scrollToBottom, [messages]);

  const loadTodayQuiz = async () => {
    if (!apiClient) return;
    try {
      setLoading(true);
      const data = await apiClient.getTodayQuiz();
      
      // Extraction des données du payload
      const questions = data.payloadJSON?.questions || [];
      const courseIntro = data.payloadJSON?.courseIntro || `Aujourd'hui, nous allons explorer le thème : ${data.topic}.`;
      
      setQuiz({ ...data, questions });
      
      // Démarrage de la conversation
      setTimeout(() => {
        addBotMessage(courseIntro, 'course', ["C'est compris, passons à l'exercice !"]);
      }, 500);

    } catch (err) {
      console.error('Error loading quiz:', err);
      addBotMessage("Désolé, je n'ai pas pu charger ton coaching aujourd'hui. Réessaye plus tard.", 'text');
    } finally {
      setLoading(false);
    }
  };

  const addBotMessage = (text: string, type: ChatMessage['type'], options?: string[], style?: ChatMessage['style']) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      sender: 'bot',
      text,
      type,
      options,
      style: style || 'default'
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleUserAction = (optionIndex?: number, optionText?: string) => {
    if (!quiz) return;

    // Ajouter le message de l'utilisateur au chat
    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      sender: 'user', 
      text: optionText || "Option sélectionnée", 
      type: 'text' 
    };
    setMessages(prev => [...prev, userMsg]);

    // Masquer les options du message précédent pour éviter les clics multiples
    setMessages(prev => prev.map(m => ({ ...m, options: undefined })));

    setTimeout(() => {
      const questions = quiz.questions;

      if (stepIndex === -1) {
        // Fin de l'intro, on lance la première question
        setStepIndex(0);
        const firstQ = questions[0];
        
        // Petit message de transition sympa
        addBotMessage("Allez, c'est parti ! 🚀 Prépare-toi, je vais te mettre en situation...", 'text');
        
        setTimeout(() => {
          // Message contexte si présent
          if (firstQ.context) {
            addBotMessage(firstQ.context, 'example');
            setTimeout(() => {
              addBotMessage(firstQ.text, 'question', firstQ.options);
            }, 800);
          } else {
            addBotMessage(firstQ.text, 'question', firstQ.options);
          }
        }, 600);
      } else if (stepIndex < questions.length) {
        // Réponse à une question
        const q = questions[stepIndex];
        const isCorrect = optionIndex === q.correctAnswer;

        // Réaction immédiate (courte et fun)
        const reactions = isCorrect 
          ? ["Bien joué ! 👏", "Exactement ! 🎯", "Tu gères ! 💪", "Bingo ! ✨"]
          : ["Oups... 😬", "Presque ! 😅", "Pas tout à fait... 🤔", "Hmm... 🧐"];
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
        addBotMessage(randomReaction, 'text', undefined, isCorrect ? 'success' : 'danger');
        
        // Feedback détaillé
        setTimeout(() => {
          addBotMessage(isCorrect ? q.feedbackCorrect : q.feedbackIncorrect, 'feedback');
          
          // Exemple concret si présent
          if (q.concreteExample) {
            setTimeout(() => {
              addBotMessage(q.concreteExample, 'example');
            }, 800);
          }
          
          // Takeaway important
          setTimeout(() => {
            addBotMessage(`💡 **À RETENIR** : ${q.keyTakeaway}`, 'important');
            
            const nextIndex = stepIndex + 1;
            setTimeout(() => {
              if (nextIndex < questions.length) {
                setStepIndex(nextIndex);
                const nextQ = questions[nextIndex];
                
                // Transition sympa
                const transitions = [
                  "Allez, on enchaîne ! 🔥",
                  "Prêt pour la suite ? Let's go ! 💨",
                  "Encore un petit effort ! 🎯",
                  "Tu te débrouilles bien ! On continue ? 😎"
                ];
                const randomTransition = transitions[Math.floor(Math.random() * transitions.length)];
                addBotMessage(randomTransition, 'text');
                
                setTimeout(() => {
                  if (nextQ.context) {
                    addBotMessage(nextQ.context, 'example');
                    setTimeout(() => {
                      addBotMessage(nextQ.text, 'question', nextQ.options);
                    }, 800);
                  } else {
                    addBotMessage(nextQ.text, 'question', nextQ.options);
                  }
                }, 600);
              } else {
                // Fin du parcours - message fun et encourageant
                const endMessages = [
                  "🎉 **GG !** Tu as terminé ta session du jour !",
                  "🏆 **Champion !** Session bouclée avec succès !",
                  "⭐ **Bravo !** T'es de plus en plus fort !",
                  "🔥 **Top !** Encore une session dans la poche !"
                ];
                const randomEnd = endMessages[Math.floor(Math.random() * endMessages.length)];
                addBotMessage(randomEnd, 'text', undefined, 'success');
                
                setTimeout(() => {
                  addBotMessage(`Tu es maintenant un peu plus blindé contre les ${quiz.topic} ! 🛡️\n\nÀ demain pour une nouvelle aventure ! 👋`, 'text');
                }, 1000);
                
                // Envoi des résultats au backend
                try {
                  apiClient.submitExercise(quiz.id, [{ questionId: 'final', answer: 1 }]);
                } catch (e) {
                  console.error('Error submitting:', e);
                }
              }
            }, 1500);
          }, 1200);
        }, 800);
      }
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 animate-pulse">Préparation de ton coach...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl mx-auto border border-slate-200">
      {/* Header Professionnel */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 p-5 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-indigo-700 rounded-full"></div>
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">CyberSensei Coach</h2>
            <p className="text-xs text-indigo-100 opacity-90">Formation conversationnelle active</p>
          </div>
        </div>
      </div>

      {/* Zone de Chat */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                m.sender === 'bot' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}>
                {m.sender === 'bot' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className="flex flex-col gap-2">
                {/* Message avec styles variés selon le type */}
                <div className={`p-4 rounded-2xl shadow-sm ${
                  m.sender === 'bot' 
                  ? m.type === 'warning' ? 'bg-orange-50 text-orange-900 border-2 border-orange-300 rounded-tl-none' 
                  : m.type === 'important' ? 'bg-red-50 text-red-900 border-2 border-red-400 rounded-tl-none font-semibold' 
                  : m.type === 'joke' ? 'bg-purple-50 text-purple-900 border border-purple-200 rounded-tl-none italic'
                  : m.type === 'screenshot' ? 'bg-slate-100 text-slate-900 border-2 border-slate-300 rounded-lg font-mono text-sm p-3'
                  : m.type === 'example' ? 'bg-blue-50 text-blue-900 border-l-4 border-blue-500 rounded-tl-none'
                  : m.style === 'success' ? 'bg-green-50 text-green-900 border border-green-200 rounded-tl-none'
                  : m.style === 'danger' ? 'bg-red-50 text-red-800 border border-red-300 rounded-tl-none'
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                  : 'bg-indigo-600 text-white rounded-tr-none'
                }`}>
                  <div 
                    className="text-[15px] leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ 
                      __html: m.text
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
                        .replace(/__(.*?)__/g, '<span class="bg-yellow-200 px-1 rounded">$1</span>')
                        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 underline font-semibold" target="_blank">$1</a>')
                    }}
                  />
                </div>
                
                {/* Options de réponse sous forme de bulles cliquables */}
                {m.options && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {m.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleUserAction(m.type === 'question' ? i : undefined, opt)}
                        className="bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-sm"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer / Input Simulé */}
      <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
        <div className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-slate-400 text-sm">
          Sélectionne une option ci-dessus pour répondre...
        </div>
        <div className="bg-slate-200 p-2 rounded-full">
          <Send className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
