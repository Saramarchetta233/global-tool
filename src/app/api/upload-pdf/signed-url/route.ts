import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/upload-pdf/signed-url
 * Genera un signed URL per il download di un file da Supabase Storage
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('filePath');

    if (!filePath) {
      return NextResponse.json({ error: 'filePath richiesto' }, { status: 400 });
    }

    // Genera signed URL per il download (valido 1 ora)
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin!.storage
      .from('pdf-uploads')
      .createSignedUrl(filePath, 3600); // 1 ora

    if (signedUrlError) {
      console.error('Errore generazione signed URL:', signedUrlError);
      return NextResponse.json({ error: 'Errore generazione URL' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      signedUrl: signedUrlData.signedUrl
    });

  } catch (error) {
    console.error('Errore API signed-url:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
