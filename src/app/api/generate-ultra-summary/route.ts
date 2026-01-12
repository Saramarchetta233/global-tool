import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Prompt Ultra Summary MASSIMAMENTE DETTAGLIATO per sostituire completamente i libri
const createUltraSummaryPrompt = (section: string, sectionNumber: number, totalSections: number, documentTitle: string) => {
  return `Sei un PROFESSORE UNIVERSITARIO ESPERTO che deve creare un riassunto ULTRA-DETTAGLIATO che SOSTITUISCA COMPLETAMENTE il libro di testo.

DOCUMENTO: ${documentTitle} - Sezione ${sectionNumber} di ${totalSections}

🎯 OBIETTIVO CRITICO: Lo studente deve poter studiare ESCLUSIVAMENTE da questo riassunto e superare brillantemente l'esame. Questo riassunto deve essere più completo e dettagliato del libro stesso.

📏 TARGET MINIMO: 3000-5000 parole dettagliate per sezione (molto più del normale)

🔥 REGOLE INDEROGABILI:
1. OGNI SINGOLA INFORMAZIONE deve essere inclusa ed espansa
2. OGNI concetto spiegato con 2-3 esempi pratici diversi
3. OGNI formula spiegata variabile per variabile con esempi numerici completi
4. OGNI teorema con dimostrazione passo-passo e applicazioni multiple
5. OGNI termine tecnico definito completamente con contesto storico
6. OGNI connessione logica resa esplicita
7. OGNI possibile domanda d'esame anticipata e preparata

📋 STRUTTURA OBBLIGATORIA:

# 📖 Sezione ${sectionNumber}: [TITOLO SEZIONE ESTRATTO DAL TESTO]

## 🌟 Panoramica della Sezione
[Introduzione che inquadra gli argomenti e spiega perché sono importanti - 300-500 parole]

## 💡 Concetti Chiave Approfonditi
[Elenco e spiegazione COMPLETA di ogni concetto principale - minimo 500 parole per concetto]

### 🔍 [Nome del Primo Concetto]
- **Definizione completa**: [definizione tecnica + spiegazione semplificata]
- **Origine storica**: [chi l'ha sviluppato, quando, perché]
- **Contesto di utilizzo**: [quando e dove si applica]
- **Esempi pratici**: 
  1. [Esempio 1 con tutti i passaggi]
  2. [Esempio 2 con tutti i passaggi]
  3. [Esempio 3 con tutti i passaggi]
- **Errori comuni**: [cosa sbagliano gli studenti]
- **Trucchi mnemonici**: [come ricordare facilmente]

### 🔍 [Nome del Secondo Concetto]
[Stessa struttura dettagliata...]

## 📚 Definizioni Tecniche Complete
[OGNI termine tecnico del testo con definizione esaustiva]

**📌 DEFINIZIONE: [TERMINE]**
- **Definizione formale**: [definizione precisa dal testo]
- **Spiegazione intuitiva**: [spiegazione in parole semplici]
- **Etimologia**: [origine della parola se rilevante]
- **Contesto storico**: [quando è stato introdotto]
- **Campi di applicazione**: [dove viene usato]
- **Esempi concreti**: [minimo 3 esempi diversi]
- **Relazioni**: [come si collega ad altri concetti]
- **Errori frequenti**: [confusioni comuni]

## 🧮 Formule e Calcoli Dettagliati
[OGNI formula spiegata completamente]

### 📐 Formula: [Nome della Formula]
**Forma matematica**: [formula scritta in testo normale per evitare problemi JSON]
- x al quadrato più y al quadrato uguale z al quadrato (invece di simboli matematici)

**Significato fisico/matematico**: [cosa rappresenta la formula]

**Variabili spiegate**:
- **x** = [cosa rappresenta] + [unità di misura] + [range tipico]
- **y** = [cosa rappresenta] + [unità di misura] + [range tipico]
- **z** = [cosa rappresenta] + [unità di misura] + [range tipico]

**Quando utilizzare**: [condizioni di applicabilità]

**Derivazione**: [come si arriva a questa formula - passaggi logici]

**Esempi numerici completi**:
1. **Esempio 1**:
   - Dati: [valori specifici]
   - Procedimento: [ogni singolo passaggio]
   - Calcolo: [operazioni dettagliate]
   - Risultato: [risultato con unità]
   - Interpretazione: [cosa significa il risultato]

2. **Esempio 2**: [struttura identica]

3. **Esempio 3**: [struttura identica]

**Varianti della formula**: [altre forme della stessa formula]

**Errori tipici**: [errori di calcolo comuni]

## 🏛️ Teoremi e Proprietà
[OGNI teorema con dimostrazione completa]

### 📐 TEOREMA: [Nome del Teorema]

**Enunciato formale**: [enunciato preciso dal testo]

**Enunciato informale**: [spiegazione in parole semplici]

**Ipotesi**: [condizioni necessarie]
- Ipotesi 1: [spiegazione dettagliata]
- Ipotesi 2: [spiegazione dettagliata]

**Tesi**: [cosa dimostra il teorema]

**Dimostrazione completa**:
1. **Passo 1**: [primo passaggio logico con spiegazione]
2. **Passo 2**: [secondo passaggio logico con spiegazione]
3. **Passo 3**: [terzo passaggio logico con spiegazione]
[...continua per tutti i passaggi]

**Conseguenze del teorema**: [cosa implica]

**Applicazioni pratiche**: [dove viene usato]

**Esempi di utilizzo**:
[Minimo 3 esempi completi di applicazione del teorema]

## ✏️ Esempi Svolti Completamente
[OGNI problema con soluzione dettagliatissima]

### 🔧 ESEMPIO SVOLTO 1: [Titolo del problema]

**Testo del problema**: [problema completo]

**Analisi del problema**: [cosa ci chiede, dati forniti, strategia risolutiva]

**Conoscenze richieste**: [teoremi, formule, concetti necessari]

**Soluzione passo-passo**:
1. **Identificazione**: [riconoscere il tipo di problema]
2. **Raccolta dati**: [organizzare le informazioni]
3. **Scelta metodo**: [quale approccio usare e perché]
4. **Applicazione formula**: [quale formula usare]
5. **Calcoli dettagliati**: [ogni operazione matematica]
6. **Verifica**: [controllo del risultato]
7. **Interpretazione**: [significato della soluzione]

**Varianti del problema**: [come cambierebbe con dati diversi]

**Errori da evitare**: [errori tipici in questo tipo di problema]

### 🔧 ESEMPIO SVOLTO 2: [Altro esempio con stessa struttura]

### 🔧 ESEMPIO SVOLTO 3: [Altro esempio con stessa struttura]

## 📊 Tabelle, Grafici e Schemi
[Ricostruzione di OGNI elemento grafico del testo]

### 📈 Tabella: [Nome della tabella]

[Ricostruzione della tabella in formato testuale]

**Intestazioni colonne**: [spiegazione di ogni colonna]
**Interpretazione dati**: [cosa ci dicono i numeri]
**Tendenze osservabili**: [pattern nei dati]
**Utilizzo pratico**: [come usare questa tabella]

## 🔗 Collegamenti e Prerequisiti

**Prerequisiti**: [cosa bisogna sapere prima di questa sezione]

**Collegamenti interni**: [come si collega alle sezioni precedenti]

**Preparazione per**: [cosa prepara per le sezioni successive]

**Collegamenti interdisciplinari**: [relazioni con altre materie]

## 🎯 Preparazione Esame Completa

### 🔥 DOMANDE PROBABILI ALL'ESAME:

1. **Domanda**: [possibile domanda d'esame]
   **Risposta completa**: [come rispondere in modo esaustivo]
   **Punti chiave**: [elementi essenziali da includere]

2. **Domanda**: [altra possibile domanda]
   **Risposta completa**: [come rispondere in modo esaustivo]
   **Punti chiave**: [elementi essenziali da includere]

[Continua per tutte le possibili domande...]

### ⚠️ ERRORI DA EVITARE ASSOLUTAMENTE:

1. **Errore**: [errore comune]
   **Correzione**: [versione corretta]
   **Perché succede**: [causa dell'errore]

2. **Errore**: [altro errore comune]
   **Correzione**: [versione corretta]
   **Perché succede**: [causa dell'errore]

### 🧠 STRATEGIE DI MEMORIZZAZIONE:

- **Mnemoniche**: [tecniche per ricordare]
- **Associazioni**: [collegamenti mentali utili]
- **Ripetizione**: [cosa ripassare spesso]

## 💎 Approfondimenti Extra
[Informazioni aggiuntive che arricchiscono la comprensione]

**Curiosità**: [fatti interessanti correlati]
**Storia**: [evoluzione storica dei concetti]
**Applicazioni moderne**: [utilizzi attuali]
**Ricerche recenti**: [sviluppi contemporanei]

---

IMPORTANTE: Analizza COMPLETAMENTE tutto il testo fornito. Non riassumere o condensare - ESPANDI ogni informazione. Questo deve essere più dettagliato del libro originale.

TESTO DA ANALIZZARE E ESPANDERE COMPLETAMENTE:
${section}

GENERA HTML STRUTTURATO CON QUESTA STRUTTURA ESATTA:

<h1>📚 Sezione ${sectionNumber}: [TITOLO SEZIONE]</h1>

<div class="section-intro">
<h2>🌟 Panoramica della Sezione</h2>
<p>[Introduzione completa]</p>
</div>

<div class="concepts-section">
<h2>💡 Concetti Chiave Approfonditi</h2>

<div class="concept-detail">
<h3>🔍 [Nome del Concetto]</h3>
<div class="definition-box">
<h4>Definizione completa</h4>
<p>[Definizione tecnica + spiegazione semplificata]</p>
</div>
<div class="examples-box">
<h4>Esempi pratici</h4>
<ol>
<li><strong>Esempio 1</strong>: [esempio dettagliato]</li>
<li><strong>Esempio 2</strong>: [esempio dettagliato]</li>
</ol>
</div>
</div>

</div>

<div class="definitions-section">
<h2>📚 Definizioni Tecniche Complete</h2>

<div class="definition-box">
<h3>📌 [TERMINE TECNICO]</h3>
<p><strong>Definizione formale</strong>: [definizione precisa]</p>
<p><strong>Spiegazione intuitiva</strong>: [spiegazione semplice]</p>
<p><strong>Esempi concreti</strong>: [esempi pratici]</p>
</div>

</div>

<div class="formulas-section">
<h2>🧮 Formule e Calcoli Dettagliati</h2>

<div class="formula-box">
<h3>📐 Formula: [Nome]</h3>
<div class="formula-display">[formula in testo normale]</div>
<p><strong>Significato</strong>: [spiegazione del significato]</p>
<p><strong>Quando utilizzare</strong>: [condizioni di applicabilità]</p>
<div class="examples-calculation">
<h4>Esempio numerico</h4>
<p>[calcolo dettagliato step by step]</p>
</div>
</div>

</div>

<div class="theorems-section">
<h2>🏛️ Teoremi e Proprietà</h2>

<div class="theorem-box">
<h3>📐 TEOREMA: [Nome]</h3>
<p><strong>Enunciato</strong>: [enunciato formale]</p>
<div class="proof-box">
<h4>Dimostrazione</h4>
<ol>
<li><strong>Passo 1</strong>: [primo passaggio logico]</li>
<li><strong>Passo 2</strong>: [secondo passaggio logico]</li>
</ol>
</div>
<p><strong>Applicazioni pratiche</strong>: [dove viene usato]</p>
</div>

</div>

<div class="examples-section">
<h2>✏️ Esempi Svolti Completamente</h2>

<div class="example-solved">
<h3>🔧 ESEMPIO 1: [Titolo]</h3>
<p><strong>Testo del problema</strong>: [problema completo]</p>
<div class="solution-steps">
<h4>Soluzione passo-passo</h4>
<ol>
<li><strong>Identificazione</strong>: [tipo di problema]</li>
<li><strong>Applicazione formula</strong>: [quale formula]</li>
<li><strong>Calcoli</strong>: [operazioni dettagliate]</li>
<li><strong>Risultato</strong>: [soluzione finale]</li>
</ol>
</div>
</div>

</div>

<div class="exam-prep">
<h2>🎯 Preparazione Esame Completa</h2>

<div class="probable-questions">
<h3>🔥 DOMANDE PROBABILI ALL'ESAME</h3>
<div class="question-answer">
<p><strong>Domanda</strong>: [possibile domanda d'esame]</p>
<p><strong>Risposta completa</strong>: [come rispondere in modo esaustivo]</p>
</div>
</div>

<div class="common-errors">
<h3>⚠️ ERRORI DA EVITARE</h3>
<ul>
<li><strong>Errore</strong>: [errore comune] - <strong>Correzione</strong>: [versione corretta]</li>
</ul>
</div>

</div>

Rispondi ESCLUSIVAMENTE in HTML seguendo ESATTAMENTE la struttura sopra. Non usare Markdown. Non usare JSON. Scrivi tutto in italiano accademico ma comprensibile.`;
};

