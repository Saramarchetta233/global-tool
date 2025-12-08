'use client';

import { Award, BookOpen, Brain, Calendar,ChevronLeft, ChevronRight, Clock, Coins, Download, FileText, History, LogOut, MessageCircle, Play, Rocket, Sparkles, Star, Target, Upload, User, Zap } from 'lucide-react';
import React, { useEffect,useRef, useState } from 'react';

import { useAuth } from '@/lib/auth-context';
import { convertResultsToHistory,saveStudySession } from '@/lib/study-history';

import AudioPlayer from '@/components/AudioPlayer';
import AuthModal from '@/components/AuthModal';
import CreditBar from '@/components/CreditBar';
import DemoBanner from '@/components/DemoBanner';
import HistoryView from '@/components/HistoryView';
import LoadingScreen from '@/components/LoadingScreen';
import OralExamSection from '@/components/OralExamSection';
import TutorChat from '@/components/TutorChat';

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

// Enhanced AI Processing Function with authentication - ECO version
const processWithAI = async (file: File, language: string, authToken: string, targetLanguage?: string): Promise<StudyResults> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  if (targetLanguage && targetLanguage !== 'Auto') {
    formData.append('targetLanguage', targetLanguage);
  }

  // Use ECO endpoint for this version
  const endpoint = '/api/process-pdf-eco';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 402) {
      throw new Error(`Crediti insufficienti. Servono ${error.required} crediti, ne hai ${error.available}.`);
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

  const renderNode = (node: ConceptNode, level = 0) => {
    if (!node || typeof node.title !== 'string') {
      console.warn('⚠️ Nodo non valido nella mappa:', node);
      return null;
    }

    return (
      <li key={node.title + level} className={`ml-${level * 4} mb-3`}>
        <div className={`${
          level === 0 
            ? 'font-bold text-xl text-emerald-300 bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/30' 
            : level === 1 
              ? 'font-semibold text-lg text-teal-300 bg-teal-500/10 px-3 py-1 rounded-lg' 
              : 'font-medium text-gray-200 bg-white/5 px-2 py-1 rounded-md'
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
  const [currentCard, setCurrentCard] = useState(0);
  const [showBack, setShowBack] = useState(false);

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % flashcards.length);
    setShowBack(false);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setShowBack(false);
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
        
        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 min-h-64 flex flex-col justify-center border border-white/20 shadow-2xl">
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
            onClick={() => setShowBack(!showBack)}
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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(number | string | null)[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  
  // Exam configuration
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('Intermedio');
  const [questionType, setQuestionType] = useState('Scelta multipla');
  const [isGenerating, setIsGenerating] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<any[]>([]);

  const currentQuestions = customQuestions.length > 0 ? customQuestions : questions;

  useEffect(() => {
    setUserAnswers(new Array(currentQuestions.length).fill(null));
  }, [currentQuestions]);

  const generateCustomExam = async () => {
    if (!authToken || !docContext) return;
    
    setIsGenerating(true);
    try {
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

      if (response.ok) {
        const data = await response.json();
        setCustomQuestions(data.questions || []);
        setCurrentQuestion(0);
        setIsCompleted(false);
        setScore(0);
      }
    } catch (error) {
      console.error('Error generating exam:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectOption = (index: number | string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = index;
    setUserAnswers(newAnswers);
    setSelectedOption(typeof index === 'number' ? index : null);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(userAnswers[currentQuestion + 1] as number);
      setShowExplanation(userAnswers[currentQuestion + 1] !== null);
    } else {
      finishExam();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedOption(userAnswers[currentQuestion - 1] as number);
      setShowExplanation(userAnswers[currentQuestion - 1] !== null);
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
    setScore(correctCount);
    setIsCompleted(true);
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

  if (currentQuestions.length === 0 && customQuestions.length === 0) {
    return (
      <div className="space-y-6">
        {/* Default Questions Section */}
        <div className="bg-green-500/20 backdrop-blur-sm p-6 rounded-2xl border border-green-500/30 mb-6">
          <h4 className="text-lg font-semibold text-green-300 mb-4">🎯 Quiz di Base</h4>
          <p className="text-green-200 mb-4">
            Inizia con queste domande generali mentre generi un quiz personalizzato sul tuo documento.
          </p>
          <button
            onClick={() => setCustomQuestions(defaultQuestions)}
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
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5 domande</option>
                <option value={10}>10 domande</option>
                <option value={20}>20 domande</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficoltà:
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
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
                onChange={(e) => setQuestionType(e.target.value)}
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
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 font-medium transition-all duration-300 disabled:opacity-50"
          >
            {isGenerating ? 'Generando...' : '🎯 Genera Simulazione Esame'}
          </button>
        </div>

        <div className="text-center py-8 text-gray-300">
          <p>Configura la tua simulazione d'esame personalizzata sopra, oppure usa le domande di default del documento.</p>
          {questions.length === 0 && (
            <p className="text-yellow-300 mt-2">⚠️ Nessuna domanda di default disponibile. Genera una simulazione personalizzata.</p>
          )}
        </div>
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
        
        <button
          onClick={() => {
            setCurrentQuestion(0);
            setIsCompleted(false);
            setUserAnswers(new Array(currentQuestions.length).fill(null));
            setSelectedOption(null);
            setShowExplanation(false);
            setScore(0);
          }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 font-medium transition-all duration-300"
        >
          Ricomincia Esame
        </button>
      </div>
    );
  }

  const question = currentQuestions[currentQuestion];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <span className="bg-gradient-to-r from-orange-400 to-amber-400 text-white px-4 py-2 rounded-full text-sm font-medium">
          Domanda {currentQuestion + 1} / {currentQuestions.length}
        </span>
        
        {/* Navigation */}
        <div className="flex gap-2">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextQuestion}
            className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            {currentQuestion === currentQuestions.length - 1 ? 'Termina' : <ChevronRight size={20} />}
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
              
              {showExplanation && question.correctAnswer && (
                <div className="bg-green-500/20 p-4 rounded-xl border border-green-500/30">
                  <h4 className="text-green-300 font-semibold mb-2">Risposta Modello:</h4>
                  <p className="text-green-200">{question.correctAnswer}</p>
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
                  className={`w-full p-4 text-left rounded-2xl border-2 transition-all duration-300 font-medium ${
                    userAnswers[currentQuestion] === null
                      ? 'border-white/20 hover:border-orange-400/50 hover:bg-white/10 text-gray-200 hover:text-white'
                      : userAnswers[currentQuestion] === index
                        ? index === question.correct_option_index
                          ? 'border-green-500 bg-green-500/20 text-green-300 backdrop-blur-sm'
                          : 'border-red-500 bg-red-500/20 text-red-300 backdrop-blur-sm'
                        : index === question.correct_option_index && showExplanation
                          ? 'border-green-500 bg-green-500/20 text-green-300 backdrop-blur-sm'
                          : 'border-white/10 bg-white/5 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                      userAnswers[currentQuestion] === null 
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
            <div className="flex justify-between text-sm text-gray-400 mb-2">
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
  const [studyPlan, setStudyPlan] = useState<any>(null);
  const [daysInput, setDaysInput] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);
  
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
        setStudyPlan(data.studyPlan);
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
                onChange={(e) => setDaysInput(parseInt(e.target.value))}
                className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-center text-sm focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-blue-300 text-sm">giorni</span>
            </div>
            
            <button
              onClick={generateStudyPlan}
              disabled={isGenerating}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-cyan-700 font-medium text-sm transition-all duration-300 disabled:opacity-50"
            >
              {isGenerating ? 'Generando...' : 'Genera Piano'}
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
            onClick={() => setStudyPlan(null)}
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
const ProbableQuestionsSection: React.FC<{ docContext: string; authToken?: string }> = ({ docContext, authToken }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateQuestions = async () => {
    if (!authToken || !docContext) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/probable-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          docContext
        })
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
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
            {isGenerating ? 'Generando...' : '⚡ Genera Domande Probabili'}
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
            onClick={() => setQuestions([])}
            className="text-yellow-300 hover:text-yellow-200 text-sm underline transition-colors"
          >
            Genera nuove domande
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
  const [results, setResults] = useState<StudyResults | null>(null);
  const [activeTab, setActiveTab] = useState('riassunto_breve');
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showHistory, setShowHistory] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('Auto');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, token, isLoading: authLoading, updateCredits, logout } = useAuth();

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    const savedTab = localStorage.getItem('studius-active-tab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // Tab state persistence
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('studius-active-tab', activeTab);
    }
  }, [activeTab, isClient]);

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
      const studyResults = await processWithAI(file, language, token, targetLanguage);
      setResults(studyResults);
      setLoadingProgress(100);
      
      // Update user credits if returned from API
      if (studyResults.newCreditBalance !== undefined) {
        updateCredits(studyResults.newCreditBalance);
      }
      
      // Save session ID for tutor
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
          await saveStudySession(historyData);
          console.log('Study session saved to history');
        } catch (historyError) {
          console.error('Failed to save study session:', historyError);
        }
      }
      
    } catch (error) {
      console.error('Errore durante elaborazione:', error);
      const errorMessage = error instanceof Error ? error.message : 'Errore durante elaborazione del documento. Riprova.';
      setError(errorMessage);
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
    
    // Assicura che tutti i campi array esistano e siano array validi
    const safeResults = {
      riassunto_breve: historicalDocument.summaryShort || historicalDocument.riassunto_breve || '',
      riassunto_esteso: historicalDocument.summaryExtended || historicalDocument.riassunto_esteso || '',
      mappa_concettuale: Array.isArray(historicalDocument.conceptMap || historicalDocument.mappa_concettuale) 
        ? (historicalDocument.conceptMap || historicalDocument.mappa_concettuale)
        : [],
      flashcard: Array.isArray(historicalDocument.flashcards || historicalDocument.flashcard) 
        ? (historicalDocument.flashcards || historicalDocument.flashcard)
        : [],
      quiz: Array.isArray(historicalDocument.quizData || historicalDocument.quiz) 
        ? (historicalDocument.quizData || historicalDocument.quiz)
        : [],
      guida_esame: historicalDocument.studyInOneHour || historicalDocument.guida_esame || '',
      sessionId: historicalDocument.sessionId || historicalDocument.id,
      newCreditBalance: user?.credits
    };
    
    console.log('✅ Risultati sicuri preparati:', safeResults);
    setResults(safeResults);
    setActiveTab('riassunto_breve');
    setShowHistory(false);
  };

  const handleLogout = () => {
    logout();
    setResults(null);
    setShowHistory(false);
    setFile(null);
  };

  const downloadSummary = () => {
    if (!results) return;
    const content = `RIASSUNTO BREVE:\n\n${renderContent(results.riassunto_breve)}\n\n\nRIASSUNTO ESTESO:\n\n${renderContent(results.riassunto_esteso)}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'riassunto.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadFlashcards = () => {
    if (!results || !results.flashcard || !Array.isArray(results.flashcard)) {
      console.error('❌ Nessuna flashcard disponibile per il download');
      alert('Nessuna flashcard disponibile per il download');
      return;
    }
    
    console.log('💾 Downloading', results.flashcard.length, 'flashcards');
    
    try {
      const csvContent = 'front,back\n' +
        results.flashcard.map(card => {
          const front = (card.front || '').replace(/"/g, '""'); // Escape quotes
          const back = (card.back || '').replace(/"/g, '""');
          return `"${front}","${back}"`;
        }).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flashcards.csv';
      document.body.appendChild(a); // Necessario per Firefox
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ Flashcards scaricate con successo');
    } catch (error) {
      console.error('❌ Errore durante il download:', error);
      alert('Errore durante il download delle flashcard');
    }
  };

  // Helper function to safely render content that might be an object
  const renderContent = (content: any): string => {
    if (typeof content === 'string') {
      return content;
    } else if (typeof content === 'object' && content !== null) {
      // If it's an object, try to format it nicely
      if (Array.isArray(content)) {
        return content.join('\n\n');
      } else {
        // Convert object to readable format
        return Object.entries(content)
          .map(([key, value]) => `${key}:\n${typeof value === 'string' ? value : JSON.stringify(value, null, 2)}`)
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
    { id: 'guida_esame', label: 'Studia in 1 ora', icon: Clock },
    { id: 'tutor_ai', label: 'Tutor AI', icon: MessageCircle }
  ];

  if (authLoading) {
    return <LoadingScreen stage="extracting" progress={50} />;
  }

  if (loading) {
    return <LoadingScreen stage={loadingStage} progress={loadingProgress} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Demo Banner */}
      <DemoBanner />
      
      {/* Credit Bar */}
      <CreditBar onPurchaseCredits={() => alert('Feature di acquisto crediti in arrivo!')} />
      
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-purple-900/10 to-blue-900/10"></div>
      
      {/* Header */}
      <header className={`relative z-10 ${user && !loading ? 'pt-4 pb-2' : 'pt-8 pb-4'}`}>
        <div className="max-w-6xl mx-auto px-4">
          {user ? (
            /* Compact header for logged users */
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-300 to-blue-300 bg-clip-text text-transparent">
                  Studius AI <span className="text-sm text-green-400 font-normal">[ECO]</span>
                </h1>
                <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-purple-500/30">
                  <Sparkles className="w-3 h-3" />
                  Versione ECO
                </div>
              </div>
              <div className="flex items-center gap-4">
                {!results && (
                  <button
                    onClick={() => setShowHistory(true)}
                    className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-xl hover:bg-white/20 font-medium text-sm transition-all border border-white/20"
                  >
                    <History className="w-4 h-4" />
                    <span>Storico</span>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-500/20 text-red-300 px-4 py-2 rounded-xl hover:bg-red-500/30 font-medium text-sm transition-all border border-red-500/30"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            /* Full header for non-logged users */
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-4 backdrop-blur-sm border border-purple-500/30">
                <Sparkles className="w-4 h-4" />
                Versione ECO
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
                    Crea un account gratuito e ricevi 100 crediti per iniziare subito!
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
                <HistoryView onSelectDocument={handleSelectFromHistory} />
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
              
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-4">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Carica il tuo documento</h2>
                  <p className="text-gray-300">Genera automaticamente riassunti, flashcard, quiz e molto altro</p>
                </div>

                {/* File Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    📄 File PDF
                  </label>
                  <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                    file 
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
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center">
                          <Upload className="w-10 h-10 text-purple-400" />
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-white hover:text-purple-300 font-medium text-lg transition-colors"
                        >
                          Clicca per caricare un file PDF
                        </button>
                        <p className="text-gray-400 text-sm mt-2">Oppure trascina e rilascia qui</p>
                      </>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{file.name}</p>
                          <p className="text-green-400 text-sm">File caricato con successo!</p>
                        </div>
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
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all"
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
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all"
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
                  <div className="flex items-center justify-center gap-3">
                    <Sparkles className="w-6 h-6" />
                    <span>
                      {!user ? '🔒 Accedi per elaborare' : '✨ Genera materiali di studio AI (ECO)'}
                    </span>
                    <Rocket className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl"></div>
                </button>

                {/* Cost info */}
                {user && (
                  <div className="mt-4 text-center text-sm text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <Coins className="w-4 h-4" />
                      <span>Costo: 3 crediti per l'elaborazione ECO</span>
                    </div>
                  </div>
                )}

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
                Elaborazione ECO Completata!
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">I tuoi materiali di studio sono pronti</h2>
              <p className="text-gray-300">Esplora tutti i contenuti generati AI per ottimizzare il tuo apprendimento</p>
            </div>

            {/* Export and Tutor Buttons */}
            <div className="mb-8 flex flex-wrap gap-4 justify-center">
              <button
                onClick={downloadSummary}
                className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.05] backdrop-blur-sm group"
              >
                <Download size={18} />
                <span>Scarica Riassunto</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              <button
                onClick={downloadFlashcards}
                className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-violet-700 flex items-center gap-2 font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.05] backdrop-blur-sm group"
              >
                <Download size={18} />
                <span>Scarica Flashcard CSV</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              
              {/* Tutor Button */}
              {results.sessionId && (
                <button
                  onClick={openTutor}
                  className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 flex items-center gap-2 font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.05] backdrop-blur-sm group"
                >
                  <MessageCircle size={18} />
                  <span>Apri Tutor AI</span>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              )}
              
              <button
                onClick={() => setShowHistory(true)}
                className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 flex items-center gap-2 font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.05] backdrop-blur-sm group"
              >
                <History size={18} />
                <span>Storico</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              
              <button
                onClick={() => setResults(null)}
                className="relative overflow-hidden bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/20 flex items-center gap-2 font-medium transition-all duration-300 backdrop-blur-sm border border-white/20"
              >
                <Upload size={18} />
                <span>Nuovo Documento</span>
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="mb-8" data-tabs-section>
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-2 border border-white/10">
                <nav className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <IconComponent size={16} />
                        <span className="hidden sm:inline">{tab.label}</span>
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
              
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                {activeTab === 'riassunto_breve' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white">Riassunto Breve</h3>
                        <p className="text-gray-400">Panoramica essenziale dei concetti chiave</p>
                      </div>
                      
                      {/* Audio Player */}
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
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <p className="text-gray-200 leading-relaxed text-lg whitespace-pre-wrap">{renderContent(results.riassunto_breve)}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'riassunto_esteso' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white">Riassunto Esteso</h3>
                        <p className="text-gray-400">Materiale di studio universitario completo</p>
                      </div>
                      
                      {/* Audio Player */}
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
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <p className="text-gray-200 leading-relaxed text-lg whitespace-pre-wrap">{renderContent(results.riassunto_esteso)}</p>
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
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Simula Esame</h3>
                        <p className="text-gray-400">Simulazione d'esame personalizzabile</p>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <ExamSimulatorView 
                        questions={results.quiz} 
                        docContext={renderContent(results.riassunto_esteso) || renderContent(results.riassunto_breve)}
                        authToken={token || undefined}
                      />
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
                      />
                      
                      {/* Modalità Orale */}
                      <OralExamSection
                        docContext={renderContent(results.riassunto_esteso) || renderContent(results.riassunto_breve)}
                        authToken={token || undefined}
                        targetLanguage={targetLanguage === 'Auto' ? 'Italiano' : targetLanguage}
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
                        {typeof results.guida_esame === 'string' ? (
                          <div className="whitespace-pre-wrap text-lg">{results.guida_esame}</div>
                        ) : (
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
                                          <div key={index} className="bg-white/5 rounded-2xl p-6 border border-white/10 border-l-4 border-l-gradient-to-b from-green-500 to-emerald-500 relative">
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
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className={activeTab === 'tutor_ai' ? 'block' : 'hidden'}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Tutor AI</h3>
                      <p className="text-gray-400">Il tuo assistente di studio personalizzato</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <TutorChat 
                      docContext={renderContent(results.riassunto_esteso) || renderContent(results.riassunto_breve)}
                      sessionId={results.sessionId}
                      authToken={token || undefined}
                      onCreditsUpdate={(newCredits) => updateCredits(newCredits)}
                      targetLanguage={targetLanguage === 'Auto' ? 'Italiano' : targetLanguage}
                      riassuntoBreve={results.riassunto_breve}
                      riassuntoEsteso={results.riassunto_esteso}
                      flashcards={results.flashcard}
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
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </div>
  );
};

export default StudiusAIV2;