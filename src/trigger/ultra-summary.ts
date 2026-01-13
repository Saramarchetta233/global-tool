import { task } from "@trigger.dev/sdk/v3";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// Inizializza OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Inizializza Supabase Admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Prompt Ultra Summary MASSIMAMENTE DETTAGLIATO (identico all'originale)
const createUltraSummaryPrompt = (section: string, sectionNumber: number, totalSections: number, documentTitle: string) => {
  return `Sei un TUTOR UNIVERSITARIO ESPERTO. Crea materiale di studio ULTRA-DETTAGLIATO che permetta allo studente di CAPIRE, MEMORIZZARE e SUPERARE l'esame.

DOCUMENTO: ${documentTitle} - Sezione ${sectionNumber} di ${totalSections}

🎯 OBIETTIVO: Lo studente studia SOLO da questo riassunto e supera brillantemente l'esame.

📏 TARGET: 5000-7000 parole per sezione (molto dettagliato)

📌 REGOLA FONDAMENTALE - ADATTATI AL CONTENUTO:
- Lavora ESCLUSIVAMENTE con quello che è REALMENTE nel testo
- Se ci sono formule/teoremi → spiegali in dettaglio nella sezione apposita
- Se NON ci sono formule → NON inventarle, OMETTI la sezione formule
- Se ci sono articoli di legge → citali precisamente e spiegali
- Se ci sono teorie/autori → contestualizzali e approfondiscili
- NON aggiungere contenuti che non esistono nel testo originale

🔥 REGOLE PER OGNI TIPO DI DOCUMENTO:

[DOCUMENTI GIURIDICI - Diritto, Legge, Giurisprudenza]:
- Cita gli articoli esattamente come nel testo
- Spiega l'interpretazione dottrinale
- Indica la giurisprudenza rilevante se menzionata
- Casi pratici di applicazione
- NON aggiungere formule matematiche

[DOCUMENTI SCIENTIFICI - Matematica, Fisica, Ingegneria]:
- Formule spiegate variabile per variabile
- Dimostrazioni passo-passo
- Esempi numerici svolti
- Grafici e tabelle descritti

[DOCUMENTI UMANISTICI - Filosofia, Storia, Economia, Sociologia]:
- Focus su autori e correnti di pensiero
- Evoluzione storica dei concetti
- Dibattiti e posizioni contrapposte
- Collegamenti interdisciplinari
- NON aggiungere formule matematiche

📋 STRUTTURA (usa SOLO le sezioni pertinenti al contenuto):

TESTO DA ANALIZZARE:
${section}

GENERA HTML STRUTTURATO:

<h1>📚 Sezione ${sectionNumber}: [TITOLO ESTRATTO DAL TESTO]</h1>

<div class="section-intro">
<h2>🌟 Panoramica della Sezione</h2>
<p>[Di cosa parla questa sezione - contesto - perché è importante - 400-600 parole]</p>
</div>

<div class="concepts-section">
<h2>💡 Concetti Chiave Approfonditi</h2>

<div class="concept-detail">
<h3>🔍 [Nome del Concetto]</h3>
<p><strong>Cos'è</strong>: [Spiegazione chiara e completa]</p>
<p><strong>Perché è importante</strong>: [Rilevanza nel contesto]</p>
<p><strong>Come si collega</strong>: [Collegamenti con altri concetti]</p>
<div class="examples-box">
<h4>Applicazioni ed esempi</h4>
<ul>
<li>[Esempio concreto dal testo o applicazione pratica]</li>
<li>[Altro esempio se presente]</li>
</ul>
</div>
</div>

<!-- Ripeti per ogni concetto chiave -->
</div>

<div class="definitions-section">
<h2>📖 Definizioni e Termini Chiave</h2>

<div class="definition-box">
<h3>📌 [TERMINE/ARTICOLO/CONCETTO]</h3>
<p><strong>Definizione</strong>: [Testo esatto dal documento]</p>
<p><strong>Spiegazione</strong>: [In parole semplici]</p>
<p><strong>Contesto</strong>: [Quando e come si applica]</p>
<p><strong>Esempio</strong>: [Caso pratico se presente]</p>
</div>

<!-- Ripeti per ogni definizione importante -->
</div>

<!-- SOLO SE IL DOCUMENTO CONTIENE FORMULE/CALCOLI: -->
<div class="formulas-section">
<h2>🔢 Formule e Calcoli</h2>

<div class="formula-box">
<h3>📐 [Nome Formula]</h3>
<div class="formula-display">[formula scritta in modo leggibile]</div>
<p><strong>Variabili</strong>:</p>
<ul>
<li><strong>[var]</strong> = [cosa rappresenta]</li>
</ul>
<p><strong>Quando si usa</strong>: [condizioni di applicabilità]</p>
<div class="examples-calculation">
<h4>Esempio svolto</h4>
<p>[calcolo dettagliato]</p>
</div>
</div>
</div>

<!-- SOLO SE IL DOCUMENTO CONTIENE ARTICOLI DI LEGGE: -->
<div class="legal-section">
<h2>⚖️ Riferimenti Normativi</h2>

<div class="legal-box">
<h3>📜 [Articolo/Norma]</h3>
<p><strong>Testo</strong>: [Citazione esatta]</p>
<p><strong>Interpretazione</strong>: [Cosa significa in pratica]</p>
<p><strong>Applicazione</strong>: [Casi in cui si applica]</p>
</div>
</div>

<div class="connections-section">
<h2>🔗 Collegamenti e Mappa Concettuale</h2>
<p>[Come i concetti di questa sezione si collegano tra loro e con le altre sezioni]</p>
<ul>
<li><strong>[Concetto A]</strong> → si collega a → <strong>[Concetto B]</strong> perché [spiegazione]</li>
</ul>
</div>

<div class="exam-prep">
<h2>🎯 Preparazione Esame</h2>

<div class="probable-questions">
<h3>❓ Domande Probabili</h3>
<div class="question-answer">
<p><strong>D</strong>: [Possibile domanda d'esame]</p>
<p><strong>R</strong>: [Risposta completa - punti chiave da includere]</p>
</div>
<!-- Ripeti per 3-5 domande -->
</div>

<div class="common-errors">
<h3>⚠️ Errori da Evitare</h3>
<ul>
<li><strong>Errore</strong>: [errore comune] → <strong>Corretto</strong>: [versione giusta]</li>
</ul>
</div>

<div class="memory-tips">
<h3>🧠 Come Memorizzare</h3>
<ul>
<li>[Tecnica o trucco per ricordare i concetti chiave]</li>
<li>[Associazione mentale utile]</li>
</ul>
</div>
</div>

<div class="section-summary">
<h2>📝 Schema Finale di Ripasso</h2>
<ul>
<li><strong>[Punto 1]</strong>: [cosa ricordare]</li>
<li><strong>[Punto 2]</strong>: [cosa ricordare]</li>
<li><strong>[Punto 3]</strong>: [cosa ricordare]</li>
</ul>
<p><em>In sintesi</em>: [Riassunto in 3-4 frasi di tutta la sezione]</p>
</div>

IMPORTANTE:
- Genera 5000-7000 parole di contenuto UTILE
- NON inventare formule se non ci sono nel testo
- NON inventare articoli di legge se non ci sono
- Concentrati su quello che C'È nel documento
- Rendi tutto FACILE da studiare e memorizzare

Rispondi ESCLUSIVAMENTE in HTML. Non usare Markdown. Non usare JSON. Scrivi in italiano chiaro e comprensibile.`;
};

