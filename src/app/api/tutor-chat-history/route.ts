import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase';

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

    // Debug: Prima controlliamo quanti messaggi ci sono in totale nella tabella
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

    // Recupera tutti i messaggi per questo utente e documento
    const { data: messages, error } = await supabaseAdmin
      .from('tutor_chat_messages')
      .select('id, role, content, created_at')
      .eq('user_id', user.id)
      .eq('document_id', documentId)
      .order('created_at', { ascending: true });

    console.log('🔍 Query result:', {
      error: error?.message || 'none',
      messagesFound: messages?.length || 0,
      sampleMessage: messages?.[0] || 'no messages'
    });

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

    return NextResponse.json({
      success: true,
      history: chatHistory,
      messageCount: chatHistory.length
    });

  } catch (error) {
    console.error('Chat history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}