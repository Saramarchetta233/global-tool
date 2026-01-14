import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/ultra-maps-status/check-user
 * Controlla se l'utente ha sessioni con Ultra Maps in elaborazione
 * Utile per mostrare il progresso su qualsiasi dispositivo
 */
export async function GET(request: NextRequest) {
  try {
    // Get userId from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId richiesto' }, { status: 400 });
    }

    // Cerca sessioni dell'utente con ultra_maps_status = 'in_progress'
    const { data: sessions, error } = await supabaseAdmin!
      .from('tutor_sessions')
      .select('id, file_name, processing_metadata, created_at')
      .eq('user_id', userId)
      .not('processing_metadata', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Errore query sessioni ultra maps:', error);
      return NextResponse.json({ error: 'Errore database' }, { status: 500 });
    }

    // Filtra solo quelle con ultra_maps_status = 'in_progress' e non troppo vecchie
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
    const now = Date.now();

    const inProgressSessions: typeof sessions = [];
    const expiredSessions: string[] = [];

    sessions?.forEach(session => {
      const metadata = session.processing_metadata;
      if (metadata && metadata.ultra_maps_status === 'in_progress') {
        const startedAt = metadata.ultra_maps_started_at
          ? new Date(metadata.ultra_maps_started_at).getTime()
          : new Date(session.created_at).getTime();

        if (now - startedAt > TWO_HOURS_MS) {
          // Elaborazione troppo vecchia - considerala expired
          expiredSessions.push(session.id);
        } else {
          inProgressSessions.push(session);
        }
      }
    });

    // Marca le sessioni expired come failed nel database (cleanup automatico)
    if (expiredSessions.length > 0) {
      console.log(`🧹 [ULTRA_MAPS] Cleaning up ${expiredSessions.length} expired sessions`);
      for (const sessionId of expiredSessions) {
        const { data: sess } = await supabaseAdmin!
          .from('tutor_sessions')
          .select('processing_metadata')
          .eq('id', sessionId)
          .single();

        if (sess) {
          await supabaseAdmin!
            .from('tutor_sessions')
            .update({
              processing_metadata: {
                ...sess.processing_metadata,
                ultra_maps_status: 'expired',
                ultra_maps_expired_at: new Date().toISOString(),
                ultra_maps_error: 'Elaborazione scaduta (timeout 2 ore)'
              }
            })
            .eq('id', sessionId);
        }
      }
    }

    if (inProgressSessions.length === 0) {
      return NextResponse.json({
        hasProcessing: false,
        sessions: []
      });
    }

    // Ritorna le sessioni in elaborazione con i dettagli del progresso
    const sessionsWithProgress = inProgressSessions.map(session => ({
      sessionId: session.id,
      fileName: session.file_name || 'Documento',
      currentSection: session.processing_metadata?.current_section || 0,
      totalSections: session.processing_metadata?.total_sections || 0,
      startedAt: session.processing_metadata?.ultra_maps_started_at || session.created_at
    }));

    return NextResponse.json({
      hasProcessing: true,
      sessions: sessionsWithProgress
    });

  } catch (error) {
    console.error('Errore check-user ultra maps:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
