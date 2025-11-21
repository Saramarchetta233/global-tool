import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { withCredits } from '@/lib/middleware';
import { 
  createSummaryPrompt,
  createFlashcardsPrompt,
  createConceptMapPrompt,
  createQuizPrompt,
  createExamGuidePrompt
} from '@/lib/prompts';
import { supabase } from '@/lib/supabase';
import { extractTextWithOCR, validateOCRAvailable, estimateProcessingTime, SUPPORTED_LANGUAGES } from '@/lib/pdf-ocr-extractor';
import crypto from 'crypto';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Estrazione testo PDF con OCR GRATUITO (pdf2pic + Tesseract.js)
 */
async function extractTextFromPDFWithOCR(buffer: ArrayBuffer, fileName: string, language: string): Promise<{
  text: string;
  confidence: number;
  pageCount: number;
  processingTime: number;
}> {
  console.log('🔍 Avvio estrazione PDF con OCR gratuito...');
  console.log(`Buffer size: ${buffer.byteLength} bytes, File: ${fileName}`);
  
  // Verifica disponibilità OCR
  if (!validateOCRAvailable()) {
    throw new Error('OCR non disponibile. Verifica che tesseract.js sia installato correttamente.');
  }
  
  const pdfBuffer = Buffer.from(buffer);
  
  // Validazione PDF signature
  const signature = pdfBuffer.slice(0, 4).toString();
  if (!signature.startsWith('%PDF')) {
    throw new Error('File non valido: non è un PDF');
  }
  
  // Stima del tempo di elaborazione
  const estimatedPages = Math.ceil(pdfBuffer.length / 50000); // Stima approssimativa
  const estimatedTime = estimateProcessingTime(pdfBuffer.length, estimatedPages);
  console.log(`⏱️ Tempo stimato: ${(estimatedTime / 60).toFixed(1)} minuti per ~${estimatedPages} pagine`);
  
  try {
    // Mappa la lingua per Tesseract
    const languageMap: Record<string, string> = {
      'Italiano': 'ita+eng',
      'Inglese': 'eng',
      'Spagnolo': 'spa', 
      'Francese': 'fra',
      'Tedesco': 'deu',
      'Auto': 'ita+eng'
    };
    
    const ocrLanguage = languageMap[language] || 'ita+eng';
    console.log(`🌐 Lingua OCR: ${ocrLanguage}`);
    
    // Estrai testo con OCR
    const result = await extractTextWithOCR(pdfBuffer, {
      fileName: fileName,
      language: ocrLanguage,
      imageQuality: 300 // DPI ottimale per qualità/velocità
    });
    
    console.log(`✅ Estrazione OCR completata: ${result.text.length} caratteri`);
    console.log(`📊 ${result.pageCount} pagine, confidenza ${result.confidence.toFixed(2)}%, ${(result.processingTime/1000).toFixed(2)}s`);
    
    return result;
    
  } catch (ocrError) {
    console.error('❌ OCR extraction failed:', ocrError);
    
    // Errore specifico con suggerimento per l'utente
    const errorMessage = ocrError instanceof Error ? ocrError.message : 'Errore sconosciuto';
    
    if (errorMessage.includes('Worker')) {
      throw new Error('Errore nell\'inizializzazione dell\'OCR. Riprova tra qualche secondo.');
    } else if (errorMessage.includes('No text')) {
      throw new Error('Il PDF non contiene testo leggibile. Potrebbe essere un documento con solo immagini.');
    } else {
      throw new Error(`Impossibile elaborare il PDF con OCR: ${errorMessage}`);
    }
  }
}

