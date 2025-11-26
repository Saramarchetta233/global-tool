import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase';
import '@/lib/redis-cache'; // Inizializza il cache Redis

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

    console.log('🔍 Loading chat history for document:', {
      userId: user.id,
      documentId: documentId.substring(0, 8) + '...'
    });
    
    // CONTROLLA CACHE prima di fare query al database
    const historyCacheKey = `tutor_history_${user.id}_${documentId}`;
    const cachedHistory = (global as any).tempHistoryCache?.get(historyCacheKey);
    
    if (cachedHistory && cachedHistory.expires > Date.now()) {
      console.log('💾 [NEW_USER_CACHE] Found cached chat history:', cachedHistory.messages.length, 'messages');
      
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
    
    console.log('💾 [NEW_USER_CACHE] No valid history cache found, reading from database...');

    // Debug: Prima controlliamo quanti messaggi ci sono in totale nella tabella
    if (supabaseAdmin) {
      const { count: totalCount } = await supabaseAdmin
        .from('tutor_chat_messages')
        .select('id', { count: 'exact', head: true });
      
      console.log('🔍 Total messages in tutor_chat_messages table:', totalCount);

      // Debug: Controlliamo quanti messaggi ci sono per questo utente
      const { count: userCount } = await supabaseAdmin
        .from('tutor_chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      console.log('🔍 Messages for this user:', userCount);

      // Debug: CRITICAL - controlliamo messaggi utente per questo documento (stessa query del count)
      const { count: userDocCount } = await supabaseAdmin
        .from('tutor_chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('document_id', documentId)
        .eq('role', 'user');
      
      console.log('🔍 [CRITICAL_DEBUG_COUNT_COMPARISON] User messages for this document (user role only):', userDocCount);
    }

    // Debug: Verifica il tipo del user.id
    console.log('🔍 User ID type and value:', { 
      userId: user.id, 
      userIdType: typeof user.id,
      userIdLength: user.id.length 
    });

    // Debug: Controlla messaggi per questo documento senza filtro user_id
    if (supabaseAdmin) {
      const { data: allDocMessages } = await supabaseAdmin
        .from('tutor_chat_messages')
        .select('user_id, role, created_at')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      console.log('🔍 All messages for this document (any user):', allDocMessages);
    }

    // Recupera tutti i messaggi per questo utente e documento
    console.log('🔍 Querying tutor_chat_messages with filters:', {
      user_id: user.id,
      document_id: documentId
    });
    
    console.log('🔍 [CRITICAL_FIX_TUTOR_HISTORY] Using supabaseAdmin for history (same as saves)');
    
    if (!supabaseAdmin) {
      console.error('❌ supabaseAdmin not available for tutor history');
      return NextResponse.json({
        success: true,
        history: [],
        messageCount: 0
      });
    }
    
    // PRIMA: Prova la query di debug che sappiamo funzionare (solo per vedere se troviamo messaggi)
    console.log('🔍 [DEBUG] Testing the count query that works...');
    const { count: debugCount, error: debugCountError } = await supabaseAdmin
      .from('tutor_chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('document_id', documentId)
      .eq('role', 'user');
      
    console.log('🔍 [DEBUG] Count query result:', { debugCount, debugCountError: debugCountError?.message || 'none' });
    
    // SECOND: Prova a prendere i dati con la query che funziona per il count
    const { data: debugMessages, error: debugError } = await supabaseAdmin
      .from('tutor_chat_messages')
      .select('id, role, content, created_at, user_id, document_id')
      .eq('user_id', user.id)
      .eq('document_id', documentId)
      .eq('role', 'user')
      .order('created_at', { ascending: true });
      
    console.log('🔍 [DEBUG] User messages query result:', { 
      debugError: debugError?.message || 'none',
      debugMessagesFound: debugMessages?.length || 0,
      debugFirstMessage: debugMessages?.[0] || 'none'
    });
    
    // THIRD: Ora prova tutti i messaggi (user + assistant)  
    const { data: messages, error } = await supabaseAdmin
      .from('tutor_chat_messages')
      .select('id, role, content, created_at, user_id, document_id')
      .eq('user_id', user.id)
      .eq('document_id', documentId)
      .order('created_at', { ascending: true });

    console.log('📊 [CRITICAL_FIX_TUTOR_HISTORY] ALL messages query result:', {
      error: error?.message || 'none',
      messagesFound: messages?.length || 0,
      sampleMessage: messages?.[0] || 'no messages',
      allMessageIds: messages?.map(m => m.id) || [],
      roles: messages?.map(m => m.role) || []
    });
    
    // Se non trova messaggi, proviamo una query più generale per debug
    if (!messages || messages.length === 0) {
      console.log('🔍 No messages found, trying broader query...');
      if (supabaseAdmin) {
        const { data: allUserMessages } = await supabaseAdmin
          .from('tutor_chat_messages')
          .select('id, document_id, role, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        console.log('🔍 Recent messages for this user (any document):', allUserMessages);
      }
    }

    if (error) {
      console.error('❌ Error loading chat history:', error);
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

    console.log('✅ Chat history loaded:', {
      documentId: documentId.substring(0, 8) + '...',
      messageCount: chatHistory.length
    });
    
    // Se abbiamo trovato messaggi nel database, salvali nel cache per le prossime richieste
    if (messages && messages.length > 0) {
      console.log('💾 [NEW_USER_CACHE] Caching database messages for future requests...');
      try {
        (global as any).tempHistoryCache = (global as any).tempHistoryCache || new Map();
        (global as any).tempHistoryCache.set(historyCacheKey, {
          messages: messages,
          expires: Date.now() + (90 * 24 * 60 * 60 * 1000) // 90 giorni = 3 mesi
        });
        console.log('💾 [NEW_USER_CACHE] Cached', messages.length, 'messages from database');
      } catch (cacheError) {
        console.log('⚠️ Cache error (non-critical):', cacheError);
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