'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Brain, Download, Play, ChevronLeft, ChevronRight, Sparkles, Zap, Target, Clock, BookOpen, Star, Rocket, Award, MessageCircle, Coins, User, LogOut, History, Calendar, Volume2, FileType, Palette } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import AuthModal from '@/components/AuthModal';
import CreditBar from '@/components/CreditBar';
import LoadingScreen from '@/components/LoadingScreen';
import TutorChat from '@/components/TutorChat';
import HistoryView from '@/components/HistoryView';
import AudioPlayer from '@/components/AudioPlayer';
import OralExamSection from '@/components/OralExamSection';
import InsufficientCreditsModal from '@/components/InsufficientCreditsModal';
import RechargeModal from '@/components/RechargeModal';
import SubscriptionModal from '@/components/SubscriptionModal';
import { saveStudySession, convertResultsToHistory, getStudySession } from '@/lib/study-history';
import { useStudySessionStore } from '@/store/useStudySessionStore';
import { useSubscription } from '@/hooks/useSubscription';

// Types (same as before but with sessionId)
interface FlashCard {
  front: string;
  back: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}

interface ConceptNode {
  title: string;
  children?: ConceptNode[];
}

interface StudyResults {
  riassunto_breve: string;
  riassunto_esteso: string;
  mappa_concettuale: ConceptNode[];
  flashcard: FlashCard[];
  quiz: QuizQuestion[];
  guida_esame: string | {
    tempo_totale?: string;
    piano_di_studio?: any[];
    introduzione?: string;
    consigli_finali?: string;
    [key: string]: any;
  };
  sessionId?: string;
  newCreditBalance?: number;
  creditsUsed?: number;
}

// Enhanced AI Processing Function with authentication
const processWithAI = async (file: File, language: string, authToken: string, targetLanguage?: string, user?: any): Promise<StudyResults> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  formData.append('userId', user?.id || '');
  if (targetLanguage && targetLanguage !== 'Auto') {
    formData.append('targetLanguage', targetLanguage);
  }

  // Use the production endpoint
  const endpoint = '/api/process-pdf-v2';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'X-User-Data': JSON.stringify({
        id: user?.id,
        email: user?.email,
        credits: user?.credits || 100
      })
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 402 || response.status === 403) {
      throw new Error(JSON.stringify({
        type: 'insufficient_credits',
        required: error.required,
        current: error.current || error.available,
        costDescription: error.costDescription
      }));
    }
    throw new Error(error.error || 'Failed to process PDF');
  }

  return await response.json();
};

