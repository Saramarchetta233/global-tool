/**
 * LlamaParse integration for PDF text extraction
 * Replaces pdf.co, pdf-parse, and pdf.js entirely
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

interface LlamaParseJobResult {
  markdown?: string;
  text?: string;
  json?: any;
  job_metadata?: any;
}

/**
 * Parse PDF using LlamaParse (LlamaCloud) - UNICO METODO DI PARSING
 */
export async function parsePdfWithLlamaParse(
  fileBuffer: Buffer | Uint8Array,
  options: LlamaParseOptions
): Promise<string> {
  console.log('🦙 Starting LlamaParse extraction...');
  console.log(`File: ${options.fileName}, Size: ${fileBuffer.length} bytes`);
  
  const apiKey = process.env.LLAMA_CLOUD_API_KEY;
  if (!apiKey || apiKey === 'your_llama_cloud_api_key_here') {
    throw new Error("LLAMA_CLOUD_API_KEY is not set. Please configure your LlamaCloud API key.");
  }

  // Log della chiamata prima di processare
  const sizeMB = fileBuffer.length / (1024 * 1024);
  const estimatedPages = Math.ceil(fileBuffer.length / 50000); // Stima ~50KB per pagina
  
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
      sizeMB: sizeMB.toFixed(2),
      estimatedLlamaCredits: estimatedPages * 3 // Stima ~3 crediti per pagina in plain_text mode
    });
  }
  
  try {
    // Prepare the form data for LlamaParse v2 API
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: options.mimeType });
    formData.append("file", blob, options.fileName);
    
    // Configuration as JSON string (required for v2 API)
    // NOTA: Usando modalità simple per massimo risparmio crediti
    // Simple mode consuma molto meno dei preset avanzati
    const configuration = {
      parse_options: {
        parse_mode: "simple"  // Modalità più semplice ed economica
      },
      output_options: {
        markdown: {}
      },
      input_options: {
        pdf: {
          disable_image_extraction: true  // Disabilitato per risparmiare crediti
        }
      },
      disable_cache: false
    };
    
    // Log della configurazione usata
    console.log('[LLAMA_PARSE_CONFIG]', {
      parseMode: 'simple (economical)',
      imageExtraction: !configuration.input_options.pdf.disable_image_extraction,
      cache: !configuration.disable_cache,
      apiKeyPreview: apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT_SET'
    });
    
    formData.append("configuration", JSON.stringify(configuration));
    
    console.log('🦙 Sending request to LlamaParse...');
    
    // Call LlamaParse API v2 (multipart upload)
    const response = await fetch("https://api.cloud.llamaindex.ai/api/v2alpha1/parse/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        // Don't set Content-Type, let browser set it for FormData
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
    console.log('🔍 Full response structure:', JSON.stringify(result, null, 2));
    
    // Check if this is an async job response
    if (result.status === 'PENDING' && (result.id || result.job_id)) {
      const jobId = result.id || result.job_id!;
      console.log(`⏳ Job is PENDING, polling for results with ID: ${jobId}`);
      
      // Poll for job completion
      const finalResult = await pollForJobCompletion(jobId, apiKey);
      return finalResult;
    }
    
    // Extract text from the response (LlamaParse v2 API response structure)
    let fullText = '';
    
    // Priority order: markdown > text > result > content > documents > pages
    if (result.markdown) {
      console.log('📝 Found markdown field:', result.markdown.length, 'characters');
      fullText = result.markdown;
    } else if (result.text) {
      console.log('📝 Found text field:', result.text.length, 'characters');
      fullText = result.text;
    } else if (result.result) {
      console.log('📝 Found result field:', result.result.length, 'characters');
      fullText = result.result;
    } else if (result.content) {
      console.log('📝 Found content field:', result.content.length, 'characters');
      fullText = result.content;
    } else if (result.documents && Array.isArray(result.documents)) {
      console.log('📝 Found documents array:', result.documents.length, 'documents');
      // Multiple documents structure
      const textParts = result.documents.map(doc => 
        doc.markdown || doc.text || ''
      ).filter(text => text.trim().length > 0);
      
      fullText = textParts.join('\n\n');
      console.log('📝 Extracted from documents:', fullText.length, 'characters');
    } else if (result.pages && Array.isArray(result.pages)) {
      console.log('📝 Found pages array:', result.pages.length, 'pages');
      // Pages array structure
      fullText = result.pages.join('\n\n');
      console.log('📝 Extracted from pages:', fullText.length, 'characters');
    } else {
      console.log('❌ No recognized text fields found in response');
      console.log('Available fields:', Object.keys(result));
    }
    
    // Clean and validate the extracted text
    const cleanedText = fullText
      .trim()
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\n{3,}/g, '\n\n');  // Reduce excessive newlines
    
    console.log(`📝 LlamaParse extracted: ${cleanedText.length} characters`);
    console.log(`📖 First 300 chars: "${cleanedText.substring(0, 300)}"`);
    
    if (!cleanedText || cleanedText.length < 50) {
      throw new Error(`LlamaParse returned insufficient text: ${cleanedText.length} characters`);
    }
    
    console.log('✅ LlamaParse extraction completed successfully');
    return cleanedText;
    
  } catch (error) {
    console.error('❌ LlamaParse extraction failed:', error);
    
    if (error instanceof Error) {
      // Re-throw with more context
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
 */
async function pollForJobCompletion(jobId: string, apiKey: string, maxAttempts: number = 30): Promise<string> {
  console.log(`🔄 Starting polling for job ${jobId}...`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`📡 Polling attempt ${attempt}/${maxAttempts} for job ${jobId}`);
    
    try {
      // Check job status
      const statusResponse = await fetch(`https://api.cloud.llamaindex.ai/api/v1/parsing/job/${jobId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json"
        }
      });
      
      if (!statusResponse.ok) {
        console.error(`❌ Status check failed: ${statusResponse.status}`);
        throw new Error(`Failed to check job status: ${statusResponse.status}`);
      }
      
      const status: LlamaParseJobStatus = await statusResponse.json();
      console.log(`📊 Job ${jobId} status: ${status.status}`);
      
      if (status.status === 'SUCCESS') {
        console.log(`✅ Job completed! Fetching results...`);
        
        // Get job results
        const resultResponse = await fetch(`https://api.cloud.llamaindex.ai/api/v1/parsing/job/${jobId}/result/markdown`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Accept": "application/json"
          }
        });
        
        if (!resultResponse.ok) {
          throw new Error(`Failed to fetch job results: ${resultResponse.status}`);
        }
        
        const jobResult: LlamaParseJobResult = await resultResponse.json();
        console.log(`📝 Job result received:`, Object.keys(jobResult));
        
        const extractedText = jobResult.markdown || jobResult.text || '';
        console.log(`📖 Final extracted text: ${extractedText.length} characters`);
        
        if (extractedText.length < 50) {
          throw new Error(`Job completed but returned insufficient text: ${extractedText.length} characters`);
        }
        
        return extractedText;
        
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
  
  throw new Error(`Job ${jobId} did not complete after ${maxAttempts} attempts`);
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