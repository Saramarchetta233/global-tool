import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { parsePdfWithLlamaParse, validateLlamaParseConfig } from '@/lib/llamaParse';
import { getPdfCost, getPdfCostDescription } from '@/lib/credits/calcPdfCost';

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const language = formData.get('language') as string || 'Italiano';
    const userId = formData.get('userId') as string;
    const isPremium = formData.get('isPremium') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    // Extract real text from PDF
    const buffer = await file.arrayBuffer();
    console.log(`Processing PDF: ${file.name}, size: ${file.size} bytes`);

    const extractedText = await extractTextFromPDF(buffer, file.name);
    console.log(`Extracted ${extractedText.length} characters from PDF: ${file.name}`);

    // Calcola pagine stimate (approssimativo: 3000 caratteri per pagina)
    const estimatedPages = Math.max(1, Math.ceil(extractedText.length / 3000));
    const creditCost = getPdfCost(estimatedPages, isPremium);
    const costDescription = getPdfCostDescription(estimatedPages, isPremium);

    // Consuma crediti prima di generare
    const creditResponse = await fetch(`${new URL(request.url).origin}/api/credits/consume`, {
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

    // Log first 200 characters for debugging
    console.log('First 200 chars:', extractedText.substring(0, 200));

    if (!extractedText || extractedText.length < 50) {
      console.log('ERROR: Text extraction failed or too short');
      return NextResponse.json({
        error: 'Unable to extract meaningful text from this PDF. Please ensure it contains readable text (not just images).'
      }, { status: 400 });
    }

    // Generate study materials with OpenAI
    const studyMaterials = await generateStudyMaterials(extractedText, language);

    return NextResponse.json(studyMaterials);
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: `Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

async function generateStudyMaterials(text: string, language: string) {
  // Initialize OpenAI client inside the function
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const languageMap: { [key: string]: string } = {
    'Italiano': 'Italian',
    'Inglese': 'English',
    'Spagnolo': 'Spanish',
    'Francese': 'French',
    'Tedesco': 'German'
  };

  const targetLang = languageMap[language] || 'Italian';

  // Truncate text if too long (OpenAI has token limits)
  // Roughly 1 token = 4 characters, so 12000 chars ≈ 3000 tokens (safe for GPT-4o-mini)
  const maxLength = 12000;
  const processedText = text.length > maxLength ?
    text.substring(0, maxLength) + "\n\n[Note: Text was truncated due to length limits]" :
    text;

  console.log(`Processing text: ${processedText.length} characters (original: ${text.length})`);

  // Usa i prompts centralizzati migliorati
  const {
    createSummaryPrompt,
    createFlashcardsPrompt,
    createConceptMapPrompt,
    createQuizPrompt,
    createExamGuidePrompt
  } = await import('@/lib/prompts');

  const prompts = {
    summary: createSummaryPrompt({ language: targetLang, text: processedText, targetLanguage: targetLang }),
    flashcards: createFlashcardsPrompt({ language: targetLang, text: processedText, targetLanguage: targetLang }),
    conceptMap: createConceptMapPrompt({ language: targetLang, text: processedText, targetLanguage: targetLang }),
    quiz: createQuizPrompt({ language: targetLang, text: processedText, targetLanguage: targetLang }),
    examGuide: createExamGuidePrompt({ language: targetLang, text: processedText, targetLanguage: targetLang })
  };

  try {
    console.log('Starting OpenAI requests for study materials generation...');

    // Run prompts sequentially to avoid rate limits
    console.log('Requesting summary from OpenAI...');
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompts.summary }],
      temperature: 0.3,
      max_tokens: 1000,
    });
    console.log('Summary response received');

    console.log('Requesting flashcards from OpenAI...');
    const flashcardsResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompts.flashcards }],
      temperature: 0.4,
      max_tokens: 800,
    });
    console.log('Flashcards response received');

    console.log('Requesting concept map from OpenAI...');
    const conceptMapResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompts.conceptMap }],
      temperature: 0.3,
      max_tokens: 600,
    });
    console.log('Concept map response received');

    console.log('Requesting quiz from OpenAI...');
    const quizResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompts.quiz }],
      temperature: 0.4,
      max_tokens: 800,
    });
    console.log('Quiz response received');

    console.log('Requesting exam guide from OpenAI...');
    const examGuideResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompts.examGuide }],
      temperature: 0.3,
      max_tokens: 1200,
    });
    console.log('Exam guide response received');

    // Parse responses - clean up markdown formatting
    const cleanJSON = (content: string) => {
      return content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
    };

    const safeJSONParse = (content: string, fallback: any, name: string) => {
      try {
        console.log(`Parsing ${name} response...`);
        console.log(`Raw ${name} content:`, content?.substring(0, 200) + '...');
        const cleaned = cleanJSON(content);
        const parsed = JSON.parse(cleaned);
        console.log(`${name} parsed successfully`);
        return parsed;
      } catch (error) {
        console.error(`JSON Parse Error for ${name}:`, error, 'Content:', content);
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

    const result = {
      riassunto_breve: summaryData.riassunto_breve || 'Unable to generate brief summary',
      riassunto_esteso: summaryData.riassunto_esteso || 'Unable to generate extended summary',
      flashcard: flashcardsData.flashcard || [],
      mappa_concettuale: conceptMapData.mappa_concettuale || [],
      quiz: quizData.quiz || [],
      guida_esame: examGuideData.guida_esame || 'Unable to generate exam guide'
    };

    console.log('Final result summary:', {
      riassunto_breve_length: result.riassunto_breve.length,
      riassunto_esteso_length: result.riassunto_esteso.length,
      flashcard_count: result.flashcard.length,
      mappa_concettuale_count: result.mappa_concettuale.length,
      quiz_count: result.quiz.length,
      guida_esame_length: result.guida_esame.length
    });

    return result;

  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`Failed to generate study materials: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}