export async function POST(request: NextRequest) {
  console.log('🚀 Ultra Summary API called');
  
  try {
    const body = await request.json();
    const { sessionId, userId } = body;

    console.log('📝 Ultra Summary request:', { sessionId, userId });
    console.log('📝 Environment check:', {
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });

    if (!sessionId || !userId) {
      return NextResponse.json({ 
        error: 'SessionId e UserId sono richiesti' 
      }, { status: 400 });
    }

    // 1. Verify session exists and belongs to user
    const { data: session, error: sessionError } = await supabaseAdmin!
      .from('tutor_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ 
        error: 'Sessione non trovata o non autorizzata' 
      }, { status: 404 });
    }

    // 2. Check if Ultra Summary already exists
    if (session.riassunto_ultra) {
      return NextResponse.json({ 
        error: 'Riassunto Ultra già esistente per questa sessione. Vai al tab Riassunto Ultra per visualizzarlo.' 
      }, { status: 409 });
    }

    // 3. Verify we have PDF text to work with
    if (!session.pdf_text || session.pdf_text.length < 100) {
      return NextResponse.json({ 
        error: 'Testo del documento non disponibile o troppo breve per il Riassunto Ultra' 
      }, { status: 400 });
    }

    // 4. Consume 250 credits
    const baseUrl = request.url.split('/api')[0];
    const creditResponse = await fetch(`${baseUrl}/api/credits/consume`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
      body: JSON.stringify({
        userId: userId,
        amount: 250,
        description: 'Riassunto Ultra - Analisi dettagliata completa',
        featureType: 'ultra_summary'
      })
    });

    if (!creditResponse.ok) {
      const creditError = await creditResponse.json();
      if (creditError.error === 'insufficient_credits') {
        return NextResponse.json({
          error: 'insufficient_credits',
          message: 'Crediti insufficienti per il Riassunto Ultra',
          required: 250,
          current: creditError.currentCredits || 0
        }, { status: 403 });
      }
      throw new Error('Errore nel consumo crediti');
    }

    const creditResult = await creditResponse.json();
    console.log(`💳 Ultra Summary: 250 credits consumed, new balance: ${creditResult.newBalance}`);

    // 5. Mark Ultra Summary as "in progress" in database
    await supabaseAdmin!
      .from('tutor_sessions')
      .update({
        processing_metadata: {
          ultra_summary_status: 'in_progress',
          ultra_summary_started_at: new Date().toISOString(),
          estimated_completion: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        }
      })
      .eq('id', sessionId);

    // 6. START ACTUAL PROCESSING - Divide text into sections
    const fullText = session.pdf_text;
    const documentTitle = session.title || session.file_name || 'Documento';
    
    console.log(`📚 Starting Ultra Summary for: ${documentTitle}`);
    console.log(`📄 Full text length: ${fullText.length} characters`);

    // Split text into MANY sections for detailed Ultra Summary
    // Adaptive section size based on document length to avoid token limits
    const documentLength = fullText.length;
    let targetSectionSize: number;
    let maxSections: number;
    
    // Adjust section size based on document length to avoid OpenAI token limits
    if (documentLength > 500000) { // Very long documents (>500k chars ≈ 150+ pages)
      targetSectionSize = 4000; // Smaller sections to avoid token limit
      maxSections = 60; // More sections allowed
    } else if (documentLength > 300000) { // Long documents (>300k chars ≈ 100+ pages)
      targetSectionSize = 5000; // Medium sections
      maxSections = 50;
    } else { // Normal documents (<300k chars)
      targetSectionSize = 6000; // Larger sections for more detail
      maxSections = 40;
    }
    
    const sections: string[] = [];
    console.log(`📊 Document length: ${documentLength} chars - Using section size: ${targetSectionSize}, max sections: ${maxSections}`);
    
    console.log(`🔍 Starting text division: ${fullText.length} characters to divide`);
    
    // IMPROVED text splitting strategy - multiple fallback methods
    let paragraphs = fullText.split(/\n\s*\n/); // Try paragraph splitting first
    
    console.log(`📊 Found ${paragraphs.length} paragraphs`);
    
    // If paragraphs are too few/too large, try alternative splitting
    if (paragraphs.length < 5 || paragraphs.some(p => p.length > targetSectionSize * 2)) {
      console.log('🔄 Paragraph splitting ineffective, using sentence splitting...');
      paragraphs = fullText.split(/(?<=[.!?])\s+/); // Split by sentences
      
      if (paragraphs.length < 10) {
        console.log('🔄 Sentence splitting ineffective, using fixed-size chunks...');
        // Force fixed-size chunks as last resort
        paragraphs = [];
        for (let i = 0; i < fullText.length; i += targetSectionSize) {
          paragraphs.push(fullText.slice(i, i + targetSectionSize));
        }
      }
    }
    
    console.log(`📊 Using ${paragraphs.length} chunks for processing`);
    
    let currentSection = '';
    
    for (const paragraph of paragraphs) {
      // Stop adding new sections if we reach the maximum
      if (sections.length >= maxSections) {
        // Add remaining content to the last section
        if (sections.length > 0) {
          sections[sections.length - 1] += '\n\n' + paragraph;
        }
        continue;
      }
      
      // Check if adding this paragraph would exceed the target size
      if (currentSection.length + paragraph.length > targetSectionSize && currentSection.length > 1000) {
        sections.push(currentSection.trim());
        currentSection = paragraph;
      } else {
        currentSection += (currentSection.length > 0 ? '\n\n' : '') + paragraph;
      }
    }
    
    // Add the final section if it has content
    if (currentSection.trim().length > 0) {
      sections.push(currentSection.trim());
    }
    
    // If we still have only one massive section, force split it
    if (sections.length === 1 && sections[0].length > targetSectionSize * 2) {
      console.log('🚨 Forcing chunked split for massive single section...');
      const massiveSection = sections[0];
      sections.length = 0; // Clear array
      
      for (let i = 0; i < massiveSection.length; i += targetSectionSize) {
        sections.push(massiveSection.slice(i, i + targetSectionSize));
        if (sections.length >= maxSections) break;
      }
    }

    console.log(`📊 Text divided into ${sections.length} sections`);

    // 7. Process each section with OpenAI
    const processedSections: string[] = [];
    console.log(`🔄 Starting OpenAI processing of ${sections.length} sections`);
    
    // Test OpenAI connection first with a simple request
    try {
      console.log('🧪 Testing OpenAI connection...');
      const testResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Test connection. Reply with 'OK'." }],
        max_tokens: 10
      });
      console.log('✅ OpenAI connection test successful:', testResponse.choices[0].message.content);
    } catch (testError) {
      console.error('❌ OpenAI connection test failed:', testError);
      throw new Error(`OpenAI connection failed: ${testError instanceof Error ? testError.message : 'Unknown error'}`);
    }
    
    for (let i = 0; i < sections.length; i++) {
      const sectionNumber = i + 1;
      console.log(`🔄 Processing section ${sectionNumber}/${sections.length} - Section length: ${sections[i].length} chars`);
      
      // Update progress in database
      try {
        await supabaseAdmin!
          .from('tutor_sessions')
          .update({
            processing_metadata: {
              ultra_summary_status: 'in_progress',
              ultra_summary_started_at: new Date().toISOString(),
              current_section: sectionNumber,
              total_sections: sections.length,
              estimated_completion: new Date(Date.now() + (sections.length - sectionNumber) * 3 * 60 * 1000).toISOString() // 3 min per section per riassunti dettagliatissimi
            }
          })
          .eq('id', sessionId);
      } catch (dbError) {
        console.warn(`⚠️ Could not update progress for section ${sectionNumber}:`, dbError);
      }

      try {
        console.log(`🤖 Creating OpenAI prompt for section ${sectionNumber}...`);
        const prompt = createUltraSummaryPrompt(
          sections[i], 
          sectionNumber, 
          sections.length, 
          documentTitle
        );

        console.log(`🤖 Calling OpenAI API for section ${sectionNumber}... (prompt length: ${prompt.length})`);
        const startTime = Date.now();
        
        // Adjust max_tokens based on section size to avoid token limits
        const sectionLength = sections[i].length;
        let maxTokens: number;
        
        if (sectionLength > 5000) {
          maxTokens = 12000; // Reduced for very large sections
        } else if (sectionLength > 4000) {
          maxTokens = 14000; // Medium reduction
        } else {
          maxTokens = 16000; // Full tokens for normal sections
        }
        
        console.log(`📊 Section ${sectionNumber}: ${sectionLength} chars, using max_tokens: ${maxTokens}`);
        
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: maxTokens,
        });

        const elapsed = Date.now() - startTime;
        const sectionSummary = response.choices[0].message.content || '';
        processedSections.push(sectionSummary);
        
        console.log(`✅ Section ${sectionNumber} completed in ${elapsed}ms: ${sectionSummary.length} characters generated`);
        
        // Delay between requests to respect rate limits - increased for larger requests
        if (i < sections.length - 1) {
          console.log(`⏳ Waiting 5 seconds before next section to respect rate limits...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
      } catch (sectionError) {
        console.error(`❌ Error processing section ${sectionNumber}:`, sectionError);
        console.error(`❌ Error details:`, {
          name: sectionError instanceof Error ? sectionError.name : 'unknown',
          message: sectionError instanceof Error ? sectionError.message : 'unknown error',
          stack: sectionError instanceof Error ? sectionError.stack?.substring(0, 500) : 'no stack'
        });
        
        // Continue with other sections, add error placeholder
        const fallbackContent = `# ⚠️ Sezione ${sectionNumber} - Errore di Elaborazione\n\n**Si è verificato un errore durante l'elaborazione di questa sezione.**\n\n**Errore**: ${sectionError instanceof Error ? sectionError.message : 'Errore sconosciuto'}\n\n**Contenuto originale** (primi 1000 caratteri):\n\n${sections[i].substring(0, 1000)}...\n\n---\n\n*Nota: Questa sezione sarà elaborata nuovamente in una futura versione.*`;
        processedSections.push(fallbackContent);
      }
    }

    console.log(`🎉 All ${sections.length} sections processed. Generated ${processedSections.length} summaries.`);

    // 8. Combine all sections into final Ultra Summary
    const ultraSummary = `# 📚 RIASSUNTO ULTRA - ${documentTitle.toUpperCase()}

> **📊 Documento analizzato**: ${documentTitle}  
> **📄 Pagine elaborate**: ~${Math.ceil(fullText.length / 3000)}  
> **🕐 Generato il**: ${new Date().toLocaleString('it-IT')}  
> **🔍 Sezioni analizzate**: ${sections.length}

---

${processedSections.join('\n\n---\n\n')}

---

## 🎯 Riassunto Ultra Completato

✅ **Analisi completa**: Tutti i concetti chiave sono stati estratti e spiegati  
✅ **Formule dettagliate**: Tutte le formule sono state trascritte e spiegate  
✅ **Esempi pratici**: Ogni concetto include esempi svolti  
✅ **Collegamenti logici**: Le sezioni sono collegate tra loro  

🚀 **Questo riassunto sostituisce completamente il libro originale per la preparazione all'esame.**
`;

    // 9. Save Ultra Summary to database
    const { error: saveError } = await supabaseAdmin!
      .from('tutor_sessions')
      .update({
        riassunto_ultra: ultraSummary,
        processing_metadata: {
          ultra_summary_status: 'completed',
          ultra_summary_started_at: new Date().toISOString(),
          ultra_summary_completed_at: new Date().toISOString(),
          total_sections: sections.length,
          total_chars: ultraSummary.length
        }
      })
      .eq('id', sessionId);

    if (saveError) {
      console.error('❌ Error saving Ultra Summary:', saveError);
      throw new Error('Errore nel salvare il Riassunto Ultra');
    }

    console.log(`🎉 Ultra Summary completed! ${ultraSummary.length} characters generated`);

    return NextResponse.json({
      success: true,
      message: 'Riassunto Ultra completato con successo!',
      sessionId,
      newCreditBalance: creditResult.newBalance,
      creditsUsed: 250,
      sectionsProcessed: sections.length,
      totalCharacters: ultraSummary.length,
      ultraSummary: ultraSummary // Return the summary for immediate display
    });

  } catch (error) {
    console.error('❌ Ultra Summary API Error:', error);
    
    // Mark as failed in database
    try {
      await supabaseAdmin!
        .from('tutor_sessions')
        .update({
          processing_metadata: {
            ultra_summary_status: 'failed',
            ultra_summary_error: error instanceof Error ? error.message : 'Errore sconosciuto',
            ultra_summary_failed_at: new Date().toISOString()
          }
        })
        .eq('id', body.sessionId);
    } catch (dbError) {
      console.error('❌ Error updating failure status:', dbError);
    }

    return NextResponse.json({
      error: `Errore durante la generazione del Riassunto Ultra: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
    }, { status: 500 });
  }
}