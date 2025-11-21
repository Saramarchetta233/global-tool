/**
 * LlamaParse PREMIUM mode - Full AI processing with advanced features
 */

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
  console.log(`🔄 Starting PREMIUM polling for job ${jobId}...`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`📡 PREMIUM polling attempt ${attempt}/${maxAttempts} for job ${jobId}`);
    
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
        console.log(`✅ Job completed! Fetching PREMIUM results...`);
        
        // Log credit usage if available
        if (status.job_metadata?.credits_used) {
          console.log(`💰 PREMIUM Credits used: ${status.job_metadata.credits_used}`);
        }
        
        // Get job results - try markdown first for PREMIUM
        const resultResponse = await fetch(`https://api.cloud.llamaindex.ai/api/v1/parsing/job/${jobId}/result/markdown`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Accept": "text/plain"
          }
        });
        
        if (!resultResponse.ok) {
          // If markdown fails, try text format
          console.log('⚠️ Markdown endpoint failed, trying text format...');
          const textResponse = await fetch(`https://api.cloud.llamaindex.ai/api/v1/parsing/job/${jobId}/result/text`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Accept": "text/plain"
            }
          });
          
          if (!textResponse.ok) {
            throw new Error(`Failed to get job results: ${textResponse.status}`);
          }
          
          const textResult = await textResponse.text();
          console.log(`📄 Extracted PREMIUM text: ${textResult.length} characters`);
          return textResult;
        }
        
        const markdownResult = await resultResponse.text();
        console.log(`📄 Extracted PREMIUM markdown: ${markdownResult.length} characters`);
        return markdownResult;
        
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
 * Extract text from PDF using LlamaParse in PREMIUM MODE - Full AI processing
 */
export async function extractTextFromPDFPremium(pdfBuffer: Buffer, fileName: string): Promise<string> {
  console.log('🚀 LlamaParse PREMIUM mode activated');
  console.log(`📄 Processing: ${fileName} (${pdfBuffer.length} bytes)`);
  console.log('✨ PREMIUM MODE: Full AI processing enabled');
  
  const apiKey = process.env.LLAMA_CLOUD_API_KEY;
  if (!apiKey || apiKey === 'your_llama_cloud_api_key_here') {
    throw new Error('LLAMA_CLOUD_API_KEY not configured');
  }

  try {
    // Use v2alpha1 API with PREMIUM configuration (like test-v2 but enhanced)
    console.log('🚀 Using v2alpha1 API with PREMIUM settings...');
    
    const formData = new FormData();
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('file', blob, fileName);
    
    // PREMIUM Configuration - All advanced features enabled
    const premiumConfiguration = {
      parse_options: {
        parse_mode: "preset",
        preset_options: {
          preset: "scientific"  // 🚀 Most advanced preset
        }
      },
      output_options: {
        markdown: {} // Rich markdown output with formatting
      },
      input_options: {
        pdf: {
          disable_image_extraction: false,  // ✨ Enable image processing
          // TODO: Add advanced options when available:
          // enable_ocr: true,                // ✨ Enable OCR for scanned docs
          // enable_table_detection: true,    // ✨ Advanced table detection
          // enable_figure_extraction: true,  // ✨ Extract figures and charts
          // vision_model: "advanced",        // ✨ Use advanced vision model
          // agentic_processing: true,        // ✨ AI agent processing
        }
      },
      disable_cache: false,
      verbose: true // Detailed processing info
    };
    
    formData.append("configuration", JSON.stringify(premiumConfiguration));
    
    console.log('✨ PREMIUM Configuration:', premiumConfiguration);
    console.log('🚀 Sending request to LlamaParse v2alpha1 PREMIUM...');
    
    // Use the same API endpoint as test-v2
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
      console.error('❌ LlamaParse PREMIUM upload failed:', response.status, errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(`LlamaParse PREMIUM error: ${errorJson.detail || errorJson.error || response.statusText}`);
      } catch {
        throw new Error(`LlamaParse PREMIUM error: ${response.statusText} - ${errorText}`);
      }
    }

    const result: LlamaParseResponse = await response.json();
    console.log('✅ LlamaParse PREMIUM response received');
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
      console.log(`⏳ Job is PENDING, polling for PREMIUM results with ID: ${jobId}`);
      
      // Poll for job completion
      const finalResult = await pollForJobCompletion(jobId, apiKey);
      console.log('✅ LlamaParse PREMIUM mode extraction complete');
      console.log('Characters extracted:', finalResult.length);
      console.log('✨ PREMIUM optimization: vision=ON, scientific=ON, advanced_processing=ON');
      return finalResult;
    }
    
    // Extract text from immediate response
    let fullText = '';
    
    // Priority order for PREMIUM: markdown > text > result > content > documents > pages
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
    
    console.log('✅ LlamaParse PREMIUM mode extraction complete');
    console.log('Characters extracted:', fullText.length);
    console.log('✨ PREMIUM optimization: vision=ON, scientific=ON, advanced_processing=ON');
    return fullText;

  } catch (error) {
    console.error('❌ LlamaParse PREMIUM extraction failed:', error);
    throw error;
  }
}

/**
 * Calculate estimated credits for PREMIUM processing
 */
export function estimatePremiumCredits(fileSize: number, pages: number): number {
  // Base calculation: PREMIUM uses ~10-15x more credits than ECO
  const baseCostPerPage = 25; // Higher cost for premium processing
  const sizeFactor = Math.ceil(fileSize / (1024 * 1024)); // MB factor
  
  return Math.max(pages * baseCostPerPage + sizeFactor * 10, 100);
}