import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'alloy', language = 'it' } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Testo richiesto per generare audio' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key non configurata' },
        { status: 500 }
      );
    }

    console.log('🔊 Generating TTS for text length:', text.length);
    console.log('🎤 Using voice:', voice);

    // Limit text length to avoid too large files (OpenAI TTS has limits)
    const maxLength = 4000;
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

    const mp3Response = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: truncatedText,
      response_format: "mp3"
    });

    console.log('✅ OpenAI TTS response received');

    const arrayBuffer = await mp3Response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('📊 Audio buffer size:', buffer.length, 'bytes');

    if (buffer.length === 0) {
      throw new Error('Generated audio buffer is empty');
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="riassunto-audio.mp3"',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('❌ TTS API error:', error);
    return NextResponse.json(
      { error: 'Errore durante la generazione audio: ' + (error instanceof Error ? error.message : 'Errore sconosciuto') },
      { status: 500 }
    );
  }
}