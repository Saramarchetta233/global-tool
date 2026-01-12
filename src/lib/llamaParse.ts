/**
 * LlamaParse integration for PDF text extraction
 * Replaces pdf.co, pdf-parse, and pdf.js entirely
 *
 * LOGICA OCR IBRIDA:
 * 1. Prima prova con "parse_page_without_llm" (economico, ~1 credito/pag)
 * 2. Se testo estratto < 200 caratteri → probabilmente PDF scannerizzato
 * 3. Riprova con modalità "auto" (OCR abilitato, ~3 crediti/pag)
 */

interface LlamaParseOptions {
  fileName: string;
  mimeType: string;
}

interface LlamaParseDocument {
  text?: string;
  markdown?: string;
  pages?: Array<{
    text: string;
    page_number: number;
  }>;
}

interface LlamaParseResponse {
  documents?: LlamaParseDocument[];
  result?: string;
  content?: string;
  pages?: string[];
  markdown?: string;
  text?: string;
  job_id?: string;
  id?: string;
  status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'ERROR';
}

interface LlamaParseJobStatus {
  id: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'ERROR';
  result?: any;
  error?: string;
}

// Soglia minima di caratteri per considerare un'estrazione valida
const MIN_TEXT_THRESHOLD = 200;

/**
 * Chiamata interna a LlamaParse con parsing_method configurabile
 */
