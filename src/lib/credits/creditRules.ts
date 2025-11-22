export const CreditCosts = {
  // PDF - REGOLE DEFINITIVE
  pdfShort: 10,    // 1–20 pagine
  pdfMedium: 15,   // 21–50 pagine
  pdfLong: 25,     // 51–100 pagine
  pdfXL: 40,       // 100+ pagine

  // Esame scritto - REGOLE DEFINITIVE
  examBaseFree: 0,   // 3 domande base sempre gratis
  exam5: 10,         // 5 domande
  exam10: 15,        // 10 domande
  exam20: 25,        // 20 domande

  // Esame orale - REGOLE DEFINITIVE
  oralExamFirst: 0,     // prima sessione sempre gratis
  oralExam: 10,         // sessioni successive 10 crediti
  
  // Master in 60 minuti - REGOLE DEFINITIVE
  studyPlanFree: 0,        // Piano Studio Rapido sempre gratis
  strategiaFree: 0,        // Strategia per studiare in 1 ora sempre gratis
  probableFirst: 0,        // prima generazione domande probabili gratis
  probablePaid: 5,         // successive generazioni domande probabili

  // Tutor AI - REGOLE DEFINITIVE
  tutorFreeMessages: 5,    // primi 5 messaggi gratis per sessione
  tutorMessageCost: 2,     // dal 6° messaggio in poi

  // Audio & Flashcards - REGOLE DEFINITIVE
  audioPlay: 0,            // ascolto nel browser sempre gratis
  audioDownload: 5,        // download MP3
  flashcardsView: 0,       // visualizzazione flashcards gratis
  flashcardsDownload: 0,   // download PDF flashcards GRATIS

  // Piani ricariche
  recharge1000: 1000,      // 4,99€
  recharge3000: 3000,      // 9,99€
  recharge10000: 10000,    // 24,99€
  subscriptionMonthly: 1500, // 19,99€/mese
  planLifetime: 5000,      // 69€ una tantum
} as const;

// Helper functions per calcolare costi
export function getExamCost(numQuestions: number): number {
  if (numQuestions <= 3) return CreditCosts.examBaseFree;
  if (numQuestions <= 5) return CreditCosts.exam5;
  if (numQuestions <= 10) return CreditCosts.exam10;
  if (numQuestions <= 20) return CreditCosts.exam20;
  return CreditCosts.exam20; // Default per numeri più alti
}

export function getExamCostDescription(numQuestions: number): string {
  if (numQuestions <= 3) return 'Quiz base gratuito';
  if (numQuestions <= 5) return 'Quiz 5 domande';
  if (numQuestions <= 10) return 'Quiz 10 domande';
  if (numQuestions <= 20) return 'Quiz 20 domande';
  return 'Quiz personalizzato';
}

export type CreditCostType = keyof typeof CreditCosts;

// Helper function per calcolare costo PDF basato su numero pagine
export function getPdfCost(pageCount: number): number {
  if (pageCount <= 20) return CreditCosts.pdfShort;    // 10 crediti
  if (pageCount <= 50) return CreditCosts.pdfMedium;   // 15 crediti
  if (pageCount <= 100) return CreditCosts.pdfLong;    // 25 crediti
  return CreditCosts.pdfXL;                            // 40 crediti
}

export function getPdfCostDescription(pageCount: number): string {
  if (pageCount <= 20) return 'Elaborazione PDF (1-20 pagine)';
  if (pageCount <= 50) return 'Elaborazione PDF (21-50 pagine)';
  if (pageCount <= 100) return 'Elaborazione PDF (51-100 pagine)';
  return 'Elaborazione PDF (100+ pagine)';
}

// Messaggi per ogni tipo di feature
export const CreditMessages = {
  pdfShort: 'Elaborazione PDF (1-20 pagine)',
  pdfMedium: 'Elaborazione PDF (21-50 pagine)',
  pdfLong: 'Elaborazione PDF (51-100 pagine)',
  pdfXL: 'Elaborazione PDF (100+ pagine)',
  examBaseFree: 'Quiz base (3 domande)',
  exam5: 'Esame 5 domande',
  exam10: 'Esame 10 domande',
  exam20: 'Esame 20 domande',
  oralExamFirst: 'Prima sessione orale',
  oralExam: 'Sessione esame orale',
  studyPlanFree: 'Piano studio rapido',
  strategiaFree: 'Strategia studio 1 ora',
  probableFirst: 'Domande probabili (prima volta)',
  probablePaid: 'Domande probabili',
  tutorMessageCost: 'Messaggio tutor AI',
  audioPlay: 'Ascolto audio',
  audioDownload: 'Download audio MP3',
  flashcardsView: 'Visualizzazione flashcards',
  flashcardsDownload: 'Download flashcards PDF',
} as const;