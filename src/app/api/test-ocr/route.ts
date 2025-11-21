import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'OCR Test API',
    available: true,
    message: 'Use POST to test OCR extraction',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing OCR extraction...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`📄 Testing file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    // Convert to buffer
    const buffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(buffer);
    
    console.log(`🔄 Buffer created: ${pdfBuffer.length} bytes`);
    
    // Test basic PDF validation
    const signature = pdfBuffer.slice(0, 4).toString();
    if (!signature.startsWith('%PDF')) {
      return NextResponse.json({
        error: 'Not a valid PDF file'
      }, { status: 400 });
    }

    console.log('✅ PDF signature valid');
    
    // For now, return test info without actually processing
    // This avoids dependency issues while testing the endpoint
    
    return NextResponse.json({
      success: true,
      filename: file.name,
      fileSize: file.size,
      pdfSignature: signature,
      bufferLength: pdfBuffer.length,
      status: 'PDF validated successfully',
      note: 'Full OCR extraction will be implemented once dependencies are installed'
    });

  } catch (error) {
    console.error('❌ OCR test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}