// Components (keeping the same FlashCardView, QuizView, ConceptMap components but with improved styling)
const ConceptMap: React.FC<{ concepts: ConceptNode[] }> = ({ concepts }) => {
  // Sicurezza: verifica che concepts sia un array valido
  if (!concepts || !Array.isArray(concepts)) {
    console.warn('⚠️ ConceptMap: concepts non è un array valido:', concepts);
    return (
      <div className="text-center py-8">
        <div className="bg-yellow-500/20 p-6 rounded-xl border border-yellow-500/30">
          <p className="text-yellow-300">⚠️ Mappa concettuale non disponibile</p>
          <p className="text-yellow-200 text-sm mt-2">I dati della mappa potrebbero essere danneggiati</p>
        </div>
      </div>
    );
  }

  if (concepts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-blue-500/20 p-6 rounded-xl border border-blue-500/30">
          <p className="text-blue-300">📊 Nessun concetto nella mappa</p>
          <p className="text-blue-200 text-sm mt-2">Elabora un documento per generare la mappa concettuale</p>
        </div>
      </div>
    );
  }

  const renderNode = (node: ConceptNode, level: number = 0) => {
    if (!node || typeof node.title !== 'string') {
      console.warn('⚠️ Nodo non valido nella mappa:', node);
      return null;
    }

    return (
      <li key={node.title + level} className={`ml-${level * 2} sm:ml-${level * 4} mb-3`}>
        <div className={`${level === 0
          ? 'font-bold text-lg sm:text-xl text-emerald-300 bg-emerald-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-emerald-500/30'
          : level === 1
            ? 'font-semibold text-base sm:text-lg text-teal-300 bg-teal-500/10 px-2 sm:px-3 py-1 rounded-lg'
            : 'font-medium text-sm sm:text-base text-gray-100 bg-white/10 px-2 py-1 rounded-md'
          } mb-2 inline-block`}>
          {node.title}
        </div>
        {node.children && Array.isArray(node.children) && node.children.length > 0 && (
          <ul className="ml-4 border-l-2 border-emerald-400/30 pl-4 mt-2">
            {node.children.map((child, index) => renderNode(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <ul className="space-y-4">
      {concepts.map((concept, index) => renderNode(concept))}
    </ul>
  );
};

const FlashCardView: React.FC<{ flashcards: FlashCard[] }> = ({ flashcards }) => {
  const { flashcardState, updateFlashcardState } = useStudySessionStore();

  // Use store state
  const currentCard = flashcardState.currentCard;
  const showBack = flashcardState.showBack;

  const nextCard = () => {
    updateFlashcardState({
      currentCard: (currentCard + 1) % flashcards.length,
      showBack: false
    });
  };

  const prevCard = () => {
    updateFlashcardState({
      currentCard: (currentCard - 1 + flashcards.length) % flashcards.length,
      showBack: false
    });
  };

  // Sicurezza: verifica che flashcards sia un array valido
  if (!flashcards || !Array.isArray(flashcards)) {
    console.warn('⚠️ FlashCardView: flashcards non è un array valido:', flashcards);
    return (
      <div className="text-center py-8">
        <div className="bg-yellow-500/20 p-6 rounded-xl border border-yellow-500/30">
          <p className="text-yellow-300">⚠️ Flashcard non disponibili</p>
          <p className="text-yellow-200 text-sm mt-2">I dati delle flashcard potrebbero essere danneggiati</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-blue-500/20 p-6 rounded-xl border border-blue-500/30">
          <p className="text-blue-300">🃏 Nessuna flashcard disponibile</p>
          <p className="text-blue-200 text-sm mt-2">Elabora un documento per generare le flashcard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-3xl blur-xl"></div>

        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 min-h-64 flex flex-col justify-center border border-white/20 shadow-2xl">
          <div className="text-center mb-6">
            <span className="bg-gradient-to-r from-pink-400 to-rose-400 text-white px-3 py-1 rounded-full text-sm font-medium">
              {currentCard + 1} / {flashcards.length}
            </span>
          </div>

          <div className="flex-grow flex items-center justify-center text-center mb-6">
            <p className="text-xl text-white leading-relaxed font-medium">
              {showBack ? flashcards[currentCard].back : flashcards[currentCard].front}
            </p>
          </div>

          <button
            onClick={() => updateFlashcardState({ showBack: !showBack })}
            className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl mb-6 hover:from-pink-700 hover:to-rose-700 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.05]"
          >
            {showBack ? 'Mostra Domanda' : 'Mostra Risposta'}
          </button>

          <div className="flex justify-between">
            <button
              onClick={prevCard}
              className="bg-white/10 text-white p-3 rounded-xl hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextCard}
              className="bg-white/10 text-white p-3 rounded-xl hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExamSimulatorView: React.FC<{ questions: QuizQuestion[], docContext: string, authToken?: string }> = ({ questions, docContext, authToken }) => {
  const { examState, updateExamWrittenState, setActiveTab } = useStudySessionStore();
  const { updateCredits } = useAuth();

  // Use store state instead of local state
  const currentQuestion = examState.written.currentQuestion;
  const selectedOption = examState.written.selectedOption;
  const showExplanation = examState.written.showExplanation;
  const userAnswers = examState.written.userAnswers;
  const isCompleted = examState.written.isCompleted;
  const score = examState.written.score;
  const customQuestions = examState.written.customQuestions;
  const baseQuestions = examState.written.baseQuestions;
  const numQuestions = examState.written.customExamConfig.numQuestions;
  const difficulty = examState.written.customExamConfig.difficulty;
  const questionType = examState.written.customExamConfig.type;

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditError, setCreditError] = useState<{
    required: number;
    current: number;
    costDescription?: string;
  } | null>(null);

  // Function to reset to initial configuration state
  const resetToConfiguration = () => {
    updateExamWrittenState({
      currentQuestion: 0,
      userAnswers: [],
      isCompleted: false,
      score: 0,
      customQuestions: [],
      showExplanation: false,
      selectedOption: null,
      baseQuestions: [],
      generatedExam: null
    });
  };

  // Check if we should show configuration (no exam started)
  const shouldShowConfiguration = customQuestions.length === 0;

  const currentQuestions = customQuestions.length > 0 ? customQuestions : questions;

  useEffect(() => {
    if (currentQuestions.length > 0 && userAnswers.length !== currentQuestions.length) {
      updateExamWrittenState({
        userAnswers: new Array(currentQuestions.length).fill(null)
      });
    }
  }, [currentQuestions, userAnswers.length, updateExamWrittenState]);

  const generateCustomExam = async () => {
    if (!authToken || !docContext) return;

    setIsGenerating(true);
    setError(null); // Reset any previous errors

    try {
      console.log(`🎯 Starting exam generation: ${numQuestions} questions`);

      const response = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          docContext,
          numQuestions,
          difficulty,
          questionType
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Success: quiz generated and credits consumed
        console.log(`✅ Exam generated successfully: ${data.questions?.length} questions`);

        updateExamWrittenState({
          customQuestions: data.questions || [],
          currentQuestion: 0,
          isCompleted: false,
          score: 0,
          userAnswers: new Array(data.questions?.length || 0).fill(null),
          generatedExam: data
        });

        // Update user credits in the UI
        if (data.newCreditBalance !== undefined) {
          updateCredits(data.newCreditBalance);
          console.log(`💳 Credits updated: ${data.creditsUsed} used, new balance: ${data.newCreditBalance}`);
        }

        // Show success message
        alert(`🎯 Esame generato con successo!\n${data.questions?.length} domande create.\nCrediti utilizzati: ${data.creditsUsed || 0}`);

      } else {
        // Error: handle different error types
        console.error('❌ Exam generation failed:', data);

        if (data.type === 'insufficient_credits') {
          // Credits insufficient
          setCreditError({
            required: data.required,
            current: data.available,
            costDescription: `Esame ${numQuestions} domande`
          });
        } else if (data.type === 'generation_failed') {
          // Generation failed but credits NOT consumed
          setError(`❌ ${data.error}\n\nDettagli: ${data.details || 'Errore sconosciuto'}`);
          alert(`❌ ${data.error}`);
        } else {
          // Generic error
          setError(`❌ Errore durante la generazione dell'esame: ${data.error || 'Errore sconosciuto'}`);
          alert(`❌ Errore durante la generazione dell'esame: ${data.error || 'Errore sconosciuto'}`);
        }
      }
    } catch (networkError) {
      console.error('❌ Network error during exam generation:', networkError);
      setError('❌ Errore di connessione. Controlla la tua connessione internet e riprova.');
      alert('❌ Errore di connessione. Controlla la tua connessione internet e riprova.');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectOption = (index: number | string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = index;

    // Per risposte multiple choice, mostra subito la spiegazione
    // Per risposte aperte, aspetta il click su "Invia risposta"
    const currentQ = currentQuestions[currentQuestion];
    const showExpl = currentQ?.type === 'multiple_choice' || typeof index === 'number';

    updateExamWrittenState({
      userAnswers: newAnswers,
      selectedOption: typeof index === 'number' ? index : null,
      showExplanation: showExpl
    });
  };

  const submitOpenAnswer = () => {
    // Mostra la risposta corretta per le domande aperte
    updateExamWrittenState({
      showExplanation: true
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < currentQuestions.length - 1) {
      const nextIndex = currentQuestion + 1;
      updateExamWrittenState({
        currentQuestion: nextIndex,
        selectedOption: userAnswers[nextIndex] as number,
        showExplanation: userAnswers[nextIndex] !== null
      });
    } else {
      finishExam();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      const prevIndex = currentQuestion - 1;
      updateExamWrittenState({
        currentQuestion: prevIndex,
        selectedOption: userAnswers[prevIndex] as number,
        showExplanation: userAnswers[prevIndex] !== null
      });
    }
  };

  const finishExam = () => {
    let correctCount = 0;
    userAnswers.forEach((answer, index) => {
      const question = currentQuestions[index];
      if (question && question.type === 'multiple_choice' && answer === question.correct_option_index) {
        correctCount++;
      }
      // For open questions, we'll need manual scoring or AI scoring
    });
    updateExamWrittenState({
      score: correctCount,
      isCompleted: true
    });
  };

  // Domande di default se non ci sono domande dal documento
  const defaultQuestions = [
    {
      question: "Quali sono i concetti chiave trattati nel documento?",
      options: [
        "Concetti teorici e applicazioni pratiche",
        "Solo definizioni tecniche",
        "Esempi storici esclusivamente",
        "Procedimenti amministrativi"
      ],
      correct_option_index: 0,
      explanation: "Il documento tipicamente presenta sia i fondamenti teorici che le loro applicazioni concrete."
    },
    {
      question: "Come si collegano tra loro gli argomenti principali?",
      options: [
        "Sono completamente indipendenti",
        "Seguono una progressione logica e si rafforzano a vicenda",
        "Si contraddicono frequentemente",
        "Non hanno alcuna relazione"
      ],
      correct_option_index: 1,
      explanation: "Gli argomenti di studio sono generalmente strutturati in modo logico e complementare."
    },
    {
      question: "Qual è l'approccio migliore per studiare questo materiale?",
      options: [
        "Memorizzazione meccanica",
        "Solo lettura superficiale",
        "Comprensione dei concetti e delle loro relazioni",
        "Ignorare gli esempi pratici"
      ],
      correct_option_index: 2,
      explanation: "La comprensione profonda e le connessioni tra concetti sono fondamentali per un apprendimento efficace."
    }
  ];

  if (shouldShowConfiguration) {
    return (
      <div className="space-y-6">
        {/* Default Questions Section */}
        <div className="bg-green-500/20 backdrop-blur-sm p-6 rounded-2xl border border-green-500/30 mb-6">
          <h4 className="text-lg font-semibold text-green-300 mb-4">🎯 Quiz di Base</h4>
          <p className="text-green-200 mb-4">
            Inizia con queste domande generali mentre generi un quiz personalizzato sul tuo documento.
          </p>
          <button
            onClick={() => updateExamWrittenState({
              customQuestions: defaultQuestions,
              userAnswers: new Array(defaultQuestions.length).fill(null)
            })}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium transition-all duration-300"
          >
            📝 Usa Quiz di Base ({defaultQuestions.length} domande)
          </button>
        </div>

        {/* Exam Configuration */}
        <div className="bg-blue-500/20 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/30">
          <h4 className="text-lg font-semibold text-blue-300 mb-4">Configura la Simulazione Esame</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Numero domande:
              </label>
              <select
                value={numQuestions}
                onChange={(e) => updateExamWrittenState({
                  customExamConfig: { ...examState.written.customExamConfig, numQuestions: parseInt(e.target.value) }
                })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value={3}>3 domande — GRATIS</option>
                <option value={5}>5 domande — 10 crediti</option>
                <option value={10}>10 domande — 15 crediti</option>
                <option value={20}>20 domande — 25 crediti</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficoltà:
              </label>
              <select
                value={difficulty}
                onChange={(e) => updateExamWrittenState({
                  customExamConfig: { ...examState.written.customExamConfig, difficulty: e.target.value }
                })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="Base">Base</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzato">Avanzato</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo:
              </label>
              <select
                value={questionType}
                onChange={(e) => updateExamWrittenState({
                  customExamConfig: { ...examState.written.customExamConfig, type: e.target.value }
                })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="Aperte">Aperte</option>
                <option value="Scelta multipla">Scelta multipla</option>
                <option value="Miste">Miste</option>
              </select>
            </div>
          </div>


          <button
            onClick={generateCustomExam}
            disabled={isGenerating}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 font-medium transition-all duration-300 disabled:opacity-50 w-full"
          >
            {isGenerating ? '⏳ Generando...' : (
              <div className="text-center">
                <div className="font-semibold">🎯 Genera {numQuestions} domande</div>
                <div className="text-xs opacity-75">
                  {numQuestions <= 3 ? 'GRATIS' :
                    numQuestions <= 5 ? '10 crediti' :
                      numQuestions <= 10 ? '15 crediti' :
                        '25 crediti'}
                </div>
              </div>
            )}
          </button>

        </div>

        {currentQuestions.length === 0 ? (
          <div className="text-center py-8 text-gray-300">
            <p>Configura la tua simulazione d'esame personalizzata sopra.</p>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-300">
            <p>Usa le domande di default del documento o genera una simulazione personalizzata sopra.</p>
          </div>
        )}
      </div>
    );
  }

  if (isCompleted) {
    const percentage = Math.round((score / currentQuestions.length) * 100);
    return (
      <div className="text-center space-y-6">
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-8 rounded-2xl border border-green-500/30">
          <h3 className="text-2xl font-bold text-green-300 mb-4">Esame Completato!</h3>
          <div className="text-4xl font-bold text-white mb-2">{score}/{currentQuestions.length}</div>
          <div className="text-lg text-green-300">Punteggio: {percentage}%</div>
          {percentage >= 70 ? (
            <p className="text-green-200 mt-4">🎉 Ottimo lavoro! Sei pronto per l'esame!</p>
          ) : percentage >= 50 ? (
            <p className="text-yellow-200 mt-4">📚 Bene, ma serve ancora un po' di studio.</p>
          ) : (
            <p className="text-red-200 mt-4">📖 Concentrati di più sui concetti fondamentali.</p>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              updateExamWrittenState({
                currentQuestion: 0,
                isCompleted: false,
                userAnswers: new Array(currentQuestions.length).fill(null),
                selectedOption: null,
                showExplanation: false,
                score: 0
              });
            }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 font-medium transition-all duration-300"
          >
            🔄 Ricomincia Esame
          </button>
          <button
            onClick={resetToConfiguration}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium transition-all duration-300"
          >
            ⚙️ Nuova Configurazione
          </button>
        </div>
      </div>
    );
  }

  const question = currentQuestions[currentQuestion];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Exam Controls */}
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/10 p-3 sm:p-4 rounded-xl border border-white/20 gap-3">
        <span className="bg-gradient-to-r from-orange-400 to-amber-400 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
          Domanda {currentQuestion + 1} / {currentQuestions.length}
        </span>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={resetToConfiguration}
            className="px-3 py-1.5 sm:py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
          >
            ⚙️ Config
          </button>
          <button
            onClick={() => {
              updateExamWrittenState({
                currentQuestion: 0,
                isCompleted: false,
                userAnswers: new Array(currentQuestions.length).fill(null),
                selectedOption: null,
                showExplanation: false,
                score: 0
              });
            }}
            className="px-3 py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
          >
            🔄 Riparti
          </button>
          <button
            onClick={finishExam}
            className="px-3 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
          >
            ⏹️ Fine
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        {/* Navigation */}
        <div className="flex gap-2">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Indietro</span>
          </button>
          <button
            onClick={nextQuestion}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-xs sm:text-sm"
          >
            {currentQuestion === currentQuestions.length - 1 ? (
              <>⏹️ <span className="hidden sm:inline">Termina</span></>
            ) : (
              <>
                <span className="hidden sm:inline">Avanti</span>
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-xl"></div>

        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <h3 className="text-2xl font-semibold mb-8 text-white leading-relaxed">{question.question || question.text}</h3>

          {question.type === 'open' ? (
            /* Open Question */
            <div className="space-y-4 mb-8">
              <textarea
                value={userAnswers[currentQuestion] as string || ''}
                onChange={(e) => selectOption(e.target.value)}
                placeholder="Scrivi qui la tua risposta..."
                className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 min-h-[120px] focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />

              {!showExplanation && userAnswers[currentQuestion] && (
                <button
                  onClick={submitOpenAnswer}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-amber-700 font-semibold transition-all duration-300 shadow-lg"
                >
                  📤 Invia Risposta
                </button>
              )}

              {showExplanation && question.correctAnswer && (
                <div className="bg-green-500/20 p-4 rounded-xl border border-green-500/30">
                  <h4 className="text-green-300 font-semibold mb-2">Risposta Modello:</h4>
                  <p className="text-green-200">{question.correctAnswer}</p>
                  {question.explanation && (
                    <div className="mt-3">
                      <h5 className="text-green-300 font-medium mb-1">Spiegazione:</h5>
                      <p className="text-green-200 text-sm">{question.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Multiple Choice */
            <div className="space-y-4 mb-8">
              {(question.options || []).map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => selectOption(index)}
                  className={`w-full p-4 text-left rounded-2xl border-2 transition-all duration-300 font-medium ${userAnswers[currentQuestion] === null
                    ? 'border-white/20 hover:border-orange-400/50 hover:bg-white/10 text-gray-200 hover:text-white'
                    : userAnswers[currentQuestion] === index
                      ? index === question.correct_option_index
                        ? 'border-green-500 bg-green-500/20 text-green-300 backdrop-blur-sm'
                        : 'border-red-500 bg-red-500/20 text-red-300 backdrop-blur-sm'
                      : index === question.correct_option_index && showExplanation
                        ? 'border-green-500 bg-green-500/20 text-green-300 backdrop-blur-sm'
                        : 'border-white/20 bg-white/10 text-gray-300'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${userAnswers[currentQuestion] === null
                      ? 'border-gray-400 text-gray-400'
                      : userAnswers[currentQuestion] === index
                        ? index === question.correct_option_index
                          ? 'border-green-400 bg-green-500 text-white'
                          : 'border-red-400 bg-red-500 text-white'
                        : index === question.correct_option_index && showExplanation
                          ? 'border-green-400 bg-green-500 text-white'
                          : 'border-gray-500 text-gray-500'
                      }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-lg">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showExplanation && question.explanation && (
            <div className="bg-blue-500/20 border-l-4 border-blue-400 p-6 mb-6 rounded-2xl backdrop-blur-sm border border-blue-500/30">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">💡</span>
                </div>
                <div>
                  <h4 className="text-blue-300 font-semibold mb-2">Spiegazione</h4>
                  <p className="text-blue-200 leading-relaxed">{question.explanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-200 mb-2">
              <span>Progresso Esame</span>
              <span>{currentQuestion + 1}/{currentQuestions.length}</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / currentQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Study Plan Component
const StudyPlanSection: React.FC<{ docContext: string; authToken?: string }> = ({ docContext, authToken }) => {
  const { studyGuideState, updateStudyGuideState } = useStudySessionStore();
  const [isGenerating, setIsGenerating] = useState(false);

  // Use store state
  const studyPlan = studyGuideState.studyPlan;
  const daysInput = studyGuideState.daysInput;

  const generateStudyPlan = async () => {
    if (!authToken || !docContext) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/study-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          docContext,
          examDays: daysInput
        })
      });

      if (response.ok) {
        const data = await response.json();
        updateStudyGuideState({ studyPlan: data.studyPlan });
      }
    } catch (error) {
      console.error('Error generating study plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-blue-500/20 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/30">
      <h4 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        📅 Piano di Studio Rapido
      </h4>

      {!studyPlan ? (
        <div className="space-y-4">
          <p className="text-blue-200">
            Genera un piano di studio personalizzato basato sui giorni disponibili prima dell'esame.
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-blue-300 text-sm font-medium">
                Ho l'esame tra:
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={daysInput}
                onChange={(e) => updateStudyGuideState({ daysInput: parseInt(e.target.value) })}
                className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-center text-sm focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-blue-300 text-sm">giorni</span>
            </div>

            <button
              onClick={generateStudyPlan}
              disabled={isGenerating}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 font-medium text-xs sm:text-sm transition-all duration-300 disabled:opacity-50 w-full sm:w-auto"
            >
              {isGenerating ? '⏳ Generando...' : (
                <div className="text-center">
                  <div className="font-semibold">📅 Genera Piano</div>
                  <div className="text-xs opacity-75">GRATIS</div>
                </div>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            {studyPlan.days?.map((day: any, index: number) => (
              <div key={index} className="bg-white/10 p-4 rounded-xl border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <h5 className="font-semibold text-blue-300">{day.title || `Giorno ${index + 1}`}</h5>
                </div>
                <p className="text-blue-200 text-sm leading-relaxed ml-11">{day.description || day.activities}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => updateStudyGuideState({ studyPlan: null })}
            className="text-blue-300 hover:text-blue-200 text-sm underline transition-colors"
          >
            Genera nuovo piano
          </button>
        </div>
      )}
    </div>
  );
};

// Probable Questions Component
const ProbableQuestionsSection: React.FC<{ docContext: string; authToken?: string; sessionId?: string; documentId?: string }> = ({ docContext, authToken, sessionId, documentId }) => {
  const { studyGuideState, updateStudyGuideState } = useStudySessionStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [cost, setCost] = useState(0);
  const [isCheckingCost, setIsCheckingCost] = useState(true);

  // IMPORTANTE: Non mostrare "GRATIS" mentre stiamo controllando
  const shouldShowAsFree = cost === 0 && !isCheckingCost;

  // Use store state
  const questions = studyGuideState.probableQuestions;

  // Function to check cost before generation
  const checkCost = async () => {
    if (!authToken) {
      console.log('🔍 [CRITICAL_DEBUG_PROBABLE] checkCost: No authToken, returning early');
      setIsCheckingCost(false);
      return;
    }

    console.log('🔍 [CRITICAL_DEBUG_PROBABLE] checkCost: Starting API call...');
    setIsCheckingCost(true);

    try {
      console.log('🔍 [CRITICAL_DEBUG_PROBABLE] checkCost: Making fetch request...');
      const response = await fetch('/api/probable-questions/check-cost', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [CRITICAL_DEBUG_PROBABLE] checkCost API response:', data);

        // Controlla se la risposta contiene un errore
        if (data.error) {
          console.error('🔍 [CRITICAL_DEBUG_PROBABLE] checkCost API returned error:', data.message);
          // Non impostare nulla in caso di errore, lascia il valore precedente
          return;
        }

        console.log('🐛 [CRITICAL_DEBUG_PROBABLE] About to set cost to:', data.cost);
        setCost(data.cost);
        console.log('🐛 [CRITICAL_DEBUG_PROBABLE] setCost called with:', data.cost);
      } else {
        console.error('🔍 [CRITICAL_DEBUG_PROBABLE] checkCost: API response not ok:', response.status);
        // Non impostare a 0 di default in caso di errore
      }
    } catch (error) {
      console.error('🔍 [CRITICAL_DEBUG_PROBABLE] checkCost error:', error);
      // Non impostare a 0 di default in caso di errore
    } finally {
      setIsCheckingCost(false);
      console.log('🔍 [CRITICAL_DEBUG_PROBABLE] checkCost completed');
    }
  };

  // Check cost SOLO al login, non ad ogni documento (le domande probabili sono per PROFILO, non per documento)
  useEffect(() => {
    checkCost();
  }, [authToken]); // Solo quando cambia authToken (login/logout), NON per ogni documento

  const generateQuestions = async () => {
    if (!authToken || !docContext) return;

    console.log('[DEBUG_PROBABLE_QUESTIONS]', { documentId, sessionId, authToken: !!authToken });

    setIsGenerating(true);
    try {
      const response = await fetch('/api/probable-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          docContext,
          sessionId,
          documentId: documentId || sessionId
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🐛 [DEBUG] Probable questions API response:', {
          wasFree: data.wasFree,
          isFirstTime: data.isFirstTime,
          creditsUsed: data.creditsUsed,
          newCreditBalance: data.newCreditBalance,
          questionCount: data.questions?.length
        });

        updateStudyGuideState({ probableQuestions: data.questions || [] });

        // Credits are handled by the API, no need to update locally in this component

        // Show message if was free or paid
        if (data.wasFree) {
          console.log('🎉 First probable questions - FREE!');
        } else {
          console.log(`💳 Probable questions charged: ${data.creditsUsed || 5} credits`);
        }

        // SEMPRE ricontrolla dal server dopo aver usato il servizio per aggiornare UI
        console.log('🔄 [CRITICAL_DEBUG_PROBABLE] About to recheck cost after successful generation');
        console.log('🐛 [CRITICAL_DEBUG_PROBABLE] Current cost state before update:', cost);

        // Aggiorna subito lo stato locale per feedback immediato
        if (data.wasFree) {
          console.log('🎉 [CRITICAL_DEBUG_PROBABLE] First probable questions generation - FREE!');
          console.log('🐛 [CRITICAL_DEBUG_PROBABLE] Setting cost to 5 immediately for UI update');
          setCost(5); // Next time will cost 5
          console.log('🐛 [CRITICAL_DEBUG_PROBABLE] setCost(5) called');
        }

        try {
          // SEMPRE ricontrolla dal server per stato definitivo
          console.log('🐛 [CRITICAL_DEBUG_PROBABLE] Calling checkCost after generation...');
          await checkCost();
          console.log('🐛 [CRITICAL_DEBUG_PROBABLE] checkCost completed');
          console.log('🐛 [CRITICAL_DEBUG_PROBABLE] Current cost state AFTER checkCost:', cost);
        } catch (recheckError) {
          console.error('🐛 [CRITICAL_DEBUG_PROBABLE] Error in checkCost:', recheckError);
        }
      }
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-yellow-500/20 backdrop-blur-sm p-6 rounded-2xl border border-yellow-500/30">
      <h4 className="text-lg font-semibold text-yellow-300 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5" />
        🎯 Domande più Probabili all'Esame
      </h4>

      {questions.length === 0 ? (
        <div className="space-y-4">
          <p className="text-yellow-200">
            Genera le 5-10 domande più probabili che potrebbero essere chieste all'esame, basate sui concetti chiave del documento.
          </p>

          <button
            onClick={generateQuestions}
            disabled={isGenerating}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-yellow-700 hover:to-orange-700 font-medium transition-all duration-300 disabled:opacity-50"
          >
            {isGenerating ? 'Generando...' : (
              <div className="text-center">
                <div className="font-semibold">⚡ Genera Domande Probabili</div>
                <div className="text-xs opacity-75">
                  {isCheckingCost ? 'Verificando...' : (shouldShowAsFree ? 'GRATIS' : `${cost} crediti`)}
                </div>
              </div>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={index} className="bg-white/10 p-4 rounded-xl border border-white/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-yellow-300 mb-2">
                    {question.question}
                  </h5>
                  {question.answer && (
                    <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/30">
                      <p className="text-yellow-200 text-sm leading-relaxed">
                        <strong>Risposta modello:</strong> {question.answer}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => {
              updateStudyGuideState({ probableQuestions: [] });
              generateQuestions();
            }}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-3 rounded-lg hover:from-yellow-700 hover:to-orange-700 font-medium text-sm transition-all duration-300"
          >
            <div className="text-center">
              <div className="font-semibold">🔄 Genera nuove domande</div>
              <div className="text-xs opacity-75">
                {isCheckingCost ? 'Verificando...' : (shouldShowAsFree ? 'GRATIS' : `${cost} crediti`)}
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

// Main Component
const StudiusAIV2: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('Italiano');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'extracting' | 'generating' | 'finishing'>('extracting');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showHistory, setShowHistory] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('Auto');
  const [isGenerating, setIsGenerating] = useState(false);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [creditError, setCreditError] = useState<{
    required: number;
    current: number;
    costDescription?: string;
  } | null>(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, token, isLoading: authLoading, updateCredits, logout, refreshCredits } = useAuth();
  const { canPurchaseRecharge, subscription } = useSubscription();

  // Use Zustand store instead of local state
  const {
    activeTab,
    setActiveTab,
    examSubTab,
    setExamSubTab,
    sessionId,
    setSessionId,
    documentId,
    setDocumentId,
    docContext,
    setDocContext,
    results,
    setResults,
    resetSession,
    resetSessionKeepTutor,
    loadFromHistory,
    examState,
    updateExamWrittenState,
    flashcardState,
    updateFlashcardState,
    quizBasicState,
    updateQuizBasicState,
    studyGuideState,
    updateStudyGuideState
  } = useStudySessionStore();

  // Simulate loading progress
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev < 30) {
            setLoadingStage('extracting');
            return prev + 2;
          } else if (prev < 80) {
            setLoadingStage('generating');
            return prev + 1;
          } else if (prev < 95) {
            setLoadingStage('finishing');
            return prev + 0.5;
          }
          return prev;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [loading]);

  // Load user credits
  useEffect(() => {
    const loadUserCredits = async () => {
      if (!user?.id) return;

      try {
        // Prima prova a prendere i crediti attuali
        const response = await fetch(`/api/credits/add?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          let credits = data.credits || 0;

          setUserCredits(credits);
          // Sincronizza anche l'auth context - FORZA l'aggiornamento
          updateCredits(credits);
          console.log(`✅ Credits loaded and synchronized: ${credits}`);
        }
      } catch (error) {
        console.error('Error loading user credits:', error);
        // Fallback: prova refreshCredits dall'auth context
        await refreshCredits();
        setUserCredits(user?.credits || 0);
      }
    };

    loadUserCredits();
  }, [user, updateCredits, refreshCredits]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
    } else {
      alert('Per favore carica un file PDF valido.');
    }
  };

  const processDocument = async () => {
    if (!file) return;

    if (!user || !token) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setLoadingProgress(0);
    setError(null);

    try {
      const studyResults = await processWithAI(file, language, token, targetLanguage, user);

      // Update store with results and session data
      setResults(studyResults);
      setSessionId(studyResults.sessionId || null);
      setDocumentId(studyResults.sessionId || null); // Fix: Also update documentId to match sessionId

      // Load docContext from session if sessionId exists
      if (studyResults.sessionId) {
        try {
          const sessionData = await getStudySession(studyResults.sessionId);
          if (sessionData?.extractedText) {
            setDocContext(sessionData.extractedText);
          }
        } catch (error) {
          console.error('Error loading session data:', error);
        }
      }

      setLoadingProgress(100);

      // Update user credits if returned from API
      if (studyResults.newCreditBalance !== undefined) {
        updateCredits(studyResults.newCreditBalance);
        setUserCredits(studyResults.newCreditBalance);
      }

      // Save session ID for tutor (kept for backward compatibility)
      if (studyResults.sessionId) {
        localStorage.setItem('currentTutorSession', studyResults.sessionId);
      }

      // Save to study history automatically
      if (user) {
        try {
          const historyData = convertResultsToHistory(
            studyResults,
            user.id,
            file.name,
            targetLanguage
          );
          console.log('[DEBUG_FRONTEND_SAVE] About to save study session:', {
            userId: user.id,
            fileName: file.name,
            sessionId: studyResults.sessionId,
            historyDataKeys: Object.keys(historyData)
          });
          
          await saveStudySession(historyData, token);
          console.log('✅ [DEBUG_FRONTEND_SAVE] Study session saved to history successfully');
          
        } catch (historyError) {
          console.error('❌ [DEBUG_FRONTEND_SAVE] Failed to save study session:', historyError);
        }
      }

      // Set active tab to riassunto_breve after successful processing
      setActiveTab('riassunto_breve');
      
      // Refresh history to show the new document
      setHistoryRefreshTrigger(prev => prev + 1);

    } catch (error) {
      console.error('Errore durante elaborazione:', error);

      if (error instanceof Error) {
        try {
          // Check if it's a credit error
          const creditError = JSON.parse(error.message);
          if (creditError.type === 'insufficient_credits') {
            setCreditError({
              required: creditError.required,
              current: creditError.current,
              costDescription: creditError.costDescription
            });
            setShowInsufficientCreditsModal(true);
            return;
          }
        } catch (parseError) {
          // Not a JSON error, handle as regular error
        }

        setError(error.message);
      } else {
        setError('Errore durante elaborazione del documento. Riprova.');
      }
    } finally {
      setLoading(false);
    }
  };

  const openTutor = () => {
    if (results?.sessionId) {
      setActiveTab('tutor_ai');
      setShowHistory(false);
      // Scroll to the tabs section
      const tabsSection = document.querySelector('[data-tabs-section]');
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleSelectFromHistory = (historicalDocument: any) => {
    console.log('🔄 Caricando documento dallo storico:', historicalDocument);
    console.log('[DEBUG_DOC_ROUTE]', {
      documentId: historicalDocument.id,
      sessionId: historicalDocument.sessionId,
      userId: user?.id
    });

    // Use store method to load from history - this will restore all state including tutor messages and exam state
    loadFromHistory(historicalDocument);
    setShowHistory(false);

    // Scroll to tabs section after loading
    setTimeout(() => {
      const tabsSection = document.querySelector('[data-tabs-section]') as HTMLElement;
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleLogout = async () => {
    console.log('🔄 Logout clicked');
    await logout();
    resetSessionKeepTutor(); // Reset session but keep tutor messages
    setShowHistory(false);
    setFile(null);

    // Force UI refresh dopo logout
    setTimeout(() => {
      window.location.reload();
    }, 100);

    console.log('✅ Logout completed');
  };

  const downloadSummary = async () => {
    if (!results) return;

    try {
      const response = await fetch('/api/download-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riassuntoBreve: renderContent(results.riassunto_breve),
          riassuntoEsteso: renderContent(results.riassunto_esteso),
          format: 'html'
        })
      });

      if (!response.ok) {
        throw new Error('Errore durante la generazione del download');
      }

      const htmlBlob = await response.blob();
      const url = URL.createObjectURL(htmlBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'riassunto-studius.html';
      a.click();
      URL.revokeObjectURL(url);

      // Show user instruction for PDF conversion
      setTimeout(() => {
        alert('📄 File HTML generato! Per convertire in PDF:\n1. Apri il file nel browser\n2. Stampa → Salva come PDF\n3. Il layout è ottimizzato per la stampa');
      }, 500);

    } catch (error) {
      console.error('Error downloading summary:', error);
      alert('Errore durante il download: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
    }
  };

  const downloadFlashcards = async () => {
    if (!results || !results.flashcard || !Array.isArray(results.flashcard)) {
      alert('Nessuna flashcard disponibile per il download');
      return;
    }

    try {
      console.log('🎨 Generating graphic flashcards for', results.flashcard.length, 'cards');
      // Generate mobile-friendly HTML flashcards
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="it">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Flashcards - Studius AI</title>
          <style>
            * { box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0; 
              padding: 20px;
              min-height: 100vh;
            }
            .container { 
              max-width: 1200px; 
              margin: 0 auto; 
            }
            h1 { 
              text-align: center; 
              color: white; 
              text-shadow: 0 2px 4px rgba(0,0,0,0.3);
              margin-bottom: 40px;
              font-size: clamp(24px, 5vw, 36px);
            }
            .stats {
              text-align: center;
              color: rgba(255,255,255,0.9);
              margin-bottom: 30px;
              font-size: 18px;
            }
            .flashcard-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
              gap: 25px; 
              margin-bottom: 40px;
            }
            .flashcard {
              background: white;
              border-radius: 16px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
              overflow: hidden;
              transition: transform 0.3s ease, box-shadow 0.3s ease;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .flashcard:hover { 
              transform: translateY(-5px); 
              box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            }
            .card-header {
              background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
              color: white;
              padding: 20px;
              font-weight: 600;
              font-size: 16px;
              position: relative;
            }
            .card-number {
              position: absolute;
              top: 15px;
              right: 20px;
              background: rgba(255,255,255,0.2);
              color: white;
              padding: 8px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 700;
            }
            .card-front {
              padding: 25px;
              background: #f8fafc;
              border-bottom: 2px solid #e2e8f0;
              min-height: 100px;
            }
            .card-back {
              padding: 25px;
              background: white;
              min-height: 120px;
            }
            .card-front h3, .card-back h3 {
              margin: 0 0 15px 0;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
              font-weight: 700;
            }
            .card-front h3 { color: #2d3748; }
            .card-back h3 { color: #4f46e5; }
            .question-text {
              font-size: clamp(16px, 4vw, 18px);
              color: #2d3748;
              font-weight: 600;
              line-height: 1.5;
              word-wrap: break-word;
            }
            .answer-text {
              font-size: clamp(14px, 3.5vw, 16px);
              color: #4a5568;
              line-height: 1.6;
              word-wrap: break-word;
            }
            .footer {
              text-align: center;
              color: white;
              margin-top: 50px;
              font-size: 16px;
              text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            }
            @media print {
              body { 
                background: white !important; 
                padding: 10px;
              }
              .flashcard { 
                break-inside: avoid; 
                margin-bottom: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
              .flashcard:hover {
                transform: none;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
            }
            @media (max-width: 768px) {
              body { padding: 15px; }
              .flashcard-grid { 
                grid-template-columns: 1fr; 
                gap: 20px; 
              }
              .card-front, .card-back { padding: 20px; }
              .card-header { padding: 15px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🧠 Flashcards di Studio</h1>
            <div class="stats">
              📚 ${results.flashcard.length} Schede di Studio • Generato da Studius AI
            </div>
            
            <div class="flashcard-grid">
              ${results.flashcard.map((card: any, index: number) => `
                <div class="flashcard">
                  <div class="card-header">
                    📚 Flashcard ${index + 1}
                    <div class="card-number">${index + 1}/${results.flashcard.length}</div>
                  </div>
                  <div class="card-front">
                    <h3>❓ Domanda</h3>
                    <div class="question-text">${(card.front || 'N/A').replace(/\n/g, '<br>')}</div>
                  </div>
                  <div class="card-back">
                    <h3>✅ Risposta</h3>
                    <div class="answer-text">${(card.back || 'N/A').replace(/\n/g, '<br>')}</div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div class="footer">
              <p>🎓 Generato da Studius AI • ${new Date().toLocaleDateString('it-IT', {
        year: 'numeric', month: 'long', day: 'numeric'
      })}</p>
              <p>💡 Perfetto per studio su mobile • Stampa per flashcard fisiche</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flashcards-studius.html';
      a.click();
      URL.revokeObjectURL(url);

      setTimeout(() => {
        alert('🎨 Flashcards grafiche generate!\n📱 Mobile-friendly\n📄 Per PDF: Apri nel browser → Stampa → Salva come PDF');
      }, 500);

    } catch (error) {
      console.error('❌ Errore durante la generazione flashcards grafiche:', error);
      alert('Errore durante la generazione: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
    }
  };

  // Advanced Download Functions
  const downloadAudio = async () => {
    if (!results) return;

    try {
      setIsGenerating(true);
      const content = `${renderContent(results.riassunto_esteso) || renderContent(results.riassunto_breve)}`;

      console.log('🔊 Generating audio for summary, text length:', content.length);

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: content,
          voice: 'alloy', // OpenAI voice options: alloy, echo, fable, onyx, nova, shimmer
          language: targetLanguage === 'Auto' ? 'it' : targetLanguage.toLowerCase()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 402) {
          setShowInsufficientCreditsModal(true);
          return;
        }
        throw new Error(errorData.error || 'Errore nella generazione audio');
      }

      console.log('📥 Downloading audio blob...');
      const audioBlob = await response.blob();
      console.log('📊 Audio blob size:', audioBlob.size, 'bytes');

      if (audioBlob.size === 0) {
        throw new Error('Audio file vuoto ricevuto dal server');
      }

      // Update credits from response headers
      const newCreditBalance = response.headers.get('X-New-Credit-Balance');
      const creditsUsed = response.headers.get('X-Credits-Used');
      if (newCreditBalance) {
        updateCredits(parseInt(newCreditBalance));
      }

      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'riassunto-studius.mp3';
      a.click();
      URL.revokeObjectURL(url);

      console.log('✅ Audio MP3 scaricato con successo');
      alert(`🔊 Audio MP3 generato e scaricato!\nDimensione: ${Math.round(audioBlob.size / 1024)}KB${creditsUsed ? `\nCrediti utilizzati: ${creditsUsed}` : ''}`);
    } catch (error) {
      console.error('❌ Errore durante la generazione audio:', error);
      alert('Errore durante la generazione audio: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
    } finally {
      setIsGenerating(false);
    }
  };



  // Helper function to safely render content that might be an object
  const renderContent = (content: any): string => {
    if (typeof content === 'string') {
      // Clean up malformed content with extra parentheses or brackets
      return content
        .replace(/^\(+|\)+$/g, '') // Remove leading/trailing parentheses
        .replace(/^\[+|\]+$/g, '') // Remove leading/trailing brackets
        .replace(/\)\s*\(/g, ')\n\n(') // Add spacing between sections
        .trim();
    } else if (typeof content === 'object' && content !== null) {
      // If it's an object, try to format it nicely
      if (Array.isArray(content)) {
        return content
          .filter(item => item && typeof item === 'string' && item.trim().length > 0)
          .join('\n\n');
      } else {
        // Convert object to readable format
        return Object.entries(content)
          .filter(([key, value]) => value && typeof value === 'string' && value.trim().length > 0)
          .map(([key, value]) => {
            const cleanValue = typeof value === 'string'
              ? value.replace(/^\(+|\)+$/g, '').replace(/^\[+|\]+$/g, '').trim()
              : JSON.stringify(value, null, 2);
            return cleanValue;
          })
          .join('\n\n');
      }
    }
    return String(content || '');
  };

  const tabs = [
    { id: 'riassunto_breve', label: 'Riassunto Breve', icon: FileText },
    { id: 'riassunto_esteso', label: 'Riassunto Esteso', icon: FileText },
    { id: 'mappa_concettuale', label: 'Mappa Concettuale', icon: Brain },
    { id: 'flashcard', label: 'Flashcard', icon: Upload },
    { id: 'quiz', label: 'Simula Esame', icon: Play },
    { id: 'guida_esame', label: 'Master in 60 minuti', icon: Clock },
    { id: 'tutor_ai', label: 'Tutor AI', icon: MessageCircle }
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (loading) {
    return <LoadingScreen stage={loadingStage} progress={loadingProgress} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden">
      {/* Credit Bar */}
      <CreditBar
        onPurchaseCredits={() => alert('Feature di acquisto crediti in arrivo!')}
        credits={userCredits}
      />


      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-purple-900/10 to-blue-900/10"></div>

      {/* Header */}
      <header className={`relative z-10 ${user && !loading ? 'pt-4 pb-2' : 'pt-8 pb-4'}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          {user ? (
            /* Compact header for logged users */
            <div className="flex flex-col gap-3">
              {/* First row - Logo and Credits */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-purple-300 to-blue-300 bg-clip-text text-transparent">
                    Studius AI
                  </h1>
                  <div className="hidden md:inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-purple-500/30">
                    <Sparkles className="w-3 h-3" />
                    Powered by AI
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Credit Display */}
                  <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-green-500/30">
                    <Coins className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="font-semibold text-sm sm:text-base">{userCredits}</span>
                    <span className="text-green-200 text-xs hidden sm:inline">crediti</span>
                  </div>

                  {!results && (
                    <button
                      onClick={() => setShowHistory(true)}
                      className="p-1.5 sm:px-3 sm:py-1.5 bg-white/10 text-white rounded-lg sm:rounded-xl hover:bg-white/20 text-xs sm:text-sm font-medium transition-all border border-white/20"
                    >
                      <History className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1">Storico</span>
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="p-1.5 sm:px-3 sm:py-1.5 bg-red-500/20 text-red-300 rounded-lg sm:rounded-xl hover:bg-red-500/30 text-xs sm:text-sm font-medium transition-all border border-red-500/30"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Logout</span>
                  </button>
                </div>
              </div>

              {/* Second row - Action buttons (mobile only) */}
              <div className="flex items-center gap-2 md:hidden">
                {canPurchaseRecharge && (
                  <button
                    onClick={() => setShowRechargeModal(true)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  >
                    Ricarica Crediti
                  </button>
                )}
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all border border-white/20"
                >
                  Abbonati
                </button>
              </div>

              {/* Desktop action buttons */}
              <div className="hidden md:flex absolute right-4 top-4 gap-2">
                {canPurchaseRecharge && (
                  <button
                    onClick={() => setShowRechargeModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  >
                    Ricarica
                  </button>
                )}
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all border border-white/20"
                >
                  Abbonati
                </button>
              </div>
            </div>
          ) : (
            /* Full header for non-logged users */
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-4 backdrop-blur-sm border border-purple-500/30">
                <Sparkles className="w-4 h-4" />
                Powered by AI
              </div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-300 to-blue-300 bg-clip-text text-transparent mb-4">
                Studius AI
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Trasforma i tuoi PDF in materiali di studio <span className="text-purple-400 font-semibold">intelligenti</span> in secondi
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 mt-8 text-center">
                <div className="flex items-center gap-2 text-green-400">
                  <Zap className="w-5 h-5" />
                  <span className="text-sm font-medium">Elaborazione Istantanea</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <Brain className="w-5 h-5" />
                  <span className="text-sm font-medium">AI Avanzata</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <Target className="w-5 h-5" />
                  <span className="text-sm font-medium">Risultati Personalizzati</span>
                </div>
              </div>

              {/* Auth prompt for non-logged users */}
              <div className="mt-8 max-w-md mx-auto">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Accedi per iniziare</h3>
                  </div>
                  <p className="text-gray-300 mb-4 text-sm">
                    Crea un account gratuito e ricevi 120 crediti per iniziare subito!
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setAuthMode('register');
                        setShowAuthModal(true);
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:from-purple-700 hover:to-blue-700 transition-all"
                    >
                      Registrati Gratis
                    </button>
                    <button
                      onClick={() => {
                        setAuthMode('login');
                        setShowAuthModal(true);
                      }}
                      className="flex-1 bg-white/10 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-white/20 transition-all border border-white/20"
                    >
                      Accedi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 pb-16">
        {showHistory ? (
          /* History Section */
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <HistoryView 
                  onSelectDocument={handleSelectFromHistory} 
                  refreshTrigger={historyRefreshTrigger} 
                />
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setShowHistory(false)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 font-medium transition-all duration-300"
                  >
                    Carica Nuovo Documento
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : !results ? (
          /* Upload Section */
          <div className="max-w-2xl mx-auto">
            {/* Main Upload Card */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl"></div>

              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 shadow-2xl">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-4">
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Carica il tuo documento</h2>
                  <p className="text-sm sm:text-base text-gray-300">Genera automaticamente riassunti, flashcard, quiz e molto altro</p>
                </div>

                {/* File Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    📄 File PDF
                  </label>
                  <div className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-6 md:p-8 text-center transition-all duration-300 ${file
                    ? 'border-green-400 bg-green-400/10'
                    : 'border-gray-500 hover:border-purple-400 hover:bg-purple-400/5'
                    }`}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {!file ? (
                      <>
                        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center">
                          <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-white hover:text-purple-300 font-medium text-base sm:text-lg transition-colors"
                        >
                          Clicca per caricare un file PDF
                        </button>
                        <p className="text-gray-400 text-xs sm:text-sm mt-2">Oppure trascina e rilascia qui</p>
                      </>
                    ) : (
                      <div className="flex items-center justify-between gap-2 sm:gap-3 bg-green-500/10 p-3 sm:p-4 rounded-xl border border-green-500/30">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium text-sm sm:text-base truncate">{file.name}</p>
                            <p className="text-green-400 text-xs sm:text-sm">File caricato con successo!</p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setFile(null);
                            resetSession();
                            setError(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-lg transition-colors flex-shrink-0"
                          title="Rimuovi documento"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Language Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    🌍 Lingua del contenuto
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 sm:p-4 bg-white/10 border border-white/20 rounded-2xl text-white text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all"
                  >
                    <option value="Italiano">🇮🇹 Italiano</option>
                    <option value="Inglese">🇺🇸 Inglese</option>
                    <option value="Spagnolo">🇪🇸 Spagnolo</option>
                  </select>
                </div>

                {/* Target Language Selection for Summaries */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    🔄 Lingua dei riassunti
                  </label>
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="w-full p-3 sm:p-4 bg-white/10 border border-white/20 rounded-2xl text-white text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all"
                  >
                    <option value="Auto">🔄 Auto (stessa del documento)</option>
                    <option value="Italiano">🇮🇹 Italiano</option>
                    <option value="Inglese">🇺🇸 Inglese</option>
                    <option value="Spagnolo">🇪🇸 Spagnolo</option>
                    <option value="Francese">🇫🇷 Francese</option>
                    <option value="Tedesco">🇩🇪 Tedesco</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-2">
                    Scegli la lingua in cui vuoi ricevere riassunti, flashcard e quiz generati dall'AI
                  </p>
                </div>


                {/* Process Button */}
                <button
                  onClick={processDocument}
                  disabled={!file}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none group"
                >
                  {!user ? (
                    <div className="flex items-center justify-center gap-3">
                      <Sparkles className="w-6 h-6" />
                      <span>🔒 Accedi per elaborare</span>
                      <Rocket className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-3 mb-1">
                        <Sparkles className="w-6 h-6" />
                        <span className="font-bold">✨ Genera materiali di studio AI</span>
                        <Rocket className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </div>

                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl"></div>
                </button>

                {/* Cost info */}

                {/* Error Message */}
                {error && (
                  <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-400 text-sm">⚠️</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-red-300 mb-1">
                          Errore durante elaborazione
                        </h3>
                        <div className="text-sm text-red-400 mb-3">
                          {error}
                        </div>
                        <button
                          type="button"
                          onClick={() => setError(null)}
                          className="bg-red-500/20 hover:bg-red-500/30 px-3 py-1.5 rounded-lg text-sm font-medium text-red-300 transition-colors"
                        >
                          Chiudi
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Features Preview */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-300 font-medium">Riassunti</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-300 font-medium">Flashcard</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <Play className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-300 font-medium">Quiz</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-300 font-medium">Studia 1h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Results Section */
          <div className="relative">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-4 backdrop-blur-sm border border-green-500/30">
                <Award className="w-4 h-4" />
                Elaborazione Completata!
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">I tuoi materiali di studio sono pronti</h2>
              <p className="text-gray-300">Esplora tutti i contenuti generati AI per ottimizzare il tuo apprendimento</p>
            </div>

            {/* Export and Tutor Buttons */}
            <div className="mb-8 flex flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center">
              <button
                onClick={downloadSummary}
                className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 font-medium text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.05] backdrop-blur-sm group"
              >
                <Download size={18} />
                <span>Scarica Riassunto</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              <button
                onClick={downloadFlashcards}
                className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-purple-700 hover:to-violet-700 flex items-center gap-2 font-medium text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.05] backdrop-blur-sm group"
              >
                <Download size={18} />
                <span>Scarica Flashcard</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>

              {/* Advanced Downloads */}
              <button
                onClick={downloadAudio}
                disabled={isGenerating}
                className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-orange-700 hover:to-red-700 flex items-center gap-2 font-medium text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.05] backdrop-blur-sm group disabled:opacity-50"
              >
                <Volume2 size={18} />
                {isGenerating ? 'Generando...' : (
                  <div className="flex flex-col items-center">
                    <span>Audio MP3</span>
                    <span className="text-xs opacity-75">5 crediti</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>


              {/* Tutor Button */}
              {results.sessionId && (
                <button
                  onClick={openTutor}
                  className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 flex items-center gap-2 font-medium text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.05] backdrop-blur-sm group"
                >
                  <MessageCircle size={18} />
                  <span>Apri Tutor AI</span>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              )}

              <button
                onClick={() => setShowHistory(true)}
                className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 flex items-center gap-2 font-medium text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.05] backdrop-blur-sm group"
              >
                <History size={18} />
                <span>Storico</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>

              <button
                onClick={() => {
                  resetSession(); // Reset entire session
                  setFile(null);
                  setError(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="relative overflow-hidden bg-white/10 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-white/20 flex items-center gap-2 font-medium text-sm sm:text-base transition-all duration-300 backdrop-blur-sm border border-white/20"
              >
                <Upload size={18} />
                <span>Nuovo Documento</span>
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="mb-8" data-tabs-section>
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-2 border border-white/10">
                <nav className="flex flex-wrap gap-2">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 min-w-[120px] sm:min-w-[140px] py-2 sm:py-3 px-2 sm:px-4 rounded-xl font-medium text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all duration-300 ${activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                          }`}
                      >
                        <IconComponent size={16} className="sm:w-4 sm:h-4" />
                        <span className="text-[10px] sm:text-sm">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-3xl blur-xl"></div>

              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 shadow-2xl">
                {activeTab === 'riassunto_breve' && (
                  <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Riassunto Breve</h3>
                        <p className="text-xs sm:text-sm text-gray-400">Panoramica essenziale dei concetti chiave</p>
                      </div>
                    </div>

                    {/* Audio Player - Separate row on mobile */}
                    <div className="mb-4 sm:mb-0 sm:absolute sm:top-6 sm:right-6">
                      <AudioPlayer
                        text={renderContent(results.riassunto_breve)}
                        language={targetLanguage === 'Auto' ? 'it-IT' :
                          targetLanguage === 'Italiano' ? 'it-IT' :
                            targetLanguage === 'Inglese' ? 'en-US' :
                              targetLanguage === 'Spagnolo' ? 'es-ES' :
                                targetLanguage === 'Francese' ? 'fr-FR' :
                                  targetLanguage === 'Tedesco' ? 'de-DE' : 'it-IT'
                        }
                      />
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20">
                      <p className="text-gray-200 leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-wrap">{renderContent(results.riassunto_breve)}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'riassunto_esteso' && (
                  <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Riassunto Esteso</h3>
                        <p className="text-xs sm:text-sm text-gray-400">Materiale di studio universitario completo</p>
                      </div>
                    </div>

                    {/* Audio Player - Separate row on mobile */}
                    <div className="mb-4 sm:mb-0 sm:absolute sm:top-6 sm:right-6">
                      <AudioPlayer
                        text={renderContent(results.riassunto_esteso)}
                        language={targetLanguage === 'Auto' ? 'it-IT' :
                          targetLanguage === 'Italiano' ? 'it-IT' :
                            targetLanguage === 'Inglese' ? 'en-US' :
                              targetLanguage === 'Spagnolo' ? 'es-ES' :
                                targetLanguage === 'Francese' ? 'fr-FR' :
                                  targetLanguage === 'Tedesco' ? 'de-DE' : 'it-IT'
                        }
                      />
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20">
                      <p className="text-gray-200 leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-wrap">{renderContent(results.riassunto_esteso)}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'mappa_concettuale' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Mappa Concettuale</h3>
                        <p className="text-gray-400">Struttura visuale delle connessioni tra i concetti</p>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <ConceptMap concepts={results.mappa_concettuale} />
                    </div>
                  </div>
                )}

                {activeTab === 'flashcard' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Flashcard</h3>
                        <p className="text-gray-400">Carte per memorizzazione attiva</p>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <FlashCardView flashcards={results.flashcard} />
                    </div>
                  </div>
                )}

                {activeTab === 'quiz' && (
                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Simula Esame</h3>
                        <p className="text-gray-400">Simulazione d'esame personalizzabile</p>
                      </div>
                    </div>

                    {/* Sub-tabs Navigation */}
                    <div className="bg-white/5 rounded-2xl p-2 border border-white/10 mb-6 flex gap-2">
                      <button
                        onClick={() => setExamSubTab('scritto')}
                        className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${examSubTab === 'scritto'
                          ? 'bg-orange-500/30 text-orange-200 border border-orange-400/50 shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        <FileText size={18} />
                        <span>Esame Scritto</span>
                      </button>
                      <button
                        onClick={() => setExamSubTab('orale')}
                        className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${examSubTab === 'orale'
                          ? 'bg-orange-500/30 text-orange-200 border border-orange-400/50 shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        <MessageCircle size={18} />
                        <span>Esame Orale</span>
                      </button>
                    </div>

                    {/* Sub-tab Content */}
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      {examSubTab === 'scritto' && (
                        <div>
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-white">Esame Scritto</h4>
                              <p className="text-gray-400">Quiz di base e simulazioni personalizzabili</p>
                            </div>
                          </div>

                          <ExamSimulatorView
                            questions={results.quiz}
                            docContext={renderContent(results.riassunto_esteso) || renderContent(results.riassunto_breve)}
                            authToken={token || undefined}
                          />
                        </div>
                      )}

                      {examSubTab === 'orale' && (
                        <div>
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                              <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-white">Esame Orale</h4>
                              <p className="text-gray-400">Simulazione di colloquio con valutazione AI</p>
                            </div>
                          </div>


                          <OralExamSection
                            docContext={renderContent(results.riassunto_esteso) || renderContent(results.riassunto_breve)}
                            authToken={token || undefined}
                            targetLanguage={targetLanguage === 'Auto' ? 'Italiano' : targetLanguage}
                            onBack={() => setActiveTab('riassunto_breve')}
                            onCreditsUpdate={(newCredits) => {
                              console.log('🔥 Page received credit update:', newCredits);
                              setUserCredits(newCredits);
                              updateCredits(newCredits);
                            }}
                            documentId={documentId || results.sessionId}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'guida_esame' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white">Studia in 1 ora</h3>
                        <p className="text-gray-400">Piano strategico per imparare rapidamente</p>
                      </div>

                      {/* Language Selector */}
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-300">
                          Lingua del riassunto:
                        </label>
                        <select
                          value={targetLanguage}
                          onChange={(e) => setTargetLanguage(e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                        >
                          <option value="Auto">🔄 Auto (lingua documento)</option>
                          <option value="Italiano">🇮🇹 Italiano</option>
                          <option value="Inglese">🇺🇸 Inglese</option>
                          <option value="Spagnolo">🇪🇸 Spagnolo</option>
                          <option value="Francese">🇫🇷 Francese</option>
                          <option value="Tedesco">🇩🇪 Tedesco</option>
                        </select>
                      </div>
                    </div>


                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-8">
                      {/* Piano Studio Rapido */}
                      <StudyPlanSection
                        docContext={renderContent(results.riassunto_esteso) || renderContent(results.riassunto_breve)}
                        authToken={token || undefined}
                      />

                      {/* Domande Probabili */}
                      <ProbableQuestionsSection
                        docContext={renderContent(results.riassunto_esteso) || renderContent(results.riassunto_breve)}
                        authToken={token || undefined}
                        sessionId={results?.sessionId}
                        documentId={documentId || results?.sessionId}
                      />

                      {/* Guida Originale */}
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm p-6 rounded-2xl mb-6 border border-green-500/30">
                        <h4 className="text-lg font-semibold text-green-300 mb-3 flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          🎯 Strategia per Studiare in 1 ora
                        </h4>
                        <p className="text-green-200">
                          Seguendo questa guida ottimizzata, potrai padroneggiare i concetti chiave e superare l'esame con successo.
                        </p>
                      </div>
                      <div className="text-gray-200 leading-relaxed">
                        {(() => {
                          // Se è una stringa, prova a parsare come JSON
                          if (typeof results.guida_esame === 'string') {
                            try {
                              const parsedGuida = JSON.parse(results.guida_esame);
                              if (typeof parsedGuida === 'object' && parsedGuida !== null) {
                                // È un JSON valido, usa l'oggetto parseado
                                results.guida_esame = parsedGuida;
                              } else {
                                // Non è un oggetto valido, mostra come testo
                                return <div className="whitespace-pre-wrap text-lg">{results.guida_esame}</div>;
                              }
                            } catch (e) {
                              // Non è un JSON valido, mostra come testo
                              return <div className="whitespace-pre-wrap text-lg">{results.guida_esame}</div>;
                            }
                          }

                          // Ora results.guida_esame è un oggetto, mostra la versione formattata
                          return (
                            <div className="space-y-6">
                              {results.guida_esame && typeof results.guida_esame === 'object' && (
                                <>
                                  {results.guida_esame.introduzione && (
                                    <div className="bg-blue-500/20 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/30">
                                      <h5 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5" />
                                        💡 Introduzione Strategica
                                      </h5>
                                      <p className="text-blue-200 text-lg leading-relaxed">{results.guida_esame.introduzione}</p>
                                    </div>
                                  )}

                                  {results.guida_esame.tempo_totale && (
                                    <div className="bg-purple-500/20 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/30">
                                      <h5 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        ⏱️ Tempo Totale
                                      </h5>
                                      <p className="text-purple-200 text-lg">{results.guida_esame.tempo_totale}</p>
                                    </div>
                                  )}

                                  {results.guida_esame.piano_di_studio && (
                                    <div>
                                      <h5 className="font-semibold text-white mb-6 text-xl flex items-center gap-2">
                                        <BookOpen className="w-6 h-6" />
                                        📋 Piano di Studio Dettagliato
                                      </h5>
                                      {Array.isArray(results.guida_esame.piano_di_studio) ? (
                                        <div className="space-y-6">
                                          {results.guida_esame.piano_di_studio.map((fase: any, index: number) => (
                                            <div key={index} className="bg-white/5 rounded-2xl p-6 border border-white/10 border-l-4 border-l-green-500 relative">
                                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-500 rounded-l-2xl"></div>
                                              <div className="flex items-center gap-4 mb-4">
                                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">
                                                  {index + 1}
                                                </div>
                                                <div>
                                                  <h6 className="font-semibold text-green-300 text-lg">{fase.fase || `Fase ${index + 1}`}</h6>
                                                  {fase.durata && (
                                                    <p className="text-purple-300 text-sm flex items-center gap-2">
                                                      <Clock className="w-4 h-4" />
                                                      Durata: {fase.durata}
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                              <p className="text-gray-200 leading-relaxed text-lg">{fase.descrizione || fase.attivita || fase}</p>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-gray-200 whitespace-pre-wrap text-lg">{results.guida_esame.piano_di_studio}</div>
                                      )}
                                    </div>
                                  )}

                                  {results.guida_esame.consigli_finali && (
                                    <div className="bg-yellow-500/20 backdrop-blur-sm p-6 rounded-2xl border border-yellow-500/30">
                                      <h5 className="font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                                        <Star className="w-5 h-5" />
                                        ⭐ Consigli Finali per il Successo
                                      </h5>
                                      <p className="text-yellow-200 text-lg leading-relaxed">{results.guida_esame.consigli_finali}</p>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                <div className={activeTab === 'tutor_ai' ? 'block' : 'hidden'}>
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Tutor AI</h3>
                        <p className="text-gray-400">Il tuo assistente di studio personalizzato</p>
                      </div>
                    </div>

                    {/* Back to Tabs Button */}
                    <button
                      onClick={() => {
                        setActiveTab('riassunto_breve');
                        // Scroll to tabs section
                        const tabsSection = document.querySelector('[data-tabs-section]');
                        if (tabsSection) {
                          tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all border border-white/20"
                    >
                      <span>← Torna ai Tabs</span>
                    </button>
                  </div>


                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <TutorChat
                      docContext={renderContent(results.riassunto_esteso) || renderContent(results.riassunto_breve)}
                      sessionId={results.sessionId}
                      authToken={token || undefined}
                      onCreditsUpdate={(newCredits) => updateCredits(newCredits)}
                      documentId={documentId || results.sessionId}
                    />

                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setAuthMode('login');
        }}
        defaultMode={authMode}
      />

      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        isOpen={showInsufficientCreditsModal}
        onClose={() => {
          setShowInsufficientCreditsModal(false);
          setCreditError(null);
        }}
        required={creditError?.required || 0}
        current={creditError?.current || 0}
        costDescription={creditError?.costDescription}
        canPurchaseRecharge={canPurchaseRecharge}
        onRecharge={() => {
          setShowInsufficientCreditsModal(false);
          setCreditError(null);
          setShowRechargeModal(true);
        }}
        onSubscribe={() => {
          setShowInsufficientCreditsModal(false);
          setCreditError(null);
          setShowSubscriptionModal(true);
        }}
        onLifetime={() => {
          setShowInsufficientCreditsModal(false);
          setCreditError(null);
          setShowSubscriptionModal(true);
        }}
      />

      {/* Recharge Modal */}
      <RechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
      />

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </div>
  );
};

export default StudiusAIV2;