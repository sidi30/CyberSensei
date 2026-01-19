import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import { Loader2, User, ShieldCheck, Send, Lightbulb, AlertTriangle, CheckCircle2, XCircle, BookOpen, ExternalLink, Play } from 'lucide-react';
import { 
  PedagogicalMedia, 
  AdviceBlock, 
  ENCOURAGEMENT_MESSAGES, 
  TOPIC_EMOJIS 
} from '../types/pedagogy';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  type: 'text' | 'course' | 'question' | 'feedback' | 'warning' | 'important' | 'joke' | 'screenshot' | 'example' | 'advice' | 'media';
  options?: string[];
  correctAnswer?: number;
  style?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'joke';
  media?: PedagogicalMedia;
  adviceBlock?: AdviceBlock;
}

// Composant pour afficher un média pédagogique
function MediaDisplay({ media }: { media: PedagogicalMedia }) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  if (media.type === 'video') {
    return (
      <div className="relative rounded-xl overflow-hidden bg-slate-900 shadow-lg my-3">
        {!isPlaying ? (
          <div 
            className="relative cursor-pointer group"
            onClick={() => setIsPlaying(true)}
          >
            <img 
              src={media.thumbnail || media.url} 
              alt={media.alt}
              className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-xl transition-transform group-hover:scale-110">
                <Play className="w-8 h-8 ml-1" />
              </div>
            </div>
          </div>
        ) : (
          <video 
            src={media.url} 
            controls 
            autoPlay 
            className="w-full"
          />
        )}
        {media.caption && (
          <p className="text-xs text-slate-400 p-2 text-center bg-slate-800">
            {media.caption}
          </p>
        )}
      </div>
    );
  }
  
  if (media.type === 'gif') {
    return (
      <div className="rounded-xl overflow-hidden shadow-lg my-3 border border-slate-200">
        <img 
          src={media.url} 
          alt={media.alt}
          className="w-full max-h-48 object-contain bg-white"
        />
        {media.caption && (
          <p className="text-xs text-slate-500 p-2 text-center bg-slate-50 border-t">
            {media.caption}
          </p>
        )}
      </div>
    );
  }
  
  // Image par défaut
  return (
    <div className="rounded-xl overflow-hidden shadow-lg my-3 border border-slate-200">
      <img 
        src={media.url} 
        alt={media.alt}
        className="w-full h-40 object-cover"
        loading="lazy"
      />
      {media.caption && (
        <p className="text-xs text-slate-600 p-2 text-center bg-slate-50 border-t flex items-center justify-center gap-1">
          <BookOpen className="w-3 h-3" />
          {media.caption}
        </p>
      )}
    </div>
  );
}

