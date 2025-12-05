'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Brain } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const questions: QuizQuestion[] = [
  {
    question: "Qual è il pianeta più grande del sistema solare?",
    options: ["Saturno", "Giove", "Nettuno", "Terra"],
    correct: 1,
    explanation: "Giove è il pianeta più grande del sistema solare!"
  },
  {
    question: "In che anno è caduto il muro di Berlino?",
    options: ["1987", "1988", "1989", "1990"],
    correct: 2,
    explanation: "Il muro di Berlino è caduto il 9 novembre 1989."
  },
  {
    question: "Quale scienziato ha formulato la teoria della relatività?",
    options: ["Newton", "Einstein", "Galilei", "Tesla"],
    correct: 1,
    explanation: "Albert Einstein ha formulato la teoria della relatività."
  },
  {
    question: "Qual è la capitale dell'Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Perth"],
    correct: 2,
    explanation: "Canberra è la capitale dell'Australia, non Sydney!"
  },
  {
    question: "Quanti continenti ci sono sulla Terra?",
    options: ["5", "6", "7", "8"],
    correct: 2,
    explanation: "Ci sono 7 continenti: Africa, Asia, Europa, Nord America, Sud America, Oceania e Antartide."
  },
  {
    question: "Chi ha dipinto la Gioconda?",
    options: ["Michelangelo", "Raffaello", "Leonardo da Vinci", "Donatello"],
    correct: 2,
    explanation: "La Gioconda è stata dipinta da Leonardo da Vinci."
  },
  {
    question: "Qual è l'elemento chimico con simbolo 'O'?",
    options: ["Oro", "Ossigeno", "Osmio", "Ozono"],
    correct: 1,
    explanation: "O è il simbolo dell'ossigeno nella tavola periodica."
  },
  {
    question: "In quale anno è iniziata la Prima Guerra Mondiale?",
    options: ["1912", "1913", "1914", "1915"],
    correct: 2,
    explanation: "La Prima Guerra Mondiale è iniziata nel 1914."
  },
  {
    question: "Qual è l'oceano più grande del mondo?",
    options: ["Atlantico", "Indiano", "Artico", "Pacifico"],
    correct: 3,
    explanation: "L'oceano Pacifico è il più grande oceano del mondo."
  },
  {
    question: "Quante zampe ha un ragno?",
    options: ["6", "8", "10", "12"],
    correct: 1,
    explanation: "I ragni hanno 8 zampe, sono aracnidi non insetti!"
  },
  {
    question: "Chi ha scritto 'I Promessi Sposi'?",
    options: ["Dante", "Manzoni", "Leopardi", "Petrarca"],
    correct: 1,
    explanation: "Alessandro Manzoni ha scritto 'I Promessi Sposi'."
  },
  {
    question: "Qual è la montagna più alta del mondo?",
    options: ["K2", "Everest", "Kangchenjunga", "Makalu"],
    correct: 1,
    explanation: "L'Everest è la montagna più alta del mondo con 8.848 metri."
  },
  {
    question: "Quante stringhe ha una chitarra classica?",
    options: ["4", "5", "6", "7"],
    correct: 2,
    explanation: "Una chitarra classica ha 6 corde."
  },
  {
    question: "In quale città si trova la Torre Pendente?",
    options: ["Roma", "Firenze", "Pisa", "Venezia"],
    correct: 2,
    explanation: "La Torre Pendente si trova a Pisa."
  },
  {
    question: "Qual è la lingua più parlata al mondo?",
    options: ["Inglese", "Cinese Mandarino", "Spagnolo", "Hindi"],
    correct: 1,
    explanation: "Il cinese mandarino è la lingua più parlata al mondo."
  },
  {
    question: "Quanti lati ha un esagono?",
    options: ["5", "6", "7", "8"],
    correct: 1,
    explanation: "Un esagono ha 6 lati."
  },
  {
    question: "Chi ha inventato il telefono?",
    options: ["Edison", "Bell", "Tesla", "Marconi"],
    correct: 1,
    explanation: "Alexander Graham Bell ha inventato il telefono."
  },
  {
    question: "Qual è il fiume più lungo d'Italia?",
    options: ["Tevere", "Arno", "Po", "Adige"],
    correct: 2,
    explanation: "Il Po è il fiume più lungo d'Italia."
  },
  {
    question: "Quante ore ci sono in una settimana?",
    options: ["164", "166", "168", "170"],
    correct: 2,
    explanation: "Ci sono 168 ore in una settimana (7 giorni × 24 ore)."
  },
  {
    question: "Qual è la velocità della luce?",
    options: ["200.000 km/s", "300.000 km/s", "400.000 km/s", "500.000 km/s"],
    correct: 1,
    explanation: "La velocità della luce è di circa 300.000 km/s."
  }
];

const MiniQuiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [usedQuestions, setUsedQuestions] = useState<number[]>([]);

  // Seleziona una domanda casuale non ancora usata
  const getRandomQuestion = () => {
    const availableQuestions = questions
      .map((_, index) => index)
      .filter(index => !usedQuestions.includes(index));
    
    if (availableQuestions.length === 0) {
      // Se tutte le domande sono state usate, ricomincia
      setUsedQuestions([]);
      return Math.floor(Math.random() * questions.length);
    }
    
    return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  };

  // Inizializza con una domanda casuale
  useEffect(() => {
    const initialQuestion = getRandomQuestion();
    setCurrentQuestion(initialQuestion);
    setUsedQuestions([initialQuestion]);
  }, []);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    
    if (answerIndex === questions[currentQuestion].correct) {
      setScore(prev => prev + 1);
    }
    
    // Dopo 4 secondi, passa alla domanda successiva
    setTimeout(() => {
      const nextQuestion = getRandomQuestion();
      setCurrentQuestion(nextQuestion);
      setUsedQuestions(prev => [...prev, nextQuestion]);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }, 4000);
  };

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correct;

  return (
    <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white text-center">Mentre aspetti... metti alla prova la tua cultura!</h3>
      </div>
      
      {/* Score */}
      <div className="text-center mb-4">
        <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
          Punteggio: {score}
        </span>
      </div>

      {/* Question */}
      <div className="mb-6">
        <p className="text-white text-center font-medium mb-4 leading-relaxed">
          {question.question}
        </p>
        
        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((option, index) => {
            let buttonClass = "w-full p-3 rounded-xl border-2 transition-all duration-300 font-medium text-sm ";
            
            if (showFeedback) {
              if (index === question.correct) {
                buttonClass += "border-green-500 bg-green-500/20 text-green-300";
              } else if (index === selectedAnswer) {
                buttonClass += "border-red-500 bg-red-500/20 text-red-300";
              } else {
                buttonClass += "border-gray-600 bg-gray-600/20 text-gray-400";
              }
            } else {
              buttonClass += "border-white/20 bg-white/10 text-gray-200 hover:border-purple-400 hover:bg-purple-400/20 hover:text-white cursor-pointer";
            }
            
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showFeedback}
                className={buttonClass}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 text-left">{option}</span>
                  {showFeedback && index === question.correct && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                  {showFeedback && index === selectedAnswer && index !== question.correct && (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={`text-center p-4 rounded-xl ${isCorrect ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
          <p className={`font-semibold mb-2 ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
            {isCorrect ? '🎉 Corretto!' : '❌ Sbagliato!'}
          </p>
          <p className="text-sm text-gray-300">{question.explanation}</p>
          <p className="text-xs text-gray-400 mt-2">Prossima domanda tra...</p>
        </div>
      )}
    </div>
  );
};

export default MiniQuiz;