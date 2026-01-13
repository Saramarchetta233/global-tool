import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/upload-pdf
 * Genera un signed URL per upload diretto su Supabase Storage
 * Oppure carica direttamente il file se passato nel body
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Se è multipart/form-data, carica il file direttamente
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const userId = formData.get('userId') as string;

      if (!file) {
        return NextResponse.json({ error: 'File richiesto' }, { status: 400 });
      }

      if (!userId) {
        return NextResponse.json({ error: 'UserId richiesto' }, { status: 400 });
      }

      // Genera un nome univoco per il file
      const fileId = crypto.randomUUID();
      const fileName = `${userId}/${fileId}.pdf`;

      // Converti il file in buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Upload su Supabase Storage
      const { data, error } = await supabaseAdmin!.storage
        .from('pdf-uploads')
        .upload(fileName, buffer, {
          contentType: 'application/pdf',
          upsert: false
        });

      if (error) {
        console.error('Errore upload Supabase Storage:', error);
        return NextResponse.json({ error: 'Errore upload file' }, { status: 500 });
      }

      // Genera URL firmato per il download (valido 1 ora)
      const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin!.storage
        .from('pdf-uploads')
        .createSignedUrl(fileName, 3600); // 1 ora

      if (signedUrlError) {
        console.error('Errore generazione signed URL:', signedUrlError);
        return NextResponse.json({ error: 'Errore generazione URL' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        fileId,
        fileName,
        filePath: data.path,
        signedUrl: signedUrlData.signedUrl,
        originalName: file.name,
        size: buffer.length
      });

    } else {
      // JSON request - genera solo signed URL per upload diretto dal client
      const body = await request.json();
      const { userId, fileName: originalName } = body;

      if (!userId) {
        return NextResponse.json({ error: 'UserId richiesto' }, { status: 400 });
      }

      const fileId = crypto.randomUUID();
      const fileName = `${userId}/${fileId}.pdf`;

      // Genera signed URL per upload (valido 10 minuti)
      const { data, error } = await supabaseAdmin!.storage
        .from('pdf-uploads')
        .createSignedUploadUrl(fileName);

      if (error) {
        console.error('Errore generazione signed upload URL:', error);
        return NextResponse.json({ error: 'Errore generazione URL upload' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        fileId,
        fileName,
        uploadUrl: data.signedUrl,
        token: data.token,
        originalName
      });
    }

  } catch (error) {
    console.error('Errore API upload-pdf:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

/**
 * DELETE /api/upload-pdf
 * Elimina un file da Supabase Storage (cleanup)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('filePath');

    if (!filePath) {
      return NextResponse.json({ error: 'filePath richiesto' }, { status: 400 });
    }

    const { error } = await supabaseAdmin!.storage
      .from('pdf-uploads')
      .remove([filePath]);

    if (error) {
      console.error('Errore eliminazione file:', error);
      return NextResponse.json({ error: 'Errore eliminazione' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Errore DELETE upload-pdf:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
