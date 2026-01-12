import { NextRequest, NextResponse } from 'next/server';

import { cache } from '@/lib/redis-cache';
import { supabase, supabaseAdmin } from '@/lib/supabase';

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
          riassunto_ultra: null, // Demo doesn't include Ultra Summary
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

    // PRIMA: Controlla cache Redis per history (6 mesi = 180 giorni)
    const historyCacheKey = `document_history_${userAuth.user.id}`;
    const CACHE_TTL_6_MONTHS = 6 * 30 * 24 * 60 * 60 * 1000; // 6 mesi in ms
    
    try {
      const cachedHistory = await cache.get(historyCacheKey);
      if (cachedHistory) {
        console.log('🚀 [REDIS_HISTORY_CACHE_HIT] Found cached document history:', cachedHistory.length, 'documents');
        return NextResponse.json({ history: cachedHistory });
      }
    } catch (cacheError) {
      console.log('⚠️ Redis history cache error (non-critical):', cacheError);
    }

    // Get user's tutor sessions (PDF history) with all document metadata
    console.log('🔍 [HISTORY_DEBUG] Querying tutor_sessions for user:', userAuth.user.id);
    console.log('🔍 [HISTORY_DEBUG] User email:', userAuth.user.email);
    console.log('🔍 [HISTORY_DEBUG] User auth object keys:', Object.keys(userAuth.user));
    console.log('🔍 [HISTORY_DEBUG] Current timestamp:', new Date().toISOString());
    console.log('🔍 [HISTORY_DEBUG] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50) + '...');
    console.log('🔍 [HISTORY_DEBUG] Using supabaseAdmin:', !!supabaseAdmin);
    
    // Try both supabase and supabaseAdmin to debug RLS issues
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('tutor_sessions')
      .select('*')
      .eq('user_id', userAuth.user.id)
      .order('created_at', { ascending: false }) // Changed to created_at for debugging
      .limit(100); // Explicit limit to prevent implicit limits

    // First, count total documents for this user
    const { count, error: countError } = await supabaseAdmin
      .from('tutor_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userAuth.user.id);

    console.log('📊 [HISTORY_DEBUG] Database query result:', { 
      sessions: sessions?.length || 0, 
      totalCount: count,
      error: sessionsError?.message || 'none',
      countError: countError?.message || 'none',
      userIdSearched: userAuth.user.id,
      sampleData: sessions?.[0] || 'no data',
      sessionIds: sessions?.slice(0, 3).map(s => ({ 
        id: s.id.substring(0, 8), 
        file: s.file_name,
        created: s.created_at 
      })) || []
    });

    // Debug: Check recent sessions for this user specifically
    const { data: recentSessions, error: recentError } = await supabaseAdmin
      .from('tutor_sessions')
      .select('id, user_id, file_name, created_at')
      .eq('user_id', userAuth.user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Debug: Try to find the most recent document saved (check if RLS is the issue)
    const { data: specificDoc, error: specificError } = await supabaseAdmin
      .from('tutor_sessions')
      .select('id, user_id, file_name, created_at')
      .eq('id', 'f09eda66-ec86-4cf8-a73f-e4cd27976c52') // The exact ID from logs
      .single();

    // Also check if ANY document with Test_Storico2.pdf exists
    const { data: testDoc, error: testError } = await supabaseAdmin
      .from('tutor_sessions')
      .select('id, user_id, file_name, created_at')
      .eq('file_name', 'Test_Storico2.pdf')
      .order('created_at', { ascending: false })
      .limit(1);
    
    console.log('📊 [HISTORY_DEBUG] Recent sessions for user:', { 
      userIdSearched: userAuth.user.id,
      recentSessions: recentSessions?.length || 0, 
      sessions: recentSessions?.map(s => ({ 
        id: s.id.substring(0, 8), 
        user_id: s.user_id.substring(0, 8), 
        file: s.file_name,
        created: s.created_at 
      })) || [],
      specificDocByIdFound: !!specificDoc,
      specificDocById: specificDoc ? {
        id: specificDoc.id.substring(0, 8),
        user_id: specificDoc.user_id.substring(0, 8),
        file_name: specificDoc.file_name,
        created_at: specificDoc.created_at,
        userIdMatch: specificDoc.user_id === userAuth.user.id
      } : 'not found',
      testDocFound: !!testDoc && testDoc.length > 0,
      testDoc: testDoc?.[0] ? {
        id: testDoc[0].id.substring(0, 8),
        user_id: testDoc[0].user_id.substring(0, 8),
        file_name: testDoc[0].file_name,
        created_at: testDoc[0].created_at,
        userIdMatch: testDoc[0].user_id === userAuth.user.id
      } : 'not found'
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
      title: session.file_name ? session.file_name.replace('.pdf', '') : (session.title || 'Document'),
      processedAt: session.created_at,
      lastUsedAt: session.last_used_at || session.created_at,
      pageCount: session.page_count,
      fileSize: session.file_size,
      riassunto_breve: session.riassunto_breve,
      riassunto_esteso: session.riassunto_esteso,
      riassunto_ultra: session.riassunto_ultra, // Added Ultra Summary field
      mappa_concettuale: session.mappa_concettuale || [],
      flashcard: session.flashcard || [],
      quiz: session.quiz || [],
      guida_esame: session.guida_esame || '',
      sessionId: session.id
    })) || [];

    console.log(`📚 Retrieved ${history.length} documents for user ${userAuth.user.id}`);

    // Salva in cache Redis la history ottenuta dal database
    try {
      await cache.set(historyCacheKey, history, CACHE_TTL_6_MONTHS);
      console.log('🚀 [REDIS_HISTORY_CACHE_SET] Cached document history for 6 months');
    } catch (cacheError) {
      console.log('⚠️ Failed to cache history (non-critical):', cacheError);
    }

    return NextResponse.json({ history });
    
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};