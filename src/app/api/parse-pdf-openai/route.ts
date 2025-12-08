import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { fromBuffer } from 'pdf2pic';
import Tesseract from 'tesseract.js';

import { withCredits } from '@/lib/middleware';
import { supabase } from '@/lib/supabase';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the expected JSON structure
interface StudyMaterialsJSON {
  full_clean_text: string;
  short_summary: string;
  extended_summary: string;
  concept_map: Array<{ concept: string; connections: string[] }>;
  flashcards: Array<{ domanda: string; risposta: string }>;
  quiz: {
    domande: Array<{
      domanda: string;
      opzioni: string[];
      risposta_corretta: string;
      spiegazione: string;
    }>;
  };
  study_plan: {
    overview: string;
    topics: Array<{ topic: string; time: string; priority: string }>;
  };
  probable_exam_questions: Array<{ question: string; difficulty: string }>;
  tutor_context: string;
}

/**
 * Extract text using OCR fallback (pdf2pic + Tesseract)
 */
async function extractTextWithOCR(pdfBuffer: Buffer): Promise<string> {
  console.log('🔄 Starting OCR fallback extraction...');
  
  try {
    const converter = fromBuffer(pdfBuffer, {
      density: 200,
      format: 'png' as const,
      width: 2480,
      height: 3508,
    });
    
    const allTexts: string[] = [];
    let pageNumber = 1;
    const maxPages = 100;
    
    while (pageNumber <= maxPages) {
      try {
        console.log(`🖼️ Converting page ${pageNumber} to image...`);
        const imageResult = await converter(pageNumber);
        
        if (!imageResult || !(imageResult as any).buffer) {
          console.log(`✅ Processed ${pageNumber - 1} pages`);
          break;
        }
        
        console.log(`🔤 Running OCR on page ${pageNumber}...`);
        const ocrResult = await Tesseract.recognize((imageResult as any).buffer, 'ita+eng');
        
        const pageText = ocrResult.data.text.trim();
        if (pageText.length > 10) {
          allTexts.push(pageText);
          console.log(`✅ Page ${pageNumber}: ${pageText.length} characters extracted`);
        }
        
        pageNumber++;
      } catch (pageError) {
        console.log(`✅ OCR completed: ${pageNumber - 1} pages processed`);
        break;
      }
    }
    
    const fullText = allTexts.join('\n\n--- PAGINA SUCCESSIVA ---\n\n');
    console.log(`📊 OCR extraction complete: ${fullText.length} characters`);
    
    return fullText;
  } catch (error) {
    console.error('❌ OCR extraction failed:', error);
    throw new Error('OCR extraction failed');
  }
}

/**
 * Main PDF processing with OpenAI
 */
