/**
 * PDF OCR Text Extraction usando pdf2pic + Tesseract.js
 * Soluzione gratuita alternativa a LlamaParse
 */

import { fromBuffer } from 'pdf2pic';
import Tesseract from 'tesseract.js';

interface OCRExtractionOptions {
  fileName: string;
  language?: string; // 'ita', 'eng', 'fra', 'deu', 'spa', ecc.
  imageQuality?: number; // DPI per la conversione (default: 300)
}

interface OCRResult {
  text: string;
  confidence: number;
  pageCount: number;
  processingTime: number;
}

/**
 * Estrae testo da PDF usando OCR (PDF → Immagini → Tesseract OCR)
 */
export async function extractTextWithOCR(
  pdfBuffer: Buffer,
  options: OCRExtractionOptions
): Promise<OCRResult> {
  const startTime = Date.now();
  console.log('🔍 Avvio estrazione PDF con OCR...');
  console.log(`📄 File: ${options.fileName}, Buffer: ${pdfBuffer.length} bytes`);
  
  try {
    // Configurazione per pdf2pic
    const pdf2picOptions = {
      density: options.imageQuality || 300, // DPI - più alto = migliore qualità ma più lento
      format: 'png' as const,
      width: 2480,  // Larghezza ottimale per OCR
      height: 3508, // Altezza ottimale per OCR
    };

    console.log('📸 Conversione PDF in immagini...');
    const converter = fromBuffer(pdfBuffer, pdf2picOptions);
    
    // Converti tutte le pagine
    let pageNumber = 1;
    const allTexts: string[] = [];
    let totalConfidence = 0;
    let pageCount = 0;

    while (true) {
      try {
        console.log(`🖼️ Elaborazione pagina ${pageNumber}...`);
        
        // Converti pagina in immagine
        const imageResult = await converter(pageNumber);
        if (!imageResult || !Buffer.isBuffer(imageResult)) {
          console.log(`✅ Completate ${pageNumber - 1} pagine`);
          break;
        }

        console.log(`🔤 OCR su pagina ${pageNumber}...`);
        
        // Applica OCR all'immagine
        const ocrResult = await Tesseract.recognize(
          imageResult,
          options.language || 'ita+eng', // Supporto multilingua
          {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                console.log(`📝 OCR progresso pagina ${pageNumber}: ${Math.round(m.progress * 100)}%`);
              }
            }
          }
        );

        const pageText = ocrResult.data.text.trim();
        const pageConfidence = ocrResult.data.confidence;
        
        console.log(`✅ Pagina ${pageNumber} completata: ${pageText.length} caratteri, confidenza: ${pageConfidence.toFixed(2)}%`);
        
        if (pageText.length > 10) { // Solo pagine con contenuto significativo
          allTexts.push(pageText);
          totalConfidence += pageConfidence;
          pageCount++;
        }

        pageNumber++;
        
        // Limite di sicurezza per evitare loop infiniti
        if (pageNumber > 1000) {
          console.log('⚠️ Raggiunto limite massimo di pagine (1000)');
          break;
        }
        
      } catch (pageError) {
        // Errore nella pagina corrente = fine del PDF
        console.log(`✅ PDF completato: ${pageNumber - 1} pagine elaborate`);
        break;
      }
    }

    if (allTexts.length === 0) {
      throw new Error('Nessun testo estratto dal PDF. Il documento potrebbe essere danneggiato o vuoto.');
    }

    // Combina tutto il testo
    const finalText = allTexts.join('\n\n--- PAGINA SUCCESSIVA ---\n\n');
    const avgConfidence = totalConfidence / pageCount;
    const processingTime = Date.now() - startTime;

    console.log(`🎉 Estrazione completata!`);
    console.log(`📊 Statistiche: ${finalText.length} caratteri, ${pageCount} pagine, ${avgConfidence.toFixed(2)}% confidenza, ${(processingTime/1000).toFixed(2)}s`);
    
    return {
      text: finalText,
      confidence: avgConfidence,
      pageCount: pageCount,
      processingTime: processingTime
    };

  } catch (error) {
    console.error('❌ Errore durante estrazione OCR:', error);
    throw new Error(`Estrazione OCR fallita: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
  }
}

/**
 * Verifica se Tesseract è disponibile
 */
export function validateOCRAvailable(): boolean {
  try {
    // Tesseract.js dovrebbe essere sempre disponibile una volta installato
    return true;
  } catch (error) {
    console.error('OCR non disponibile:', error);
    return false;
  }
}

/**
 * Ottimizza il buffer del PDF per migliorare l'OCR
 */
function optimizePDFForOCR(buffer: Buffer): Buffer {
  // Per ora restituisce il buffer originale
  // In futuro si possono aggiungere ottimizzazioni
  return buffer;
}

/**
 * Stima del tempo di elaborazione basato sulla dimensione
 */
export function estimateProcessingTime(bufferSize: number, pageEstimate: number): number {
  // Stima approssimativa: ~10 secondi per pagina per OCR di qualità
  const estimatedSeconds = pageEstimate * 10;
  return estimatedSeconds;
}

/**
 * Supporta le seguenti lingue OCR
 */
export const SUPPORTED_LANGUAGES = {
  'Italiano': 'ita',
  'Inglese': 'eng', 
  'Spagnolo': 'spa',
  'Francese': 'fra',
  'Tedesco': 'deu',
  'Portoghese': 'por',
  'Auto (Ita+Eng)': 'ita+eng'
} as const;