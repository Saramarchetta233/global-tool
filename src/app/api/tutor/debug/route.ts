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
    
    // Estrai documentId dalla query string
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    
    console.log('🚨 [EMERGENCY_DEBUG] Checking tutor messages situation...');

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'No supabase admin' }, { status: 500 });
    }

    // 1. Check TUTTI i messaggi nel database
    const { data: allMessages, error: allError } = await supabaseAdmin
      .from('tutor_chat_messages')
      .select('*')
      .limit(100);

    // 2. Check messaggi per questo utente
    const { data: userMessages, error: userError } = await supabaseAdmin
      .from('tutor_chat_messages')
      .select('*')
      .eq('user_id', user.id);

    // 3. Check messaggi per questo documento se fornito
    let docMessages = null;
    let docError = null;
    if (documentId) {
      const result = await supabaseAdmin
        .from('tutor_chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .eq('document_id', documentId);
      docMessages = result.data;
      docError = result.error;
    }

    // 4. Check cache Redis
    const cacheKey = documentId ? `tutor_messages_${user.id}_${documentId}` : null;
    let cachedCount = null;
    if (cacheKey) {
      cachedCount = await cache.get(cacheKey);
    }

    // 5. Check cache memoria
    const historyCacheKey = documentId ? `tutor_history_${user.id}_${documentId}` : null;
    let cachedHistory = null;
    if (historyCacheKey) {
      const historyData = (global as any).tempHistoryCache?.get(historyCacheKey);
      if (historyData && historyData.expires > Date.now()) {
        cachedHistory = historyData.messages.length;
      }
    }

    const result = {
      user: {
        id: user.id,
        email: user.email
      },
      documentId: documentId,
      database: {
        totalMessages: allMessages?.length || 0,
        allMessagesError: allError?.message || 'none',
        userMessages: userMessages?.length || 0,
        userMessagesError: userError?.message || 'none',
        docMessages: docMessages?.length || 0,
        docMessagesError: docError?.message || 'none'
      },
      cache: {
        redisCount: cachedCount,
        memoryHistoryCount: cachedHistory,
        keys: {
          countKey: cacheKey,
          historyKey: historyCacheKey
        }
      },
      rawData: {
        userMessages: userMessages?.slice(0, 5) || [], // Prime 5 per debug
        docMessages: docMessages?.slice(0, 5) || [] // Prime 5 per debug
      }
    };

    console.log('🚨 [EMERGENCY_DEBUG] Debug result:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('🚨 [EMERGENCY_DEBUG] Error:', error);
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}