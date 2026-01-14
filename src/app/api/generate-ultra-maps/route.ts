import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { tasks } from "@trigger.dev/sdk/v3";
import type { ultraMapsTask } from "@/trigger/ultra-maps";

export async function POST(request: NextRequest) {
  console.log('🗺️ Ultra Maps API called');

  let sessionId: string | undefined;
  let userId: string | undefined;

  try {
    const body = await request.json();
    sessionId = body.sessionId;
    userId = body.userId;

    console.log('📝 Ultra Maps request:', { sessionId, userId });

    if (!sessionId || !userId) {
      return NextResponse.json({
        error: 'SessionId e UserId sono richiesti'
      }, { status: 400 });
    }

    // 1. Verify session exists and belongs to user
    const { data: session, error: sessionError } = await supabaseAdmin!
      .from('tutor_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({
        error: 'Sessione non trovata o non autorizzata'
      }, { status: 404 });
    }

    // 2. Check if Ultra Maps already exists
    if (session.mappa_ultra && session.mappa_ultra.nodes && session.mappa_ultra.nodes.length > 0) {
      console.log('✅ [ULTRA_MAPS] Already exists in DB, returning (no credit charge)');
      return NextResponse.json({
        mappa_ultra: session.mappa_ultra,
        fromDatabase: true,
        message: 'Mappa Ultra già generata per questo documento'
      });
    }

    // 3. Check if Ultra Maps is already in progress
    const metadata = session.processing_metadata;
    if (metadata?.ultra_maps_status === 'in_progress') {
      return NextResponse.json({
        error: 'Mappa Ultra già in elaborazione. Controlla lo stato nella dashboard.',
        status: 'in_progress',
        currentSection: metadata.current_section,
        totalSections: metadata.total_sections
      }, { status: 409 });
    }

    // 4. Verify we have PDF text to work with
    if (!session.pdf_text || session.pdf_text.length < 100) {
      return NextResponse.json({
        error: 'Testo del documento non disponibile o troppo breve per la Mappa Ultra'
      }, { status: 400 });
    }

    // 5. Consume 100 credits
    const baseUrl = request.url.split('/api')[0];
    const creditResponse = await fetch(`${baseUrl}/api/credits/consume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
      body: JSON.stringify({
        userId: userId,
        amount: 100,
        description: 'Mappa Ultra - Mappa concettuale dettagliata completa',
        featureType: 'ultra_maps'
      })
    });

    if (!creditResponse.ok) {
      const creditError = await creditResponse.json();
      if (creditError.error === 'insufficient_credits') {
        return NextResponse.json({
          error: 'insufficient_credits',
          message: 'Crediti insufficienti per la Mappa Ultra',
          required: 100,
          current: creditError.currentCredits || 0
        }, { status: 403 });
      }
      throw new Error('Errore nel consumo crediti');
    }

    const creditResult = await creditResponse.json();
    console.log(`💳 Ultra Maps: 100 credits consumed, new balance: ${creditResult.newBalance}`);

    // 6. Mark Ultra Maps as "in progress" in database
    await supabaseAdmin!
      .from('tutor_sessions')
      .update({
        processing_metadata: {
          ...metadata,
          ultra_maps_status: 'in_progress',
          ultra_maps_started_at: new Date().toISOString(),
          estimated_completion: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minuti stima
        }
      })
      .eq('id', sessionId);

    // 7. Trigger the background task with Trigger.dev
    console.log('🚀 Triggering Trigger.dev task for Ultra Maps...');

    const handle = await tasks.trigger<typeof ultraMapsTask>(
      "ultra-maps",
      {
        sessionId,
        userId,
        newCreditBalance: creditResult.newBalance,
      }
    );

    console.log(`✅ Trigger.dev task triggered with ID: ${handle.id}`);

    // 8. Return immediately with task info
    return NextResponse.json({
      success: true,
      message: 'Mappa Ultra avviata in background! Riceverai una notifica quando sarà pronta.',
      sessionId,
      newCreditBalance: creditResult.newBalance,
      creditsUsed: 100,
      taskId: handle.id,
      status: 'in_progress',
      estimatedTime: '10-20 minuti per documenti lunghi'
    });

  } catch (error) {
    console.error('❌ Ultra Maps API Error:', error);

    // Mark as failed in database if we have sessionId
    if (sessionId) {
      try {
        const { data: session } = await supabaseAdmin!
          .from('tutor_sessions')
          .select('processing_metadata')
          .eq('id', sessionId)
          .single();

        await supabaseAdmin!
          .from('tutor_sessions')
          .update({
            processing_metadata: {
              ...(session?.processing_metadata || {}),
              ultra_maps_status: 'failed',
              ultra_maps_error: error instanceof Error ? error.message : 'Errore sconosciuto',
              ultra_maps_failed_at: new Date().toISOString()
            }
          })
          .eq('id', sessionId);
      } catch (dbError) {
        console.error('❌ Error updating failure status:', dbError);
      }
    }

    return NextResponse.json({
      error: `Errore durante l'avvio della Mappa Ultra: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
    }, { status: 500 });
  }
}
