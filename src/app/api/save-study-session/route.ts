import { NextRequest, NextResponse } from 'next/server';

import { cache } from '@/lib/redis-cache';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest) => {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Handle demo tokens
    if (token.startsWith('demo-token-')) {
      return NextResponse.json({ success: true, message: 'Demo session saved to localStorage only' });
    }

    // Verify token and get user
    const { data: userAuth, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !userAuth.user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const sessionData = body.session;

    console.log('💾 [SAVE_SESSION_API] Saving session for user:', userAuth.user.id);
    console.log('💾 [SAVE_SESSION_API] User email:', userAuth.user.email);
    console.log('💾 [SAVE_SESSION_API] Session data keys:', Object.keys(sessionData));
    console.log('💾 [SAVE_SESSION_API] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50) + '...');
    console.log('💾 [SAVE_SESSION_API] Using supabaseAdmin:', !!supabaseAdmin);

    const now = new Date().toISOString();
    const sessionId = sessionData.sessionId || crypto.randomUUID();

    // Save to database using supabaseAdmin (same as history API)
    const { data, error } = await supabaseAdmin
      .from('tutor_sessions')
      .upsert({
        id: sessionId,
        user_id: userAuth.user.id,
        file_name: sessionData.docName || sessionData.docTitle,
        title: sessionData.docTitle,
        riassunto_breve: sessionData.summaryShort,
        riassunto_esteso: sessionData.summaryExtended,
        mappa_concettuale: sessionData.conceptMap,
        flashcard: sessionData.flashcards,
        quiz: sessionData.quizData,
        guida_esame: sessionData.studyInOneHour,
        pdf_text: sessionData.extractedText,
        created_at: now,
        updated_at: now,
        last_used_at: now
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [SAVE_SESSION_API] Database save failed:', error);
      return NextResponse.json(
        { error: 'Failed to save session', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ [SAVE_SESSION_API] Successfully saved to database:', { 
      id: sessionId.substring(0, 8), 
      fileName: sessionData.docName || sessionData.docTitle,
      userId: userAuth.user.id.substring(0, 8)
    });

    // Invalida la cache Redis della history per questo utente
    const historyCacheKey = `document_history_${userAuth.user.id}`;
    try {
      await cache.delete(historyCacheKey);
      console.log('🗑️ [CACHE_INVALIDATE] History cache cleared for user after saving new document');
    } catch (cacheError) {
      console.log('⚠️ Failed to invalidate history cache (non-critical):', cacheError);
    }

    return NextResponse.json({ 
      success: true, 
      sessionId: sessionId,
      message: 'Session saved successfully' 
    });

  } catch (error) {
    console.error('❌ [SAVE_SESSION_API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};