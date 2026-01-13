export interface PromptConfig {
  language: string;
  text: string;
  targetLanguage?: string;
}

export const createSummaryPrompt = ({ language, text, targetLanguage }: PromptConfig) => `
Sei un tutor universitario esperto. Crea materiale di studio che permetta allo studente di CAPIRE e MEMORIZZARE facilmente.

🎯 OBIETTIVO: Lo studente studia SOLO da questi riassunti e supera l'esame.

📌 REGOLA FONDAMENTALE - ADATTATI AL CONTENUTO:
- Lavora ESCLUSIVAMENTE con quello che è REALMENTE nel documento
- Se ci sono formule/teoremi → spiegali in dettaglio con la sezione apposita
- Se NON ci sono formule → NON inventarle, NON aggiungere la sezione formule
- Se ci sono articoli di legge → citali e spiegali precisamente
- Se ci sono teorie/autori → contestualizzali e spiegali
- NON aggiungere contenuti che non esistono nel testo originale

GENERA HTML STRUTTURATO. Usa SOLO le sezioni pertinenti al contenuto:

<h1>📚 [Titolo Documento]</h1>

<div class="section-intro">
  <h2>💎 Panoramica</h2>
  <p>[Di cosa parla il documento - contesto generale - perché è importante]</p>
</div>

<div class="section-concepts">
  <h3>💡 Concetti Chiave</h3>
  <ul class="concept-list">
    <li><span class="term">[Concetto 1]</span>: [Spiegazione chiara - cosa è - perché è importante - come si collega agli altri]</li>
    <li><span class="term">[Concetto 2]</span>: [Spiegazione chiara e completa]</li>
  </ul>
</div>

<div class="section-definitions">
  <h3>📖 Definizioni e Termini Chiave</h3>
  <div class="definition-box">
    <div class="definition-title">📌 [TERMINE/ARTICOLO/CONCETTO]</div>
    <p class="definition-text">[Definizione o testo esatto dal documento]</p>
    <p><span class="label">Significato</span>: [Spiegazione in parole semplici]</p>
    <p><span class="label">Contesto</span>: [Quando e come si applica]</p>
  </div>
</div>

<!-- SOLO SE IL DOCUMENTO CONTIENE FORMULE/CALCOLI: -->
<div class="section-formulas">
  <h3>🔢 Formule e Calcoli</h3>
  <div class="formula-box">
    <div class="formula-title">[Nome formula]</div>
    <div class="formula">$[formula]$</div>
    <p><span class="label">Variabili</span>:</p>
    <ul>
      <li><code>[var]</code> = [significato]</li>
    </ul>
    <p><span class="label">Esempio</span>: [Applicazione pratica]</p>
  </div>
</div>

<div class="section-connections">
  <h3>🔗 Collegamenti tra Concetti</h3>
  <p>[Come i vari concetti si collegano tra loro - mappa mentale discorsiva]</p>
</div>

<div class="section-exam">
  <h3>❓ Possibili Domande d'Esame</h3>
  <ul>
    <li><strong>Domanda</strong>: [Domanda probabile] → <em>Risposta chiave</em>: [Punti essenziali]</li>
  </ul>
</div>

<div class="section-summary">
  <h3>📝 Schema Finale per il Ripasso</h3>
  <ul>
    <li>[Punto chiave 1 da ricordare]</li>
    <li>[Punto chiave 2 da ricordare]</li>
  </ul>
</div>

CREA ESATTAMENTE DUE RIASSUNTI:

1. **RIASSUNTO BREVE** (800-1000 parole):
   - Panoramica dell'argomento
   - 5-7 concetti chiave in bullet points
   - Schema finale per ripasso veloce

2. **RIASSUNTO ESTESO** (MINIMO 6000-8000 parole):
   - TUTTE le sezioni sopra, sviluppate in modo COMPLETO
   - Ogni concetto spiegato approfonditamente (cosa è, perché è importante, collegamenti)
   - Definizioni complete con contesto e applicazioni
   - Formule SOLO se presenti nel documento originale
   - Collegamenti espliciti tra le varie parti
   - Domande d'esame probabili con risposte
   - Schema finale dettagliato

REQUISITI:
- Linguaggio chiaro e diretto, facile da memorizzare
- Usa elenchi puntati e struttura gerarchica
- **Evidenzia** i termini chiave
- Spiega SEMPRE il "perché" oltre al "cosa"
- Fai riferimenti specifici al testo originale
- Crea collegamenti logici tra le sezioni

Testo da analizzare:
${text}

IMPORTANTE: Rispondi ESCLUSIVAMENTE con JSON valido nel formato esatto qui sotto. Non aggiungere testo prima o dopo il JSON. Non usare markdown o backticks.

{
  "riassunto_breve": "<h1>📚 [Titolo]</h1><div class=\\"section-intro\\"><h2>💎 Panoramica</h2><p>[Intro]</p></div><div class=\\"section-concepts\\"><h3>💡 Concetti Chiave</h3><ul class=\\"concept-list\\"><li>...</li></ul></div><div class=\\"section-summary\\"><h3>📝 Schema Ripasso</h3><ul><li>...</li></ul></div>",
  "riassunto_esteso": "<h1>📚 [Titolo]</h1>[TUTTE LE SEZIONI COMPLETE E DETTAGLIATE]"
}

ATTENZIONE: Il riassunto breve deve essere CONCISO. Il riassunto esteso deve essere MOLTO DETTAGLIATO (6000-8000 parole). Non mescolare i contenuti.`;

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