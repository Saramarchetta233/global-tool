'use client';

import { Bot, Coins, Loader2, MessageCircle, Send, User } from 'lucide-react';
import React, { useEffect, useRef,useState } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface TutorSession {
  id: string;
  pdf_text: string;
  riassunto_breve: string;
  riassunto_esteso: string;
  flashcard: any[];
  created_at: string;
}

const TutorPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<TutorSession | null>(null);
  const [user, setUser] = useState<{ id: string; email: string; credits: number } | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setAuthToken(token);
      setUser(JSON.parse(userData));
    } else {
      // Redirect to login or show login form
      alert('Please login to use the tutor feature');
      window.location.href = '/login';
    }
  }, []);

  // Get session from URL or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdFromUrl = urlParams.get('sessionId');
    
    if (sessionIdFromUrl) {
      setSessionId(sessionIdFromUrl);
      localStorage.setItem('currentTutorSession', sessionIdFromUrl);
    } else {
      const savedSession = localStorage.getItem('currentTutorSession');
      if (savedSession) {
        setSessionId(savedSession);
      }
    }
  }, []);

  // Load session data when sessionId is available
  useEffect(() => {
    if (sessionId && authToken) {
      loadSession();
    }
  }, [sessionId, authToken]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSession = async () => {
    if (!sessionId || !authToken) return;

    try {
      const response = await fetch(`/api/tutor/sessions?sessionId=${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
        
        // Add welcome message
        if (messages.length === 0) {
          addMessage({
            text: `Ciao! Sono il tuo tutor AI. Ho analizzato il documento che hai caricato e sono pronto ad aiutarti con qualsiasi domanda. Puoi chiedermi spiegazioni, approfondimenti, o aiuto per memorizzare i concetti. Come posso aiutarti?`,
            isUser: false,
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
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
    if (!inputMessage.trim() || loading || !sessionId || !authToken) return;

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
      // Try demo endpoint first in development
      const isDev = process.env.NODE_ENV === 'development';
      const endpoint = isDev ? '/api/demo-tutor' : '/api/tutor';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Update user credits
        if (user && data.newCreditBalance !== undefined) {
          const updatedUser = { ...user, credits: data.newCreditBalance };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        // Add AI response
        addMessage({
          text: data.reply,
          isUser: false,
          timestamp: new Date()
        });
      } else {
        // Handle errors
        if (response.status === 402) {
          addMessage({
            text: `Mi dispiace, non hai abbastanza crediti per continuare la conversazione. Servono ${data.required || 5} crediti, ma ne hai solo ${data.available || 0}. Puoi acquistare più crediti dal tuo dashboard.`,
            isUser: false,
            timestamp: new Date()
          });
        } else {
          addMessage({
            text: 'Mi dispiace, c\'è stato un errore. Riprova più tardi.',
            isUser: false,
            timestamp: new Date()
          });
        }
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

  if (!user || !authToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 text-center max-w-md">
          <MessageCircle className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Tutor AI</h1>
          <p className="text-gray-300 mb-6">
            Per utilizzare il tutor, devi prima elaborare un documento nella pagina principale.
          </p>
          <button
            onClick={() => window.location.href = '/test'}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
          >
            Vai alla pagina principale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Tutor AI</h1>
                <p className="text-sm text-gray-300">Il tuo assistente di studio personalizzato</p>
              </div>
            </div>
            
            {/* Credits Display */}
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-medium">{user.credits}</span>
                  <span className="text-gray-300 text-sm">crediti</span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-300">Benvenuto</p>
                <p className="text-white font-medium">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-120px)] flex flex-col">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-6 py-4 ${
                  message.isUser
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-white/10 backdrop-blur-xl border border-white/20 text-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {!message.isUser && (
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-5 h-5 text-white" />
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
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 max-w-[70%]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
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
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Fai una domanda al tutor... (Costo: 5 crediti per messaggio)"
                  className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none min-h-[60px] max-h-[120px]"
                  disabled={loading}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white p-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
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
              <span>Premi Invio per inviare, Shift+Invio per andare a capo</span>
              <div className="flex items-center gap-1">
                <Coins className="w-3 h-3" />
                <span>5 crediti per messaggio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorPage;