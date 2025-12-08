import { NextRequest, NextResponse } from 'next/server';

import { CreditCosts } from '@/lib/credits/creditRules';
import { verifyAuth } from '@/lib/middleware';
import { cache } from '@/lib/redis-cache';
import { supabaseAdmin } from '@/lib/supabase';

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

    // Debug aggiuntivo per confrontare con history
    console.log('🔍 [CRITICAL_COUNT_DEBUG] About to count messages with filters:', {
      userId: user.id,
      documentId: documentId.substring(0, 8) + '...',
      role: 'user'
    });

    // Prima verifica: count di TUTTI i messaggi (user + assistant) per questo documento
    const { count: totalCount, error: totalCountError } = await supabaseAdmin
      .from('tutor_chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('document_id', documentId);

    // Seconda verifica: count solo messaggi USER
    const { count, error: countError } = await supabaseAdmin
      .from('tutor_chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('document_id', documentId)
      .eq('role', 'user'); // Conta solo messaggi utente per evitare doppi conteggi

    console.log('🔍 [CRITICAL_COUNT_DEBUG] Count comparison results:', { 
      userId: user.id,
      documentId: documentId.substring(0, 8) + '...',
      totalMessages: totalCount ?? 0,
      userMessages: count ?? 0,
      expectedRatio: 'userMessages should be ~half of totalMessages',
      countError: countError?.message || 'none',
      totalCountError: totalCountError?.message || 'none'
    });

    console.log('📊 [CRITICAL_FIX_TUTOR_COUNT] Final count result:', {
      error: countError?.message || 'none',
      userMessagesFound: count ?? 0,
      totalMessagesFound: totalCount ?? 0
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

    // Salva nel cache Redis per future richieste
    try {
      await cache.set(tempCacheKey, messageCount, 30 * 24 * 60 * 60 * 1000); // 30 giorni
      console.log('🚀 [REDIS_CACHE_SET] Cached tutor count:', messageCount);
    } catch (cacheError) {
      console.log('⚠️ Redis cache set error (non-critical):', cacheError);
    }

    console.log('📊 Tutor count response for document (DB_READ):', {
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