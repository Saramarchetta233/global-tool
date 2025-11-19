'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, Brain, Download, Play, ChevronLeft, ChevronRight, Sparkles, Zap, Target, Clock, BookOpen, Star, Rocket, Award } from 'lucide-react';

// Types
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
    [key: string]: any;
  };
}

// Real AI Processing Function using OpenAI API
const processWithAI = async (file: File, language: string): Promise<StudyResults> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);

  const response = await fetch('/api/process-pdf', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to process PDF');
  }

  return await response.json();
};

// PDF processing is now handled by the API route

// Components
const ConceptMap: React.FC<{ concepts: ConceptNode[] }> = ({ concepts }) => {
  const renderNode = (node: ConceptNode, level: number = 0) => (
    <li key={node.title} className={`ml-${level * 4} mb-3`}>
      <div className={`${
        level === 0 
          ? 'font-bold text-xl text-emerald-300 bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/30' 
          : level === 1 
            ? 'font-semibold text-lg text-teal-300 bg-teal-500/10 px-3 py-1 rounded-lg' 
            : 'font-medium text-gray-200 bg-white/5 px-2 py-1 rounded-md'
        } mb-2 inline-block`}>
        {node.title}
      </div>
      {node.children && (
        <ul className="ml-4 border-l-2 border-emerald-400/30 pl-4 mt-2">
          {node.children.map(child => renderNode(child, level + 1))}
        </ul>
      )}
    </li>
  );

  return (
    <ul className="space-y-4">
      {concepts.map(concept => renderNode(concept))}
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

  if (flashcards.length === 0) return <div className="text-gray-300 text-center">Nessuna flashcard disponibile</div>;

  return (
    <div className="max-w-lg mx-auto">
      <div className="relative">
        {/* Card glow effect */}
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

const QuizView: React.FC<{ questions: QuizQuestion[] }> = ({ questions }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const selectOption = (index: number) => {
    setSelectedOption(index);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setCurrentQuestion((prev) => (prev + 1) % questions.length);
    setSelectedOption(null);
    setShowExplanation(false);
  };

  if (questions.length === 0) return <div className="text-gray-300 text-center">Nessuna domanda disponibile</div>;

  const question = questions[currentQuestion];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 text-center">
        <span className="bg-gradient-to-r from-orange-400 to-amber-400 text-white px-4 py-2 rounded-full text-sm font-medium">
          Domanda {currentQuestion + 1} / {questions.length}
        </span>
      </div>

      <div className="relative">
        {/* Quiz glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-xl"></div>
        
        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <h3 className="text-2xl font-semibold mb-8 text-white leading-relaxed">{question.question}</h3>

          <div className="space-y-4 mb-8">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => selectOption(index)}
                disabled={selectedOption !== null}
                className={`w-full p-4 text-left rounded-2xl border-2 transition-all duration-300 font-medium ${selectedOption === null
                    ? 'border-white/20 hover:border-orange-400/50 hover:bg-white/10 text-gray-200 hover:text-white'
                    : selectedOption === index
                      ? index === question.correct_option_index
                        ? 'border-green-500 bg-green-500/20 text-green-300 backdrop-blur-sm'
                        : 'border-red-500 bg-red-500/20 text-red-300 backdrop-blur-sm'
                      : index === question.correct_option_index
                        ? 'border-green-500 bg-green-500/20 text-green-300 backdrop-blur-sm'
                        : 'border-white/10 bg-white/5 text-gray-400'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                    selectedOption === null 
                      ? 'border-gray-400 text-gray-400' 
                      : selectedOption === index
                        ? index === question.correct_option_index
                          ? 'border-green-400 bg-green-500 text-white'
                          : 'border-red-400 bg-red-500 text-white'
                        : index === question.correct_option_index
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

          {showExplanation && (
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

          {showExplanation && (
            <button
              onClick={nextQuestion}
              className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-3 rounded-xl hover:from-orange-700 hover:to-amber-700 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.05] flex items-center gap-2"
            >
              <span>Prossima Domanda</span>
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Component
const StudiusAI: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('Italiano');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<StudyResults | null>(null);
  const [activeTab, setActiveTab] = useState('riassunto_breve');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    setLoading(true);
    setError(null);
    try {
      const studyResults = await processWithAI(file, language);
      setResults(studyResults);
    } catch (error) {
      console.error('Errore durante elaborazione:', error);
      const errorMessage = error instanceof Error ? error.message : 'Errore durante elaborazione del documento. Riprova.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadSummary = () => {
    if (!results) return;

    const content = `RIASSUNTO BREVE:\n\n${results.riassunto_breve}\n\n\nRIASSUNTO ESTESO:\n\n${results.riassunto_esteso}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'riassunto.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadFlashcards = () => {
    if (!results) return;

    const csvContent = 'front,back\n' +
      results.flashcard.map(card => `"${card.front}","${card.back}"`).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'riassunto_breve', label: 'Riassunto Breve', icon: FileText },
    { id: 'riassunto_esteso', label: 'Riassunto Esteso', icon: FileText },
    { id: 'mappa_concettuale', label: 'Mappa Concettuale', icon: Brain },
    { id: 'flashcard', label: 'Flashcard', icon: Upload },
    { id: 'quiz', label: 'Quiz', icon: Play },
    { id: 'guida_esame', label: 'Studia in 1 ora', icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-purple-900/10 to-blue-900/10"></div>
      
      {/* Header */}
      <header className="relative z-10 pt-8 pb-4">
        <div className="max-w-6xl mx-auto px-4">
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
          </div>
        </div>
      </header>

      {/* Introduction Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Come funziona <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Studius AI</span>?
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Carica il tuo PDF e in pochi secondi ricevi materiali di studio personalizzati e ottimizzati per massimizzare il tuo apprendimento.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Riassunti */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:border-blue-400/30 transition-all duration-300 text-center h-full">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">📄 Riassunti</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Riassunti brevi e dettagliati che catturano i concetti essenziali del tuo documento in modo chiaro e strutturato.
              </p>
            </div>
          </div>

          {/* Flashcard */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:border-pink-400/30 transition-all duration-300 text-center h-full">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">🧠 Flashcard</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Carte interattive per memorizzazione attiva, perfette per ripassi rapidi e consolidamento delle informazioni chiave.
              </p>
            </div>
          </div>

          {/* Quiz */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:border-orange-400/30 transition-all duration-300 text-center h-full">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">🎯 Quiz</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Quiz interattivi con spiegazioni dettagliate per testare la tua comprensione e identificare aree di miglioramento.
              </p>
            </div>
          </div>

          {/* Studia in 1 ora */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:border-violet-400/30 transition-all duration-300 text-center h-full">
              <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">⚡ Studia in 1 ora</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Piano di studio intensivo e strategico per massimizzare l'apprendimento in sessioni di studio concentrate.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm px-6 py-4 rounded-2xl border border-purple-500/30">
            <Rocket className="w-6 h-6 text-purple-400" />
            <span className="text-purple-300 font-medium">Inizia ora - Carica il tuo primo documento</span>
            <span className="text-2xl">⬇️</span>
          </div>
        </div>
      </section>

      <main className="relative z-10 max-w-6xl mx-auto px-4 pb-16">
        {!results ? (
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
                <div className="mb-8">
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

                {/* Process Button */}
                <button
                  onClick={processDocument}
                  disabled={!file || loading}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none group"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>🚀 Elaborazione magica in corso...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <Sparkles className="w-6 h-6" />
                      <span>✨ Genera materiali di studio AI</span>
                      <Rocket className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                  
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl"></div>
                </button>

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

            {/* Export Buttons */}
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
              <button
                onClick={() => setResults(null)}
                className="relative overflow-hidden bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/20 flex items-center gap-2 font-medium transition-all duration-300 backdrop-blur-sm border border-white/20"
              >
                <Upload size={18} />
                <span>Nuovo Documento</span>
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="mb-8">
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-2 border border-white/10">
                <nav className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
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
                      <div>
                        <h3 className="text-2xl font-bold text-white">Riassunto Breve</h3>
                        <p className="text-gray-400">Panoramica essenziale dei concetti chiave</p>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <p className="text-gray-200 leading-relaxed text-lg">{results.riassunto_breve}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'riassunto_esteso' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Riassunto Esteso</h3>
                        <p className="text-gray-400">Analisi approfondita e dettagliata</p>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <p className="text-gray-200 leading-relaxed text-lg whitespace-pre-wrap">{results.riassunto_esteso}</p>
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
                        <h3 className="text-2xl font-bold text-white">Quiz Interattivo</h3>
                        <p className="text-gray-400">Verifica le tue conoscenze</p>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <QuizView questions={results.quiz} />
                    </div>
                  </div>
                )}

                {activeTab === 'guida_esame' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Studia in 1 ora</h3>
                        <p className="text-gray-400">Piano strategico per imparare rapidamente</p>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm p-6 rounded-2xl mb-6 border border-green-500/30">
                        <h4 className="text-lg font-semibold text-green-300 mb-3 flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          🎯 Strategia per Studiare in 1 ora
                        </h4>
                        <p className="text-green-200">
                          Seguendo questa guida ottimizzata, potrai padroneggiare i concetti chiave e superare esame con successo.
                        </p>
                      </div>
                      <div className="text-gray-200 leading-relaxed">
                        {typeof results.guida_esame === 'string' ? (
                          <div className="whitespace-pre-wrap text-lg">{results.guida_esame}</div>
                        ) : (
                          <div className="space-y-6">
                            {results.guida_esame && typeof results.guida_esame === 'object' && 'piano_di_studio' in results.guida_esame ? (
                              <>
                                {results.guida_esame.tempo_totale && (
                                  <div className="bg-blue-500/20 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/30">
                                    <h5 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                                      <Clock className="w-5 h-5" />
                                      ⏱️ Tempo Totale
                                    </h5>
                                    <p className="text-blue-200 text-lg">{results.guida_esame.tempo_totale}</p>
                                  </div>
                                )}
                                {results.guida_esame.piano_di_studio && (
                                  <div>
                                    <h5 className="font-semibold text-white mb-4 text-xl flex items-center gap-2">
                                      <BookOpen className="w-6 h-6" />
                                      📋 Piano di Studio
                                    </h5>
                                    {Array.isArray(results.guida_esame.piano_di_studio) ? (
                                      <div className="space-y-4">
                                        {results.guida_esame.piano_di_studio.map((fase: any, index: number) => (
                                          <div key={index} className="bg-white/5 rounded-2xl p-4 border border-white/10 border-l-4 border-l-green-500">
                                            <h6 className="font-medium text-green-300 text-lg mb-2">{fase.fase || `Fase ${index + 1}`}</h6>
                                            {fase.durata && (
                                              <p className="text-purple-300 text-sm mb-2 flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Durata: {fase.durata}
                                              </p>
                                            )}
                                            <p className="text-gray-200 leading-relaxed">{fase.descrizione || fase.attivita || fase}</p>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-gray-200 whitespace-pre-wrap text-lg">{results.guida_esame.piano_di_studio}</div>
                                    )}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-gray-200 whitespace-pre-wrap text-lg">
                                {JSON.stringify(results.guida_esame, null, 2)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudiusAI;