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
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId parameter required' },
        { status: 400 }
      );
    }

    // PRIMA: Controlla cache Redis per storico chat
    const historyCacheKey = `tutor_history_${user.id}_${documentId}`;
    try {
      const cachedHistory = await cache.get(historyCacheKey);
      if (cachedHistory) {
        console.log('🚀 [REDIS_HISTORY_CACHE_HIT] Found cached chat history:', JSON.parse(cachedHistory).length, 'messages');
        
        const messages = JSON.parse(cachedHistory);
        // Trasforma i messaggi nel formato atteso dal frontend
        const chatHistory = messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: msg.created_at
        }));
        
        return NextResponse.json({
          success: true,
          history: chatHistory,
          messageCount: chatHistory.length,
          fromCache: true
        });
      }
    } catch (cacheError) {
      console.log('⚠️ Redis history cache error (non-critical):', cacheError);
    }
    
    console.log('💾 [REDIS_HISTORY_CACHE_MISS] No valid history cache found, reading from database...');

    if (!supabaseAdmin) {
      return NextResponse.json({
        success: true,
        history: [],
        messageCount: 0
      });
    }
    
    // Recupera tutti i messaggi per questo utente e documento
    console.log('🔍 [HISTORY_QUERY] Getting messages for user and document:', {
      userId: user.id.substring(0, 8) + '...',
      documentId: documentId.substring(0, 8) + '...'
    });
    
    const { data: messages, error } = await supabaseAdmin
      .from('tutor_chat_messages')
      .select('id, role, content, created_at')
      .eq('user_id', user.id)
      .eq('document_id', documentId)
      .order('created_at', { ascending: true });

    console.log('🔍 [HISTORY_RESULT] Query result:', {
      error: error?.message || 'none',
      messagesFound: messages?.length || 0
    });

    if (error) {
      console.error('Error loading chat history:', error);
      return NextResponse.json(
        { error: 'Failed to load chat history' },
        { status: 500 }
      );
    }

    // Trasforma i messaggi nel formato atteso dal frontend
    const chatHistory = messages?.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: msg.created_at
    })) || [];

    // Salva nel cache Redis per future richieste
    if (messages && messages.length > 0) {
      console.log('🚀 [REDIS_HISTORY_CACHE_SET] Caching database messages for future requests...');
      try {
        await cache.set(historyCacheKey, JSON.stringify(messages), 90 * 24 * 60 * 60 * 1000); // 90 giorni
        console.log('🚀 [REDIS_HISTORY_CACHE_SET] Cached', messages.length, 'messages from database');
      } catch (cacheError) {
        console.log('⚠️ Redis history cache error (non-critical):', cacheError);
      }
    }

    return NextResponse.json({
      success: true,
      history: chatHistory,
      messageCount: chatHistory.length,
      fromDatabase: true
    });

  } catch (error) {
    console.error('Chat history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}