import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🧪 SIMPLE PDF TEST STARTING...');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`📄 File: ${file.name} (${file.size} bytes, type: ${file.type})`);

    // Convert to buffer in the simplest way possible
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`💾 Created buffer: ${buffer.length} bytes`);
    console.log(`🔍 First 20 bytes: ${Array.from(buffer.slice(0, 20)).map(b => String.fromCharCode(b)).join('')}`);

    // Check PDF signature
    const signature = buffer.slice(0, 4).toString();
    console.log(`🏷️ PDF Signature: "${signature}"`);
    
    if (!signature.startsWith('%PDF')) {
      return NextResponse.json({
        success: false,
        error: 'Not a valid PDF file',
        signature
      }, { status: 400 });
    }

    // Try the most basic pdf-parse call possible
    try {
      console.log('📚 Importing pdf-parse...');
      
      // Dynamic import to avoid build issues
      const pdfParseModule = await import('pdf-parse');
      const pdfParse = pdfParseModule.default;
      
      console.log('📚 pdf-parse imported successfully');
      console.log('🔧 Calling pdf-parse with minimal options...');
      
      // Most basic call possible
      const result = await pdfParse(buffer);
      
      console.log('✅ pdf-parse completed successfully!');
      console.log(`📊 Results: ${result.numpages} pages, ${result.text.length} characters`);
      
      // Return success with extracted data
      return NextResponse.json({
        success: true,
        pages: result.numpages,
        textLength: result.text.length,
        textPreview: result.text.substring(0, 300),
        hasInfo: !!result.info,
        version: result.version || 'unknown'
      });
      
    } catch (pdfError) {
      console.error('❌ pdf-parse failed:', pdfError);
      
      // Return detailed error info
      return NextResponse.json({
        success: false,
        stage: 'pdf-parse',
        error: pdfError instanceof Error ? pdfError.message : String(pdfError),
        name: pdfError instanceof Error ? pdfError.name : 'Unknown',
        stack: pdfError instanceof Error ? pdfError.stack : undefined,
        pdfSize: buffer.length,
        pdfSignature: signature
      }, { status: 500 });
    }
    
  } catch (generalError) {
    console.error('❌ General error:', generalError);
    
    return NextResponse.json({
      success: false,
      stage: 'general',
      error: generalError instanceof Error ? generalError.message : String(generalError),
      stack: generalError instanceof Error ? generalError.stack : undefined
    }, { status: 500 });
  }
}