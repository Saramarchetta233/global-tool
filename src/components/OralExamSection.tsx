'use client';

import { BookOpen, Bot, CheckCircle,Clock, Mic, Send, User } from 'lucide-react';
import React, { useEffect,useRef, useState } from 'react';

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
  isUltra?: boolean;
}

const OralExamSection: React.FC<OralExamSectionProps> = ({
  docContext,
  authToken,
  targetLanguage = 'Italiano',
  onBack,
  onCreditsUpdate,
  documentId,
  isUltra = false
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
  
  // Speech recognition states
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  
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

  // Speech recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for speech recognition support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setSpeechSupported(true);
        
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = targetLanguage === 'Italiano' ? 'it-IT' : 
                          targetLanguage === 'Inglese' ? 'en-US' :
                          targetLanguage === 'Spagnolo' ? 'es-ES' :
                          targetLanguage === 'Francese' ? 'fr-FR' : 'it-IT';
        
        recognition.onstart = () => {
          setIsRecording(true);
          setIsListening(true);
        };
        
        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            setUserAnswer(prev => prev + finalTranscript);
          }
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsRecording(false);
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
      } else {
        console.log('Speech recognition not supported');
        setSpeechSupported(false);
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [targetLanguage]);

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
          documentId,
          isUltra
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
      addMessage('Mi dispiace, si è verificato un errore. Riprova più tardi.\n\n💡 In caso di errori, aggiorna la pagina e riprova. Se il problema persiste contattaci a support@becoolpro.co', 'professor');
    } finally {
      setIsLoading(false);
    }
  };

  // Speech recognition functions
  const startListening = () => {
    if (recognitionRef.current && speechSupported && !isRecording) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isRecording) {
      stopListening();
    } else {
      startListening();
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
      addMessage('Mi dispiace, si è verificato un errore tecnico.\n\n💡 In caso di errori, aggiorna la pagina e riprova. Se il problema persiste contattaci a support@becoolpro.co', 'professor');
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
    <div className="md:bg-white/5 md:rounded-2xl md:p-6 md:border md:border-white/10 w-full">
      <div className="flex items-center justify-between mb-4 md:mb-6 px-4 md:px-0 py-3 md:py-0 bg-white/5 md:bg-transparent border-b border-white/10 md:border-none">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl md:rounded-2xl flex items-center justify-center">
            <Mic className="w-4 h-4 md:w-6 md:h-6 text-white" />
          </div>
          <div className="hidden md:block">
            <h4 className="text-lg font-semibold text-white">🎤 Modalità Orale</h4>
            <p className="text-gray-400 text-sm">Simulazione esame orale con professore AI</p>
          </div>
          <div className="md:hidden">
            <h4 className="text-sm font-semibold text-white">Esame Orale</h4>
          </div>
        </div>

        {/* Timer and Status */}
        <div className="flex items-center gap-2 md:gap-4">
          {examStatus === 'in_progress' && (
            <div className="flex items-center gap-1 md:gap-2 bg-red-500/20 px-2 md:px-3 py-1 rounded-lg border border-red-500/30">
              <Clock className="w-3 h-3 md:w-4 md:h-4 text-red-300" />
              <span className="text-red-300 font-mono text-xs md:text-sm">{formatTime(timer)}</span>
            </div>
          )}
          
          <div className={`px-2 md:px-3 py-1 rounded-lg text-xs font-medium ${
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
            className={`text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.05] disabled:opacity-50 ${
              isUltra
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600'
                : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
            }`}
          >
            {isLoading ? '🔄 Preparando...' : (
              <div className="text-center">
                <div className="font-bold">
                  {isUltra ? '👑 Inizia Esame Orale Ultra' : '🎓 Inizia Esame Orale Base'}
                </div>
                <div className="text-sm opacity-75">
                  {isUltra
                    ? '50 crediti'
                    : isCheckingFirstTime
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
          <div className="md:bg-white/5 md:rounded-xl p-2 md:p-4 md:border md:border-white/10 pb-48 md:pb-2">
            <div className="space-y-3 md:space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'student' ? 'justify-end' : 'justify-start'} px-2 md:px-0`}>
                  <div className={`max-w-[95%] md:max-w-[80%] rounded-xl px-3 md:px-4 py-2 md:py-3 ${
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
                        <p className="text-sm md:text-sm leading-relaxed whitespace-pre-wrap">
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
              <div className="md:bg-white/5 md:rounded-xl p-4 md:border md:border-white/10 fixed md:relative bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:right-auto bg-purple-900/90 md:bg-transparent border-t md:border-t-0 border-white/20 md:border-white/10 z-10">
                {/* Input */}
                <div className="flex items-end gap-4">
                  <div className="flex-1 relative">
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder={speechSupported ? "Scrivi o parla la tua risposta..." : "Scrivi la tua risposta qui..."}
                      className={`w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none min-h-[50px] md:min-h-[80px] text-base md:text-sm ${
                        isRecording ? 'ring-2 ring-red-500/50' : ''
                      }`}
                      disabled={isLoading}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          sendAnswer();
                        }
                      }}
                    />
                    {isRecording && (
                      <div className="absolute top-2 right-2 flex items-center gap-2 bg-red-500/20 text-red-300 px-2 py-1 rounded-lg text-xs">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        Ascolto...
                      </div>
                    )}
                  </div>
                  
                  {/* Microphone Button */}
                  {speechSupported && (
                    <button
                      onClick={toggleListening}
                      disabled={isLoading}
                      className={`p-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed ${
                        isRecording 
                          ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white`}
                      title={isRecording ? 'Stop recording' : 'Start voice input'}
                    >
                      <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
                    </button>
                  )}
                  
                  <button
                    onClick={sendAnswer}
                    disabled={!userAnswer.trim() || isLoading}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white p-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex justify-center items-center mt-3 text-xs text-gray-400">
                  <span>
                    Ctrl+Invio per inviare
                    {speechSupported && ' • 🎤 Clicca per parlare'}
                    {' • Risposte GRATIS'}
                  </span>
                </div>

                {/* Exam Control Buttons - Inclusi nell'area fissa su mobile */}
                <div className="mt-4 md:hidden">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={resetExam}
                      disabled={isLoading}
                      className="px-2 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      🔄 Azzera
                    </button>
                    <button
                      onClick={resetExam}
                      disabled={isLoading}
                      className="px-2 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      🔄 Ricomincia
                    </button>
                    <button
                      onClick={finishExam}
                      disabled={isLoading}
                      className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      ⏹️ Termina
                    </button>
                  </div>
                </div>
              </div>

              {/* Exam Control Buttons - Solo desktop */}
              <div className="hidden md:block md:bg-white/5 p-3 md:p-4 md:rounded-xl md:border md:border-white/10 mb-4">
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={resetExam}
                    disabled={isLoading}
                    className="px-2 md:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs md:text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <span className="md:hidden">🔄 Azzera</span>
                    <span className="hidden md:inline">🔄 Azzera Esame</span>
                  </button>
                  <button
                    onClick={resetExam}
                    disabled={isLoading}
                    className="px-2 md:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs md:text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <span className="md:hidden">🔄 Ricomincia</span>
                    <span className="hidden md:inline">🔄 Ricomincia Esame Orale</span>
                  </button>
                  <button
                    onClick={finishExam}
                    disabled={isLoading}
                    className="px-2 md:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs md:text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <span className="md:hidden">⏹️ Termina</span>
                    <span className="hidden md:inline">⏹️ Termina Esame</span>
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