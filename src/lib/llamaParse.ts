/**
 * LlamaParse integration for PDF text extraction
 * Replaces pdf.co, pdf-parse, and pdf.js entirely
 */

/**
 * Notifica cambio API critico
 */
async function notifyApiChange(errorText: string, statusCode: number): Promise<void> {
  try {
    // Log strutturato per monitoraggio
    console.error('[API_CHANGE_ALERT]', {
      timestamp: new Date().toISOString(),
      service: 'LlamaParse',
      errorType: 'schema_validation',
      statusCode,
      errorDetails: errorText,
      severity: 'CRITICAL',
      actionRequired: 'Update API configuration immediately'
    });

    // TODO: Implementare notifiche (scegli una):
    // 1. Email con Resend/SendGrid
    // 2. Webhook Discord/Slack
    // 3. Database alert log
    // 4. Push notification

    // Webhook Discord (se configurato)
    if (process.env.DISCORD_WEBHOOK_URL) {
      try {
        await fetch(process.env.DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `🚨 **CRITICAL API CHANGE DETECTED!**\n\n**Service:** LlamaParse\n**Status:** ${statusCode}\n**Time:** ${new Date().toLocaleString()}\n\n**Error Details:**\n\`\`\`\n${errorText.substring(0, 800)}\n\`\`\`\n\n⚠️ **Action Required:** Update API configuration immediately!\n\n@everyone`
          })
        });
        console.log('✅ Discord notification sent successfully');
      } catch (discordError) {
        console.error('❌ Failed to send Discord notification:', discordError);
      }
    } else {
      console.log('ℹ️ Discord webhook not configured - skipping notification');
    }
    
  } catch (notificationError) {
    console.error('Failed to send API change notification:', notificationError);
  }
}

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
  const estimatedCredits = estimatedPages * 6; // Costo attuale osservato: 6 crediti/pagina
  
  console.log('[LLAMA_PARSE_CALL]', {
    filename: options.fileName,
    sizeMB: sizeMB.toFixed(2),
    sizeBytes: fileBuffer.length,
    estimatedPages: estimatedPages,
    estimatedCredits: estimatedCredits,
    costPerPage: 6, // Monitoraggio costo attuale
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
    
    // Configuration for V1 API (try original working config)
    // NOTA: Usando parse_without_ai per MASSIMO risparmio crediti
    // parse_without_ai = estrazione testo base senza AI processing
    const configuration = {
      parse_mode: "parse_without_ai",  // La modalità PIÙ economica possibile!
      output_type: "markdown",
      disable_image_extraction: true,  // Prova a rimetterlo per V1
      disable_cache: false
    };
    
    // Log della configurazione usata
    console.log('[LLAMA_PARSE_CONFIG]', {
      parseMode: 'parse_without_ai (MAXIMUM savings)',
      outputType: 'markdown',
      imageExtraction: 'disabled (like before)',
      apiVersion: 'v1 (rollback attempt)',
      cache: !configuration.disable_cache,
      apiKeyPreview: apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT_SET'
    });
    
    formData.append("configuration", JSON.stringify(configuration));
    
    console.log('🦙 Sending request to LlamaParse...');
    
    // Call LlamaParse API v1 (try old endpoint first)
    const response = await fetch("https://api.cloud.llamaindex.ai/api/parsing/upload", {
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
      
      // 🚨 ALERT SISTEMA: Notifica cambio API
      if (response.status === 400 && errorText.includes('validation errors')) {
        console.error('🚨 CRITICAL: LlamaParse API schema changed! Contact admin immediately.');
        // TODO: Implementare notifica email/Slack per admin
        await notifyApiChange(errorText, response.status);
      }
      
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
async function pollForJobCompletion(jobId: string, apiKey: string, maxAttempts: number = 40): Promise<string> {
  console.log(`🔄 Starting polling for job ${jobId} (max ${maxAttempts} attempts)...`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`📡 Polling attempt ${attempt}/${maxAttempts} for job ${jobId}`);
    
    try {
      // Check job status with timeout
      const statusResponse = await fetch(`https://api.cloud.llamaindex.ai/api/v1/parsing/job/${jobId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json"
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!statusResponse.ok) {
        console.error(`❌ Status check failed: ${statusResponse.status}`);
        // Try alternative status endpoint if main one fails
        if (attempt <= 3) {
          console.log(`🔄 Retrying with shorter wait...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        throw new Error(`Failed to check job status: ${statusResponse.status}`);
      }
      
      const status: LlamaParseJobStatus = await statusResponse.json();
      console.log(`📊 Job ${jobId} status: ${status.status}`);
      
      if (status.status === 'SUCCESS') {
        console.log(`✅ Job completed! Fetching results...`);
        
        // Try multiple result endpoints for better compatibility
        const resultEndpoints = [
          `/api/v1/parsing/job/${jobId}/result/markdown`,
          `/api/v1/parsing/job/${jobId}/result/text`,
          `/api/v1/parsing/job/${jobId}/result`
        ];
        
        for (const endpoint of resultEndpoints) {
          try {
            const resultResponse = await fetch(`https://api.cloud.llamaindex.ai${endpoint}`, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Accept": "application/json"
              },
              signal: AbortSignal.timeout(15000) // 15 second timeout
            });
            
            if (resultResponse.ok) {
              const jobResult: LlamaParseJobResult = await resultResponse.json();
              console.log(`📝 Job result received from ${endpoint}:`, Object.keys(jobResult));
              
              const extractedText = jobResult.markdown || jobResult.text || jobResult.result || '';
              console.log(`📖 Final extracted text: ${extractedText.length} characters`);
              
              if (extractedText.length >= 50) {
                return extractedText;
              } else {
                console.warn(`⚠️ Text too short from ${endpoint}, trying next endpoint...`);
                continue;
              }
            } else {
              console.warn(`⚠️ Result endpoint ${endpoint} failed with ${resultResponse.status}, trying next...`);
            }
          } catch (resultError) {
            console.warn(`⚠️ Result endpoint ${endpoint} error:`, resultError);
            continue;
          }
        }
        
        throw new Error(`All result endpoints failed or returned insufficient text`);
        
      } else if (status.status === 'FAILED' || status.status === 'ERROR') {
        throw new Error(`Job failed with status: ${status.status}. Error: ${status.error || 'Unknown error'}`);
      }
      
      // Job still pending, wait before next attempt with progressive backoff
      const waitTime = Math.min(2000 + (attempt * 1000), 8000); // Start at 3s, max 8s
      console.log(`⏳ Job still ${status.status}, waiting ${waitTime/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
    } catch (error) {
      console.error(`❌ Polling attempt ${attempt} failed:`, error);
      if (attempt === maxAttempts) {
        throw new Error(`Job polling failed after ${maxAttempts} attempts: ${error}`);
      }
      // Shorter wait before retry for network errors
      await new Promise(resolve => setTimeout(resolve, 1500));
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