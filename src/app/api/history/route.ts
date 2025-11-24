import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { withCredits } from '@/lib/middleware';

export const GET = async (request: NextRequest) => {
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
      // Return demo history for demo users
      const demoHistory = [
        {
          id: 'demo-session-1',
          fileName: 'Psicologia Cognitiva.pdf',
          processedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          riassunto_breve: 'La psicologia cognitiva è un ramo della psicologia che studia i processi mentali coinvolti nella conoscenza.',
          riassunto_esteso: 'La psicologia cognitiva è un ramo della psicologia che studia i processi mentali coinvolti nella conoscenza, nell\'elaborazione delle informazioni e nella comprensione...',
          mappa_concettuale: [
            { title: 'Psicologia Cognitiva', children: [
              { title: 'Percezione' },
              { title: 'Memoria' },
              { title: 'Attenzione' }
            ]}
          ],
          flashcard: [
            { front: 'Cos\'è la psicologia cognitiva?', back: 'È un ramo della psicologia che studia i processi mentali' }
          ],
          quiz: [
            {
              question: 'Quanti tipi di memoria esistono?',
              options: ['2', '3', '4', '5'],
              correct_option_index: 1,
              explanation: 'Esistono tre tipi principali: sensoriale, breve termine e lungo termine'
            }
          ],
          guida_esame: 'Studia prima la teoria generale, poi approfondisci i dettagli...',
          sessionId: 'demo-session-1'
        }
      ];
      
      return NextResponse.json({ history: demoHistory });
    }

    // Verify token and get user (simplified version for demo)
    const { data: userAuth, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !userAuth.user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user's tutor sessions (PDF history) with all document metadata
    console.log('🔍 Querying tutor_sessions for user:', userAuth.user.id);
    
    // Try both supabase and supabaseAdmin to debug RLS issues
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('tutor_sessions')
      .select('*')
      .eq('user_id', userAuth.user.id)
      .order('last_used_at', { ascending: false }); // Order by last_used_at for better UX

    console.log('📊 Database query result:', { 
      sessions: sessions?.length || 0, 
      error: sessionsError?.message || 'none',
      sampleData: sessions?.[0] || 'no data'
    });

    // Debug: Let's also check all sessions in the table
    const { data: allSessions, error: allError } = await supabaseAdmin
      .from('tutor_sessions')
      .select('id, user_id, file_name')
      .limit(5);
    
    console.log('🔍 All sessions in table (debug):', { 
      allSessions: allSessions?.length || 0, 
      sample: allSessions?.map(s => ({ id: s.id, user_id: s.user_id, file: s.file_name })) || []
    });

    if (sessionsError) {
      console.error('❌ Error fetching sessions:', sessionsError);
      return NextResponse.json(
        { error: 'Failed to fetch history' },
        { status: 500 }
      );
    }

    // Transform data for frontend with enhanced metadata
    const history = sessions?.map(session => ({
      id: session.id,
      fileName: session.file_name || session.title || 'Document',
      title: session.title || (session.file_name ? session.file_name.replace('.pdf', '') : 'Document'),
      processedAt: session.created_at,
      lastUsedAt: session.last_used_at || session.created_at,
      pageCount: session.page_count,
      fileSize: session.file_size,
      riassunto_breve: session.riassunto_breve,
      riassunto_esteso: session.riassunto_esteso,
      mappa_concettuale: session.mappa_concettuale || [],
      flashcard: session.flashcard || [],
      quiz: session.quiz || [],
      guida_esame: session.guida_esame || '',
      sessionId: session.id
    })) || [];

    console.log(`📚 Retrieved ${history.length} documents for user ${userAuth.user.id}`);

    return NextResponse.json({ history });
    
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};