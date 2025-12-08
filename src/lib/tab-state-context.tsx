'use client';

import React, { createContext, useContext, useEffect,useState } from 'react';

interface TabStateContextType {
  // Quiz/Exam state
  examSubTab: 'scritto' | 'orale';
  setExamSubTab: (tab: 'scritto' | 'orale') => void;
  
  // Quiz state persistence
  quizState: {
    currentQuestion: number;
    userAnswers: (number | string | null)[];
    isCompleted: boolean;
    score: number;
    customQuestions: any[];
    showExplanation: boolean;
    selectedOption: number | null;
  };
  updateQuizState: (updates: Partial<TabStateContextType['quizState']>) => void;
  
  // Oral exam state
  oralExamState: {
    currentStep: 'idle' | 'questioning' | 'completed';
    sessionHistory: any[];
  };
  updateOralExamState: (updates: Partial<TabStateContextType['oralExamState']>) => void;
  
  // Reset all state when new document is loaded
  resetAllState: () => void;
}

const TabStateContext = createContext<TabStateContextType | undefined>(undefined);

export function TabStateProvider({ children }: { children: React.ReactNode }) {
  const [examSubTab, setExamSubTab] = useState<'scritto' | 'orale'>('scritto');
  
  const [quizState, setQuizState] = useState({
    currentQuestion: 0,
    userAnswers: [] as (number | string | null)[],
    isCompleted: false,
    score: 0,
    customQuestions: [] as any[],
    showExplanation: false,
    selectedOption: null as number | null
  });
  
  const [oralExamState, setOralExamState] = useState({
    currentStep: 'idle' as 'idle' | 'questioning' | 'completed',
    sessionHistory: [] as any[]
  });

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('studius-tab-state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setExamSubTab(parsed.examSubTab || 'scritto');
        setQuizState(prev => ({ ...prev, ...parsed.quizState }));
        setOralExamState(prev => ({ ...prev, ...parsed.oralExamState }));
      }
    } catch (error) {
      console.warn('Failed to load tab state from localStorage:', error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      const stateToSave = {
        examSubTab,
        quizState,
        oralExamState
      };
      localStorage.setItem('studius-tab-state', JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save tab state to localStorage:', error);
    }
  }, [examSubTab, quizState, oralExamState]);

  const updateQuizState = (updates: Partial<typeof quizState>) => {
    setQuizState(prev => ({ ...prev, ...updates }));
  };

  const updateOralExamState = (updates: Partial<typeof oralExamState>) => {
    setOralExamState(prev => ({ ...prev, ...updates }));
  };

  const resetAllState = () => {
    setExamSubTab('scritto');
    setQuizState({
      currentQuestion: 0,
      userAnswers: [],
      isCompleted: false,
      score: 0,
      customQuestions: [],
      showExplanation: false,
      selectedOption: null
    });
    setOralExamState({
      currentStep: 'idle',
      sessionHistory: []
    });
    localStorage.removeItem('studius-tab-state');
  };

  return (
    <TabStateContext.Provider value={{
      examSubTab,
      setExamSubTab,
      quizState,
      updateQuizState,
      oralExamState,
      updateOralExamState,
      resetAllState
    }}>
      {children}
    </TabStateContext.Provider>
  );
}

export function useTabState() {
  const context = useContext(TabStateContext);
  if (context === undefined) {
    throw new Error('useTabState must be used within a TabStateProvider');
  }
  return context;
}