async function generateStudyMaterials(text: string, language: string, targetLanguage?: string, ocrInfo?: any) {
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
    text.substring(0, maxLength) + "\\n\\n[Note: Text was truncated due to length limits]" :
    text;

  console.log(`Processing text: ${processedText.length} characters (original: ${text.length})`);

  // Aggiungi nota sulla qualità OCR se la confidenza è bassa
  let contextNote = '';
  if (ocrInfo && ocrInfo.confidence < 80) {
    contextNote = `\\n\\nNOTA: Questo testo è stato estratto tramite OCR con confidenza ${ocrInfo.confidence.toFixed(1)}%. Potrebbero esserci alcuni errori di riconoscimento.`;
  }

  const textWithContext = processedText + contextNote;

  // Use the new centralized prompts
  const prompts = {
    summary: createSummaryPrompt({ language: baseLang, text: textWithContext, targetLanguage: targetLang }),
    flashcards: createFlashcardsPrompt({ language: baseLang, text: textWithContext, targetLanguage: targetLang }),
    conceptMap: createConceptMapPrompt({ language: baseLang, text: textWithContext, targetLanguage: targetLang }),
    quiz: createQuizPrompt({ language: baseLang, text: textWithContext, targetLanguage: targetLang }),
    examGuide: createExamGuidePrompt({ language: baseLang, text: textWithContext, targetLanguage: targetLang })
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
        .trim();
    };

    const safeJSONParse = (content: string, fallback: any, name: string) => {
      try {
        console.log(`Parsing ${name} response...`);
        const cleaned = cleanJSON(content);
        const parsed = JSON.parse(cleaned);
        console.log(`${name} parsed successfully`);
        return parsed;
      } catch (error) {
        console.error(`JSON Parse Error for ${name}:`, error);
        return fallback;
      }
    };

    const summaryData = safeJSONParse(
      summaryResponse.choices[0].message.content || '{}',
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
      ocrInfo: ocrInfo, // Include OCR metadata
      sessionId: undefined // Will be set below
    };

    // Create tutor session automatically
    try {
      const sessionId = crypto.randomUUID();
      await supabase
        .from('tutor_sessions')
        .insert({
          id: sessionId,
          user_id: 'demo-user', // Will be set by middleware
          pdf_text: text,
          riassunto_breve: result.riassunto_breve,
          riassunto_esteso: result.riassunto_esteso,
          flashcard: result.flashcard,
          created_at: new Date().toISOString()
        });
      
      result.sessionId = sessionId;
      console.log(`Created tutor session: ${sessionId}`);
    } catch (sessionError) {
      console.error('Failed to create tutor session:', sessionError);
      // Don't fail the whole request for session creation issues
    }

    console.log('Final result summary:', {
      riassunto_breve_length: result.riassunto_breve.length,
      riassunto_esteso_length: result.riassunto_esteso.length,
      flashcard_count: result.flashcard.length,
      mappa_concettuale_count: result.mappa_concettuale.length,
      quiz_count: result.quiz.length,
      extractedText_length: result.extractedText.length,
      ocr_confidence: ocrInfo?.confidence
    });

    return result;

  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`Failed to generate study materials: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Calculate total credits needed for full processing
const TOTAL_CREDITS_NEEDED = 20; // Ridotto perché OCR è gratuito, solo OpenAI costa

export const POST = withCredits('extraction', async (request: NextRequest, user, newCreditBalance) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const language = formData.get('language') as string || 'Italiano';
    const targetLanguage = formData.get('targetLanguage') as string || language;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    // Extract text from PDF with OCR
    const buffer = await file.arrayBuffer();
    console.log(`Processing PDF with OCR: ${file.name}, size: ${file.size} bytes`);

    const extractionResult = await extractTextFromPDFWithOCR(buffer, file.name, language);
    console.log(`OCR Extracted ${extractionResult.text.length} characters from PDF: ${file.name}`);

    if (!extractionResult.text || extractionResult.text.length < 50) {
      console.log('ERROR: OCR extraction failed or too short');
      return NextResponse.json({
        error: 'Unable to extract meaningful text from this PDF using OCR. The document may contain only images or be corrupted.'
      }, { status: 400 });
    }

    // Generate study materials with OpenAI
    const studyMaterials = await generateStudyMaterials(
      extractionResult.text, 
      language, 
      targetLanguage,
      {
        confidence: extractionResult.confidence,
        pageCount: extractionResult.pageCount,
        processingTime: extractionResult.processingTime,
        method: 'OCR'
      }
    );

    return NextResponse.json({
      ...studyMaterials,
      newCreditBalance,
      creditsUsed: TOTAL_CREDITS_NEEDED,
      extractionMethod: 'OCR',
      ocrInfo: {
        confidence: extractionResult.confidence,
        pageCount: extractionResult.pageCount,
        processingTime: extractionResult.processingTime
      }
    });

  } catch (error) {
    console.error('Error processing PDF with OCR:', error);
    return NextResponse.json(
      { error: `Failed to process PDF with OCR: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
});