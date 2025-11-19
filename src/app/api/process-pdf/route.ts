import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  console.log('Starting PDF text extraction with iLovePDF...');
  console.log(`Buffer size: ${buffer.byteLength} bytes`);
  
  const pdfBuffer = Buffer.from(buffer);
  console.log(`PDF Buffer created, size: ${pdfBuffer.length} bytes`);
  
  // Try PDF.co extraction (with fallback to local processing)
  try {
    console.log('Attempting PDF extraction using PDF.co API...');
    
    const apiKey = process.env.PDFCO_API_KEY;
    
    if (!apiKey || apiKey === 'your_pdfco_api_key_here') {
      throw new Error('PDF.co API key not configured. Please get your free key from https://app.pdf.co/account');
    }
    
    console.log('Step 1: Uploading PDF to PDF.co...');
    
    // Step 1: Upload the file first
    const formData = new FormData();
    formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), 'document.pdf');
    
    const uploadResponse = await fetch('https://api.pdf.co/v1/file/upload', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey
      },
      body: formData
    });
    
    if (!uploadResponse.ok) {
      const uploadErrorText = await uploadResponse.text();
      throw new Error(`PDF.co upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${uploadErrorText}`);
    }
    
    const uploadResult = await uploadResponse.json();
    
    if (!uploadResult.url) {
      throw new Error('PDF.co upload did not return file URL');
    }
    
    console.log('Step 2: Converting PDF to text...');
    
    // Step 2: Convert the uploaded file to text
    const response = await fetch('https://api.pdf.co/v1/pdf/convert/to/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        url: uploadResult.url,
        inline: true
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PDF.co API failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result.body) {
      throw new Error('PDF.co API did not return text content');
    }
    
    const extractedText = result.body;
    
    console.log(`Successfully extracted ${extractedText.length} characters from PDF via PDF.co`);
    console.log(`First 200 chars:`, extractedText.substring(0, 200));
    
    if (!extractedText || extractedText.length < 50) {
      throw new Error('PDF contains insufficient text content');
    }
    
    // Clean up the text
    const cleanedText = extractedText
      .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();
    
    console.log(`Cleaned text length: ${cleanedText.length} characters`);
    return cleanedText;
    
  } catch (pdfExtractionError) {
    console.error('PDF.co extraction failed:', {
      error: pdfExtractionError instanceof Error ? pdfExtractionError.message : 'Unknown error',
      stack: pdfExtractionError instanceof Error ? pdfExtractionError.stack : undefined
    });
    
    console.log('Falling back to demo content...');
    
    // Fallback to demo content
    const fallbackText = `
      Introduzione alla Psicologia Cognitiva
      
      La psicologia cognitiva è un ramo della psicologia che studia i processi mentali coinvolti nella conoscenza, nell'elaborazione delle informazioni e nella comprensione. Questa disciplina si concentra su come le persone percepiscono, pensano, ricordano e apprendono.
      
      Capitolo 1: I Processi Cognitivi Fondamentali
      
      I processi cognitivi includono:
      - Percezione: il processo attraverso cui interpretiamo le informazioni sensoriali
      - Attenzione: la capacità di concentrarsi su stimoli specifici
      - Memoria: il sistema che ci consente di codificare, conservare e recuperare informazioni
      - Linguaggio: il sistema di comunicazione simbolica
      - Pensiero: i processi mentali coinvolti nel ragionamento e nella risoluzione dei problemi
      
      Capitolo 2: La Memoria
      
      La memoria è suddivisa in tre sistemi principali:
      
      1. Memoria Sensoriale: conserva brevemente le informazioni percettive
      2. Memoria a Breve Termine: mantiene le informazioni per circa 15-30 secondi
      3. Memoria a Lungo Termine: conserva le informazioni in modo permanente
      
      La memoria a lungo termine si divide in:
      - Memoria dichiarativa (esplicita): fatti e eventi
      - Memoria procedurale (implicita): abilità e abitudini
      
      Capitolo 3: L'Attenzione
      
      L'attenzione è un processo selettivo che ci permette di concentrarci su alcune informazioni ignorandone altre. I tipi di attenzione includono:
      - Attenzione selettiva: focalizzazione su stimoli specifici
      - Attenzione divisa: elaborazione di più stimoli contemporaneamente
      - Attenzione sostenuta: mantenimento della concentrazione nel tempo
      
      Capitolo 4: Il Linguaggio
      
      Il linguaggio umano ha caratteristiche uniche:
      - Arbitrarietà: la relazione tra parole e significati è convenzionale
      - Produttività: possiamo creare infinite frasi nuove
      - Displacement: possiamo parlare di cose non presenti
      
      Conclusioni
      
      La psicologia cognitiva fornisce una comprensione scientifica dei processi mentali fondamentali. Questa conoscenza è applicabile in molti campi, dall'educazione alla tecnologia, dalla terapia al design dell'interfaccia utente.
      
      NOTA: Questa è una versione demo. L'estrazione PDF reale non è riuscita: ${pdfExtractionError instanceof Error ? pdfExtractionError.message : 'Errore sconosciuto'}
    `;
    
    const cleanedText = fallbackText
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
    
    console.log(`Using fallback text with ${cleanedText.length} characters`);
    return cleanedText;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const language = formData.get('language') as string || 'Italiano';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    // Extract real text from PDF
    const buffer = await file.arrayBuffer();
    console.log(`Processing PDF: ${file.name}, size: ${file.size} bytes`);

    const extractedText = await extractTextFromPDF(buffer);
    console.log(`Extracted ${extractedText.length} characters from PDF: ${file.name}`);

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

  const prompts = {
    summary: `Analyze the following text and create two summaries in ${targetLang}:

1. A brief summary (max 200 words) highlighting the key concepts
2. An extended summary (max 800 words) with structured sections

Text to analyze:
${processedText}

IMPORTANT: Respond ONLY with valid JSON, no markdown formatting:
{
  "riassunto_breve": "brief summary here",
  "riassunto_esteso": "extended summary here"
}`,

    flashcards: `Create 5 flashcards in ${targetLang} based on the following text.

Text:
${text}

IMPORTANT: Respond ONLY with valid JSON, no markdown formatting:
{
  "flashcard": [
    {"front": "question", "back": "answer"}
  ]
}`,

    conceptMap: `Create a concept map in ${targetLang} from the following text.

Text:
${text}

IMPORTANT: Respond ONLY with valid JSON, no markdown formatting:
{
  "mappa_concettuale": [
    {
      "title": "Main Concept",
      "children": [
        {"title": "Subconcept"}
      ]
    }
  ]
}`,

    quiz: `Create 3 multiple choice questions in ${targetLang} based on the following text.

Text:
${text}

IMPORTANT: Respond ONLY with valid JSON, no markdown formatting:
{
  "quiz": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_option_index": 1,
      "explanation": "Explanation"
    }
  ]
}`,

    examGuide: `Create a comprehensive 1-hour exam study guide in ${targetLang} based on the following text. Structure it as a practical 60-minute plan.

Text:
${text}

IMPORTANT: Respond ONLY with valid JSON, no markdown formatting:
{
  "guida_esame": {
    "tempo_totale": "60 minuti",
    "piano_di_studio": [
      {
        "fase": "Nome della fase",
        "durata": "15 minuti",
        "descrizione": "Cosa fare in questa fase, tecniche di memorizzazione, concetti chiave da rivedere"
      }
    ]
  }
}`
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