async function callLlamaParse(
  fileBuffer: Buffer | Uint8Array,
  options: LlamaParseOptions,
  parsingMethod: 'parse_page_without_llm' | 'auto'
): Promise<string> {
  const apiKey = process.env.LLAMA_CLOUD_API_KEY;

  if (!apiKey || apiKey === 'your_llama_cloud_api_key_here') {
    throw new Error("LLAMA_CLOUD_API_KEY is not set. Please configure your LlamaCloud API key.");
  }

  // Prepare the form data for LlamaParse v1 API
  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: options.mimeType });
  formData.append("file", blob, options.fileName);
  formData.append("parsing_instruction", "Extract all text content");
  formData.append("result_type", "markdown");
  formData.append("parsing_method", parsingMethod);
  formData.append("mode", parsingMethod);
  formData.append("parse_mode", parsingMethod);

  // Log della configurazione
  console.log('[LLAMA_PARSE_CONFIG]', {
    apiVersion: 'v1',
    parsing_method: parsingMethod,
    file: options.fileName,
    isOCREnabled: parsingMethod === 'auto'
  });

  // Call LlamaParse API v1
  const response = await fetch("https://api.cloud.llamaindex.ai/api/v1/parsing/upload", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ LlamaParse API error:', response.status, errorText);
    throw new Error(`LlamaParse API failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result: LlamaParseResponse = await response.json();
  console.log('✅ LlamaParse response received');

  // Check if this is an async job response
  if (result.status === 'PENDING' && (result.id || result.job_id)) {
    const jobId = result.id || result.job_id!;
    console.log(`⏳ Job is PENDING, polling for results with ID: ${jobId}`);

    // Calculate dynamic max attempts based on file size
    // Max 150 attempts (300 seconds = Vercel limit) with 2s intervals
    const estimatedAttempts = Math.ceil(fileBuffer.length / 50000);
    const maxAttempts = Math.min(150, Math.max(60, estimatedAttempts));
    console.log(`⏱️ Calculated maxAttempts: ${maxAttempts} (~${maxAttempts * 2}s) for file size ${fileBuffer.length} bytes`);

    // Poll for job completion
    const finalResult = await pollForJobCompletion(jobId, apiKey, maxAttempts);
    return finalResult;
  }

  // Extract text from the response
  let fullText = '';

  // Priority order: markdown > text > result > content > documents > pages
  if (result.markdown) {
    fullText = result.markdown;
  } else if (result.text) {
    fullText = result.text;
  } else if (result.result) {
    fullText = result.result;
  } else if (result.content) {
    fullText = result.content;
  } else if (result.documents && Array.isArray(result.documents)) {
    const textParts = result.documents.map(doc =>
      doc.markdown || doc.text || ''
    ).filter(text => text.trim().length > 0);
    fullText = textParts.join('\n\n');
  } else if (result.pages && Array.isArray(result.pages)) {
    fullText = result.pages.join('\n\n');
  }

  // Clean and return the extracted text
  return fullText
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

/**
 * Parse PDF using LlamaParse (LlamaCloud) - CON LOGICA OCR IBRIDA
 *
 * 1. Prima prova modalità economica (parse_page_without_llm)
 * 2. Se poco testo estratto, riprova con OCR (auto)
 */
export async function parsePdfWithLlamaParse(
  fileBuffer: Buffer | Uint8Array,
  options: LlamaParseOptions
): Promise<string> {
  console.log('🦙 Starting LlamaParse extraction with HYBRID OCR logic...');
  console.log(`File: ${options.fileName}, Size: ${fileBuffer.length} bytes`);

  const apiKey = process.env.LLAMA_CLOUD_API_KEY;
  console.log(`🔑 API Key (first 10 chars): ${apiKey ? apiKey.substring(0, 10) + '...' : 'NOT_SET'}`);

  if (!apiKey || apiKey === 'your_llama_cloud_api_key_here') {
    throw new Error("LLAMA_CLOUD_API_KEY is not set. Please configure your LlamaCloud API key.");
  }

  // Log della chiamata prima di processare
  const sizeMB = fileBuffer.length / (1024 * 1024);
  const estimatedPages = Math.ceil(fileBuffer.length / 50000);

  console.log('[LLAMA_PARSE_CALL]', {
    filename: options.fileName,
    sizeMB: sizeMB.toFixed(2),
    sizeBytes: fileBuffer.length,
    estimatedPages: estimatedPages,
    mimeType: options.mimeType
  });

  // Warning per PDF molto grandi
  if (estimatedPages > 200) {
    console.warn('[LLAMA_PARSE_WARNING] PDF molto grande, rischio di consumo crediti elevato', {
      filename: options.fileName,
      estimatedPages: estimatedPages,
      sizeMB: sizeMB.toFixed(2)
    });
  }

  try {
    // ========================================
    // STEP 1: Prova modalità economica (no OCR)
    // ========================================
    console.log('🦙 STEP 1: Tentativo estrazione economica (parse_page_without_llm)...');

    let extractedText = await callLlamaParse(fileBuffer, options, 'parse_page_without_llm');
    const charCount = extractedText.trim().length;

    console.log(`📊 Testo estratto (economico): ${charCount} caratteri`);
    console.log(`📖 Preview: "${extractedText.substring(0, 200)}..."`);

    // ========================================
    // STEP 2: Se poco testo, usa OCR
    // ========================================
    if (charCount < MIN_TEXT_THRESHOLD) {
      console.log(`⚠️ Poco testo rilevato (${charCount} < ${MIN_TEXT_THRESHOLD} caratteri)`);
      console.log('🔍 Probabilmente PDF scannerizzato o con immagini');
      console.log('🔄 STEP 2: Riprovo con OCR (modalità auto)...');

      extractedText = await callLlamaParse(fileBuffer, options, 'auto');
      const ocrCharCount = extractedText.trim().length;

      console.log(`📊 Testo estratto con OCR: ${ocrCharCount} caratteri`);
      console.log(`📖 Preview OCR: "${extractedText.substring(0, 200)}..."`);

      if (ocrCharCount < MIN_TEXT_THRESHOLD) {
        console.log('❌ OCR non ha estratto abbastanza testo');
        throw new Error(`Impossibile estrarre testo dal PDF. Estratti solo ${ocrCharCount} caratteri. Il documento potrebbe essere un'immagine di bassa qualità o protetto.`);
      }

      console.log('✅ OCR ha estratto testo sufficiente!');
    } else {
      console.log('✅ Estrazione economica riuscita, OCR non necessario');
    }

    // Validazione finale
    if (!extractedText || extractedText.length < 50) {
      throw new Error(`LlamaParse returned insufficient text: ${extractedText.length} characters`);
    }

    console.log(`📝 LlamaParse extraction completed: ${extractedText.length} characters`);
    console.log('✅ LlamaParse extraction completed successfully');
    return extractedText;

  } catch (error) {
    console.error('❌ LlamaParse extraction failed:', error);

    if (error instanceof Error) {
      throw new Error(`LlamaParse error: ${error.message}`);
    }

    throw new Error('LlamaParse extraction failed with unknown error');
  }
}

/**
 * Validate if LlamaParse API key is configured
 */
export function validateLlamaParseConfig(): boolean {
  const apiKey = process.env.LLAMA_CLOUD_API_KEY;
  return !!(apiKey && apiKey !== 'your_llama_cloud_api_key_here');
}

