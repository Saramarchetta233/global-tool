import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { CreditCosts } from '@/lib/credits/creditRules';
import { supabaseAdmin } from '@/lib/supabase';
import { cache } from '@/lib/redis-cache';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    // Estrai documentId dalla query string
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId parameter required' },
        { status: 400 }
      );
    }

    console.log('🔍 Counting tutor messages for document:', {
      userId: user.id,
      documentId: documentId.substring(0, 8) + '...'
    });
    
    // CONTROLLA CACHE Redis per risolvere problema isolation nuovi utenti
    const tempCacheKey = `tutor_messages_${user.id}_${documentId}`;
    const cachedCount = await cache.get(tempCacheKey);
    
    if (cachedCount !== null) {
      console.log('🚀 [REDIS_CACHE_HIT] Found cached tutor count:', cachedCount);
      const messageCount = cachedCount;
      const isWithinFreeLimit = messageCount < CreditCosts.tutorFreeMessages;
      const freeMessagesRemaining = isWithinFreeLimit 
        ? CreditCosts.tutorFreeMessages - messageCount 
        : 0;
      
      console.log('📊 Tutor count response for document (REDIS CACHED):', {
        documentId: documentId.substring(0, 8) + '...',
        messageCount,
        freeMessagesRemaining,
        isWithinFreeLimit,
        tutorFreeMessages: CreditCosts.tutorFreeMessages
      });
      
      return NextResponse.json({
        messageCount,
        freeMessagesRemaining,
        isWithinFreeLimit
      });
    }
    
    console.log('💾 [NEW_USER_CACHE] No valid cache found for tutor, reading from database...');
    
    console.log('🔍 [CRITICAL_FIX_TUTOR_COUNT] Using supabaseAdmin for count (same as saves)');

    if (!supabaseAdmin) {
      console.error('❌ supabaseAdmin not available for tutor count');
      return NextResponse.json({ 
        messageCount: 0,
        freeMessagesRemaining: CreditCosts.tutorFreeMessages, 
        isWithinFreeLimit: true 
      });
    }

    // Query IDENTICA a quella del route.ts per consistenza
    const { count, error: countError } = await supabaseAdmin
      .from('tutor_chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('document_id', documentId)
      .eq('role', 'user'); // Conta solo messaggi utente per evitare doppi conteggi

    console.log('[CHECK_FIRST_TIME_RESULT] Tutor count query:', { 
      userId: user.id, 
      count: count ?? 0, 
      error: countError 
    });

    console.log('📊 [CRITICAL_FIX_TUTOR_COUNT] Query result:', {
      error: countError?.message || 'none',
      messagesFound: count ?? 0
    });

    if (countError) {
      console.error('Error fetching tutor messages:', countError);
      return NextResponse.json({ 
        messageCount: 0,
        freeMessagesRemaining: CreditCosts.tutorFreeMessages, 
        isWithinFreeLimit: true 
      });
    }

    const messageCount = count ?? 0;
    const isWithinFreeLimit = messageCount < CreditCosts.tutorFreeMessages;
    const freeMessagesRemaining = isWithinFreeLimit 
      ? CreditCosts.tutorFreeMessages - messageCount 
      : 0;

    console.log('📊 Tutor count response for document:', {
      documentId: documentId.substring(0, 8) + '...',
      messageCount,
      freeMessagesRemaining,
      isWithinFreeLimit,
      tutorFreeMessages: CreditCosts.tutorFreeMessages
    });

    return NextResponse.json({
      messageCount,
      freeMessagesRemaining,
      isWithinFreeLimit
    });

  } catch (error) {
    console.error('Tutor count API error:', error);
    return NextResponse.json({ 
      messageCount: 0,
      freeMessagesRemaining: CreditCosts.tutorFreeMessages, 
      isWithinFreeLimit: true 
    });
  }
}