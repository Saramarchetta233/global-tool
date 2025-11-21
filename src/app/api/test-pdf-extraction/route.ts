import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(buffer);
    
    console.log('🔍 Testing PDF extraction...');
    console.log(`File: ${file.name}, Size: ${file.size} bytes`);
    console.log(`Buffer length: ${pdfBuffer.length}`);
    
    // Test diretto con pdf-parse
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(pdfBuffer);
      
      console.log('📊 PDF-Parse Results:');
      console.log(`- Pages: ${data.numpages}`);
      console.log(`- Text length: ${data.text.length}`);
      console.log(`- First 500 chars: "${data.text.substring(0, 500)}"`);
      
      if (data.info) {
        console.log('📋 PDF Info:', {
          title: data.info.Title,
          author: data.info.Author,
          creator: data.info.Creator,
          producer: data.info.Producer
        });
      }
      
      return NextResponse.json({
        success: true,
        method: 'pdf-parse',
        pages: data.numpages,
        textLength: data.text.length,
        firstChars: data.text.substring(0, 500),
        info: data.info || null,
        fullText: data.text // Includo il testo completo per debug
      });
      
    } catch (pdfParseError) {
      console.error('❌ pdf-parse failed:', pdfParseError);
      return NextResponse.json({
        success: false,
        error: pdfParseError instanceof Error ? pdfParseError.message : 'Unknown pdf-parse error',
        stack: pdfParseError instanceof Error ? pdfParseError.stack : undefined
      });
    }
    
  } catch (error) {
    console.error('❌ General error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}