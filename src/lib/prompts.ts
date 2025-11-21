export interface PromptConfig {
  language: string;
  text: string;
  targetLanguage?: string;
}

export const createSummaryPrompt = ({ language, text, targetLanguage }: PromptConfig) => `
Analizza il seguente testo e crea due riassunti in ${targetLanguage || language}:

1. Un riassunto breve (massimo 600 parole) che evidenzi i concetti chiave in paragrafi chiari e strutturati

2. Un riassunto esteso UNIVERSITARIO COMPLETO che deve essere un materiale di studio professionale con:

STRUTTURA OBBLIGATORIA DEL RIASSUNTO ESTESO:
- **PANORAMICA INTRODUTTIVA**: Contesto generale e importanza dell'argomento (150-200 parole)
- **CONCETTI CHIAVE**: Lista numerata dei punti fondamentali con spiegazioni dettagliate
- **TEORIE E MODELLI**: Descrizione approfondita di teorie, autori, modelli teorici con date e contesti
- **ESEMPI APPLICATIVI**: Casi pratici, applicazioni reali, esempi concreti
- **COLLEGAMENTI LOGICI**: Come i concetti si collegano tra loro, cause-effetti, relazioni
- **SINTESI FINALE DA ESAME**: Punti cruciali che uno studente deve assolutamente sapere per l'esame

REQUISITI TECNICI:
- Minimo 1200-1800 parole per il riassunto esteso
- Linguaggio accademico ma chiaro
- **Parole chiave** evidenziate con asterischi
- Nessuna frase vuota o generica
- Riferimenti specifici al testo originale
- Struttura a paragrafi ben definiti
- Collegamenti espliciti tra sezioni

Il riassunto breve deve rimanere conciso e focalizzato sui punti essenziali.

Testo da analizzare:
${text}

IMPORTANTE: Rispondi ESCLUSIVAMENTE con JSON valido nel formato esatto qui sotto. Non aggiungere testo prima o dopo il JSON. Non usare markdown o backticks:

{
  "riassunto_breve": "riassunto breve qui con paragrafi ben strutturati",
  "riassunto_esteso": "RIASSUNTO ESTESO UNIVERSITARIO COMPLETO seguendo la struttura obbligatoria sopra descritta"
}`;

export const createFlashcardsPrompt = ({ language, text, targetLanguage }: PromptConfig) => `
Crea 20 flashcard in ${targetLanguage || language} basate sul seguente testo.

Le flashcard devono essere:
- Semplici e utili per la memorizzazione
- Coprire i concetti più importanti del testo
- Avere domande chiare e risposte concise
- Essere progressive in difficoltà
- Includere sia definizioni che applicazioni pratiche

Testo:
${text}

IMPORTANTE: Rispondi SOLO con JSON valido, senza formattazione markdown:
{
  "flashcard": [
    {"front": "Domanda o concetto da memorizzare", "back": "Risposta chiara e concisa"},
    {"front": "Cos'è...", "back": "Definizione precisa..."}
  ]
}`;

export const createConceptMapPrompt = ({ language, text, targetLanguage }: PromptConfig) => `
Crea una mappa concettuale in ${targetLanguage || language} dal seguente testo.

La mappa deve essere:
- Semplice e leggibile
- Con pochi nodi principali (massimo 8-10)
- Organizzata gerarchicamente
- Con connessioni logiche tra concetti

Testo:
${text}

IMPORTANTE: Rispondi SOLO con JSON valido, senza formattazione markdown:
{
  "mappa_concettuale": [
    {
      "title": "Concetto Principale",
      "children": [
        {
          "title": "Sottoconcetto 1",
          "children": [
            {"title": "Dettaglio specifico"}
          ]
        },
        {"title": "Sottoconcetto 2"}
      ]
    }
  ]
}`;

