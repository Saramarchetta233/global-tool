import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface FlashcardState {
  currentCard: number;
  showBack: boolean;
  correctAnswers: number;
  wrongAnswers: number;
  reviewMode: boolean;
  completedCards: number[];
}

export interface QuizBasicState {
  currentQuestion: number;
  userAnswers: (number | null)[];
  showResults: boolean;
  score: number;
}

export interface StudyGuideState {
  studyPlan: any | null;
  daysInput: number;
  probableQuestions: any[];
}

export interface ExamState {
  written: {
    currentQuestion: number;
    userAnswers: (number | string | null)[];
    isCompleted: boolean;
    score: number;
    customQuestions: any[];
    showExplanation: boolean;
    selectedOption: number | null;
    baseQuestions: any[];
    customExamConfig: {
      numQuestions: number;
      difficulty: string;
      type: string;
    };
    generatedExam: any | null;
  };
  oral: {
    currentStep: 'idle' | 'questioning' | 'completed';
    turns: Array<{
      question: string;
      userAnswer: string;
      evaluation: string;
      score: number;
    }>;
  };
}

interface StudySessionState {
  // Session identification
  sessionId: string | null;
  documentId: string | null;
  
  // Document context
  docContext: any | null;
  results: any | null;
  
  // Tutor messages
  tutorMessages: TutorMessage[];
  
  // Tab states
  flashcardState: FlashcardState;
  quizBasicState: QuizBasicState;
  studyGuideState: StudyGuideState;
  examState: ExamState;
  examSubTab: 'scritto' | 'orale';
  
  // Active tab
  activeTab: string;
  
  // Actions
  setSessionId: (id: string | null) => void;
  setDocumentId: (id: string | null) => void;
  setDocContext: (ctx: any) => void;
  setResults: (results: any) => void;
  
  // Tutor actions
  setTutorMessages: (msgs: TutorMessage[]) => void;
  addTutorMessage: (msg: TutorMessage) => void;
  
  // Flashcard actions
  updateFlashcardState: (updates: Partial<FlashcardState>) => void;
  resetFlashcardState: () => void;
  
  // Quiz actions
  updateQuizBasicState: (updates: Partial<QuizBasicState>) => void;
  resetQuizBasicState: () => void;
  
  // Study Guide actions
  updateStudyGuideState: (updates: Partial<StudyGuideState>) => void;
  resetStudyGuideState: () => void;
  
  // Exam actions
  updateExamState: (updates: Partial<ExamState>) => void;
  updateExamWrittenState: (updates: Partial<ExamState['written']>) => void;
  updateExamOralState: (updates: Partial<ExamState['oral']>) => void;
  setExamSubTab: (tab: 'scritto' | 'orale') => void;
  
  // Tab actions
  setActiveTab: (tab: string) => void;
  
  // Reset actions
  resetSession: () => void;
  resetSessionKeepTutor: () => void; // Reset everything except tutor messages
  resetExamState: () => void;
  
  // Load from history
  loadFromHistory: (historyData: any) => void;
}

const initialFlashcardState: FlashcardState = {
  currentCard: 0,
  showBack: false,
  correctAnswers: 0,
  wrongAnswers: 0,
  reviewMode: false,
  completedCards: []
};

const initialQuizBasicState: QuizBasicState = {
  currentQuestion: 0,
  userAnswers: [],
  showResults: false,
  score: 0
};

const initialStudyGuideState: StudyGuideState = {
  studyPlan: null,
  daysInput: 7,
  probableQuestions: []
};

const initialExamState: ExamState = {
  written: {
    currentQuestion: 0,
    userAnswers: [],
    isCompleted: false,
    score: 0,
    customQuestions: [],
    showExplanation: false,
    selectedOption: null,
    baseQuestions: [],
    customExamConfig: {
      numQuestions: 5,
      difficulty: 'Intermedio',
      type: 'Scelta multipla'
    },
    generatedExam: null
  },
  oral: {
    currentStep: 'idle',
    turns: []
  }
};

