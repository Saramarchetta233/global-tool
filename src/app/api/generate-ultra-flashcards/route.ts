import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { tasks } from "@trigger.dev/sdk/v3";
import type { ultraFlashcardsTask } from "@/trigger/ultra-flashcards";

export async function POST(request: NextRequest) {
  console.log('🎴 Ultra Flashcards API called');

  let sessionId: string | undefined;
  let userId: string | undefined;

  try {
    const body = await request.json();
    sessionId = body.sessionId;
    userId = body.userId;
    const targetLanguage = body.targetLanguage || 'Italiano';

    console.log('📝 Ultra Flashcards request:', { sessionId, userId, targetLanguage });

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

    // 2. Check if Ultra Flashcards already exists
    if (session.flashcard_ultra && session.flashcard_ultra.flashcards && session.flashcard_ultra.flashcards.length > 0) {
      console.log('✅ [ULTRA_FLASHCARDS] Already exists in DB, returning (no credit charge)');
      return NextResponse.json({
        flashcard_ultra: session.flashcard_ultra,
        fromDatabase: true,
        message: 'Flashcard Ultra già generate per questo documento'
      });
    }

    // 3. Check if Ultra Flashcards is already in progress
    const metadata = session.processing_metadata || {};
    if (metadata?.ultra_flashcards_status === 'in_progress') {
      return NextResponse.json({
        error: 'Flashcard Ultra già in elaborazione. Controlla lo stato nella dashboard.',
        status: 'in_progress',
        currentSection: metadata.ultra_flashcards_current_section || 0,
        totalSections: metadata.ultra_flashcards_total_sections || 0
      }, { status: 409 });
    }

    // 4. Verify we have PDF text to work with
    if (!session.pdf_text || session.pdf_text.length < 100) {
      return NextResponse.json({
        error: 'Testo del documento non disponibile o troppo breve per le Flashcard Ultra'
      }, { status: 400 });
    }

    // 5. Consume 150 credits
    const baseUrl = request.url.split('/api')[0];
    const creditResponse = await fetch(`${baseUrl}/api/credits/consume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
      body: JSON.stringify({
        userId: userId,
        amount: 150,
        description: 'Flashcard Ultra - Set completo 50-100 flashcard dettagliate',
        featureType: 'ultra_flashcards'
      })
    });

    if (!creditResponse.ok) {
      const creditError = await creditResponse.json();
      if (creditError.error === 'insufficient_credits') {
        return NextResponse.json({
          error: 'insufficient_credits',
          message: 'Crediti insufficienti per le Flashcard Ultra',
          required: 150,
          current: creditError.currentCredits || 0
        }, { status: 403 });
      }
      throw new Error('Errore nel consumo crediti');
    }

    const creditResult = await creditResponse.json();
    console.log(`💳 Ultra Flashcards: 150 credits consumed, new balance: ${creditResult.newBalance}`);

    // 6. Calcola stima iniziale delle sezioni basata sulla lunghezza del documento
    const documentLength = session.pdf_text.length;
    let estimatedSections: number;
    let estimatedFlashcards: number;

    if (documentLength > 300000) {
      estimatedSections = Math.min(20, Math.ceil(documentLength / 8000));
      estimatedFlashcards = 100;
    } else if (documentLength > 150000) {
      estimatedSections = Math.min(16, Math.ceil(documentLength / 7000));
      estimatedFlashcards = 80;
    } else if (documentLength > 50000) {
      estimatedSections = Math.min(12, Math.ceil(documentLength / 6000));
      estimatedFlashcards = 60;
    } else {
      estimatedSections = Math.min(10, Math.ceil(documentLength / 5000));
      estimatedFlashcards = 50;
    }
    estimatedSections = Math.max(3, estimatedSections); // Minimo 3 sezioni

    // 7. Mark Ultra Flashcards as "in progress" in database
    await supabaseAdmin!
      .from('tutor_sessions')
      .update({
        processing_metadata: {
          ...metadata,
          ultra_flashcards_status: 'in_progress',
          ultra_flashcards_started_at: new Date().toISOString(),
          ultra_flashcards_current_section: 0,
          ultra_flashcards_total_sections: estimatedSections,
          ultra_flashcards_target_count: estimatedFlashcards,
          ultra_flashcards_estimated_completion: new Date(Date.now() + estimatedSections * 2 * 60 * 1000).toISOString()
        }
      })
      .eq('id', sessionId);

    // 8. Trigger the background task with Trigger.dev
    console.log('🚀 Triggering Trigger.dev task for Ultra Flashcards...');

    const handle = await tasks.trigger<typeof ultraFlashcardsTask>(
      "ultra-flashcards",
      {
        sessionId,
        userId,
        newCreditBalance: creditResult.newBalance,
        targetLanguage,
      }
    );

    console.log(`✅ Trigger.dev task triggered with ID: ${handle.id}`);

    // 9. Return immediately with task info
    return NextResponse.json({
      success: true,
      message: 'Flashcard Ultra avviate in background! Riceverai una notifica quando saranno pronte.',
      sessionId,
      newCreditBalance: creditResult.newBalance,
      creditsUsed: 150,
      taskId: handle.id,
      status: 'in_progress',
      currentSection: 0,
      totalSections: estimatedSections,
      estimatedFlashcards,
      estimatedTime: `~${estimatedSections * 2} minuti per ~${estimatedFlashcards} flashcard`
    });

  } catch (error) {
    console.error('❌ Ultra Flashcards API Error:', error);

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
              ultra_flashcards_status: 'failed',
              ultra_flashcards_error: error instanceof Error ? error.message : 'Errore sconosciuto',
              ultra_flashcards_failed_at: new Date().toISOString()
            }
          })
          .eq('id', sessionId);
      } catch (dbError) {
        console.error('❌ Error updating failure status:', dbError);
      }
    }

    return NextResponse.json({
      error: `Errore durante l'avvio delle Flashcard Ultra: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
    }, { status: 500 });
  }
}
