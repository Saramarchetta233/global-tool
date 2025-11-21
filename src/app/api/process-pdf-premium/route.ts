import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { withCredits } from '@/lib/middleware';
import { supabase } from '@/lib/supabase';
import { extractTextFromPDFPremium } from '@/lib/llamaparsePremium';
import { 
  createSummaryPrompt,
  createFlashcardsPrompt,
  createConceptMapPrompt,
  createQuizPrompt,
  createExamGuidePrompt
} from '@/lib/prompts';
import crypto from 'crypto';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Calculate total credits needed for PREMIUM processing
const calculatePremiumCredits = (fileSize: number, pages: number): number => {
  // PREMIUM uses advanced AI processing, higher costs
  const baseCostPerPage = 20;
  const sizeFactor = Math.ceil(fileSize / (1024 * 1024));
  return Math.max(pages * baseCostPerPage + sizeFactor * 15, 50);
};

async function generateStudyMaterialsPremium(text: string, language: string, userId: string, targetLanguage?: string) {
  const languageMap: { [key: string]: string } = {
    'Italiano': 'Italian',
    'Inglese': 'English', 
    'Spagnolo': 'Spanish',
    'Francese': 'French',
    'Tedesco': 'German'
  };

  const baseLang = languageMap[language] || 'Italian';
  const targetLang = targetLanguage ? languageMap[targetLanguage] || targetLanguage : baseLang;

  // PREMIUM: Process more text with higher quality
  const maxLength = 15000; // Larger for premium
  const processedText = text.length > maxLength ?
    text.substring(0, maxLength) + "\n\n[Note: Text was truncated due to length limits]" :
    text;

  console.log(`Processing PREMIUM text: ${processedText.length} characters (original: ${text.length})`);

  // Use the same high-quality prompts as test-v2 for PREMIUM
  const prompts = {
    summary: createSummaryPrompt({ language: baseLang, text: processedText, targetLanguage: targetLang }),
    flashcards: createFlashcardsPrompt({ language: baseLang, text: processedText, targetLanguage: targetLang }),
    conceptMap: createConceptMapPrompt({ language: baseLang, text: processedText, targetLanguage: targetLang }),
    quiz: createQuizPrompt({ language: baseLang, text: processedText, targetLanguage: targetLang }),
    examGuide: createExamGuidePrompt({ language: baseLang, text: processedText, targetLanguage: targetLang })
  };

  try {
    console.log('Starting OpenAI requests for PREMIUM study materials generation...');

    // Run prompts in parallel for faster processing (same as test-v2)
    console.log('Requesting all content from OpenAI in parallel (PREMIUM)...');
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
        max_tokens: 1500, // Higher for premium
      }),
      openai.chat.completions.create({
        model: "gpt-4o-mini", 
        messages: [{ role: "user", content: prompts.flashcards }],
        temperature: 0.4,
        max_tokens: 1200, // Higher for premium
      }),
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompts.conceptMap }],
        temperature: 0.3,
        max_tokens: 800, // Higher for premium
      }),
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompts.quiz }],
        temperature: 0.4,
        max_tokens: 1200, // Higher for premium
      }),
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompts.examGuide }],
        temperature: 0.3,
        max_tokens: 1500, // Higher for premium
      })
    ]);
    console.log('All OpenAI responses received (PREMIUM)');

    // Parse responses (same as test-v2)
    const cleanJSON = (content: string) => {
      return content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
    };

    const safeJSONParse = (content: string, fallback: any, name: string) => {
      try {
        console.log(`Parsing ${name} response (PREMIUM)...`);
        const cleaned = cleanJSON(content);
        const parsed = JSON.parse(cleaned);
        console.log(`${name} parsed successfully (PREMIUM)`);
        return parsed;
      } catch (error) {
        console.error(`JSON Parse Error for ${name} (PREMIUM):`, error);
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

    // Generate probable exam questions
    const probableQuestionsResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Genera 20 domande d'esame probabili in ${targetLang} con diversi livelli di difficoltà basate su:\n\n${processedText}\n\nRispondi SOLO con JSON valido:\n{\n  "domande_probabili": [\n    {"question": "domanda", "difficulty": "facile|medio|difficile"}\n  ]\n}`
      }],
      temperature: 0.4,
      max_tokens: 1200,
    });

    const probableQuestionsData = safeJSONParse(
      probableQuestionsResponse.choices[0].message.content || '{}',
      { domande_probabili: [] },
      'probableQuestions'
    );

    const result: any = {
      riassunto_breve: summaryData.riassunto_breve || 'Unable to generate brief summary',
      riassunto_esteso: summaryData.riassunto_esteso || 'Unable to generate extended summary',
      flashcard: flashcardsData.flashcard || [],
      mappa_concettuale: conceptMapData.mappa_concettuale || [],
      quiz: quizData.quiz || [],
      guida_esame: examGuideData.guida_esame || 'Unable to generate exam guide',
      domande_probabili: probableQuestionsData.domande_probabili || [],
      extractedText: text, // Include the original text for tutor sessions
      sessionId: undefined // Will be set below
    };

    console.log('Final PREMIUM result summary:', {
      riassunto_breve_length: result.riassunto_breve.length,
      riassunto_esteso_length: result.riassunto_esteso.length,
      flashcard_count: result.flashcard.length,
      mappa_concettuale_count: result.mappa_concettuale.length,
      quiz_count: result.quiz.length,
      extractedText_length: result.extractedText.length
    });

    return result;

  } catch (error) {
    console.error('OpenAI API error (PREMIUM):', error);
    throw new Error(`Failed to generate PREMIUM study materials: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const POST = withCredits('extraction', async (request: NextRequest, user, newCreditBalance) => {
  console.log('🚀 Starting PDF processing with LlamaParse PREMIUM mode...');
  console.log('👤 User:', user.id);
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const language = formData.get('language') as string || 'Italiano';
    const targetLanguage = formData.get('targetLanguage') as string || language;
    
    console.log('📄 Received file:', file?.name, 'Size:', file?.size);
    
    if (!file) {
      console.error('❌ No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (file.type !== 'application/pdf') {
      console.error('❌ File is not PDF:', file.type);
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }
    
    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(buffer);
    console.log('✅ File converted to buffer:', pdfBuffer.length, 'bytes');
    
    // Extract text with LlamaParse PREMIUM mode
    console.log('🚀 Starting LlamaParse PREMIUM extraction...');
    console.log('✨ PREMIUM optimization: vision=ON, scientific=ON, advanced_processing=ON');
    const extractedText = await extractTextFromPDFPremium(pdfBuffer, file.name);
    console.log('Characters extracted:', extractedText.length);
    console.log('✅ PREMIUM mode: Maximum quality achieved');
    
    if (!extractedText || extractedText.length < 100) {
      console.error('❌ Insufficient text extracted');
      return NextResponse.json({ error: 'Could not extract sufficient text from PDF' }, { status: 400 });
    }
    
    // Generate study materials with OpenAI (PREMIUM quality)
    const studyMaterials = await generateStudyMaterialsPremium(extractedText, language, user.id, targetLanguage);
    
    // Create tutor session automatically (same as test-v2)
    try {
      const sessionId = crypto.randomUUID();
      await supabase
        .from('tutor_sessions')
        .insert({
          id: sessionId,
          user_id: user.id,
          pdf_text: extractedText,
          riassunto_breve: studyMaterials.riassunto_breve,
          riassunto_esteso: studyMaterials.riassunto_esteso,
          flashcard: studyMaterials.flashcard,
          created_at: new Date().toISOString()
        });
      
      studyMaterials.sessionId = sessionId;
      console.log(`Created tutor session: ${sessionId}`);
    } catch (sessionError) {
      console.error('Failed to create tutor session:', sessionError);
      // Don't fail the whole request for session creation issues
    }

    // Calculate actual credits used
    const estimatedPages = Math.ceil(pdfBuffer.length / 50000); // Rough estimate
    const actualCreditsUsed = calculatePremiumCredits(pdfBuffer.length, estimatedPages);

    return NextResponse.json({
      ...studyMaterials,
      newCreditBalance,
      creditsUsed: actualCreditsUsed,
      processingMode: 'PREMIUM'
    });
    
  } catch (error) {
    console.error('❌ Error processing PDF (PREMIUM):', error);
    return NextResponse.json(
      { error: `Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
});