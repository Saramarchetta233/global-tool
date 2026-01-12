import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { tasks } from "@trigger.dev/sdk/v3";
import type { ultraSummaryTask } from "@/trigger/ultra-summary";

export async function POST(request: NextRequest) {
  console.log('🚀 Ultra Summary API called');

  let sessionId: string | undefined;
  let userId: string | undefined;

  try {
    const body = await request.json();
    sessionId = body.sessionId;
    userId = body.userId;

    console.log('📝 Ultra Summary request:', { sessionId, userId });

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

    // 2. Check if Ultra Summary already exists
    if (session.riassunto_ultra) {
      return NextResponse.json({
        error: 'Riassunto Ultra già esistente per questa sessione. Vai al tab Riassunto Ultra per visualizzarlo.'
      }, { status: 409 });
    }

    // 3. Check if Ultra Summary is already in progress
    const metadata = session.processing_metadata;
    if (metadata?.ultra_summary_status === 'in_progress') {
      return NextResponse.json({
        error: 'Riassunto Ultra già in elaborazione. Controlla lo stato nella dashboard.',
        status: 'in_progress',
        currentSection: metadata.current_section,
        totalSections: metadata.total_sections
      }, { status: 409 });
    }

    // 4. Verify we have PDF text to work with
    if (!session.pdf_text || session.pdf_text.length < 100) {
      return NextResponse.json({
        error: 'Testo del documento non disponibile o troppo breve per il Riassunto Ultra'
      }, { status: 400 });
    }

    // 5. Consume 250 credits
    const baseUrl = request.url.split('/api')[0];
    const creditResponse = await fetch(`${baseUrl}/api/credits/consume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
      body: JSON.stringify({
        userId: userId,
        amount: 250,
        description: 'Riassunto Ultra - Analisi dettagliata completa',
        featureType: 'ultra_summary'
      })
    });

    if (!creditResponse.ok) {
      const creditError = await creditResponse.json();
      if (creditError.error === 'insufficient_credits') {
        return NextResponse.json({
          error: 'insufficient_credits',
          message: 'Crediti insufficienti per il Riassunto Ultra',
          required: 250,
          current: creditError.currentCredits || 0
        }, { status: 403 });
      }
      throw new Error('Errore nel consumo crediti');
    }

    const creditResult = await creditResponse.json();
    console.log(`💳 Ultra Summary: 250 credits consumed, new balance: ${creditResult.newBalance}`);

    // 6. Mark Ultra Summary as "in progress" in database
    await supabaseAdmin!
      .from('tutor_sessions')
      .update({
        processing_metadata: {
          ultra_summary_status: 'in_progress',
          ultra_summary_started_at: new Date().toISOString(),
          estimated_completion: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        }
      })
      .eq('id', sessionId);

    // 7. Trigger the background task with Trigger.dev
    console.log('🚀 Triggering Trigger.dev task for Ultra Summary...');

    const handle = await tasks.trigger<typeof ultraSummaryTask>(
      "ultra-summary",
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
      message: 'Riassunto Ultra avviato in background! Riceverai una notifica quando sarà pronto.',
      sessionId,
      newCreditBalance: creditResult.newBalance,
      creditsUsed: 250,
      taskId: handle.id,
      status: 'in_progress',
      estimatedTime: '20-40 minuti per documenti lunghi'
    });

  } catch (error) {
    console.error('❌ Ultra Summary API Error:', error);

    // Mark as failed in database if we have sessionId
    if (sessionId) {
      try {
        await supabaseAdmin!
          .from('tutor_sessions')
          .update({
            processing_metadata: {
              ultra_summary_status: 'failed',
              ultra_summary_error: error instanceof Error ? error.message : 'Errore sconosciuto',
              ultra_summary_failed_at: new Date().toISOString()
            }
          })
          .eq('id', sessionId);
      } catch (dbError) {
        console.error('❌ Error updating failure status:', dbError);
      }
    }

    return NextResponse.json({
      error: `Errore durante l'avvio del Riassunto Ultra: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
    }, { status: 500 });
  }
}
