import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { withAuth } from '@/lib/middleware';
import { supabase } from '@/lib/supabase';

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const { pdfText, riassuntoBreve, riassuntoEsteso, flashcard } = await request.json();

    if (!pdfText || !riassuntoBreve || !riassuntoEsteso) {
      return NextResponse.json(
        { error: 'PDF text and summaries are required' },
        { status: 400 }
      );
    }

    const sessionId = crypto.randomUUID();

    // Save tutor session
    const { data: session, error } = await supabase
      .from('tutor_sessions')
      .insert({
        id: sessionId,
        user_id: user.id,
        pdf_text: pdfText,
        riassunto_breve: riassuntoBreve,
        riassunto_esteso: riassuntoEsteso,
        flashcard: flashcard || [],
        created_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) {
      console.error('Failed to create tutor session:', error);
      return NextResponse.json(
        { error: 'Failed to create tutor session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Tutor session API error:', error);
    return NextResponse.json(
      { error: 'Failed to create tutor session' },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      // Return all user sessions
      const { data: sessions, error } = await supabase
        .from('tutor_sessions')
        .select('id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch sessions:', error);
        return NextResponse.json(
          { error: 'Failed to fetch sessions' },
          { status: 500 }
        );
      }

      return NextResponse.json({ sessions });
    }

    // Return specific session
    const { data: session, error } = await supabase
      .from('tutor_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (error || !session) {
      return NextResponse.json(
        { error: 'Session not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ session });

  } catch (error) {
    console.error('Tutor session fetch API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutor session' },
      { status: 500 }
    );
  }
});