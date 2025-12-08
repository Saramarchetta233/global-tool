import { NextRequest, NextResponse } from 'next/server';

import { demoAuth, isDemoMode } from '@/lib/demo-auth';
import { CREDIT_COSTS } from '@/lib/prompts';

// Demo AI responses for testing
const generateDemoStudyMaterials = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    riassunto_breve: `**Introduzione alla Psicologia Cognitiva - Riassunto Breve**

La psicologia cognitiva è una disciplina scientifica che studia i processi mentali coinvolti nell'elaborazione delle informazioni, come percezione, attenzione, memoria, linguaggio e pensiero.

**Processi Cognitivi Fondamentali:**
- **Percezione**: Interpretazione delle informazioni sensoriali
- **Attenzione**: Capacità di concentrarsi su stimoli specifici
- **Memoria**: Sistema di codifica, conservazione e recupero informazioni
- **Linguaggio**: Comunicazione simbolica con caratteristiche uniche
- **Pensiero**: Processi di ragionamento e problem-solving

**Sistemi di Memoria:**
1. Memoria Sensoriale (brevissimo termine)
2. Memoria a Breve Termine (15-30 secondi)  
3. Memoria a Lungo Termine (permanente)

La memoria si divide in dichiarativa (fatti ed eventi) e procedurale (abilità e abitudini).

**Applicazioni Pratiche:**
La comprensione dei processi cognitivi è fondamentale in educazione, tecnologia, terapia e design dell'interfaccia utente, fornendo basi scientifiche per ottimizzare l'apprendimento e l'interazione umana.`,

    riassunto_esteso: `**Introduzione alla Psicologia Cognitiva - Analisi Approfondita**

## Capitolo 1: Fondamenti Teorici

La **psicologia cognitiva** rappresenta una rivoluzione paradigmatica nello studio della mente umana, emersa negli anni '50 come reazione al behaviorismo. Questa disciplina adotta un approccio scientifico per comprendere i **processi mentali interni** che mediano tra stimolo e risposta.

### Definizione e Caratteristiche Principali

La psicologia cognitiva si focalizza sull'elaborazione delle informazioni mentali, utilizzando metafore computazionali per spiegare il funzionamento della mente. I **processi cognitivi** includono percezione, attenzione, memoria, linguaggio, pensiero e problem-solving.

## Capitolo 2: I Processi Cognitivi Fondamentali

### 2.1 Percezione
La **percezione** è il processo attraverso cui organizziamo e interpretiamo le informazioni sensoriali per creare una rappresentazione coerente dell'ambiente. Non è una semplice registrazione passiva, ma un processo attivo di costruzione della realtà.

**Caratteristiche chiave:**
- **Selettività**: Non percepiamo tutto ciò che ci circonda
- **Organizzazione**: Raggruppiamo gli stimoli in pattern significativi
- **Interpretazione**: Attribuiamo significato basato sull'esperienza

### 2.2 Attenzione
L'**attenzione** funziona come un filtro selettivo che determina quali informazioni raggiungono la coscienza. È un processo limitato ma essenziale per il funzionamento cognitivo.

**Tipologie di attenzione:**
- **Selettiva**: Focus su stimoli specifici ignorando altri
- **Divisa**: Elaborazione simultanea di multiple fonti
- **Sostenuta**: Mantenimento prolungato della concentrazione

### 2.3 Memoria
Il sistema della **memoria** è architettato in multiple componenti interconnesse che operano secondo principi specifici.

#### Modello Multi-Store (Atkinson & Shiffrin)
1. **Memoria Sensoriale**: Registro ultra-breve (millisecondi)
2. **Memoria a Breve Termine**: Capacità limitata (7±2 elementi)
3. **Memoria a Lungo Termine**: Capacità virtualmente illimitata

#### Tipologie di Memoria a Lungo Termine
- **Dichiarativa (Esplicita)**:
  - Episodica: Eventi personali specifici
  - Semantica: Conoscenze generali e fatti
- **Procedurale (Implicita)**: Abilità motorie e cognitive automatizzate

## Capitolo 3: Il Linguaggio Umano

### Caratteristiche Uniche del Linguaggio
Il linguaggio umano presenta proprietà distinctive che lo differenziano da altri sistemi di comunicazione:

- **Arbitrarietà**: Relazione convenzionale tra segno e significato
- **Produttività**: Capacità di creare infinite espressioni nuove
- **Displacement**: Riferimento a oggetti/eventi non presenti
- **Dualità**: Combinazione di elementi finiti in strutture infinite

### Elaborazione Linguistica
Il processamento del linguaggio coinvolge multiple aree cerebrali e processi cognitivi, dalla decodifica fonetica alla comprensione semantica e pragmatica.

## Capitolo 4: Pensiero e Problem-Solving

### Processi di Ragionamento
Il **pensiero** include diverse forme di elaborazione mentale:
- **Deduttivo**: Da premesse generali a conclusioni specifiche
- **Induttivo**: Da osservazioni specifiche a principi generali
- **Abduttivo**: Inferenza alla migliore spiegazione possibile

### Strategie di Problem-Solving
- **Algoritmi**: Procedure sistematiche che garantiscono la soluzione
- **Euristiche**: Scorciatoie cognitive rapide ma fallibili
- **Insight**: Comprensione improvvisa della soluzione

## Capitolo 5: Applicazioni e Implicazioni

### Contesti Applicativi

**Educazione**: Ottimizzazione delle strategie di insegnamento basate sui principi cognitivi
**Tecnologia**: Design di interfacce user-friendly
**Terapia**: Sviluppo di interventi cognitivo-comportamentali
**Ergonomia**: Progettazione di ambienti di lavoro cognitivamente efficienti

### Prospettive Future
La psicologia cognitiva continua a evolversi integrando neuroscienze, intelligenza artificiale e scienze computazionali, aprendo nuove frontiere nella comprensione della mente umana.

**Keywords evidenziate**: elaborazione informazioni, processi mentali, memoria dichiarativa, attenzione selettiva, linguaggio produttivo, problem-solving euristico, applicazioni pratiche.`,

    mappa_concettuale: [
      {
        title: "Psicologia Cognitiva",
        children: [
          {
            title: "Processi Fondamentali", 
            children: [
              { title: "Percezione" },
              { title: "Attenzione" },
              { title: "Memoria" },
              { title: "Linguaggio" },
              { title: "Pensiero" }
            ]
          },
          {
            title: "Sistemi di Memoria",
            children: [
              { title: "Memoria Sensoriale" },
              { title: "Memoria a Breve Termine" },
              { 
                title: "Memoria a Lungo Termine",
                children: [
                  { title: "Dichiarativa" },
                  { title: "Procedurale" }
                ]
              }
            ]
          },
          {
            title: "Applicazioni",
            children: [
              { title: "Educazione" },
              { title: "Tecnologia" },
              { title: "Terapia" },
              { title: "Design UX" }
            ]
          }
        ]
      }
    ],

    flashcard: [
      { front: "Cos'è la psicologia cognitiva?", back: "Disciplina che studia i processi mentali come percezione, memoria, linguaggio e pensiero nell'elaborazione delle informazioni." },
      { front: "Quali sono i tre sistemi di memoria?", back: "Memoria Sensoriale (brevissima), Memoria a Breve Termine (15-30 sec), Memoria a Lungo Termine (permanente)." },
      { front: "Differenza tra memoria dichiarativa e procedurale?", back: "Dichiarativa: fatti ed eventi consci. Procedurale: abilità e abitudini automatiche inconsce." },
      { front: "Cos'è l'attenzione selettiva?", back: "Capacità di concentrarsi su stimoli specifici ignorando informazioni irrilevanti nell'ambiente." },
      { front: "Caratteristiche uniche del linguaggio umano?", back: "Arbitrarietà, produttività, displacement (riferimento a cose non presenti), dualità di pattern." },
      { front: "Differenza tra algoritmi ed euristiche?", back: "Algoritmi: procedure sistematiche che garantiscono soluzione. Euristiche: scorciatoie rapide ma fallibili." },
      { front: "Cos'è la memoria episodica?", back: "Tipo di memoria dichiarativa che conserva ricordi di eventi personali specifici con contesto spazio-temporale." },
      { front: "Fasi dell'elaborazione percettiva?", back: "Selezione degli stimoli, organizzazione in pattern, interpretazione basata su esperienza precedente." },
      { front: "Applicazioni pratiche della psicologia cognitiva?", back: "Educazione ottimizzata, design interfacce, terapie cognitive, ergonomia cognitiva." },
      { front: "Cos'è l'insight nel problem-solving?", back: "Comprensione improvvisa e illuminante della soluzione, spesso chiamata 'momento Eureka'." }
    ],

    quiz: [
      {
        question: "Qual è la principale caratteristica che distingue la memoria a breve termine dalla memoria a lungo termine?",
        options: [
          "La capacità di immagazzinamento",
          "La durata della conservazione",
          "Il tipo di informazioni conservate",
          "Tutte le precedenti"
        ],
        correct_option_index: 3,
        explanation: "La memoria a breve termine e quella a lungo termine differiscono per capacità (limitata vs illimitata), durata (secondi vs anni) e spesso per il tipo di elaborazione richiesta."
      },
      {
        question: "L'attenzione selettiva ci permette di:",
        options: [
          "Processare tutte le informazioni simultaneamente",
          "Concentrarci su stimoli rilevanti ignorando distrazioni",
          "Aumentare la capacità della memoria a breve termine",
          "Migliorare la velocità di elaborazione linguistica"
        ],
        correct_option_index: 1,
        explanation: "L'attenzione selettiva è fondamentale per filtrare le informazioni rilevanti dalle irrilevanti, permettendoci di concentrarci su ciò che è importante in ogni momento."
      },
      {
        question: "Quale delle seguenti NON è una caratteristica distintiva del linguaggio umano?",
        options: [
          "Arbitrarietà del rapporto segno-significato",
          "Produttività infinita",
          "Comunicazione solo nel presente",
          "Dualità di articolazione"
        ],
        correct_option_index: 2,
        explanation: "Il displacement è una caratteristica chiave del linguaggio umano: possiamo parlare di eventi passati, futuri o immaginari, non solo del presente immediato."
      },
      {
        question: "La memoria procedurale è responsabile di:",
        options: [
          "Ricordare fatti e informazioni generali",
          "Conservare ricordi di eventi personali",
          "Immagazzinare abilità motorie e cognitive automatizzate",
          "Processare informazioni sensoriali immediate"
        ],
        correct_option_index: 2,
        explanation: "La memoria procedurale conserva le abilità automatizzate come andare in bicicletta, digitare o guidare, che una volta apprese diventano inconsce."
      },
      {
        question: "Gli algoritmi nel problem-solving si differenziano dalle euristiche perché:",
        options: [
          "Sono più veloci da applicare",
          "Richiedono meno effort cognitivo",
          "Garantiscono sempre la soluzione corretta",
          "Sono più creativi e flessibili"
        ],
        correct_option_index: 2,
        explanation: "Gli algoritmi sono procedure sistematiche che, se applicati correttamente, garantiscono di trovare la soluzione, mentre le euristiche sono scorciatoie che possono fallire."
      }
    ],

    guida_esame: {
      tempo_totale: "60 minuti",
      introduzione: "Questa guida strategica ti permetterà di padroneggiare i concetti fondamentali della psicologia cognitiva in una sessione intensiva di studio. Seguendo questo approccio strutturato, ottimizzerai l'apprendimento e la ritenzione.",
      piano_di_studio: [
        {
          fase: "Panoramica Strategica",
          durata: "10 minuti",
          descrizione: "Leggi il riassunto breve per ottenere una visione d'insieme. Identifica i 5 concetti chiave: percezione, attenzione, memoria, linguaggio, pensiero. Crea una mappa mentale dei collegamenti principali per orientare l'apprendimento successivo."
        },
        {
          fase: "Approfondimento Attivo", 
          durata: "25 minuti",
          descrizione: "Studio intensivo del riassunto esteso usando la tecnica SQ3R: Survey (scorri), Question (fai domande), Read (leggi attivamente), Recite (ripeti a voce alta), Review (rivedi). Focalizzati sui sistemi di memoria e le applicazioni pratiche, creando collegamenti con esperienze personali."
        },
        {
          fase: "Memorizzazione Dinamica",
          durata: "15 minuti", 
          descrizione: "Utilizza le flashcard con tecnica di ripetizione intervallata: prima passata veloce, seconda passata sui concetti difficili, terza passata di consolidamento. Associa ogni concetto a esempi concreti dalla tua vita quotidiana per facilitare il ricordo."
        },
        {
          fase: "Test e Autovalutazione",
          durata: "10 minuti",
          descrizione: "Completa il quiz concentrandoti non solo sulle risposte corrette, ma sulla comprensione delle spiegazioni. Identifica eventuali lacune e rivedi rapidamente i concetti meno chiari. Pratica la verbalizzazione dei concetti principali come se dovessi spiegarli a qualcun altro."
        }
      ],
      consigli_finali: "Ricorda che l'apprendimento efficace richiede elaborazione attiva, non passiva. Usa tecniche di autotest, crea collegamenti interdisciplinari, e applica i concetti a situazioni reali. La psicologia cognitiva non è solo teoria: è la chiave per comprendere come funziona la tua stessa mente mentre studi!"
    },

    sessionId: `demo-session-${Date.now()}`,
    extractedText: "Demo text content...",
    newCreditBalance: null,
    creditsUsed: 5
  };
};

