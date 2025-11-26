'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Clock, BookOpen, User, Bot, CheckCircle } from 'lucide-react';
import { useStudySessionStore } from '@/store/useStudySessionStore';

interface OralMessage {
  id: string;
  role: 'professor' | 'student';
  content: string;
  timestamp: Date;
}

interface OralExamSectionProps {
  docContext: string;
  authToken?: string;
  targetLanguage?: string;
  onBack?: () => void;
  onCreditsUpdate?: (newCredits: number) => void;
  documentId?: string;
}

const OralExamSection: React.FC<OralExamSectionProps> = ({ 
  docContext, 
  authToken, 
  targetLanguage = 'Italiano',
  onBack,
  onCreditsUpdate,
  documentId
}) => {
  // Use store for oral exam state persistence
  const { examState, updateExamOralState } = useStudySessionStore();
  
  // Local states for UI
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [isCheckingFirstTime, setIsCheckingFirstTime] = useState(true);
  
  // IMPORTANTE: Non mostrare "GRATIS" mentre stiamo controllando
  const shouldShowAsFirstTime = isFirstTime === true && !isCheckingFirstTime;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Derived state from store
  const examStatus = examState.oral.currentStep === 'idle' ? 'not_started' :
                    examState.oral.currentStep === 'questioning' ? 'in_progress' : 'finished';
  const messages: OralMessage[] = examState.oral.turns.map((turn, index) => [
    {
      id: `professor-${index}`,
      role: 'professor' as const,
      content: turn.question,
      timestamp: new Date()
    },
    {
      id: `student-${index}`,
      role: 'student' as const, 
      content: turn.userAnswer,
      timestamp: new Date()
    }
  ]).flat();

  // Timer effect
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive]);

  // Auto scroll to latest message (only when new messages arrive)
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }, 100);
    }
  }, [messages.length]);

  // Function to check if it's first time oral exam
  const checkFirstTime = async () => {
    if (!authToken) {
      console.log('🔍 [CRITICAL_DEBUG] checkFirstTime: No authToken, returning early');
      setIsCheckingFirstTime(false);
      return;
    }
    
    console.log('🔍 [CRITICAL_DEBUG] checkFirstTime: Starting API call...');
    setIsCheckingFirstTime(true);
    
    try {
      console.log('🔍 [CRITICAL_DEBUG] checkFirstTime: Making fetch request...');
      const response = await fetch('/api/oral-exam/check-first-time', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [CRITICAL_DEBUG] checkFirstTime API response:', data);
        
        // Controlla se la risposta contiene un errore
        if (data.error) {
          console.error('🔍 [CRITICAL_DEBUG] checkFirstTime API returned error:', data.message);
          // Non impostare nulla in caso di errore, lascia il valore precedente
          return;
        }
        
        console.log('✅ [CRITICAL_DEBUG] About to set isFirstTime to:', data.isFirstTime);
        setIsFirstTime(data.isFirstTime);
        console.log('✅ [CRITICAL_DEBUG] setIsFirstTime called with:', data.isFirstTime);
      } else {
        console.error('🔍 [CRITICAL_DEBUG] checkFirstTime: API response not ok:', response.status);
        // Non impostare a false di default in caso di errore
      }
    } catch (error) {
      console.error('🔍 [CRITICAL_DEBUG] checkFirstTime error:', error);
      // Non impostare a false di default in caso di errore
    } finally {
      setIsCheckingFirstTime(false);
      console.log('🔍 [CRITICAL_DEBUG] checkFirstTime completed');
    }
  };

  // Check if it's first time oral exam SOLO al login, non ad ogni documento
  useEffect(() => {
    checkFirstTime();
  }, [authToken]); // Solo quando cambia authToken (login/logout), NON per ogni documento

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addMessage = (content: string, role: 'professor' | 'student') => {
    if (role === 'professor') {
      // Start a new turn with the professor's question
      const newTurn = {
        question: content,
        userAnswer: '',
        evaluation: '',
        score: 0
      };
      updateExamOralState({
        turns: [...examState.oral.turns, newTurn]
      });
    } else {
      // Update the last turn with the student's answer
      const turns = [...examState.oral.turns];
      if (turns.length > 0) {
        turns[turns.length - 1].userAnswer = content;
        updateExamOralState({ turns });
      }
    }
  };

  const startExam = async () => {
    if (!authToken || !docContext) return;
    
    console.log('[DEBUG_ORAL_START]', { documentId, authToken: !!authToken });
    
    setIsLoading(true);
    updateExamOralState({ currentStep: 'questioning' });
    setTimerActive(true);
    
    try {
      const response = await fetch('/api/oral-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          docContext,
          action: 'start',
          targetLanguage,
          documentId
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔥 Oral Exam Start Response:', data);
        addMessage(data.response, 'professor');
        
        // Aggiorna i crediti se forniti
        if (data.newCreditBalance !== undefined && onCreditsUpdate) {
          console.log('🔥 Updating credits from', data.newCreditBalance);
          onCreditsUpdate(data.newCreditBalance);
        } else {
          console.log('🔥 No newCreditBalance in response or no onCreditsUpdate callback');
        }

        // Mostra messaggio se era gratis o a pagamento
        if (data.was_free) {
          console.log('🎉 First oral exam - FREE!');
        } else {
          console.log(`💳 Oral exam charged: ${data.creditsUsed || 25} credits`);
        }
        
        // SEMPRE ricontrolla dal server dopo aver usato l'esame per aggiornare UI
        console.log('🔄 [CRITICAL_DEBUG] About to recheck first-time status after exam usage');
        console.log('🔄 [CRITICAL_DEBUG] Current isFirstTime state BEFORE recheck:', isFirstTime);
        
        // Aggiorna subito lo stato locale per feedback immediato
        setIsFirstTime(false);
        console.log('🔄 [CRITICAL_DEBUG] Set isFirstTime to false locally');
        
        try {
          // WORKAROUND: Aspetta che la transazione si committa nel database
          console.log('🔄 [CRITICAL_DEBUG] Waiting 2 seconds for database transaction to commit...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Ricontrolla dal server per stato definitivo  
          console.log('🔄 [CRITICAL_DEBUG] Calling checkFirstTime...');
          await checkFirstTime();
          console.log('🔄 [CRITICAL_DEBUG] checkFirstTime completed');
        } catch (recheckError) {
          console.error('🔄 [CRITICAL_DEBUG] Error in checkFirstTime after exam:', recheckError);
        }
      } else {
        throw new Error('Failed to start exam');
      }
    } catch (error) {
      console.error('Error starting oral exam:', error);
      addMessage('Mi dispiace, si è verificato un errore. Riprova più tardi.', 'professor');
    } finally {
      setIsLoading(false);
    }
  };

  const sendAnswer = async () => {
    if (!userAnswer.trim() || isLoading || !authToken) return;

    const currentAnswer = userAnswer;
    setUserAnswer('');
    addMessage(currentAnswer, 'student');
    setIsLoading(true);

    try {
      const response = await fetch('/api/oral-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          docContext,
          action: 'evaluate',
          userAnswer: currentAnswer,
          documentId,
          sessionHistory: messages.map(msg => ({
            role: msg.role === 'professor' ? 'assistant' : 'user',
            content: msg.content
          })),
          targetLanguage
        })
      });

      if (response.ok) {
        const data = await response.json();
        addMessage(data.response, 'professor');
        // Aggiorna i crediti se forniti
        if (data.newCreditBalance !== undefined && onCreditsUpdate) {
          onCreditsUpdate(data.newCreditBalance);
        }
      } else {
        throw new Error('Failed to get professor response');
      }
    } catch (error) {
      console.error('Error sending answer:', error);
      addMessage('Mi dispiace, si è verificato un errore tecnico.', 'professor');
    } finally {
      setIsLoading(false);
    }
  };

  const finishExam = async () => {
    setIsLoading(true);
    setTimerActive(false);
    
    try {
      const response = await fetch('/api/oral-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          docContext,
          action: 'finish',
          documentId,
          sessionHistory: messages.map(msg => ({
            role: msg.role === 'professor' ? 'assistant' : 'user',
            content: msg.content
          })),
          targetLanguage
        })
      });

      if (response.ok) {
        const data = await response.json();
        addMessage(data.response, 'professor');
        updateExamOralState({ currentStep: 'completed' });
        // Aggiorna i crediti se forniti
        if (data.newCreditBalance !== undefined && onCreditsUpdate) {
          onCreditsUpdate(data.newCreditBalance);
        }
      }
    } catch (error) {
      console.error('Error finishing exam:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetExam = () => {
    updateExamOralState({
      currentStep: 'idle',
      turns: []
    });
    setUserAnswer('');
    setTimer(0);
    setTimerActive(false);
    
    // IMPORTANTE: Ricontrolla se è la prima volta dopo aver resettato
    console.log('🔄 Resetting exam and checking first-time status...');
    checkFirstTime();
  };

  if (!docContext || !authToken) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-500/20 backdrop-blur-sm p-6 rounded-2xl border border-red-500/30">
          <Mic className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-300 mb-2">
            Modalità Orale Non Disponibile
          </h3>
          <p className="text-red-200 text-sm">
            Elabora prima un documento e assicurati di essere autenticato.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">🎤 Modalità Orale</h4>
            <p className="text-gray-400 text-sm">Simulazione esame orale con professore AI</p>
          </div>
        </div>

        {/* Timer and Status */}
        <div className="flex items-center gap-4">
          {examStatus === 'in_progress' && (
            <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-lg border border-red-500/30">
              <Clock className="w-4 h-4 text-red-300" />
              <span className="text-red-300 font-mono text-sm">{formatTime(timer)}</span>
            </div>
          )}
          
          <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
            examStatus === 'not_started' ? 'bg-gray-500/20 text-gray-300' :
            examStatus === 'in_progress' ? 'bg-orange-500/20 text-orange-300' :
            'bg-green-500/20 text-green-300'
          }`}>
            {examStatus === 'not_started' ? 'Non iniziato' :
             examStatus === 'in_progress' ? 'In corso' : 'Completato'}
          </div>
        </div>
      </div>

      {examStatus === 'not_started' ? (
        /* Start Screen */
        <div className="text-center space-y-6">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 rounded-xl border border-blue-500/30">
            <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Pronto per l'Esame Orale?</h3>
            <p className="text-gray-300 leading-relaxed">
              Il professore AI ti farà domande basate sul documento che hai caricato. 
              Rispondi come in un vero esame universitario. L'AI valuterà le tue risposte 
              e adatterà la difficoltà delle domande.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <h4 className="font-semibold text-purple-300 mb-2">📝 Come funziona</h4>
              <p className="text-gray-400">Domande basate sul tuo documento, valutazione in tempo reale</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <h4 className="font-semibold text-blue-300 mb-2">⏱️ Senza fretta</h4>
              <p className="text-gray-400">Prendi tutto il tempo necessario per rispondere</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <h4 className="font-semibold text-green-300 mb-2">🎯 Feedback</h4>
              <p className="text-gray-400">Ricevi valutazioni costruttive su ogni risposta</p>
            </div>
          </div>

          <button
            onClick={startExam}
            disabled={isLoading}
            className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-red-700 hover:to-pink-700 font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.05] disabled:opacity-50"
          >
            {isLoading ? '🔄 Preparando...' : (
              <div className="text-center">
                <div className="font-bold">🚀 Inizia Esame Orale</div>
                <div className="text-sm opacity-75">
                  {isCheckingFirstTime 
                    ? 'Verificando...' 
                    : shouldShowAsFirstTime 
                      ? 'GRATIS' 
                      : '25 crediti'
                  }
                </div>
              </div>
            )}
          </button>
          
        </div>
      ) : (
        /* Exam Interface */
        <div className="space-y-6">
          {/* Messages */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'student' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                    message.role === 'student' 
                      ? 'bg-blue-500 text-white ml-auto'
                      : 'bg-red-500/20 text-red-100 border border-red-500/30'
                  }`}>
                    <div className="flex items-start gap-3">
                      {message.role === 'professor' && (
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {message.role === 'student' && (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 order-1">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`flex-1 ${message.role === 'student' ? 'order-0' : ''}`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white animate-pulse" />
                      </div>
                      <span className="text-red-200 text-sm">Il professore sta valutando...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          {examStatus === 'in_progress' && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Scrivi la tua risposta qui..."
                      className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none min-h-[80px]"
                      disabled={isLoading}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          sendAnswer();
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={sendAnswer}
                    disabled={!userAnswer.trim() || isLoading}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white p-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex justify-center items-center mt-3 text-xs text-gray-400">
                  <span>Ctrl+Invio per inviare • Risposte GRATIS</span>
                </div>
              </div>

              {/* Exam Control Buttons */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-4">
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={resetExam}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    🔄 Azzera Esame
                  </button>
                  <button
                    onClick={resetExam}
                    disabled={isLoading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    🔄 Ricomincia Esame Orale
                  </button>
                  <button
                    onClick={finishExam}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    ⏹️ Termina Esame
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Final Results */}
          {examStatus === 'finished' && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-6 rounded-xl border border-green-500/30">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <h3 className="text-lg font-bold text-green-300">Esame Orale Completato!</h3>
                  <p className="text-green-200 text-sm">Durata totale: {formatTime(timer)}</p>
                </div>
              </div>
              
              <button
                onClick={resetExam}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 font-medium transition-all duration-300"
              >
                Nuovo Esame Orale
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OralExamSection;