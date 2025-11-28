import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getPdfCost, getPdfCostDescription } from '@/lib/credits/calcPdfCost';
import { 
  createSummaryPrompt,
  createFlashcardsPrompt,
  createConceptMapPrompt,
  createQuizPrompt,
  createExamGuidePrompt
} from '@/lib/prompts';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { parsePdfWithLlamaParse, validateLlamaParseConfig } from '@/lib/llamaParse';
import crypto from 'crypto';

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
  const maxLength = 12000;
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

  // Retry function for OpenAI API calls
  const retryOpenAI = async (prompt: string, maxTokens: number, temperature: number, attempts: number = 3): Promise<any> => {
    for (let i = 0; i < attempts; i++) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: temperature,
          max_tokens: maxTokens,
        });
        return response;
      } catch (error) {
        console.error(`OpenAI attempt ${i + 1} failed:`, error);
        if (i === attempts - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Progressive delay
      }
    }
  };

  try {
    console.log('Starting OpenAI requests for study materials generation...');

    // Run prompts in parallel for faster processing with retry logic
    console.log('Requesting all content from OpenAI in parallel with retry...');
    const [
      summaryResponse,
      flashcardsResponse, 
      conceptMapResponse,
      quizResponse,
      examGuideResponse
    ] = await Promise.all([
      retryOpenAI(prompts.summary, 1200, 0.3),
      retryOpenAI(prompts.flashcards, 1000, 0.4),
      retryOpenAI(prompts.conceptMap, 600, 0.3),
      retryOpenAI(prompts.quiz, 1000, 0.4),
      retryOpenAI(prompts.examGuide, 1200, 0.3)
    ]);
    console.log('All OpenAI responses received');

    // Parse responses - Improved JSON cleaning that preserves content structure
    const cleanJSON = (content: string) => {
      let cleaned = content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      // Find the first { and last } to extract only the JSON part
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      }

      return cleaned;
    };

    // Enhanced fallback generation for summaries
    const generateFallbackSummary = (text: string, targetLang: string) => {
      const words = text.split(' ');
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
      
      // Create brief summary from first sentences
      const briefSentences = sentences.slice(0, Math.min(8, sentences.length));
      const brief = briefSentences.join('. ').trim() + '.';
      
      // Create extended summary with more content
      const extendedSentences = sentences.slice(0, Math.min(20, sentences.length));
      const extended = `**RIASSUNTO DEL DOCUMENTO**\n\n${extendedSentences.join('. ').trim()}.`;
      
      return {
        riassunto_breve: brief.length > 50 ? brief : `Riassunto del documento: ${text.substring(0, 500)}...`,
        riassunto_esteso: extended.length > 100 ? extended : `**CONTENUTO PRINCIPALE**\n\n${text.substring(0, 1000)}...`
      };
    };

    // Enhanced intelligent fallback generation for flashcards
    const generateFallbackFlashcards = (text: string, targetLang: string) => {
      const flashcards = [];
      
      // Extract key concepts intelligently
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30);
      
      // Find sentences with key academic indicators
      const keyIndicators = [
        'definizione', 'concetto', 'teoria', 'principio', 'metodo', 'processo', 
        'caratteristica', 'funzione', 'obiettivo', 'risultato', 'conclusione',
        'analisi', 'studio', 'ricerca', 'modello', 'sistema', 'strategia',
        'è importante', 'è necessario', 'si può', 'si deve', 'permette di',
        'consente', 'attraverso', 'mediante', 'grazie a', 'a causa di'
      ];
      
      const conceptSentences = sentences.filter(sentence => {
        const lowerSentence = sentence.toLowerCase();
        return keyIndicators.some(indicator => lowerSentence.includes(indicator)) ||
               lowerSentence.includes('che') || lowerSentence.includes('quando') ||
               lowerSentence.includes('come') || lowerSentence.includes('perché');
      });
      
      // Generate intelligent Q&A from concept sentences
      for (let i = 0; i < Math.min(8, conceptSentences.length); i++) {
        const sentence = conceptSentences[i].trim();
        let front, back;
        
        // Pattern-based question generation
        if (sentence.toLowerCase().includes('definizione') || sentence.toLowerCase().includes('è definito')) {
          front = `Come viene definito il concetto principale descritto?`;
          back = sentence;
        } else if (sentence.toLowerCase().includes('caratteristica') || sentence.toLowerCase().includes('proprietà')) {
          front = `Quali sono le principali caratteristiche descritte nel documento?`;
          back = sentence;
        } else if (sentence.toLowerCase().includes('funzione') || sentence.toLowerCase().includes('serve')) {
          front = `Quale funzione o scopo viene descritto?`;
          back = sentence;
        } else if (sentence.toLowerCase().includes('processo') || sentence.toLowerCase().includes('procedura')) {
          front = `Come funziona il processo descritto?`;
          back = sentence;
        } else if (sentence.toLowerCase().includes('importante') || sentence.toLowerCase().includes('rilevante')) {
          front = `Perché questo aspetto è considerato importante?`;
          back = sentence;
        } else if (sentence.toLowerCase().includes('risultato') || sentence.toLowerCase().includes('conclusione')) {
          front = `Quali sono i risultati o le conclusioni principali?`;
          back = sentence;
        } else {
          // Generic but meaningful questions
          front = `Spiega il concetto chiave descritto in questa sezione`;
          back = sentence;
        }
        
        // Only add if both front and back are meaningful
        if (front.length > 10 && back.length > 20) {
          flashcards.push({ front, back });
        }
      }
      
      // If we still don't have enough, extract key topics differently
      if (flashcards.length < 5) {
        // Look for paragraphs and extract main concepts
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 100);
        
        for (let i = 0; i < Math.min(5, paragraphs.length) && flashcards.length < 8; i++) {
          const paragraph = paragraphs[i].trim();
          const firstSentence = paragraph.split(/[.!?]+/)[0];
          
          if (firstSentence && firstSentence.length > 20) {
            flashcards.push({
              front: `Descrivi il concetto principale di questa sezione del documento`,
              back: firstSentence.trim() + '.'
            });
          }
        }
      }
      
      // Final fallback with document overview
      while (flashcards.length < 5) {
        const remainingSlots = 5 - flashcards.length;
        const chunkSize = Math.floor(text.length / remainingSlots);
        const startIndex = (flashcards.length) * chunkSize;
        const chunk = text.substring(startIndex, startIndex + Math.min(chunkSize, 300));
        const mainSentence = chunk.split(/[.!?]+/)[0];
        
        if (mainSentence && mainSentence.length > 15) {
          flashcards.push({
            front: `Qual è l'argomento trattato in questa parte del documento?`,
            back: mainSentence.trim() + '.'
          });
        } else {
          break;
        }
      }
      
      return { flashcard: flashcards };
    };

    const safeJSONParse = (content: string, fallback: any, name: string, text?: string, targetLang?: string) => {
      try {
        console.log(`Parsing ${name} response...`);
        console.log(`Raw ${name} content:`, content?.substring(0, 300));
        
        const cleaned = cleanJSON(content);
        console.log(`Cleaned ${name} content:`, cleaned.substring(0, 300));
        
        const parsed = JSON.parse(cleaned);
        console.log(`${name} parsed successfully:`, Object.keys(parsed));
        
        // Validate content exists and is meaningful
        if (name === 'summary') {
          if (!parsed.riassunto_breve || !parsed.riassunto_esteso || 
              parsed.riassunto_breve.length < 50 || parsed.riassunto_esteso.length < 100) {
            console.log(`⚠️ Invalid summary content, generating fallback...`);
            return text ? generateFallbackSummary(text, targetLang || 'Italian') : fallback;
          }
          
          // Additional validation for summary content to prevent mixing
          const briefLength = parsed.riassunto_breve.length;
          const extendedLength = parsed.riassunto_esteso.length;
          
          console.log(`Summary validation: brief=${briefLength} chars, extended=${extendedLength} chars`);
          
          // If brief is longer than extended, they might be swapped
          if (briefLength > extendedLength && extendedLength > 0) {
            console.log('⚠️ Detected swapped summaries, fixing...');
            const temp = parsed.riassunto_breve;
            parsed.riassunto_breve = parsed.riassunto_esteso;
            parsed.riassunto_esteso = temp;
          }
          
          // If brief is too long (over 800 words), truncate it
          const briefWordCount = parsed.riassunto_breve.split(' ').length;
          if (briefWordCount > 800) {
            console.log(`⚠️ Brief summary too long (${briefWordCount} words), truncating...`);
            const words = parsed.riassunto_breve.split(' ');
            parsed.riassunto_breve = words.slice(0, 600).join(' ') + '...';
          }
        }
        
        // Validate flashcards with quality checks
        if (name === 'flashcards') {
          if (!parsed.flashcard || !Array.isArray(parsed.flashcard) || parsed.flashcard.length === 0) {
            console.log(`⚠️ No valid flashcards found, generating fallback...`);
            return text ? generateFallbackFlashcards(text, targetLang || 'Italian') : fallback;
          }
          
          // Check quality of flashcards and filter out poor ones
          const qualityFlashcards = parsed.flashcard.filter((card: any) => {
            if (!card.front || !card.back) return false;
            
            // Remove low-quality patterns
            const front = card.front.toLowerCase();
            const back = card.back.toLowerCase();
            
            // Filter out vague questions
            const poorPatterns = [
              'cosa dice il documento riguardo',
              'qual è il contenuto',
              'cosa contiene',
              'di cosa parla',
              'cosa viene detto'
            ];
            
            const hasPoorPattern = poorPatterns.some(pattern => front.includes(pattern));
            const hasNumbers = /\d{4}/.test(back); // Filter responses that are just years/numbers
            const isTooShort = card.back.length < 20;
            const isFragmented = back.includes('...') && back.length < 50;
            
            return !hasPoorPattern && !hasNumbers && !isTooShort && !isFragmented;
          });
          
          console.log(`🃏 Quality check: ${parsed.flashcard.length} -> ${qualityFlashcards.length} flashcards`);
          
          // If too few quality flashcards remain, generate fallback
          if (qualityFlashcards.length < 3) {
            console.log(`⚠️ Too few quality flashcards (${qualityFlashcards.length}), generating fallback...`);
            return text ? generateFallbackFlashcards(text, targetLang || 'Italian') : fallback;
          }
          
          parsed.flashcard = qualityFlashcards;
        }
        
        return parsed;
      } catch (error) {
        console.error(`JSON Parse Error for ${name}:`, error);
        console.error(`Full content that failed to parse:`, content);
        
        // Generate intelligent fallbacks based on original text
        if (text && name === 'summary') {
          console.log(`🚨 Generating emergency fallback summary...`);
          return generateFallbackSummary(text, targetLang || 'Italian');
        }
        if (text && name === 'flashcards') {
          console.log(`🚨 Generating emergency fallback flashcards...`);
          return generateFallbackFlashcards(text, targetLang || 'Italian');
        }
        
        return fallback;
      }
    };

    // Get the raw summary response
    const summaryResponseText = summaryResponse.choices[0].message.content || '{}';
    console.log('🔍 RAW SUMMARY RESPONSE:', summaryResponseText.substring(0, 500));
    console.log('🔍 SUMMARY RESPONSE LENGTH:', summaryResponseText.length);
    
    const summaryData = safeJSONParse(
      summaryResponseText,
      { riassunto_breve: 'Errore nella generazione del riassunto breve', riassunto_esteso: 'Errore nella generazione del riassunto esteso' },
      'summary',
      processedText,
      targetLang
    );

    // Debug flashcards specifically
    const flashcardsResponseText = flashcardsResponse.choices[0].message.content || '{}';
    console.log('🃏 RAW FLASHCARDS RESPONSE:', flashcardsResponseText);
    console.log('🃏 FLASHCARDS RESPONSE LENGTH:', flashcardsResponseText.length);
    
    const flashcardsData = safeJSONParse(
      flashcardsResponseText,
      { flashcard: [] },
      'flashcards',
      processedText,
      targetLang
    );
    
    console.log('🃏 FLASHCARDS PARSED DATA:', flashcardsData);
    console.log('🃏 FLASHCARD ARRAY:', flashcardsData.flashcard);
    console.log('🃏 FLASHCARD COUNT:', flashcardsData.flashcard?.length || 0);
    
    // Clean and validate flashcards
    if (flashcardsData.flashcard && Array.isArray(flashcardsData.flashcard)) {
      console.log('🃏 RAW FIRST FLASHCARD:', flashcardsData.flashcard[0]);
      
      // Filter out invalid flashcards (missing front or back)
      flashcardsData.flashcard = flashcardsData.flashcard.filter((card: any, index: number) => {
        const hasValidFront = card?.front && typeof card.front === 'string' && card.front.trim().length > 0;
        const hasValidBack = card?.back && typeof card.back === 'string' && card.back.trim().length > 0;
        
        if (!hasValidFront || !hasValidBack) {
          console.log(`🃏 REMOVING INVALID FLASHCARD ${index}:`, { front: card?.front, back: card?.back });
          return false;
        }
        return true;
      });
      
      console.log('🃏 CLEANED FLASHCARD COUNT:', flashcardsData.flashcard.length);
      if (flashcardsData.flashcard.length > 0) {
        console.log('🃏 FIRST VALID FLASHCARD:', flashcardsData.flashcard[0]);
      }
    }

    const conceptMapData = safeJSONParse(
      conceptMapResponse.choices[0].message.content || '{}',
      { mappa_concettuale: [] },
      'conceptMap'
    );

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

    // FINAL SAFETY CHECK - Ensure we always have valid content
    const ensureMinimumContent = (data: any, text: string, targetLang: string) => {
      console.log('🔒 Final safety check for content validity...');
      
      // Ensure summaries exist and have minimum length
      if (!data.riassunto_breve || data.riassunto_breve.length < 50) {
        console.log('🚨 Emergency: No brief summary, generating from text...');
        const fallbackSummary = generateFallbackSummary(text, targetLang);
        data.riassunto_breve = fallbackSummary.riassunto_breve;
      }
      
      if (!data.riassunto_esteso || data.riassunto_esteso.length < 100) {
        console.log('🚨 Emergency: No extended summary, generating from text...');
        const fallbackSummary = generateFallbackSummary(text, targetLang);
        data.riassunto_esteso = fallbackSummary.riassunto_esteso;
      }
      
      // Ensure flashcards exist
      if (!data.flashcard || !Array.isArray(data.flashcard) || data.flashcard.length === 0) {
        console.log('🚨 Emergency: No flashcards, generating from text...');
        const fallbackFlashcards = generateFallbackFlashcards(text, targetLang);
        data.flashcard = fallbackFlashcards.flashcard;
      }
      
      console.log('✅ Content safety check completed:', {
        briefLength: data.riassunto_breve?.length || 0,
        extendedLength: data.riassunto_esteso?.length || 0,
        flashcardCount: data.flashcard?.length || 0
      });
      
      return data;
    };

    let result: any = {
      riassunto_breve: summaryData.riassunto_breve || 'Unable to generate brief summary',
      riassunto_esteso: summaryData.riassunto_esteso || 'Unable to generate extended summary',
      flashcard: flashcardsData.flashcard || [],
      mappa_concettuale: conceptMapData.mappa_concettuale || [],
      quiz: quizData.quiz || [],
      guida_esame: examGuideData.guida_esame || 'Unable to generate exam guide',
      extractedText: text, // Include the original text for tutor sessions
      sessionId: undefined // Will be set below
    };
    
    // Apply final safety check
    result = ensureMinimumContent(result, processedText, targetLang);

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

    console.log('Final result summary:', {
      riassunto_breve_length: result.riassunto_breve.length,
      riassunto_esteso_length: result.riassunto_esteso.length,
      flashcard_count: result.flashcard.length,
      mappa_concettuale_count: result.mappa_concettuale.length,
      quiz_count: result.quiz.length,
      extractedText_length: result.extractedText.length
    });

    return result;

  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`Failed to generate study materials: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Calculate total credits needed for full processing - handled dynamically by getPdfCost()

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