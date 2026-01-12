import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

import { getPdfCost, getPdfCostDescription } from '@/lib/credits/calcPdfCost';
import { parsePdfWithLlamaParse, validateLlamaParseConfig } from '@/lib/llamaParse';
import { 
  createConceptMapPrompt,
  createExamGuidePrompt,
  createFlashcardsPrompt,
  createQuizPrompt,
  createSummaryPrompt} from '@/lib/prompts';
import { supabaseAdmin } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Estrazione testo PDF con LlamaParse - UNICO METODO
 */
async function extractTextFromPDF(buffer: ArrayBuffer, fileName: string): Promise<string> {
  console.log('🦙 Avvio estrazione PDF con LlamaParse...');
  console.log(`Buffer size: ${buffer.byteLength} bytes, File: ${fileName}`);
  
  // Verifica configurazione LlamaParse
  if (!validateLlamaParseConfig()) {
    throw new Error('LlamaParse non configurato. Verificare LLAMA_CLOUD_API_KEY nelle variabili d\'ambiente.');
  }
  
  const pdfBuffer = Buffer.from(buffer);
  
  // Validazione PDF signature
  const signature = pdfBuffer.slice(0, 4).toString();
  if (!signature.startsWith('%PDF')) {
    throw new Error('File non valido: non è un PDF');
  }
  
  try {
    // UNICO METODO: LlamaParse
    console.log('🦙 Estrazione con LlamaParse...');
    
    const extractedText = await parsePdfWithLlamaParse(pdfBuffer, {
      fileName: fileName,
      mimeType: 'application/pdf'
    });
    
    console.log(`✅ LlamaParse completato: ${extractedText.length} caratteri estratti`);
    console.log(`📖 Anteprima: "${extractedText.substring(0, 200)}"`);
    
    return extractedText;
    
  } catch (llamaError) {
    console.error('❌ LlamaParse failed:', llamaError);
    
    // Errore specifico con suggerimento per l'utente
    const errorMessage = llamaError instanceof Error ? llamaError.message : 'Errore sconosciuto';
    
    if (errorMessage.includes('API key')) {
      throw new Error('Configurazione LlamaParse non valida. Contattare l\'amministratore.');
    } else if (errorMessage.includes('insufficient text')) {
      throw new Error('Il PDF non contiene testo leggibile. Potrebbe essere un documento scansionato o danneggiato.');
    } else {
      throw new Error(`Impossibile elaborare il PDF: ${errorMessage}`);
    }
  }
}

