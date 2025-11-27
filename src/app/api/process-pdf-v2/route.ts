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

  try {
    console.log('Starting OpenAI requests for study materials generation...');

    // Run prompts in parallel for faster processing
    console.log('Requesting all content from OpenAI in parallel...');
    const [
      summaryResponse,
      flashcardsResponse, 
      conceptMapResponse,
      quizResponse,
      examGuideResponse
    ] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompts.summary }],
        temperature: 0.3,
        max_tokens: 1200,
      }),
      openai.chat.completions.create({
        model: "gpt-4o-mini", 
        messages: [{ role: "user", content: prompts.flashcards }],
        temperature: 0.4,
        max_tokens: 1000,
      }),
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompts.conceptMap }],
        temperature: 0.3,
        max_tokens: 600,
      }),
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompts.quiz }],
        temperature: 0.4,
        max_tokens: 1000,
      }),
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompts.examGuide }],
        temperature: 0.3,
        max_tokens: 1200,
      })
    ]);
    console.log('All OpenAI responses received');

    // Parse responses
    const cleanJSON = (content: string) => {
      return content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/^[^{]*/g, '') // Rimuovi tutto prima della prima {
        .replace(/[^}]*$/g, '') // Rimuovi tutto dopo l'ultima }
        .trim();
    };

    const safeJSONParse = (content: string, fallback: any, name: string) => {
      try {
        console.log(`Parsing ${name} response...`);
        console.log(`Raw ${name} content:`, content?.substring(0, 300));
        
        const cleaned = cleanJSON(content);
        console.log(`Cleaned ${name} content:`, cleaned.substring(0, 300));
        
        const parsed = JSON.parse(cleaned);
        console.log(`${name} parsed successfully:`, Object.keys(parsed));
        return parsed;
      } catch (error) {
        console.error(`JSON Parse Error for ${name}:`, error);
        console.error(`Full content that failed to parse:`, content);
        
        // Enhanced fallback for summary
        if (name === 'summary') {
          console.log('🔧 Attempting enhanced fallback for summary...');
          
          // Strategy 1: Try to extract any JSON-like structure
          try {
            const jsonMatches = content.match(/\{[\s\S]*?\}/g);
            if (jsonMatches && jsonMatches.length > 0) {
              console.log('Found potential JSON structures:', jsonMatches.length);
              
              for (const match of jsonMatches) {
                try {
                  const parsed = JSON.parse(match);
                  if (parsed.riassunto_breve || parsed.riassunto_esteso) {
                    console.log('✅ Successfully extracted JSON from content');
                    return {
                      riassunto_breve: parsed.riassunto_breve || 'Riassunto breve estratto',
                      riassunto_esteso: parsed.riassunto_esteso || parsed.riassunto_breve || content
                    };
                  }
                } catch (e) {
                  continue;
                }
              }
            }
          } catch (e) {
            console.error('JSON extraction failed:', e);
          }
          
          // Strategy 2: Treat the whole response as summary content
          if (content && content.length > 100) {
            console.log('📝 Using direct content as summary');
            const lines = content.split('\n').filter(line => line.trim().length > 0);
            const firstPart = lines.slice(0, Math.min(15, Math.floor(lines.length / 2))).join('\n');
            
            return {
              riassunto_breve: firstPart.substring(0, 800) || 'Riassunto generato automaticamente',
              riassunto_esteso: content || 'Riassunto esteso generato automaticamente'
            };
          }
          
          // Strategy 3: Generate basic summary from original text
          console.log('⚠️ Using fallback summary generation');
          return {
            riassunto_breve: 'Il documento è stato elaborato con successo. Controlla gli altri tab per i contenuti generati.',
            riassunto_esteso: 'Riassunto esteso in fase di elaborazione. Il documento è stato processato correttamente e gli altri materiali di studio sono disponibili nei rispettivi tab.'
          };
        }
        
        return fallback;
      }
    };

    // Get the raw summary response
    const summaryResponseText = summaryResponse.choices[0].message.content || '{}';
    console.log('🔍 RAW SUMMARY RESPONSE:', summaryResponseText.substring(0, 500));
    
    const summaryData = safeJSONParse(
      summaryResponseText,
      { riassunto_breve: 'Errore nella generazione del riassunto breve', riassunto_esteso: 'Errore nella generazione del riassunto esteso' },
      'summary'
    );

    const flashcardsData = safeJSONParse(
      flashcardsResponse.choices[0].message.content || '{}',
      { flashcard: [] },
      'flashcards'
    );

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

    const result: any = {
      riassunto_breve: summaryData.riassunto_breve || 'Unable to generate brief summary',
      riassunto_esteso: summaryData.riassunto_esteso || 'Unable to generate extended summary',
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
      
      const { data: insertData, error: insertError } = await supabaseAdmin
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