/**
 * Poll for job completion
 * maxAttempts default increased to 180 (6 minutes with 2s intervals)
 * For large PDFs, caller should pass higher value
 */
async function pollForJobCompletion(jobId: string, apiKey: string, maxAttempts = 180): Promise<string> {
  console.log(`🔄 Starting polling for job ${jobId} (max ${maxAttempts} attempts)...`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`📡 Polling attempt ${attempt}/${maxAttempts} for job ${jobId}`);

    try {
      // Try primary endpoint first
      let statusResponse = await fetch(`https://api.cloud.llamaindex.ai/api/v1/parsing/job/${jobId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json"
        }
      });

      console.log(`🔍 Primary endpoint response status: ${statusResponse.status}`);

      // If primary fails, try alternative endpoint
      if (!statusResponse.ok) {
        console.log(`⚠️ Primary endpoint failed, trying alternative: /api/v1/parsing/job/${jobId}/status`);
        statusResponse = await fetch(`https://api.cloud.llamaindex.ai/api/v1/parsing/job/${jobId}/status`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Accept": "application/json"
          }
        });
        console.log(`🔍 Alternative endpoint response status: ${statusResponse.status}`);
      }

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error(`❌ Status check failed: ${statusResponse.status}`);
        throw new Error(`Failed to check job status: ${statusResponse.status} - ${errorText}`);
      }

      const responseText = await statusResponse.text();

      let status: LlamaParseJobStatus;
      try {
        status = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`❌ Failed to parse status JSON:`, parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
      }

      console.log(`📊 Job ${jobId} status: ${status.status}`);

      if (status.status === 'SUCCESS') {
        console.log(`✅ Job completed! Fetching results...`);

        // Try multiple result endpoints in order
        const resultEndpoints = [
          `/api/v1/parsing/job/${jobId}/result`,
          `/api/v1/parsing/job/${jobId}/result/text`,
          `/api/v1/parsing/job/${jobId}/result/raw`,
          `/api/v1/parsing/job/${jobId}/result/markdown`,
          `/api/v1/parsing/job/${jobId}`
        ];

        let resultResponse: Response | null = null;
        let workingEndpoint = '';

        for (const endpoint of resultEndpoints) {
          console.log(`🔄 Trying result endpoint: ${endpoint}`);

          try {
            resultResponse = await fetch(`https://api.cloud.llamaindex.ai${endpoint}`, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Accept": "text/plain"
              }
            });

            console.log(`🔍 Response status for ${endpoint}: ${resultResponse.status}`);

            if (resultResponse.ok) {
              workingEndpoint = endpoint;
              console.log(`✅ Working endpoint found: ${endpoint}`);
              break;
            }
          } catch (error) {
            console.log(`❌ ${endpoint} threw error:`, error);
          }
        }

        if (!resultResponse || !resultResponse.ok) {
          throw new Error(`All result endpoints failed for job ${jobId}`);
        }

        const resultText = await resultResponse.text();
        console.log(`🔍 Result from ${workingEndpoint}: ${resultText.length} characters`);

        if (resultText.length < 50) {
          throw new Error(`Job completed but returned insufficient text: ${resultText.length} characters`);
        }

        return resultText;

      } else if (status.status === 'FAILED' || status.status === 'ERROR') {
        throw new Error(`Job failed with status: ${status.status}. Error: ${status.error || 'Unknown error'}`);
      }

      // Job still pending, wait before next attempt
      console.log(`⏳ Job still ${status.status}, waiting 2 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`❌ Polling attempt ${attempt} failed:`, error);
      if (attempt === maxAttempts) {
        throw new Error(`Job polling failed after ${maxAttempts} attempts: ${error}`);
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  throw new Error(`Il PDF è troppo grande e l'elaborazione ha superato il tempo massimo. Prova a dividere il documento in parti più piccole (es. 100 pagine per file).`);
}

/**
 * Get LlamaParse configuration status for debugging
 */
export function getLlamaParseStatus(): {
  configured: boolean;
  hasKey: boolean;
  keyPreview?: string;
} {
  const apiKey = process.env.LLAMA_CLOUD_API_KEY;

  return {
    configured: validateLlamaParseConfig(),
    hasKey: !!apiKey,
    keyPreview: apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : undefined
  };
}
