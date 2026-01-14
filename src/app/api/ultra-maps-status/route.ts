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
      .select('mappa_ultra, processing_metadata')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({
        error: 'Sessione non trovata o non autorizzata'
      }, { status: 404 });
    }

    const metadata = session.processing_metadata || {};

    // Se la mappa è già completata, restituiscila
    if (session.mappa_ultra && session.mappa_ultra.nodes && session.mappa_ultra.nodes.length > 0) {
      return NextResponse.json({
        status: 'completed',
        ultraMaps: session.mappa_ultra,
        totalNodes: session.mappa_ultra.stats?.total_nodes || 0,
        completedAt: metadata.ultra_maps_completed_at,
        totalSections: metadata.total_sections
      });
    }

    // Se è in progress, restituisci lo stato
    if (metadata.ultra_maps_status === 'in_progress') {
      return NextResponse.json({
        status: 'in_progress',
        currentSection: metadata.current_section || 0,
        totalSections: metadata.total_sections || 0,
        startedAt: metadata.ultra_maps_started_at,
        estimatedCompletion: metadata.estimated_completion
      });
    }

    // Se è fallito, restituisci l'errore
    if (metadata.ultra_maps_status === 'failed') {
      return NextResponse.json({
        status: 'failed',
        error: metadata.ultra_maps_error || 'Errore sconosciuto',
        failedAt: metadata.ultra_maps_failed_at
      });
    }

    // Nessuna mappa ultra richiesta
    return NextResponse.json({
      status: 'not_started'
    });

  } catch (error) {
    console.error('❌ Ultra Maps Status Error:', error);
    return NextResponse.json({
      error: 'Errore nel recupero dello stato'
    }, { status: 500 });
  }
}