export async function POST(request: NextRequest) {
  if (!isDemoMode()) {
    return NextResponse.json(
      { error: 'Demo mode not enabled' },
      { status: 404 }
    );
  }

  try {
    // Get auth token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify token and get user
    const user = await demoAuth.verifyToken(token);

    // Check credits
    const creditCheck = await demoAuth.checkCredits(user.id, CREDIT_COSTS.extraction);
    
    if (!creditCheck.canProceed) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          required: creditCheck.requiredCredits,
          available: creditCheck.currentCredits
        },
        { status: 402 }
      );
    }

    // Get form data (but we'll ignore the actual PDF in demo)
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const language = formData.get('language') as string || 'Italiano';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Deduct credits
    const { newCreditBalance } = await demoAuth.deductCredits(user.id, CREDIT_COSTS.extraction, 'extraction');

    // Generate demo study materials
    const studyMaterials = await generateDemoStudyMaterials();

    // Create tutor session
    const { sessionId } = await demoAuth.createTutorSession(user.id, {
      pdf_text: studyMaterials.extractedText,
      riassunto_breve: studyMaterials.riassunto_breve,
      riassunto_esteso: studyMaterials.riassunto_esteso,
      flashcard: studyMaterials.flashcard
    });

    return NextResponse.json({
      ...studyMaterials,
      sessionId,
      newCreditBalance,
      creditsUsed: CREDIT_COSTS.extraction
    });

  } catch (error) {
    console.error('Demo PDF processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    );
  }
}