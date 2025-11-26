import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    console.log('🔍 check-cost: Checking probable questions cost for user:', user.id);
    
    // CONTROLLA CACHE temporanea per risolvere problema isolation nuovi utenti (stesso fix dell'esame orale)
    const tempCacheKey = `probable_questions_uses_${user.id}`;
    const cachedData = (global as any).tempUserCache?.get(tempCacheKey);
    
    if (cachedData && cachedData.expires > Date.now()) {
      console.log('💾 [NEW_USER_CACHE] Found cached probable_questions count:', cachedData.value);
      const uses = cachedData.value;
      const isFirstTime = uses === 0;
      const cost = isFirstTime ? 0 : 5;
      
      console.log('[CHECK_FIRST_TIME_RESULT] Probable questions result (CACHED):', { 
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
    
    console.log('💾 [NEW_USER_CACHE] No valid cache found for probable_questions, reading from database...');
    
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
    
    console.log('[CHECK_FIRST_TIME_RESULT] Probable questions result:', { 
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

  } catch (error) {
    console.error('Check cost probable questions error:', error);
    return NextResponse.json(
      { error: 'Failed to check probable questions cost' },
      { status: 500 }
    );
  }
}