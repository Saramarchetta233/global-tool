export interface PromptConfig {
  language: string;
  text: string;
  targetLanguage?: string;
}

export const createSummaryPrompt = ({ language, text, targetLanguage }: PromptConfig) => `
Sei un professore universitario che prepara materiale di studio. Devi creare DUE riassunti HTML che SOSTITUISCANO completamente il libro per lo studente.

OBIETTIVO CRITICO: Lo studente deve poter studiare SOLO da questi riassunti e passare l'esame.

GENERA HTML STRUTTURATO CON QUESTA STRUTTURA ESATTA:

<h1>📚 [Titolo Documento]</h1>
<div class="section-intro">
  <h2>💎 Introduzione</h2>
  <p>[Paragrafo introduttivo completo]</p>
</div>
<div class="section-concepts">
  <h3>💡 Concetti Chiave</h3>
  <ul class="concept-list">
    <li><span class="term">[Termine]</span>: [Spiegazione dettagliata]</li>
    <li><span class="term">[Termine]</span>: [Spiegazione dettagliata]</li>
  </ul>
</div>
<div class="section-definitions">
  <h3>📖 Definizioni</h3>
  <div class="definition-box">
    <div class="definition-title">📌 DEFINIZIONE - [Nome]</div>
    <p class="definition-text">[Testo definizione esatta]</p>
    <p><span class="label">Contesto</span>: [Contesto applicazione]</p>
    <p><span class="label">Esempio</span>: [Esempio pratico]</p>
  </div>
</div>
<div class="section-formulas">
  <h3>🔢 Formule e Calcoli</h3>
  <div class="formula-box">
    <div class="formula-title">Formula principale:</div>
    <div class="formula">$[formula LaTeX]$</div>
    <p><span class="label">Dove</span>:</p>
    <ul>
      <li><code>[variabile]</code> = [significato]</li>
    </ul>
    <p><span class="label">Esempio numerico</span>: [Esempio con numeri]</p>
  </div>
</div>
<div class="section-examples">
  <h3>📝 Esempi Svolti</h3>
  <div class="example-box">
    <h4>Esempio 1: [Titolo]</h4>
    <p>[Problema completo]</p>
    <div class="solution">
      <h5>Soluzione:</h5>
      <ol>
        <li>[Passo 1]</li>
        <li>[Passo 2]</li>
      </ol>
    </div>
  </div>
</div>

CREA ESATTAMENTE DUE RIASSUNTI:

1. **RIASSUNTO BREVE** (600-800 parole): Versione concentrata sui punti essenziali
2. **RIASSUNTO ESTESO** (MINIMO 4000-6000 parole): Versione completa e universitaria ULTRA-DETTAGLIATISSIMA

REQUISITI TECNICI:
- MINIMO 4000-6000 parole per il riassunto esteso (MASSIMO DETTAGLIO POSSIBILE)
- Linguaggio accademico ma chiaro
- OGNI concetto deve essere spiegato completamente con MINIMO 3 esempi diversi
- TUTTE le formule devono essere incluse e spiegate variabile per variabile
- TUTTI i teoremi con dimostrazioni complete step-by-step
- OGNI definizione deve essere riportata esattamente + contesto + applicazioni
- ESPANDI ogni sezione al MASSIMO possibile
- NON essere conciso, sii ESTREMAMENTE dettagliato
- Aggiungi esempi pratici, casi d'uso, applicazioni reali
- Spiega PERCHÉ ogni concetto è importante
- **Parole chiave** evidenziate con asterischi
- Nessuna frase vuota o generica
- Riferimenti specifici al testo originale
- Struttura a paragrafi ben definiti
- Collegamenti espliciti tra sezioni

Il riassunto breve deve rimanere conciso e focalizzato sui punti essenziali.

Testo da analizzare:
${text}

IMPORTANTE: Rispondi ESCLUSIVAMENTE con JSON valido nel formato esatto qui sotto. Non aggiungere testo prima o dopo il JSON. Non usare markdown o backticks.

{
  "riassunto_breve": "<h1>📚 [Titolo]</h1><div class=\"section-intro\"><h2>💎 Introduzione</h2><p>[Riassunto breve HTML strutturato]</p></div>",
  "riassunto_esteso": "<h1>📚 [Titolo]</h1><div class=\"section-intro\"><h2>💎 Introduzione</h2><p>[Riassunto esteso HTML strutturato completo]</p></div><div class=\"section-concepts\"><h3>💡 Concetti Chiave</h3>...</div>"
}

ATTENZIONE: Assicurati che ogni campo contenga SOLO il suo contenuto specifico. Non includere il riassunto esteso nel campo breve e viceversa.`;

export const createFlashcardsPrompt = ({ language, text, targetLanguage }: PromptConfig) => `
Crea 20 flashcard in ${targetLanguage || language} basate sul seguente testo.

IMPORTANTE - SIMBOLI MATEMATICI:
- NON USARE MAI simboli matematici speciali nelle flashcard (∈, ∉, ∑, ∏, ∞, ≠, ≤, ≥, etc.)
- CONVERTI sempre in testo normale:
  * "a ∈ A" → "a appartiene ad A"
  * "x ≠ y" → "x è diverso da y"  
  * "∑" → "somma di tutti"
  * Simboli matematici → spiegazioni testuali
- USA solo caratteri ASCII standard per garantire compatibilità JSON

Le flashcard devono essere:
- Semplici e utili per la memorizzazione
- Coprire i concetti più importanti del testo
- Avere domande chiare e risposte complete ma concise
- Essere progressive in difficoltà
- Includere sia definizioni che applicazioni pratiche

Per ogni risposta, aggiungi contesto e dettagli dal testo.

Testo:
${text}

IMPORTANTE: Rispondi SOLO con JSON valido, senza formattazione markdown:
{
  "flashcard": [
    {"front": "Domanda o concetto da memorizzare", "back": "Risposta completa con contesto dal testo"},
    {"front": "Cos'è...", "back": "Definizione con dettagli specifici..."}
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