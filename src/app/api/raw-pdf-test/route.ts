import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔬 RAW PDF TEST - NO LIBRARIES');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`📄 File: ${file.name} (${file.size} bytes)`);

    // Basic buffer creation
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`💾 Buffer created: ${buffer.length} bytes`);

    // Check if it's a valid PDF
    const signature = buffer.slice(0, 4).toString();
    console.log(`🏷️ Signature: "${signature}"`);
    
    if (!signature.startsWith('%PDF')) {
      return NextResponse.json({
        success: false,
        error: 'Not a valid PDF',
        signature
      }, { status: 400 });
    }

    // Try to find text manually in the PDF
    const pdfString = buffer.toString();
    console.log(`📄 PDF as string length: ${pdfString.length}`);
    
    // Look for common PDF text patterns
    let extractedText = '';
    
    // Method 1: Look for stream content
    const streamRegex = /stream\s*([\s\S]*?)\s*endstream/gi;
    const streams = pdfString.match(streamRegex);
    console.log(`🌊 Found ${streams ? streams.length : 0} streams`);
    
    if (streams) {
      for (const stream of streams.slice(0, 5)) { // Check first 5 streams
        const content = stream.replace(/stream\s*/, '').replace(/\s*endstream/, '');
        // Look for readable text in the content
        const readableText = content.match(/[A-Za-z]{3,}/g);
        if (readableText && readableText.length > 5) {
          extractedText += readableText.join(' ') + ' ';
        }
      }
    }
    
    // Method 2: Look for direct text patterns
    const textPatterns = pdfString.match(/\((.*?)\)/g);
    console.log(`📝 Found ${textPatterns ? textPatterns.length : 0} text patterns`);
    
    if (textPatterns) {
      const cleanTexts = textPatterns
        .map(t => t.replace(/[()]/g, ''))
        .filter(t => t.length > 2 && /[A-Za-z]/.test(t))
        .slice(0, 50); // Take first 50
      extractedText += ' ' + cleanTexts.join(' ');
    }
    
    // Method 3: Try basic pdf-parse here too
    try {
      console.log('🔧 Trying basic pdf-parse in raw test...');
      
      const pdfParse = (await import('pdf-parse')).default;
      const result = await pdfParse(buffer);
      
      console.log(`📚 pdf-parse risultati: ${result.numpages} pages, ${result.text.length} characters`);
      
      if (result.text && result.text.trim().length > extractedText.length) {
        extractedText = result.text.trim();
        console.log('✅ pdf-parse succeeded in raw test');
      }
      
    } catch (pdfParseError) {
      console.warn('⚠️ pdf-parse failed in raw test:', pdfParseError);
    }
    
    // Pulizia del testo estratto
    const cleanedText = extractedText
      .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ') // Rimuovi caratteri di controllo
      .replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F]/g, ' ') // Mantieni solo caratteri stampabili e accenti
      .replace(/\s+/g, ' ') // Normalizza spazi
      .trim();
    
    console.log(`📊 Final extracted text: ${extractedText.length} characters (cleaned: ${cleanedText.length})`);
    console.log(`🔤 Cleaned preview: "${cleanedText.substring(0, 200)}"`);
    
    return NextResponse.json({
      success: true,
      method: extractedText.length > 100 ? 'advanced' : 'basic',
      textLength: cleanedText.length,
      textPreview: cleanedText.substring(0, 500),
      hasText: cleanedText.length > 50,
      rawLength: extractedText.length // Include anche la lunghezza originale
    });
    
  } catch (error) {
    console.error('❌ Raw test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}