// Utilizziamo dynamic import per entrambe le librerie PDF per evitare problemi di build
// import pdfParse from 'pdf-parse';
// import * as pdfjsLib from 'pdfjs-dist';
// import { createWorker } from 'tesseract.js'; // Disabilitato temporaneamente per problemi canvas

interface ExtractionResult {
  text: string;
  method: 'pdf-parse' | 'pdf.js' | 'tesseract-ocr' | 'fallback';
  pageCount: number;
  confidence: number; // 0-100, qualità dell'estrazione
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modDate?: Date;
  };
}

const MIN_TEXT_LENGTH = 100; // Lunghezza minima per considerare l'estrazione valida
const MIN_WORDS_PER_PAGE = 10; // Parole minime per pagina

/**
 * Funzione centralizzata per l'estrazione di testo da PDF con fallback multipli
 * 
 * @param buffer - Buffer del file PDF
 * @returns Promise<ExtractionResult>
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<ExtractionResult> {
  console.log('🔍 Iniziando estrazione PDF con pipeline locale...');

  try {
    // METODO 1: pdf-parse (più veloce, buono per PDF con testo)
    const parseResult = await tryPdfParse(buffer);
    console.log(`🔍 pdf-parse risultato: confidence=${parseResult.confidence}%, lunghezza=${parseResult.text.length}, pagine=${parseResult.pageCount}`);
    
    if (parseResult.confidence > 30) { // Abbasso la soglia per accettare più PDF
      console.log('✅ Estrazione completata con pdf-parse');
      return parseResult;
    }

    // Se pdf-parse ha estratto qualcosa, anche se con bassa confidence, proviamo ad usarlo
    if (parseResult.text && parseResult.text.length > 100) {
      console.log('⚠️ pdf-parse con bassa confidence ma testo presente, utilizzo comunque');
      return {
        ...parseResult,
        confidence: Math.max(parseResult.confidence, 30)
      };
    }

    // Se pdf-parse non ha successo, per ora ritorniamo il risultato con confidence minima
    console.log('❌ pdf-parse non ha estratto testo sufficiente');
    return {
      text: parseResult.text || 'Contenuto PDF non estraibile. Il documento potrebbe essere scansionato o danneggiato.',
      method: 'fallback',
      pageCount: parseResult.pageCount || 0,
      confidence: Math.max(parseResult.confidence, 25),
      metadata: parseResult.metadata
    };
    
    // TODO: Aggiungere PDF.js e Tesseract OCR come fallback quando risolti problemi build

  } catch (error) {
    console.error('❌ Errore durante l\'estrazione PDF:', error);
    throw new Error(`Impossibile estrarre testo dal PDF: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
  }
}

/**
 * Tentativo estrazione con pdf-parse
 */
async function tryPdfParse(buffer: Buffer): Promise<ExtractionResult> {
  try {
    // Dynamic import per evitare problemi di build
    const pdfParse = await import('pdf-parse').then(mod => mod.default);
    const data = await pdfParse(buffer);
    const text = data.text.trim();
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const avgWordsPerPage = wordCount / data.numpages;

    const confidence = calculateConfidence(text, wordCount, avgWordsPerPage);

    return {
      text,
      method: 'pdf-parse',
      pageCount: data.numpages,
      confidence,
      metadata: {
        title: data.info?.Title,
        author: data.info?.Author,
        subject: data.info?.Subject,
        creator: data.info?.Creator,
        producer: data.info?.Producer,
        creationDate: data.info?.CreationDate ? new Date(data.info.CreationDate) : undefined,
        modDate: data.info?.ModDate ? new Date(data.info.ModDate) : undefined,
      }
    };
  } catch (error) {
    console.warn('⚠️ pdf-parse fallito:', error);
    return {
      text: '',
      method: 'pdf-parse',
      pageCount: 0,
      confidence: 0
    };
  }
}

// TODO: Implementare PDF.js quando risolti problemi build Node.js
// async function tryPdfJs(buffer: Buffer): Promise<ExtractionResult> { ... }

// TODO: Implementare OCR con Tesseract quando risolti problemi canvas
// async function tryTesseractOcr(buffer: Buffer): Promise<ExtractionResult> { ... }

/**
 * Calcola confidence score dell'estrazione
 */
function calculateConfidence(text: string, wordCount: number, avgWordsPerPage: number): number {
  let confidence = 0;

  // Lunghezza testo
  if (text.length >= MIN_TEXT_LENGTH) confidence += 30;
  if (text.length >= 500) confidence += 20;
  if (text.length >= 2000) confidence += 20;

  // Numero parole
  if (wordCount >= 50) confidence += 15;
  if (wordCount >= 200) confidence += 10;

  // Parole per pagina
  if (avgWordsPerPage >= MIN_WORDS_PER_PAGE) confidence += 15;
  if (avgWordsPerPage >= 50) confidence += 10;

  // Verifica struttura del testo
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length > 5) confidence += 10;

  // Verifica caratteri speciali vs testo normale
  const specialChars = text.match(/[^\w\s.,!?;:()\-]/g) || [];
  const specialRatio = specialChars.length / text.length;
  if (specialRatio < 0.1) confidence += 10;

  return Math.min(confidence, 100);
}

/**
 * Utility per validare se un buffer è un PDF valido
 */
export function isPdfBuffer(buffer: Buffer): boolean {
  // Verifica signature PDF
  const signature = buffer.slice(0, 4).toString();
  return signature === '%PDF';
}

/**
 * Ottieni informazioni base del PDF senza estrazione completa
 */
export async function getPdfInfo(buffer: Buffer): Promise<{
  pageCount: number;
  hasText: boolean;
  fileSize: number;
  metadata?: any;
}> {
  try {
    // Dynamic import per evitare problemi di build
    const pdfParse = await import('pdf-parse').then(mod => mod.default);
    const data = await pdfParse(buffer);
    return {
      pageCount: data.numpages,
      hasText: data.text.trim().length > MIN_TEXT_LENGTH,
      fileSize: buffer.length,
      metadata: data.info
    };
  } catch (error) {
    console.warn('Impossibile ottenere info PDF:', error);
    return {
      pageCount: 0,
      hasText: false,
      fileSize: buffer.length
    };
  }
}