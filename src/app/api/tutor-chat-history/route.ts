import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
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

    // PRIMA: Controlla cache per storico chat
    const historyCacheKey = `tutor_history_${user.id}_${documentId}`;
    const cachedHistory = (global as any).tempHistoryCache?.get(historyCacheKey);
    
    if (cachedHistory && cachedHistory.expires > Date.now()) {
      console.log('💾 [HISTORY_CACHE_HIT] Found cached chat history:', cachedHistory.messages.length, 'messages');
      
      // Trasforma i messaggi nel formato atteso dal frontend
      const chatHistory = cachedHistory.messages.map((msg: any) => ({
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
    
    console.log('💾 [HISTORY_CACHE_MISS] No valid history cache found, reading from database...');

    if (!supabaseAdmin) {
      return NextResponse.json({
        success: true,
        history: [],
        messageCount: 0
      });
    }
    
    // Debug: Prima vediamo quanti messaggi ci sono per questo utente
    console.log('🔍 [CRITICAL_HISTORY_DEBUG] Checking all messages for user before filtering:', {
      userId: user.id,
      documentId: documentId.substring(0, 8) + '...'
    });

    const { data: allUserMessages, error: debugError } = await supabaseAdmin
      .from('tutor_chat_messages')
      .select('id, user_id, document_id, role, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    console.log('🔍 [CRITICAL_HISTORY_DEBUG] All recent messages for this user:', {
      debugError: debugError?.message || 'none',
      totalUserMessages: allUserMessages?.length || 0,
      messagesByDocument: allUserMessages?.reduce((acc: any, msg: any) => {
        const docId = msg.document_id.substring(0, 8) + '...';
        acc[docId] = (acc[docId] || 0) + 1;
        return acc;
      }, {}) || {}
    });

    // Recupera tutti i messaggi per questo utente e documento
    console.log('🔍 [CRITICAL_HISTORY_DEBUG] Getting messages for specific document...');
    const { data: messages, error } = await supabaseAdmin
      .from('tutor_chat_messages')
      .select('id, role, content, created_at, user_id, document_id')
      .eq('user_id', user.id)
      .eq('document_id', documentId)
      .order('created_at', { ascending: true });

    console.log('🔍 [CRITICAL_HISTORY_DEBUG] Specific document query result:', {
      error: error?.message || 'none',
      messagesFound: messages?.length || 0,
      expectedDocumentId: documentId,
      actualDocumentIds: [...new Set(messages?.map(m => m.document_id) || [])],
      messageRoles: messages?.map(m => m.role) || []
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

    // Salva nel cache per future richieste
    if (messages && messages.length > 0) {
      console.log('💾 [HISTORY_CACHE_SET] Caching database messages for future requests...');
      try {
        (global as any).tempHistoryCache = (global as any).tempHistoryCache || new Map();
        (global as any).tempHistoryCache.set(historyCacheKey, {
          messages: messages,
          expires: Date.now() + (90 * 24 * 60 * 60 * 1000) // 90 giorni = 3 mesi
        });
        console.log('💾 [HISTORY_CACHE_SET] Cached', messages.length, 'messages from database');
      } catch (cacheError) {
        console.log('⚠️ History cache error (non-critical):', cacheError);
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