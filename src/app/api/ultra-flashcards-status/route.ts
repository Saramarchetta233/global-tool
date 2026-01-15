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
      .select('flashcard_ultra, processing_metadata')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({
        error: 'Sessione non trovata o non autorizzata'
      }, { status: 404 });
    }

    const metadata = session.processing_metadata || {};

    // DEBUG: Log raw metadata from database
    console.log('📊 [ULTRA_FLASHCARDS_STATUS] Raw metadata from DB:', JSON.stringify(metadata, null, 2));
    console.log('📊 [ULTRA_FLASHCARDS_STATUS] current_section:', metadata.ultra_flashcards_current_section, 'total_sections:', metadata.ultra_flashcards_total_sections);

    // Se le flashcard sono già completate, restituiscile
    if (session.flashcard_ultra && session.flashcard_ultra.flashcards && session.flashcard_ultra.flashcards.length > 0) {
      return NextResponse.json({
        status: 'completed',
        flashcardUltra: session.flashcard_ultra,
        totalFlashcards: session.flashcard_ultra.stats?.total || session.flashcard_ultra.flashcards.length,
        completedAt: metadata.ultra_flashcards_completed_at,
        totalSections: metadata.ultra_flashcards_total_sections
      });
    }

    // Se è in progress, verifica che non sia troppo vecchia (max 2 ore)
    if (metadata.ultra_flashcards_status === 'in_progress') {
      const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
      const startedAt = metadata.ultra_flashcards_started_at
        ? new Date(metadata.ultra_flashcards_started_at).getTime()
        : 0;
      const isExpired = startedAt > 0 && (Date.now() - startedAt > TWO_HOURS_MS);

      if (isExpired) {
        // Marca come expired nel database
        console.log(`🧹 [ULTRA_FLASHCARDS] Session ${sessionId} expired, cleaning up`);
        await supabaseAdmin!
          .from('tutor_sessions')
          .update({
            processing_metadata: {
              ...metadata,
              ultra_flashcards_status: 'expired',
              ultra_flashcards_expired_at: new Date().toISOString(),
              ultra_flashcards_error: 'Elaborazione scaduta (timeout 2 ore)'
            }
          })
          .eq('id', sessionId);

        return NextResponse.json({
          status: 'expired',
          error: 'Elaborazione scaduta. Puoi rigenerare le flashcard.',
          expiredAt: new Date().toISOString()
        });
      }

      const responseData = {
        status: 'in_progress',
        currentSection: metadata.ultra_flashcards_current_section || 0,
        totalSections: metadata.ultra_flashcards_total_sections || 0,
        targetFlashcards: metadata.ultra_flashcards_target_count || 0,
        startedAt: metadata.ultra_flashcards_started_at,
        estimatedCompletion: metadata.ultra_flashcards_estimated_completion
      };
      console.log('📊 [ULTRA_FLASHCARDS_STATUS] Returning in_progress:', JSON.stringify(responseData));
      return NextResponse.json(responseData);
    }

    // Se è fallito o expired, restituisci l'errore
    if (metadata.ultra_flashcards_status === 'failed' || metadata.ultra_flashcards_status === 'expired') {
      return NextResponse.json({
        status: metadata.ultra_flashcards_status,
        error: metadata.ultra_flashcards_error || 'Errore sconosciuto',
        failedAt: metadata.ultra_flashcards_failed_at || metadata.ultra_flashcards_expired_at
      });
    }

    // Nessuna flashcard ultra richiesta
    return NextResponse.json({
      status: 'not_started'
    });

  } catch (error) {
    console.error('❌ Ultra Flashcards Status Error:', error);
    return NextResponse.json({
      error: 'Errore nel recupero dello stato'
    }, { status: 500 });
  }
}
