import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Estrazione PDF con metodo RAW (senza pdf-parse problematico)
 * Usa pattern matching manuale e parsing diretto
 */
async function extractTextFromPDFRaw(buffer: ArrayBuffer): Promise<string> {
  console.log('🔬 Starting RAW PDF extraction...');
  
  const pdfBuffer = Buffer.from(buffer);
  console.log(`Buffer: ${pdfBuffer.length} bytes`);
  
  // Validazione PDF
  const signature = pdfBuffer.slice(0, 4).toString();
  if (!signature.startsWith('%PDF')) {
    throw new Error('Not a valid PDF file');
  }
  
  const pdfString = pdfBuffer.toString('binary');
  let extractedText = '';
  
  console.log('🔍 Extracting with pattern matching...');
  
  // Method 1: Extract text from stream objects
  const streamRegex = /stream\s*([\s\S]*?)\s*endstream/gi;
  const streams = pdfString.match(streamRegex) || [];
  console.log(`Found ${streams.length} streams`);
  
  for (const stream of streams.slice(0, 10)) { // Process first 10 streams
    const content = stream.replace(/stream\s*/, '').replace(/\s*endstream/, '');
    // Extract readable text patterns
    const readableText = content.match(/[A-Za-z]{2,}/g);
    if (readableText && readableText.length > 3) {
      extractedText += readableText.join(' ') + ' ';
    }
  }
  
  // Method 2: Extract text from parentheses (PDF text objects)
  const textPatterns = pdfString.match(/\((.*?)\)/g) || [];
  console.log(`Found ${textPatterns.length} text patterns`);
  
  const cleanTexts = textPatterns
    .map(t => t.replace(/[()]/g, ''))
    .filter(t => t.length > 1 && /[A-Za-z]/.test(t))
    .slice(0, 100); // Take first 100 meaningful texts
  
  extractedText += ' ' + cleanTexts.join(' ');
  
  // Method 3: Extract from Tj operators (PDF text showing operators)
  const tjPatterns = pdfString.match(/\((.*?)\)\s*Tj/g) || [];
  console.log(`Found ${tjPatterns.length} Tj patterns`);
  
  for (const tj of tjPatterns.slice(0, 50)) {
    const text = tj.replace(/\((.*?)\)\s*Tj/, '$1');
    if (text.length > 1 && /[A-Za-z]/.test(text)) {
      extractedText += text + ' ';
    }
  }
  
  // Method 4: Extract from array text objects
  const arrayTexts = pdfString.match(/\[(.*?)\]\s*TJ/gi) || [];
  console.log(`Found ${arrayTexts.length} array text patterns`);
  
  for (const arrayText of arrayTexts.slice(0, 30)) {
    const content = arrayText.replace(/\[(.*?)\]\s*TJ/i, '$1');
    const texts = content.match(/\((.*?)\)/g) || [];
    for (const text of texts) {
      const cleanText = text.replace(/[()]/g, '');
      if (cleanText.length > 1 && /[A-Za-z]/.test(cleanText)) {
        extractedText += cleanText + ' ';
      }
    }
  }
  
  // Clean and normalize the extracted text
  const cleanedText = extractedText
    .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ') // Remove control chars
    .replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F]/g, ' ') // Keep printable + accents
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/(.)\1{4,}/g, '$1') // Remove repeated chars (aaaaaaa -> a)
    .trim();
  
  console.log(`✅ Extracted: ${extractedText.length} raw chars -> ${cleanedText.length} clean chars`);
  console.log(`Preview: "${cleanedText.substring(0, 200)}"`);
  
  if (cleanedText.length < 50) {
    throw new Error(`Insufficient text extracted: ${cleanedText.length} characters`);
  }
  
  return cleanedText;
}

async function generateStudyMaterials(text: string, language: string, targetLanguage?: string) {
  // Use the centralized prompts
  const {
    createSummaryPrompt,
    createFlashcardsPrompt,
    createConceptMapPrompt,
    createQuizPrompt,
    createExamGuidePrompt
  } = await import('@/lib/prompts');

  const languageMap: { [key: string]: string } = {
    'Italiano': 'Italian',
    'Inglese': 'English',
    'Spagnolo': 'Spanish',
    'Francese': 'French',
    'Tedesco': 'German'
  };

  const targetLang = targetLanguage ? languageMap[targetLanguage] || targetLanguage : languageMap[language] || 'Italian';

  // Truncate text if too long
  const maxLength = 10000;
  const processedText = text.length > maxLength ?
    text.substring(0, maxLength) + "\n\n[Nota: Testo troncato per limiti di elaborazione]" :
    text;

  console.log(`Processing ${processedText.length} characters in ${targetLang}`);

  const prompts = {
    summary: createSummaryPrompt({ language: targetLang, text: processedText, targetLanguage: targetLang }),
    flashcards: createFlashcardsPrompt({ language: targetLang, text: processedText, targetLanguage: targetLang }),
    conceptMap: createConceptMapPrompt({ language: targetLang, text: processedText, targetLanguage: targetLang }),
    quiz: createQuizPrompt({ language: targetLang, text: processedText, targetLanguage: targetLang }),
    examGuide: createExamGuidePrompt({ language: targetLang, text: processedText, targetLanguage: targetLang })
  };

  try {
    console.log('🤖 Starting OpenAI requests...');

    // Run all prompts in parallel for speed
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

    console.log('✅ All OpenAI responses received');

    // Parse responses safely
    const cleanJSON = (content: string) => {
      return content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
    };

    const safeJSONParse = (content: string, fallback: any, name: string) => {
      try {
        const cleaned = cleanJSON(content);
        const parsed = JSON.parse(cleaned);
        console.log(`✅ ${name} parsed successfully`);
        return parsed;
      } catch (error) {
        console.error(`❌ JSON Parse Error for ${name}:`, error);
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
      guida_esame: examGuideData.guida_esame || 'Unable to generate exam guide',
      extractedText: text
    };

    console.log('📊 Generated materials:', {
      riassunto_breve_length: result.riassunto_breve.length,
      riassunto_esteso_length: result.riassunto_esteso.length,
      flashcard_count: result.flashcard.length,
      mappa_concettuale_count: result.mappa_concettuale.length,
      quiz_count: result.quiz.length
    });

    return result;

  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`Failed to generate study materials: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function POST(request: NextRequest) {
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

    console.log(`📄 Processing: ${file.name} (${file.size} bytes)`);

    // Extract text with RAW method
    const buffer = await file.arrayBuffer();
    const extractedText = await extractTextFromPDFRaw(buffer);
    
    console.log(`✅ Text extracted: ${extractedText.length} characters`);

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json({
        error: 'Unable to extract meaningful text from this PDF. Please ensure it contains readable text.'
      }, { status: 400 });
    }

    // Generate study materials
    const studyMaterials = await generateStudyMaterials(extractedText, language, targetLanguage);

    return NextResponse.json({
      ...studyMaterials,
      method: 'raw-extraction',
      success: true
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: `Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}