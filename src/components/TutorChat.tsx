'use client';

import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
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
  documentId?: string;
  onBackToTabs?: () => void;
}

export interface TutorChatRef {
  scrollToInput: () => void;
}

const TutorChat = forwardRef<TutorChatRef, TutorChatProps>(({ 
  docContext, 
  sessionId, 
  authToken,
  onCreditsUpdate,
  documentId,
  onBackToTabs 
}, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [freeMessagesRemaining, setFreeMessagesRemaining] = useState<number>(3);
  const [isWithinFreeLimit, setIsWithinFreeLimit] = useState<boolean>(true);
  const [messageCount, setMessageCount] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputAreaRef = useRef<HTMLDivElement>(null);

  // Load chat history and message count on mount
  useEffect(() => {
    const loadChatData = async () => {
      if (!authToken || !documentId) {
        // Se non c'è documentId, mostra solo il messaggio di benvenuto
        setMessages([{
          id: 'welcome-' + Date.now(),
          text: `Ciao! Sono il tuo tutor AI. ${docContext ? 'Ho analizzato il documento che hai caricato e sono pronto ad aiutarti con qualsiasi domanda.' : 'Sono pronto ad aiutarti.'} Puoi chiedermi spiegazioni, approfondimenti, o aiuto per memorizzare i concetti. Come posso aiutarti?`,
          isUser: false,
          timestamp: new Date()
        }]);
        return;
      }
      
      setChatLoading(true);
      
      try {
        console.log('🔍 Loading chat data for documentId:', documentId);
        
        // Carica sia la cronologia chat che il conteggio messaggi in parallelo
        const [chatResponse, countResponse] = await Promise.all([
          fetch(`/api/tutor-chat-history?documentId=${documentId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          }),
          fetch(`/api/tutor/count?documentId=${documentId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          })
        ]);

        // Gestisci cronologia chat
        if (chatResponse.ok) {
          const chatData = await chatResponse.json();
          console.log('📚 Chat history API response:', chatData);
          console.log('📚 Chat history loaded:', chatData.messageCount || 0, 'messages');
          
          if (chatData.history && chatData.history.length > 0) {
            // Converti cronologia in formato Message[]
            const historyMessages: Message[] = chatData.history.map((msg: any) => ({
              id: msg.id,
              text: msg.content,
              isUser: msg.role === 'user',
              timestamp: new Date(msg.timestamp)
            }));
            setMessages(historyMessages);
          } else {
            // Nessuna cronologia, mostra messaggio di benvenuto
            setMessages([{
              id: 'welcome-' + Date.now(),
              text: `Ciao! Sono il tuo tutor AI. ${docContext ? 'Ho analizzato il documento che hai caricato e sono pronto ad aiutarti con qualsiasi domanda.' : 'Sono pronto ad aiutarti.'} Puoi chiedermi spiegazioni, approfondimenti, o aiuto per memorizzare i concetti. Come posso aiutarti?`,
              isUser: false,
              timestamp: new Date()
            }]);
          }
        } else {
          console.error('❌ Chat history API error:', chatResponse.status, chatResponse.statusText);
          const errorData = await chatResponse.text();
          console.error('❌ Chat history API error details:', errorData);
        }

        // Gestisci conteggio messaggi
        if (countResponse.ok) {
          const countData = await countResponse.json();
          console.log('🔄 Initial tutor count API response:', countData);
          setMessageCount(countData.messageCount || 0);
          setFreeMessagesRemaining(countData.freeMessagesRemaining || 3);
          setIsWithinFreeLimit(countData.isWithinFreeLimit !== false);
        } else {
          console.error('❌ Count API error:', countResponse.status, countResponse.statusText);
          const errorData = await countResponse.text();
          console.error('❌ Count API error details:', errorData);
        }
        
      } catch (error) {
        console.error('Error loading chat data:', error);
        // Fallback al messaggio di benvenuto
        setMessages([{
          id: 'welcome-' + Date.now(),
          text: `Ciao! Sono il tuo tutor AI. ${docContext ? 'Ho analizzato il documento che hai caricato e sono pronto ad aiutarti con qualsiasi domanda.' : 'Sono pronto ad aiutarti.'} Puoi chiedermi spiegazioni, approfondimenti, o aiuto per memorizzare i concetti. Come posso aiutarti?`,
          isUser: false,
          timestamp: new Date()
        }]);
      } finally {
        setChatLoading(false);
      }
    };

    loadChatData();
  }, [authToken, documentId, docContext]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToInput = () => {
    inputAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useImperativeHandle(ref, () => ({
    scrollToInput
  }));

  const fetchTutorCount = async () => {
    if (!authToken || !documentId) return;
    
    try {
      const response = await fetch(`/api/tutor/count?documentId=${documentId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔄 Updated tutor count:', data);
        setMessageCount(data.messageCount || 0);
        setFreeMessagesRemaining(data.freeMessagesRemaining || 3);
        setIsWithinFreeLimit(data.isWithinFreeLimit !== false);
      }
    } catch (error) {
      console.error('Error fetching tutor count:', error);
    }
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
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          message: userMessage,
          docContext: docContext,
          language: 'Italiano',
          sessionId: sessionId,
          documentId: documentId
        })
      });
      
      const data = await response.json();
      

      if (response.ok) {
        // Update credits if callback provided
        if (onCreditsUpdate && (data.creditsRemaining !== undefined || data.newCreditBalance !== undefined)) {
          onCreditsUpdate(data.creditsRemaining || data.newCreditBalance);
        }

        // Update tracking based on new API response
        console.log('📊 Tutor response data:', { messageCount: data.messageCount, isWithinFreeLimit: data.isWithinFreeLimit });
        
        if (data.messageCount !== undefined) {
          setMessageCount(data.messageCount);
          const remaining = Math.max(0, 3 - data.messageCount);
          setFreeMessagesRemaining(remaining);
          setIsWithinFreeLimit(data.messageCount < 3);
        }
        
        // SEMPRE ricontrolla dal server dopo aver usato il tutor per aggiornare UI definitivamente
        console.log('🔄 Rechecking tutor count after message to update UI state...');
        await fetchTutorCount();

        // Add AI response
        addMessage({
          text: data.reply || data.message || 'Risposta ricevuta',
          isUser: false,
          timestamp: new Date()
        });
      } else {
        // Handle errors with specific messages
        let errorMessage = 'Mi dispiace, c\'è stato un errore. Riprova più tardi.';

        if (response.status === 402 && data.error === 'LIMIT_REACHED') {
          // Questo è il limite dei messaggi gratuiti
          errorMessage = data.message || 'Hai finito i messaggi gratuiti. Puoi continuare per 2 crediti per messaggio.';
          // Aggiorna lo stato per mostrare che siamo fuori dal limite gratuito
          setIsWithinFreeLimit(false);
          setFreeMessagesRemaining(0);
        } else if (response.status === 402) {
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
    <div className="flex flex-col">
      {/* Messages Container */}
      <div className="mb-3 sm:mb-4 space-y-2 sm:space-y-4">
        {chatLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              <span className="text-gray-300">Caricamento chat...</span>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[95%] sm:max-w-[80%] rounded-2xl px-3 sm:px-6 py-3 sm:py-4 ${
                    message.isUser
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-white/10 backdrop-blur-xl border border-white/20 text-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    {!message.isUser && (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                        <Bot className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                      </div>
                    )}
                    {message.isUser && (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 order-1">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    )}
                    <div className={`flex-1 ${message.isUser ? 'order-0' : ''}`}>
                      <p className="text-sm lg:text-base leading-relaxed whitespace-pre-wrap">
                        {message.text}
                      </p>
                      <p className={`text-xs mt-1 sm:mt-2 ${message.isUser ? 'text-purple-200' : 'text-gray-400'}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-3 sm:px-6 py-3 sm:py-4 max-w-[95%] sm:max-w-[80%]">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Bot className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
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
          </>
        )}
      </div>

      {/* Input Area */}
      <div ref={inputAreaRef} className="relative">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-2 sm:p-4">
          <div className="flex items-end gap-2 sm:gap-4">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isWithinFreeLimit 
                    ? `Fai una domanda... (${freeMessagesRemaining} gratis)`
                    : "Fai una domanda... (2 crediti)"
                }
                className="w-full bg-transparent text-white text-base placeholder-gray-300 resize-none focus:outline-none min-h-[45px] sm:min-h-[60px] max-h-[90px] sm:max-h-[120px]"
                style={{ fontSize: 'max(16px, 1rem)' }}
                disabled={loading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || loading || !authToken}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white p-2 sm:p-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
          
          {/* Cost indicator */}
          <div className="flex justify-between items-center mt-1 sm:mt-2 text-xs text-gray-300">
            <span className="hidden sm:inline">Premi Invio per inviare, Shift+Invio per andare a capo</span>
            <span className="sm:hidden">Invio per inviare</span>
            <div className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-gray-300" />
              {isWithinFreeLimit ? (
                <span className="text-green-400 text-xs">
                  {freeMessagesRemaining} gratis
                </span>
              ) : (
                <span className="text-xs text-gray-300">2 crediti</span>
              )}
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-center gap-2 mt-3">
            <button
              onClick={() => scrollToTop()}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 text-gray-300 border border-white/20 rounded-lg hover:bg-white/20 hover:border-purple-500/50 transition-all text-xs"
            >
              <span>↑ Torna su</span>
            </button>
            {onBackToTabs && (
              <button
                onClick={onBackToTabs}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/10 text-gray-300 border border-white/20 rounded-lg hover:bg-white/20 hover:border-purple-500/50 transition-all text-xs"
              >
                <span>← Torna ai Tabs</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

TutorChat.displayName = 'TutorChat';

export default TutorChat;