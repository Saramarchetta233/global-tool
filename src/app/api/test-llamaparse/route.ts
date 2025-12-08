import { NextRequest, NextResponse } from 'next/server';

import { getLlamaParseStatus,parsePdfWithLlamaParse, validateLlamaParseConfig } from '@/lib/llamaParse';

export async function GET() {
  const status = getLlamaParseStatus();
  return NextResponse.json({
    status: 'LlamaParse Test API',
    configuration: status,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing LlamaParse directly...');
    
    // Check configuration
    const status = getLlamaParseStatus();
    console.log('📊 LlamaParse status:', status);
    
    if (!validateLlamaParseConfig()) {
      return NextResponse.json({
        error: 'LlamaParse not configured',
        status
      }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`📄 Testing file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

    // Convert to buffer
    const buffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(buffer);
    
    console.log(`🔄 Buffer created: ${pdfBuffer.length} bytes`);
    
    // Test LlamaParse directly
    console.log('🦙 Calling LlamaParse...');
    const extractedText = await parsePdfWithLlamaParse(pdfBuffer, {
      fileName: file.name,
      mimeType: file.type
    });
    
    console.log(`✅ LlamaParse success: ${extractedText.length} characters extracted`);
    
    return NextResponse.json({
      success: true,
      filename: file.name,
      fileSize: file.size,
      extractedLength: extractedText.length,
      preview: extractedText.substring(0, 500),
      fullText: extractedText.length < 2000 ? extractedText : undefined
    });

  } catch (error) {
    console.error('❌ LlamaParse test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}