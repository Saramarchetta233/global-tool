import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (!sessionId || !userId) {
      return NextResponse.json({
        error: 'SessionId e UserId sono richiesti'
      }, { status: 400 });
    }

    // Recupera la sessione dal database
    const { data: session, error: sessionError } = await supabaseAdmin!
      .from('tutor_sessions')
      .select('riassunto_ultra, processing_metadata')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({
        error: 'Sessione non trovata o non autorizzata'
      }, { status: 404 });
    }

    const metadata = session.processing_metadata || {};

    // Se il riassunto è già completato, restituiscilo
    if (session.riassunto_ultra) {
      return NextResponse.json({
        status: 'completed',
        ultraSummary: session.riassunto_ultra,
        totalCharacters: session.riassunto_ultra.length,
        completedAt: metadata.ultra_summary_completed_at,
        totalSections: metadata.total_sections
      });
    }

    // Se è in progress, restituisci lo stato
    if (metadata.ultra_summary_status === 'in_progress') {
      return NextResponse.json({
        status: 'in_progress',
        currentSection: metadata.current_section || 0,
        totalSections: metadata.total_sections || 0,
        startedAt: metadata.ultra_summary_started_at,
        estimatedCompletion: metadata.estimated_completion
      });
    }

    // Se è fallito, restituisci l'errore
    if (metadata.ultra_summary_status === 'failed') {
      return NextResponse.json({
        status: 'failed',
        error: metadata.ultra_summary_error || 'Errore sconosciuto',
        failedAt: metadata.ultra_summary_failed_at
      });
    }

    // Nessun riassunto ultra richiesto
    return NextResponse.json({
      status: 'not_started'
    });

  } catch (error) {
    console.error('❌ Ultra Summary Status Error:', error);
    return NextResponse.json({
      error: 'Errore nel recupero dello stato'
    }, { status: 500 });
  }
}
