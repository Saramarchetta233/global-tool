import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { withCredits } from '@/lib/middleware';
import { supabase } from '@/lib/supabase';
import { extractTextFromPDFEco } from '@/lib/llamaparseEco';
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

// Calculate total credits needed - SUPER REDUCED for ECO mode
const TOTAL_CREDITS_NEEDED = 5; // Maximum cost savings with ECO mode

async function generateStudyMaterials(text: string, language: string, userId: string, targetLanguage?: string) {
  const languageMap: { [key: string]: string } = {
    'Italiano': 'Italian',
    'Inglese': 'English', 
    'Spagnolo': 'Spanish',
    'Francese': 'French',
    'Tedesco': 'German'
  };

  const baseLang = languageMap[language] || 'Italian';
  const targetLang = targetLanguage ? languageMap[targetLanguage] || targetLanguage : baseLang;

  // Clean and process ECO text (from v1 parsing)
  const cleanedText = text
    .replace(/\s+/g, ' ')           // Normalize spaces
    .replace(/\n{3,}/g, '\n\n')     // Reduce excessive newlines
    .replace(/[^\w\s\.\,\!\?\;\:\-\(\)]/g, '') // Remove weird characters
    .trim();

  // Truncate text if too long (OpenAI has token limits)
  const maxLength = 10000; // Slightly smaller for ECO mode
  const processedText = cleanedText.length > maxLength ?
    cleanedText.substring(0, maxLength) + "\n\n[Note: Text was truncated due to length limits]" :
    cleanedText;

  console.log(`Processing ECO text: ${processedText.length} characters (original: ${text.length})`);
  console.log(`Text preview: "${processedText.substring(0, 200)}..."`);

  // Use SEPARATE prompts for summaries to avoid JSON issues
  const prompts = {
    summaryBrief: `Crea un riassunto breve in ${targetLang} di questo documento (massimo 300 parole):

${processedText}

RIASSUNTO BREVE:`,

    summaryExtended: `Sei un tutor universitario. Crea un riassunto esteso COMPLETO in ${targetLang} per superare l'esame (minimo 1200 parole).

DOCUMENTO: ${processedText}

Il riassunto deve includere:
- Panoramica generale dell'argomento
- Tutti i concetti chiave spiegati in dettaglio
- Teorie e modelli principali
- Esempi pratici e applicazioni
- Punti tipici richiesti all'esame
- Collegamenti tra i vari concetti
- Sintesi finale con i punti essenziali da ricordare

RIASSUNTO ESTESO UNIVERSITARIO:`,
    
    flashcards: `Crea 15 flashcard in ${targetLang} basate su questo testo:

${processedText}

Rispondi SOLO con JSON:
{"flashcard": [{"front": "domanda", "back": "risposta"}]}`,
    
    conceptMap: `Analizza questo documento e crea una mappa concettuale gerarchica in ${targetLang}.

DOCUMENTO:
${processedText}

Identifica 4-6 CONCETTI PRINCIPALI dal testo e per ciascuno trova 2-4 sottoconcetti correlati.

STRUTTURA RICHIESTA:
- Ogni concetto principale deve avere un titolo chiaro 
- Ogni sottoconcetto deve essere specifico e correlato al concetto padre
- Usa terminologia presente nel documento
- Minimo 15 nodi totali nella mappa

ESEMPIO STRUTTURA:
{
  "mappa_concettuale": [
    {
      "title": "Primo Concetto Principale",
      "children": [
        {"title": "Sottoconcetto specifico 1"},
        {"title": "Sottoconcetto specifico 2"},
        {"title": "Sottoconcetto specifico 3"}
      ]
    },
    {
      "title": "Secondo Concetto Principale", 
      "children": [
        {"title": "Altro sottoconcetto"},
        {"title": "Altro sottoconcetto correlato"}
      ]
    }
  ]
}

Rispondi SOLO con JSON valido:`,
    
    quiz: `Crea un quiz completo in ${targetLang} basato su questo documento:

DOCUMENTO:
${processedText}

Genera 10 domande miste (5 multiple choice + 5 aperte) di difficoltà progressiva.

STRUTTURA RICHIESTA per ogni domanda:
- Multiple choice: question, options (4 opzioni), correct_option_index (0-3), explanation
- Domande aperte: question, correct_answer, explanation

Copri tutti i concetti principali del documento.

Rispondi SOLO con JSON:
{
  "quiz": [
    {
      "id": "q1",
      "type": "multiple_choice", 
      "question": "Domanda multiple choice...",
      "options": ["Opzione A", "Opzione B", "Opzione C", "Opzione D"],
      "correct_option_index": 0,
      "explanation": "Spiegazione della risposta corretta"
    },
    {
      "id": "q2", 
      "type": "open",
      "question": "Domanda aperta...",
      "correct_answer": "Risposta attesa",
      "explanation": "Spiegazione dettagliata"
    }
  ]
}`,
    
    examGuide: `Crea una guida esame in ${targetLang} per questo testo:

${processedText}

Rispondi SOLO con JSON:
{"guida_esame": "guida pratica per studiare in 1 ora"}`
  };

  try {
    console.log('Starting OpenAI requests for study materials generation...');

    // Run prompts in parallel for faster processing (summaries separate)
    console.log('Requesting all content from OpenAI in parallel...');
    const [
      summaryBriefResponse,
      summaryExtendedResponse,
      flashcardsResponse, 
      conceptMapResponse,
      quizResponse,
      examGuideResponse
    ] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompts.summaryBrief }],
        temperature: 0.3,
        max_tokens: 500,
      }),
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompts.summaryExtended }],
        temperature: 0.3,
        max_tokens: 2000,
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

    // Parse responses (same as test-v2)
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

    // Extract summaries directly as text (no JSON parsing needed)
    const riassunto_breve = summaryBriefResponse.choices[0].message.content?.trim() || 
      'Errore nella generazione del riassunto breve';
    
    const riassunto_esteso = summaryExtendedResponse.choices[0].message.content?.trim() || 
      'Errore nella generazione del riassunto esteso';
    
    console.log('✅ Brief summary generated:', riassunto_breve.length, 'characters');
    console.log('✅ Extended summary generated:', riassunto_esteso.length, 'characters');

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
        content: `Genera 15 domande d'esame probabili in ${targetLang} con diversi livelli di difficoltà basate su:\n\n${processedText}\n\nRispondi SOLO con JSON valido:\n{\n  "domande_probabili": [\n    {"question": "domanda", "difficulty": "facile|medio|difficile"}\n  ]\n}`
      }],
      temperature: 0.4,
      max_tokens: 1000,
    });

    const probableQuestionsData = safeJSONParse(
      probableQuestionsResponse.choices[0].message.content || '{}',
      { domande_probabili: [] },
      'probableQuestions'
    );

    const result: any = {
      riassunto_breve,
      riassunto_esteso,
      flashcard: flashcardsData.flashcard || [],
      mappa_concettuale: conceptMapData.mappa_concettuale || [],
      quiz: quizData.quiz || [],
      guida_esame: examGuideData.guida_esame || 'Unable to generate exam guide',
      domande_probabili: probableQuestionsData.domande_probabili || [],
      extractedText: text, // Include the original text for tutor sessions
      sessionId: undefined // Will be set below
    };

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
    console.error('Error generating study materials:', error);
    throw error;
  }
}

export const POST = withCredits('extraction', async (request: NextRequest, user, newCreditBalance) => {
  console.log('🚀 Starting PDF processing with LlamaParse ECO mode...');
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
    
    // Extract text with LlamaParse SUPER ECO mode
    console.log('🦙 Starting LlamaParse SUPER ECO extraction...');
    console.log('💰 Cost optimization: vision=OFF, ocr=OFF, fast_mode=ON, extended_model=none');
    const extractedText = await extractTextFromPDFEco(pdfBuffer, file.name);
    console.log('Characters extracted:', extractedText.length);
    console.log('✅ SUPER ECO mode: Maximum cost savings achieved');
    
    if (!extractedText || extractedText.length < 100) {
      console.error('❌ Insufficient text extracted');
      return NextResponse.json({ error: 'Could not extract sufficient text from PDF' }, { status: 400 });
    }
    
    // Generate study materials with OpenAI
    const studyMaterials = await generateStudyMaterials(extractedText, language, user.id, targetLanguage);
    
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

    return NextResponse.json({
      ...studyMaterials,
      newCreditBalance,
      creditsUsed: 5
    });
    
  } catch (error) {
    console.error('❌ Error processing PDF:', error);
    return NextResponse.json(
      { error: `Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
});