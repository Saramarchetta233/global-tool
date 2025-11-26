import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase';
import { cache } from '@/lib/redis-cache';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    const queryStartTime = Date.now();
    console.log('🔍 check-first-time: Reading oral_exam_uses from profile for user:', {
      userId: user.id,
      timestamp: new Date().toISOString()
    });
    
    // PRIMA: Controlla cache Redis persistente
    const redisCacheKey = `oral_exam_uses_${user.id}`;
    try {
      const cachedUses = await cache.get(redisCacheKey);
      if (cachedUses !== null && cachedUses !== undefined) {
        console.log('🚀 [REDIS_CACHE] Found cached oral_exam count:', cachedUses);
        const uses = parseInt(cachedUses) || 0;
        const isFirstTime = uses === 0;
        
        console.log('[CHECK_FIRST_TIME_RESULT] Oral exam result (REDIS_CACHED):', { 
          userId: user.id, 
          oral_exam_uses: uses,
          isFirstTime,
          cost: isFirstTime ? 0 : 25
        });
        
        return NextResponse.json({
          isFirstTime,
          cost: isFirstTime ? 0 : 25,
          oralExamCount: uses
        });
      }
    } catch (redisError) {
      console.log('⚠️ Redis cache error (non-critical):', redisError);
    }
    
    // SECONDA: Controlla cache temporaneo in memoria
    const tempCacheKey = `oral_exam_uses_${user.id}`;
    const cachedData = (global as any).tempUserCache?.get(tempCacheKey);
    
    if (cachedData && cachedData.expires > Date.now()) {
      console.log('💾 [MEMORY_CACHE] Found cached oral_exam count:', cachedData.value);
      const uses = cachedData.value;
      const isFirstTime = uses === 0;
      
      console.log('[CHECK_FIRST_TIME_RESULT] Oral exam result (MEMORY_CACHED):', { 
        userId: user.id, 
        oral_exam_uses: uses,
        isFirstTime,
        cost: isFirstTime ? 0 : 25
      });
      
      return NextResponse.json({
        isFirstTime,
        cost: isFirstTime ? 0 : 25,
        oralExamCount: uses
      });
    }
    
    console.log('💾 [CACHE_MISS] No valid cache found, reading from database...');
    
    // Usa SOLO supabaseAdmin (con service role) per evitare problemi RLS
    if (!supabaseAdmin) {
      console.error('[CHECK_FIRST_TIME_ERROR] supabaseAdmin not available');
      return NextResponse.json({
        error: true,
        message: 'Service unavailable',
        isFirstTime: null,
        cost: null,
        oralExamCount: null
      }, { status: 500 });
    }
    
    // CACHE BUSTING: Usa order by per forzare una query fresh
    console.log('🚨 [CACHE_BUST] Forcing fresh query with order by...');
    
    // Query con order by per evitare cache + limit per sicurezza
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('user_id, oral_exam_uses, credits, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1);
      
    const profile = profiles?.[0] || null;

    const queryDuration = Date.now() - queryStartTime;
    console.log('[CHECK_FIRST_TIME_PROFILE]', {
      userId: user.id,
      profile,
      error,
      queryDurationMs: queryDuration,
      cacheWarning: queryDuration < 10 ? 'POSSIBLE_CACHE_HIT' : 'NORMAL_DB_QUERY'
    });

    if (error) {
      console.error('[CHECK_FIRST_TIME_ERROR] profile query failed', error);
      // In caso di errore, per sicurezza NON considerare più gratis
      return NextResponse.json({
        isFirstTime: false,
        cost: 25,
        oralExamCount: 0
      }, { status: 200 });
    }

    // DEBUG: Se il valore è 0, controlliamo se esiste davvero nel database
    if ((profile?.oral_exam_uses ?? 0) === 0) {
      console.log('🚨 [CRITICAL_DEBUG] oral_exam_uses is 0, checking database directly...');
      
      // Query di verifica con ordering per timestamp
      const { data: debugProfiles, error: debugError } = await supabaseAdmin
        .from('profiles')
        .select('user_id, oral_exam_uses, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
        
      console.log('🚨 [CRITICAL_DEBUG] All profiles for this user:', {
        profiles: debugProfiles,
        error: debugError?.message || 'none'
      });
      
      // Query di verifica per vedere se esistono più righe
      const { count: profileCount } = await supabaseAdmin
        .from('profiles')
        .select('user_id', { count: 'exact', head: true })
        .eq('user_id', user.id);
        
      console.log('🚨 [CRITICAL_DEBUG] Profile count for user:', profileCount);
    
    // DEBUG: Controlla se ci sono sessioni di esame orale per questo utente
    const { data: oralSessions, error: sessionsError } = await supabaseAdmin
      .from('oral_exam_sessions')
      .select('id, session_data, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
      
    console.log('🚨 [CRITICAL_DEBUG] Oral exam sessions for this user:', {
      sessionsCount: oralSessions?.length || 0,
      sessions: oralSessions?.map(s => ({
        id: s.id,
        was_free: s.session_data?.was_free,
        created_at: s.created_at
      })) || [],
      error: sessionsError?.message || 'none'
    });
    }

    const uses = profile?.oral_exam_uses ?? 0;
    const isFirstTime = uses === 0;
    
    console.log('[CHECK_FIRST_TIME_RESULT] Oral exam result (DB_READ):', { 
      userId: user.id, 
      oral_exam_uses: uses,
      isFirstTime,
      cost: isFirstTime ? 0 : 25
    });
    
    // Salva nel cache Redis per 30 giorni
    try {
      await cache.set(redisCacheKey, uses, 30 * 24 * 60 * 60 * 1000); // 30 giorni
      console.log('🚀 [REDIS_CACHE_SET] Cached oral_exam count:', uses);
    } catch (cacheError) {
      console.log('⚠️ Redis cache set error (non-critical):', cacheError);
    }
    
    // Salva anche nel cache temporaneo come fallback
    try {
      (global as any).tempUserCache = (global as any).tempUserCache || new Map();
      (global as any).tempUserCache.set(tempCacheKey, {
        value: uses,
        expires: Date.now() + (30 * 24 * 60 * 60 * 1000)
      });
    } catch (memoryError) {
      console.log('⚠️ Memory cache set error (non-critical):', memoryError);
    }
    
    return NextResponse.json({
      isFirstTime,
      cost: isFirstTime ? 0 : 25,
      oralExamCount: uses
    });

  } catch (error) {
    console.error('[CHECK_FIRST_TIME_ERROR] Unexpected error:', error);
    // In caso di errore, per sicurezza NON considerare più gratis
    return NextResponse.json({
      isFirstTime: false,
      cost: 25,
      oralExamCount: 0
    }, { status: 200 });
  }
}