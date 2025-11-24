import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { verifyAuth } from '@/lib/middleware';
import { CreditCosts } from '@/lib/credits/creditRules';
import { supabase } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    const { text, voice = 'alloy', language = 'it' } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Testo richiesto per generare audio' },
        { status: 400 }
      );
    }

    // Verifica e deduci crediti per il download audio
    const cost = CreditCosts.audioDownload;
    
    if (user.credits < cost) {
      return NextResponse.json(
        { 
          error: 'Crediti insufficienti per il download audio',
          required: cost,
          available: user.credits,
          type: 'insufficient_credits' 
        },
        { status: 402 }
      );
    }
    
    const { data: creditResult, error: creditError } = await supabase
      .rpc('consume_credits', {
        p_user_id: user.id,
        p_amount: cost,
        p_description: 'Download audio MP3',
        p_feature_type: 'audio'
      });
    
    if (creditError || !creditResult?.success) {
      console.error('Credit deduction error:', creditError || creditResult);
      return NextResponse.json(
        { error: 'Errore nella detrazione dei crediti' },
        { status: 500 }
      );
    }
    
    const newCreditBalance = creditResult.new_balance;

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
        'Cache-Control': 'no-cache',
        'X-New-Credit-Balance': newCreditBalance.toString(),
        'X-Credits-Used': CreditCosts.audioDownload.toString()
      }
    });

  } catch (error) {
    console.error('❌ TTS API error:', error);
    
    // Gestisci errori specifici di crediti
    if (error instanceof Error && error.message.includes('Insufficient credits')) {
      return NextResponse.json(
        { 
          error: 'Crediti insufficienti per generare l\'audio MP3',
          type: 'insufficient_credits' 
        },
        { status: 402 }
      );
    }
    
    return NextResponse.json(
      { error: 'Errore durante la generazione audio: ' + (error instanceof Error ? error.message : 'Errore sconosciuto') },
      { status: 500 }
    );
  }
}