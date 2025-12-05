interface LlamaParseResponse {
  id?: string;
  job_id?: string;
  status?: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'ERROR';
  error?: string;
  markdown?: string;
  text?: string;
  result?: string;
  content?: string;
  documents?: Array<{
    text?: string;
    markdown?: string;
  }>;
  pages?: string[];
}

interface LlamaParseJobStatus {
  id: string;
  status: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'ERROR';
  result?: any;
  error?: string;
  job_metadata?: {
    credits_used?: number;
  };
}

/**
 * Poll for job completion with LlamaParse
 */
async function pollForJobCompletion(jobId: string, apiKey: string, maxAttempts: number = 30): Promise<string> {
  console.log(`🔄 Starting polling for job ${jobId}...`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`📡 Polling attempt ${attempt}/${maxAttempts} for job ${jobId}`);
    
    try {
      // Check job status (v1 endpoint)
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
        
        // Log credit usage if available
        if (status.job_metadata?.credits_used) {
          console.log(`💰 Credits used: ${status.job_metadata.credits_used}`);
        }
        
        // Get job results - try text first for v1 (simpler and cheaper)
        const resultResponse = await fetch(`https://api.cloud.llamaindex.ai/api/v1/parsing/job/${jobId}/result/text`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Accept": "text/plain"
          }
        });
        
        if (!resultResponse.ok) {
          throw new Error(`Failed to get job results: ${resultResponse.status}`);
        }
        
        const textResult = await resultResponse.text();
        console.log(`📄 Extracted text (ECO): ${textResult.length} characters`);
        console.log(`💰 ECO parsing complete with minimal credits`);
        return textResult;
        
      } else if (status.status === 'FAILED' || status.status === 'ERROR') {
        throw new Error(`Job failed: ${status.error || 'Unknown error'}`);
      } else if (status.status === 'CANCELLED') {
        throw new Error('Job was cancelled');
      }
      
      // Job still processing, wait before next poll
      console.log('⏳ Job still processing, waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      console.error(`⚠️ Polling error (attempt ${attempt}):`, error);
      // Wait a bit longer on error
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  throw new Error(`Job polling timeout after ${maxAttempts} attempts`);
}

/**
 * Extract text from PDF using LlamaParse in SUPER ECO MODE - Replicating test-v2 logic
 */
export async function extractTextFromPDFEco(pdfBuffer: Buffer, fileName: string): Promise<string> {
  console.log('🦙 LlamaParse ECO mode activated');
  console.log(`📄 Processing: ${fileName} (${pdfBuffer.length} bytes)`);
  console.log('💰 SUPER ECO MODE: Maximum cost savings enabled');
  
  const apiKey = process.env.LLAMA_CLOUD_API_KEY;
  if (!apiKey || apiKey === 'your_llama_cloud_api_key_here') {
    throw new Error('LLAMA_CLOUD_API_KEY not configured');
  }

  try {
    // Use v1 API for MAXIMUM cost savings (much cheaper than v2alpha1)
    console.log('🦙 Using v1 API for MAXIMUM ECO savings...');
    console.log('💰 REAL ECO MODE: Using cheapest possible parsing method');
    
    const formData = new FormData();
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('file', blob, fileName);
    
    // Configuration for parse_page_without_llm v2.1
    const configuration = {
      parsing_method: "parse_page_without_llm",  // v2.1 cheapest mode
      target_format: "markdown",
      disable_ocr: false,
      disable_image_extraction: true,
      split_by_page: false,
      page_separator: "\n\n---\n\n",
      skip_diagonal_text: true,
      invalidate_cache: false
    };
    
    formData.append("configuration", JSON.stringify(configuration));
    
    // Log configuration for monitoring
    console.log('[LLAMAPARSE_JOB]', {
      mode: configuration.parsing_method,
      model: 'NONE (parse_without_llm)',
      file: 'llamaparseEco.ts',
      targetFormat: configuration.target_format,
      apiVersion: 'v1',
      timestamp: new Date().toISOString()
    });
    
    console.log('🦙 Sending request to LlamaParse v1 (parse_without_llm)...');
    
    // Use v1 API for basic, cheap parsing
    const response = await fetch("https://api.cloud.llamaindex.ai/api/v1/parsing/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ LlamaParse ECO upload failed:', response.status, errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(`LlamaParse ECO error: ${errorJson.detail || errorJson.error || response.statusText}`);
      } catch {
        throw new Error(`LlamaParse ECO error: ${response.statusText} - ${errorText}`);
      }
    }

    const result: LlamaParseResponse = await response.json();
    console.log('✅ LlamaParse ECO response received');
    console.log('📤 Upload response:', {
      hasId: !!result.id,
      hasJobId: !!result.job_id,
      status: result.status,
      hasMarkdown: !!result.markdown,
      hasText: !!result.text
    });
    
    // Check if this is an async job response (same as test-v2)
    if (result.status === 'PENDING' && (result.id || result.job_id)) {
      const jobId = result.id || result.job_id!;
      console.log(`⏳ Job is PENDING, polling for results with ID: ${jobId}`);
      
      // Poll for job completion
      const finalResult = await pollForJobCompletion(jobId, apiKey);
      console.log('✅ LlamaParse ECO mode extraction complete');
      console.log('Characters extracted:', finalResult.length);
      console.log('💰 Cost optimization: vision=OFF, ocr=OFF, fast_mode=ON');
      return finalResult;
    }
    
    return await processLlamaParseResponse(result, apiKey);

  } catch (error) {
    console.error('❌ LlamaParse ECO extraction failed:', error);
    throw error;
  }
}

/**
 * Process LlamaParse response and extract text
 */
async function processLlamaParseResponse(result: LlamaParseResponse, apiKey: string): Promise<string> {
  // Check if job is pending
  if (result.status === 'PENDING' && (result.id || result.job_id)) {
    const jobId = result.id || result.job_id!;
    console.log(`⏳ Job is PENDING, polling for results with ID: ${jobId}`);
    
    // Poll for job completion
    const finalResult = await pollForJobCompletion(jobId, apiKey);
    console.log('✅ LlamaParse ECO mode extraction complete');
    console.log(`📊 Characters extracted: ${finalResult.length}`);
    return finalResult;
  }
  
  // Extract text from immediate response
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
    const textParts = result.documents.map(doc => 
      doc.markdown || doc.text || ''
    ).filter(text => text.trim().length > 0);
    
    fullText = textParts.join('\n\n');
  } else if (result.pages && Array.isArray(result.pages)) {
    console.log('📝 Found pages array:', result.pages.length, 'pages');
    fullText = result.pages.join('\n\n');
  }
  
  if (!fullText || fullText.trim().length === 0) {
    throw new Error('No text content extracted from PDF');
  }
  
  console.log('✅ LlamaParse ECO mode extraction complete');
  console.log('Characters extracted:', fullText.length);
  console.log('💰 Cost optimization: vision=OFF, ocr=OFF, fast_mode=ON');
  return fullText;
}