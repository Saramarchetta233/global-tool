import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { cache } from '@/lib/redis-cache';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    console.log('🔍 check-cost: Checking probable questions cost for user:', user.id);
    
    // PRIMA: Controlla cache Redis persistente
    const redisCacheKey = `probable_questions_uses_${user.id}`;
    try {
      const cachedUses = await cache.get(redisCacheKey);
      if (cachedUses !== null && cachedUses !== undefined) {
        console.log('🚀 [REDIS_CACHE] Found cached probable_questions count:', cachedUses);
        const uses = parseInt(cachedUses) || 0;
        const isFirstTime = uses === 0;
        const cost = isFirstTime ? 0 : 5;
        
        console.log('[CHECK_FIRST_TIME_RESULT] Probable questions result (REDIS_CACHED):', { 
          userId: user.id, 
          probable_questions_uses: uses,
          isFirstTime,
          cost
        });
        
        return NextResponse.json({
          isFirstTime,
          cost,
          probableCount: uses
        });
      }
    } catch (redisError) {
      console.log('⚠️ Redis cache error (non-critical):', redisError);
    }
    
    // SECONDA: Controlla cache temporaneo in memoria
    const tempCacheKey = `probable_questions_uses_${user.id}`;
    const cachedData = (global as any).tempUserCache?.get(tempCacheKey);
    
    if (cachedData && cachedData.expires > Date.now()) {
      console.log('💾 [MEMORY_CACHE] Found cached probable_questions count:', cachedData.value);
      const uses = cachedData.value;
      const isFirstTime = uses === 0;
      const cost = isFirstTime ? 0 : 5;
      
      console.log('[CHECK_FIRST_TIME_RESULT] Probable questions result (MEMORY_CACHED):', { 
        userId: user.id, 
        probable_questions_uses: uses,
        isFirstTime,
        cost
      });
      
      return NextResponse.json({
        isFirstTime,
        cost,
        probableCount: uses
      });
    }
    
    console.log('💾 [CACHE_MISS] No valid cache found, reading from database...');
    
    // USA SOLO IL PROFILO (come per l'esame orale)
    console.log('📊 [PROBABLE_PROFILE_READ] Reading probable_questions_uses from profile...', {
      userId: user.id,
      userIdType: typeof user.id
    });
    
    // Usa SOLO supabaseAdmin per evitare problemi RLS
    if (!supabaseAdmin) {
      console.error('[PROBABLE_ERROR] supabaseAdmin not available');
      return NextResponse.json({
        error: true,
        message: 'Service unavailable',
        isFirstTime: null,
        cost: null,
        probableCount: null
      }, { status: 500 });
    }
    
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, probable_questions_uses, credits, created_at, updated_at')
      .eq('user_id', user.id)
      .single();

    console.log('📊 [PROBABLE_PROFILE_READ] Profile read result:', {
      userId: user.id,
      profile,
      profileError: profileError?.message || 'none',
      errorCode: profileError?.code
    });

    if (profileError) {
      console.error('[PROBABLE_ERROR] Error reading profile:', {
        userId: user.id,
        error: profileError
      });
      return NextResponse.json({
        error: true,
        message: 'Failed to check probable questions status',
        isFirstTime: null,
        cost: null,
        probableCount: null
      }, { status: 500 });
    }

    const uses = profile?.probable_questions_uses ?? 0;
    const isFirstTime = uses === 0;
    const cost = isFirstTime ? 0 : 5;
    
    console.log('[CHECK_FIRST_TIME_RESULT] Probable questions result (DB_READ):', { 
      userId: user.id, 
      probable_questions_uses: uses,
      isFirstTime,
      cost
    });
    
    // Salva nel cache Redis per 30 giorni
    try {
      await cache.set(redisCacheKey, uses, 30 * 24 * 60 * 60 * 1000); // 30 giorni
      console.log('🚀 [REDIS_CACHE_SET] Cached probable_questions count:', uses);
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
      cost,
      probableCount: uses
    });

  } catch (error) {
    console.error('Check cost probable questions error:', error);
    return NextResponse.json(
      { error: 'Failed to check probable questions cost' },
      { status: 500 }
    );
  }
}