import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔍 DEBUG PDF EXTRACTION STARTING...');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`📄 File Info:
    - Name: ${file.name}
    - Size: ${file.size} bytes
    - Type: ${file.type}
    - Last Modified: ${new Date(file.lastModified)}`);

    // Step 1: Convert to buffer
    const buffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(buffer);
    
    console.log(`💾 Buffer Info:
    - ArrayBuffer size: ${buffer.byteLength}
    - Buffer length: ${pdfBuffer.length}
    - First 10 bytes: ${Array.from(pdfBuffer.slice(0, 10)).map(b => b.toString(16)).join(' ')}`);

    // Step 2: Check PDF signature
    const signature = pdfBuffer.slice(0, 4).toString();
    console.log(`🔍 PDF Signature: "${signature}" (expected: "%PDF")`);
    
    if (signature !== '%PDF') {
      return NextResponse.json({
        error: 'Invalid PDF signature',
        signature,
        expected: '%PDF'
      }, { status: 400 });
    }

    // Step 3: Try pdf-parse with maximum debugging
    try {
      console.log('📖 Starting pdf-parse...');
      console.log(`Buffer is Buffer: ${Buffer.isBuffer(pdfBuffer)}`);
      console.log(`Buffer length: ${pdfBuffer.length}`);
      
      const pdfParse = (await import('pdf-parse')).default;
      
      // Prova con opzioni più specifiche e sicure
      const data = await pdfParse(pdfBuffer, {
        max: 0, // Tutte le pagine
        // Rimuovi version che potrebbe causare problemi
        // version: 'v1.10.100'
      });
      
      console.log(`✅ PDF-Parse Success:
      - Pages: ${data.numpages}
      - Text length: ${data.text.length}
      - Info present: ${!!data.info}
      - Version: ${data.version || 'unknown'}`);
      
      if (data.info) {
        console.log('📋 PDF Metadata:', {
          Title: data.info.Title,
          Author: data.info.Author,
          Subject: data.info.Subject,
          Creator: data.info.Creator,
          Producer: data.info.Producer,
          CreationDate: data.info.CreationDate,
          ModDate: data.info.ModDate
        });
      }
      
      console.log(`🔤 First 500 characters of extracted text:`);
      console.log(`"${data.text.substring(0, 500)}"`);
      
      console.log(`🔤 Text analysis:`);
      const words = data.text.split(/\s+/).filter(w => w.length > 0);
      console.log(`- Word count: ${words.length}`);
      console.log(`- First 10 words: ${words.slice(0, 10).join(', ')}`);
      console.log(`- Last 10 words: ${words.slice(-10).join(', ')}`);
      
      return NextResponse.json({
        success: true,
        filename: file.name,
        pages: data.numpages,
        textLength: data.text.length,
        wordCount: words.length,
        firstChars: data.text.substring(0, 500),
        lastChars: data.text.substring(-500),
        info: data.info || null,
        // IMPORTANTE: Includo il testo completo per verificare
        fullText: data.text
      });
      
    } catch (pdfParseError) {
      console.error('❌ pdf-parse failed:', {
        name: pdfParseError instanceof Error ? pdfParseError.name : 'Unknown',
        message: pdfParseError instanceof Error ? pdfParseError.message : 'Unknown error',
        stack: pdfParseError instanceof Error ? pdfParseError.stack : undefined
      });
      
      return NextResponse.json({
        success: false,
        stage: 'pdf-parse',
        error: pdfParseError instanceof Error ? pdfParseError.message : 'Unknown pdf-parse error',
        errorName: pdfParseError instanceof Error ? pdfParseError.name : 'Unknown',
        stack: pdfParseError instanceof Error ? pdfParseError.stack : undefined
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ General debug error:', error);
    return NextResponse.json({
      success: false,
      stage: 'general',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}