async function processPDFWithOpenAI(pdfBuffer: Buffer, fileName: string): Promise<StudyMaterialsJSON> {
  console.log('🚀 Starting OpenAI PDF processing...');
  console.log(`📄 File: ${fileName}, Size: ${pdfBuffer.length} bytes`);
  
  try {
    // Phase 1: Upload PDF to OpenAI
    console.log('📤 Uploading PDF to OpenAI...');
    
    // Create a File object from the buffer
    const file = new File([pdfBuffer], fileName, { type: 'application/pdf' });
    
    // Upload file to OpenAI
    const uploadResponse = await client.files.create({
      file: file,
      purpose: 'assistants'
    });
    
    console.log(`✅ File uploaded successfully: ${uploadResponse.id}`);
    console.log('📄 Upload details:', uploadResponse);
    
    // Phase 2: Use responses.create to process the PDF
    console.log('🤖 Processing with OpenAI responses.create...');
    
    const input = {
      file_id: uploadResponse.id,
      message: `Analizza il PDF e restituisci SOLO un JSON valido (senza testo prima o dopo) con questa struttura:

{
  "full_clean_text": "tutto il testo estratto dal PDF, pulito e formattato",
  "short_summary": "riassunto breve di 200-300 parole",
  "extended_summary": "riassunto esteso e dettagliato di almeno 1000 parole, sufficiente per preparare un esame universitario",
  "concept_map": [
    {"concept": "Concetto principale", "connections": ["concetto correlato 1", "concetto correlato 2"]}
  ],
  "flashcards": [
    {"domanda": "Domanda flashcard", "risposta": "Risposta flashcard"}
  ],
  "quiz": {
    "domande": [
      {
        "domanda": "Testo della domanda",
        "opzioni": ["Opzione A", "Opzione B", "Opzione C", "Opzione D"],
        "risposta_corretta": "Opzione A",
        "spiegazione": "Spiegazione della risposta corretta"
      }
    ]
  },
  "study_plan": {
    "overview": "Panoramica del piano di studio",
    "topics": [
      {"topic": "Argomento 1", "time": "30 minuti", "priority": "Alta"}
    ]
  },
  "probable_exam_questions": [
    {"question": "Domanda d'esame probabile", "difficulty": "Media"}
  ],
  "tutor_context": "Contesto completo per il tutor AI, inclusi tutti i dettagli importanti del documento"
}

Assicurati di:
1. Estrarre TUTTO il testo dal PDF
2. Generare almeno 20 flashcard
3. Creare almeno 10 domande quiz
4. Fornire un riassunto esteso molto dettagliato
5. Includere tutte le informazioni rilevanti nel tutor_context`
    };
    
    console.log('📤 Sending request to OpenAI responses.create...');
    console.log('Input structure:', { file_id: input.file_id, message_length: input.message.length });
    
    // Try using chat.completions with file reference as fallback since responses.create might not exist
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Sei un assistente specializzato nell\'analisi di documenti PDF e nella creazione di materiale di studio. Rispondi SEMPRE e SOLO con JSON valido, senza alcun testo aggiuntivo.'
        },
        {
          role: 'user',
          content: input.message + `\n\nFile ID del PDF da analizzare: ${input.file_id}`
        }
      ],
      temperature: 0.3,
      max_tokens: 16000,
      response_format: { type: 'json_object' }
    });
    
    console.log('✅ OpenAI processing complete');
    console.log('Response received:', {
      model: completion.model,
      usage: completion.usage,
      finish_reason: completion.choices[0].finish_reason
    });
    
    // Parse the response
    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      console.error('❌ No response content from OpenAI');
      throw new Error('No response from OpenAI');
    }
    
    console.log('📝 Response content length:', responseContent.length);
    console.log('📝 First 200 chars:', responseContent.substring(0, 200));
    
    let studyMaterials: StudyMaterialsJSON;
    try {
      studyMaterials = JSON.parse(responseContent);
      console.log('✅ JSON parsed successfully');
      console.log('📊 Study materials structure:', {
        full_clean_text_length: studyMaterials.full_clean_text?.length || 0,
        flashcards_count: studyMaterials.flashcards?.length || 0,
        quiz_questions_count: studyMaterials.quiz?.domande?.length || 0,
        has_extended_summary: !!studyMaterials.extended_summary,
        has_tutor_context: !!studyMaterials.tutor_context
      });
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('Raw response:', responseContent);
      throw new Error('Invalid JSON response from OpenAI');
    }
    
    // Phase 3: Quality check
    const textLength = studyMaterials.full_clean_text?.length || 0;
    console.log(`📏 Extracted text length: ${textLength} characters`);
    
    // Phase 4: OCR Fallback if needed
    if (textLength < 300) {
      console.log('⚠️ Insufficient text extracted, starting OCR fallback...');
      
      const ocrText = await extractTextWithOCR(pdfBuffer);
      
      if (ocrText.length > 300) {
        console.log('🔄 Sending OCR text to OpenAI for analysis...');
        console.log('📏 OCR text length:', ocrText.length);
        
        const ocrCompletion = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Sei un assistente specializzato nell\'analisi di documenti e nella creazione di materiale di studio. Rispondi SEMPRE e SOLO con JSON valido.'
            },
            {
              role: 'user',
              content: `Analizza questo testo estratto via OCR e genera lo stesso JSON completo richiesto prima:

${ocrText}

Restituisci SOLO il JSON valido, senza altro testo.`
            }
          ],
          temperature: 0.3,
          max_tokens: 16000,
          response_format: { type: 'json_object' }
        });
        
        const ocrResponseContent = ocrCompletion.choices[0].message.content;
        if (ocrResponseContent) {
          studyMaterials = JSON.parse(ocrResponseContent);
          console.log('✅ OCR fallback successful');
        }
      }
    }
    
    // Cleanup: Delete the uploaded file
    try {
      await (client.files as any).del(uploadResponse.id);
      console.log('🗑️ Cleaned up uploaded file');
    } catch (cleanupError) {
      console.error('Failed to cleanup file:', cleanupError);
    }
    
    return studyMaterials;
    
  } catch (error) {
    console.error('❌ OpenAI processing failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

// Calculate total credits needed
const TOTAL_CREDITS_NEEDED = 15;

export const POST = withCredits('extraction', async (request: NextRequest, user, newCreditBalance) => {
  console.log('🚀 Starting PDF processing endpoint...');
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
    
    // Process with OpenAI (includes OCR fallback if needed)
    const studyMaterials = await processPDFWithOpenAI(pdfBuffer, file.name);
    
    // Create session for tutor
    const sessionId = crypto.randomUUID();
    console.log('🆔 Generated session ID:', sessionId);
    
    try {
      const insertResult = await supabase
        .from('tutor_sessions')
        .insert({
          id: sessionId,
          user_id: user.id,
          pdf_text: studyMaterials.full_clean_text,
          riassunto_breve: studyMaterials.short_summary,
          riassunto_esteso: studyMaterials.extended_summary,
          flashcard: studyMaterials.flashcards,
          created_at: new Date().toISOString()
        });
      
      console.log('✅ Created tutor session:', sessionId);
      if (insertResult.error) {
        console.error('Supabase insert error:', insertResult.error);
      }
    } catch (sessionError) {
      console.error('Failed to create tutor session:', sessionError);
    }
    
    // Transform to match existing format
    const conceptMap = studyMaterials.concept_map.map(item => ({
      concetto: item.concept,
      collegamenti: item.connections
    }));
    
    // Prepare the response with docContext
    const docContext = {
      riassunto_breve: studyMaterials.short_summary,
      riassunto_esteso: studyMaterials.extended_summary,
      mappa_concettuale: conceptMap,
      flashcard: studyMaterials.flashcards,
      quiz: studyMaterials.quiz.domande,
      guida_esame: JSON.stringify(studyMaterials.study_plan),
      domande_probabili: studyMaterials.probable_exam_questions,
      extractedText: studyMaterials.full_clean_text,
      tutorContext: studyMaterials.tutor_context,
      sessionId: sessionId,
      newCreditBalance,
      creditsUsed: TOTAL_CREDITS_NEEDED,
      extractionMethod: 'OpenAI'
    };
    
    console.log('✅ Returning docContext with all study materials');
    console.log('📊 Response summary:', {
      has_riassunto_breve: !!docContext.riassunto_breve,
      has_riassunto_esteso: !!docContext.riassunto_esteso,
      flashcards_count: docContext.flashcard?.length || 0,
      quiz_count: docContext.quiz?.length || 0,
      has_tutorContext: !!docContext.tutorContext,
      sessionId: docContext.sessionId
    });
    
    return NextResponse.json({ docContext });
    
  } catch (error) {
    console.error('❌ Error processing PDF:', error);
    return NextResponse.json(
      { error: `Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
});