export const useStudySessionStore = create<StudySessionState>()(
  persist(
    (set, get) => ({
      // Initial state
      sessionId: null,
      documentId: null,
      docContext: null,
      results: null,
      tutorMessages: [],
      flashcardState: initialFlashcardState,
      quizBasicState: initialQuizBasicState,
      studyGuideState: initialStudyGuideState,
      examState: initialExamState,
      examSubTab: 'scritto',
      activeTab: 'riassunto_breve',
      
      // Basic setters
      setSessionId: (id) => set({ sessionId: id }),
      setDocumentId: (id) => set({ documentId: id }),
      setDocContext: (ctx) => set({ docContext: ctx }),
      setResults: (results) => set({ results }),
      
      // Tutor actions
      setTutorMessages: (msgs) => set({ tutorMessages: msgs }),
      addTutorMessage: (msg) => set((state) => ({
        tutorMessages: [...state.tutorMessages, msg]
      })),
      
      // Flashcard actions
      updateFlashcardState: (updates) => set((state) => ({
        flashcardState: { ...state.flashcardState, ...updates }
      })),
      resetFlashcardState: () => set({ flashcardState: initialFlashcardState }),
      
      // Quiz actions
      updateQuizBasicState: (updates) => set((state) => ({
        quizBasicState: { ...state.quizBasicState, ...updates }
      })),
      resetQuizBasicState: () => set({ quizBasicState: initialQuizBasicState }),
      
      // Study Guide actions
      updateStudyGuideState: (updates) => set((state) => ({
        studyGuideState: { ...state.studyGuideState, ...updates }
      })),
      resetStudyGuideState: () => set({ studyGuideState: initialStudyGuideState }),
      
      // Exam actions
      updateExamState: (updates) => set((state) => ({
        examState: { ...state.examState, ...updates }
      })),
      
      updateExamWrittenState: (updates) => set((state) => ({
        examState: {
          ...state.examState,
          written: { ...state.examState.written, ...updates }
        }
      })),
      
      updateExamOralState: (updates) => set((state) => ({
        examState: {
          ...state.examState,
          oral: { ...state.examState.oral, ...updates }
        }
      })),
      
      setExamSubTab: (tab) => set({ examSubTab: tab }),
      
      // Tab actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      // Reset actions
      resetSession: () => set({
        sessionId: null,
        documentId: null,
        docContext: null,
        results: null,
        tutorMessages: [],
        flashcardState: initialFlashcardState,
        quizBasicState: initialQuizBasicState,
        studyGuideState: initialStudyGuideState,
        examState: initialExamState,
        examSubTab: 'scritto',
        activeTab: 'riassunto_breve'
      }),
      
      resetSessionKeepTutor: () => set((state) => ({
        sessionId: null,
        documentId: null,
        docContext: null,
        results: null,
        // Keep tutorMessages intact
        tutorMessages: state.tutorMessages,
        flashcardState: initialFlashcardState,
        quizBasicState: initialQuizBasicState,
        studyGuideState: initialStudyGuideState,
        examState: initialExamState,
        examSubTab: 'scritto',
        activeTab: 'riassunto_breve'
      })),
      
      resetExamState: () => set({
        examState: initialExamState,
        examSubTab: 'scritto'
      }),
      
      // Load from history
      loadFromHistory: (historyData) => {
        // Handle both old localStorage format and new database format
        const isNewFormat = historyData.riassunto_breve !== undefined;
        
        set({
          sessionId: historyData.sessionId || historyData.id,
          documentId: historyData.id,
          docContext: historyData.pdf_text || historyData.extractedText || historyData.docContext,
          results: {
            riassunto_breve: isNewFormat ? historyData.riassunto_breve : historyData.summaryShort,
            riassunto_esteso: isNewFormat ? historyData.riassunto_esteso : historyData.summaryExtended,
            mappa_concettuale: isNewFormat ? historyData.mappa_concettuale : historyData.conceptMap,
            flashcard: isNewFormat ? historyData.flashcard : historyData.flashcards,
            quiz: isNewFormat ? historyData.quiz : historyData.quizData,
            guida_esame: isNewFormat ? historyData.guida_esame : historyData.studyInOneHour,
            sessionId: historyData.sessionId || historyData.id
          },
          tutorMessages: historyData.tutorMessages || [],
          // Restore other states if saved in history
          examState: historyData.examState || initialExamState,
          flashcardState: historyData.flashcardState || initialFlashcardState,
          quizBasicState: historyData.quizBasicState || initialQuizBasicState, 
          studyGuideState: historyData.studyGuideState || initialStudyGuideState
          // Note: activeTab is kept persistent, don't reset it
        });
      }
    }),
    {
      name: 'study-session-storage',
      partialize: (state) => ({
        // Persisti solo i dati essenziali per la sessione corrente
        sessionId: state.sessionId,
        documentId: state.documentId,
        tutorMessages: state.tutorMessages,
        flashcardState: state.flashcardState,
        quizBasicState: state.quizBasicState,
        studyGuideState: state.studyGuideState,
        examState: state.examState,
        examSubTab: state.examSubTab,
        activeTab: state.activeTab
      })
    }
  )
);