export const CreditCosts = {
  // PDF - NUOVA STRUTTURA COSTI
  pdfShort: 10,       // 0–40 pagine
  pdfMedium: 20,      // 40–100 pagine
  pdfLong: 30,        // 100–200 pagine
  pdfXL: 40,          // 200–400 pagine
  pdfXXL: 60,         // 400–600 pagine
  pdfHuge: 80,        // 600–1000 pagine
  pdfMassive: 100,    // 1000+ pagine

  // Esame scritto - REGOLE DEFINITIVE
  examBaseFree: 0,   // 3 domande base sempre gratis
  exam5: 10,         // 5 domande
  exam10: 15,        // 10 domande
  exam20: 25,        // 20 domande

  // Esame orale - REGOLE DEFINITIVE
  oralExamFirst: 0,     // prima sessione sempre gratis
  oralExam: 25,         // sessioni successive 25 crediti
  
  // Master in 60 minuti - REGOLE DEFINITIVE
  studyPlanFree: 0,        // Piano Studio Rapido sempre gratis
  strategiaFree: 0,        // Strategia per studiare in 1 ora sempre gratis
  probableFirst: 0,        // prima generazione domande probabili gratis
  probablePaid: 5,         // successive generazioni domande probabili

  // Tutor AI - REGOLE DEFINITIVE
  tutorFreeMessages: 3,    // primi 3 messaggi gratis per utente
  tutorMessageCost: 2,     // dal 4° messaggio in poi

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
  if (pageCount <= 40) return CreditCosts.pdfShort;      // 10 crediti
  if (pageCount <= 100) return CreditCosts.pdfMedium;    // 20 crediti
  if (pageCount <= 200) return CreditCosts.pdfLong;      // 30 crediti
  if (pageCount <= 400) return CreditCosts.pdfXL;        // 40 crediti
  if (pageCount <= 600) return CreditCosts.pdfXXL;       // 60 crediti
  if (pageCount <= 1000) return CreditCosts.pdfHuge;     // 80 crediti
  return CreditCosts.pdfMassive;                         // 100 crediti
}

export function getPdfCostDescription(pageCount: number): string {
  if (pageCount <= 40) return 'Elaborazione PDF (1-40 pagine)';
  if (pageCount <= 100) return 'Elaborazione PDF (41-100 pagine)';
  if (pageCount <= 200) return 'Elaborazione PDF (101-200 pagine)';
  if (pageCount <= 400) return 'Elaborazione PDF (201-400 pagine)';
  if (pageCount <= 600) return 'Elaborazione PDF (401-600 pagine)';
  if (pageCount <= 1000) return 'Elaborazione PDF (601-1000 pagine)';
  return 'Elaborazione PDF (1000+ pagine)';
}

// Messaggi per ogni tipo di feature
export const CreditMessages = {
  pdfShort: 'Elaborazione PDF (1-40 pagine)',
  pdfMedium: 'Elaborazione PDF (41-100 pagine)',
  pdfLong: 'Elaborazione PDF (101-200 pagine)',
  pdfXL: 'Elaborazione PDF (201-400 pagine)',
  pdfXXL: 'Elaborazione PDF (401-600 pagine)',
  pdfHuge: 'Elaborazione PDF (601-1000 pagine)',
  pdfMassive: 'Elaborazione PDF (1000+ pagine)',
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