// Composant pour afficher un bloc de conseil structuré
function AdviceBlockDisplay({ advice }: { advice: AdviceBlock }) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 overflow-hidden shadow-md my-3">
      {/* Media si présent */}
      {advice.media && (
        <div className="border-b border-indigo-100">
          <MediaDisplay media={advice.media} />
        </div>
      )}
      
      <div className="p-4 space-y-3">
        {/* Concept */}
        <div className="flex items-start gap-2">
          <div className="bg-indigo-100 p-1.5 rounded-lg mt-0.5">
            <Lightbulb className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-1">
              💡 En résumé
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {advice.concept}
            </p>
          </div>
        </div>
        
        {/* Exemple concret */}
        <div className="bg-white/60 rounded-lg p-3 border-l-4 border-amber-400">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">
            📌 Exemple concret
          </p>
          <p className="text-sm text-slate-600 italic leading-relaxed">
            "{advice.example}"
          </p>
        </div>
        
        {/* Conseils actionnables */}
        <div>
          <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">
            ✅ Les bons réflexes
          </p>
          <ul className="space-y-2">
            {advice.advice.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function DailyExercise() {
  const { token } = useAuth();
  const { apiClient } = useApi(token);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(-1);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Glossaire cybersécurité simplifié
  const GLOSSARY: Record<string, string> = {
    "hameçonnage": "Phishing : email/piège pour te faire cliquer ou donner tes identifiants.",
    "phishing": "Email ou message piégé pour voler infos ou installer un malware.",
    "spear phishing": "Phishing ciblé et très personnalisé, basé sur tes infos.",
    "ransomware": "Logiciel qui chiffre tes fichiers et demande une rançon.",
    "ingénierie sociale": "Manipulation psychologique pour te pousser à l'erreur.",
    "brute force": "Essai automatique de milliers de mots de passe jusqu'à trouver le bon.",
    "credential stuffing": "Réutilisation d'un mot de passe volé sur d'autres sites.",
    "shadow it": "Outils non approuvés par l'entreprise (Dropbox perso, WhatsApp pro...).",
    "macro": "Petit programme dans Word/Excel qui peut exécuter du code dangereux.",
    "2fa": "Double authentification : un code ou une app en plus du mot de passe.",
    "malware": "Logiciel malveillant qui peut voler tes données ou endommager ton PC.",
    "vpn": "Tunnel sécurisé qui protège ta connexion internet.",
    "firewall": "Pare-feu : barrière qui filtre les connexions entrantes/sortantes."
  };

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const applyGlossary = (html: string) => {
    return Object.entries(GLOSSARY).reduce((acc, [term, desc]) => {
      const re = new RegExp(`\\b(${escapeRegExp(term)})\\b`, 'gi');
      return acc.replace(
        re,
        `<span class="inline-block" title="${desc}">
          <span class="underline decoration-dotted decoration-indigo-400">${term}</span>
          <sup class="text-[10px] bg-indigo-100 text-indigo-700 font-semibold px-1 py-0.5 rounded-full border border-indigo-200 ml-0.5">?</sup>
        </span>`
      );
    }, html);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadTodayQuiz();
  }, [apiClient]);

  useEffect(scrollToBottom, [messages]);

  const getRandomMessage = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  const loadTodayQuiz = async () => {
    if (!apiClient) return;
    try {
      setLoading(true);
      const data = await apiClient.getTodayQuiz();
      
      const questions = data.payloadJSON?.questions || [];
      const courseIntro = data.payloadJSON?.courseIntro || `Aujourd'hui, on va parler de : ${data.topic} 🎯`;
      const introMedia = data.payloadJSON?.introMedia;
      
      setQuiz({ ...data, questions, introMedia });
      setScore({ correct: 0, total: 0 });
      
      // Message d'intro avec emoji thématique
      const topicEmoji = TOPIC_EMOJIS[data.topic?.toLowerCase()] || '🛡️';
      
      setTimeout(() => {
        // Message de bienvenue personnalisé
        addBotMessage(
          `${topicEmoji} **${data.topic}**\n\n${courseIntro}`, 
          'course', 
          ["C'est compris, on y va ! 🚀"],
          undefined,
          introMedia
        );
      }, 500);

    } catch (err) {
      console.error('Error loading quiz:', err);
      addBotMessage(
        "😕 Oups ! Je n'arrive pas à charger ton coaching. Réessaye dans quelques instants.", 
        'text'
      );
    } finally {
      setLoading(false);
    }
  };

  const addBotMessage = (
    text: string, 
    type: ChatMessage['type'], 
    options?: string[], 
    style?: ChatMessage['style'],
    media?: PedagogicalMedia,
    adviceBlock?: AdviceBlock
  ) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      sender: 'bot',
      text,
      type,
      options,
      style: style || 'default',
      media,
      adviceBlock
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleUserAction = (optionIndex?: number, optionText?: string) => {
    if (!quiz) return;

    // Si session terminée
    if (sessionComplete) {
      const userMsg: ChatMessage = { 
        id: Date.now().toString(), 
        sender: 'user', 
        text: optionText || "Option sélectionnée", 
        type: 'text' 
      };
      setMessages(prev => [...prev, userMsg].map(m => ({ ...m, options: undefined })));

      if (optionText?.toLowerCase().includes('demain')) {
        addBotMessage(
          "Parfait ! 📅 À demain pour la suite de ta formation. Tu fais du super boulot ! 💪", 
          'text'
        );
        setSessionComplete(false);
      } else {
        addBotMessage(
          "Super motivation ! 🔥 Je te prépare un nouveau module...", 
          'text'
        );
        
        setTimeout(() => {
          setSessionComplete(false);
          setStepIndex(-1);
          setMessages([]);
          loadTodayQuiz();
        }, 1500);
      }
      return;
    }

    // Ajouter message utilisateur
    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      sender: 'user', 
      text: optionText || "Option sélectionnée", 
      type: 'text' 
    };
    setMessages(prev => [...prev, userMsg]);
    setMessages(prev => prev.map(m => ({ ...m, options: undefined })));

    setTimeout(() => {
      const questions = quiz.questions;

      if (stepIndex === -1) {
        // Lancer première question
        setStepIndex(0);
        const firstQ = questions[0];
        
        addBotMessage(
          "C'est parti ! 🎯 Je vais te poser quelques questions simples.", 
          'text'
        );
        
        setTimeout(() => {
          showQuestion(firstQ);
        }, 800);
        
      } else if (stepIndex < questions.length) {
        // Traiter la réponse
        const q = questions[stepIndex];
        const isCorrect = optionIndex === q.correctAnswer;
        
        // Mettre à jour le score
        setScore(prev => ({
          correct: prev.correct + (isCorrect ? 1 : 0),
          total: prev.total + 1
        }));

        // Réaction immédiate avec encouragement
        const reaction = getRandomMessage(
          isCorrect ? ENCOURAGEMENT_MESSAGES.correct : ENCOURAGEMENT_MESSAGES.incorrect
        );
        addBotMessage(
          reaction, 
          'text', 
          undefined, 
          isCorrect ? 'success' : 'danger'
        );
        
        setTimeout(() => {
          // Feedback contextuel
          const feedbackText = isCorrect ? q.feedbackCorrect : q.feedbackIncorrect;
          addBotMessage(feedbackText, 'feedback');
          
          // Afficher le bloc de conseil structuré si disponible
          setTimeout(() => {
            if (q.advice) {
              addBotMessage('', 'advice', undefined, undefined, undefined, q.advice);
            } else {
              // Fallback : afficher le keyTakeaway
              addBotMessage(
                `💡 **À retenir :** ${q.keyTakeaway}`, 
                'important'
              );
            }
            
            // Prochaine question ou fin
            setTimeout(() => {
              const nextIndex = stepIndex + 1;
              
              if (nextIndex < questions.length) {
                setStepIndex(nextIndex);
                const nextQ = questions[nextIndex];
                
                addBotMessage(
                  "Allez, question suivante ! ➡️", 
                  'text'
                );
                
                setTimeout(() => {
                  showQuestion(nextQ);
                }, 600);
                
              } else {
                // Fin du module
                finishModule();
              }
            }, 1500);
          }, 1000);
        }, 800);
      }
    }, 600);
  };

  const showQuestion = (q: any) => {
    // Afficher le contexte/mise en situation si présent
    if (q.context) {
      addBotMessage(
        `📋 **Situation :**\n${q.context}`, 
        'example',
        undefined,
        undefined,
        q.contextMedia
      );
      
      setTimeout(() => {
        addBotMessage(
          q.text, 
          'question', 
          q.options
        );
      }, 1000);
    } else {
      addBotMessage(
        q.text, 
        'question', 
        q.options
      );
    }
  };

  const finishModule = () => {
    const percentage = Math.round((score.correct / score.total) * 100);
    const isGood = percentage >= 70;
    
    addBotMessage(
      getRandomMessage(ENCOURAGEMENT_MESSAGES.completion),
      'text',
      undefined,
      'success'
    );
    
    setTimeout(() => {
      // Afficher le récap du score
      addBotMessage(
        `📊 **Ton score :** ${score.correct + 1}/${score.total + 1} (${percentage}%)\n\n${
          isGood 
            ? "🏆 Excellent ! Tu maîtrises bien ce sujet !" 
            : "📚 Continue de t'entraîner, tu progresses !"
        }`,
        'text',
        undefined,
        isGood ? 'success' : 'info'
      );
      
      setTimeout(() => {
        addBotMessage(
          `Tu veux continuer avec un autre module ou on reprend demain ? 🤔`,
          'text',
          ["Encore un module ! 🚀", "On reprend demain 📅"]
        );
        setSessionComplete(true);
      }, 1200);
    }, 1000);
    
    // Soumettre au backend
    try {
      apiClient?.submitExercise(quiz.id, [{ questionId: 'final', answer: 1 }]);
    } catch (e) {
      console.error('Error submitting:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 animate-pulse">Préparation de ton coaching...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl mx-auto border border-slate-200">
      {/* Header Pro */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-indigo-700 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">CyberSensei</h2>
            <p className="text-xs text-indigo-100 opacity-90">
              {quiz?.topic || 'Formation cybersécurité'}
            </p>
          </div>
        </div>
        
        {/* Score en temps réel */}
        {score.total > 0 && (
          <div className="bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="text-sm font-medium">
              {score.correct}/{score.total} ✨
            </span>
          </div>
        )}
      </div>

      {/* Zone de Chat */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-slate-50 to-white">
        {messages.map((m) => (
          <div 
            key={m.id} 
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex gap-3 max-w-[90%] ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                m.sender === 'bot' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}>
                {m.sender === 'bot' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              
              <div className="flex flex-col gap-2">
                {/* Bloc de conseil structuré */}
                {m.adviceBlock && (
                  <AdviceBlockDisplay advice={m.adviceBlock} />
                )}
                
                {/* Message avec média */}
                {m.media && !m.adviceBlock && (
                  <MediaDisplay media={m.media} />
                )}
                
                {/* Message texte */}
                {m.text && !m.adviceBlock && (
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    m.sender === 'bot' 
                    ? m.type === 'warning' ? 'bg-orange-50 text-orange-900 border-2 border-orange-300 rounded-tl-none' 
                    : m.type === 'important' ? 'bg-amber-50 text-amber-900 border-l-4 border-amber-400 rounded-tl-none' 
                    : m.type === 'example' ? 'bg-blue-50 text-blue-900 border-l-4 border-blue-500 rounded-tl-none'
                    : m.style === 'success' ? 'bg-green-50 text-green-900 border border-green-200 rounded-tl-none'
                    : m.style === 'danger' ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-none'
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-md'
                    : 'bg-indigo-600 text-white rounded-tr-none'
                  }`}>
                    <div 
                      className="text-[15px] leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ 
                        __html: applyGlossary(
                          m.text
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
                            .replace(/__(.*?)__/g, '<span class="bg-yellow-200 px-1 rounded">$1</span>')
                        )
                      }}
                    />
                  </div>
                )}
                
                {/* Options de réponse */}
                {m.options && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {m.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleUserAction(m.type === 'question' ? i : undefined, opt)}
                        className="bg-white hover:bg-indigo-50 text-indigo-700 border-2 border-indigo-200 hover:border-indigo-400 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
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

      {/* Footer */}
      <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
        <div className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-slate-400 text-sm flex items-center gap-2">
          <span>👆</span>
          <span>Clique sur une option ci-dessus pour répondre</span>
        </div>
        <div className="bg-slate-200 p-2.5 rounded-full">
          <Send className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </div>
  );
}

