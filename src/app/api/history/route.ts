import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { withCredits } from '@/lib/middleware';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
    console.log('🔍 [HISTORY_DEBUG] Querying tutor_sessions for user:', userAuth.user.id);
    console.log('🔍 [HISTORY_DEBUG] User email:', userAuth.user.email);
    console.log('🔍 [HISTORY_DEBUG] User auth object keys:', Object.keys(userAuth.user));
    
    // Try both supabase and supabaseAdmin to debug RLS issues
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('tutor_sessions')
      .select('*')
      .eq('user_id', userAuth.user.id)
      .order('created_at', { ascending: false }); // Changed to created_at for debugging

    console.log('📊 [HISTORY_DEBUG] Database query result:', { 
      sessions: sessions?.length || 0, 
      error: sessionsError?.message || 'none',
      userIdSearched: userAuth.user.id,
      sampleData: sessions?.[0] || 'no data'
    });

    // Debug: Check recent sessions for this user specifically
    const { data: recentSessions, error: recentError } = await supabaseAdmin
      .from('tutor_sessions')
      .select('id, user_id, file_name, created_at')
      .eq('user_id', userAuth.user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    console.log('📊 [HISTORY_DEBUG] Recent sessions for user:', { 
      userIdSearched: userAuth.user.id,
      recentSessions: recentSessions?.length || 0, 
      sessions: recentSessions?.map(s => ({ 
        id: s.id.substring(0, 8), 
        user_id: s.user_id.substring(0, 8), 
        file: s.file_name,
        created: s.created_at 
      })) || []
    });

    // Debug: Check all recent sessions regardless of user (to see if documents are being saved with different user_id)
    const { data: allRecentSessions, error: allRecentError } = await supabaseAdmin
      .from('tutor_sessions')
      .select('id, user_id, file_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log('📊 [HISTORY_DEBUG] All recent sessions (any user):', { 
      allRecentSessions: allRecentSessions?.length || 0, 
      sessions: allRecentSessions?.map(s => ({ 
        id: s.id.substring(0, 8), 
        user_id: s.user_id.substring(0, 8), 
        file: s.file_name,
        created: s.created_at 
      })) || []
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