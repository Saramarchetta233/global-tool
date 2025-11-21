export const CreditCosts = {
  // PDF
  pdfShort: 10,    // 1–20 pagine
  pdfMedium: 15,   // 21–50 pagine
  pdfLong: 25,     // 51–100 pagine
  pdfXL: 40,       // >100 pagine
  pdfPremiumExtra: 20,

  // Esame scritto
  exam5: 10,
  exam10: 15,
  exam20: 25,

  // Esame orale
  oralExam: 10,    // una sessione
  oralExtra3: 5,   // +3 turni extra

  // Domande probabili
  probableFreeOnce: true,  // prima gratuita
  probablePaid: 5,

  // Tutor
  tutorFreeMessages: 5,
  tutorMessageCost: 2,

  // Audio
  audioDownload: 5,

  // Flashcards PDF
  flashcardsDownload: 5,
} as const;

export type CreditCostType = keyof typeof CreditCosts;

// Messaggi per ogni tipo di feature
export const CreditMessages = {
  pdfShort: 'Elaborazione PDF (1-20 pagine)',
  pdfMedium: 'Elaborazione PDF (21-50 pagine)',
  pdfLong: 'Elaborazione PDF (51-100 pagine)',
  pdfXL: 'Elaborazione PDF (100+ pagine)',
  pdfPremiumExtra: 'Elaborazione Premium',
  exam5: 'Esame 5 domande',
  exam10: 'Esame 10 domande',
  exam20: 'Esame 20 domande',
  oralExam: 'Sessione esame orale',
  oralExtra3: 'Turni extra esame orale',
  probablePaid: 'Domande probabili',
  tutorMessageCost: 'Messaggio tutor AI',
  audioDownload: 'Download audio',
  flashcardsDownload: 'Download flashcards PDF',
} as const;