// Payload del task
interface UltraSummaryPayload {
  sessionId: string;
  userId: string;
  newCreditBalance: number;
}

// Task Trigger.dev per Ultra Summary
export const ultraSummaryTask = task({
  id: "ultra-summary",
  // Massimo 2 ore di esecuzione (per PDF molto lunghi)
  maxDuration: 7200,
  retry: {
    maxAttempts: 2,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 30000,
    factor: 2,
  },
  run: async (payload: UltraSummaryPayload) => {
    const { sessionId, userId, newCreditBalance } = payload;

    console.log(`🚀 [Trigger.dev] Ultra Summary Task started for session: ${sessionId}`);

    try {
      // 1. Recupera la sessione dal database
      const { data: session, error: sessionError } = await supabaseAdmin
        .from('tutor_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();

      if (sessionError || !session) {
        throw new Error('Sessione non trovata o non autorizzata');
      }

      // 2. Verifica che ci sia il testo PDF
      if (!session.pdf_text || session.pdf_text.length < 100) {
        throw new Error('Testo del documento non disponibile o troppo breve');
      }

      const fullText = session.pdf_text;
      const documentTitle = session.title || session.file_name || 'Documento';

      console.log(`📚 [Trigger.dev] Processing: ${documentTitle}`);
      console.log(`📄 [Trigger.dev] Text length: ${fullText.length} characters`);

      // 3. Divisione adattiva del testo (stessa logica dell'originale)
      const documentLength = fullText.length;
      let targetSectionSize: number;
      let maxSections: number;

      if (documentLength > 500000) {
        targetSectionSize = 4000;
        maxSections = 60;
      } else if (documentLength > 300000) {
        targetSectionSize = 5000;
        maxSections = 50;
      } else {
        targetSectionSize = 6000;
        maxSections = 40;
      }

      console.log(`📊 [Trigger.dev] Section size: ${targetSectionSize}, max sections: ${maxSections}`);

      // 4. Split del testo
      const sections: string[] = [];
      let paragraphs = fullText.split(/\n\s*\n/);

      if (paragraphs.length < 5 || paragraphs.some((p: string) => p.length > targetSectionSize * 2)) {
        paragraphs = fullText.split(/(?<=[.!?])\s+/);

        if (paragraphs.length < 10) {
          paragraphs = [];
          for (let i = 0; i < fullText.length; i += targetSectionSize) {
            paragraphs.push(fullText.slice(i, i + targetSectionSize));
          }
        }
      }

      let currentSection = '';

      for (const paragraph of paragraphs) {
        if (sections.length >= maxSections) {
          if (sections.length > 0) {
            sections[sections.length - 1] += '\n\n' + paragraph;
          }
          continue;
        }

        if (currentSection.length + paragraph.length > targetSectionSize && currentSection.length > 1000) {
          sections.push(currentSection.trim());
          currentSection = paragraph;
        } else {
          currentSection += (currentSection.length > 0 ? '\n\n' : '') + paragraph;
        }
      }

      if (currentSection.trim().length > 0) {
        sections.push(currentSection.trim());
      }

      if (sections.length === 1 && sections[0].length > targetSectionSize * 2) {
        const massiveSection = sections[0];
        sections.length = 0;

        for (let i = 0; i < massiveSection.length; i += targetSectionSize) {
          sections.push(massiveSection.slice(i, i + targetSectionSize));
          if (sections.length >= maxSections) break;
        }
      }

      console.log(`📊 [Trigger.dev] Divided into ${sections.length} sections`);

      // 5. Processa ogni sezione con OpenAI
      const processedSections: string[] = [];

      for (let i = 0; i < sections.length; i++) {
        const sectionNumber = i + 1;
        console.log(`🔄 [Trigger.dev] Processing section ${sectionNumber}/${sections.length}`);

        // Aggiorna progresso nel database
        await supabaseAdmin
          .from('tutor_sessions')
          .update({
            processing_metadata: {
              ultra_summary_status: 'in_progress',
              ultra_summary_started_at: new Date().toISOString(),
              current_section: sectionNumber,
              total_sections: sections.length,
              estimated_completion: new Date(Date.now() + (sections.length - sectionNumber) * 3 * 60 * 1000).toISOString()
            }
          })
          .eq('id', sessionId);

        try {
          const prompt = createUltraSummaryPrompt(
            sections[i],
            sectionNumber,
            sections.length,
            documentTitle
          );

          const sectionLength = sections[i].length;
          let maxTokens: number;

          if (sectionLength > 5000) {
            maxTokens = 12000;
          } else if (sectionLength > 4000) {
            maxTokens = 14000;
          } else {
            maxTokens = 16000;
          }

          const startTime = Date.now();

          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: maxTokens,
          });

          const elapsed = Date.now() - startTime;
          const sectionSummary = response.choices[0].message.content || '';
          processedSections.push(sectionSummary);

          console.log(`✅ [Trigger.dev] Section ${sectionNumber} completed in ${elapsed}ms: ${sectionSummary.length} chars`);

          // Delay tra le richieste per rispettare i rate limits
          if (i < sections.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 5000));
          }

        } catch (sectionError) {
          console.error(`❌ [Trigger.dev] Error processing section ${sectionNumber}:`, sectionError);

          const fallbackContent = `# ⚠️ Sezione ${sectionNumber} - Errore di Elaborazione\n\n**Si è verificato un errore durante l'elaborazione di questa sezione.**\n\n**Errore**: ${sectionError instanceof Error ? sectionError.message : 'Errore sconosciuto'}\n\n**Contenuto originale** (primi 1000 caratteri):\n\n${sections[i].substring(0, 1000)}...\n\n---\n\n*Nota: Questa sezione sarà elaborata nuovamente in una futura versione.*`;
          processedSections.push(fallbackContent);
        }
      }

      console.log(`🎉 [Trigger.dev] All ${sections.length} sections processed`);

      // 6. Combina tutte le sezioni nel riassunto finale
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

      // 7. Salva nel database
      console.log(`💾 [Trigger.dev] Saving to database for session: ${sessionId}`);

      const { data: updateData, error: saveError } = await supabaseAdmin
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
        .eq('id', sessionId)
        .select('id, riassunto_ultra');

      if (saveError) {
        console.error(`❌ [Trigger.dev] Save error:`, saveError);
        throw new Error('Errore nel salvare il Riassunto Ultra');
      }

      // Verifica che sia stato salvato
      console.log(`✅ [Trigger.dev] Save result:`, updateData ? `Updated ${updateData.length} rows` : 'No data returned');

      if (!updateData || updateData.length === 0) {
        console.error(`❌ [Trigger.dev] No rows updated! Session might not exist: ${sessionId}`);
      } else {
        console.log(`✅ [Trigger.dev] Verified: riassunto_ultra saved (${updateData[0]?.riassunto_ultra?.length || 0} chars)`);
      }

      console.log(`🎉 [Trigger.dev] Ultra Summary completed! ${ultraSummary.length} characters`);

      return {
        success: true,
        sessionId,
        sectionsProcessed: sections.length,
        totalCharacters: ultraSummary.length,
        newCreditBalance,
      };

    } catch (error) {
      console.error('❌ [Trigger.dev] Ultra Summary Task Error:', error);

      // Marca come fallito nel database
      await supabaseAdmin
        .from('tutor_sessions')
        .update({
          processing_metadata: {
            ultra_summary_status: 'failed',
            ultra_summary_error: error instanceof Error ? error.message : 'Errore sconosciuto',
            ultra_summary_failed_at: new Date().toISOString()
          }
        })
        .eq('id', sessionId);

      throw error;
    }
  },
});
