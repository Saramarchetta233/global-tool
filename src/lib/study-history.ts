export interface StudyHistory {
  id: string;
  userId: string;
  docContextId?: string;
  docTitle: string;
  docName?: string;
  targetLanguage: string;
  summaryShort: string;
  summaryExtended: string;
  conceptMap: any[];
  flashcards: any[];
  quizData: any[];
  studyInOneHour: any;
  studyPlan?: any;
  probableQuestions?: any[];
  tutorMessages?: TutorMessage[];
  oralExamHistory?: OralExamTurn[];
  extractedText?: string; // Testo estratto dal PDF per il tutor
  sessionId?: string; // ID della sessione Supabase per il tutor
  createdAt: string;
  updatedAt: string;
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface OralExamTurn {
  id: string;
  question: string;
  userAnswer: string;
  aiEvaluation: string;
  score: number;
  feedback: string;
  timestamp: string;
}

/**
 * Salva o aggiorna una sessione di studio nello storico
 */
export async function saveStudySession(session: Omit<StudyHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<StudyHistory> {
  const { supabase } = await import('@/lib/supabase');
  
  const sessionId = session.sessionId || crypto.randomUUID();
  const now = new Date().toISOString();
  
  const studySession: StudyHistory = {
    ...session,
    id: sessionId,
    createdAt: now,
    updatedAt: now
  };
  
  try {
    // Salva nel database Supabase
    const { error } = await supabase
      .from('tutor_sessions')
      .upsert({
        id: sessionId,
        user_id: session.userId,
        file_name: session.docName || session.docTitle,
        title: session.docTitle,
        riassunto_breve: session.summaryShort,
        riassunto_esteso: session.summaryExtended,
        mappa_concettuale: session.conceptMap,
        flashcard: session.flashcards,
        quiz: session.quizData,
        guida_esame: session.studyInOneHour,
        extracted_text: session.extractedText,
        target_language: session.targetLanguage,
        tutor_messages: session.tutorMessages || [],
        oral_exam_history: session.oralExamHistory || [],
        created_at: now,
        updated_at: now,
        last_used_at: now
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ [SAVE_HISTORY] Database save failed:', error);
      throw error;
    }
    
    console.log('✅ [SAVE_HISTORY] Successfully saved to database:', { 
      id: sessionId.substring(0, 8), 
      fileName: session.docName || session.docTitle 
    });
    
  } catch (dbError) {
    console.error('❌ [SAVE_HISTORY] Database error, falling back to localStorage:', dbError);
  }
  
  // Mantieni anche il localStorage come backup
  const existingSessions = getStoredSessions();
  existingSessions.push(studySession);
  localStorage.setItem('studyHistory', JSON.stringify(existingSessions));
  
  return studySession;
}

/**
 * Aggiorna una sessione esistente
 */
export async function updateStudySession(sessionId: string, updates: Partial<StudyHistory>): Promise<StudyHistory | null> {
  const sessions = getStoredSessions();
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);
  
  if (sessionIndex === -1) {
    return null;
  }
  
  sessions[sessionIndex] = {
    ...sessions[sessionIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem('studyHistory', JSON.stringify(sessions));
  return sessions[sessionIndex];
}

/**
 * Recupera tutte le sessioni di studio di un utente
 */
export async function getUserStudySessions(userId: string): Promise<StudyHistory[]> {
  const allSessions = getStoredSessions();
  return allSessions
    .filter(session => session.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Recupera una singola sessione per ID
 */
export async function getStudySession(sessionId: string): Promise<StudyHistory | null> {
  const sessions = getStoredSessions();
  return sessions.find(s => s.id === sessionId) || null;
}

/**
 * Trova una sessione per userId e contenuto del documento
 */
export async function findSessionByContent(userId: string, docContext: string): Promise<StudyHistory | null> {
  const sessions = getStoredSessions();
  const docHash = btoa(docContext.substring(0, 100) + userId).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  
  // Prima cerca sessioni che hanno questo hash nel sessionId (sessioni temporanee)
  const tempSession = sessions.find(s => 
    s.userId === userId && 
    s.id.includes(docHash)
  );
  
  if (tempSession) {
    return tempSession;
  }
  
  // Poi cerca per contenuto estratto simile
  const contentStart = docContext.substring(0, 200).trim();
  return sessions.find(s => 
    s.userId === userId && 
    s.extractedText && 
    s.extractedText.substring(0, 200).trim() === contentStart
  ) || null;
}

/**
 * Elimina una sessione di studio
 */
export async function deleteStudySession(sessionId: string): Promise<boolean> {
  const sessions = getStoredSessions();
  const filteredSessions = sessions.filter(s => s.id !== sessionId);
  
  if (filteredSessions.length === sessions.length) {
    return false; // Sessione non trovata
  }
  
  localStorage.setItem('studyHistory', JSON.stringify(filteredSessions));
  return true;
}

/**
 * Aggiunge un messaggio del tutor a una sessione
 */
export async function addTutorMessage(sessionId: string, message: Omit<TutorMessage, 'id' | 'timestamp'>): Promise<boolean> {
  const session = await getStudySession(sessionId);
  if (!session) return false;
  
  const tutorMessage: TutorMessage = {
    ...message,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString()
  };
  
  const updatedMessages = [...(session.tutorMessages || []), tutorMessage];
  await updateStudySession(sessionId, { tutorMessages: updatedMessages });
  
  return true;
}

/**
 * Aggiunge un turno di esame orale a una sessione
 */
export async function addOralExamTurn(sessionId: string, turn: Omit<OralExamTurn, 'id' | 'timestamp'>): Promise<boolean> {
  const session = await getStudySession(sessionId);
  if (!session) return false;
  
  const oralTurn: OralExamTurn = {
    ...turn,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString()
  };
  
  const updatedHistory = [...(session.oralExamHistory || []), oralTurn];
  await updateStudySession(sessionId, { oralExamHistory: updatedHistory });
  
  return true;
}

/**
 * Utility per recuperare le sessioni dal localStorage
 */
function getStoredSessions(): StudyHistory[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('studyHistory');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error parsing stored sessions:', error);
    return [];
  }
}

/**
 * Esporta una sessione in formato JSON
 */
export function exportStudySession(session: StudyHistory): string {
  return JSON.stringify(session, null, 2);
}

/**
 * Converte i risultati di studio attuali in formato StudyHistory
 */
export function convertResultsToHistory(
  results: any, 
  userId: string, 
  docTitle: string, 
  targetLanguage: string
): Omit<StudyHistory, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    userId,
    docTitle,
    docName: docTitle,
    targetLanguage,
    summaryShort: results.riassunto_breve || '',
    summaryExtended: results.riassunto_esteso || '',
    conceptMap: results.mappa_concettuale || [],
    flashcards: results.flashcard || [],
    quizData: results.quiz || [],
    studyInOneHour: results.guida_esame || '',
    extractedText: results.extractedText || '', // Include il testo PDF per il tutor
    sessionId: results.sessionId || undefined, // Include il sessionId di Supabase
    tutorMessages: [],
    oralExamHistory: []
  };
}