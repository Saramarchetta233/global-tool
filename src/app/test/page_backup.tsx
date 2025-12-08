'use client';

import React, { useRef,useState } from 'react';

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

// Main Component
const StudyFlashAI: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('Italiano');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<StudyResults | null>(null);
  const [activeTab, setActiveTab] = useState('riassunto_breve');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-h-screen bg-slate-900">
      <h1 className="text-white">Test Page</h1>
    </div>
  );
};

export default StudyFlashAI;