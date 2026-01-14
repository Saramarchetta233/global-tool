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

    // Se è in progress, verifica che non sia troppo vecchia (max 2 ore)
    if (metadata.ultra_maps_status === 'in_progress') {
      const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
      const startedAt = metadata.ultra_maps_started_at
        ? new Date(metadata.ultra_maps_started_at).getTime()
        : 0;
      const isExpired = startedAt > 0 && (Date.now() - startedAt > TWO_HOURS_MS);

      if (isExpired) {
        // Marca come expired nel database
        console.log(`🧹 [ULTRA_MAPS] Session ${sessionId} expired, cleaning up`);
        await supabaseAdmin!
          .from('tutor_sessions')
          .update({
            processing_metadata: {
              ...metadata,
              ultra_maps_status: 'expired',
              ultra_maps_expired_at: new Date().toISOString(),
              ultra_maps_error: 'Elaborazione scaduta (timeout 2 ore)'
            }
          })
          .eq('id', sessionId);

        return NextResponse.json({
          status: 'expired',
          error: 'Elaborazione scaduta. Puoi rigenerare la mappa.',
          expiredAt: new Date().toISOString()
        });
      }

      const responseData = {
        status: 'in_progress',
        currentSection: metadata.current_section || 0,
        totalSections: metadata.total_sections || 0,
        startedAt: metadata.ultra_maps_started_at,
        estimatedCompletion: metadata.estimated_completion
      };
      console.log('📊 [ULTRA_MAPS_STATUS] Returning in_progress:', JSON.stringify(responseData));
      return NextResponse.json(responseData);
    }

    // Se è fallito o expired, restituisci l'errore
    if (metadata.ultra_maps_status === 'failed' || metadata.ultra_maps_status === 'expired') {
      return NextResponse.json({
        status: metadata.ultra_maps_status,
        error: metadata.ultra_maps_error || 'Errore sconosciuto',
        failedAt: metadata.ultra_maps_failed_at || metadata.ultra_maps_expired_at
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