export const createQuizPrompt = ({ language, text, targetLanguage }: PromptConfig) => `
Crea 10 domande a scelta multipla in ${targetLanguage || language} basate sul seguente testo.

Le domande devono:
- Testare la comprensione dei concetti principali
- Avere 4 opzioni di risposta plausibili
- Includere spiegazioni dettagliate per ogni risposta
- Variare in difficoltà (alcune facili, alcune più complesse)
- Coprire diversi aspetti del contenuto

Testo:
${text}

IMPORTANTE: Rispondi SOLO con JSON valido, senza formattazione markdown:
{
  "quiz": [
    {
      "question": "Quale dei seguenti concetti...",
      "options": ["Opzione A", "Opzione B", "Opzione C", "Opzione D"],
      "correct_option_index": 1,
      "explanation": "La risposta corretta è B perché... [spiegazione dettagliata che aiuta l'apprendimento]"
    }
  ]
}`;

export const createExamGuidePrompt = ({ language, text, targetLanguage }: PromptConfig) => `
Crea una guida di studio completa per studiare in 1 ora in ${targetLanguage || language} basata sul seguente testo.

La guida deve essere:
- Strutturata come un piano pratico di 60 minuti
- Divisa in fasi temporali specifiche
- Includere tecniche di memorizzazione attiva
- Fornire strategie di ripasso efficaci
- Essere convincente e motivante
- Includere suggerimenti per massimizzare l'apprendimento

Testo:
${text}

IMPORTANTE: Rispondi SOLO con JSON valido, senza formattazione markdown:
{
  "guida_esame": {
    "tempo_totale": "60 minuti",
    "introduzione": "Introduzione motivante e strategica all'approccio di studio",
    "piano_di_studio": [
      {
        "fase": "Prima lettura strategica",
        "durata": "15 minuti",
        "descrizione": "Cosa fare esattamente in questa fase, tecniche specifiche di memorizzazione, concetti chiave da identificare e strategie cognitive da applicare"
      },
      {
        "fase": "Elaborazione attiva",
        "durata": "20 minuti", 
        "descrizione": "Tecniche di rielaborazione, creazione di collegamenti mentali, e metodi per consolidare la comprensione"
      },
      {
        "fase": "Memorizzazione e ripasso",
        "durata": "15 minuti",
        "descrizione": "Strategie di memorizzazione a lungo termine, tecniche di ripasso attivo e consolidamento finale"
      },
      {
        "fase": "Test e verifica",
        "durata": "10 minuti",
        "descrizione": "Auto-verifica della comprensione, identificazione dei punti deboli e strategie per colmare le lacune"
      }
    ],
    "consigli_finali": "Suggerimenti motivanti e strategie per mantenere alta la concentrazione e massimizzare i risultati"
  }
}`;

export const createTutorPrompt = ({ 
  userMessage, 
  pdfText, 
  riassuntoBrive, 
  riassuntoEsteso, 
  flashcards 
}: {
  userMessage: string;
  pdfText: string;
  riassuntoBrive: string;
  riassuntoEsteso: string;
  flashcards: any[];
}) => `
Sei un tutor AI esperto e paziente che aiuta gli studenti a comprendere meglio i contenuti di studio.

Il tuo ruolo:
- Rispondere alle domande in modo chiaro e pedagogico
- Fornire spiegazioni dettagliate quando necessario
- Suggerire collegamenti tra concetti
- Incoraggiare l'apprendimento attivo
- Adattare le risposte al livello di comprensione dello studente

Contesto del documento studiato:
- Testo completo del PDF: ${pdfText.substring(0, 2000)}...
- Riassunto breve: ${riassuntoBrive}
- Riassunto esteso: ${riassuntoEsteso}
- Flashcard create: ${JSON.stringify(flashcards.slice(0, 3))}

Domanda dello studente: "${userMessage}"

Istruzioni per la risposta:
1. Fornisci una risposta chiara e utile
2. Se la domanda è vaga, chiedi chiarimenti specifici
3. Usa esempi dal contenuto del documento quando appropriato
4. Suggerisci strategie di studio se rilevante
5. Mantieni un tono incoraggiante e pedagogico

Rispondi in modo naturale e conversazionale, come un vero tutor.`;

// Cost configuration for different operations
export const CREDIT_COSTS = {
  summary: 10,
  flashcard: 8,
  quiz: 8,
  map: 6,
  tutor: 5,
  extraction: 5
} as const;

export type CreditOperation = keyof typeof CREDIT_COSTS;