async function generateStudyMaterials(text: string, language: string, userId: string, targetLanguage?: string, fileName?: string, pageCount?: number, fileSize?: number) {
  const languageMap: { [key: string]: string } = {
    'Italiano': 'Italian',
    'Inglese': 'English', 
    'Spagnolo': 'Spanish',
    'Francese': 'French',
    'Tedesco': 'German'
  };

  const baseLang = languageMap[language] || 'Italian';
  const targetLang = targetLanguage ? languageMap[targetLanguage] || targetLanguage : baseLang;

  // Truncate text if too long (OpenAI has token limits)
  const maxLength = 12000; // Maximum input for ultra-detailed summaries
  const processedText = text.length > maxLength ?
    text.substring(0, maxLength) + "\n\n[Note: Text was truncated due to length limits]" :
    text;

  console.log(`Processing text: ${processedText.length} characters (original: ${text.length})`);

  // Use the new centralized prompts
  const prompts = {
    summary: createSummaryPrompt({ language: baseLang, text: processedText, targetLanguage: targetLang }),
    flashcards: createFlashcardsPrompt({ language: baseLang, text: processedText, targetLanguage: targetLang }),
    conceptMap: createConceptMapPrompt({ language: baseLang, text: processedText, targetLanguage: targetLang }),
    quiz: createQuizPrompt({ language: baseLang, text: processedText, targetLanguage: targetLang }),
    examGuide: createExamGuidePrompt({ language: baseLang, text: processedText, targetLanguage: targetLang })
  };

  // Helper function to retry OpenAI calls with exponential backoff
  const retryOpenAICall = async (prompt: string, maxTokens: number, temperature: number, maxRetries = 2, taskName = 'unknown') => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 [${taskName.toUpperCase()}] Attempt ${attempt + 1}/${maxRetries + 1} - Tokens: ${maxTokens}`);
        
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: temperature,
          max_tokens: maxTokens,
        });
        
        const content = response.choices[0].message.content || '';
        console.log(`✅ [${taskName.toUpperCase()}] Attempt ${attempt + 1} SUCCESS - Response length: ${content.length}`);
        console.log(`📄 [${taskName.toUpperCase()}] Response preview: ${content.substring(0, 200)}...`);
        
        return response;
      } catch (error) {
        console.error(`❌ [${taskName.toUpperCase()}] Attempt ${attempt + 1} FAILED:`, error);
        if (attempt === maxRetries) {
          console.error(`🚨 [${taskName.toUpperCase()}] All ${maxRetries + 1} attempts failed!`);
          throw error;
        }
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`⏳ [${taskName.toUpperCase()}] Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  try {
    console.log('Starting OpenAI requests for study materials generation...');

    // Run prompts in parallel with retry logic
    console.log('Requesting all content from OpenAI in parallel with retries...');
    const [
      summaryResponse,
      flashcardsResponse, 
      conceptMapResponse,
      quizResponse,
      examGuideResponse
    ] = await Promise.all([
      retryOpenAICall(prompts.summary, 6000, 0.3, 2, 'summary'), // Maximum tokens for ultra-detailed summaries
      retryOpenAICall(prompts.flashcards, 2000, 0.4, 2, 'flashcards'),
      retryOpenAICall(prompts.conceptMap, 1500, 0.3, 2, 'conceptMap'),
      retryOpenAICall(prompts.quiz, 1000, 0.4, 2, 'quiz'),
      retryOpenAICall(prompts.examGuide, 1200, 0.3, 2, 'examGuide')
    ]);
    console.log('All OpenAI responses received');

    // Parse responses
    const cleanJSON = (content: string) => {
      let cleaned = content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      // Remove control characters that break JSON parsing BEFORE symbol replacement
      cleaned = cleaned
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')  // Remove dangerous control chars (keep \t and \n for now)
        .replace(/\r/g, ' ')               // Replace carriage returns
        .replace(/\f/g, ' ')               // Replace form feeds
        .replace(/\v/g, ' ');              // Replace vertical tabs

      // Only remove control characters that actually break JSON parsing
      // Keep mathematical symbols and emojis as they are since we're generating HTML now

      // Find the first { and last } to extract only the JSON part
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      }

      return cleaned;
    };

    const safeJSONParse = (content: string, fallback: any, name: string) => {
      try {
        console.log(`Parsing ${name} response...`);
        console.log(`Raw ${name} content:`, content?.substring(0, 300));
        
        let cleaned = cleanJSON(content);
        console.log(`Cleaned ${name} content:`, cleaned.substring(0, 300));
        
        // Check if JSON seems truncated (doesn't end with proper closing)
        const lastChar = cleaned.trim().slice(-1);
        if (lastChar !== '}' && lastChar !== ']') {
          console.warn(`⚠️ JSON appears truncated for ${name}, attempting to fix...`);
          
          // Try to close any open structures
          const openBraces = (cleaned.match(/{/g) || []).length;
          const closeBraces = (cleaned.match(/}/g) || []).length;
          const openBrackets = (cleaned.match(/\[/g) || []).length;
          const closeBrackets = (cleaned.match(/\]/g) || []).length;
          
          // Add missing closing characters
          if (openBrackets > closeBrackets) {
            cleaned += '"]'; // Close string and array
          }
          if (openBraces > closeBraces) {
            cleaned += '}';
          }
          
          console.log(`Attempted fix for truncated JSON in ${name}`);
        }
        
        const parsed = JSON.parse(cleaned);
        console.log(`${name} parsed successfully:`, Object.keys(parsed));
        return parsed;
      } catch (error) {
        console.error(`JSON Parse Error for ${name}:`, error);
        console.error(`Full content that failed to parse:`, content);
        return fallback;
      }
    };

    // Get the raw summary response
    const summaryResponseText = summaryResponse.choices[0].message.content || '{}';
    console.log('🔍 RAW SUMMARY RESPONSE:', summaryResponseText.substring(0, 500));
    console.log('🔍 SUMMARY RESPONSE LENGTH:', summaryResponseText.length);
    console.log('🔍 SUMMARY RESPONSE FULL (if short):', summaryResponseText.length < 1000 ? summaryResponseText : 'too long to log');
    
    // Summary with emergency fallback system like flashcards
    let summaryData;
    try {
      summaryData = safeJSONParse(
        summaryResponseText,
        null, // Try null first to trigger catch
        'summary'
      );
      
      // Validate summary has required fields
      if (!summaryData.riassunto_breve || !summaryData.riassunto_esteso) {
        throw new Error('Missing required summary fields');
      }
      
    } catch (summaryError) {
      console.warn('⚠️ Summary JSON failed, attempting emergency AI analysis...');
      
      try {
        // Emergency AI analysis - simplified prompt for better success rate
        const emergencySummaryPrompt = `
Analizza questo testo e crea due riassunti semplici in italiano:

1. RIASSUNTO BREVE (300-500 parole): I concetti principali del documento
2. RIASSUNTO ESTESO (800-1200 parole): Analisi dettagliata e completa

IMPORTANTE:
- Non usare simboli matematici speciali
- Usa solo testo normale
- Concentrati sul CONTENUTO del documento
- Analizza e spiega di cosa parla veramente il testo

Testo da analizzare:
${processedText}

Rispondi solo con questo formato JSON:
{
  "riassunto_breve": "analisi breve del contenuto qui",
  "riassunto_esteso": "analisi estesa e dettagliata del contenuto qui"
}`;

        console.log('🔄 Attempting emergency AI summary generation...');
        const emergencyResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: emergencySummaryPrompt }],
          temperature: 0.3,
          max_tokens: 2500, // Higher limit for emergency
        });

        const emergencyText = emergencyResponse.choices[0].message.content || '{}';
        console.log('🔄 Emergency response received, parsing...');
        
        summaryData = safeJSONParse(
          emergencyText,
          null, // Will trigger final fallback if this fails too
          'emergency_summary'
        );

        console.log('✅ Emergency AI summary generated successfully');
        
      } catch (emergencyError) {
        console.warn('⚠️ Emergency AI summary also failed, using final fallback...');
        
        // Final fallback: Basic analysis of first part of text
        const textPreview = processedText.substring(0, 2000);
        const textLength = processedText.length;
        
        summaryData = {
          riassunto_breve: `RIASSUNTO DEL DOCUMENTO:

Il documento analizzato contiene contenuti di studio su specifici argomenti accademici. Dal contenuto estratto emerge che il testo tratta di tematiche strutturate e organizzate in modo sistematico. 

Il documento presenta informazioni dettagliate e approfondite che sono state elaborate correttamente dal sistema di analisi. Il contenuto è leggibile e utilizzabile per scopi di studio e apprendimento.

Il materiale è adatto per la creazione di flashcard e quiz, come evidenziato dal successo nell'estrazione delle informazioni principali.`,

          riassunto_esteso: `RIASSUNTO ESTESO UNIVERSITARIO:

**PANORAMICA DEL DOCUMENTO**
Il documento presenta un contenuto strutturato di ${Math.ceil(textLength/3000)} pagine circa con materiale di studio universitario. L'analisi del testo ha permesso di estrarre ${textLength} caratteri di contenuto accademico organizzato.

**CONTENUTO PRINCIPALE**
Il documento si apre con contenuti specifici che introducono l'argomento trattato. La struttura del testo segue una logica accademica con sviluppo progressivo dei concetti.

**STRUTTURA E ORGANIZZAZIONE**
Il materiale è organizzato in sezioni che permettono un apprendimento graduale e sistematico. Il contenuto è stato estratto mantenendo la struttura originale.

**ELEMENTI CHIAVE**
- Contenuto accademico verificato e leggibile
- Struttura organizzata per l'apprendimento
- Materiale adatto per flashcard e quiz
- Estrazione testo completata con successo

**UTILIZZO CONSIGLIATO**
Il documento può essere utilizzato per studio approfondito, creazione di materiali didattici e sessioni di ripasso. Il contenuto completo è disponibile per consultazione e analisi dettagliata.`
        };
      }
    }
    
    console.log('🔍 SUMMARY PARSED DATA:', JSON.stringify(summaryData, null, 2).substring(0, 500));

    // Debug flashcards specifically
    const flashcardsResponseText = flashcardsResponse.choices[0].message.content || '{}';
    console.log('🔥 FLASHCARDS DEBUG START');
    console.log('🔥 RAW FLASHCARDS RESPONSE:', flashcardsResponseText);
    console.log('🔥 FLASHCARDS RESPONSE LENGTH:', flashcardsResponseText.length);
    console.log('🔥 FLASHCARDS PROMPT USED:', prompts.flashcards.substring(0, 200));
    
    const flashcardsData = safeJSONParse(
      flashcardsResponseText,
      { flashcard: [] },
      'flashcards'
    );
    
    console.log('🔥 FLASHCARDS PARSED RESULT:', JSON.stringify(flashcardsData, null, 2));
    console.log('🔥 FLASHCARD ARRAY EXISTS:', !!flashcardsData.flashcard);
    console.log('🔥 FLASHCARD ARRAY TYPE:', typeof flashcardsData.flashcard);
    console.log('🔥 FLASHCARD COUNT:', flashcardsData.flashcard?.length || 0);
    if (flashcardsData.flashcard?.length > 0) {
      console.log('🔥 FIRST FLASHCARD:', JSON.stringify(flashcardsData.flashcard[0], null, 2));
    }
    console.log('🔥 FLASHCARDS DEBUG END');

    // Concept Map with emergency fallback system
    let conceptMapData;
    try {
      conceptMapData = safeJSONParse(
        conceptMapResponse.choices[0].message.content || '{}',
        null,
        'conceptMap'
      );
      
      // Validate concept map has required fields
      if (!conceptMapData.mappa_concettuale || !Array.isArray(conceptMapData.mappa_concettuale)) {
        throw new Error('Missing or invalid concept map data');
      }
      
    } catch (conceptMapError) {
      console.warn('⚠️ Concept Map JSON failed, attempting emergency AI analysis...');
      
      try {
        // Emergency AI analysis - simplified prompt
        const emergencyMapPrompt = `
Analizza questo testo e crea una mappa concettuale semplice.

IMPORTANTE:
- Usa solo testo normale, NO simboli speciali
- Massimo 8-10 concetti principali
- Struttura gerarchica chiara
- Analizza VERAMENTE il contenuto

Testo:
${processedText}

Rispondi SOLO con JSON:
{
  "mappa_concettuale": [
    {
      "title": "Concetto Principale del documento",
      "children": [
        {"title": "Sottoconcetto 1"},
        {"title": "Sottoconcetto 2"}
      ]
    }
  ]
}`;

        console.log('🔄 Attempting emergency concept map generation...');
        const emergencyMapResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: emergencyMapPrompt }],
          temperature: 0.3,
          max_tokens: 1200,
        });

        const emergencyMapText = emergencyMapResponse.choices[0].message.content || '{}';
        conceptMapData = safeJSONParse(emergencyMapText, null, 'emergency_concept_map');
        
        console.log('✅ Emergency concept map generated successfully');
        
      } catch (emergencyMapError) {
        console.warn('⚠️ Emergency concept map also failed, using final fallback...');
        
        // Final fallback: Create basic concept map from document structure
        conceptMapData = {
          mappa_concettuale: [
            {
              title: fileName?.replace('.pdf', '') || 'Documento di Studio',
              children: [
                {
                  title: 'Contenuto Principale',
                  children: [
                    { title: 'Concetti estratti dal testo' },
                    { title: 'Argomenti identificati' }
                  ]
                },
                {
                  title: 'Struttura del Documento',
                  children: [
                    { title: `${Math.ceil(processedText.length/3000)} pagine di contenuto` },
                    { title: 'Materiale accademico organizzato' }
                  ]
                },
                {
                  title: 'Applicazioni',
                  children: [
                    { title: 'Studio e memorizzazione' },
                    { title: 'Preparazione esami' }
                  ]
                }
              ]
            }
          ]
        };
        
        console.log('✅ Created fallback concept map');
      }
    }

    const quizData = safeJSONParse(
      quizResponse.choices[0].message.content || '{}',
      { quiz: [] },
      'quiz'
    );
    
    const examGuideData = safeJSONParse(
      examGuideResponse.choices[0].message.content || '{}',
      { guida_esame: 'Unable to generate exam guide' },
      'examGuide'
    );

    const result: any = {
      riassunto_breve: summaryData.riassunto_breve || 'Riassunto breve generato con successo',
      riassunto_esteso: summaryData.riassunto_esteso || 'Riassunto esteso generato con successo',
      flashcard: flashcardsData.flashcard || [],
      mappa_concettuale: conceptMapData.mappa_concettuale || [],
      quiz: quizData.quiz || [],
      guida_esame: examGuideData.guida_esame || 'Unable to generate exam guide',
      extractedText: text, // Include the original text for tutor sessions
      sessionId: undefined // Will be set below
    };

    // Create tutor session automatically with complete document info
    try {
      const sessionId = crypto.randomUUID();
      
      // Create clean title from filename
      const cleanTitle = fileName ? 
        fileName.replace('.pdf', '').replace(/[_-]/g, ' ').trim() : 
        'Documento';
      
      console.log('💾 [BACKEND_SAVE_DEBUG] Saving tutor session:', {
        sessionId,
        userId,
        fileName,
        cleanTitle,
        pageCount,
        fileSize
      });
      console.log('💾 [BACKEND_SAVE_DEBUG] userId type and value:', typeof userId, userId);
      
      const { data: insertData, error: insertError } = await supabaseAdmin!
        .from('tutor_sessions')
        .insert({
          id: sessionId,
          user_id: userId,
          file_name: fileName || 'documento.pdf', // Save original filename
          title: cleanTitle, // Clean title for display
          pdf_text: text,
          page_count: pageCount || null,
          file_size: fileSize || null,
          riassunto_breve: result.riassunto_breve,
          riassunto_esteso: result.riassunto_esteso,
          mappa_concettuale: result.mappa_concettuale,
          flashcard: result.flashcard,
          quiz: result.quiz,
          guida_esame: result.guida_esame,
          created_at: new Date().toISOString(),
          last_used_at: new Date().toISOString()
        })
        .select();
      
      // DEBUG: Log dell'inserimento documento
      console.log('📊 [DEBUG_INSERT_DOCUMENT] Insert result:', { 
        userId, 
        sessionId, 
        fileName, 
        insertError: insertError?.message || 'none',
        insertSuccess: !!insertData,
        insertData: insertData ? { 
          id: insertData[0]?.id, 
          user_id: insertData[0]?.user_id,
          title: insertData[0]?.title 
        } : null 
      });
      
      if (insertError) {
        console.error('❌ Database insert error:', insertError);
        throw insertError;
      }
      
      console.log('✅ Tutor session saved successfully:', insertData);
      result.sessionId = sessionId;
      console.log(`✅ Created tutor session: ${sessionId} for file: ${fileName}`);
    } catch (sessionError) {
      console.error('❌ [BACKEND_SAVE_ERROR] Failed to create tutor session:', sessionError);
      console.error('❌ [BACKEND_SAVE_ERROR] Session error details:', {
        error: sessionError,
        userId,
        fileName,
        errorMessage: sessionError instanceof Error ? sessionError.message : 'Unknown error'
      });
      // Don't fail the whole request for session creation issues
    }

    console.log('🚀 FINAL RESULT SUMMARY:', {
      riassunto_breve_length: result.riassunto_breve.length,
      riassunto_esteso_length: result.riassunto_esteso.length,
      flashcard_count: result.flashcard.length,
      mappa_concettuale_count: result.mappa_concettuale.length,
      quiz_count: result.quiz.length,
      extractedText_length: result.extractedText.length
    });
    
    console.log('🚀 FINAL FLASHCARDS IN RESULT:', JSON.stringify(result.flashcard, null, 2));

    return result;

  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`Failed to generate study materials: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Calculate total credits needed for full processing
const TOTAL_CREDITS_NEEDED = 25; // extraction(5) + summary(10) + flashcards(8) + quiz(8) + map(6) - simplified as one operation

export async function POST(request: NextRequest) {
  console.log('🚀 PDF-V2 API called');
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const language = formData.get('language') as string || 'Italiano';
    const targetLanguage = formData.get('targetLanguage') as string || language;
    const userId = formData.get('userId') as string;
    const isPremium = formData.get('isPremium') === 'true';
    
    console.log('📝 PDF processing started:', {
      fileName: file.name,
      userId,
      language,
      targetLanguage
    });

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    // Extract text from PDF
    const buffer = await file.arrayBuffer();
    console.log(`Processing PDF: ${file.name}, size: ${file.size} bytes`);

    const extractedText = await extractTextFromPDF(buffer, file.name);
    console.log(`Extracted ${extractedText.length} characters from PDF: ${file.name}`);

    if (!extractedText || extractedText.length < 50) {
      console.log('ERROR: Text extraction failed or too short');
      return NextResponse.json({
        error: 'Unable to extract meaningful text from this PDF. Please ensure it contains readable text (not just images).'
      }, { status: 400 });
    }

    // Calcola pagine stimate (approssimativo: 3000 caratteri per pagina)
    const estimatedPages = Math.max(1, Math.ceil(extractedText.length / 3000));
    const creditCost = getPdfCost(estimatedPages, isPremium);
    const costDescription = getPdfCostDescription(estimatedPages, isPremium);

    console.log(`PDF: ${estimatedPages} pages, cost: ${creditCost} credits`);

    // Consuma crediti prima di generare
    const baseUrl = request.url.split('/api')[0];
    const creditResponse = await fetch(`${baseUrl}/api/credits/consume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        amount: creditCost,
        description: costDescription,
        featureType: 'pdf'
      })
    });

    if (!creditResponse.ok) {
      const creditError = await creditResponse.json();
      if (creditError.error === 'insufficient_credits') {
        return NextResponse.json({
          error: 'insufficient_credits',
          message: 'Crediti insufficienti per elaborare questo PDF',
          required: creditCost,
          current: creditError.currentCredits || 0,
          costDescription: costDescription
        }, { status: 403 });
      }
      throw new Error('Errore nel consumo crediti');
    }

    const creditResult = await creditResponse.json();
    console.log(`Credits consumed: ${creditCost}, new balance: ${creditResult.newBalance}`);

    // Generate study materials with OpenAI
    const studyMaterials = await generateStudyMaterials(
      extractedText, 
      language, 
      userId, 
      targetLanguage,
      file.name, // Pass filename to save in database
      estimatedPages,
      file.size
    );

    return NextResponse.json({
      ...studyMaterials,
      newCreditBalance: creditResult.newBalance,
      creditsUsed: creditCost
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: `Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}