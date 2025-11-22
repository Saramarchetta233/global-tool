'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Coins } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface TutorChatProps {
  docContext?: string;
  sessionId?: string;
  authToken?: string;
  onCreditsUpdate?: (newCredits: number) => void;
}

const TutorChat: React.FC<TutorChatProps> = ({ 
  docContext, 
  sessionId, 
  authToken,
  onCreditsUpdate 
}) => {
  const [messages, setMessages] = useState<Message[]>(() => [{
    id: 'welcome-' + Date.now(),
    text: `Ciao! Sono il tuo tutor AI. ${docContext ? 'Ho analizzato il documento che hai caricato e sono pronto ad aiutarti con qualsiasi domanda.' : 'Sono pronto ad aiutarti.'} Puoi chiedermi spiegazioni, approfondimenti, o aiuto per memorizzare i concetti. Come posso aiutarti?`,
    isUser: false,
    timestamp: new Date()
  }]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (message: Omit<Message, 'id'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading || !authToken) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    // Add user message
    addMessage({
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    });

    try {
      // Use demo endpoint only in explicit demo mode
      const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
      const endpoint = isDemoMode ? '/api/demo-tutor' : '/api/tutor';
      
      console.log("TutorChat sta inviando:", {
        message: userMessage,
        docContext: docContext,
        language: "Italiano"
      });
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          message: userMessage,
          docContext: docContext,
          language: 'Italiano'
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Update credits if callback provided
        if (onCreditsUpdate && (data.creditsRemaining !== undefined || data.newCreditBalance !== undefined)) {
          onCreditsUpdate(data.creditsRemaining || data.newCreditBalance);
        }

        // Add AI response
        addMessage({
          text: data.reply || data.message || 'Risposta ricevuta',
          isUser: false,
          timestamp: new Date()
        });
      } else {
        // Handle errors with specific messages
        let errorMessage = 'Mi dispiace, c\'è stato un errore. Riprova più tardi.';

        if (response.status === 402) {
          errorMessage = data.message || 'Crediti insufficienti per usare il Tutor AI.';
        } else if (response.status === 400) {
          errorMessage = data.message || 'Richiesta non valida inviata al Tutor AI.';
        } else if (response.status === 500) {
          errorMessage = data.message || 'Si è verificato un errore nel Tutor AI.';
        } else if (data.message) {
          errorMessage = data.message;
        }

        addMessage({
          text: errorMessage,
          isUser: false,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({
        text: 'Errore di connessione. Controlla la tua connessione internet e riprova.',
        isUser: false,
        timestamp: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!docContext) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-500/20 backdrop-blur-sm p-6 rounded-2xl border border-yellow-500/30 max-w-md mx-auto">
          <Bot className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-300 mb-2">
            Tutor AI non disponibile
          </h3>
          <p className="text-yellow-200 text-sm">
            Genera prima un riassunto o carica un documento per utilizzare il Tutor AI.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[400px] sm:h-[500px] md:h-[600px]">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 sm:space-y-4 pr-1 sm:pr-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 sm:px-6 py-3 sm:py-4 ${
                message.isUser
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-white/10 backdrop-blur-xl border border-white/20 text-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {!message.isUser && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                )}
                {message.isUser && (
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 order-1">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className={`flex-1 ${message.isUser ? 'order-0' : ''}`}>
                  <p className="text-sm lg:text-base leading-relaxed whitespace-pre-wrap">
                    {message.text}
                  </p>
                  <p className={`text-xs mt-2 ${message.isUser ? 'text-purple-200' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 max-w-[85%] sm:max-w-[80%]">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-gray-300 text-sm">Il tutor sta pensando...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-3 sm:p-4">
          <div className="flex items-end gap-2 sm:gap-4">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Fai una domanda al tutor... (5 crediti)"
                className="w-full bg-transparent text-white text-sm sm:text-base placeholder-gray-400 resize-none focus:outline-none min-h-[50px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px]"
                disabled={loading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || loading || !authToken}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white p-2.5 sm:p-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Cost indicator */}
          <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
            <span className="hidden sm:inline">Premi Invio per inviare, Shift+Invio per andare a capo</span>
            <span className="sm:hidden">Invio per inviare</span>
            <div className="flex items-center gap-1">
              <Coins className="w-3 h-3" />
              <span>5 crediti per messaggio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorChat;