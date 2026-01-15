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

// Helper per aggiornare processing_metadata senza sovrascrivere altri campi
async function updateProcessingMetadata(sessionId: string, newMetadata: Record<string, any>) {
  try {
    // 1. Leggi il metadata esistente
    const { data: session, error: readError } = await supabaseAdmin
      .from('tutor_sessions')
      .select('processing_metadata')
      .eq('id', sessionId)
      .single();

    if (readError) {
      console.error('❌ [updateProcessingMetadata] Error reading session:', readError);
      return;
    }

    const existingMetadata = session?.processing_metadata || {};

    // 2. Merge: mantieni i campi esistenti, aggiungi/aggiorna solo quelli nuovi
    const mergedMetadata = {
      ...existingMetadata,
      ...newMetadata
    };

    // 3. Aggiorna con il merge
    const { error: updateError } = await supabaseAdmin
      .from('tutor_sessions')
      .update({ processing_metadata: mergedMetadata })
      .eq('id', sessionId);

    if (updateError) {
      console.error('❌ [updateProcessingMetadata] Error updating session:', updateError);
      return;
    }

    // VERIFICA: Rileggi per confermare che l'update sia stato applicato
    const { data: verifySession } = await supabaseAdmin
      .from('tutor_sessions')
      .select('processing_metadata')
      .eq('id', sessionId)
      .single();

    const verifiedMeta = verifySession?.processing_metadata || {};
    console.log(`✅ [updateProcessingMetadata] VERIFIED: ultra_flashcards_current_section=${verifiedMeta.ultra_flashcards_current_section}, ultra_flashcards_total_sections=${verifiedMeta.ultra_flashcards_total_sections}`);
  } catch (err) {
    console.error('❌ [updateProcessingMetadata] Exception:', err);
  }
}

// Prompt per generare flashcard da una sezione
const createFlashcardSectionPrompt = (section: string, sectionNumber: number, totalSections: number, documentTitle: string, targetCards: number) => {
  return `Sei un ESPERTO nella creazione di flashcard per lo studio. Analizza questa sezione e crea flashcard COMPLETE e DETTAGLIATE.

DOCUMENTO: ${documentTitle} - Sezione ${sectionNumber} di ${totalSections}

📌 REGOLA FONDAMENTALE - FLASHCARD UTILI PER STUDIARE:
- Ogni flashcard deve contenere informazioni SUFFICIENTI per capire il concetto
- Il FRONTE deve essere una domanda chiara e specifica
- Il RETRO deve essere una risposta COMPLETA (50-100 parole) che permetta di studiare
- Copri TUTTI i concetti importanti della sezione
- Crea flashcard per: definizioni, formule, concetti, date, confronti, cause-effetti, processi

🎯 OBIETTIVO: Creare ${targetCards} flashcard che permettano allo studente di STUDIARE SOLO con queste.

TESTO DA ANALIZZARE:
${section}

GENERA JSON con questa struttura:

{
  "flashcards": [
    {
      "front": "Domanda chiara e specifica (es: Cos'è X? Come funziona Y? Quali sono le caratteristiche di Z?)",
      "back": "Risposta completa e dettagliata (50-100 parole). Includi definizione, caratteristiche principali, esempi se rilevanti. La risposta deve essere autosufficiente per lo studio.",
      "category": "Definizioni|Formule|Concetti|Esempi|Date|Confronti|Processi|CauseEffetto",
      "difficulty": "base|intermedio|avanzato"
    }
  ],
  "section_topics": ["argomento1", "argomento2"]
}

REGOLE PER FLASHCARD DI QUALITÀ:
1. FRONTE: Domanda diretta, non ambigua, che testa la conoscenza
2. RETRO: Risposta esaustiva che copra tutti gli aspetti rilevanti
3. NON fare flashcard troppo generiche o troppo specifiche
4. Per FORMULE: includi la formula, cosa rappresenta ogni variabile, quando si usa
5. Per DEFINIZIONI: includi definizione completa + caratteristiche chiave
6. Per PROCESSI: descrivi tutti i passaggi in ordine
7. Per CONFRONTI: elenca le differenze principali in modo chiaro

IMPORTANTE: Rispondi SOLO con JSON valido, senza markdown o testo aggiuntivo.`;
};

interface Flashcard {
  front: string;
  back: string;
  category: string;
  difficulty: string;
  section?: number;
}

interface UltraFlashcardsPayload {
  sessionId: string;
  userId: string;
  newCreditBalance: number;
  targetLanguage?: string;
}

export const ultraFlashcardsTask = task({
  id: "ultra-flashcards",
  // Massimo 1 ora di esecuzione
  maxDuration: 3600,
  retry: {
    maxAttempts: 2,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 30000,
    factor: 2,
  },
  run: async (payload: UltraFlashcardsPayload) => {
    const { sessionId, userId, newCreditBalance, targetLanguage } = payload;

    console.log(`🎴 [Trigger.dev] Ultra Flashcards Task started for session: ${sessionId}`);

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

      console.log(`📚 [Trigger.dev] Processing flashcards for: ${documentTitle}`);
      console.log(`📄 [Trigger.dev] Text length: ${fullText.length} characters`);

      // 3. Divisione adattiva del testo e calcolo target flashcard
      const documentLength = fullText.length;
      let targetSectionSize: number;
      let maxSections: number;
      let flashcardsPerSection: number;

      // Calcola target totale flashcard in base alla lunghezza (20-100)
      let totalTargetFlashcards: number;
      if (documentLength > 300000) {
        // Documento molto lungo: 100 flashcard
        targetSectionSize = 8000;
        maxSections = 20;
        totalTargetFlashcards = 100;
      } else if (documentLength > 150000) {
        // Documento medio-lungo: 80 flashcard
        targetSectionSize = 7000;
        maxSections = 16;
        totalTargetFlashcards = 80;
      } else if (documentLength > 50000) {
        // Documento medio: 60 flashcard
        targetSectionSize = 6000;
        maxSections = 12;
        totalTargetFlashcards = 60;
      } else if (documentLength > 20000) {
        // Documento medio-breve: 40 flashcard
        targetSectionSize = 5000;
        maxSections = 8;
        totalTargetFlashcards = 40;
      } else if (documentLength > 10000) {
        // Documento breve: 30 flashcard
        targetSectionSize = 4000;
        maxSections = 6;
        totalTargetFlashcards = 30;
      } else {
        // Documento molto breve: 20 flashcard (minimo garantito)
        targetSectionSize = 3000;
        maxSections = 4;
        totalTargetFlashcards = 20;
      }

      console.log(`📊 [Trigger.dev] Target: ${totalTargetFlashcards} flashcards, section size: ${targetSectionSize}`);

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

      // Calcola flashcard per sezione
      flashcardsPerSection = Math.ceil(totalTargetFlashcards / sections.length);

      console.log(`📊 [Trigger.dev] Divided into ${sections.length} sections, ~${flashcardsPerSection} flashcards per section`);

      // 5. Aggiorna SUBITO il total_sections nel database
      await updateProcessingMetadata(sessionId, {
        ultra_flashcards_status: 'in_progress',
        ultra_flashcards_current_section: 0,
        ultra_flashcards_total_sections: sections.length,
        ultra_flashcards_target_count: totalTargetFlashcards,
        ultra_flashcards_estimated_completion: new Date(Date.now() + sections.length * 2 * 60 * 1000).toISOString()
      });
      console.log(`📊 [ULTRA-FLASHCARDS] Initial metadata set: 0/${sections.length} sections`);

      // 6. Processa ogni sezione con OpenAI
      const allFlashcards: Flashcard[] = [];

      for (let i = 0; i < sections.length; i++) {
        const sectionNumber = i + 1;
        console.log(`🔄 [ULTRA-FLASHCARDS] Processing section ${sectionNumber}/${sections.length}`);

        // Aggiorna progresso nel database PRIMA di elaborare
        console.log(`🔄 [ULTRA-FLASHCARDS] >>> ABOUT TO UPDATE DB: section ${sectionNumber}/${sections.length}`);
        try {
          await updateProcessingMetadata(sessionId, {
            ultra_flashcards_current_section: sectionNumber,
            ultra_flashcards_estimated_completion: new Date(Date.now() + (sections.length - sectionNumber) * 2 * 60 * 1000).toISOString()
          });
          console.log(`✅ [ULTRA-FLASHCARDS] <<< DB UPDATE DONE: section ${sectionNumber}/${sections.length}`);
        } catch (metaError) {
          console.error(`❌ [ULTRA-FLASHCARDS] METADATA UPDATE FAILED:`, metaError);
        }

        try {
          const prompt = createFlashcardSectionPrompt(
            sections[i],
            sectionNumber,
            sections.length,
            documentTitle,
            flashcardsPerSection
          );

          const startTime = Date.now();

          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.4,
            max_tokens: 4000,
          });

          const elapsed = Date.now() - startTime;
          const content = response.choices[0].message.content || '';

          // Parse JSON response
          try {
            let cleanContent = content.trim()
              .replace(/```json\s*/gi, '')
              .replace(/```\s*$/g, '')
              .trim();

            const firstBrace = cleanContent.indexOf('{');
            const lastBrace = cleanContent.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
              cleanContent = cleanContent.substring(firstBrace, lastBrace + 1);
            }

            const sectionData = JSON.parse(cleanContent);

            if (sectionData.flashcards && Array.isArray(sectionData.flashcards)) {
              // Aggiungi il numero di sezione a ogni flashcard
              const flashcardsWithSection = sectionData.flashcards.map((fc: Flashcard) => ({
                ...fc,
                section: sectionNumber
              }));
              allFlashcards.push(...flashcardsWithSection);
            }

            console.log(`✅ [Trigger.dev] Section ${sectionNumber} completed in ${elapsed}ms: ${sectionData.flashcards?.length || 0} flashcards`);

          } catch (parseError) {
            console.error(`⚠️ [Trigger.dev] JSON parse error for section ${sectionNumber}:`, parseError);
            // Crea flashcard placeholder per la sezione
            allFlashcards.push({
              front: `Quali sono i concetti chiave della sezione ${sectionNumber}?`,
              back: `Questa sezione tratta argomenti importanti del documento. Rileggi il contenuto per approfondire.`,
              category: 'Concetti',
              difficulty: 'base',
              section: sectionNumber
            });
          }

          // Delay tra le richieste per rispettare i rate limits
          if (i < sections.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }

        } catch (sectionError) {
          console.error(`❌ [Trigger.dev] Error processing flashcard section ${sectionNumber}:`, sectionError);
          // Crea flashcard placeholder per la sezione fallita
          allFlashcards.push({
            front: `Sezione ${sectionNumber} - Contenuto non elaborato`,
            back: `Si è verificato un errore nell'elaborazione di questa sezione. Consulta il documento originale.`,
            category: 'Concetti',
            difficulty: 'base',
            section: sectionNumber
          });
        }
      }

      console.log(`🎉 [Trigger.dev] All ${sections.length} sections processed for flashcards`);
      console.log(`📊 [Trigger.dev] Total flashcards generated: ${allFlashcards.length}`);

      // 7. Organizza e bilancia le flashcard
      const organizedFlashcards = organizeFlashcards(allFlashcards);

      const flashcardUltraData = {
        flashcards: organizedFlashcards,
        stats: {
          total: organizedFlashcards.length,
          by_category: countByCategory(organizedFlashcards),
          by_difficulty: countByDifficulty(organizedFlashcards),
          sections_processed: sections.length,
          generated_at: new Date().toISOString()
        }
      };

      // 8. Salva nel database
      console.log(`💾 [Trigger.dev] Saving flashcards to database for session: ${sessionId}`);

      // Prima aggiorna processing_metadata con merge
      await updateProcessingMetadata(sessionId, {
        ultra_flashcards_status: 'completed',
        ultra_flashcards_completed_at: new Date().toISOString(),
        ultra_flashcards_total_sections: sections.length,
        ultra_flashcards_count: organizedFlashcards.length
      });

      // Poi salva le flashcard
      const { data: updateData, error: saveError } = await supabaseAdmin
        .from('tutor_sessions')
        .update({
          flashcard_ultra: flashcardUltraData
        })
        .eq('id', sessionId)
        .select('id, flashcard_ultra');

      if (saveError) {
        console.error(`❌ [Trigger.dev] Save error:`, saveError);
        throw new Error('Errore nel salvare le Flashcard Ultra');
      }

      console.log(`✅ [Trigger.dev] Save result:`, updateData ? `Updated ${updateData.length} rows` : 'No data returned');

      // 9. Aggiorna la cache Redis per lo storico
      console.log(`💾 [Trigger.dev] Updating Redis cache for history...`);
      try {
        // Recupera il token dell'utente per l'autenticazione
        const { data: userData } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('id', userId)
          .single();

        if (userData) {
          // Chiama l'endpoint per aggiornare la cache Redis
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'https://studiusai.com';
          const updateCacheUrl = `${baseUrl}/api/history/update-ultra-flashcards`;

          // Crea un token service per l'autenticazione interna
          const { data: { session: serviceSession } } = await supabaseAdmin.auth.admin.getUserById(userId);

          const cacheResponse = await fetch(updateCacheUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Usa un header speciale per autenticazione interna dal task
              'X-Internal-Task': 'true',
              'X-User-Id': userId
            },
            body: JSON.stringify({
              sessionId,
              flashcardUltra: flashcardUltraData,
              userId
            })
          });

          if (cacheResponse.ok) {
            const cacheResult = await cacheResponse.json();
            console.log(`✅ [Trigger.dev] Redis cache updated:`, cacheResult);
          } else {
            console.warn(`⚠️ [Trigger.dev] Redis cache update failed:`, await cacheResponse.text());
          }
        }
      } catch (cacheError) {
        console.warn(`⚠️ [Trigger.dev] Redis cache update error (non-blocking):`, cacheError);
        // Non blocchiamo l'esecuzione per errori di cache
      }

      console.log(`🎉 [Trigger.dev] Ultra Flashcards completed! ${organizedFlashcards.length} flashcards`);

      return {
        success: true,
        sessionId,
        sectionsProcessed: sections.length,
        totalFlashcards: organizedFlashcards.length,
        newCreditBalance,
      };

    } catch (error) {
      console.error('❌ [Trigger.dev] Ultra Flashcards Task Error:', error);

      // Marca come fallito nel database
      await updateProcessingMetadata(sessionId, {
        ultra_flashcards_status: 'failed',
        ultra_flashcards_error: error instanceof Error ? error.message : 'Errore sconosciuto',
        ultra_flashcards_failed_at: new Date().toISOString()
      });

      throw error;
    }
  },
});

// Funzione per organizzare e bilanciare le flashcard
function organizeFlashcards(flashcards: Flashcard[]): Flashcard[] {
  // Rimuovi duplicati basati sul front (domanda)
  const uniqueFlashcards = flashcards.filter((fc, index, self) =>
    index === self.findIndex(f => f.front.toLowerCase().trim() === fc.front.toLowerCase().trim())
  );

  // Ordina per categoria e poi per difficoltà
  const difficultyOrder: Record<string, number> = { 'base': 1, 'intermedio': 2, 'avanzato': 3 };

  uniqueFlashcards.sort((a, b) => {
    // Prima per categoria
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    // Poi per difficoltà
    return (difficultyOrder[a.difficulty] || 2) - (difficultyOrder[b.difficulty] || 2);
  });

  return uniqueFlashcards;
}

// Conta flashcard per categoria
function countByCategory(flashcards: Flashcard[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const fc of flashcards) {
    counts[fc.category] = (counts[fc.category] || 0) + 1;
  }
  return counts;
}

// Conta flashcard per difficoltà
function countByDifficulty(flashcards: Flashcard[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const fc of flashcards) {
    counts[fc.difficulty] = (counts[fc.difficulty] || 0) + 1;
  }
  return counts;
}
